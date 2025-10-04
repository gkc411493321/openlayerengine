/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 自定义要素变换交互（平移 / 旋转 / 缩放 / 拉伸 / 保持矩形 / 点样式缩放 / wrapX 归位）。
 *
 * 设计要点：
 * 1. 使用一个单独的 VectorLayer 叠加层绘制控制手柄（handles_）与外包框 (bbox_)；真实要素不被直接替换。
 * 2. 支持视图旋转情形（enableRotatedTransform=true 时）：通过“临时将几何反旋转到视图 0° -> 计算变换 -> 再旋转回视图角度”避免几何在旋转视图下出现非直角缩放畸变。
 * 3. 点要素的缩放：不直接修改点坐标，而是根据其 style.image（或 shape / size）的半径、尺寸或 scale 来调整视觉大小，保证语义与位置不变。
 * 4. 保持矩形 keepRectangle：对单个矩形 Polygon（顶点数=5，首尾重复）应用特殊的角点 / 边点投影算法，保证拖拽任意角后仍为严格矩形；同时支持“只拉伸一侧”(stretch) 与 “整体按比例缩放” 并存。
 * 5. 拉伸/缩放与防翻转：可配置 noFlip 避免经过 0 的时候翻转；keepAspectRatio（默认按住 Shift）统一使用最小缩放系数；modifyCenter（默认按住 Ctrl/Meta）以对角点为中心缩放。
 * 6. wrapX：在 WebMercator 等全球投影中，平移可能跨越子拷贝边界，抬起时根据视图中心重新贴近当前 copy，避免要素“跑到很远的复制带”。
 * 7. 事件：<mode>start / <mode>ing / <mode>end （rotate / scale / translate） 以及 select / selectend / enterHandle / leaveHandle；事件中提供像素、坐标、缩放系数、角度、delta 等信息。
 * 8. 交互优先级：如果点模式下允许 translateFeature 或 translate，则在点上直接进入平移模式；否则命中手柄决定模式。
 *
 * 使用场景：地图上对矢量要素进行交互式编辑（类似图形编辑器），同时兼容点标注图标的旋转、缩放（视觉尺寸）。
 *
 * 注意：
 * - 代码在多个地方使用 “(this.get('xxx') as fn)” 的方式访问运行时传入的回调配置。
 * - 选中集合 selection_ 是一个 Collection；调用 select / setSelection 管理。
 * - 所有对要素几何的直接写操作都在交互内部封装；外部监听 scaling/translating/rotating 及其 end 事件做持久化。
 */
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import VectorSource from 'ol/source/Vector';
import Fill from 'ol/style/Fill';
import VectorLayer from 'ol/layer/Vector';
import PointGeom from 'ol/geom/Point';
import Feature from 'ol/Feature';
import Collection from 'ol/Collection';
import PointerInteraction from 'ol/interaction/Pointer';
import RegularShape from 'ol/style/RegularShape';
import Icon from 'ol/style/Icon';
import { fromExtent as polygonFromExtent } from 'ol/geom/Polygon';
import {
  boundingExtent as extentBoundingExtent,
  buffer as extentBuffer,
  createEmpty as extentCreateEmpty,
  extend as extentExtend,
  getCenter as extentGetCenter,
  Extent
} from 'ol/extent';
import { unByKey } from 'ol/Observable';
import PolygonGeom from 'ol/geom/Polygon';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import BaseEvent from 'ol/events/Event';
import Geometry from 'ol/geom/Geometry';
import { Coordinate } from 'ol/coordinate';
import Map from 'ol/Map';
// 视图对象无需单独类型导入（直接通过 map.getView 访问）
import { EventsKey } from 'ol/events';
import { ol_ext_element } from './element';
import { useEarth } from '../../useEarth';
// import { fromLonLat } from 'ol/proj'; // 未使用，移除避免 lint 警告
// 静态资源（rollup url 插件处理）
// 使用公共目录下的静态资源路径（开发时由 Vite public/ 提供，构建时复制到 dist/image）

// ---- 类型定义区域 ----
/**
 * Transform 交互配置选项。
 * 大部分布尔开关默认为 true（即启用），通过传入 false 关闭。
 */
interface TransformOptions {
  /** 是否过滤可选要素：返回 true 表示允许被选中/命中 */
  filter?: (f: Feature<any>, layer: any) => boolean;
  /** 触发交互的全局条件（鼠标事件过滤），返回 false 则忽略本次事件 */
  condition?: (e: MapBrowserEvent<any>, features: Collection<Feature<any>>) => boolean;
  /** 多选累加条件（例如按下某个组合键），返回 true 表示使用累加模式 */
  addCondition?: (e: MapBrowserEvent<any>) => boolean;
  /** 保持宽高比条件（默认 Shift）：返回 true 则缩放采用等比 */
  keepAspectRatio?: (e: MapBrowserEvent<any>) => boolean;
  /** 修改中心条件（默认 Ctrl/Meta）：返回 true 则以对角点为中心缩放 */
  modifyCenter?: (e: MapBrowserEvent<any>) => boolean;
  /** 限定可交互的图层集合（可为单个或数组） */
  layers?: any[] | any; // 可传入单个或数组（保持宽松兼容多种图层类型）
  /** 指定可交互要素集合（优先于 layers 过滤） */
  features?: any; // 期望为 OL Collection
  /** 外部 select 交互实例，用于同步选中状态 */
  select?: any; // 外部选择交互实例
  /** 像素命中容差 */
  hitTolerance?: number;
  /** 是否允许直接平移选中要素本体（点或要素） */
  translateFeature?: boolean;
  /** 是否显示/允许中心平移手柄 */
  translate?: boolean;
  /** 是否允许拖拽 bbox（非要素本体）进行平移 */
  translateBBox?: boolean;
  /** 是否允许边方向拉伸（stretch hand） */
  stretch?: boolean;
  /** 是否允许角点缩放 */
  scale?: boolean;
  /** 是否允许旋转 */
  rotate?: boolean;
  /** 缩放时禁止翻转（scale 过 0 取绝对值） */
  noFlip?: boolean;
  /** 是否允许选择；false 时只在已有 selection 上操作 */
  selection?: boolean;
  /** 视图旋转下启用“解旋/复旋”精准变换 */
  enableRotatedTransform?: boolean;
  /** 单要素矩形保持严格矩形（使用向量投影算法） */
  keepRectangle?: boolean;
  /** bbox 额外缓冲距离（地图单位） */
  buffer?: number;
  /** 自定义手柄样式映射 */
  style?: Record<string, Style | Style[]>; // 自定义手柄样式映射
  /** 点要素的自定义半径（或返回 [rx, ry] 的函数）用于扩大操作手柄范围 */
  pointRadius?: number | number[] | ((f: Feature<any>) => number | number[]);
}

interface HandleHitResult {
  feature?: Feature<any>;
  handle?: string;
  constraint?: string;
  option?: number | string;
}

interface InternalFeatureWithHandle extends Feature<any> {
  get: (key: string) => any;
}

/**
 * 交互事件携带的数据对象（简化定义）。
 * type 取值示例：select / selectend / rotating / rotateend / scaling / scaleend / translating / translateend 等。
 */
interface TransformEvent extends BaseEvent {
  feature?: Feature<any>;
  features?: Collection<Feature<any>>;
  angle?: number;
  delta?: number[];
  scale?: number[];
  coordinate?: Coordinate;
  pixel?: number[];
  oldgeom?: Geometry;
  oldgeoms?: Geometry[];
  transformed?: boolean;
  cursor?: string;
  bboxExtent?: Coordinate[]; // 新增 bboxExtent 字段
}

function isPointGeometry(g: Geometry): boolean {
  return g.getType() === 'Point';
}

/**
 * TransformInteraction 核心类。
 * 内部通过 PointerInteraction 的自定义回调覆盖 handleDown/Drag/Move/Up。
 */
class TransformInteraction extends PointerInteraction {
  // 静态资源（通过 rollup url 插件处理）
  // 注意：相对路径以本文件为基准；构建后被复制/内联
  // 使用 import 声明让 TS 识别为 string (需在 global.d.ts 添加声明)
  importRotateIcon?: string;

  private selection_: Collection<Feature<any>>;
  private handles_: Collection<Feature<any>>;
  private overlayLayer_: VectorLayer<VectorSource>;
  private features_?: Collection<Feature<any>>;
  private layers_: any[] | null;
  private _filter?: (f: Feature<any>, layer: any) => boolean;
  private _handleEvent: (e: MapBrowserEvent<any>, features: Collection<Feature<any>>) => boolean;
  private addFn_: (e: MapBrowserEvent<any>) => boolean;
  private isTouch = false;
  private style: Record<string, Style[]> = {};
  private ispt_ = false;
  private iscircle_ = false;
  private mode_: string | null = null;
  private opt_: number | string | undefined;
  private constraint_: string | undefined;
  private coordinate_: Coordinate = [0, 0];
  private pixel_: Coordinate = [0, 0];
  private geoms_: Geometry[] = [];
  private rotatedGeoms_: Geometry[] = [];
  private extent_: Coordinate[] = [];
  private rotatedExtent_: Coordinate[] = [];
  private hasChanged_ = false;
  private center_: Coordinate = [0, 0];
  private isUpdating_ = false;
  private angle_ = 0;
  // bbox 是否处于激活变换中（旋转 / 平移 / 缩放时显示虚线）
  private _bboxActive: boolean = false;
  // 闪烁相关
  private _bboxBlinkTimer: any = null;
  private _bboxBlinkVisible: boolean = true;
  private previousCursor_: string | undefined;
  private _prevCursorStyle: string | undefined;
  private _featureListeners: EventsKey[] = [];
  private _moveendListener: ((...args: any[]) => void) | null = null;
  // 点要素缩放/旋转的初始状态临时缓存
  // 单值 scale 已由双轴 _ptImageBaseScalePair 替代
  // private _ptImageBaseScale?: number; (移除)
  private _ptImageBaseScalePair?: number[]; // Icon 初始双轴 scale
  private _ptImageBaseLen?: number;
  private _ptImageBaseSize?: number[];
  private _ptStyleBaseSize?: number[];
  private _ptStyleBaseLen?: number;
  private _ptDownCoordNorm?: Coordinate;
  private _ptBaseLen?: number;
  private _ptCircleBaseRadius?: number;
  private _ptCircleBaseLen?: number;
  private _ptBaseRotation?: number;
  // 动态计算点半径的函数（供命中测试使用）
  private _pointRadius: (f: Feature<any>) => number | number[] = () => 0;
  // 旋转开始时记录点图标未旋转 bbox 尺寸（地图单位宽高），旋转过程中保持固定
  private _ptRotateBBoxSize?: [number, number];
  public bbox_: Feature<any> | null = null;
  // 光标样式映射（可按需覆写）
  public Cursors: Record<string, string> = {
    default: 'auto',
    select: 'pointer',
    translate: 'move',
    rotate: 'grab',
    rotate0: 'grab',
    scale: 'nesw-resize',
    scale1: 'nwse-resize',
    scale2: 'nesw-resize',
    scale3: 'nwse-resize',
    scalev: 'ew-resize',
    scaleh1: 'ns-resize',
    scalev2: 'ew-resize',
    scaleh3: 'ns-resize',
    mouseDown: 'grabbing'
  };

