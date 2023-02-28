import { Coordinate } from "ol/coordinate";

/**
 * 新增元素的基础参数
 */
export interface IAddBaseParam<T> extends IBaseData<T> {
  /** 唯一ID */ id?: string;
}
/**
 * 附加数据
 */
export interface IBaseData<T> {
  /** 模块名称 */ module?: string;
  /** 附加数据 */ data?: T;
  /**
   * 边框样式
   */
  stroke?: IStroke;
  /**
   * 填充样式
   */
  fill?: IFill;
  /**
   * 标签样式
   */
  label?: ILabel;
}
export interface ICircleParam<T> extends IAddBaseParam<T> {
  /**
   * 圆中心
   */
  center: Coordinate;
  /**
   * 圆半径，单位m
   */
  radius: number;
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
}
export interface IPolygonParam<T> extends IAddBaseParam<T> {
  /**
   * 点集合
   */
  positions: number[] | Coordinate[][] | any;
}
export interface IPolylineParam<T> extends IAddBaseParam<T> {
  /**
   * 点集合
   */
  positions: number[][];
  /**
   * 线宽，默认为2
   */
  width?: number;
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
  /**
   * 顺时针旋转，默认为0
   */
  rotation?: number;
}
