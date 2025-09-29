/* eslint-disable @typescript-eslint/no-explicit-any */
import ExtTransform from './Transform/Transform';
import { useEarth } from '../useEarth';
import { ITransformCallback, ITransfromParams } from '../interface';
import { ETransfrom } from '../enum';
import { Feature } from 'ol';
import { toLonLat } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import { LineString, Point, Polygon } from 'ol/geom';

export default class Transfrom {
  /**
   * 参数
   */
  private options: ITransfromParams;
  /**
   * 实列
   */
  private transforms: any;
  constructor(options: ITransfromParams) {
    this.options = options;
    this.transforms = this.createTransform();
  }

  /**
   * 创建变换实例
   */
  private createTransform() {
    // 添加 Transform 交互
    const transforms = new ExtTransform({
      hitTolerance: this.options.hitTolerance || 2,
      translate: this.options.translate || true,
      translateFeature: this.options.translateFeature || true,
      stretch: this.options.stretch || true,
      scale: this.options.scale || true,
      rotate: this.options.rotate || true,
      filter: this.options.beforeTransform,
      layers: this.options.transformLayers,
      features: this.options.transformFeatures
    });
    useEarth().map.addInteraction(transforms);
    return transforms;
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
   * 封装事件监听器
   */
  public on(eventName: ETransfrom, callback: (e: ITransformCallback) => void): void {
    switch (eventName) {
      case ETransfrom.Select:
        // 选中元素
        this.transforms.on(eventName, (e: any) => {
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
        this.transforms.on(eventName, (e: Feature) => {
          // callback({
          //   type: ETransfrom.SelectEnd
          // });
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
