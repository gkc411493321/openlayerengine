/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import TransformInteraction from '../extends/transform-interaction/TransformInteraction';
import { useEarth } from '../useEarth';
import { ISetOverlayParam, ITransformCallback, ITransfromParams, ModifyType } from '../interface';
import { ECursor, ETransfrom, ETranslateType } from '../enum';
import { Feature } from 'ol';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import { LineString, Point, Polygon, Circle as CircleGeom, MultiPoint, MultiLineString, MultiPolygon } from 'ol/geom';
import { Base, BillboardLayer, CircleLayer, OverlayLayer, PointLayer, PolygonLayer, PolylineLayer } from '../base';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import { Icon, Style } from 'ol/style';
import { Utils } from '../common';
import cloneDeep from 'lodash/cloneDeep';
import { IToolbarItem, Toolbar } from '../extends/toolbar/Toolbar';
import DynamicDraw from './DynamicDraw';

export default class Transfrom {
  /**
   * 参数
   */
  private options: ITransfromParams;
  /**
   * 实列
   */
  private transforms: any;
  /**
   * 提示牌
   */
  private overlay: OverlayLayer<unknown>;
  /**
   * 提示覆盖物监听器key
   */
  private overlayKey: EventsKey | EventsKey[] | undefined = undefined;
  /**
   * 校验选中状态
   */
  private checkSelect: Feature | null = null;
  /**
   * 选中的图层
   */
  public checkLayer: Base | null = null;
  /**
   * 校验鼠标进入状态
   */
  private checkEnterHandle: boolean = false;
  /**
   * 默认参数
   */
  private defaultParams: ITransfromParams = {
    hitTolerance: 2,
    translateType: ETranslateType.Feature,
    scale: true,
    stretch: true,
    rotate: true,
    historyLimit: 10
  };
  /**
   * 外部监听器缓存
   */
  private listenerMap: Map<ETransfrom, Set<(e: ITransformCallback) => void>> = new Map();
  /**
   * 历史记录堆栈（当前选中周期内）
   * 结构：[{ featureId, geometryClone }]
   */
  private historyStack: Array<{ id: string; feature: Feature }> = [];
  /**
   * 重做堆栈
   */
  private redoStack: Array<{ id: string; feature: Feature }> = [];
  /**
   * 标记本次 select 周期是否已经记录初始状态
   */
  private hasRecordedInitial: boolean = false;
  /**
   * Tooltip DOM 元素（复用避免内存泄漏）
   */
  private helpTooltipEl: HTMLDivElement | null = null;
  /** 基础提示标识（用于动态拼接快捷键及撤销重做数量） */
  private readonly baseTransformTipFlag = '选择控制点进行变换操作';
  /**
   * 是否已销毁
   */
  private disposed = false;
  /**
   * 变换工具条
   */
  private toolbar: Toolbar | null | undefined;
  /**
   * 键盘事件处理函数（用于销毁时解绑）
   */
  private keyDownFun: (() => void) | undefined;
  /**
   * 是否进入复制状态
   */
  private copyStatus: any = null;
  /**
   * 复制的要素
   */
  private copyFeature: any = null;
  /** 最近一次 pointermove 的像素坐标（相对地图容器）。用于纯键盘事件（如 Ctrl+V）需要定位时 */
  private lastPointerPixel: number[] | null = null;
  /** pointermove 监听 key，用于销毁解绑 */
  private pointerMoveKey: EventsKey | undefined;
  /** 平移开始时针对 plotPoints 的快照（用于在平移过程中同步控制点） */
  private translatePlotSnapshot: { featureId: string; basePlotPoints: Coordinate[]; baseCenter: Coordinate } | null = null;

  constructor(options: ITransfromParams) {
    this.options = options;
    this.overlay = new OverlayLayer();
    this.transforms = this.createTransform();
    // 初始化统一事件管线（内部数据处理 + 外部监听分发）
    this.setupEventPipeline();
    // 初始化键盘事件
    this.setupKeyDownEvent();
    // 跟踪鼠标位置，供键盘触发操作使用
    this.setupPointerTrack();
  }
  /**
   * 创建变换实例
   */
  private createTransform() {
    // 初始化参数
    const { params, translate, translateFeature } = this.initParams();
    // 添加 Transform 交互
    const transforms = new TransformInteraction({
      hitTolerance: params.hitTolerance,
      translate: translate,
      translateFeature: translateFeature,
      stretch: params.stretch,
      scale: params.scale,
      rotate: params.rotate,
      filter: params.beforeTransform,
      layers: params.transformLayers,
      features: params.transformFeatures
    });
    useEarth().map.addInteraction(transforms);
    return transforms;
  }
  /**
   * 初始化参数
   */
  private initParams() {
    const params = {
      ...this.defaultParams,
      ...this.options
    };
    let translate = false;
    let translateFeature = false;
    // 处理平移参数
    if (params.translateType == ETranslateType.None) {
      translate = false;
      translateFeature = false;
    } else if (params.translateType == ETranslateType.Center) {
      translate = true;
      translateFeature = false;
    } else if (params.translateType == ETranslateType.Feature) {
      translate = true;
      translateFeature = true;
    }
    return { params, translate, translateFeature };
  }
  /**
   * 建立统一事件管线：一次性注册内部逻辑 -> 转换统一数据结构 -> 分发给外部
   */
  private setupEventPipeline() {
    const events: ETransfrom[] = [
      ETransfrom.Select,
      ETransfrom.SelectEnd,
      ETransfrom.EnterHandle,
      ETransfrom.LeaveHandle,
      ETransfrom.TranslateStart,
      ETransfrom.Translating,
      ETransfrom.TranslateEnd,
      ETransfrom.RotateStart,
      ETransfrom.Rotating,
      ETransfrom.RotateEnd,
      ETransfrom.ScaleStart,
      ETransfrom.Scaling,
      ETransfrom.ScaleEnd,
      ETransfrom.Undo,
      ETransfrom.Redo,
      ETransfrom.Remove,
      ETransfrom.Copy,
      ETransfrom.ModifyStart,
      ETransfrom.Modifying,
      ETransfrom.ModifyEnd
    ];
    events.forEach((ev) => {
      this.transforms.on(ev, (raw: any) => this.handleRawEvent(ev, raw));
    });
  }
  /**
   * 初始化键盘事件
   */
  private setupKeyDownEvent() {
    useEarth().useGlobalEvent().enableGlobalKeyDownEvent();
    this.keyDownFun = useEarth()
      .useGlobalEvent()
      .addKeyDownEventByGlobal((event) => {
        const key = event.key.toLowerCase();
        if (key === 'escape' && this.checkSelect) {
          let extent: any = this.checkSelect.getGeometry()?.getExtent();
          extent = extent ? useEarth().map.getPixelFromCoordinate([extent[0], extent[3]]) : [0, 0];
          // 退出编辑
          this.transforms.exitEdit(extent);
        }
        if (key === 'z' && event.ctrlKey && this.checkSelect) {
          // 回退
          this.undo();
          // 阻止默认行为，例如防止浏览器保存页面
          event.preventDefault();
        }
        if (key === 'y' && event.ctrlKey && this.checkSelect) {
          // 重做
          this.redo();
          // 阻止默认行为，例如防止浏览器保存页面
          event.preventDefault();
        }
        if (key === 'delete' && this.checkSelect) {
          let extent: any = this.checkSelect.getGeometry()?.getExtent();
          extent = extent ? useEarth().map.getPixelFromCoordinate([extent[0], extent[3]]) : [0, 0];
          // 删除
          this.handleRemoveEvent(extent);
          // 阻止默认行为，例如防止浏览器保存页面
          event.preventDefault();
        }
        if (key.toLowerCase() === 'c' && event.ctrlKey && this.checkSelect) {
          // 复制
          this.copyFeature = cloneDeep(this.checkSelect);
          // 设置标牌
          this.helpTooltipEl!.innerHTML = this.buildTransformBaseTooltip();
          // 阻止默认行为，例如防止浏览器保存页面
          event.preventDefault();
        }
        if (key.toLowerCase() === 'v' && event.ctrlKey && this.copyFeature) {
          // 粘贴
          if (this.checkSelect) {
            let extent: any = this.checkSelect.getGeometry()?.getExtent();
            extent = extent ? useEarth().map.getPixelFromCoordinate([extent[0], extent[3]]) : [0, 0];
            this.transforms.exitEdit(extent);
          }
          // 优先使用最近一次 pointermove 记录的像素
          let pixel: number[] | undefined = this.lastPointerPixel ? [...this.lastPointerPixel] : undefined;
          if (!pixel) {
            // 回退：使用地图中心像素
            try {
              const size = useEarth().map.getSize();
              if (size) pixel = [size[0] / 2, size[1] / 2];
            } catch (_) {
              pixel = [0, 0];
            }
          }
          if (pixel) this.handleCopyEvent(this.copyFeature, pixel);
          // 阻止默认行为，例如防止浏览器保存页面
          event.preventDefault();
        }
        if (key.toLowerCase() === 'x' && event.ctrlKey && this.checkSelect) {
          // 剪切
          this.copyFeature = cloneDeep(this.checkSelect);
          let extent: any = this.checkSelect.getGeometry()?.getExtent();
          extent = extent ? useEarth().map.getPixelFromCoordinate([extent[0], extent[3]]) : [0, 0];
          // 删除
          this.handleRemoveEvent(extent);
          // 设置鼠标默认样式
          useEarth().setMouseStyleToDefault();
          // 阻止默认行为，例如防止浏览器保存页面
          event.preventDefault();
        }
      });
  }

