import { Feature } from "ol";
import { Coordinate } from "ol/coordinate";
import { Geometry, LineString, Polygon } from "ol/geom";

export enum DrawType {
  /**
   * 绘制开始
   */
  Drawstart = "drawstart",
  /**
   * 绘制中
   */
  Drawing = "drawing",
  /**
   * 绘制完成
   */
  Drawend = "drawend",
  /**
   * 绘制中点击
   */
  DrawingClick = "drawingClick",
  /**
   * 退出绘制
   */
  Drawexit = "drawexit",
}
export enum ModifyType {
  /**
   * 修改中
   */
  Modifying = "modifying",
  /**
   * 退出修改
   */
  Modifyexit = "modifyexit",
}
export interface IDrawBase {
  /**
   * 保留绘制图像。默认为true
   */
  keepGraphics?: boolean;
  /**
   * 回调函数
   */
  callback?: (event: IDrawEvent) => void;
}
export interface IDrawEvent {
  /**
   * 绘制类型
   */
  type: DrawType;
  /**
   * 事件发生坐标
   */
  eventPosition: Coordinate | Coordinate[];
  /**
   * 元素坐标
   */
  featurePosition?: Coordinate | Coordinate[];
  /**
   * 元素
   */
  feature?: Feature<Geometry>
}
export interface IModifyEvent {
  /**
   * 修改类型
   */
  type: ModifyType;
  /**
   * 元素坐标
   */
  position?: Coordinate | Coordinate[];
}
export interface IDrawPoint extends IDrawBase {
  /**
   * 绘制次数。默认为0次：代表重复绘制
   */
  limit?: number;
  /**
   * 大小,默认2
   */
  size?: number;
  /**
   * 填充颜色
   */
  fillColor?: string;
}
export interface IDrawLine extends IDrawBase {
  /**
   * 边框颜色
   */
  strokeColor?: string;
  /**
   * 边框大小
   */
  strokeWidth?: number;
}
export interface IDrawPolygon extends IDrawBase {
  /**
   * 边框颜色
   */
  strokeColor?: string;
  /**
   * 边框大小
   */
  strokeWidth?: number;
  /**
   * 填充颜色
   */
  fillColor?: string;
}
export interface IEditPolygon {
  /**
   * 元素
   */
  feature: Feature<Polygon>;
  /**
   * 是否显示参考底图，默认false
   */
  isShowUnderlay?: boolean;
  /**
   * 回调函数
   */
  callback?: (e: IModifyEvent) => void;
}
export interface IEditPolyline {
  /**
   * 元素
   */
  feature: Feature<LineString>;
  /**
   * 是否显示参考底图，默认false
   */
  isShowUnderlay?: boolean;
  /**
   * 回调函数
   */
  callback?: (e: IModifyEvent) => void;
}