/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ExtTransform from './Transform/Transform';
import { useEarth } from '../useEarth';
import { ISetOverlayParam, ITransformCallback, ITransfromParams } from '../interface';
import { ECursor, ETransfrom, ETranslateType } from '../enum';
import { Feature } from 'ol';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import { LineString, Point, Polygon } from 'ol/geom';
import { OverlayLayer } from '../base';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';

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

  constructor(options: ITransfromParams) {
    this.options = options;
    this.overlay = new OverlayLayer(useEarth());
    this.transforms = this.createTransform();
    this.initEvent();
  }
  /**
   * 创建变换实例
   */
  private createTransform() {
    // 初始化参数
    const { params, translate, translateFeature } = this.initParams();
    // 添加 Transform 交互
    const transforms = new ExtTransform({
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
   * 初始化内部事件监听
   */
  private initEvent() {
    this.transforms.on(ETransfrom.Select, (e: any) => {
      // 选中元素
      this.checkSelect = e.feature;
      this.removeHelpTooltip();
      this.initHelpTooltip('选择控制点进行变换操作');
    });
    this.transforms.on(ETransfrom.SelectEnd, (e: any) => {
      // 退出选中元素
      this.checkSelect = null;
      this.removeHelpTooltip();
    });
    this.transforms.on(ETransfrom.EnterHandle, (e: any) => {
      // 根据鼠标类型更新提示牌
      this.updateHelpTooltipByCursorType(e);
    });
    this.transforms.on(ETransfrom.LeaveHandle, (e: any) => {
      if (this.overlayKey) {
        this.updateHelpTooltip('选择控制点进行变换操作');
      } else {
        this.removeHelpTooltip();
      }
    });
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
      this.updateHelpTooltip('鼠标左键按下拉伸，Ctrl键以基准点拉伸', e.eventPixel);
    } else if (e.cursor == ECursor.NeswResize || e.cursor == ECursor.NwseResize) {
      // 缩放
      const type = this.checkSelect?.getGeometry()?.getType();
      if (type == 'Point' || type == 'MultiPoint' || type == 'Circle') {
        this.updateHelpTooltip('鼠标左键按下缩放', e.eventPixel);
      } else {
        this.updateHelpTooltip('鼠标左键按下缩放，Shift键保持比例缩放', e.eventPixel);
      }
    }
  }
  /**
   * 封装事件监听器
   */
  public on(eventName: ETransfrom, callback: (e: ITransformCallback) => void): void {
    switch (eventName) {
      case ETransfrom.Select:
        // 选中元素
        this.transforms.on(eventName, (e: any) => {
          // 回调函数
          const params: ITransformCallback = {
            type: ETransfrom.Select,
            eventPosition: toLonLat(useEarth().map.getCoordinateFromPixel(e.pixel)),
            eventPixel: e.pixel,
            featureId: e.feature && e.feature.getId() ? e.feature.getId() : '',
            featurePosition: e.feature && this.transformCoordinates(e.feature),
            feature: e.feature
          };
          callback(params);
        });
        break;
      case ETransfrom.SelectEnd:
        // 退出选中
        this.transforms.on(eventName, (e: any) => {
          // 回调函数
          if (this.checkSelect) {
            callback({
              type: ETransfrom.SelectEnd,
              eventPosition: toLonLat(useEarth().map.getCoordinateFromPixel(e.pixel)),
              eventPixel: e.pixel
            });
          }
        });
        break;
      case ETransfrom.EnterHandle:
        // 进入变换点
        this.transforms.on(eventName, (e: any) => {
          if (!this.checkEnterHandle) {
            callback({
              type: ETransfrom.EnterHandle,
              cursor: e.cursor,
              eventPixel: e.eventPixel
            });
            this.checkEnterHandle = true;
          }
        });
        break;
      case ETransfrom.LeaveHandle:
        // 离开变换点
        this.transforms.on(eventName, (e: any) => {
          if (this.checkEnterHandle) {
            callback({
              type: ETransfrom.LeaveHandle,
              cursor: e.cursor,
              eventPixel: e.eventPixel
            });
            this.checkEnterHandle = false;
          }
        });
        break;
      default:
        throw new Error('事件类型错误');
    }
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
