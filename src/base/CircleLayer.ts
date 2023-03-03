/*
 * @Description: 圆操作
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-23 18:12:58
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-03-03 15:06:58
 */
import { Utils } from '../common';
import Earth from "../Earth";
import { Feature } from "ol";
import { Circle, Geometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import Base from "./Base"
import { ICircleParam, ISetCircleParam } from '../interface';
import { Coordinate } from 'ol/coordinate';
export default class CircleLayer<T = unknown> extends Base {
  constructor(earth: Earth) {
    const layer = new VectorLayer({
      source: new VectorSource(),
    })
    super(earth, layer)
  }
  /**
   * @description: 创建Feature
   * @param {ICircleParam} param
   * @return {*} Feature
   * @author: wuyue.nan
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
    feature.set("module", param.module)
    return feature;
  }
  /**
   * @description: 增加一个圆
   * @param {ICircleParam} param 详细参数 
   * @return {*} Feature
   * @author: wuyue.nan
   */
  add(param: ICircleParam<T>): Feature<Circle> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    return <Feature<Circle>>super.save(feature);
  }
  /**
   * @description: 修改圆
   * @param {ISetCircleParam} param 详细参数
   * @return {*} Feature<Circle>[]
   * @author: wuyue.nan
   */
  set(param: ISetCircleParam): Feature<Circle>[] {
    const features = <Feature<Circle>[]>super.get(param.id);
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
   * @description: 修改圆位置
   * @param {string} id ID
   * @param {Coordinate} position 坐标
   * @return {*} Feature<Circle>[]
   * @author: wuyue.nan
   */
  setPosition(id: string, position: Coordinate): Feature<Circle>[] {
    const features = <Feature<Circle>[]>super.get(id);
    const geometry = <Circle>features[0].getGeometry();
    geometry.setCenter(position);
    return features;
  }
}