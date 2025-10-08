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