  /**
   * 构造函数
   * @param options 交互配置
   */
  constructor(options: TransformOptions = {}) {
    const selfRef: any = {};
    super({
      handleDownEvent: (e: MapBrowserEvent<any>): boolean => {
        return !!(selfRef.instance as TransformInteraction).handleDownEvent_(e);
      },
      handleDragEvent: (e: MapBrowserEvent<any>): void => {
        (selfRef.instance as TransformInteraction).handleDragEvent_(e);
      },
      handleMoveEvent: (e: MapBrowserEvent<any>): void => {
        (selfRef.instance as TransformInteraction).handleMoveEvent_(e);
      },
      handleUpEvent: (e: MapBrowserEvent<any>): boolean => {
        return (selfRef.instance as TransformInteraction).handleUpEvent_(e);
      }
    });
    selfRef.instance = this;

    // 初始化选中与手柄集合
    this.selection_ = new Collection();
    this.handles_ = new Collection();

    // 构建手柄叠加层（不做空间索引）
    this.overlayLayer_ = new VectorLayer({
      source: new VectorSource({
        features: this.handles_,
        useSpatialIndex: false,
        wrapX: false
      }),
      properties: { name: 'Transform overlay', displayInLayerSwitcher: false },
      style: (feature: any): Style[] | Style | undefined => {
        try {
          // 动态：当正在交互（_bboxActive=true）时，对 bbox 使用虚线样式 + 闪烁（可见/隐藏切换 stroke）
          if (feature === this.bbox_ && this._bboxActive) {
            if (this._bboxBlinkVisible) {
              return this.style['bboxActiveOn'] || this.style['bboxActive'] || this.style['defaultActive'] || this.style.default;
            }
            return this.style['bboxActiveOff'] || this.style['bboxActive'] || this.style['defaultActive'] || this.style.default;
          }
          const key = (feature.get?.('handle') || 'default') + (feature.get?.('constraint') || '') + (feature.get?.('option') || '');
          return this.style[key];
        } catch {
          return this.style.default;
        }
      },
      updateWhileAnimating: true,
      updateWhileInteracting: true
    });

    // 处理配置项：要素集合 / 图层 / 过滤函数
    this.features_ = options.features;
    if (typeof options.filter === 'function') this._filter = options.filter;
    this.layers_ = options.layers ? (Array.isArray(options.layers) ? options.layers : [options.layers]) : null;

    this._handleEvent = options.condition || (() => true);
    this.addFn_ = options.addCondition || (() => false);
    this.setPointRadius(options.pointRadius);

    // 初始化行为开关属性
    this.set('translateFeature', options.translateFeature !== false);
    this.set('translate', options.translate !== false);
    this.set('translateBBox', options.translateBBox === true);
    this.set('stretch', options.stretch !== false);
    this.set('scale', options.scale !== false);
    this.set('rotate', options.rotate !== false);
    this.set('keepAspectRatio', options.keepAspectRatio || ((e: MapBrowserEvent<any>) => !!e.originalEvent && (e.originalEvent as any).shiftKey));
    this.set(
      'modifyCenter',
      options.modifyCenter || ((e: MapBrowserEvent<any>) => !!e.originalEvent && ((e.originalEvent as any).metaKey || (e.originalEvent as any).ctrlKey))
    );
    this.set('noFlip', options.noFlip || false);
    this.set('selection', options.selection !== false);
    this.set('hitTolerance', options.hitTolerance || 0);
    this.set('enableRotatedTransform', options.enableRotatedTransform || false);
    this.set('keepRectangle', options.keepRectangle || false);
    this.set('buffer', options.buffer || 0);
    this.set('strictPointBBox', true);

    // 属性变化触发重绘
    this.on('propertychange', () => this.drawSketch_());

    // 初始化默认样式
    this.setDefaultStyle();

    // 若有外部 select 交互则同步
    if (options.select) {
      this.on('change:active', () => {
        if (this.getActive()) {
          this.setSelection(options.select.getFeatures().getArray());
        } else {
          options.select.getFeatures().extend(this.selection_);
          this.selection_.forEach((f) => options.select.getFeatures().push(f));
          this.select(undefined);
        }
      });
    } else {
      this.on('change:active', () => this.select(undefined));
    }
  }

  // ---- 公共 API 封装（语义保持原实现） ----
  /**
   * 重写 setMap：挂接 / 卸载 overlayLayer 与移动结束重绘监听。
   */
  override setMap(map: Map | null): void {
    const old = this.getMap();
    if (old) {
      old.removeLayer(this.overlayLayer_);
      if (this.previousCursor_) ol_ext_element.setCursor(old, this.previousCursor_);
      this.previousCursor_ = undefined;
      if (this._moveendListener) {
        old.un('moveend', this._moveendListener as any);
        this._moveendListener = null;
      }
    }
    super.setMap(map as any);
    this.overlayLayer_.setMap(map as any);
    if (!map) {
      this.select(undefined);
      return;
    }
    this.isTouch = /touch/.test(map.getViewport().className);
    this.setDefaultStyle();
    this._moveendListener = () => this.drawSketch_();
    map.on('moveend', this._moveendListener as any);
  }

  /**
   * 激活 / 隐藏交互及其手柄层。
   */
  override setActive(active: boolean): void {
    if (this.overlayLayer_) this.overlayLayer_.setVisible(active);
    super.setActive(active);
    if (!active) {
      this._bboxActive = false;
      this._stopBBoxBlink();
      this.drawSketch_();
    }
  }

  /**
   * 设置默认手柄样式（可被 setStyle 覆盖）。
   * 依据设备是否触摸（isTouch）调整图标 scale。
   */
  setDefaultStyle(
    options: {
      stroke?: Stroke;
      fill?: Fill;
      pointStroke?: Stroke;
      pointFill?: Fill;
    } = {}
  ): void {
    // 顶层 import 更合适，这里改为延迟引用已导入的常量（见文件顶部新增 import）
    const stroke = options.pointStroke || new Stroke({ color: [80, 80, 80], width: 1 });
    const strokedash = options.stroke || new Stroke({ color: [80, 80, 80], width: 1 });
    const fill0 = options.fill || new Fill({ color: [204, 204, 204, 0.3] });
    const fill = options.pointFill || new Fill({ color: [255, 255, 255, 0.8] });
    // 虚线样式（活动中）
    const dashStroke = new Stroke({ color: [80, 80, 80], width: 1, lineDash: [6, 4] });
    const dashStrokeOff = new Stroke({ color: [80, 80, 80, 0.2], width: 1, lineDash: [6, 4] }); // 闪烁隐藏态降低透明度

    const rotate = new Icon({ src: '/image/rotate.svg', color: [80, 80, 80, 1], displacement: [0, 30], scale: this.isTouch ? 1.8 : 1 });
    const stretchH = new Icon({ src: '/image/stretchH.png', color: [80, 80, 80, 1], scale: this.isTouch ? 1.8 : 1 });
    const stretchV = new Icon({ src: '/image/stretchV.png', color: [80, 80, 80, 1], scale: this.isTouch ? 1.8 : 1 });
    const scaleI = new Icon({ src: '/image/scale.png', color: [80, 80, 80, 1], scale: this.isTouch ? 1.8 : 1 });
    const translate = new Icon({ src: '/image/translate.png', color: [80, 80, 80, 1], scale: this.isTouch ? 1.8 : 1 });
    const center = new Icon({ src: '/image/center.png', color: [80, 80, 80, 1], scale: this.isTouch ? 1.8 : 1 });
    const bigpt = new RegularShape({ stroke: new Stroke({ color: '#f38200ff', width: 1 }), radius: this.isTouch ? 12 : 6, points: 14, angle: Math.PI / 4 });

    const createStyle = (img: any, s: Stroke, f: Fill) => [new Style({ image: img, stroke: s, fill: f })];

    this.style = {
      default: createStyle(bigpt, strokedash, fill0),
      // 闪烁双态：On / Off
      bboxActive: [new Style({ stroke: dashStroke, fill: fill0 })], // 兼容旧 key
      bboxActiveOn: [new Style({ stroke: dashStroke, fill: fill0 })],
      bboxActiveOff: [new Style({ stroke: dashStrokeOff, fill: fill0 })],
      translate: createStyle(translate, stroke, fill),
      rotate: createStyle(rotate, stroke, fill),
      rotate0: createStyle(center, stroke, fill),
      scale: createStyle(scaleI, stroke, fill),
      scale1: createStyle(scaleI, stroke, fill),
      scale2: createStyle(scaleI, stroke, fill),
      scale3: createStyle(scaleI, stroke, fill),
      scalev: createStyle(stretchH, stroke, fill),
      scaleh1: createStyle(stretchV, stroke, fill),
      scalev2: createStyle(stretchH, stroke, fill),
      scaleh3: createStyle(stretchV, stroke, fill)
    } as Record<string, Style[]>;
    this.drawSketch_();
  }

