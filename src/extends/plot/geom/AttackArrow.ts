/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
 * 进攻箭头
 */
import { Map } from 'ol';
import { Polygon } from 'ol/geom';
import * as PlotUtils from '../utils';
import { EPlotType } from '../../../enum';

class AttackArrow extends Polygon {
  private type: EPlotType;

  private map: any;

  private points: PlotUtils.Point[] | undefined;

  private headWidthFactor: number;

  private headHeightFactor: number;

  private neckWidthFactor: number;

  private neckHeightFactor: number;

  private tailWidthFactor: number | undefined;

  private headTailFactor: number;

  private swallowTailFactor: number | undefined;

  private swallowTailPnt: any;

  public fixPointCount: any;

  constructor(coordinates: any, points: any, params: any) {
    super([]);
    this.type = EPlotType.AttackArrow;
    this.headHeightFactor = 0.18;
    this.headWidthFactor = 0.3;
    this.neckHeightFactor = 0.85;
    this.neckWidthFactor = 0.15;
    this.headTailFactor = 0.8;
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
    try {
      const points = this.getPointCount();
      if (points < 2) {
        return false;
      }
      if (points === 2) {
        this.setCoordinates([this.points!]);
      } else {
        const pnts = this.getPoints();
        let [tailLeft, tailRight] = [pnts[0], pnts[1]];
        if (PlotUtils.isClockWise(pnts[0], pnts[1], pnts[2])) {
          tailLeft = pnts[1];
          tailRight = pnts[0];
        }
        const midTail = PlotUtils.Mid(tailLeft, tailRight);
        const bonePnts = [midTail].concat(pnts.slice(2));
        const headPnts = this.getArrowHeadPoints(bonePnts, tailLeft, tailRight);
        if (headPnts && headPnts.length > 4) {
          const [neckLeft, neckRight] = [headPnts[0], headPnts[4]];
          const tailWidthFactor = PlotUtils.MathDistance(tailLeft, tailRight) / PlotUtils.getBaseLength(bonePnts);
          const bodyPnts = this.getArrowBodyPoints(bonePnts, neckLeft, neckRight, tailWidthFactor);
          const count = bodyPnts.length;
          let leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
          leftPnts.push(neckLeft);
          let rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
          rightPnts.push(neckRight);
          leftPnts = PlotUtils.getQBSplinePoints(leftPnts);
          rightPnts = PlotUtils.getQBSplinePoints(rightPnts);
          this.setCoordinates([leftPnts.concat(headPnts, rightPnts.reverse())]);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * 插值箭形上的点
   * @param pnt1
   * @param pnt2
   * @param pnt3
   * @param clockWise
   * @returns {Array.<T>}
   */
  getArrowPoints(pnt1: any, pnt2: any, pnt3: any, clockWise: any) {
    const midPnt = PlotUtils.Mid(pnt1, pnt2);
    const len = PlotUtils.MathDistance(midPnt, pnt3);
    let midPnt1 = PlotUtils.getThirdPoint(pnt3, midPnt, 0, len * 0.3, true);
    let midPnt2 = PlotUtils.getThirdPoint(pnt3, midPnt, 0, len * 0.5, true);
    midPnt1 = PlotUtils.getThirdPoint(midPnt, midPnt1, PlotUtils.HALF_PI, len / 5, clockWise);
    midPnt2 = PlotUtils.getThirdPoint(midPnt, midPnt2, PlotUtils.HALF_PI, len / 4, clockWise);
    const points = [midPnt, midPnt1, midPnt2, pnt3];
    const arrowPnts = this.getArrowHeadPoints(points);
    if (arrowPnts && Array.isArray(arrowPnts) && arrowPnts.length > 0) {
      const [neckLeftPoint, neckRightPoint] = [arrowPnts[0], arrowPnts[4]];
      const tailWidthFactor = PlotUtils.MathDistance(pnt1, pnt2) / PlotUtils.getBaseLength(points) / 2;
      const bodyPnts = this.getArrowBodyPoints(points, neckLeftPoint, neckRightPoint, tailWidthFactor);
      if (bodyPnts) {
        const n = bodyPnts.length;
        let lPoints = bodyPnts.slice(0, n / 2);
        let rPoints = bodyPnts.slice(n / 2, n);
        lPoints.push(neckLeftPoint);
        rPoints.push(neckRightPoint);
        lPoints = lPoints.reverse();
        lPoints.push(pnt2);
        rPoints = rPoints.reverse();
        rPoints.push(pnt1);
        return lPoints.reverse().concat(arrowPnts, rPoints);
      }
    } else {
      throw new Error('插值出错');
    }
  }

  /**
   * 插值头部点
   * @param points
   * @param tailLeft
   * @param tailRight
   * @returns {[*,*,*,*,*]}
   */
  getArrowHeadPoints(points: any, tailLeft?: PlotUtils.Point, tailRight?: PlotUtils.Point) {
    try {
      let len = PlotUtils.getBaseLength(points);
      let headHeight = len * this.headHeightFactor;
      const headPnt = points[points.length - 1];
      len = PlotUtils.MathDistance(headPnt, points[points.length - 2]);
      let tailWidth = 0;
      if (tailLeft && tailRight) {
        tailWidth = PlotUtils.MathDistance(tailLeft, tailRight);
      }
      if (headHeight > tailWidth * this.headTailFactor) {
        headHeight = tailWidth * this.headTailFactor;
      }
      const headWidth = headHeight * this.headWidthFactor;
      const neckWidth = headHeight * this.neckWidthFactor;
      headHeight = headHeight > len ? len : headHeight;
      const neckHeight = headHeight * this.neckHeightFactor;
      const headEndPnt = PlotUtils.getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true);
      const neckEndPnt = PlotUtils.getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true);
      const headLeft = PlotUtils.getThirdPoint(headPnt, headEndPnt, PlotUtils.HALF_PI, headWidth, false);
      const headRight = PlotUtils.getThirdPoint(headPnt, headEndPnt, PlotUtils.HALF_PI, headWidth, true);
      const neckLeft = PlotUtils.getThirdPoint(headPnt, neckEndPnt, PlotUtils.HALF_PI, neckWidth, false);
      const neckRight = PlotUtils.getThirdPoint(headPnt, neckEndPnt, PlotUtils.HALF_PI, neckWidth, true);
      return [neckLeft, headLeft, headPnt, headRight, neckRight];
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * 插值面部分数据
   * @param points
   * @param neckLeft
   * @param neckRight
   * @param tailWidthFactor
   * @returns {Array.<*>}
   */
  getArrowBodyPoints(points: any, neckLeft: PlotUtils.Point, neckRight: PlotUtils.Point, tailWidthFactor: number): Array<PlotUtils.Point> {
    const allLen = PlotUtils.wholeDistance(points);
    const len = PlotUtils.getBaseLength(points);
    const tailWidth = len * tailWidthFactor;
    const neckWidth = PlotUtils.MathDistance(neckLeft, neckRight);
    const widthDif = (tailWidth - neckWidth) / 2;
    // eslint-disable-next-line
    let tempLen = 0;
    const leftBodyPnts: PlotUtils.Point[] = [];
    const rightBodyPnts: PlotUtils.Point[] = [];
    for (let i = 1; i < points.length - 1; i++) {
      const angle = PlotUtils.getAngleOfThreePoints(points[i - 1], points[i], points[i + 1]) / 2;
      tempLen += PlotUtils.MathDistance(points[i - 1], points[i]);
      const w = (tailWidth / 2 - (tempLen / allLen) * widthDif) / Math.sin(angle);
      const left = PlotUtils.getThirdPoint(points[i - 1], points[i], Math.PI - angle, w, true);
      const right = PlotUtils.getThirdPoint(points[i - 1], points[i], angle, w, false);
      leftBodyPnts.push(left);
      rightBodyPnts.push(right);
    }
    return leftBodyPnts.concat(rightBodyPnts);
  }

  /**
   * 获取对称点
   * @param linePnt1
   * @param linePnt2
   * @param point
   * @returns {*}
   */
  getTempPoint4(linePnt1: PlotUtils.Point, linePnt2: PlotUtils.Point, point: PlotUtils.Point) {
    try {
      const midPnt = PlotUtils.Mid(linePnt1, linePnt2);
      const len = PlotUtils.MathDistance(midPnt, point);
      const angle = PlotUtils.getAngleOfThreePoints(linePnt1, midPnt, point);
      let symPnt;
      let distance1 = 0;
      let distance2 = 0;
      let mid: PlotUtils.Point;
      if (angle < PlotUtils.HALF_PI) {
        distance1 = len * Math.sin(angle);
        distance2 = len * Math.cos(angle);
        mid = PlotUtils.getThirdPoint(linePnt1, midPnt, PlotUtils.HALF_PI, distance1, false);
        symPnt = PlotUtils.getThirdPoint(midPnt, mid, PlotUtils.HALF_PI, distance2, true);
      } else if (angle >= PlotUtils.HALF_PI && angle < Math.PI) {
        distance1 = len * Math.sin(Math.PI - angle);
        distance2 = len * Math.cos(Math.PI - angle);
        mid = PlotUtils.getThirdPoint(linePnt1, midPnt, PlotUtils.HALF_PI, distance1, false);
        symPnt = PlotUtils.getThirdPoint(midPnt, mid, PlotUtils.HALF_PI, distance2, false);
      } else if (angle >= Math.PI && angle < Math.PI * 1.5) {
        distance1 = len * Math.sin(angle - Math.PI);
        distance2 = len * Math.cos(angle - Math.PI);
        mid = PlotUtils.getThirdPoint(linePnt1, midPnt, PlotUtils.HALF_PI, distance1, true);
        symPnt = PlotUtils.getThirdPoint(midPnt, mid, PlotUtils.HALF_PI, distance2, true);
      } else {
        distance1 = len * Math.sin(Math.PI * 2 - angle);
        distance2 = len * Math.cos(Math.PI * 2 - angle);
        mid = PlotUtils.getThirdPoint(linePnt1, midPnt, PlotUtils.HALF_PI, distance1, true);
        symPnt = PlotUtils.getThirdPoint(midPnt, mid, PlotUtils.HALF_PI, distance2, false);
      }
      return symPnt;
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * 设置地图对象
   * @param map
   */
  setMap(map: Map) {
    if (map && map instanceof Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  }

  /**
   * 获取当前地图对象
   * @returns {ol.Map|*}
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
  setPoints(value: Array<PlotUtils.Point>) {
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
    return this.points!.slice(0);
  }

  /**
   * 获取点数量
   * @returns {Number}
   */
  getPointCount() {
    return this.points!.length;
  }

  /**
   * 更新当前坐标
   * @param point
   * @param index
   */
  updatePoint(point: PlotUtils.Point, index: number) {
    if (index >= 0 && index < this.points!.length) {
      this.points![index] = point;
      this.generate();
    }
  }

  /**
   * 更新最后一个坐标
   * @param point
   */
  updateLastPoint(point: PlotUtils.Point) {
    this.updatePoint(point, this.points!.length - 1);
  }

  /**
   * 结束绘制
   */
  finishDrawing() {
    //
  }
}

export default AttackArrow;
