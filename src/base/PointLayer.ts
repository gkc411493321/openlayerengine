/*
 * @Description: 点操作
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-27 15:33:02
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-02-27 17:29:17
 */
import Earth from "Earth";
import { IPointParam } from "interface";
import { Feature } from "ol";
import { Geometry, Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Base from "./Base";
import Text from "ol/style/Text";
import { Circle, Fill, Stroke, Style } from 'ol/style.js';
import { Utils } from "../common";


export default class PointLayer<T = unknown> extends Base {
  constructor(earth: Earth) {
    const layer = new VectorLayer({
      source: new VectorSource()
    })
    super(earth, layer)
  }
  private createFeature(param: IPointParam<T>): Feature {
    const feature = new Feature({
      geometry: new Point(param.center)
    })
    const style = new Style({
      image: new Circle({
        radius: param.size || 4,
        stroke: new Stroke(Object.assign({}, param.stroke)),
        fill: new Fill(Object.assign({
          color: 'red',
        }, param.fill)),
      }),
      text: new Text({
        text: param.label?.text,
        font: param.label?.font,
        offsetX: param.label?.offsetX,
        offsetY: param.label?.offsetY || -15,
        scale: param.label?.scale,
        textAlign: param.label?.textAlign,
        textBaseline: param.label?.textBaseline,
        fill: new Fill({
          color: param.label?.fill?.color || "red"
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
      })
    })
    feature.setStyle(style)
    feature.setId(param.id);
    feature.set("data", param.data);
    feature.set("module", param.module)
    return feature
  }
  /**
   * @description: 增加一个元素
   * @param {IPointParam} param 详细参数 
   * @return {*} Feature
   * @author: wuyue.nan
   */
  add(param: IPointParam<T>): Feature<Geometry> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    return super.save(feature);
  }
}
