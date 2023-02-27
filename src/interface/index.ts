import { IAddBaseParam } from "base/Base";
import { Coordinate } from "ol/coordinate";

export interface ICircleParam<T> extends IAddBaseParam<T> {
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
export interface IPointParam<T> extends IAddBaseParam<T> {
  /**
   * 点中心
   */
  center: Coordinate;
  /**
   * 点大小
   */
  size?: number;
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
export interface IPolygonParam<T> extends IAddBaseParam<T> {
  /**
   * 点中心
   */
  positions: number[] | Coordinate[][] | any;
  /**
   * 点大小
   */
  size?: number;
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

export interface IStroke {
  /**
   * 颜色
   */
  color?: string,
  /**
   * 线宽
   */
  width?: number,
}
export interface IFill {
  /**
  * 颜色
  */
  color?: string,
}
export interface ILabel {
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
  textAlign?: CanvasTextAlign;
  /**
   * 文本基线， 'bottom' | 'top' | 'middle' | 'alphabetic' | 'hanging' | 'ideographic'
   */
  textBaseline?: CanvasTextBaseline;
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
