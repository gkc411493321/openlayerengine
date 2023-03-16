import { Utils } from "../common";
import Earth from "../Earth";
import { IPolylineFlyParam, IPolylineParam, ISetPolylineParam } from "../interface";
import { Feature } from "ol";
import { LineString, Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Icon, Stroke, Style } from "ol/style";
import Base from "./Base";
import { Coordinate } from "ol/coordinate";
import Flightline from "../extends/flight-line/FlightLine";

/**
 * 创建线`Polyline`
 */
export default class Polyline<T = unknown> extends Base {
  /**
   * 飞线缓存集合
   */
  private flyCatch: Map<string, Flightline> = new Map();
  /**
   * 构造器
   * @param earth 地图实例
   * @example
   * ```
   * const polyline = new Polyline(useEarth());
   * ``` 
   */
  constructor(earth: Earth) {
    const layer = new VectorLayer({
      source: new VectorSource()
    })
    super(earth, layer, "Polyline");
  }
  /**
   * 创建矢量元素
   * @param param 详细参数，详见{@link IPolylineParam} 
   * @returns 返回`Feature<LineString>`实例
   */
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
    feature.set("param", param);
    feature.set("data", param.data);
    feature.set("module", param.module);
    feature.set("layerId", this.layer.get("id"));
    return feature
  }
  /**
   * 创建样式
   * @param start 开始点 
   * @param end 结束点
   * @param color 填充颜色
   * @returns 返回`Style`
   */
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
   * 增加带箭头的线段
   * @param param 详细参数，详见{@link IPolylineParam}
   * @returns 返回`Feature<LineString>`
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
      const start = param.positions[param.positions.length - 2];
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
   * 增加流动线段
   * @param param 详细参数，详见{@link IPolylineParam}
   * @returns 返回`Feature<LineString>`
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
   * 添加线段
   * @param param 详细参数，详见{@link IPolylineParam} 
   * @returns 返回`Feature<LineString>`
   * @example
   * ```
   * const polyline = new Polyline(useEarth());
   * polyline.add({
   *  // ...
   * })
   * ```
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
   * 添加飞行线
   * @param param 详细参数，详见{@link IPolylineFlyParam} 
   * @returns 返回`Flightline`
   * @example
   * ```
   * const polyline = new Polyline(useEarth());
   * polyline.addFlightLine({
   *  // ...
   * })
   * ```
   */
  addFlightLine(param: IPolylineFlyParam<T>): Flightline {
    param.id = param.id || Utils.GetGUID();
    const flightline = new Flightline(this.layer, param, param.id);
    this.flyCatch.set(param.id, flightline);
    return flightline;
  }
  /**
   * 修改线段坐标
   * @param id `polyline`id
   * @param position 坐标
   * @returns 返回`Feature<LineString>`实例数组
   * @example
   * ```
   * const polyline = new Polyline(useEarth());
   * polyline.setPosition("1", [fromLonLat([100, 70]), fromLonLat([100, 50])]);
   * ```
   */
  setPosition(id: string, position: Coordinate[]): Feature<LineString>[] {
    const features = <Feature<LineString>[]>super.get(id);
    if (features[0] == undefined) {
      console.warn("没有找到元素，请检查ID");
      return [];
    }
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
   * 修改飞线坐标
   * @param id `flyLine`id
   * @param position 坐标
   * @example
   * ```
   * const polyline = new Polyline(useEarth());
   * polyline.setFlightPosition("1", [fromLonLat([100, 70]), fromLonLat([100, 50])]);
   * ```
   */
  setFlightPosition(id: string, position: Coordinate[]): void {
    const flightline = this.flyCatch.get(id);
    if (flightline) {
      flightline.setPosition(id, position);
    }
  }
  /**
   * 删除所有飞行线
   * @example
   * ```
   * const polyline = new Polyline(useEarth());
   * polyline.removeFlightLine();
   * ```
   */
  removeFlightLine(): void;
  /**
   * 删除指定飞行线
   * @param id `flyLine`id
   * @example
   * ```
   * const polyline = new Polyline(useEarth());
   * polyline.removeFlightLine("1");
   * ```
   */
  removeFlightLine(id: string): void;
  removeFlightLine(id?: string): void {
    if (id) {
      const flightline = this.flyCatch.get(id);
      if (flightline) {
        flightline.removeFeatureById(id);
        this.flyCatch.delete(id);
      }
    } else {
      this.flyCatch.forEach((item, key) => {
        item.removeFeatureById(key)
      })
      this.flyCatch.clear();
    }
  }
  /**
   * 修改线。注意，此方法不适用飞行线修改
   * @param param 线参数，详见{@link ISetPolylineParam} 
   * @returns 返回`Feature<LineString>`实例
   * @example
   * ```
   * const polyline = new Polyline(useEarth());
   * polyline.set({
   *  // ...
   * })
   * ```
   */
  set(param: ISetPolylineParam): Feature<LineString> | null {
    const features = <Feature<LineString>[]>super.get(param.id);
    if (features[0] == undefined) {
      console.warn("没有找到元素，请检查ID");
      return null;
    }
    super.remove(param.id);
    const oldParam = <IPolylineParam<T>>features[0].get("param");
    const newParam = Object.assign(oldParam, param);
    return this.add(newParam);
  }
}