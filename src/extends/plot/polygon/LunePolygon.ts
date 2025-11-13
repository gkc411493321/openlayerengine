/**
 * 弓形
 */
import { Map } from 'ol';
import { Polygon } from 'ol/geom';
import { EPlotType } from '@/enum';
import { IPlotAssembleData } from '@/interface';
import * as PlotUtils from '../utils';

class LunePolygon extends Polygon {
  private type: EPlotType;
  private map: any;
  private points: PlotUtils.Point[] = [];
  public fixPointCount: number;
  public assembleData: IPlotAssembleData | undefined;

  constructor(coordinates: any, points: any, params: any) {
    super([]);
    this.type = EPlotType.LunePolygon;
    this.fixPointCount = 3;
    this.set('params', params);
    if (points && points.length > 0) {
      this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      this.setCoordinates(coordinates);
    }
  }

  /**
   * 获取标绘类型
   * @returns {*}
   */
  getPlotType() {
    return this.type;
  }

  /**
   * 执行动作
   */
  generate() {
    if (this.getPointCount() < 2) {
      return false;
    }
    let pnts = this.getPoints();
    if (this.getPointCount() === 2) {
      const mid = PlotUtils.Mid(pnts[0], pnts[1]);
      const d = PlotUtils.MathDistance(pnts[0], mid);
      const pnt = PlotUtils.getThirdPoint(pnts[0], mid, PlotUtils.HALF_PI, d);
      pnts.push(pnt);
    }
    // eslint-disable-next-line
    let [pnt1, pnt2, pnt3, startAngle, endAngle] = [pnts[0], pnts[1], pnts[2], 0, 0];
    const center = PlotUtils.getCircleCenterOfThreePoints(pnt1, pnt2, pnt3);
    const radius = PlotUtils.MathDistance(pnt1, center);
    const angle1 = PlotUtils.getAzimuth(pnt1, center);
    const angle2 = PlotUtils.getAzimuth(pnt2, center);
    if (PlotUtils.isClockWise(pnt1, pnt2, pnt3)) {
      startAngle = angle2;
      endAngle = angle1;
    } else {
      startAngle = angle1;
      endAngle = angle2;
    }
    pnts = PlotUtils.getArcPoints(center, radius, startAngle, endAngle);
    pnts.push(pnts[0]);
    this.setCoordinates([pnts]);
  }

  /**
   * 设置地图对象
   * @param map
   */
  setMap(map: any) {
    if (map && map instanceof Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  }

  /**
   * 获取当前地图对象
   * @returns {Map|*}
   */
  getMap() {
    return this.map;
  }

  /**
   * 判断是否是Plot
   * @returns {boolean}
   */
  isPlot() {
    return true;
  }

  /**
   * 设置坐标点
   * @param value
   */
  setPoints(value: any) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  }

  /**
   * 获取坐标点
   * @returns {Array.<T>}
   */
  getPoints() {
    return this.points.slice(0);
  }

  /**
   * 获取点数量
   * @returns {Number}
   */
  getPointCount() {
    return this.points.length;
  }

  /**
   * 更新当前坐标
   * @param point
   * @param index
   */
  updatePoint(point: any, index: any) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  }

  /**
   * 更新最后一个坐标
   * @param point
   */
  updateLastPoint(point: any) {
    this.updatePoint(point, this.points.length - 1);
  }

  /**
   * 结束绘制
   */
  finishDrawing() { }
}

export default LunePolygon;