  /** 启动 bbox 闪烁 */
  private _startBBoxBlink(): void {
    if (this._bboxBlinkTimer) return;
    this._bboxBlinkVisible = true;
    this._bboxBlinkTimer = setInterval(() => {
      this._bboxBlinkVisible = !this._bboxBlinkVisible;
      if (this.bbox_) this.bbox_.changed?.();
    }, 420); // 约 ~2.4Hz
  }

  /** 停止 bbox 闪烁并恢复可见 */
  private _stopBBoxBlink(): void {
    if (this._bboxBlinkTimer) {
      clearInterval(this._bboxBlinkTimer);
      this._bboxBlinkTimer = null;
    }
    this._bboxBlinkVisible = true;
    if (this.bbox_) this.bbox_.changed?.();
  }

  /**
   * 动态设置某个手柄名称的样式（支持数组）。
   * 若名称为 rotate 则微调锚点以匹配交互体验。
   */
  setStyle(name: string, style: Style | Style[]): void {
    if (!style) return;
    this.style[name] = Array.isArray(style) ? style : [style];
    // adapt rotate anchor for touch / etc.
    for (const st of this.style[name]) {
      const im: any = st.getImage();
      if (im) {
        if (name === 'rotate' && im.getAnchor && im.getAnchor()[0] !== -5) {
          try {
            im.getAnchor()[0] = -5; // adjust anchor similar to original
          } catch {
            /* ignore */
          }
        }
        if (this.isTouch && im.setScale) im.setScale(1.8);
      }
      const tx = st.getText?.();
      if (tx) {
        if (name === 'rotate') tx.setOffsetX(this.isTouch ? 14 : 7);
        if (this.isTouch && (tx as any).setScale) (tx as any).setScale(1.8);
      }
    }
    this.drawSketch_();
  }

