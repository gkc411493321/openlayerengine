/*
 * @Description: 线操作
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-28 10:21:18
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-03-03 13:30:21
 */
import { Utils } from "../common";
import Earth from "../Earth";
import { IPointsFeature, IPolylineFlyParam, IPolylineParam } from "../interface";
import { Feature } from "ol";
import { Geometry, LineString, Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Icon, Stroke, Style } from "ol/style";
import Base from "./Base";
import { Coordinate } from "ol/coordinate";
import Flightline from "../extends/flight-line/FlightLine";

export default class Polyline<T = unknown> extends Base {
  private flyCatch: Map<string, Flightline> = new Map();
  constructor(earth: Earth) {
    const layer = new VectorLayer({
      source: new VectorSource()
    })
    super(earth, layer)
  }
  private createFeature(param: IPolylineParam<T>): Feature<LineString> {
    const feature = new Feature({
      geometry: new LineString(param.positions)
    })
    let style = new Style();
    style = super.setStroke(style, param.stroke, param.width);
    style = super.setFill(style, param.fill);
    style = super.setText(style, param.label);
    feature.setStyle(style)
    feature.setId(param.id);
    feature.set("data", param.data);
    feature.set("module", param.module)
    return feature
  }
  private createStyle(start: Coordinate, end: Coordinate, color?: string): Style {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const rotation = Math.atan2(dy, dx);
    const style = new Style({
      geometry: new Point(end),
      image: new Icon({
        src: '/image/arrow.png',
        anchor: [0.75, 0.5],
        scale: 0.7,
        rotateWithView: true,
        rotation: -rotation,
        color: color || "#ffcc33"
      })
    })
    return style;
  }
  /**
   * @description: 增加一个线段
   * @param {IPointParam} param 详细参数 
   * @return {*} Feature<LineString>
   * @author: wuyue.nan
   */
  add(param: IPolylineParam<T>): Feature<LineString> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    if (param.isArrow) {
      return this.addLineArrows(param);
    } else if (param.isFlowingDash) {
      return this.addFlowingDash(param);
    } else {
      return <Feature<LineString>>super.save(feature);
    }
  }
  /**
   * @description: 增加带箭头的线段
   * @param {IPolylineParam} param 详细参数
   * @param {boolean} repeat 是否重复绘制箭头，默认false。true：除起始点外每个点都带箭头；false:只有结束点存在箭头
   * @return {*} Feature<LineString>
   * @author: wuyue.nan
   */
  private addLineArrows(param: IPolylineParam<T>): Feature<LineString> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    const geometry = feature.getGeometry();
    const styles: any = [];
    const style = feature.getStyle();
    if (style) styles.push(style);
    if (param.arrowIsRepeat) {
      if (geometry) {
        geometry.forEachSegment((start, end) => {
          styles.push(this.createStyle(start, end, param.stroke?.color))
        });
      }
    } else {
      const start = param.positions[0];
      const end = param.positions[param.positions.length - 1];
      styles.push(this.createStyle(start, end, param.stroke?.color))
    }
    let styleText = new Style()
    styleText = super.setText(styleText, param.label);
    styles.push(styleText);
    feature.setStyle(styles)
    feature.setId(param.id);
    feature.set("data", param.data);
    feature.set("module", param.module);
    feature.set("param", param);
    feature.set("isArrows", true);
    return <Feature<LineString>>super.save(feature);
  }
  /**
   * @description: 绘制流动线
   * @param {IPolylineParam} param 详细参数
   * @return {*} Feature<Geometry>
   * @author: wuyue.nan
   */
  private addFlowingDash(param: IPolylineParam<T>): Feature<LineString> {
    param.id = param.id || Utils.GetGUID();
    const feature: any = this.createFeature(param);
    let textStyle = new Style();
    textStyle = super.setText(textStyle, param.label);
    const fullLineStyle = new Style({
      stroke: new Stroke({
        color: param.fullLineColor || "rgba(30,144,255, 1)",
        width: param.width || 2,
        lineDash: [0]
      }),
    })
    const dottedLineStyle = new Style({
      stroke: new Stroke({
        color: param.dottedLineColor || "rgba(255, 250, 250, 1)",
        width: param.width || 2,
        lineDash: [20, 27],
        lineDashOffset: 100
      }),
    })
    feature.setStyle([fullLineStyle, dottedLineStyle, textStyle]);
    feature.setId(param.id);
    feature.set("data", param.data);
    feature.set("module", param.module);
    this.earth.map.on("postrender", () => {
      let lineDashOffset = feature.getStyle()[1].getStroke().getLineDashOffset();
      const newDottedLineStyle = new Style({
        stroke: new Stroke({
          color: param.dottedLineColor || "rgba(255, 250, 250, 1)",
          width: param.width || 2,
          lineDash: [10, 25],
          lineDashOffset: lineDashOffset == 100 ? 0 : lineDashOffset - 2
        }),
      })
      feature.setStyle([fullLineStyle, newDottedLineStyle, textStyle])
    })
    return <Feature<LineString>>super.save(feature);
  }
  /**
   * @description: 添加飞行线 注意！！！删除此线段需使用【removeFlightLine】方法
   * @return {*} Flightline
   * @author: wuyue.nan
   */
  addFlightLine(param: IPolylineFlyParam<T>): Flightline {
    param.id = param.id || Utils.GetGUID();
    const flightline = new Flightline(this.layer, param, param.id);
    this.flyCatch.set(param.id, flightline);
    return flightline;
  }
  /**
   * @description: 修改线段坐标
   * @param {string} id ID
   * @param {Coordinate} position 坐标
   * @return {*} Feature<LineString>[]
   * @author: wuyue.nan
   */
  setPosition(id: string, position: Coordinate[]): Feature<LineString>[] {
    const features = <Feature<LineString>[]>super.get(id);
    const isArrows = features[0].get("isArrows");
    const param = <IPolylineParam<T>>features[0].get("param");
    if (isArrows) {
      super.remove(id);
      param.positions = position;
      this.addLineArrows(param);
    } else {
      features[0].getGeometry()?.setCoordinates(position);
    }
    return features;
  }
  /**
   * @description: 修改飞线坐标
   * @param {string} id id
   * @param {Coordinate} position 坐标
   * @return {*} void
   * @author: wuyue.nan
   */
  setFlightPosition(id: string, position: Coordinate[]): void {
    const flightline = this.flyCatch.get(id);
    if (flightline) {
      flightline.setPosition(id, position);
    }
  }
  /**
   * @description: 删除飞行线
   * @param {string} id 飞行线ID
   * @return {*} void
   * @author: wuyue.nan
   */
  removeFlightLine(id: string): void {
    const flightline = this.flyCatch.get(id);
    if (flightline) {
      flightline.removeFeatureById(id);
    }
  }
}