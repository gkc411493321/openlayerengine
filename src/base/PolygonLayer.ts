/*
 * @Description: 
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-28 19:09:09
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-03-03 15:34:46
 */
import { Utils } from "../common";
import Earth from "../Earth";
import { IPolygonParam } from "../interface";
import { Feature } from "ol";
import { Polygon } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style } from "ol/style";
import Base from "./Base";
import { Coordinate } from "ol/coordinate";

export default class PolygonLayer<T = unknown> extends Base {
  constructor(earth: Earth) {
    const layer = new VectorLayer({
      source: new VectorSource()
    })
    super(earth, layer)
  }
  private createFeature(param: IPolygonParam<T>): Feature<Polygon> {
    const feature = new Feature({
      geometry: new Polygon(param.positions)
    })
    let style = new Style();
    style = super.setStroke(style, param.stroke);
    style = super.setFill(style, param.fill);
    style = super.setText(style, param.label);
    feature.setStyle(style)
    feature.setId(param.id);
    feature.set("data", param.data);
    feature.set("module", param.module)
    return feature
  }
  /**
   * @description: 增加一个多边形
   * @param {IPointParam} param 详细参数 
   * @return {*} Feature<Geometry>
   * @author: wuyue.nan
   */
  add(param: IPolygonParam<T>): Feature<Polygon> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    return <Feature<Polygon>>super.save(feature);
  }
  /**
   * @description: 修改多边形坐标
   * @param {string} id ID
   * @param {Coordinate} position 坐标
   * @return {*} Feature<Polygon>[]
   * @author: wuyue.nan
   */
  setPosition(id: string, position: Coordinate[][]): Feature<Polygon>[] {
    const features = <Feature<Polygon>[]>super.get(id);
    if (features[0] == undefined) {
      console.warn("没有找到元素，请检查ID");
      return [];
    }
    features[0].getGeometry()?.setCoordinates(position);
    return features;
  }
}