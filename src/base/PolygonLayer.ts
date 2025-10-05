import { Utils } from '../common';
import Earth from '../Earth';
import { IPolygonParam, ISetPolygonParam } from '../interface';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style } from 'ol/style';
import Base from './Base';
import { Coordinate } from 'ol/coordinate';

/**
 * 创建多边形`Polygon`
 */
export default class PolygonLayer<T = unknown> extends Base {
  /**
   * 构造器
   * @param earth 地图实例
   * @example
   * ```
   * const polygonLayer = new PolygonLayer(useEarth());
   * ```
   */
  constructor(earth: Earth, options?: { wrapX?: boolean }) {
    // 增加 wrapX 可配置（编辑模式下需要关闭以避免多世界复制导致交互命中失败）
    const layer = new VectorLayer({
      source: new VectorSource({
        wrapX: options?.wrapX !== undefined ? options.wrapX : true
      })
    });
    super(earth, layer, 'Polygon');
  }
  /**
   * 创建矢量元素
   * @param param 详细参数，详见{@link IPolygonParam}
   * @returns 返回`Feature<Polygon>`实例
   */
  private createFeature(param: IPolygonParam<T>): Feature<Polygon> {
    const feature = new Feature({
      geometry: new Polygon(param.positions)
    });
    let style = new Style();
    style = super.setStroke(style, param.stroke);
    style = super.setFill(style, param.fill);
    style = super.setText(style, param.label);
    feature.setStyle(style);
    feature.setId(param.id);
    feature.set('data', param.data);
    feature.set('module', param.module);
    feature.set('layerId', this.layer.get('id'));
    feature.set('layerType', 'Polygon');
    feature.set('param', param);
    return feature;
  }
  /**
   * 添加多边形
   * @param param 详细参数，详见{@link IPolygonParam}
   * @returns 返回`Feature<Polygon>`实例
   * @example
   * ```
   * const polygonLayer = new PolygonLayer(useEarth());
   * polygonLayer.add({
   *  // ...
   * })
   * ```
   */
  add(param: IPolygonParam<T>): Feature<Polygon> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    return <Feature<Polygon>>super.save(feature);
  }
  /**
   * 修改多边形
   * @param param 详细参数，详见{@link ISetPolygonParam}
   * @returns 返回`Feature<Polygon>`实例数组
   * @example
   * ```
   * const polygonLayer = new PolygonLayer(useEarth());
   * polygonLayer.set({
   *  // ...
   * })
   * ```
   */
  set(param: ISetPolygonParam): Feature<Polygon>[] {
    const features = <Feature<Polygon>[]>super.get(param.id);
    if (features[0] == undefined) {
      console.warn('没有找到元素，请检查ID');
      return [];
    }
    if (param.positions) {
      features[0].getGeometry()?.setCoordinates(param.positions);
    }
  const style = <Style>features[0].getStyle();
    if (param.stroke) {
      super.setStroke(style, param.stroke);
    }
    if (param.fill) {
      super.setFill(style, param.fill);
    }
    if (param.label) {
      super.setText(style, param.label);
    }
    return features;
  }
  /**
   * 修改多边形
   * @param id `polygon`id
   * @param position 坐标
   * @returns 返回`Feature<Polygon>`实例数组
   * @example
   * ```
   * const polygonLayer = new PolygonLayer(useEarth());
   * polygonLayer.setPosition("polygon_2", [[fromLonLat([100, 50]), fromLonLat([130, 30]), fromLonLat([140, 30]), fromLonLat([140, 50])]]);
   * ```
   */
  setPosition(id: string, position: Coordinate[][]): Feature<Polygon>[] {
    const features = <Feature<Polygon>[]>super.get(id);
    if (features[0] == undefined) {
      console.warn('没有找到元素，请检查ID');
      return [];
    }
    features[0].getGeometry()?.setCoordinates(position);
    return features;
  }
}