  /**
   * 监听 pointermove 记录最后的像素位置
   */
  private setupPointerTrack() {
    try {
      this.pointerMoveKey = useEarth().map.on('pointermove', (evt: any) => {
        if (evt && Array.isArray(evt.pixel)) {
          this.lastPointerPixel = evt.pixel.slice();
        }
      });
    } catch (_) {
      /* ignore */
    }
  }

  /**
   * 内部原子事件处理 + 组装回调参数 + 分发
   */
  private handleRawEvent(eventName: ETransfrom, e: any) {
    if (this.disposed) return; // 已销毁直接忽略事件
    let callbackParam: ITransformCallback | null = null;
    // 事件集合分类，避免多处重复判断
    const startEvents = new Set([ETransfrom.TranslateStart, ETransfrom.RotateStart, ETransfrom.ScaleStart]);
    const progressingEvents = new Set([ETransfrom.Translating, ETransfrom.Rotating, ETransfrom.Scaling]);
    const endEvents = new Set([ETransfrom.TranslateEnd, ETransfrom.RotateEnd, ETransfrom.ScaleEnd]);
    const modifyEvents = new Set([ETransfrom.ModifyStart, ETransfrom.Modifying, ETransfrom.ModifyEnd]);
    const otherEvents = new Set([ETransfrom.Undo, ETransfrom.Redo, ETransfrom.Remove, ETransfrom.Copy]);
    // 统一的 feature 参数构建（包含 feature / featurePosition / featureId 等）
    const buildFeatureParam = (): ITransformCallback => ({
      type: eventName,
      eventPosition: toLonLat(useEarth().map.getCoordinateFromPixel(e.pixel)),
      eventPixel: e.pixel,
      featureId: e.feature && e.feature.getId ? e.feature.getId() : '',
      featurePosition: e.feature && this.transformCoordinates(e.feature),
      feature: e.feature
    });
    if (eventName === ETransfrom.Select) {
      if (this.checkSelect) {
        // 已选中状态再次触发 select 则触发一次selectend
        callbackParam = {
          type: ETransfrom.SelectEnd,
          eventPosition: toLonLat(useEarth().map.getCoordinateFromPixel(e.pixel)),
          eventPixel: e.pixel
        };
        this.dispatchTransformEvent(eventName, callbackParam);
      }
      this.checkSelect = e.feature;
      this.checkLayer = this.getLayerByFeature(e.feature);
      this.removeHelpTooltip();
      this.initHelpTooltip(this.baseTransformTipFlag);
      // 进入选中周期，初始化历史记录
      this.resetHistory();
      this.recordSnapshot(e.feature); // 记录初始状态
      // 创建工具栏
      this.createToolbar(e);
      callbackParam = buildFeatureParam();
    } else if (eventName === ETransfrom.SelectEnd) {
      if (this.checkSelect) {
        callbackParam = {
          type: eventName,
          eventPosition: toLonLat(useEarth().map.getCoordinateFromPixel(e.pixel)),
          eventPixel: e.pixel,
          featureId: this.checkSelect && this.checkSelect.getId() ? this.checkSelect.getId()?.toString() : '',
          featurePosition: this.checkSelect && this.transformCoordinates(this.checkSelect),
          feature: this.checkSelect
        };
      }
      if (this.toolbar) {
        this.toolbar.destroy();
      }
      this.checkSelect = null;
      this.toolbar = null;
      this.checkLayer = null;
      this.removeHelpTooltip();
      this.clearHistory(); // 清空历史
    } else if (eventName === ETransfrom.EnterHandle) {
      if (!this.checkEnterHandle) {
        this.updateHelpTooltipByCursorType(e);
        callbackParam = {
          type: eventName,
          cursor: e.cursor,
          eventPixel: e.eventPixel
        };
        this.checkEnterHandle = true;
      }
    } else if (eventName === ETransfrom.LeaveHandle) {
      if (this.checkEnterHandle) {
        if (this.overlayKey) this.updateHelpTooltip(this.baseTransformTipFlag);
        else this.removeHelpTooltip();
        callbackParam = {
          type: eventName,
          cursor: e.cursor,
          eventPixel: e.eventPixel
        };
        this.checkEnterHandle = false;
      }
    } else if (startEvents.has(eventName)) {
      // Start 类事件
      this.handleEventStart(eventName, e);
      callbackParam = buildFeatureParam();
    } else if (progressingEvents.has(eventName)) {
      // 中间进行中事件
      if (eventName === ETransfrom.Translating) {
        this.updateHelpTooltip('平移中...');
      } else if (eventName === ETransfrom.Rotating) {
        this.updateHelpTooltip(`旋转中...当前：${Utils.rad2deg(-e.angle).toFixed(0)}°`);
      } else if (eventName === ETransfrom.Scaling) {
        this.updateHelpTooltip('缩放中...');
      }
      this.handleEventing(eventName, e);
      // 更新工具栏位置
      if (this.toolbar) {
        this.toolbar.updateOptions({ point: e.bboxExtent[0][2] });
      }
      callbackParam = buildFeatureParam();
    } else if (endEvents.has(eventName)) {
      // 结束事件
      this.updateHelpTooltipByCursorType(e);
      this.handleEventEnd(eventName, e);
      callbackParam = buildFeatureParam();
      // 每次结束一次原子操作时，记录一次快照（避免在进行中大量记录）
      if (e.feature) this.recordSnapshot(e.feature, eventName);
      // 更新工具栏undo/redo状态
      if (this.toolbar) {
        this.toolbar.updateItem('undo', { disabled: this.historyStack.length <= 1 });
        this.toolbar.updateItem('redo', { disabled: !this.redoStack.length });
      }
    } else if (modifyEvents.has(eventName)) {
      callbackParam = {
        type: eventName,
        eventPosition: toLonLat(useEarth().map.getCoordinateFromPixel(e.pixel)),
        eventPixel: e.pixel,
        featureId: e.feature && e.feature.getId ? e.feature.getId() : '',
        featurePosition: e.position ? e.position : this.transformCoordinates(e.feature),
        feature: e.feature,
        plotParam: e.plotParam
      };
    } else if (otherEvents.has(eventName)) {
      this.checkSelect = e.feature;
      callbackParam = {
        type: eventName,
        featureId: e.feature && e.feature.getId ? e.feature.getId() : '',
        featurePosition: e.feature && this.transformCoordinates(e.feature),
        feature: e.feature
      };
    }

    // 分发事件
    if (callbackParam) this.dispatchTransformEvent(eventName, callbackParam);
  }
  /**
   * 分发转换事件（包装错误处理，精简主流程）
   */
  private dispatchTransformEvent(eventName: ETransfrom, param: ITransformCallback) {
    const listeners = this.listenerMap.get(eventName);
    if (!listeners || !listeners.size) return;
    listeners.forEach((fn) => {
      try {
        fn(param);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[Transfrom:on] listener error:', err);
      }
    });
  }
  /**
   * 处理变换事件开始前的逻辑
   */
  private handleEventStart(eventName: ETransfrom, e: any) {
    const type = e.feature?.getGeometry()?.getType();
    const param = e.feature?.get('param');
    if (eventName === ETransfrom.TranslateStart || eventName === ETransfrom.ScaleStart) {
      if (type && param && this.checkLayer) {
        let layer;
        if (type == 'Point' || type == 'MultiPoint') {
          layer = this.checkLayer as PointLayer;
          if (param.isFlash) layer.stopFlash(e.feature.getId());
        }
        // 记录平移开始时的 plotPoints 快照（仅在存在 plotPoints 时）
        if (eventName === ETransfrom.TranslateStart && param?.plotPoints && Array.isArray(param.plotPoints) && param.plotPoints.length) {
          try {
            const geom = e.feature.getGeometry();
            let center: Coordinate | null = null;
            if (geom) {
              const gType = geom.getType?.();
              if (gType === 'Circle') center = (geom as any).getCenter();
              else if (typeof geom.getExtent === 'function') {
                const extent = geom.getExtent();
                if (extent && extent.length === 4) center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
              }
            }
            if (center) {
              this.translatePlotSnapshot = {
                featureId: String(e.feature.getId?.() || ''),
                basePlotPoints: (param.plotPoints as Coordinate[]).map((p: Coordinate) => [p[0], p[1]] as Coordinate),
                baseCenter: [center[0], center[1]] as Coordinate
              };
            }
          } catch (_) {
            this.translatePlotSnapshot = null;
          }
        }
      }
    }
  }
  /**
   * 处理变换事件进行中的逻辑
   */
  private handleEventing(eventName: ETransfrom, e: any) {
    // const type = e.feature?.getGeometry()?.getType();
    // const param = e.feature?.get('param');
    // 平移进行中：同步 plotPoints
    if (eventName === ETransfrom.Translating && this.translatePlotSnapshot && e.feature) {
      const snap = this.translatePlotSnapshot;
      const fid = e.feature.getId?.();
      if (fid && String(fid) === snap.featureId) {
        const param = e.feature.get('param');
        if (param?.plotPoints && Array.isArray(param.plotPoints)) {
          try {
            const geom = e.feature.getGeometry();
            let newCenter: Coordinate | null = null;
            if (geom) {
              const gType = geom.getType?.();
              if (gType === 'Circle') newCenter = (geom as any).getCenter();
              else if (typeof geom.getExtent === 'function') {
                const extent = geom.getExtent();
                if (extent && extent.length === 4) newCenter = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
              }
            }
            if (newCenter) {
              param.plotPoints = this.translatePlotPoints(snap.basePlotPoints, snap.baseCenter, newCenter);
              // 回写最新 param
              e.feature.set('param', param);
            }
          } catch (_) {
            /* ignore */
          }
        }
      }
    }
  }
  /**
   * 处理变换事件结束的逻辑
   */
  private handleEventEnd(eventName: ETransfrom, e: any) {
    const type = e.feature?.getGeometry()?.getType();
    const param = e.feature?.get('param');
    if (eventName === ETransfrom.TranslateEnd || eventName === ETransfrom.ScaleEnd) {
      if (type && param && this.checkLayer) {
        let layer;
        if (type == 'Point' || type == 'MultiPoint') {
          layer = this.checkLayer as PointLayer;
          if (param.isFlash) {
            layer.continueFlash(e.feature.getId());
          }
        }
        // 平移结束后清理 plotPoints 快照
        if (eventName === ETransfrom.TranslateEnd) {
          this.translatePlotSnapshot = null;
        }
      }
    }
  }
  /**
   * 根据起始中心与当前中心计算偏移并将 basePlotPoints 平移（处理 world wrap 最短距离）
   */
  private translatePlotPoints(basePlotPoints: Coordinate[], baseCenter: Coordinate, newCenter: Coordinate): Coordinate[] {
    if (!basePlotPoints || !basePlotPoints.length) return [];
    const map = useEarth().map;
    let worldWidth: number | undefined;
    let minX: number | undefined;
    let maxX: number | undefined;
    try {
      const extent = map.getView().getProjection().getExtent?.();
      if (extent) {
        worldWidth = extent[2] - extent[0];
        minX = extent[0];
        maxX = extent[2];
      }
    } catch (_) {
      /* ignore */
    }
    const shortestDeltaX = (from: number, to: number): number => {
      if (!worldWidth || !isFinite(worldWidth)) return to - from;
      let dx = to - from;
      if (dx > worldWidth / 2) dx -= worldWidth;
      else if (dx < -worldWidth / 2) dx += worldWidth;
      return dx;
    };
    const dx = shortestDeltaX(baseCenter[0], newCenter[0]);
    const dy = newCenter[1] - baseCenter[1];
    // 目标 world 索引（以 newCenter 为准）
    const targetWorld = worldWidth ? Utils.getWorldIndex(newCenter[0]) : undefined;
    return basePlotPoints.map((p) => {
      const nx = p[0] + dx;
      const ny = p[1] + dy;
      if (worldWidth && targetWorld !== undefined) {
        const curWorld = Utils.getWorldIndex(nx);
        if (curWorld !== undefined && curWorld !== targetWorld) {
          const dw = targetWorld - curWorld;
          return [nx + dw * worldWidth, ny] as Coordinate;
        }
      }
      return [nx, ny] as Coordinate;
    });
  }
  /**
   * 根据几何类型与坐标数组计算中心（复制时用于 plotPoints 平移）
   * 支持: Point / BillBoard 使用单点, Polygon/Polyline 使用包围盒中心, Circle 使用 center
   */
  private calcCenterByType(type: string, coords: any): Coordinate | null {
    try {
      if (!coords) return null;
      if (type === 'Point' || type === 'Billboard') {
        return coords as Coordinate;
      } else if (type === 'Circle') {
        // Circle 在复制逻辑里 baseCoords 即 center
        return coords as Coordinate;
      } else if (type === 'Polygon' || type === 'Polyline') {
        // 允许 positions 为 (Coordinate[]) 或包含洞的 (Coordinate[][]) 这里取第一层遍历
        const flat: Coordinate[] = Array.isArray(coords)
          ? Array.isArray(coords[0]) && typeof coords[0][0] !== 'number'
            ? (coords as Coordinate[][]).flat()
            : (coords as Coordinate[])
          : [];
        if (!flat.length) return null;
        let minX = flat[0][0];
        let maxX = flat[0][0];
        let minY = flat[0][1];
        let maxY = flat[0][1];
        for (let i = 1; i < flat.length; i++) {
          const [x, y] = flat[i];
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
        return [(minX + maxX) / 2, (minY + maxY) / 2];
      }
    } catch (_) {
      return null;
    }
    return null;
  }
  /**
   * 创建工具栏
   */
  private createToolbar(e: any) {
    if (this.toolbar) {
      this.toolbar.destroy();
    }
    const params = {
      point: e.bboxExtent[0][2],
      type: e.feature?.getGeometry()?.getType()
    };
    this.toolbar = new Toolbar(params);
    const toolbarRoot = document.querySelector('.ol-toolbar');
    toolbarRoot?.addEventListener('toolbar:itementer', (e: any) => {
      this.updateHelpTooltip(e.detail.item.title);
    });
    toolbarRoot?.addEventListener('toolbar:itemleave', (e: any) => {
      this.updateHelpTooltip(this.baseTransformTipFlag);
    });
    toolbarRoot?.addEventListener('toolbar:itemclick', (e: any) => {
      this.handleToolbarClick(e.detail, e.detail.pixel);
    });
  }
  /**
   * 处理工具栏按钮点击事件
   */
  private handleToolbarClick(detail: any, pixel: number[]) {
    const key = detail.key;
    const menuItem = detail.item as IToolbarItem;
    this.updateHelpTooltip(this.baseTransformTipFlag);
    if (key === 'undo') {
      this.undo();
    } else if (key === 'redo') {
      this.redo();
    } else if (key === 'exit') {
      this.transforms.exitEdit(pixel);
    } else if (key === 'remove') {
      this.handleRemoveEvent(pixel);
    } else if (key === 'copy') {
      // 注意：不能对 OpenLayers Feature 使用 lodash.cloneDeep，否则其原型方法(get/getGeometry等)会丢失，
      // 导致复制过程中无法获取几何与属性，出现“复制后元素不显示 / 不创建”的问题（尤其在跨屏或快速移动时更明显）。
      // 这里直接传入原始 Feature（方法内只读使用），避免破坏。
      this.copyFeature = cloneDeep(this.checkSelect);
      this.handleCopyEvent(this.copyFeature);
      this.transforms.exitEdit(pixel);
    } else if (key === 'edit') {
      // 开始要素编辑
      // 创建绘制工具
      const draw = new DynamicDraw(useEarth());
      // 获取元素类型
      const checkSelect = this.checkSelect;
      const geom = checkSelect?.getGeometry();
      const type = geom?.getType();
      this.handleRawEvent(ETransfrom.ModifyStart, { feature: checkSelect, pixel: pixel });
      if (type === 'Polygon') {
        const plotType = checkSelect?.get('param')?.plotType;
        if (plotType) {
          switch (plotType) {
            case 'attackArrow':
              draw.editAttackArrow({
                feature: checkSelect!,
                callback: (ev) => {
                  if (ev.type === ModifyType.Modifying) {
                    this.handleRawEvent(ETransfrom.Modifying, { feature: checkSelect, plotParam: ev.plotParam, pixel: pixel });
                  } else if (ev.type === ModifyType.Modifyexit) {
                    this.handleRawEvent(ETransfrom.ModifyEnd, { feature: checkSelect, plotParam: ev.plotParam, pixel: pixel });
                  }
                }
              });
              break;
            case 'tailedAttackArrow':
              draw.editTailedAttackArrow({
                feature: checkSelect!,
                callback: (ev) => {
                  if (ev.type === ModifyType.Modifying) {
                    this.handleRawEvent(ETransfrom.Modifying, { feature: checkSelect, plotParam: ev.plotParam, pixel: pixel });
                  } else if (ev.type === ModifyType.Modifyexit) {
                    this.handleRawEvent(ETransfrom.ModifyEnd, { feature: checkSelect, plotParam: ev.plotParam, pixel: pixel });
                  }
                }
              })
              break;
            case 'fineArrow':
              draw.editFineArrow({
                feature: checkSelect!,
                callback: (ev) => {
                  if (ev.type === ModifyType.Modifying) {
                    this.handleRawEvent(ETransfrom.Modifying, { feature: checkSelect, plotParam: ev.plotParam, pixel: pixel });
                  } else if (ev.type === ModifyType.Modifyexit) {
                    this.handleRawEvent(ETransfrom.ModifyEnd, { feature: checkSelect, plotParam: ev.plotParam, pixel: pixel });
                  }
                }
              })
              break;
            case 'tailedSquadCombatArrow':
              draw.editTailedSquadCombatArrow({
                feature: checkSelect!,
                callback: (ev) => {
                  if (ev.type === ModifyType.Modifying) {
                    this.handleRawEvent(ETransfrom.Modifying, { feature: checkSelect, plotParam: ev.plotParam, pixel: pixel });
                  } else if (ev.type === ModifyType.Modifyexit) {
                    this.handleRawEvent(ETransfrom.ModifyEnd, { feature: checkSelect, plotParam: ev.plotParam, pixel: pixel });
                  }
                }
              })
              break;
            case 'assaultDirectionArrow':
              draw.editAssaultDirectionArrow({
                feature: checkSelect!,
                callback: (ev) => {
                  if (ev.type === ModifyType.Modifying) {
                    this.handleRawEvent(ETransfrom.Modifying, { feature: checkSelect, plotParam: ev.plotParam, pixel: pixel });
                  } else if (ev.type === ModifyType.Modifyexit) {
                    this.handleRawEvent(ETransfrom.ModifyEnd, { feature: checkSelect, plotParam: ev.plotParam, pixel: pixel });
                  }
                }
              })
            case 'doubleArrow':
              draw.editDoubleArrow({
                feature: checkSelect!,
                callback: (ev) => {
                  if (ev.type === ModifyType.Modifying) {
                    this.handleRawEvent(ETransfrom.Modifying, { feature: checkSelect, plotParam: ev.plotParam, pixel: pixel });
                  } else if (ev.type === ModifyType.Modifyexit) {
                    this.handleRawEvent(ETransfrom.ModifyEnd, { feature: checkSelect, plotParam: ev.plotParam, pixel: pixel });
                  }
                }
              })
              break;
            case 'assemblePolygon':
              draw.editAssemblePolygon({
                feature: checkSelect!,
                callback: (ev) => {
                  if (ev.type === ModifyType.Modifying) {
                    this.handleRawEvent(ETransfrom.Modifying, { feature: checkSelect, plotParam: ev.plotParam, pixel: pixel });
                  } else if (ev.type === ModifyType.Modifyexit) {
                    this.handleRawEvent(ETransfrom.ModifyEnd, { feature: checkSelect, plotParam: ev.plotParam, pixel: pixel });
                  }
                }
              })
              break;
          }
        } else {
          draw.editPolygon({
            feature: checkSelect!,
            isShowUnderlay: true,
            callback: (ev) => {
              if (ev.type === ModifyType.Modifying) {
                const arr: Coordinate[] = [];
                for (const item of ev.position!) {
                  arr.push(fromLonLat(item as Coordinate));
                }
                this.handleRawEvent(ETransfrom.Modifying, { feature: checkSelect, position: arr, pixel: pixel });
              } else if (ev.type === ModifyType.Modifyexit) {
                draw.remove();
                this.handleRawEvent(ETransfrom.ModifyEnd, { feature: checkSelect, pixel: pixel });
              }
            }
          });
        }
      } else if (type === 'LineString') {
        draw.editPolyline({
          feature: checkSelect!,
          isShowUnderlay: true,
          callback: (ev) => {
            if (ev.type === ModifyType.Modifying) {
              const arr: Coordinate[] = [];
              for (const item of ev.position!) {
                arr.push(fromLonLat(item as Coordinate));
              }
              this.handleRawEvent(ETransfrom.Modifying, { feature: checkSelect, position: arr, pixel: pixel });
            } else if (ev.type === ModifyType.Modifyexit) {
              draw.remove();
              this.handleRawEvent(ETransfrom.ModifyEnd, { feature: checkSelect, pixel: pixel });
            }
          }
        });
      }
      // 退出编辑模式
      this.transforms.exitEdit(pixel);
    }
  }
  /**
   * 处理元素复制
   */
  private handleCopyEvent(feature: any, pixel?: number[]) {
    if (!feature) return;
    const type: string = feature.get('layerType');
    const originParam = cloneDeep(feature.get('param')) || {};
    const layer = this.getLayerByFeature(feature) as any;
    if (!layer) return;
    // 预取原始几何坐标，避免每帧读取 geometry
    const geom = feature.getGeometry();
    if (!geom) return;
    const baseCoords = type === 'Circle' ? (geom as any).getCenter() : (geom as any).getCoordinates ? (geom as any).getCoordinates() : null;
    if (!baseCoords) return;
    // 复制开始前记录 plotPoints 与 baseCenter 快照（供后续平移使用）
    const basePlotPoints: Coordinate[] | undefined = Array.isArray(originParam.plotPoints)
      ? originParam.plotPoints.map((p: Coordinate) => [p[0], p[1]] as Coordinate)
      : undefined;
    const baseCenter: Coordinate | null = this.calcCenterByType(type, baseCoords);
    // 节流（约 60fps -> wait ~16ms）
    const moveHandler = Utils.throttle(
      (evt: { pixel: number[] }) => {
        this.updateHelpTooltip('点击地图完成复制,右键地图退出复制');
        let newValue: any = null;
        if (type === 'Point' || type === 'Billboard') {
          newValue = Utils.getFeatureToPixel(evt.pixel, baseCoords);
          originParam.center = newValue;
        } else if (type === 'Polygon' || type === 'Polyline') {
          newValue = Utils.getFeatureToPixel(evt.pixel, baseCoords);
          originParam.positions = newValue;
        } else if (type === 'Circle') {
          newValue = Utils.getFeatureToPixel(evt.pixel, baseCoords);
          originParam.center = newValue; // center
        }
        // 平移过程中同步 plotPoints（若存在）
        if (basePlotPoints && basePlotPoints.length && baseCenter) {
          const newCenter = this.calcCenterByType(type, newValue);
          if (newCenter) {
            originParam.plotPoints = this.translatePlotPoints(basePlotPoints, baseCenter, newCenter);
          }
        }
        if (!this.copyStatus) {
          originParam.id = Utils.GetGUID();
          // 初次创建：add 一次
          layer.add(originParam);
          this.copyStatus = { id: originParam.id };
        } else if (originParam.id) {
          // 更新位置（优先 center 否则 positions）
          layer.setPosition?.(originParam.id, originParam.center || originParam.positions);
        }
      },
      16,
      { leading: true, trailing: true }
    );
    if (!pixel) {
      // 启用全局鼠标移动
      useEarth().useGlobalEvent().enableGlobalMouseMoveEvent();
      useEarth()
        .useGlobalEvent()
        .addMouseMoveEventByGlobal((event) => moveHandler(event));

      useEarth()
        .useGlobalEvent()
        .addMouseOnceClickEventByGlobal((event) => {
          // 确定复制要素
          if (useEarth().useGlobalEvent().hasGlobalMouseMoveEvent()) {
            useEarth().useGlobalEvent().disableGlobalMouseMoveEvent();
            moveHandler.flush?.();
            this.copyStatus = null;
            // 触发copy事件通知外部
            this.handleRawEvent(ETransfrom.Copy, { feature: layer.get(originParam.id) ? layer.get(originParam.id)[0] : null, pixel: event.pixel });
            this.removeHelpTooltip();
          }
        });
      useEarth()
        .useGlobalEvent()
        .addMouseOnceRightClickEventByGlobal((event) => {
          // 取消复制要输
          if (useEarth().useGlobalEvent().hasGlobalMouseMoveEvent()) {
            useEarth().useGlobalEvent().disableGlobalMouseMoveEvent();
            moveHandler.cancel?.();
            layer.remove(this.copyStatus?.id);
            this.copyStatus = null;
          }
        });
    } else {
      const newValue = Utils.getFeatureToPixel(pixel, baseCoords);
      if (type === 'Point' || type === 'Billboard') {
        originParam.center = newValue;
      } else if (type === 'Polygon' || type === 'Polyline') {
        originParam.positions = newValue;
      } else if (type === 'Circle') {
        originParam.center = newValue; // center
      }
      // 直接粘贴（一次性）也需要同步 plotPoints
      if (basePlotPoints && basePlotPoints.length && baseCenter) {
        const newCenter = this.calcCenterByType(type, newValue);
        if (newCenter) {
          originParam.plotPoints = this.translatePlotPoints(basePlotPoints, baseCenter, newCenter);
        }
      }
      originParam.id = Utils.GetGUID();
      // 初次创建：add 一次
      layer.add(originParam);
      // 触发copy事件通知外部
      this.handleRawEvent(ETransfrom.Copy, { feature: layer.get(originParam.id) ? layer.get(originParam.id)[0] : null, pixel: pixel });
    }
  }
  /**
   * 处理删除事件
   */
  private handleRemoveEvent(pixel: number[]) {
    if (this.checkSelect && this.checkLayer) {
      this.checkLayer.remove(this.checkSelect.getId() as string);
      this.handleRawEvent(ETransfrom.Remove, { feature: cloneDeep(this.checkSelect) });
      this.transforms.exitEdit(pixel);
    }
  }
  /**
   * 记录当前要素几何快照
   */
  private recordSnapshot(feature?: Feature, eventName?: ETransfrom) {
    if (!feature) return;
    const id = feature.getId?.();
    if (!id) return;
    // 创建要素深拷贝（clone 不会保留 id，需要手动设置）
    const featureClone = feature.clone();
    featureClone.set('param', cloneDeep(feature.get('param')));
    featureClone.setId(id);
    // 记录样式（用于点要素缩放/旋转等仅样式变化的撤销恢复）
    try {
      const style: any = feature.getStyle?.();
      if (style) {
        // 如果 style 存在 clone 方法则克隆，否则直接引用（大多数 OL 内置 Style 有 clone）
        const styleClone = style.clone ? style.clone() : style;
        featureClone.set('styleSnapshot', styleClone);
        // 对 Point：若 param.size 缺失，补齐当前半径（避免初始 size 未写入导致撤销无法恢复）
        const geomType = feature.getGeometry()?.getType();
        if (geomType === 'Point' || geomType === 'MultiPoint') {
          const paramClone: any = featureClone.get('param');
          if (paramClone && paramClone.size == null) {
            const image = style.getImage?.();
            if (image) {
              // Circle / RegularShape 半径
              if (typeof image.getRadius === 'function') {
                const r = image.getRadius();
                if (r != null) paramClone.size = r;
              } else if (typeof image.getScale === 'function') {
                const sc: any = image.getScale();
                if (typeof sc === 'number') paramClone.size = sc; // 退化：无半径，使用缩放值记录
              }
              featureClone.set('param', paramClone);
            }
          }
        }
      }
    } catch (_) {
      /* 忽略样式克隆失败 */
    }
    // 如果与最近一次快照几何一致则跳过
    const last = this.historyStack[this.historyStack.length - 1];
    if (last) {
      const lastGeom = last.feature.getGeometry();
      const currentGeom = featureClone.getGeometry();
      if (lastGeom && currentGeom) {
        const same = this.compareGeometry(lastGeom, currentGeom);
        if (same) {
          const geomType = currentGeom.getType?.();
          const isPointLike = geomType === 'Point' || geomType === 'MultiPoint';
          const isCircle = geomType === 'Circle';
          const isScaleOrRotateEnd = eventName === ETransfrom.ScaleEnd || eventName === ETransfrom.RotateEnd;
          // 对 Point / Circle 的缩放或旋转操作，即使几何坐标未变化，也需要记录（样式 / 半径 / 旋转等可能变化）
          if (!(isScaleOrRotateEnd && (isPointLike || isCircle))) {
            return; // 其他类型或情况保持原逻辑：坐标未变不入栈
          }
        }
      }
    }
    // 控制栈长度
    const limit = this.options.historyLimit ?? this.defaultParams.historyLimit ?? 10;
    this.historyStack.push({ id: String(id), feature: featureClone });
    if (this.historyStack.length > limit) {
      this.historyStack.shift();
    }
    // 新的操作产生后，清空 redo 栈
    this.redoStack = [];
    this.hasRecordedInitial = true;
    this.refreshBaseTransformTooltipIfNeeded();
  }
  /**
   * 重置（Select 开始时）
   */
  private resetHistory() {
    this.historyStack = [];
    this.redoStack = [];
    this.hasRecordedInitial = false;
  }
  /**
   * SelectEnd 时清空
   */
  private clearHistory() {
    this.resetHistory();
  }
  /**
   * 撤销
   */
  public undo() {
    if (this.historyStack.length <= 1) return null; // 至少保留初始状态
    const current = this.historyStack.pop();
    if (!current) return null;
    this.redoStack.push(current);
    const previous = this.historyStack[this.historyStack.length - 1];
    const feature = this.applySnapshot(previous);
    if (feature) {
      this.handleRawEvent(ETransfrom.Undo, { feature });
    }
    this.refreshBaseTransformTooltipIfNeeded();
  }
  /**
   * 重做
   */
  public redo() {
    if (!this.redoStack.length) return null;
    const snapshot = this.redoStack.pop();
    if (!snapshot) return null;
    // 当前状态（应用前）入历史
    const currentFeature = this.getFeatureById(snapshot.id);
    if (currentFeature) {
      const currentClone = currentFeature.clone();
      currentClone.setId(snapshot.id);
      this.historyStack.push({ id: snapshot.id, feature: currentClone });
    }
    const feature = this.applySnapshot(snapshot);
    if (feature) {
      this.handleRawEvent(ETransfrom.Redo, { feature });
    }
    this.refreshBaseTransformTooltipIfNeeded();
  }
  /**
   * 根据 id 获取要素
   */
  private getFeatureById(id: string): Feature | null {
    if (!id) return null;
    // 遍历地图图层（只针对 vector 图层）
    // 由于项目已有 useEarth().getLayer(id) 机制，优先尝试当前选中图层
    if (this.checkLayer) {
      const source: any = (this.checkLayer as any).source || (this.checkLayer as any).getSource?.();
      if (source?.getFeatureById) {
        const f = source.getFeatureById(id);
        if (f) return f;
      }
    }
    // 兜底：遍历 transformFeatures 配置
    const features = this.options.transformFeatures;
    if (features && features.length) {
      const f = features.find((ft) => ft.getId?.() == id);
      if (f) return f;
    }
    return null;
  }
  /**
   * 应用一个快照到对应要素
   */
  private applySnapshot(snapshot?: { id: string; feature: Feature }): Feature | null {
    if (!snapshot || !snapshot.feature) return null;
    const geomSnap = snapshot.feature.getGeometry?.();
    if (!geomSnap) return null;
    const { coords } = this.extractGeometryInfo(geomSnap);
    const type = snapshot.feature.get('layerType');
    const param = snapshot.feature.get('param');
    if (param && coords && type && this.checkLayer) {
      // 根据具体几何类型安全设置坐标
      let layer;
      if (type == 'Point') {
        layer = this.checkLayer as PointLayer;
        // 还原点的属性（包括缩放、旋转等 style 信息存放在 param 中）
        layer?.set(param);
        // 如果存在几何坐标（极少数情况下）也尝试同步（某些实现 set 不会更新坐标）
        if (coords && Array.isArray(coords) && typeof (coords as any)[0] === 'number') {
          try {
            (layer as any).setPosition?.(param.id, coords);
          } catch (_) {
            /* ignore */
          }
        }
        // 恢复样式快照（点缩放/旋转时几何不变，仅样式变化，需要强制）
        const styleSnapshot = snapshot.feature.get('styleSnapshot');
        if (styleSnapshot && param?.id) {
          const current = this.getFeatureById(param.id);
          if (current) {
            try {
              current.setStyle(styleSnapshot);
            } catch (_) {
              /* ignore */
            }
            // 兜底：若快照图像半径/scale 与现有 param 不一致，再次同步
            try {
              const snapImg: any = styleSnapshot.getImage?.();
              const curStyle: any = current.getStyle?.();
              const curImg = curStyle?.getImage?.();
              if (snapImg && curImg) {
                if (typeof snapImg.getRadius === 'function' && typeof curImg.setRadius === 'function') {
                  const r = snapImg.getRadius?.();
                  if (r != null) curImg.setRadius(r);
                } else if (typeof snapImg.getScale === 'function' && typeof curImg.setScale === 'function') {
                  const sc = snapImg.getScale();
                  if (sc) curImg.setScale(sc);
                }
              }
            } catch (_) {
              /* ignore */
            }
            current.changed();
          }
        }
        // 重绘变换控制框
        // 安全调用内部私有方法（未来版本可能移除）
        try {
          if (this.transforms && typeof this.transforms.drawSketch_ === 'function') {
            this.transforms.drawSketch_();
          } else if (this.transforms && typeof this.transforms.drawSketch === 'function') {
            this.transforms.drawSketch();
          }
        } catch (_) {
          /* 忽略内部刷新失败 */
        }
      } else if (type == 'Polygon') {
        layer = this.checkLayer as PolygonLayer;
        layer?.setPosition(param.id, coords);
      } else if (type == 'Polyline') {
        layer = this.checkLayer as PolylineLayer;
        layer?.setPosition(param.id, coords);
      } else if (type == 'Circle') {
        layer = this.checkLayer as CircleLayer;
        layer?.set(param);
      } else if (type == 'Billboard') {
        layer = this.checkLayer as BillboardLayer;
        // Billboard 的 size 应该是 [width,height]，如果被误写成 number（可能与 Point 混淆）则丢弃让 set 使用旧值
        if (param.size && !Array.isArray(param.size)) {
          delete (param as any).size;
        }
        // anchor 缺失时使用默认 [0.5,0.5]，避免回退时出现错误像素锚点
        if (param.anchor == null) {
          (param as any).anchor = [0.5, 0.5];
        } else if (Array.isArray(param.anchor) && param.anchor.length === 2) {
          // 过滤掉出现异常大值（例如 128,128 误作为像素锚点传入），这里做一个启发式：如果两值都大于 10 认为可能是像素值而非 fraction，转为 fraction
          const [ax, ay] = param.anchor as number[];
          if (ax > 10 && ay > 10) {
            // 不知道原始尺寸时无法精确转换，直接回落默认
            (param as any).anchor = [0.5, 0.5];
          }
        }
        // rotation 若缺失且样式快照里存在则回填
        if (param.rotation == null && (snapshot.feature as any).get('styleSnapshot')) {
          try {
            const sty: any = (snapshot.feature as any).get('styleSnapshot');
            const img = sty?.getImage?.();
            const rot = img?.getRotation?.();
            if (typeof rot === 'number') {
              param.rotation = Utils.rad2deg(rot);
            }
          } catch (_) {
            /* ignore */
          }
        }
        layer?.set(param);
      }
      if (this.toolbar) {
        // 更新工具栏undo/redo状态
        this.toolbar.updateItem('undo', { disabled: this.historyStack.length <= 1 });
        this.toolbar.updateItem('redo', { disabled: !this.redoStack.length });
        // 更新工具栏位置
        if (this.transforms && this.transforms.bbox_) {
          const bboxExtent = this.transforms.bbox_?.getGeometry().getCoordinates();
          this.toolbar.updateOptions({ point: bboxExtent[0][2] });
        }
      }
      return snapshot.feature;
    } else {
      return null;
    }
  }
  /**
   * 比较两个几何是否坐标一致（仅处理常见类型 Point/LineString/Polygon，多类型可扩展）
   */
  private compareGeometry(a: any, b: any): boolean {
    const at = a?.getType?.();
    const bt = b?.getType?.();
    if (at !== bt) return false;
    const ac = this.extractGeometryInfo(a).coords;
    const bc = this.extractGeometryInfo(b).coords;
    return this.compareCoords(ac, bc);
  }
  /**
   * 递归比较坐标数组（避免 JSON.stringify 造成性能与顺序敏感问题）
   */
  private compareCoords(a: any, b: any): boolean {
    if (a === b) return true;
    if (!a || !b) return false;
    const aIsArr = Array.isArray(a);
    const bIsArr = Array.isArray(b);
    if (aIsArr !== bIsArr) return false;
    if (!aIsArr) {
      // 数字比较：允许极小浮点误差
      if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-9;
      return a === b;
    }
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!this.compareCoords(a[i], b[i])) return false;
    }
    return true;
  }
  /**
   * 提取几何的类型与坐标（安全）
   */
  private extractGeometryInfo(geom: any): { type: string | undefined; coords: any } {
    const type = geom?.getType?.();
    let coords: any = undefined;
    try {
      if (
        geom instanceof Point ||
        geom instanceof LineString ||
        geom instanceof Polygon ||
        geom instanceof MultiPoint ||
        geom instanceof MultiLineString ||
        geom instanceof MultiPolygon
      ) {
        coords = geom.getCoordinates();
      } else if (geom instanceof CircleGeom) {
        // Circle 使用中心点 & 半径
        coords = { center: geom.getCenter(), radius: geom.getRadius() };
      } else if (geom?.getCoordinates) {
        coords = geom.getCoordinates();
      }
    } catch (_) {
      coords = undefined;
    }
    return { type, coords };
  }
  /**
   * 根据要素安全获取所属图层
   * 说明：
   *  - 避免多层 if 嵌套
   *  - 统一空值与类型保护
   *  - 返回 null 表示未找到
   */
  private getLayerByFeature(feature?: Feature | null): Base | null {
    if (!feature) return null;
    // 兼容性：某些要素可能不存在 get 方法或未附加属性
    const layerId = feature.get && feature.get('layerId');
    if (!layerId) return null;
    const layer = useEarth().getLayer(layerId);
    return (layer as Base) || null;
  }
  /**
   * 提示牌初始化方法
   */
  private initHelpTooltip(str: string) {
    if (typeof document === 'undefined') return; // SSR 安全
    if (!this.helpTooltipEl) {
      this.helpTooltipEl = document.createElement('div');
      this.helpTooltipEl.className = 'ol-tooltip';
      document.body.appendChild(this.helpTooltipEl);
    }
    if (str === this.baseTransformTipFlag) {
      this.helpTooltipEl.innerHTML = this.buildTransformBaseTooltip();
    } else {
      this.helpTooltipEl.textContent = str;
    }
    // 初次添加 overlay
    if (!this.overlayKey) {
      this.overlay.add({
        id: 'help_tooltip',
        position: useEarth().map.getCoordinateFromPixel([0, -100]),
        element: this.helpTooltipEl,
        offset: [15, -11]
      });
      this.overlayKey = useEarth().map.on('pointermove', (evt) => {
        this.overlay.setPosition('help_tooltip', evt.coordinate);
      });
    } else {
      this.overlay.set({ id: 'help_tooltip', element: this.helpTooltipEl });
    }
  }
  /**
   * 更新提示牌
   */
  private updateHelpTooltip(str: string, pixel?: number[]) {
    if (!this.overlayKey || !this.helpTooltipEl) return;
    if (str === this.baseTransformTipFlag) {
      this.helpTooltipEl.innerHTML = this.buildTransformBaseTooltip();
    } else {
      this.helpTooltipEl.textContent = str;
    }
    const params: ISetOverlayParam = { id: 'help_tooltip', element: this.helpTooltipEl };
    if (pixel) params['position'] = useEarth().map.getCoordinateFromPixel(pixel);
    this.overlay.set(params);
  }
  /**
   * 删除提示牌
   */
  private removeHelpTooltip() {
    if (this.overlayKey) {
      this.overlay.remove('help_tooltip');
      unByKey(this.overlayKey);
      this.overlayKey = undefined;
      if (this.helpTooltipEl && this.helpTooltipEl.parentNode) {
        this.helpTooltipEl.parentNode.removeChild(this.helpTooltipEl);
      }
      this.helpTooltipEl = null;
    }
  }
  /**
   * 转换坐标系
   */
  // 返回值包含多种几何（含 MultiPolygon 可能的 4 级嵌套 & Circle 特殊 center）
  private transformCoordinates(feature: Feature): any {
    const geometry = feature.getGeometry();
    const type = geometry?.getType();
    let coordinates: any = [];
    if (
      geometry instanceof Point ||
      geometry instanceof LineString ||
      geometry instanceof Polygon ||
      geometry instanceof MultiPoint ||
      geometry instanceof MultiLineString ||
      geometry instanceof MultiPolygon
    ) {
      coordinates = geometry.getCoordinates();
    } else if (geometry instanceof CircleGeom) {
      coordinates = geometry.getCenter();
    }
    if (type == 'Point' || type == 'MultiPoint') {
      coordinates = toLonLat(coordinates as Coordinate);
    } else if (type == 'Polygon' || type == 'MultiPolygon') {
      coordinates = (coordinates as Coordinate[][]).map((item: Coordinate[]) => {
        item = item.map((items: Coordinate) => {
          items = toLonLat(items);
          return items;
        });
        return item;
      });
    } else if (type == 'LineString' || type == 'MultiLineString') {
      coordinates = (coordinates as Coordinate[]).map((item: Coordinate) => {
        item = toLonLat(item);
        return item;
      });
    }
    return coordinates;
  }

  /** 构建基础提示：包含快捷键以及当前可撤销/重做次数 */
  private buildTransformBaseTooltip(): string {
    const undoCount = Math.max(0, this.historyStack.length - 1); // 初始快照不计入
    const redoCount = this.redoStack.length;
    const canPaste = !!this.copyFeature;
    const keySpan = (combo: string, label: string, color?: string, disabled?: boolean, extraDesc?: string): string => {
      const style: string[] = [];
      if (color) style.push(`color:${color}`);
      if (disabled) style.push('opacity:0.5');
      const desc = extraDesc ? `${label}${extraDesc}` : label;
      return `<span style="${style.join(';')}">${combo} ${desc}</span>`;
    };
    const baseItems: string[] = [
      keySpan('Ctrl+C', '复制', '#fff'),
      keySpan('Ctrl+V', '粘贴', canPaste ? '#fff' : '#999'),
      keySpan('Ctrl+X', '剪切', '#fff'),
      keySpan('Del', '删除', '#d9363fff'),
      keySpan('Esc', '退出', '#fc972bff')
    ];
    const staticLine = `${this.baseTransformTipFlag}<br/> ${baseItems.join(' | ')}`;
    const dyn: string[] = [];
    if (undoCount > 0) dyn.push(`<span style="color:#ff9800; font-weight: bold;">Ctrl+Z 撤销 (${undoCount})</span>`);
    if (redoCount > 0) dyn.push(`<span style="color:#00bfa5; font-weight: bold;">Ctrl+Y 重做 (${redoCount})</span>`);
    if (!dyn.length) return staticLine;
    return staticLine + '<br/>' + dyn.join(' | ');
  }
  /** 当当前显示基础提示时刷新撤销/重做计数 */
  private refreshBaseTransformTooltipIfNeeded() {
    if (!this.helpTooltipEl) return;
    const txt = this.helpTooltipEl.textContent || '';
    if (txt.startsWith(this.baseTransformTipFlag)) {
      this.updateHelpTooltip(this.baseTransformTipFlag);
    }
  }

  /**
   * 根据鼠标事件类型，更新标牌文本
   */
  private updateHelpTooltipByCursorType(e: ITransformCallback) {
    if (typeof window === 'undefined') return;
    const mapElement = useEarth().map.getTargetElement();
    if (!mapElement) return;
    const cursor = window.getComputedStyle(mapElement).cursor as ECursor;
    switch (cursor) {
      case ECursor.Move:
        this.updateHelpTooltip('鼠标左键按下平移', e.eventPixel);
        break;
      case ECursor.Pointer:
        if (this.options.translateType == ETranslateType.Feature || this.defaultParams.translateType == ETranslateType.Feature) {
          this.updateHelpTooltip('鼠标左键按下平移');
        } else {
          this.updateHelpTooltip(this.baseTransformTipFlag);
        }
        break;
      case ECursor.Grab:
        this.updateHelpTooltip('鼠标左键按下旋转', e.eventPixel);
        break;
      case ECursor.NsResize:
      case ECursor.EwResize: {
        const type = this.checkSelect?.getGeometry()?.getType();
        let str = '鼠标左键按下拉伸，Ctrl键以基准点拉伸';
        if (type == 'Point' || type == 'MultiPoint' || type == 'Circle') str = '鼠标左键按下拉伸';
        this.updateHelpTooltip(str, e.eventPixel);
        break;
      }
      case ECursor.NeswResize:
      case ECursor.NwseResize: {
        const type = this.checkSelect?.getGeometry()?.getType();
        let str = '鼠标左键按下缩放，Shift键保持比例缩放';
        if (type == 'Point' || type == 'MultiPoint' || type == 'Circle') {
          const style = <Style>this.checkSelect?.getStyle();
          const image = style?.getImage?.();
          if (style && image && !(image instanceof Icon)) str = '鼠标左键按下缩放';
        }
        this.updateHelpTooltip(str, e.eventPixel);
        break;
      }
      default:
        // 其它光标：保持或还原默认提示
        this.updateHelpTooltip(this.baseTransformTipFlag);
    }
  }
  /**
   * 注册外部事件监听（内部逻辑已统一处理）
   */
  public on(eventName: ETransfrom | ETransfrom[], callback: (e: ITransformCallback) => void): this {
    const events = Array.isArray(eventName) ? eventName : [eventName];
    events.forEach((ev) => {
      if (!Object.values(ETransfrom).includes(ev)) {
        throw new Error('事件类型错误');
      }
      if (!this.listenerMap.has(ev)) {
        this.listenerMap.set(ev, new Set());
      }
      this.listenerMap.get(ev)?.add(callback);
    });
    return this;
  }

  /**
   * 取消监听
   */
  public off(eventName: ETransfrom, callback?: (e: ITransformCallback) => void): this {
    const set = this.listenerMap.get(eventName);
    if (!set) return this;
    if (callback) {
      set.delete(callback);
    } else {
      set.clear();
    }
    return this;
  }
  /**
   * 移除变换实例
   */
  public remove(): boolean {
    if (this.disposed) return false;
    const interaction = useEarth().map.removeInteraction(this.transforms);
    return interaction ? true : false;
  }

  /**
   * 完整销毁，清理所有引用（供外部主动释放）
   */
  public destroy(): void {
    if (this.disposed) return;
    useEarth().setMouseStyleToDefault();
    useEarth().useGlobalEvent().disableGlobalKeyDownEvent();
    this.remove();
    this.removeHelpTooltip();
    this.listenerMap.forEach((set) => set.clear());
    this.listenerMap.clear();
    this.keyDownFun && this.keyDownFun();
    this.toolbar && this.toolbar.destroy();
    this.keyDownFun = undefined;
    this.toolbar = null;
    this.checkSelect = null;
    this.checkLayer = null;
    this.disposed = true;
    this.historyStack = [];
    this.redoStack = [];
    this.copyStatus = null;
    this.copyFeature = null;
    if (this.pointerMoveKey) {
      unByKey(this.pointerMoveKey);
      this.pointerMoveKey = undefined;
    }
  }
}
