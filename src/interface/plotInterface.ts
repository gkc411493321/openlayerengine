import { EPlotType } from 'enum';
import { Feature } from 'ol';
import { Coordinate } from 'ol/coordinate';

export interface IPlotAttackArrow {
  /**
   * 点索引
   */
  index?: number;
  /**
   * 点坐标
   */
  point: Coordinate;
  /**
   * 点数量
   */
  pointCount: number;
  /**
   * 标绘真实坐标数组
   */
  points?: Coordinate[];
  /**
   * 临时点坐标(绘制中)
   */
  tempPoint?: Coordinate;
  /**
   * 标绘绘制坐标数据
   */
  coordinates?: Coordinate[][];
  /**
   * 标绘要素
   */
  feature?: Feature;
  /**
   * 中心点 仅circle使用
   */
  center?: Coordinate;
  /**
   * 半径 仅circle使用
   */
  radius?: number;
  /**
   * 标绘类型
   */
  type?: EPlotType;
}

export interface IPlotEditParams {
  /**
   * 标绘要素
   */
  feature: Feature;
}

export interface IPlotAssembleData {
  /**
   * 头部坐标集合
   */
  header: Coordinate[];
  /**
   * 左侧坐标集合
   */
  left: Coordinate[];
  /**
   * 右侧坐标集合
   */
  right: Coordinate[];
  /**
   * 尾部坐标集合
   */
  tail: Coordinate[];
}

export interface IPlotAssembleDoubleData {
  /**
   * 左侧头部箭头坐标集合
   */
  lHeader: Coordinate[];
  /**
   * 右侧头部箭头坐标集合
   */
  rHeader: Coordinate[];
  /**
   * 左侧坐标集合
   */
  left: Coordinate[];
  /**
   * 右侧坐标集合
   */
  right: Coordinate[];
  /**
   * 中部坐标集合
   */
  center: Coordinate[];
  /**
   * 尾部坐标集合
   */
  tail: Coordinate[];
}
