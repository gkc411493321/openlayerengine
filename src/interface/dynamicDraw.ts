import { Feature } from "ol";
import { Coordinate } from "ol/coordinate";
import { Geometry } from "ol/geom";
import { IFill, ILabel, IStroke } from "./default";

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
   * 绘制结束
   */
  Drawend = "drawend",
  /**
   * 绘制中点击
   */
  DrawingClick = "drawingClick",
  /**
   * 退出绘制
   */
  Drawexit = "drawexit"
}
export interface IDrawBase {
  /**
   * 绘制次数。默认为0次：代表重复绘制
   */
  limit?: number;
  /**
   * 保留绘制图像。默认为true
   */
  keepGraphics?: boolean;
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
export interface IDrawPoint extends IDrawBase {

}