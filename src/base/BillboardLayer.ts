/*
 * @Description: 广告牌
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-03-02 16:07:20
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-03-03 11:05:45
 */
import Earth from "Earth";
import { IBillboardParam } from "../interface";
import { Feature } from "ol";
import { Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Icon, Style } from "ol/style";
import Base from "./Base";
import { Utils } from "../common";
import { Coordinate } from "ol/coordinate";

export default class BillboardLayer<T = unknown> extends Base {
  constructor(earth: Earth) {
    const layer = new VectorLayer({
      source: new VectorSource()
    })
    super(earth, layer)
  }
  private createFeature(param: IBillboardParam<T>): Feature<Point> {
    const feature = new Feature({
      geometry: new Point(param.center)
    })
    const icon = new Icon({
      src: param.src,
      size: param.size,
      color: param.color,
      displacement: param.displacement,
      scale: param.scale,
      rotation: param.rotation,
      anchor: param.anchor,
      anchorOrigin: param.anchorOrigin,
      anchorXUnits: param.anchorXUnits,
      anchorYUnits: param.anchorYUnits,
    })
    let style = new Style();
    style = super.setText(style, param.label);
    style.setImage(icon);
    feature.setStyle(style);
    feature.setId(param.id);
    feature.set("data", param.data);
    feature.set("module", param.module)
    return feature;
  }
  /**
   * @description: 增加一个广告牌
   * @param {IBillboardParam} param 详细参数 
   * @return {*} Feature
   * @author: wuyue.nan
   */
  add(param: IBillboardParam<T>): Feature<Point> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    return <Feature<Point>>super.save(feature);
  }
  /**
   * @description: 修改广告牌位置
   * @param {string} id ID
   * @param {Coordinate} position 坐标
   * @return {*} Feature<Point>[]
   * @author: wuyue.nan
   */
  setPosition(id: string, position: Coordinate): Feature<Point>[] {
    const features = <Feature<Point>[]>super.get(id);
    const geometry = <Point>features[0].getGeometry();
    geometry.setCoordinates(position);
    return features;
  }
}