import { Feature } from "ol";
import { Coordinate } from "ol/coordinate";
import { Geometry, Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import { Size } from "ol/size";
import VectorSource from "ol/source/Vector";
import { IconAnchorUnits, IconOrigin } from "ol/style/Icon";

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
   * 是否开启闪烁点，默认false
   */
  isFlash?: boolean;
  /**
   * 闪烁颜色，默认为rgb(255,0,0)
   */
  flashColor?: IRgbColor;
  /**
   * 闪烁一次持续时间，默认1000ms
   */
  duration?: number;
  /**
   * 是否重复闪烁，默认为true;该属性在isFlash属性为true时生效
   */
  isRepeat?: boolean;
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
export interface IBillboardParam<T> extends IAddBaseParam<T> {
  /**
  * 点中心
  */
  center: Coordinate;
  /**
   * 图片地址
   */
  src: string;
  /**
   * 图片大小,[width,height]
   */
  size?: Size;
  /**
   * 图标颜色,未指定则图标保持原样
   */
  color?: string;
  /**
   * 图标位移，单位是像素，默认[0,0]。正值将使图标向右和向上移动。
   */
  displacement?: number[];
  /**
   * 图标缩放，默认为1
   */
  scale?: number;
  /**
   * 旋转，默认0
   */
  rotation?: number;
  /**
   * 锚，默认值是图标中心:[0.5,0.5]
   */
  anchor?: number[];
  /**
   * 锚的来源，默认top-left
   */
  anchorOrigin?: IconOrigin;
  /**
   * 指定锚 x 值的单位，默认'fraction'。'fraction'表示 x 值是图标的一部分。'pixels'表示以像素为单位的 x 值。
   */
  anchorXUnits?: IconAnchorUnits;
  /**
   * 指定锚 y 值的单位，默认'fraction'。'fraction'表示 y 值是图标的一部分。'pixels'表示以像素为单位的 y 值。
   */
  anchorYUnits?: IconAnchorUnits;
  /**
   * 标签样式
   */
  label?: ILabel;
}
export interface IRgbColor {
  R: number;
  G: number;
  B: number;
}
export interface IPolygonParam<T> extends IAddBaseParam<T> {
  /**
   * 点集合
   */
  positions: number[] | Coordinate[][] | any;
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
export interface IPolylineParam<T> extends IAddBaseParam<T> {
  /**
   * 点集合
   */
  positions: number[][];
  /**
   * 线宽，默认为2
   */
  width?: number;
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
export interface IPolylineFlyParam<T> extends IAddBaseParam<T>, IFlightLineParams {
  /**
   * 点集合
   */
  position: number[][];
  /**
   * 线宽,默认2
   */
  width?: number;
  /**
   * 是否重复播放，默认为true
   */
  isRepeat?: boolean;
  /**
   * 是否展示定位点,默认为true
   */
  isShowAnchorPoint?: boolean;
  /**
   * 是否展示定位线,默认为false。当重复播放属性为false时，此属性生效
   */
  isShowAnchorLine?: boolean;
  /**
   * 是否显示箭头,默认为true
   */
  isShowArrow?: boolean;
  /**
   * 飞行线颜色, 可设置为纯色或渐变色, 默认渐变色
   */
  color?: string | IRadialColor;
  /**
   * 定位线颜色
   */
  anchorLineColor?: string;
  /**
   * 箭头颜色
   */
  arrowColor?: string;
}
export interface IFlightLineParams {
  /**
   * 分割线长度，默认180。该值越高则曲线越平滑
   */
  splitLength?: number;
  /**
   * 每帧耗时多少秒，默认为0。值越大则播放速度越慢。
   */
  oneFrameLimitTime?: number;
  /**
   * 线段弯曲程度，默认为1。值越大，则弯曲程度越高
   */
  controlRatio?: number;

}
export interface IPointsFeature {
  id: string;
  feature: Feature<Point>[];
}
export interface IFlyPosition {
  id: string;
  position: number[][];
}
export interface IRadialColor {
  0: string;
  0.2: string;
  0.4: string;
  0.6: string;
  0.8: string;
  1.0: string;
  [key: number]: string;
}
export interface IStroke {
  /**
   * 颜色
   */
  color?: string;
  /**
   * 线宽
   */
  width?: number;
  /**
   * 线形，如[20,20,20,20]。数组下标0和2代表实线长度，1和3代表虚线长度，默认为null
   */
  lineDash?: number[];
  /**
   * 偏移量
   */
  lineDashOffset?: number;
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
   * 字体及字体大小。注意！！！必须遵循css字体样式，如：'10px sans-serif'
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
