import { Utils } from "../common";
import Earth from "../Earth";
import { IPolygonParam } from "../interface";
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
    let style = new Style();
    style = super.setStroke(style, param.stroke);
    style = super.setFill(style, param.fill);
    style = super.setText(style, param.label);
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