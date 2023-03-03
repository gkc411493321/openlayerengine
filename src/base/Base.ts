import Earth from "../Earth";
import { IFill, ILabel, IStroke } from "../interface";
import { Feature } from "ol";
import { Circle, Geometry, LineString, Point, Polygon } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Stroke, Fill, Text, Icon } from "ol/style";

export default class Base {
  public layer: VectorLayer<VectorSource<Geometry>>;
  private hideFeatureMap: Map<string, Feature<Geometry>> = new Map;
  constructor(protected earth: Earth, layer: VectorLayer<VectorSource<Geometry>>) {
    this.layer = layer;
    earth.map.addLayer(layer);
  }
  protected setStroke(style: Style, param?: IStroke, width?: number): Style {
    const stroke = new Stroke(Object.assign({
      color: param?.color || style.getStroke()?.getColor() || "#ffcc33",
      width: width || style.getStroke()?.getWidth() || 2,
      lineDash: param?.lineDash || style.getStroke()?.getLineDash()
    }, param));
    style.setStroke(stroke)
    return style;
  }
  protected setFill(style: Style, param?: IFill): Style {
    const fill = new Fill(Object.assign({
      color: param?.color || style.getFill()?.getColor() || '#ffffff57',
    }, param));
    style.setFill(fill)
    return style;
  }
  protected setText(style: Style, param?: ILabel, offsetY?: number): Style {
    const text = new Text({
      text: param?.text || style.getText()?.getText(),
      font: param?.font || style.getText()?.getFont(),
      offsetX: param?.offsetX || style.getText()?.getOffsetX(),
      offsetY: param?.offsetY || offsetY || style.getText()?.getOffsetY(),
      scale: param?.scale || style.getText()?.getScale(),
      textAlign: param?.textAlign || style.getText()?.getTextAlign(),
      textBaseline: param?.textBaseline || style.getText()?.getTextBaseline(),
      rotation: param?.rotation || style.getText()?.getRotation(),
      fill: new Fill({
        color: param?.fill?.color || style.getText()?.getFill().getColor()
      }),
      stroke: new Stroke({
        color: param?.stroke?.color || style.getText()?.getStroke().getColor() || "#0000",
        width: param?.stroke?.width || style.getText()?.getStroke().getWidth() || 0
      }),
      backgroundFill: new Fill({
        color: param?.backgroundFill?.color || style.getText()?.getBackgroundFill().getColor() || "#0000"
      }),
      backgroundStroke: new Stroke({
        color: param?.backgroundStroke?.color || style.getText()?.getBackgroundStroke().getColor() || "#0000",
        width: param?.backgroundStroke?.width || style.getText()?.getBackgroundStroke().getWidth() || 0
      }),
      padding: param?.padding || style.getText()?.getPadding() || undefined,
    })
    style.setText(text)
    return style;
  }
  /**
   * @description: 添加元素
   * @param {Feature} feature
   * @return {*}
   * @author: wuyue.nan
   */
  protected save(feature: Feature<Geometry>): Feature<Geometry> {
    this.layer.getSource()?.addFeature(feature);
    return feature;
  }
  /**
   * @description: 删除图层所有元素
   * @return {*} void
   * @author: wuyue.nan
   */
  remove(): void;
  /**
   * @description: 删除图层指定元素
   * @param {string} id
   * @return {*} void
   * @author: wuyue.nan
   */
  remove(id: string): void;
  /**
   * @description: 删除元素
   * @param {string} id
   * @return {*} void
   * @author: wuyue.nan
   */
  remove(id?: string): void {
    if (id) {
      this.layer.getSource()?.removeFeature(this.get(id)[0]);
    } else {
      this.layer.getSource()?.clear()
    }
  }
  /**
   * @description: 获取所有元素
   * @return {*} Feature<Geometry>[];
   * @author: wuyue.nan
   */
  get(): Feature<Geometry>[];
  /**
   * @description: 获取指定元素
   * @param {string} id 元素id
   * @return {*} Feature<Geometry>[];
   * @author: wuyue.nan
   */
  get(id: string): Feature<Geometry>[];
  /**
   * @description: 获取元素，如不传ID则返回图层所有元素
   * @param {string} id 元素id
   * @return {*} Feature<Geometry>[]
   * @author: wuyue.nan
   */
  get(id?: string): Feature<Geometry>[] {
    let features: Feature<Geometry>[] = [];
    if (id) {
      const feature = this.layer.getSource()?.getFeatureById(id);
      if (feature) features.push(feature)
    } else {
      const feature = this.layer.getSource()?.getFeatures();
      if (feature) features = feature;
    }
    return features;
  }
  /**
   * @description: 隐藏所有元素
   * @return {*} void
   * @author: wuyue.nan
   */
  hide(): void;
  /**
   * @description: 按id隐藏元素
   * @param {string} id 元素id
   * @return {*} void
   * @author: wuyue.nan
   */
  hide(id: string): void;
  /**
   * @description: 隐藏元素，如不传ID则隐藏图层所有元素
   * @param {string} id 元素id
   * @return {*} void
   * @author: wuyue.nan
   */
  hide(id?: string): void {
    if (id) {
      const feature = this.get(id);
      if (feature[0] == undefined) {
        console.warn("没有找到元素，请检查ID");
        return;
      }
      this.hideFeatureMap.set(id, feature[0]);
      this.remove(id);
    } else {
      this.layer.setVisible(false);
    }
  }
  /**
   * @description: 显示所有元素
   * @return {*} void
   * @author: wuyue.nan
   */
  show(): void;
  /**
   * @description: 根据ID显示元素
   * @param {string} id 元素id
   * @return {*} void
   * @author: wuyue.nan
   */
  show(id: string): void;
  /**
   * @description: 显示元素，如不传ID则显示图层所有元素
   * @param {string} id
   * @return {*} void
   * @author: wuyue.nan
   */
  show(id?: string): void {
    if (id) {
      const feature = this.hideFeatureMap.get(id);
      if (feature) this.save(feature);
      this.hideFeatureMap.delete(id);
    } else {
      this.hideFeatureMap.clear();
      this.layer.setVisible(true);
    }
  }
  /**
   * @description: 设置图层Z-Index
   * @param {number} index 层级
   * @return {*} void
   * @author: wuyue.nan
   */
  setLayerIndex(index: number): void {
    this.layer.setZIndex(index);
  }
  /**
   * @description: 移除图层
   * @return {*} boolean
   * @author: wuyue.nan
   */
  destroy(): boolean {
    let flag = this.earth.removeImageryProvider(this.layer);
    if (flag) {
      return true;
    } else {
      return false;
    }
  }
}