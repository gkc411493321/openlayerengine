import Earth from '../Earth';
import { IPointParam, ISetPointParam } from '../interface';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Base from './Base';
import { Circle, Fill, Stroke, Style } from 'ol/style.js';
import { Utils } from '../common';
import { unByKey } from 'ol/Observable';
import { Coordinate } from 'ol/coordinate';

/**
 * 创建点`Point`
 */
export default class PointLayer<T = Point> extends Base {
  /**
   * 构造器
   * @param earth 地图实例
   * @example
   * ```
   * const pointLayer = new PointLayer(useEarth());
   * ```
   */
  constructor(earth: Earth, options?: { wrapX?: boolean }) {
    const layer = new VectorLayer({
      source: new VectorSource({
        wrapX: options?.wrapX !== undefined ? options.wrapX : true
      })
    });
    super(earth, layer, 'Point');
  }
  /**
   * 创建矢量元素
   * @param param 创建`Point`参数，详见{@link IPointParam}
   * @returns 返回`Feature<Point>`实例
   */
  private createFeature(param: IPointParam<T>): Feature<Point> {
    const feature = new Feature({
      geometry: new Point(param.center)
    });
    let style = new Style();
    style.setImage(
      new Circle({
        radius: param.size || 4,
        stroke: new Stroke(
          Object.assign(
            {
              color: param.fill?.color || 'red'
            },
            param.stroke
          )
        ),
        fill: new Fill(
          Object.assign(
            {
              color: 'red'
            },
            param.fill
          )
        )
      })
    );
    style = super.setText(style, param.label, -15);
    feature.setStyle(style);
    feature.setId(param.id);
    feature.set('data', param.data);
    feature.set('module', param.module);
    feature.set('layerId', this.layer.get('id'));
    feature.set('layerType', 'Point');
    feature.set('param', param);
    return feature;
  }
  /**
   * 创建点
   * @param param 详细参数，详见{@link IPointParam}
   * @returns 返回`Feature<Point>`实例
   * @example
   * ```
   * const pointLayer = new PointLayer(useEarth());
   * pointLayer.add({
   *  // ...
   * })
   * ```
   */
  add(param: IPointParam<T>): Feature<Point> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    if (param.isFlash) {
      feature.set('param', param);
      new Utils().flash(feature, param, this.layer);
      // this.flash(feature, param)
    }
    return <Feature<Point>>super.save(feature);
  }
  /**
   * 停止当前图层所有点闪烁状态
   * @example
   * ```
   * const pointLayer = new PointLayer(useEarth());
   * pointLayer.stopFlash();
   * ```
   */
  stopFlash(): void;
  /**
   * 停止指定点闪烁状态
   * @param id `point`id
   * @example
   * ```
   * const pointLayer = new PointLayer(useEarth());
   * pointLayer.stopFlash("1");
   * ```
   */
  stopFlash(id: string): void;
  stopFlash(id?: string): void {
    let features: Feature<Point>[] = [];
    if (id) {
      features = <Feature<Point>[]>super.get(id);
    } else {
      features = <Feature<Point>[]>super.get();
    }
    for (const item of features) {
      const listenerKey = item.get('listenerKey');
      if (listenerKey) {
        unByKey(listenerKey);
        item.set('listenerKey', null);
      }
    }
  }
  /**
   * 图层内所有暂停的闪烁点重新闪烁
   * @example
   * ```
   * const pointLayer = new PointLayer(useEarth());
   * pointLayer.continueFlash();
   * ```
   */
  continueFlash(): void;
  /**
   * 图层内指定暂停的闪烁点重新闪烁
   * @param id `point`id
   * @example
   * ```
   * const pointLayer = new PointLayer(useEarth());
   * pointLayer.continueFlash("1");
   * ```
   */
  continueFlash(id: string): void;
  continueFlash(id?: string): void {
    let features: Feature<Point>[] = [];
    if (id) {
      features = <Feature<Point>[]>super.get(id);
    } else {
      features = <Feature<Point>[]>super.get();
    }
    for (const item of features) {
      const param = item.get('param');
      if (param) new Utils().flash(item, param, this.layer);
    }
  }
  /**
   * 修改点属性
   * @param param 点详细参数，详见{@link ISetPointParam}
   * @returns 返回`Feature<Point>`实例数组
   * @example
   * ```
   * const pointLayer = new PointLayer(useEarth());
   * pointLayer.set({
   *  // ...
   * })
   * ```
   */
  set(param: ISetPointParam): Feature<Point>[] {
    const features = <Feature<Point>[]>super.get(param.id);
    if (features[0] == undefined) {
      console.warn('没有找到元素，请检查ID');
      return [];
    }
    if (param.center) {
      features[0].getGeometry()?.setCoordinates(param.center);
    }
    const listenerKey = features[0].get('listenerKey');
    const oldParam = features[0].get('param');
    const newParam = Object.assign(oldParam, param);
    features[0].set('param', newParam);
    if (listenerKey) {
      unByKey(listenerKey);
      new Utils().flash(features[0], newParam, this.layer);
    }
    const style = <Style>features[0].getStyle();
    const image = <Circle>style.getImage();
    style.setImage(
      new Circle({
        radius: param.size || image.getRadius(),
        stroke: new Stroke(
          Object.assign(
            {
              color: param.stroke?.color || image.getStroke()?.getColor()
            },
            param.stroke
          )
        ),
        fill: new Fill(
          Object.assign(
            {
              color: param.fill?.color || image.getFill()?.getColor()
            },
            param.fill
          )
        )
      })
    );
    const radius = param.size || image.getRadius();
    super.setText(style, param.label, -(radius + 15));
    features[0].changed();
    return features;
  }
  /**
   * 修改点坐标
   * @param id `point`id
   * @param position 坐标
   * @returns 返回`Feature<Point>`实例
   * @example
   * ```
   * const pointLayer = new PointLayer(useEarth());
   * pointLayer.setPosition("1",fromLonLat([125, 60]));
   * ```
   */
  setPosition(id: string, position: Coordinate): Feature<Point>[] {
    const features = <Feature<Point>[]>super.get(id);
    if (features[0] == undefined) {
      console.warn('没有找到元素，请检查ID');
      return [];
    }
    features[0].getGeometry()?.setCoordinates(position);
    const listenerKey = features[0].get('listenerKey');
    const param = features[0].get('param');
    if (listenerKey) {
      unByKey(listenerKey);
      new Utils().flash(features[0], param, this.layer);
    }
    return features;
  }
  /**
   * 移除方法
   */
  remove(): void;
  remove(id: string): void;
  remove(id?: string): void {
    if (id) {
      this.stopFlash(id);
      super.remove(id);
    } else {
      this.stopFlash();
      super.remove();
    }
  }
}
