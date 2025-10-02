/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import TransformInteraction from './Transform/Transform';
import { useEarth } from '../useEarth';
import { ISetOverlayParam, ITransformCallback, ITransfromParams } from '../interface';
import { ECursor, ETransfrom, ETranslateType } from '../enum';
import { Feature } from 'ol';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import { LineString, Point, Polygon } from 'ol/geom';
import { Base, OverlayLayer, PointLayer, PolygonLayer } from '../base';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import { Icon, Style } from 'ol/style';
import { feature } from '@turf/turf';

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
  private checkLayer: Base | null = null;
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
    rotate: true
  };
  /**
   * 外部监听器缓存
   */
  private listenerMap: Map<ETransfrom, Set<(e: ITransformCallback) => void>> = new Map();

  constructor(options: ITransfromParams) {
    this.options = options;
    this.overlay = new OverlayLayer(useEarth());
    this.transforms = this.createTransform();
    // 初始化统一事件管线（内部数据处理 + 外部监听分发）
    this.setupEventPipeline();
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
      ETransfrom.TranslateEnd
    ];
    events.forEach((ev) => {
      this.transforms.on(ev, (raw: any) => this.handleRawEvent(ev, raw));
    });
  }

  /**
   * 内部原子事件处理 + 组装回调参数 + 分发
   */
  private handleRawEvent(eventName: ETransfrom, e: any) {
    let callbackParam: ITransformCallback | null = null;
    switch (eventName) {
      // 选中
      case ETransfrom.Select: {
        // 内部数据处理
        this.checkSelect = e.feature;
        // 获取图层（抽取辅助方法，避免嵌套判断）
        this.checkLayer = this.getLayerByFeature(e.feature);
        this.removeHelpTooltip();
        this.initHelpTooltip('选择控制点进行变换操作');
        // 外部参数
        callbackParam = {
          type: eventName,
          eventPosition: toLonLat(useEarth().map.getCoordinateFromPixel(e.pixel)),
          eventPixel: e.pixel,
          featureId: e.feature && e.feature.getId ? e.feature.getId() : '',
          featurePosition: e.feature && this.transformCoordinates(e.feature),
          feature: e.feature
        };
        break;
      }
      // 退出选中
      case ETransfrom.SelectEnd: {
        // 只有存在选中时才派发（修复之前因内部优先清空导致外部收不到的问题）
        if (this.checkSelect) {
          callbackParam = {
            type: eventName,
            eventPosition: toLonLat(useEarth().map.getCoordinateFromPixel(e.pixel)),
            eventPixel: e.pixel
          };
        }
        // 清理状态（放在派发之后）
        this.checkSelect = null;
        this.checkLayer = null;
        this.removeHelpTooltip();
        break;
      }
      // 进入变换点
      case ETransfrom.EnterHandle: {
        if (!this.checkEnterHandle) {
          // 内部：更新提示
          this.updateHelpTooltipByCursorType(e);
          callbackParam = {
            type: eventName,
            cursor: e.cursor,
            eventPixel: e.eventPixel
          };
          this.checkEnterHandle = true;
        }
        break;
      }
      // 离开变换点
      case ETransfrom.LeaveHandle: {
        if (this.checkEnterHandle) {
          if (this.overlayKey) {
            this.updateHelpTooltip('选择控制点进行变换操作');
          } else {
            this.removeHelpTooltip();
          }
          callbackParam = {
            type: eventName,
            cursor: e.cursor,
            eventPixel: e.eventPixel
          };
          this.checkEnterHandle = false;
        }
        break;
      }
      // 开始平移
      case ETransfrom.TranslateStart: {
        // 根据feature类型更新要素参数，并针对特殊要素（动态点、箭头线等）做特殊处理
        this.handleTranslateStart(e);
        // 外部参数
        callbackParam = {
          type: eventName,
          eventPosition: toLonLat(useEarth().map.getCoordinateFromPixel(e.pixel)),
          eventPixel: e.pixel,
          featureId: e.feature && e.feature.getId ? e.feature.getId() : '',
          featurePosition: e.feature && this.transformCoordinates(e.feature),
          feature: e.feature
        };
        break;
      }
      // 平移中
      case ETransfrom.Translating: {
        // 更新提示标牌
        this.updateHelpTooltip('平移中...');
        // 根据feature类型更新要素参数，并针对特殊要素（动态点、箭头线等）做特殊处理
        e = this.handleTranslating(e);
        // 外部参数
        callbackParam = {
          type: eventName,
          eventPosition: toLonLat(useEarth().map.getCoordinateFromPixel(e.pixel)),
          eventPixel: e.pixel,
          featureId: e.feature && e.feature.getId ? e.feature.getId() : '',
          featurePosition: e.feature && this.transformCoordinates(e.feature),
          feature: e.feature
        };
        break;
      }
      // 结束平移
      case ETransfrom.TranslateEnd: {
        this.updateHelpTooltipByCursorType(e);
        // 根据feature类型更新要素参数，并针对特殊要素（动态点、箭头线等）做特殊处理
        e = this.handleTranslateEnd(e);
        // 外部参数
        callbackParam = {
          type: eventName,
          eventPosition: toLonLat(useEarth().map.getCoordinateFromPixel(e.pixel)),
          eventPixel: e.pixel,
          featureId: e.feature && e.feature.getId ? e.feature.getId() : '',
          featurePosition: e.feature && this.transformCoordinates(e.feature),
          feature: e.feature
        };
        break;
      }
      default:
        break;
    }
    if (callbackParam) {
      const listeners = this.listenerMap.get(eventName);
      if (listeners && listeners.size) {
        listeners.forEach((fn) => {
          try {
            fn(callbackParam as ITransformCallback);
          } catch (err) {
            // 单个监听异常不影响其它
            // eslint-disable-next-line no-console
            console.error('[Transfrom:on] listener error:', err);
          }
        });
      }
    }
  }
  /**
   * 处理平移前的逻辑
   */
  private handleTranslateStart(e: any) {
    const type = e.feature?.getGeometry()?.getType();
    const param = e.feature?.get('param');
    if (type && param && this.checkLayer) {
      let layer;
      if (type == 'Point' || type == 'MultiPoint') {
        layer = this.checkLayer as PointLayer;
        if (param.isFlash) layer.stopFlash(e.feature.getId());
      }
    }
  }
  /**
   * 处理平移中的逻辑
   */
  private handleTranslating(e: any) {
    const type = e.feature?.getGeometry()?.getType();
    const param = e.feature?.get('param');
    if (type && param && this.checkLayer) {
      let layer;
      if (type == 'Point' || type == 'MultiPoint') {
        const center = e.feature.getGeometry()?.getCoordinates();
        param.center = center;
        e.feature.set('param', param);
      }
    }
    return e;
  }
  /**
   * 处理平移结束的逻辑
   */
  private handleTranslateEnd(e: any) {
    const type = e.feature?.getGeometry()?.getType();
    const param = e.feature?.get('param');
    if (type && param && this.checkLayer) {
      let layer;
      if (type == 'Point' || type == 'MultiPoint') {
        layer = this.checkLayer as PointLayer;
        const center = e.feature.getGeometry()?.getCoordinates();
        param.center = center;
        e.feature.set('param', param);
        if (param.isFlash) {
          layer.setPosition(e.feature.getId(), e.feature.getGeometry()?.getCoordinates() as Coordinate);
          layer.continueFlash(e.feature.getId());
        }
      }
    }
    return e;
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
    const div = document.createElement('div');
    div.innerHTML = "<div class='ol-tooltip'>" + str + '</div>';
    document.body.appendChild(div);
    this.overlay.add({
      id: 'help_tooltip',
      position: useEarth().map.getCoordinateFromPixel([0, -100]),
      element: div,
      offset: [15, -11]
    });
    this.overlayKey = useEarth().map.on('pointermove', (evt) => {
      this.overlay.setPosition('help_tooltip', evt.coordinate);
    });
  }
  /**
   * 更新提示牌
   */
  private updateHelpTooltip(str: string, pixel?: number[]) {
    if (this.overlayKey) {
      const div = document.createElement('div');
      div.innerHTML = "<div class='ol-tooltip'>" + str + '</div>';
      document.body.appendChild(div);
      const params: ISetOverlayParam = {
        id: 'help_tooltip',
        element: div
      };
      if (pixel) {
        params['position'] = useEarth().map.getCoordinateFromPixel(pixel);
      }
      this.overlay.set(params);
    }
  }
  /**
   * 删除提示牌
   */
  private removeHelpTooltip() {
    if (this.overlayKey) {
      this.overlay.remove('help_tooltip');
      unByKey(this.overlayKey);
      this.overlayKey = undefined;
    }
  }
  /**
   * 转换坐标系
   */
  private transformCoordinates(feature: Feature): Coordinate | Coordinate[] | Coordinate[][] {
    const geometry = feature.getGeometry();
    const type = geometry?.getType();
    let coordinates: Coordinate | Coordinate[] | Coordinate[][] = [];
    if (geometry instanceof Point) {
      coordinates = geometry.getCoordinates();
    } else if (geometry instanceof LineString) {
      coordinates = geometry.getCoordinates();
    } else if (geometry instanceof Polygon) {
      coordinates = geometry.getCoordinates();
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

  /**
   * 根据鼠标事件类型，更新标牌文本
   */
  private updateHelpTooltipByCursorType(e: ITransformCallback) {
    if (e.cursor == ECursor.Move) {
      // 平移
      this.updateHelpTooltip('鼠标左键按下平移', e.eventPixel);
    } else if (e.cursor == ECursor.Pointer) {
      // 平移
      if (this.options.translateType == ETranslateType.Feature || this.defaultParams.translateType == ETranslateType.Feature) {
        this.updateHelpTooltip('鼠标左键按下平移');
      } else {
        this.updateHelpTooltip('选择控制点进行变换操作');
      }
    } else if (e.cursor == ECursor.Grab) {
      // 旋转
      this.updateHelpTooltip('鼠标左键按下旋转', e.eventPixel);
    } else if (e.cursor == ECursor.NsResize || e.cursor == ECursor.EwResize) {
      // 拉伸
      const type = this.checkSelect?.getGeometry()?.getType();
      let str = '鼠标左键按下拉伸，Ctrl键以基准点拉伸';
      if (type == 'Point' || type == 'MultiPoint' || type == 'Circle') {
        str = '鼠标左键按下拉伸';
      }
      this.updateHelpTooltip(str, e.eventPixel);
    } else if (e.cursor == ECursor.NeswResize || e.cursor == ECursor.NwseResize) {
      // 缩放
      const type = this.checkSelect?.getGeometry()?.getType();
      let str = '鼠标左键按下缩放，Shift键保持比例缩放';
      if (type == 'Point' || type == 'MultiPoint' || type == 'Circle') {
        const style = <Style>this.checkSelect?.getStyle();
        const image = style.getImage?.();
        if (!(image instanceof Icon)) {
          str = '鼠标左键按下缩放';
        }
      }
      this.updateHelpTooltip(str, e.eventPixel);
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
    const interaction = useEarth().map.removeInteraction(this.transforms);
    return interaction ? true : false;
  }
}

// const transform = new olPaintTransfrom({
//   hitTolerance: 2, //点选容差，即将鼠标所在位置扩大2px进行选择
//   translate: false, // 平移-点击要素的中心触发
//   translateFeature: true, //平移-点击要素任意位置触发
//   stretch: true, // 拉伸
//   scale: true, // 缩放
//   rotate: true, // 旋转
//   noFlip: true, //禁止翻转
//   keepRectangle: true, //保持包围框为矩形状态
//   keepAspectRation: always //保持要素宽高比（缩放时）
// });
// map.addInteraction(transform);
// //开始事件
// transform.on(['rotatestart', 'translatestart'], function (e) {
//   // Rotation
//   let startangle = e.feature.get('angle') || 0;
//   // Translation
//   console.log(xxx);
//   console.log(startangle);
// });
// //旋转
// transform.on('rotating', function (e) {
//   console.log(xxx);
//   console.log('rotate: ' + ((((e.angle * 180) / Math.PI - 180) % 360) + 180).toFixed(2));
//   console.log(e);
// });
// //移动
// transform.on('translating', function (e) {
//   console.log(xxx);
//   console.log(e.delta);
//   console.log(e);
// });
// //拖拽事件
// transform.on('scaling', function (e) {
//   console.log(xxx);
//   console.log(e.scale);
//   console.log(e);
// });
// //事件结束
// transform.on(['rotateend', 'translateend', 'scaleend'], function (e) {
//   console.log(xxx);
// });
