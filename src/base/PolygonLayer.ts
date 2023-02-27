import { Utils } from "../common";
import Earth from "Earth";
import { IPolygonParam } from "interface";
import { Feature } from "ol";
import { Geometry, Polygon } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Stroke, Fill } from "ol/style";
import Base from "./Base";
import Text from "ol/style/Text";

export default class PolygonLayer<T = unknown> extends Base {
  constructor(earth: Earth) {
    const layer = new VectorLayer({
      source: new VectorSource()
    })
    super(earth, layer)
  }
  private createFeature(param: IPolygonParam<T>): Feature {
    const feature = new Feature({
      geometry: new Polygon([param.positions])
    })
    const style = new Style({
      stroke: new Stroke(Object.assign({
        color: "#388bff",
        width: 2
      }, param.stroke)),
      fill: new Fill(Object.assign({
        color: '#ffffff57',
      }, param.fill)),
      text: new Text({
        text: param.label?.text,
        font: param.label?.font,
        offsetX: param.label?.offsetX,
        offsetY: param.label?.offsetY,
        scale: param.label?.scale,
        textAlign: param.label?.textAlign,
        textBaseline: param.label?.textBaseline,
        fill: new Fill({
          color: param.label?.fill?.color
        }),
        stroke: new Stroke({
          color: param.label?.stroke?.color || "#0000",
          width: param.label?.stroke?.width || 0
        }),
        backgroundFill: new Fill({
          color: param.label?.backgroundFill?.color || "#0000"
        }),
        backgroundStroke: new Stroke({
          color: param.label?.backgroundStroke?.color || "#0000",
          width: param.label?.backgroundStroke?.width || 0
        }),
        padding: param.label?.padding,
      })
    })
    feature.setStyle(style)
    feature.setId(param.id);
    feature.set("data", param.data);
    feature.set("module", param.module)
    return feature
  }
  /**
   * @description: 增加一个元素
   * @param {IPointParam} param 详细参数 
   * @return {*} Feature<Geometry>
   * @author: wuyue.nan
   */
  add(param: IPolygonParam<T>): Feature<Geometry> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    return super.save(feature);
  }
}