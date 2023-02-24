import { Utils } from '../common';
import Earth from "Earth";
import { Feature } from "ol";
import { Coordinate } from "ol/coordinate";
import { Circle, Geometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Text from "ol/style/Text";
import Base, { IAddBaseParam, IBaseData } from "./Base"
/*
 * @Description:圆操作
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-23 13:28:48
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-02-23 15:54:44
 */
interface ICircleParam<T> extends IAddBaseParam<T> {
  /**
   * 圆中心
   */
  center: Coordinate;
  /**
   * 圆半径，单位m
   */
  radius: number;
  /**
   * 圆边框样式
   */
  stroke?: IStroke;
  /**
   * 圆填充样式
   */
  fill?: IFill;
  /**
   * 标签样式
   */
  label?: ILabel;
}
interface IStroke {
  /**
   * 颜色
   */
  color?: string,
  /**
   * 线宽
   */
  width?: number,
}
interface IFill {
  /**
  * 颜色
  */
  color?: string,
}
interface ILabel {
  /**
   * 文本
   */
  text: string;
  /**
   * 字体及字体大小，遵循css字体样式，如：'10px sans-serif'
   */
  font?: string;
  /**
   * 水平偏移，单位是像素
   */
  offsetX?: number;
  /**
   * 垂直偏移，单位是像素
   */
  offsetY?: number;
  /**
   * 缩放
   */
  scale?: number;
  /**
   * 文本对齐方式，'left' | 'right' | 'center' | 'end' 
   */
  textAlign?: string;
  /**
   * 文本基线， 'bottom' | 'top' | 'middle' | 'alphabetic' | 'hanging' | 'ideographic'
   */
  textBaseline?: string;
  /**
   * 文本颜色
   */
  fill?: IFill;
  /**
   * 文本边框颜色
   */
  stroke?: IStroke;
  /**
   * 文本背景颜色
   */
  backgroundFill?: IFill;
  /**
   * 文本背景边框颜色
   */
  backgroundStroke?: IStroke;
  /**
   * 文本padding
   */
  padding?: number[];
}
export default class CircleLayer<T = unknown> extends Base {
  constructor(earth: Earth) {
    const layer = new VectorLayer({
      source: new VectorSource()
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
      stroke: new Stroke(Object.assign({}, param.stroke)),
      fill: new Fill(Object.assign({}, param.fill)),
      text: new Text({
        text: param.label?.text,
        stroke: new Stroke({

        })
      })
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
   * @return {*} Feature<Geometry>
   * @author: wuyue.nan
   */
  add(param: ICircleParam<T>): Feature<Geometry> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    return super.save(feature);
  }
}