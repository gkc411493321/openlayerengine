import PolylineLayer from "../../base/PolylineLayer";
import { Feature, Map } from "ol";
import { Geometry, MultiLineString, Point } from "ol/geom";
import { Vector as VectorLayer } from "ol/layer";
import { unByKey } from "ol/Observable";
import { getVectorContext } from "ol/render";
import { Vector as VectorSource } from "ol/source";
import { Stroke, Style, Icon } from "ol/style";
import { useEarth } from "../../useEarth";
import FlightLineSource from "./FlightLineSource";
import { IFlyPosition, IPointsFeature, IPolylineFlyParam, IRadialColor } from "../../interface/default";
import { EventsKey } from "ol/events";
import { Utils } from "../../common";



export default class Flightline<T = unknown> {
  private map: Map;
  private positions: IFlyPosition[];
  private pointsFeatures: IPointsFeature[];
  private splitLength: number;
  private oneFrameLimitTime: number;
  private radialColor: IRadialColor;
  private controlRatio: number;
  private eventKey: EventsKey | null;
  private flightlineLayer: VectorLayer<VectorSource<Geometry>>;
  private flightlineSource: VectorSource<Geometry> | null;
  private params: IPolylineFlyParam<T>;
  private defaultOptions = {
    width: 2,
    isRepeat: true,
    isShowAnchorPoint: true,
    isShowAnchorLine: false,
    isShowArrow: true,
    splitLength: 180,
    oneFrameLimitTime: 0,
    anchorLineColor: '#ffcc33',
    radialColor: {
      0: '#BBFFFF',
      0.2: '#AEEEEE',
      0.4: '#96CDCD',
      0.6: '#668B8B',
      0.8: '#98F5FF',
      1: '#8EE5EE'
    },
    controlRatio: 1,
  }
  private lineLayers: PolylineLayer<unknown>;

  constructor(layer: VectorLayer<VectorSource<Geometry>>, params: IPolylineFlyParam<T>, id: string) {
    let options = Object.assign(this.defaultOptions, params);
    this.lineLayers = new PolylineLayer(useEarth())
    // 保存点的位置的数组
    this.positions = [{ id: id, position: params.position }];
    this.params = options;
    this.map = useEarth().map;
    // 开始点与跟结束点的features
    this.pointsFeatures = [];
    // 分割线段长度越高则曲线越准确
    this.splitLength = options.splitLength;
    // 一帧耗时多少毫秒
    this.oneFrameLimitTime = options.oneFrameLimitTime;
    // 渐变色
    if (typeof options.color == "object") {
      this.radialColor = options.color;
    } else {
      this.radialColor = this.defaultOptions.radialColor;
    }
    // 控制点 的 比例 或者说弯曲程度
    this.controlRatio = options.controlRatio;
    // 图层
    this.flightlineLayer = layer;
    // 图层源
    this.flightlineSource = this.flightlineLayer.getSource()
    this.eventKey = null;
    this.pointsFeatures = this.generatePointsFeatures(this.positions);
    this.init();
  }
  /**
   * 绘制数据
   */
  init() {
    let curDateTime = new Date().getTime();
    this.eventKey = this.flightlineLayer.on('postrender', (evt) => {
      let frameRenderTime = new Date().getTime() - curDateTime;
      let features = this.pointsFeatures;
      for (let i = 0; i < features.length; i++) {
        let flightLineSource = features[i].feature[0].get('FlightLineSource');
        let { times, lineCoords, startPos, endPos, controlPos, lastEndPos, arrowImage, arrowLoad } = flightLineSource.getRenderState();
        if (times > this.splitLength) {
          if (this.params.isRepeat) {
            // 重复播放
            times = 0;
            lineCoords = [];
            lastEndPos = startPos;
          } else {
            // 播放一次
            this.removeFeatureById(features[i].id);
            this.eventKey && unByKey(this.eventKey);
            if (this.params.isShowAnchorLine) {
              // 展示定位线
              let points = [];
              for (const item of lineCoords) {
                for (const items of item) {
                  points.push(items);
                }
              }
              this.lineLayers.add({
                id: this.params.id + '_anchorLine',
                positions: points,
                stroke: {
                  color: this.params.anchorLineColor,
                  width: this.params.width
                },
                module: this.params.module,
                data: this.params.data
              })
            }
          }
        }
        let curEndPos = Utils.bezierSquareCalc(startPos, controlPos, endPos, times / this.splitLength);
        lineCoords.push([lastEndPos, curEndPos]);
        let ctx = getVectorContext(evt);
        //  曲线的渲染
        // 为了找到 开始点 的屏幕坐标 以及 结束点的屏幕坐标..
        this.curveLineRender(ctx, lineCoords, startPos, endPos);
        // 箭头的渲染
        if (this.params.isShowArrow) {
          this.arrowRender(ctx, arrowImage, arrowLoad, lastEndPos, curEndPos);
        }
        times++;
        lastEndPos = curEndPos;
        if (frameRenderTime > this.oneFrameLimitTime) {
          flightLineSource.setRenderState({ times, lineCoords, startPos, endPos, lastEndPos, arrowImage, arrowLoad });
          curDateTime += this.oneFrameLimitTime;
        }
      }
      this.flightlineLayer.changed();
    })
    if (this.flightlineSource && this.params.isShowAnchorPoint) {
      for (const item of this.pointsFeatures) {
        this.flightlineSource.addFeatures(item.feature);
      }
    }
  }

