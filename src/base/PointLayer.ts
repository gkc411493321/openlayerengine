/*
 * @Description: 点操作
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-27 15:33:02
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-02-28 13:58:31
 */
import Earth from "../Earth";
import { IPointParam } from "../interface";
import { Feature } from "ol";
import { Geometry, Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Base from "./Base";
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

    let style = new Style();
    style.setImage(new Circle({
      radius: param.size || 4,
      stroke: new Stroke(Object.assign({
        color: param.fill?.color || 'red',
      }, param.stroke)),
      fill: new Fill(Object.assign({
        color: 'red',
      }, param.fill)),
    }))
    style = super.setText(style, param.label, -15);
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
