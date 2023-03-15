import { Utils } from '../common';
import Earth from "../Earth";
import { Feature } from "ol";
import { Circle } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import Base from "./Base"
import { ICircleParam, ISetCircleParam } from '../interface';
import { Coordinate } from 'ol/coordinate';
/**
 * 创建圆`Circle`
 */
export default class CircleLayer<T = unknown> extends Base {
  /**
   * 构造器
   * @param earth 地图实例
   * @example
   * ```
   * const circleLayer = new CircleLayer(useEarth());
   * ```
   */
  constructor(earth: Earth) {
    const layer = new VectorLayer({
      source: new VectorSource(),
    })
    super(earth, layer, "Circle")
  }
  /**
   * 创建矢量元素
   * @param param 圆参数，详见{@link ICircleParam} 
   * @returns 返回`Feature<Circle>`矢量元素
   */
  private createFeature(param: ICircleParam<T>): Feature<Circle> {
    const feature = new Feature({
      geometry: new Circle(param.center, param.radius),
    })

    let style = new Style();
    style = super.setStroke(style, param.stroke);
    style = super.setFill(style, param.fill);
    style = super.setText(style, param.label);
    feature.setStyle(style)
    feature.setId(param.id);
    feature.set("data", param.data);
    feature.set("module", param.module);
    feature.set("layerId", this.layer.get("id"));
    return feature;
  }
  /**
   * 创建一个圆形
   * @param param 圆详细参数，详见{@link ICircleParam}
   * @returns 返回`Feature<Circle>`矢量元素
   * @example
   * ```
   * const circleLayer = new CircleLayer(useEarth());
   * circleLayer.add({
   *  // ...
   * })
   * ```
   */
  add(param: ICircleParam<T>): Feature<Circle> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    return <Feature<Circle>>super.save(feature);
  }
  /**
   * 修改圆
   * @param param  圆参数，详见{@link ISetCircleParam} 
   * @returns 返回`Feature<Circle>`矢量元素
   * @example
   * ```
   * const circleLayer = new CircleLayer(useEarth());
   * circleLayer.set({
   *  // ...
   * })
   * ```
   */
  set(param: ISetCircleParam): Feature<Circle>[] {
    const features = <Feature<Circle>[]>super.get(param.id);
    if (features[0] == undefined) {
      console.warn("没有找到元素，请检查ID");
      return [];
    }
    const feature = features[0];
    let style = <Style>feature.getStyle();
    style = super.setStroke(style, param.stroke);
    style = super.setFill(style, param.fill);
    style = super.setText(style, param.label);
    feature.setStyle(style);
    if (param.center) {
      this.setPosition(param.id, param.center);
    }
    if (param.radius) {
      feature.getGeometry()?.setRadius(param.radius)
    }
    return features;
  }
  /**
   * 修改圆坐标位置
   * @param id 圆id
   * @param position 圆位置 
   * @returns 返回`Feature<Circle>`矢量元素
   * @example
   * ```
   * const circleLayer = new CircleLayer(useEarth());
   * circleLayer.setPosition("circle_2", fromLonLat([120, 45]));
   * ```
   */
  setPosition(id: string, position: Coordinate): Feature<Circle>[] {
    const features = <Feature<Circle>[]>super.get(id);
    if (features[0] == undefined) {
      console.warn("没有找到元素，请检查ID");
      return [];
    }
    const geometry = <Circle>features[0].getGeometry();
    geometry.setCenter(position);
    return features;
  }
}