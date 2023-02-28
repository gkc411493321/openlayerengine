/*
 * @Description: 线操作
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-28 10:21:18
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-02-28 14:02:55
 */
import { Utils } from "../common";
import Earth from "Earth";
import { IPolylineParam } from "../interface";
import { Feature } from "ol";
import { Geometry, LineString } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Stroke, Fill, Text } from "ol/style";
import Base from "./Base";

export default class Polyline<T = unknown> extends Base {
  constructor(earth: Earth) {
    const layer = new VectorLayer({
      source: new VectorSource()
    })
    super(earth, layer)
  }
  private createFeature(param: IPolylineParam<T>): Feature {
    const feature = new Feature({
      geometry: new LineString(param.positions)
    })
    let style = new Style();
    style = super.setStroke(style, param.stroke, param.width);
    style = super.setFill(style, param.fill);
    style = super.setText(style, param.label);
    feature.setStyle(style)
    feature.setId(param.id);
    feature.set("data", param.data);
    feature.set("module", param.module)
    return feature
  }
  /**
   * @description: 增加一个元素
   * @param {IPointParam} param 详细参数 
   * @return {*} Feature<Geometry>
   * @author: wuyue.nan
   */
  add(param: IPolylineParam<T>): Feature<Geometry> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    return super.save(feature);
  }
}