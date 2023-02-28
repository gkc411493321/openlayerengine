/*
 * @Description: 圆操作
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-23 18:12:58
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-02-27 17:46:56
 */
import { Utils } from '../common';
import Earth from "Earth";
import { Feature } from "ol";
import { Circle, Geometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Text from "ol/style/Text";
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
  private createFeature(param: ICircleParam<T>): Feature {
    const feature = new Feature({
      geometry: new Circle(param.center, param.radius),
    })
    const style = new Style({
      stroke: new Stroke(Object.assign({
        width: 1,
        color: "#fff"
      }, param.stroke)),
      fill: new Fill(Object.assign({
        color: "#fff"
      }, param.fill)),
      text: new Text({
        text: param.label?.text,
        font: param.label?.font,
        offsetX: param.label?.offsetX,
        offsetY: param.label?.offsetY,
        scale: param.label?.scale,
        textAlign: param.label?.textAlign,
        textBaseline: param.label?.textBaseline,
        fill: new Fill({
          color: param.label?.fill?.color || "#000"
        }),
        stroke: new Stroke({
          color: param.label?.stroke?.color || "#0000",
          width: param.label?.stroke?.width || 0
        }),
        backgroundFill: new Fill({
          color: param.label?.backgroundFill?.color || "#0000"
        }),
        backgroundStroke: new Stroke({
          color: param.label?.backgroundStroke?.color || "#0000",
          width: param.label?.backgroundStroke?.width || 0
        }),
        padding: param.label?.padding
      }),
    })
    feature.setStyle(style)
    feature.setId(param.id);
    feature.set("data", param.data);
    feature.set("module", param.module)
    return feature;
  }
  /**
   * @description: 增加一个元素
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