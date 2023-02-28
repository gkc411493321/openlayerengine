/*
 * @Description: 线操作
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-28 10:21:18
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-02-28 18:31:51
 */
import { Utils } from "../common";
import Earth from "../Earth";
import { IPolylineParam } from "../interface";
import { Feature } from "ol";
import { Geometry, LineString, Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, Icon, Stroke, Style } from "ol/style";
import Base from "./Base";
import { StyleLike } from "ol/style/Style";
import { fromLonLat } from "ol/proj";
import { Coordinate } from "ol/coordinate";
import Vector from "ol/source/Vector";
import { GeoJSON } from 'ol/format';


export default class Polyline<T = unknown> extends Base {
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
   * @return {*} Feature<Geometry>
   * @author: wuyue.nan
   */
  add(param: IPolylineParam<T>): Feature<Geometry> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    return super.save(feature);
  }
  /**
   * @description: 增加带箭头的线段
   * @param {IPolylineParam} param 详细参数
   * @param {boolean} repeat 是否重复绘制箭头，默认false。true：除起始点外每个点都带箭头；false:只有结束点存在箭头
   * @return {*} Feature<Geometry>
   * @author: wuyue.nan
   */
  addLineArrows(param: IPolylineParam<T>, repeat?: boolean): Feature<Geometry> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    const geometry = feature.getGeometry();
    const styles: any = [];
    const style = feature.getStyle();
    if (style) styles.push(style);
    if (repeat) {
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
    feature.set("module", param.module)
    return super.save(feature);
  }
  /**
   * @description: 绘制流动线
   * @param {IPolylineParam} param 详细参数
   * @return {*} Feature<Geometry>
   * @author: wuyue.nan
   */
  addFlowingDash(param: IPolylineParam<T>, fullLineColor?: string, dottedLineColor?: string): Feature<Geometry> {
    param.id = param.id || Utils.GetGUID();
    const feature: any = this.createFeature(param);
    let textStyle = new Style();
    textStyle = super.setText(textStyle, param.label);
    const fullLineStyle = new Style({
      stroke: new Stroke({
        color: fullLineColor || "rgba(30,144,255, 1)",
        width: param.width || 2,
        lineDash: [0]
      }),
    })
    const dottedLineStyle = new Style({
      stroke: new Stroke({
        color: dottedLineColor || "rgba(255, 250, 250, 1)",
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
          color: dottedLineColor || "rgba(255, 250, 250, 1)",
          width: param.width || 2,
          lineDash: [10, 25],
          lineDashOffset: lineDashOffset == 100 ? 0 : lineDashOffset - 2
        }),
      })
      feature.setStyle([fullLineStyle, newDottedLineStyle, textStyle])
    })
    return super.save(feature);
  }
}