  /**
   * 根据 positions 生成 point Features
   * @param {*} positions 
   * @returns pointsFeatures 
   */
  generatePointsFeatures(positions: IFlyPosition[]) {
    let pointsFeatures = [];
    for (let i = 0, ii = positions.length; i < ii; i++) {
      let startFeature = new Feature({
        geometry: new Point(positions[i].position[0]),
        FlightLineSource: new FlightLineSource({
          startPos: positions[i].position[0],
          endPos: positions[i].position[1],
          controlRatio: this.controlRatio
        }),
      })
      startFeature.setId(positions[i].id + "_startPoint");
      let endtFeature = new Feature({ geometry: new Point(positions[i].position[1]) })
      endtFeature.setId(positions[i].id + "_endPoint");
      pointsFeatures.push({ id: positions[i].id, feature: [startFeature, endtFeature] });
    }
    return pointsFeatures
  }

  /**
   * 曲线的渲染
   * @param {*} ctx 绘制的上下文 
   * @param {*} lineCoords 推进的 multiLineString 数组
   * @param {*} startPos 开始点 经纬度表示
   * @param {*} endPos 结束点 经纬度表示
   */
  curveLineRender(ctx: any, lineCoords: number[], startPos: number[], endPos: number[]) {
    let geometry = new MultiLineString(lineCoords);
    let startGrdPixelPos = this.map.getPixelFromCoordinate(startPos);
    let endGrdPixelPos = this.map.getPixelFromCoordinate(endPos);
    let xDiff = endGrdPixelPos[0] - startGrdPixelPos[0];
    let yDiff = endGrdPixelPos[1] - startGrdPixelPos[1];
    let radius = Math.pow(Math.pow(xDiff, 2) + Math.pow(yDiff, 2), 0.5);
    let grd;
    if (typeof this.params.color == "string") {
      grd = this.params.color
    } else {
      grd = ctx.context_.createRadialGradient(startGrdPixelPos[0], startGrdPixelPos[1], 0, startGrdPixelPos[0], startGrdPixelPos[1], radius);
      let radialColor = this.radialColor;
      for (let i in radialColor) {
        grd.addColorStop(i, radialColor[i]);
      }
    }
    ctx.setStyle(new Style({
      stroke: new Stroke({
        color: grd,
        width: 3,
      })
    }))
    ctx.drawGeometry(geometry);
  }

  /**
   * 箭头的渲染
   * @param {*} ctx 绘制的上下文 
   * @param {*} arrowImage 箭头的htmlElement
   * @param {*} arrowLoad 图片是否加载完成
   * @param {*} lastEndPos 上一个点的结束坐标 经纬度表示
   * @param {*} curEndPos 当前的结束点坐标 经纬度表示
   */
  arrowRender(ctx: any, arrowImage: HTMLImageElement, arrowLoad: boolean, lastEndPos: number[], curEndPos: number[]) {
    let arrowGeometry
    arrowGeometry = new Point(curEndPos)
    // geometrys
    const dx = curEndPos[0] - lastEndPos[0];
    const dy = curEndPos[1] - lastEndPos[1];
    const rotation = Math.atan2(dy, dx);
    if (arrowLoad) {
      ctx.setImageStyle(new Icon({
        img: arrowImage,
        anchor: [0.75, 0.5],
        imgSize: [30, 30],
        scale: 0.7,
        rotateWithView: true,
        rotation: -rotation,
        color: this.params.arrowColor
      }))
    }
    // 渲染
    ctx.drawGeometry(arrowGeometry)
  }
  /**
   * @description: 
   * @return {*} 
   * @author: wuyue.nan
   */
  removeFeatureById(id: string): void {
    this.pointsFeatures = this.pointsFeatures.filter(item => {
      if (item.id != id) {
        return item;
      } else {
        this.flightlineSource?.removeFeature(item.feature[0])
        this.flightlineSource?.removeFeature(item.feature[1])
      }
    })
    this.lineLayers.remove(id + "_anchorLine");
  }
  // 提供此方法 用于删除所有相关的图层
  destroy() {
    // 其他的变量由js 自己控制gc 就可
    this.eventKey && unByKey(this.eventKey)
    this.positions = []
    this.pointsFeatures = []
    this.map.removeLayer(this.flightlineLayer)
  }

}