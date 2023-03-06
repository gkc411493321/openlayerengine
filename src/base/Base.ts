import Earth from "../Earth";
import { IFill, ILabel, IStroke } from "../interface";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Stroke, Fill, Text, Icon } from "ol/style";
/**
 * 基类，提供图层常见的获取，删除及更新方法
 */
export default class Base {
  /**
   * 销毁标记
   */
  public allowDestroyed: boolean = true;
  /**
   * 图层
   */
  public layer: VectorLayer<VectorSource<Geometry>>;
  /**
   * 缓存featur的集合
   */
  private hideFeatureMap: Map<string, Feature<Geometry>> = new Map;
  /**
   * 图层构造类
   * @param earth 地图实例
   * @param layer 图层实例
   */
  constructor(protected earth: Earth, layer: VectorLayer<VectorSource<Geometry>>) {
    this.layer = layer;
    earth.map.addLayer(layer);
  }
  /**
   * 设置描边样式
   * @param style style实例 
   * @param param 描边参数，`可选的`。详见{@link IStroke}
   * @param width 宽度，`可选的`
   * @returns 返回style实例
   */
  protected setStroke(style: Style, param?: IStroke, width?: number): Style {
    const stroke = new Stroke(Object.assign({
      color: param?.color || style.getStroke()?.getColor() || "#ffcc33",
      width: width || style.getStroke()?.getWidth() || 2,
      lineDash: param?.lineDash || style.getStroke()?.getLineDash()
    }, param));
    style.setStroke(stroke)
    return style;
  }
  /**
   * 设置填充样式
   * @param style style实例
   * @param param 填充参数，`可选的`。详见{@link IFill}
   * @returns 返回style实例
   */
  protected setFill(style: Style, param?: IFill): Style {
    const fill = new Fill(Object.assign({
      color: param?.color || style.getFill()?.getColor() || '#ffffff57',
    }, param));
    style.setFill(fill)
    return style;
  }
  /**
   * 设置文本样式
   * @param style style实例 
   * @param param 文本参数，`可选的`。详见{@link ILabel}
   * @param offsetY 纵向偏移量，`可选的`。
   * @returns 返回style实例
   */
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
   * 往图层添加一个矢量元素
   * @param feature 矢量元素实例
   * @returns 返回矢量元素实例
   */
  protected save(feature: Feature<Geometry>): Feature<Geometry> {
    this.layer.getSource()?.addFeature(feature);
    return feature;
  }
  /**
   * 删除图层所有矢量元素
   * @example
   * ```
   * layer.remove();
   * ```
   */
  remove(): void;
  /**
   * 删除图层指定矢量元素元素
   * @param id 矢量元素id
   * @example
   * ```
   * layer.remove("1");
   * ```
   */
  remove(id: string): void;
  remove(id?: string): void {
    if (id) {
      this.layer.getSource()?.removeFeature(this.get(id)[0]);
    } else {
      this.layer.getSource()?.clear()
    }
  }
  /**
   * 获取图层中所有矢量元素
   * @returns 返回矢量元素数组
   * @example
   * ```
   * const features:Feature<Geometry>[] = layer.get();
   * ```
   */
  get(): Feature<Geometry>[];
  /**
   * 获取图层中指定矢量元素
   * @param id 矢量元素id
   * @returns 返回矢量元素数组
   * @example
   * ```
   * const features:Feature<Geometry>[] = layer.get("1");
   * ```
   */
  get(id: string): Feature<Geometry>[];
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
   * 隐藏图层所有矢量元素
   * @example
   * ```
   * layer.hide();
   * ```
   */
  hide(): void;
  /**
   * 隐藏图层指定矢量元素
   * @param id 矢量元素id
   * @example
   * ```
   * layer.hide("1");
   * ```
   */
  hide(id: string): void;
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
   * 显示图层所有矢量元素
   * @example
   * ```
   * layer.show();
   * ```
   */
  show(): void;
  /**
   * 显示图层指定矢量元素
   * @param id 矢量元素id
   * @example
   * ```
   * layer.show("1");
   * ```
   */
  show(id: string): void;
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
   * 设置图层`z-index`等级
   * @param index 等级
   * @example
   * ```
   * layer.setLayerIndex(999)
   * ```
   */
  setLayerIndex(index: number): void {
    this.layer.setZIndex(index);
  }
  /**
   * 销毁图层，同时销毁该图层所有元素，不可恢复
   * @returns 返回boolean值
   * @example
   * ```
   * const flag:boolean = layer.destroy();
   * ```
   */
  destroy(): boolean {
    if (this.allowDestroyed) {
      let flag = this.earth.removeLayer(this.layer);
      if (flag) {
        return true;
      } else {
        return false;
      }
    } else {
      console.warn("该图层受到保护，无法被销毁");
      return false;
    }
  }
}