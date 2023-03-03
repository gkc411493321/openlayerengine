/*
 * @Description: 广告牌
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-03-02 16:07:20
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-03-03 14:57:14
 */
import Earth from "Earth";
import { IBillboardParam, ISetBillboardParam } from "../interface";
import { Feature } from "ol";
import { Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Icon, Style, Text } from "ol/style";
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
   * @description: 修改广告牌
   * @param {ISetBillboardParam} param 详细参数
   * @return {*} Feature<Point>[]
   * @author: wuyue.nan
   */
  set(param: ISetBillboardParam): Feature<Point>[] {
    const features = <Feature<Point>[]>super.get(param.id);
    if (param.center) {
      this.setPosition(param.id, param.center);
    }
    if (features[0] == undefined) {
      console.warn("没有找到元素，请检查ID");
      return [];
    }
    const style = <Style>features[0].getStyle();
    const oldIcon = <Icon>style.getImage();
    const iconOptions: { [key: string]: any } = {
      src: param.src || oldIcon.getSrc(),
      size: param.size || oldIcon.getSize(),
      color: param.color || oldIcon.getColor(),
      displacement: param.displacement || oldIcon.getDisplacement(),
      scale: param.scale || oldIcon.getScale(),
      rotation: param.rotation || oldIcon.getRotation(),
      anchor: param.anchor || oldIcon.getAnchor(),
    }
    for (const key in iconOptions) {
      if (iconOptions[key] == null) {
        delete iconOptions[key]
      }
    }
    const newIcon = new Icon(iconOptions)
    const newStyle = super.setText(style, param.label);
    style.setImage(newIcon);
    features[0].setStyle(newStyle);
    return features;
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
    if (features[0] == undefined) {
      console.warn("没有找到元素，请检查ID");
      return [];
    }
    const geometry = <Point>features[0].getGeometry();
    geometry.setCoordinates(position);
    return features;
  }
}