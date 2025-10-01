// 一个用于描述 flyLine 属性 的数据源
import { Utils } from "../../common";

interface IParams {
  times: number;
  lineCoords: number[];
  startPos: number[];
  endPos: number[];
  lastEndPos: number[];
  arrowImage: HTMLImageElement;
  arrowLoad: boolean;
}

export default class FlightLineSource {
  startPos: number[];
  endPos: number[];
  controlRatio: number;
  centerPos: number[] = [];
  controlPos: number[] = [];
  lastEndPos: number[];
  times: number;
  lineCoords: number[] = [];
  arrowImage: HTMLImageElement;
  arrowLoad: boolean;

  constructor(options: any) {
    /**
     * 开始点位置经纬度表示
     */
    this.startPos = options.startPos;
    /**
     * 结束点位置经纬度表示
     */
    this.endPos = options.endPos;
    this.controlRatio = options.controlRatio;
    /**
     * 线段中点位置
     */
    this.centerPos = Utils.linearInterpolation(this.startPos, this.endPos, 0.5)
    /**
     * 控制点位置
     */
    this.controlPos = this.getControlPoint(this.startPos, this.endPos, this.centerPos, this.controlRatio)
    /**
     * 保存上一个结束点位置 初始则为 开始点
     */
    this.lastEndPos = this.startPos
    /**
     * 计数器 用于分段
     */
    this.times = 0;
    /**
     * 曲线 数组
     */
    this.lineCoords = []
    /**
     * 箭头相关
     */
    this.arrowImage = new Image()
    this.arrowImage.src = '/image/arrow.svg'
    this.arrowLoad = false
    this.arrowImage.onload = () => {
      this.arrowLoad = true
    }
  }

  getControlPoint(startPos: number[], endPos: number[], centerPos: number[], ratio: number) {
    let xDiff = endPos[0] - startPos[0]
    let addX = startPos[0] + xDiff
    let addY = startPos[1]
    let controlX, controlY
    controlX = addX
    controlY = addY
    let controlPos = [controlX, controlY]
    return Utils.linearInterpolation(centerPos, controlPos, ratio)
  }

  getRenderState() {
    return {
      times: this.times,
      lineCoords: this.lineCoords,
      startPos: this.startPos,
      centerPos: this.centerPos,
      endPos: this.endPos,
      lastEndPos: this.lastEndPos,
      arrowImage: this.arrowImage,
      arrowLoad: this.arrowLoad,
      controlPos: this.controlPos
    }
  }

  setRenderState(options: IParams) {
    this.times = options.times;
    this.lineCoords = options.lineCoords;
    this.startPos = options.startPos;
    this.endPos = options.endPos;
    this.lastEndPos = options.lastEndPos;
    this.arrowImage = options.arrowImage;
    this.arrowLoad = options.arrowLoad;
  }
}