  /**
   * 命中测试：优先判断手柄与 bbox；再判断 selection / layers / features 限制；
   * 若无命中且是点要素场景，再尝试基于视觉半径扩大采集（解决小图标难点中问题）。
   */
  private getFeatureAtPixel_(pixel: number[]): HandleHitResult {
    const map = this.getMap();
    if (!map) return {};
    const view = map.getView();
    const proj: any = view.getProjection();
    const extentWidth: number = proj?.getExtent ? proj.getExtent()[2] - proj.getExtent()[0] : 40075016.68557849; // EPSG:3857 width
    const viewCenter = view.getCenter();
    const centerX = viewCenter ? viewCenter[0] : 0;
    const wrapX = (x: number): number => {
      if (!extentWidth) return x;
      if (Math.abs(x - centerX) > extentWidth / 2) return x + Math.round((centerX - x) / extentWidth) * extentWidth;
      return x;
    };
    const hit: any =
      map.forEachFeatureAtPixel(
        pixel,
        (feature: any, layer: any) => {
          let found = false;
          // Overlay handles / bbox
          if (!layer) {
            if (feature === this.bbox_) {
              if (this.ispt_) {
                if (this.get('translate')) {
                  return { feature: (this.selection_.item(0) as Feature<any>) || feature, handle: 'translate', constraint: '', option: '' };
                }
                return { feature: (this.selection_.item(0) as Feature<any>) || feature };
              }
              if (this.get('translateBBox')) return { feature, handle: 'translate', constraint: '', option: '' };
              return null;
            }
            this.handles_.forEach((f) => {
              if (f === feature) found = true;
            });
            if (found)
              return {
                feature,
                handle: (feature as InternalFeatureWithHandle).get('handle'),
                constraint: (feature as InternalFeatureWithHandle).get('constraint'),
                option: (feature as InternalFeatureWithHandle).get('option')
              };
          }
          // selection disabled
          if (!this.get('selection')) {
            if (this.selection_.getArray().some((f) => f === feature)) return { feature };
            return null;
          }
          // filter
          if (this._filter) return this._filter(feature, layer) ? { feature } : null;
          // layer list
          if (this.layers_) {
            for (const l of this.layers_) if (l === layer) return { feature };
            return null;
          }
          // features collection
          if (this.features_) {
            this.features_.forEach((f) => {
              if (f === feature) found = true;
            });
            return found ? { feature } : null;
          }
          return { feature };
        },
        { hitTolerance: this.get('hitTolerance') }
      ) || {};

    const isStrict = !!this.get('strictPointBBox');
    let result: HandleHitResult = hit as HandleHitResult;
    if (!result.feature) {
      // fallback 点要素拾取逻辑
      let candidates: Feature<any>[] = [];
      if (this.features_) candidates = this.features_.getArray();
      else if (this.layers_) {
        this.layers_.forEach((l: any) => {
          const src = l?.getSource?.();
          if (src?.getFeatures) candidates = candidates.concat(src.getFeatures());
        });
      } else {
        map.getLayers().forEach((l: any) => {
          const src = l?.getSource?.();
          if (src?.getFeatures) candidates = candidates.concat(src.getFeatures());
        });
      }
      const [px, py] = pixel;
      let best: Feature<any> | undefined;
      let bestDist = Infinity;
      for (const f of candidates) {
        const g = f.getGeometry?.();
        if (!g || g.getType() !== 'Point') continue;
        if (this._pointHasIconImage_(f) && isStrict) {
          // 严格矩形判定
          // 尝试使用 wrap 后的坐标求像素
          const raw = (g as PointGeom).getCoordinates();
          const wrapped = [wrapX(raw[0]), raw[1]] as Coordinate;
          const wrappedPixel = map.getPixelFromCoordinate(wrapped);
          if (!this._isPixelInsidePointBBox_(f, pixel, wrapped)) continue;
          if (!wrappedPixel) continue;
          const dx = wrappedPixel[0] - px;
          const dy = wrappedPixel[1] - py;
          const d = dx * dx + dy * dy;
          if (d < bestDist) {
            best = f;
            bestDist = d;
          }
        } else {
          // 旧行为：圆形半径距离
          const p0 = (g as PointGeom).getCoordinates();
          const p = [wrapX(p0[0]), p0[1]] as Coordinate;
          const fpixel = map.getPixelFromCoordinate(p);
          if (!fpixel) continue;
          const visualR = this._getPointVisualRadiusPixel_(f) || 0;
          const dx = fpixel[0] - px;
          const dy = fpixel[1] - py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= visualR + 2 && dist < bestDist) {
            best = f;
            bestDist = dist;
          }
        }
      }
      if (best) result = { feature: best };
    }
    if (result.feature && isStrict) {
      const f = result.feature as Feature<any>;
      if (f.getGeometry?.()?.getType() === 'Point') {
        const isHandle = (f as any).get && (f as any).get('handle');
        if (!isHandle && this._pointHasIconImage_(f)) {
          if (!this._isPixelInsidePointBBox_(f, pixel)) result = {};
        }
      }
    }
    return result;
  }

  /**
   * 当 enableRotatedTransform=true 且视图旋转时，返回“已反旋转到0°”的几何（可选 clone）。
   * 用于在标准坐标系中计算缩放/拉伸，避免旋转视图下几何畸变。
   */
  private getGeometryRotateToZero_(f: Feature<any>, clone = false): Geometry {
    const orig = f.getGeometry();
    if (!orig) return orig as any;
    const rot = this.getMap()?.getView().getRotation() || 0;
    if (rot === 0 || !this.get('enableRotatedTransform')) return clone ? orig.clone() : orig;
    const g = orig.clone();
    const map = this.getMap();
    const ctr = map && map.getView() ? map.getView().getCenter() : undefined;
    if (ctr) g.rotate(rot * -1, ctr);
    return g;
  }

  /** 返回点图标当前视觉尺寸（像素），考虑双轴 scale。*/
  private _pointGetVisualSizePixel_(feature: Feature<any>): [number, number] | undefined {
    try {
      if (!feature?.getGeometry || feature.getGeometry().getType() !== 'Point') return undefined;
      const style: any = feature.getStyle?.();
      if (!style?.getImage) return undefined;
      const img = style.getImage();
      if (!img) return undefined;
      let w: number | undefined;
      let h: number | undefined;
      if (img.getImageSize) {
        const sz = img.getImageSize();
        if (sz && sz.length === 2) {
          w = sz[0];
          h = sz[1];
        }
      }
      if ((w == null || h == null) && img.getSize) {
        const sz2 = img.getSize();
        if (sz2 && sz2.length === 2) {
          w = sz2[0];
          h = sz2[1];
        }
      }
      if ((w == null || h == null) && img.getWidth && img.getHeight) {
        const ww = img.getWidth?.();
        const hh = img.getHeight?.();
        if (ww && hh) {
          w = ww;
          h = hh;
        }
      }
      if (w == null && img.getRadius) {
        const r = img.getRadius();
        if (r) {
          w = r * 2;
          h = r * 2;
        }
      }
      if (w == null || h == null) return undefined;
      let sx = 1,
        sy = 1;
      if (img.getScale) {
        const sc: any = img.getScale();
        if (Array.isArray(sc)) {
          // 翻转（scale 可能为负）时使用绝对值，保证命中检测 bbox 正常
          sx = Math.abs(sc[0] || 1);
          sy = Math.abs(sc[1] || 1);
        } else if (typeof sc === 'number') {
          sx = Math.abs(sc);
          sy = Math.abs(sc);
        }
      }
      return [w * sx, h * sy];
    } catch {
      return undefined;
    }
  }

  /** 判断像素是否在点图标视觉 bbox 内 */
  private _isPixelInsidePointBBox_(feature: Feature<any>, pixel: number[], overrideCenter?: Coordinate): boolean {
    const map = this.getMap();
    if (!map) return false;
    const geom = feature.getGeometry?.();
    if (!geom || geom.getType() !== 'Point') return false;
    const size = this._pointGetVisualSizePixel_(feature);
    if (!size) return false;
    const view = map.getView();
    const proj: any = view.getProjection();
    const extentWidth: number = proj?.getExtent ? proj.getExtent()[2] - proj.getExtent()[0] : 40075016.68557849;
    const viewCenter = view.getCenter();
    const centerX = viewCenter ? viewCenter[0] : 0;
    const wrapX = (x: number): number => {
      if (Math.abs(x - centerX) > extentWidth / 2) return x + Math.round((centerX - x) / extentWidth) * extentWidth;
      return x;
    };
    const base = overrideCenter || (geom as PointGeom).getCoordinates();
    const candidates: Coordinate[] = [base];
    // 添加包裹后坐标（避免远距离 copy 失配）
    candidates.push([wrapX(base[0]), base[1]]);
    for (const c of candidates) {
      const px = map.getPixelFromCoordinate(c);
      if (!px) continue;
      const hw = size[0] / 2;
      const hh = size[1] / 2;
      if (pixel[0] >= px[0] - hw && pixel[0] <= px[0] + hw && pixel[1] >= px[1] - hh && pixel[1] <= px[1] + hh) return true;
    }
    return false;
  }

  /**
   * 判断几何是否为保持矩形逻辑适用的 Polygon（顶点数=5）。
   */
  private _isRectangle(geom: Geometry): boolean {
    if (this.get('keepRectangle') && geom.getType() === 'Polygon') {
      const coords = (geom as PolygonGeom).getCoordinates()[0];
      return coords.length === 5;
    }
    return false;
  }

  /**
   * 绘制/刷新当前选中要素的控制手柄与外包框。
   * centerOnly=true 时只更新中心与 bbox 不生成所有手柄（用于旋转实时刷新性能优化）。
   */
  public drawSketch_(centerOnly?: boolean): void {
    this.overlayLayer_.getSource()?.clear();
    if (!this.selection_.getLength()) return;
    const map = this.getMap();
    if (!map) return;
    const view = map.getView();
    const viewRotation = view.getRotation();
    let ext = this.getGeometryRotateToZero_(this.selection_.item(0) as Feature<any>).getExtent();
    const keepRectangle = this.selection_.item(0) && this._isRectangle((this.selection_.item(0) as Feature<any>).getGeometry());
    let coords: Coordinate[] | undefined;
    if (keepRectangle) {
      coords = (this.getGeometryRotateToZero_(this.selection_.item(0) as Feature<any>) as PolygonGeom).getCoordinates()[0].slice(0, 4);
      coords.unshift(coords[3]);
    }
    ext = extentBuffer(ext, this.get('buffer'));
    this.selection_.forEach((f) => {
      const e = this.getGeometryRotateToZero_(f).getExtent();
      extentExtend(ext, e);
    });

    let ptRadius: number | number[] | undefined = this.selection_.getLength() === 1 ? this._pointRadius(this.selection_.item(0) as Feature<any>) : 0;
    if (ptRadius && !Array.isArray(ptRadius)) ptRadius = [ptRadius, ptRadius];

    const proj: any = view.getProjection();
    const extentWidth = proj.getExtent ? proj.getExtent()[2] - proj.getExtent()[0] : 40075016.68557849;
    const vc = view.getCenter();
    if (!vc) return; // safety
    const centerX = vc[0];
    const geomCenter = extentGetCenter(ext);
    let wrapOffset = 0;
    if (Math.abs(geomCenter[0] - centerX) > extentWidth / 2) {
      wrapOffset = Math.round((centerX - geomCenter[0]) / extentWidth) * extentWidth;
    }

    const extWrap: Extent = [ext[0] + wrapOffset, ext[1], ext[2] + wrapOffset, ext[3]];
    const coordsWrap = coords?.map((c) => [c[0] + wrapOffset, c[1]]) as Coordinate[] | undefined;

    if (centerOnly) {
      // 旋转过程中：即便是点（带 image）也保持显示 bbox；若记录了初始尺寸，则使用固定宽高
      this.overlayLayer_
        .getSource()
        ?.addFeature(new Feature({ geometry: new PointGeom([this.center_[0] + wrapOffset, this.center_[1]]), handle: 'rotate0' }) as any);
      let centerExtent = extWrap;
      if (this.mode_ === 'rotate' && this.ispt_ && this._ptRotateBBoxSize) {
        const halfW = this._ptRotateBBoxSize[0] / 2;
        const halfH = this._ptRotateBBoxSize[1] / 2;
        const cx = this.center_[0] + wrapOffset;
        const cy = this.center_[1];
        centerExtent = [cx - halfW, cy - halfH, cx + halfW, cy + halfH];
      }
      const geom: Geometry = polygonFromExtent(centerExtent as Extent);
      const viewCenter = map.getView().getCenter();
      if (this.get('enableRotatedTransform') && viewRotation !== 0 && viewCenter) geom.rotate(viewRotation, viewCenter);
      const f = (this.bbox_ = new Feature(geom));
      this.overlayLayer_.getSource()?.addFeature(f);
      return;
    }

    let ext2: Extent = extWrap;
    if (this.ispt_) {
      const ec = extentGetCenter(ext2);
      const p = map.getPixelFromCoordinate([ec[0], ec[1]]);
      if (p) {
        const dx = ptRadius ? (ptRadius as number[])[0] || 10 : 10;
        const dy = ptRadius ? (ptRadius as number[])[1] || 10 : 10;
        const c1 = map.getCoordinateFromPixel([p[0] - dx, p[1] - dy]);
        const c2 = map.getCoordinateFromPixel([p[0] + dx, p[1] + dy]);
        if (c1 && c2) ext2 = extentBoundingExtent([c1, c2]);
      }
    }

    const geom: Geometry = keepRectangle ? new PolygonGeom([coordsWrap as Coordinate[]]) : polygonFromExtent(ext2);
    const viewC = map.getView().getCenter();
    if (this.get('enableRotatedTransform') && viewRotation !== 0 && viewC) geom.rotate(viewRotation, viewC);
    const bbox = (this.bbox_ = new Feature(geom));

    const features: Feature<any>[] = [];
    const g = (geom as PolygonGeom).getCoordinates()[0];
    if (!this.ispt_ || ptRadius) {
      features.push(bbox);
      if (!this.iscircle_ && !this.ispt_ && this.get('stretch') && this.get('scale')) {
        for (let i = 0; i < g.length - 1; i++) {
          features.push(
            new Feature({
              geometry: new PointGeom([(g[i][0] + g[i + 1][0]) / 2, (g[i][1] + g[i + 1][1]) / 2]),
              handle: 'scale',
              constraint: i % 2 ? 'h' : 'v',
              option: i
            })
          );
        }
      }
      if (this.get('scale')) {
        for (let i = 0; i < g.length - 1; i++) features.push(new Feature({ geometry: new PointGeom(g[i]), handle: 'scale', option: i }));
      }
      if (this.get('translate') && !this.get('translateFeature')) {
        features.push(new Feature({ geometry: new PointGeom([(g[0][0] + g[2][0]) / 2, (g[0][1] + g[2][1]) / 2]), handle: 'translate' }));
      }
    }

    if (!this.iscircle_ && this.get('rotate')) {
      let allowRotate = true;
      if (this.ispt_) {
        allowRotate = false;
        if (this.selection_.getLength() === 1) {
          const pf = this.selection_.item(0) as Feature<any>;
          if (this._pointHasIconImage_(pf)) allowRotate = true;
        }
      }
      if (allowRotate) {
        features.push(new Feature({ geometry: new PointGeom([(g[0][0] + g[2][0]) / 2, g[2][1]]), handle: 'rotate' }));
      }
    }

    if (this.ispt_ && this.get('scale')) {
      for (let i = 0; i < g.length - 1; i++) features.push(new Feature({ geometry: new PointGeom(g[i]), handle: 'scale', option: i }));
      // 当点要素具有位图 image 时，允许显示边中点拉伸手柄（与非点几 geometry 一致）
      if (this.get('stretch') && this.selection_.getLength() === 1) {
        const pf = this.selection_.item(0) as Feature<any>;
        if (this._pointHasIconImage_(pf)) {
          for (let i = 0; i < g.length - 1; i++) {
            const mid = [(g[i][0] + g[i + 1][0]) / 2, (g[i][1] + g[i + 1][1]) / 2];
            features.push(
              new Feature({
                geometry: new PointGeom(mid),
                handle: 'scale',
                constraint: i % 2 ? 'h' : 'v',
                option: i
              })
            );
          }
        }
      }
    }
    this.overlayLayer_.getSource()?.addFeatures(features);
  }

  /**
   * 选择或反选单个要素；传入 add=true 代表累加模式。
   * 不传 feature 则清空选择。
   */
  select(feature?: Feature<any>, add?: boolean): void {
    if (!feature) {
      this.selection_.clear();
      this.drawSketch_();
      return;
    }
    if (!feature.getGeometry?.()) return;
    if (add) this.selection_.push(feature);
    else {
      const index = this.selection_.getArray().indexOf(feature);
      if (index >= 0) this.selection_.removeAt(index);
      else this.selection_.push(feature);
    }
    this.ispt_ = this.selection_.getLength() === 1 && isPointGeometry((this.selection_.item(0) as Feature<any>).getGeometry());
    this.iscircle_ = this.selection_.getLength() === 1 && (this.selection_.item(0) as Feature<any>).getGeometry().getType() === 'Circle';
    this.drawSketch_();
    this.watchFeatures_();
    this.dispatchEvent({ type: 'select', feature, features: this.selection_ } as TransformEvent);
  }

  /**
   * 直接覆盖当前选择集合。
   */
  setSelection(features: Feature<any>[]): void {
    this.selection_.clear();
    features.forEach((f) => this.selection_.push(f));
    this.ispt_ = this.selection_.getLength() === 1 && isPointGeometry((this.selection_.item(0) as Feature<any>).getGeometry());
    this.iscircle_ = this.selection_.getLength() === 1 && (this.selection_.item(0) as Feature<any>).getGeometry().getType() === 'Circle';
    this.drawSketch_();
    this.watchFeatures_();
    this.dispatchEvent({ type: 'select', features: this.selection_ } as TransformEvent);
  }

  /**
   * 主动退出编辑：清空当前选中并派发自定义事件 'exitedit'。
   * 使用场景：例如右键地图退出、外部按钮取消编辑。
   */
  public exitEdit(pixel: number[]): void {
    if (!this.selection_.getLength()) return;
    this.selection_.clear();
    this.drawSketch_();
    // 兼容旧逻辑：同时派发 selectend（无 feature 表示结束）
    this.dispatchEvent({ type: 'selectend', pixel } as TransformEvent);
  }

  /**
   * 监听被选要素的几何变化；当外部修改时自动重绘手柄。
   */
  private watchFeatures_(): void {
    if (this._featureListeners) this._featureListeners.forEach((l) => unByKey(l));
    this._featureListeners = [];
    this.selection_.forEach((f) => {
      this._featureListeners.push(
        f.on('change', () => {
          if (!this.isUpdating_) this.drawSketch_();
        })
      );
    });
  }

  /**
   * 校验地图实例是否存在动态绘制
   */
  private checkDynmicDraw_(): boolean {
    let flag = false;
    useEarth()
      .map.getInteractions()
      .forEach((i) => {
        if (i.get('dynamicDraw')) {
          flag = true;
        }
      });
    return flag;
  }

  /**
   * Pointer 按下：命中手柄决定模式，缓存初始几何、外包框、中心、角度等。
   */
  private handleDownEvent_(evt: MapBrowserEvent<any>): boolean | void {
    if (this.checkDynmicDraw_()) return;
    // 右键（button === 2）退出编辑：不区分是否点在要素或手柄上
    const oe: any = (evt as any).originalEvent;
    if (oe && oe.button === 2) {
      if (this.selection_.getLength()) this.exitEdit(evt.pixel);
      oe.preventDefault?.();
      return false; // 阻止继续走后续左键选择逻辑
    }
    if (!this._handleEvent(evt, this.selection_)) return;
    const sel = this.getFeatureAtPixel_(evt.pixel);
    const feature = sel.feature;
    if (
      this.selection_.getLength() &&
      feature &&
      this.selection_.getArray().indexOf(feature) >= 0 &&
      ((this.ispt_ && this.get('translate')) || this.get('translateFeature'))
    ) {
      sel.handle = 'translate';
    }
    if (sel.handle && feature) {
      this.mode_ = sel.handle;
      this.opt_ = sel.option as any;
      this.constraint_ = sel.constraint;
      // 进入交互：激活 bbox 虚线样式（仅对 rotate / translate / scale）
      if (['rotate', 'translate', 'scale'].includes(this.mode_)) {
        this._bboxActive = true;
        this._startBBoxBlink();
        this.drawSketch_();
      }
      // 如进入点图标旋转，记录初始 bbox 尺寸（依据当前 scale 与像素尺寸换算）
      if (this.mode_ === 'rotate' && this.ispt_ && this.selection_.getLength() === 1) {
        const pf = this.selection_.item(0) as Feature<any>;
        if (this._pointHasIconImage_(pf)) {
          const map = this.getMap();
          if (map) {
            const sizePx = this._pointGetVisualSizePixel_(pf);
            const centerPx = map.getPixelFromCoordinate(this.center_);
            if (sizePx && centerPx) {
              const p1: [number, number] = [centerPx[0] - sizePx[0] / 2, centerPx[1] - sizePx[1] / 2];
              const p2: [number, number] = [centerPx[0] + sizePx[0] / 2, centerPx[1] + sizePx[1] / 2];
              const c1 = map.getCoordinateFromPixel(p1);
              const c2 = map.getCoordinateFromPixel(p2);
              if (c1 && c2) this._ptRotateBBoxSize = [Math.abs(c2[0] - c1[0]), Math.abs(c2[1] - c1[1])];
            }
          }
        }
      }
      const viewRotation = this.getMap()?.getView().getRotation() || 0;
      this.coordinate_ = (feature as any).get('handle') ? (feature.getGeometry() as any).getCoordinates() : evt.coordinate;
      const gm = this.getMap();
      const pxCoord = gm ? gm.getCoordinateFromPixel(this.coordinate_) : null;
      this.pixel_ = (pxCoord || this.coordinate_) as Coordinate;
      this.geoms_ = [];
      this.rotatedGeoms_ = [];
      let extent = extentCreateEmpty();
      let rotExtent = extentCreateEmpty();
      this.hasChanged_ = false;
      for (let i = 0, f: Feature<any> | undefined; (f = this.selection_.item(i) as Feature<any>); i++) {
        const fg = f.getGeometry();
        if (fg) {
          this.geoms_.push(fg.clone());
          extent = extentExtend(extent, fg.getExtent());
        }
        if (this.get('enableRotatedTransform') && viewRotation !== 0) {
          const rotGeom = this.getGeometryRotateToZero_(f, true);
          this.rotatedGeoms_.push(rotGeom);
          rotExtent = extentExtend(rotExtent, rotGeom.getExtent());
        }
      }
      this.extent_ = polygonFromExtent(extent).getCoordinates()[0];
      if (this.get('enableRotatedTransform') && viewRotation !== 0) this.rotatedExtent_ = polygonFromExtent(rotExtent).getCoordinates()[0];
      const element = evt.map.getTargetElement();
      this._prevCursorStyle = (element as HTMLElement).style.cursor;
      ol_ext_element.setCursor(element, this.Cursors.mouseDown || 'grabbing');
      if (this.mode_ === 'rotate') this.center_ = this.getCenter() || extentGetCenter(extent);
      else this.center_ = extentGetCenter(extent);
      const mapRef = this.getMap();
      if (!mapRef) return true;
      const view = mapRef.getView();
      const proj: any = view.getProjection();
      const extentWidth = proj.getExtent ? proj.getExtent()[2] - proj.getExtent()[0] : 40075016.68557849;
      let mouseX = evt.coordinate[0];
      if (Math.abs(mouseX - this.center_[0]) > extentWidth / 2) {
        mouseX = mouseX + Math.round((this.center_[0] - mouseX) / extentWidth) * extentWidth;
      }
      this.angle_ = Math.atan2(this.center_[1] - evt.coordinate[1], this.center_[0] - mouseX);
      if (this.mode_ === 'scale' && this.ispt_) {
        const normalize = (coord: Coordinate, center: Coordinate) => {
          let x = coord[0];
          if (Math.abs(x - center[0]) > extentWidth / 2) x = x + Math.round((center[0] - x) / extentWidth) * extentWidth;
          return [x, coord[1]] as Coordinate;
        };
        this._ptDownCoordNorm = normalize(this.coordinate_, this.center_);
        const v = [this._ptDownCoordNorm[0] - this.center_[0], this._ptDownCoordNorm[1] - this.center_[1]];
        this._ptBaseLen = Math.sqrt(v[0] * v[0] + v[1] * v[1]) || 1;
      }
      this.dispatchEvent({
        type: (this.mode_ + 'start') as any,
        feature: this.selection_.item(0) as Feature<any>,
        features: this.selection_,
        pixel: evt.pixel,
        coordinate: evt.coordinate
      } as TransformEvent);
      return true;
    } else if (this.get('selection')) {
      if (feature) {
        if (!this.addFn_(evt)) this.selection_.clear();
        const index = this.selection_.getArray().indexOf(feature);
        if (index < 0) this.selection_.push(feature);
        else this.selection_.removeAt(index);
        this.ispt_ = this.selection_.getLength() === 1 && isPointGeometry((this.selection_.item(0) as Feature<any>).getGeometry());
        this.iscircle_ = this.selection_.getLength() === 1 && (this.selection_.item(0) as Feature<any>).getGeometry().getType() === 'Circle';
        this.drawSketch_();
        this.watchFeatures_();
        const bboxExtent = this.bbox_?.getGeometry().getCoordinates();
        this.dispatchEvent({
          type: 'select',
          feature,
          features: this.selection_,
          pixel: evt.pixel,
          coordinate: evt.coordinate,
          bboxExtent: bboxExtent
        } as TransformEvent);
      }
    }
  }

  getCenter(): Coordinate | undefined {
    return this.get('center');
  }
  setCenter(c?: Coordinate): void {
    this.set('center', c);
  }

  /**
   * Pointer 拖拽：根据当前模式执行平移 / 旋转 / 缩放 / 拉伸。
   * - rotate: 计算新的角度差并旋转几何（点图标则修改样式 rotation）。
   * - translate: 直接 translate 几何。
   * - scale (point): 修改图标/形状 style 的 radius/size/scale。
   * - scale (non-point): 支持 keepRectangle + 拉伸/等比/对角中心修改等复杂逻辑。
   */
  private handleDragEvent_(evt: MapBrowserEvent<any>): void {
    if (!this._handleEvent(evt, this.selection_)) return;
    const map = this.getMap();
    if (!map) return;
    const view = map.getView();
    const proj: any = view.getProjection();
    const extentWidth = proj.getExtent ? proj.getExtent()[2] - proj.getExtent()[0] : 40075016.68557849;
    const pt0: Coordinate = [this.coordinate_[0], this.coordinate_[1]];
    const pt: Coordinate = [evt.coordinate[0], evt.coordinate[1]];
    this.isUpdating_ = true;
    this.hasChanged_ = true;
    const bboxExtent = this.bbox_?.getGeometry().getCoordinates();
    switch (this.mode_) {
      case 'rotate': {
        let mouseX = pt[0];
        if (Math.abs(mouseX - this.center_[0]) > extentWidth / 2) {
          mouseX = mouseX + Math.round((this.center_[0] - mouseX) / extentWidth) * extentWidth;
        }
        const a = Math.atan2(this.center_[1] - pt[1], this.center_[0] - mouseX);
        for (let i = 0, f: Feature<any> | undefined; (f = this.selection_.item(i) as Feature<any>); i++) {
          const geometry = this.geoms_[i].clone();
          if (geometry.getType() !== 'Point') {
            geometry.rotate(a - this.angle_, this.center_);
            if (geometry.getType() === 'Circle') (geometry as any).setCenterAndRadius((geometry as any).getCenter(), (geometry as any).getRadius());
            f.setGeometry(geometry);
          } else {
            if (this._pointHasIconImage_(f)) {
              const style: any = f.getStyle?.();
              const img = style?.getImage?.();
              if (img?.setRotation) {
                const baseRot = this._ptBaseRotation ?? (img.getRotation?.() || 0);
                if (this._ptBaseRotation == null) this._ptBaseRotation = baseRot;
                img.setRotation(baseRot - (a - this.angle_));
                f.changed?.();
              }
            }
          }
        }
        this.drawSketch_(true);
        this.dispatchEvent({
          type: 'rotating',
          feature: this.selection_.item(0) as Feature<any>,
          features: this.selection_,
          angle: a - this.angle_,
          bboxExtent: bboxExtent,
          pixel: evt.pixel,
          coordinate: [mouseX, pt[1]]
        } as TransformEvent);
        break;
      }
      case 'translate': {
        const deltaX = pt[0] - pt0[0];
        const deltaY = pt[1] - pt0[1];
        this.selection_.forEach((f) => f.getGeometry()?.translate(deltaX, deltaY));
        this.handles_.forEach((f) => f.getGeometry()?.translate(deltaX, deltaY));
        this.coordinate_ = evt.coordinate;
        this.dispatchEvent({
          type: 'translating',
          feature: this.selection_.item(0) as Feature<any>,
          features: this.selection_,
          delta: [deltaX, deltaY],
          bboxExtent: bboxExtent,
          pixel: evt.pixel,
          coordinate: evt.coordinate
        } as TransformEvent);
        break;
      }
      case 'scale': {
        if (this.ispt_) {
          const feature = this.selection_.item(0) as Feature<any>;
          const style: any = feature.getStyle?.();
          // 支持 modifyCenter：以对角点为中心（对角：中心关于当前手柄对称）
          let center = this.center_;
          const modifyCenter = (this.get('modifyCenter') as (e: MapBrowserEvent<any>) => boolean)(evt);
          if (modifyCenter && this.mode_ === 'scale') {
            // 使用当前按下手柄坐标（this.coordinate_）与中心对称点作为缩放中心
            // 对称点 = center*2 - handle
            center = [center[0] * 2 - this.coordinate_[0], center[1] * 2 - this.coordinate_[1]] as Coordinate;
          }
          const normalize = (coord: Coordinate, ctr: Coordinate) => {
            let x = coord[0];
            if (Math.abs(x - ctr[0]) > extentWidth / 2) x = x + Math.round((ctr[0] - x) / extentWidth) * extentWidth;
            return [x, coord[1]] as Coordinate;
          };
          const downCoordinate = this._ptDownCoordNorm || normalize(this.coordinate_, center);
          const dragCoordinate = normalize(evt.coordinate, center);
          const v0 = [downCoordinate[0] - center[0], downCoordinate[1] - center[1]]; // 初始向量
          const v1 = [dragCoordinate[0] - center[0], dragCoordinate[1] - center[1]]; // 当前向量
          const baseLen = this._ptBaseLen || Math.sqrt(v0[0] * v0[0] + v0[1] * v0[1]) || 1;
          const minScale = 0.2;

          // 角点：允许双轴缩放；边中点（stretch）：单轴缩放；
          // constraint_ = 'h' 表示只纵向（保持 scx=1），'v' 表示只横向；与非点几何保持一致
          const stretch = this.constraint_;
          let scx: number;
          let scy: number;
          if (stretch) {
            // 使用位移向量分量比值；若对应分量基值为 0 则回退为 1
            const dx0 = v0[0];
            const dy0 = v0[1];
            if (stretch === 'h') {
              scx = 1;
              scy = dy0 === 0 ? 1 : v1[1] / dy0;
            } else {
              scx = dx0 === 0 ? 1 : v1[0] / dx0;
              scy = 1;
            }
          } else {
            // 角点：分别计算 x / y 比例；如果为 0 则使用整体长度比例（避免除 0）
            const dx0 = v0[0];
            const dy0 = v0[1];
            scx = dx0 === 0 ? 1 : v1[0] / dx0;
            scy = dy0 === 0 ? 1 : v1[1] / dy0;
          }

          // keepAspectRatio：统一为最小缩放（等比）
          const keepAR = this.get('keepAspectRatio') as (e: MapBrowserEvent<any>) => boolean;
          if (!stretch && keepAR && keepAR(evt)) {
            const sSignX = scx < 0 ? -1 : 1;
            const sSignY = scy < 0 ? -1 : 1;
            const s = Math.min(Math.abs(scx), Math.abs(scy));
            scx = s * sSignX;
            scy = s * sSignY;
          }

          // noFlip：取绝对值
          if (this.get('noFlip')) {
            if (scx < 0) scx = -scx;
            if (scy < 0) scy = -scy;
          }
          // 下限限制
          if (Math.abs(scx) < minScale) scx = scx < 0 ? -minScale : minScale;
          if (Math.abs(scy) < minScale) scy = scy < 0 ? -minScale : minScale;
          if (style?.getImage) {
            const image = style.getImage();
            if (image?.getRadius && image?.setRadius) {
              if (!this._ptCircleBaseRadius) {
                this._ptCircleBaseRadius = image.getRadius();
                this._ptCircleBaseLen = baseLen;
              }
              // 圆形保持等比：取 y 轴（或任意）
              let newR = (this._ptCircleBaseRadius || 0) * Math.min(Math.abs(scx), Math.abs(scy));
              if (newR < 2) newR = 2;
              image.setRadius(newR);
            } else if (image?.setScale && image?.getScale) {
              const curScale: any = image.getScale();
              if (!this._ptImageBaseScalePair) {
                if (Array.isArray(curScale)) this._ptImageBaseScalePair = [curScale[0] || 1, curScale[1] || 1];
                else this._ptImageBaseScalePair = [curScale || 1, curScale || 1];
                this._ptImageBaseLen = baseLen;
              }
              const [baseSX, baseSY] = this._ptImageBaseScalePair;
              let newSX = baseSX;
              let newSY = baseSY;
              if (stretch) {
                if (stretch === 'v') newSX = baseSX * scx;
                else newSY = baseSY * scy;
              } else {
                newSX = baseSX * scx;
                newSY = baseSY * scy;
              }
              const keepAR2 = this.get('keepAspectRatio') as (e: MapBrowserEvent<any>) => boolean;
              if (!stretch && keepAR2 && keepAR2(evt)) {
                const s = Math.min(Math.abs(newSX / baseSX), Math.abs(newSY / baseSY));
                const signX = newSX < 0 ? -1 : 1;
                const signY = newSY < 0 ? -1 : 1;
                newSX = baseSX * s * signX;
                newSY = baseSY * s * signY;
              }
              if (this.get('noFlip')) {
                if (newSX < 0) newSX = -newSX;
                if (newSY < 0) newSY = -newSY;
              }
              const minScale = 0.2;
              if (Math.abs(newSX) < minScale * baseSX) newSX = baseSX * minScale * (newSX < 0 ? -1 : 1);
              if (Math.abs(newSY) < minScale * baseSY) newSY = baseSY * minScale * (newSY < 0 ? -1 : 1);
              try {
                image.setScale([newSX, newSY]);
              } catch {
                const uni = (Math.abs(newSX) + Math.abs(newSY)) / 2;
                image.setScale(uni);
              }
            }
          }
          feature.changed?.();
          this.drawSketch_();
          this.dispatchEvent({
            type: 'scaling',
            feature,
            features: this.selection_,
            scale: [scx, scy],
            pixel: evt.pixel,
            bboxExtent: bboxExtent,
            coordinate: evt.coordinate
          } as TransformEvent);
          break;
        }
        // ---- 非点几何缩放 / 拉伸核心逻辑 ----
        const viewRotation = view.getRotation();
        const modifyCenter = (this.get('modifyCenter') as (e: MapBrowserEvent<any>) => boolean)(evt);
        let center = this.center_;
        if (modifyCenter) {
          let extentCoordinates = this.extent_;
          if (this.get('enableRotatedTransform') && viewRotation !== 0) extentCoordinates = this.rotatedExtent_;
          center = extentCoordinates[(Number(this.opt_) + 2) % 4];
        }
        const keepRectangle = this.geoms_.length === 1 && this._isRectangle(this.geoms_[0]);
        const stretch = this.constraint_;
        const opt = this.opt_ as number | undefined;
        let downCoordinate = this.coordinate_.slice() as Coordinate;
        let dragCoordinate = evt.coordinate.slice() as Coordinate;
        // wrap X for longitude continuity
        const wrapToCenter = (x: number, centerX: number, width: number) => {
          if (Math.abs(x - centerX) > width / 2) return x + Math.round((centerX - x) / width) * width;
          return x;
        };
        downCoordinate = [wrapToCenter(downCoordinate[0], center[0], extentWidth), downCoordinate[1]];
        dragCoordinate = [wrapToCenter(dragCoordinate[0], center[0], extentWidth), dragCoordinate[1]];
        if (this.get('enableRotatedTransform') && viewRotation !== 0) {
          const downPoint = new PointGeom(downCoordinate);
          downPoint.rotate(viewRotation * -1, center);
          downCoordinate = downPoint.getCoordinates();
          const dragPoint = new PointGeom(dragCoordinate);
          dragPoint.rotate(viewRotation * -1, center);
          dragCoordinate = dragPoint.getCoordinates();
        }
        const dx0 = downCoordinate[0] - center[0];
        const dy0 = downCoordinate[1] - center[1];
        const dx1 = dragCoordinate[0] - center[0];
        const dy1 = dragCoordinate[1] - center[1];
        let scx = dx0 === 0 ? 1 : dx1 / dx0;
        let scy = dy0 === 0 ? 1 : dy1 / dy0;
        const displacementVector = [dragCoordinate[0] - downCoordinate[0], dragCoordinate[1] - downCoordinate[1]];
        if (this.get('enableRotatedTransform') && viewRotation !== 0) {
          const centerPoint = new PointGeom(center);
          const mCenter = map.getView().getCenter();
          if (mCenter) {
            centerPoint.rotate(viewRotation * -1, mCenter);
            center = centerPoint.getCoordinates();
          }
        }
        if (this.get('noFlip')) {
          if (scx < 0) scx = -scx;
          if (scy < 0) scy = -scy;
        }
        if (stretch) {
          if (stretch === 'h') scx = 1;
          else scy = 1;
        } else {
          const keepAR = this.get('keepAspectRatio') as (e: MapBrowserEvent<any>) => boolean;
          if (keepAR && keepAR(evt)) scx = scy = Math.min(scx, scy);
        }
        for (let i = 0, f: Feature<any> | undefined; (f = this.selection_.item(i) as Feature<any>); i++) {
          const geometry = viewRotation === 0 || !this.get('enableRotatedTransform') ? this.geoms_[i].clone() : this.rotatedGeoms_[i].clone();
          geometry.applyTransform(((g1: number[], g2: number[], dim: number) => {
            if (dim < 2) return g2;
            if (!keepRectangle) {
              for (let j = 0; j < g1.length; j += dim) {
                if (scx !== 1) g2[j] = center[0] + (g1[j] - center[0]) * scx;
                if (scy !== 1) g2[j + 1] = center[1] + (g1[j + 1] - center[1]) * scy;
              }
            } else if (typeof opt === 'number') {
              // 矩形拉伸（保持矩形）逻辑
              const pointArray = [[6], [0, 8], [2], [4]] as number[][]; // 顶点索引分组
              const pointA = [g1[0], g1[1]];
              const pointB = [g1[2], g1[3]];
              const pointC = [g1[4], g1[5]];
              const pointD = [g1[6], g1[7]];
              const pointA1 = [g1[8], g1[9]]; // 重复 A 点（闭合）
              if (stretch) {
                const base = opt % 2 === 0 ? this._countVector(pointA, pointB) : this._countVector(pointD, pointA);
                const projected = this._projectVectorOnVector(displacementVector, base);
                const nextIndex = opt + 1 < pointArray.length ? opt + 1 : 0;
                const coordsToChange = [...pointArray[opt], ...pointArray[nextIndex]];
                for (let j = 0; j < g1.length; j += dim) {
                  if (coordsToChange.includes(j)) {
                    g2[j] = g1[j] + projected[0];
                    g2[j + 1] = g1[j + 1] + projected[1];
                  } else {
                    g2[j] = g1[j];
                    g2[j + 1] = g1[j + 1];
                  }
                }
              } else {
                let displacement: number[] = [];
                let projLeft: number[] = [];
                let projRight: number[] = [];
                const move = (src: number[], vec: number[]) => this._movePoint(src, vec);
                switch (opt) {
                  case 0:
                    displacement = this._countVector(pointD, dragCoordinate);
                    projLeft = this._projectVectorOnVector(displacement, this._countVector(pointC, pointD));
                    projRight = this._projectVectorOnVector(displacement, this._countVector(pointA, pointD));
                    [g2[0], g2[1]] = move(pointA, projLeft);
                    [g2[4], g2[5]] = move(pointC, projRight);
                    [g2[6], g2[7]] = move(pointD, displacement);
                    [g2[8], g2[9]] = move(pointA1, projLeft);
                    break;
                  case 1:
                    displacement = this._countVector(pointA, dragCoordinate);
                    projLeft = this._projectVectorOnVector(displacement, this._countVector(pointD, pointA));
                    projRight = this._projectVectorOnVector(displacement, this._countVector(pointB, pointA));
                    [g2[0], g2[1]] = move(pointA, displacement);
                    [g2[2], g2[3]] = move(pointB, projLeft);
                    [g2[6], g2[7]] = move(pointD, projRight);
                    [g2[8], g2[9]] = move(pointA1, displacement);
                    break;
                  case 2:
                    displacement = this._countVector(pointB, dragCoordinate);
                    projLeft = this._projectVectorOnVector(displacement, this._countVector(pointA, pointB));
                    projRight = this._projectVectorOnVector(displacement, this._countVector(pointC, pointB));
                    [g2[0], g2[1]] = move(pointA, projRight);
                    [g2[2], g2[3]] = move(pointB, displacement);
                    [g2[4], g2[5]] = move(pointC, projLeft);
                    [g2[8], g2[9]] = move(pointA1, projRight);
                    break;
                  case 3:
                    displacement = this._countVector(pointC, dragCoordinate);
                    projLeft = this._projectVectorOnVector(displacement, this._countVector(pointB, pointC));
                    projRight = this._projectVectorOnVector(displacement, this._countVector(pointD, pointC));
                    [g2[2], g2[3]] = move(pointB, projRight);
                    [g2[4], g2[5]] = move(pointC, displacement);
                    [g2[6], g2[7]] = move(pointD, projLeft);
                    break;
                }
              }
            }
            if (geometry.getType() === 'Circle') (geometry as any).setCenterAndRadius((geometry as any).getCenter(), (geometry as any).getRadius());
            return g2;
          }) as any);
          if (this.get('enableRotatedTransform') && viewRotation !== 0) {
            const mc = map.getView().getCenter();
            if (mc) geometry.rotate(viewRotation, mc);
          }
          f.setGeometry(geometry);
        }
        this.drawSketch_();
        this.dispatchEvent({
          type: 'scaling',
          feature: this.selection_.item(0) as Feature<any>,
          features: this.selection_,
          scale: [scx, scy],
          pixel: evt.pixel,
          bboxExtent: bboxExtent,
          coordinate: evt.coordinate
        } as TransformEvent);
        break;
      }
      default:
        break;
    }
    this.isUpdating_ = false;
  }

  /**
   * Pointer 移动（无按下）：更新鼠标光标并派发 enterHandle / leaveHandle 事件。
   */
  private handleMoveEvent_(evt: MapBrowserEvent<any>): void {
    if (!this._handleEvent(evt, this.selection_)) return;
    if (!this.mode_ && this.selection_.getLength() > 0) {
      const sel = this.getFeatureAtPixel_(evt.pixel);
      const element = evt.map.getTargetElement();
      if (sel.feature) {
        const c = sel.handle ? this.Cursors[(sel.handle || 'default') + (sel.constraint || '') + (sel.option || '')] : this.Cursors.select;
        if (this.previousCursor_ === undefined) this.previousCursor_ = (element as HTMLElement).style.cursor;
        ol_ext_element.setCursor(element, c);
        this.dispatchEvent({ type: 'enterHandle', cursor: c, pixel: evt.pixel } as any);
      } else {
        if (this.previousCursor_ !== undefined) ol_ext_element.setCursor(element, this.previousCursor_);
        this.previousCursor_ = undefined;
        this.dispatchEvent({ type: 'leaveHandle', pixel: evt.pixel } as any);
      }
    }
  }

  /**
   * Pointer 抬起：清理临时缓存、执行 wrapX 归位（translate 模式）、派发 <mode>end 事件并重绘。
   */
  private handleUpEvent_(evt: MapBrowserEvent<any>): boolean {
    // this._ptImageBaseScale = undefined; // 已弃用
    this._ptImageBaseScalePair = undefined;
    this._ptImageBaseLen = undefined;
    this._ptImageBaseSize = undefined;
    this._ptStyleBaseSize = undefined;
    this._ptStyleBaseLen = undefined;
    this._ptDownCoordNorm = undefined;
    this._ptBaseLen = undefined;
    this._ptCircleBaseRadius = undefined;
    this._ptCircleBaseLen = undefined;
    this._ptBaseRotation = undefined;
    this._ptRotateBBoxSize = undefined;
    const element = evt.map.getTargetElement();
    if (this._prevCursorStyle !== undefined) {
      ol_ext_element.setCursor(element, this._prevCursorStyle);
      this._prevCursorStyle = undefined;
    } else if (this.mode_ === 'rotate') {
      ol_ext_element.setCursor(element, this.Cursors.default);
      this.previousCursor_ = undefined;
    }

    // ---- wrapX 修正：当平移跨过地图多拷贝边界后，调整要素坐标到当前视图附近 ----
    if (this.mode_ === 'translate' && this.selection_.getLength()) {
      const map = this.getMap();
      if (map) {
        const view = map.getView();
        const proj: any = view.getProjection();
        const extentWidth: number = proj?.getExtent ? proj.getExtent()[2] - proj.getExtent()[0] : 40075016.68557849; // EPSG:3857
        const centerX = (view.getCenter() || [0, 0])[0];
        for (let i = 0, f: Feature<any> | undefined; (f = this.selection_.item(i) as Feature<any>); i++) {
          const geom = f.getGeometry();
          if (!geom) continue;
          // 取几何中心（Point 直接坐标）
          let gCenter: Coordinate;
          if (geom.getType() === 'Point') gCenter = (geom as PointGeom).getCoordinates();
          else gCenter = extentGetCenter(geom.getExtent());
          let wrapOffset = 0;
          if (Math.abs(gCenter[0] - centerX) > extentWidth / 2) {
            wrapOffset = Math.round((centerX - gCenter[0]) / extentWidth) * extentWidth;
          }
          if (wrapOffset !== 0) {
            this._applyWrapOffset_(geom, wrapOffset, extentWidth);
            // 强制刷新
            if (typeof (f as any).changed === 'function') (f as any).changed();
            // 重新索引（一些 source 在 wrapX 场景需要 remove/add 保证渲染更新）
            const layers = map.getLayers()?.getArray?.() || [];
            layers.forEach((layer: any) => {
              const source = layer?.getSource?.();
              if (source?.getFeatures && source.getFeatures().indexOf(f) !== -1) {
                if (typeof source.setWrapX === 'function') source.setWrapX(true);
                else if (source.wrapX !== undefined) source.wrapX = true;
                source.removeFeature(f);
                source.addFeature(f);
              }
            });
          }
        }
      }
    }
    const bboxExtent = this.bbox_?.getGeometry().getCoordinates();
    this.dispatchEvent({
      type: (this.mode_ + 'end') as any,
      feature: this.selection_.item(0) as Feature<any>,
      features: this.selection_,
      oldgeom: this.geoms_[0],
      oldgeoms: this.geoms_,
      transformed: this.hasChanged_,
      cursor: (element as HTMLElement).style.cursor,
      pixel: evt.pixel,
      bboxExtent: bboxExtent
    } as TransformEvent);
    // 结束交互：还原 bbox 样式
    if (this._bboxActive) this._bboxActive = false;
    this._stopBBoxBlink();
    this.drawSketch_();
    this.hasChanged_ = false;
    this.mode_ = null;
    return false;
  }

  /**
   * 设置点要素可操作的视觉半径逻辑：
   * - 函数：外部自定义返回数值或 [rx, ry]
   * - 数值 / 数组：恒定大小
   * - 未传：根据样式的 image / size 推导
   */
  setPointRadius(pointRadius?: number | number[] | ((f: Feature<any>) => number | number[])): void {
    if (typeof pointRadius === 'function') this._pointRadius = pointRadius as any;
    else {
      this._pointRadius = (feature: Feature<any>) => {
        if (feature?.getGeometry?.().getType() === 'Point') {
          const style: any = feature.getStyle?.();
          if (style?.getImage) {
            const image = style.getImage();
            if (image) {
              const getScalePair = (): [number, number] => {
                if (image.getScale) {
                  const sc: any = image.getScale();
                  if (Array.isArray(sc)) return [sc[0] || 1, sc[1] || 1];
                  if (typeof sc === 'number') return [sc, sc];
                }
                return [1, 1];
              };
              const [sx, sy] = getScalePair();
              const getBaseSize = (): [number, number] | undefined => {
                if (image.getImageSize) {
                  const isz = image.getImageSize();
                  if (isz && isz.length === 2) return [isz[0], isz[1]];
                }
                if (image.getSize) {
                  const sz = image.getSize();
                  if (sz && sz.length === 2) return [sz[0], sz[1]];
                }
                if (image.getWidth && image.getHeight) {
                  const w = image.getWidth?.();
                  const h = image.getHeight?.();
                  if (w && h) return [w, h];
                }
                return undefined;
              };
              // 优先矩形尺寸，其次圆形半径
              const base = getBaseSize();
              if (base) {
                // 取绝对值以避免翻转后出现负半径导致 bbox 判断失败
                return [Math.abs(base[0] * sx) / 2, Math.abs(base[1] * sy) / 2];
              }
              if (image.getRadius) {
                const r = image.getRadius();
                if (r) return [Math.abs(r * sx), Math.abs(r * sy)];
              }
            }
          }
          if (style?.getSize) {
            const styleSize = style.getSize();
            if (styleSize && styleSize[0] && styleSize[1]) return [styleSize[0] / 2, styleSize[1] / 2];
          }
        }
        return pointRadius || 50;
      };
    }
  }

  /**
   * 估算点要素在像素空间的视觉半径（用于命中测试扩大选择范围）。
   */
  private _getPointVisualRadiusPixel_(feature: Feature<any>): number {
    try {
      if (!feature?.getGeometry || feature.getGeometry().getType() !== 'Point') return 0;
      const style: any = feature.getStyle?.();
      if (style?.getImage) {
        const image = style.getImage();
        if (image) {
          const getScalePair = (): [number, number] => {
            if (image.getScale) {
              const sc: any = image.getScale();
              if (Array.isArray(sc)) return [sc[0] || 1, sc[1] || 1];
              if (typeof sc === 'number') return [sc, sc];
            }
            return [1, 1];
          };
          // 负 scale 代表翻转，这里取绝对值用于视觉半径
          const [rawSx, rawSy] = getScalePair();
          const sx = Math.abs(rawSx);
          const sy = Math.abs(rawSy);
          const sizes: [number, number][] = [];
          if (image.getImageSize) {
            const isz = image.getImageSize();
            if (isz && isz.length === 2) sizes.push([isz[0] * sx, isz[1] * sy]);
          }
          if (image.getSize) {
            const sz = image.getSize();
            if (sz && sz.length === 2) sizes.push([sz[0] * sx, sz[1] * sy]);
          }
          if (image.getWidth && image.getHeight) {
            const w = image.getWidth?.();
            const h = image.getHeight?.();
            if (w && h) sizes.push([w * sx, h * sy]);
          }
          if (sizes.length) {
            const mx = Math.max(...sizes.map((s) => s[0]));
            const my = Math.max(...sizes.map((s) => s[1]));
            return Math.max(mx, my) / 2;
          }
          if (image.getRadius) {
            const r = image.getRadius();
            if (r) return Math.abs(r) * Math.max(sx, sy);
          }
        }
      }
      if (style?.getSize) {
        const s = style.getSize();
        if (s && s.length === 2) return Math.max(s[0], s[1]) / 2;
      }
      return 8;
    } catch {
      return 8;
    }
  }

  /** 获取当前选中要素集合 */
  getFeatures(): Collection<Feature<any>> {
    return this.selection_;
  }

  /**
   * 判断点要素是否具有真实图标 / 位图（而非 Circle / RegularShape）。
   */
  private _pointHasIconImage_(feature: Feature<any>): boolean {
    if (!feature?.getGeometry || feature.getGeometry().getType() !== 'Point') return false;
    const style: any = feature.getStyle?.();
    if (!style?.getImage) return false;
    const img = style.getImage();
    if (!img) return false;
    if (img.getRadius) return false; // 规则形状 / 圆形不属于位图图标
    if (img.getSrc) return true;
    if (img.getImageSize && img.getImageSize()) return true;
    if (img.getSize && img.getSize()) return true;
    return false;
  }

  // ===== 向量操作辅助函数 =====
  /**
   * 将向量 displacement 投影到 base 上（返回投影向量）。
   * 用于矩形角点拖动时拆解位移。
   */
  private _projectVectorOnVector(displacement: number[], base: number[]): number[] {
    const k = (displacement[0] * base[0] + displacement[1] * base[1]) / (base[0] * base[0] + base[1] * base[1]);
    return [base[0] * k, base[1] * k];
  }
  /** 返回 start->end 向量 */
  private _countVector(start: number[], end: number[]): number[] {
    return [end[0] - start[0], end[1] - start[1]];
  }
  /** 位移点坐标 */
  private _movePoint(point: number[], displacement: number[]): number[] {
    return [point[0] + displacement[0], point[1] + displacement[1]];
  }

  /**
   * 应用 wrapOffset 到几何，保持经度值落在当前视图附近。
   * 支持 Point / LineString / MultiPoint / Polygon / MultiLineString / MultiPolygon / Circle。
   * 通过模运算归一化 X 坐标，避免平移后落入遥远复制区。
   */
  private _applyWrapOffset_(geom: Geometry, wrapOffset: number, extentWidth: number): void {
    const wrapCoord = (x: number): number => {
      const half = extentWidth / 2;
      return ((((x + half) % extentWidth) + extentWidth) % extentWidth) - half; // wrap 到 [-half, half]
    };
    const type = geom.getType();
    if (type === 'Point') {
      const p = (geom as PointGeom).getCoordinates();
      (geom as PointGeom).setCoordinates([wrapCoord(p[0] + wrapOffset), p[1]]);
    } else if (type === 'LineString' || type === 'MultiPoint') {
      const coords = (geom as any).getCoordinates().map((c: number[]) => [wrapCoord(c[0] + wrapOffset), c[1]]);
      (geom as any).setCoordinates(coords);
    } else if (type === 'Polygon' || type === 'MultiLineString') {
      const coords = (geom as any).getCoordinates().map((ring: number[][]) => ring.map((c: number[]) => [wrapCoord(c[0] + wrapOffset), c[1]]));
      (geom as any).setCoordinates(coords);
    } else if (type === 'MultiPolygon') {
      const coords = (geom as any)
        .getCoordinates()
        .map((poly: number[][][]) => poly.map((ring: number[][]) => ring.map((c: number[]) => [wrapCoord(c[0] + wrapOffset), c[1]])));
      (geom as any).setCoordinates(coords);
    } else if (type === 'Circle') {
      const c = (geom as any).getCenter();
      (geom as any).setCenterAndRadius([wrapCoord(c[0] + wrapOffset), c[1]], (geom as any).getRadius());
    }
  }
}

export default TransformInteraction;
