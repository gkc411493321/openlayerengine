import Earth from "Earth";
import { IBillboardParam, ISetBillboardParam } from "../interface";
import { Feature } from "ol";
import { Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Icon, Style, Text } from "ol/style";
import Base from "./Base";
import { Utils } from "../common";
import { Coordinate } from "ol/coordinate";
/**
 * 创建广告牌`Billboard`
 */
export default class BillboardLayer<T = unknown> extends Base {
  /**
   * 构造器
   * @param earth 地图实例
   * @example
   * ```
   * const billboardLayer = new  BillboardLayer(useEarth());
   * ```
   */
  constructor(earth: Earth) {
    const layer = new VectorLayer({
      source: new VectorSource()
    })
    super(earth, layer, "Billboard")
  }
  /**
   * 创建矢量元素
   * @param param 广告牌详细参数，详见{@link IBillboardParam}
   * @returns 返回`Feature<Point>`矢量元素
   */
  private createFeature(param: IBillboardParam<T>): Feature<Point> {
    const feature = new Feature({
      geometry: new Point(param.center)
    })
    const icon = new Icon({
      src: param.src,
      size: param.size,
      color: param.color,
      displacement: param.displacement,
      scale: param.scale,
      rotation: param.rotation,
      anchor: param.anchor,
      anchorOrigin: param.anchorOrigin,
      anchorXUnits: param.anchorXUnits,
      anchorYUnits: param.anchorYUnits,
    })
    let style = new Style();
    style = super.setText(style, param.label);
    style.setImage(icon);
    feature.setStyle(style);
    feature.setId(param.id);
    feature.set("data", param.data);
    feature.set("module", param.module);
    feature.set("layerId", this.layer.get("id"));
    return feature;
  }
  /**
   * 创建广告牌`Billboard`
   * @param param 广告牌详细参数，详见{@link IBillboardParam}
   * @returns 返回`Feature<Point>`矢量元素
   * @example
   * ```
   * const billboardLayer = new  BillboardLayer(useEarth());
   * billboardLayer.add({
   *  // ...
   * })
   * ```
   */
  add(param: IBillboardParam<T>): Feature<Point> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    return <Feature<Point>>super.save(feature);
  }
  /**
   * 修改广告牌`Billboard`
   * @param param 广告牌详细参数，详见{@link ISetBillboardParam}
   * @returns 返回修改后的`Feature<Point>`矢量元素
   * @example
   * ```
   * const billboardLayer = new  BillboardLayer(useEarth());
   * billboardLayer.set({
   *  // ...
   * })
   * ```
   */
  set(param: ISetBillboardParam): Feature<Point>[] {
    const features = <Feature<Point>[]>super.get(param.id);
    if (param.center) {
      this.setPosition(param.id, param.center);
    }
    if (features[0] == undefined) {
      console.warn("没有找到元素，请检查ID");
      return [];
    }
    const style = <Style>features[0].getStyle();
    const oldIcon = <Icon>style.getImage();
    const iconOptions: { [key: string]: any } = {
      src: param.src || oldIcon.getSrc(),
      size: param.size || oldIcon.getSize(),
      color: param.color || oldIcon.getColor(),
      displacement: param.displacement || oldIcon.getDisplacement(),
      scale: param.scale || oldIcon.getScale(),
      rotation: param.rotation || oldIcon.getRotation(),
      anchor: param.anchor || oldIcon.getAnchor(),
    }
    for (const key in iconOptions) {
      if (iconOptions[key] == null) {
        delete iconOptions[key]
      }
    }
    const newIcon = new Icon(iconOptions)
    const newStyle = super.setText(style, param.label);
    style.setImage(newIcon);
    features[0].setStyle(newStyle);
    return features;
  }
  /**
   * 修改广告牌坐标位置
   * @param id 广告牌ID
   * @param position 位置信息
   * @returns 返回修改后的`Feature<Point>`矢量元素
   * @example
   * ```
   * const billboardLayer = new  BillboardLayer(useEarth());
   * billboardLayer.setPosition("billboard_1", fromLonLat([160, 60]));
   * ```
   */
  setPosition(id: string, position: Coordinate): Feature<Point>[] {
    const features = <Feature<Point>[]>super.get(id);
    if (features[0] == undefined) {
      console.warn("没有找到元素，请检查ID");
      return [];
    }
    const geometry = <Point>features[0].getGeometry();
    geometry.setCoordinates(position);
    return features;
  }
}