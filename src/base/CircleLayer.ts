/*
 * @Description: 圆操作
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-23 18:12:58
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-02-28 15:14:44
 */
import { Utils } from '../common';
import Earth from "../Earth";
import { Feature } from "ol";
import { Circle, Geometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import Base from "./Base"
import { ICircleParam } from 'interface/default';
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
  add(param: ICircleParam<T>): Feature<Geometry> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    return super.save(feature);
  }
}