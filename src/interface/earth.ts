import WindLayer from "../base/WindLayer";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { Layer } from "ol/layer";
import LayerRenderer from "ol/renderer/Layer";
import { Source } from "ol/source";
import { BillboardLayer, CircleLayer, OverlayLayer, PointLayer, PolygonLayer, PolylineLayer } from "../base";

export interface DefaultEntities<T = unknown> {
  /**
   * 广告牌
   */
  billboard: BillboardLayer<T>;
  /**
   * 圆
   */
  circle: CircleLayer<T>;
  /**
   * 覆盖物
   */
  overlay: OverlayLayer<T>;
  /**
   * 点
   */
  point: PointLayer<T>;
  /**
   * 多边形
   */
  polygon: PolygonLayer<T>;
  /**
   * 线
   */
  polyline: PolylineLayer<T>;
  /**
   * 风场
   */
  wind: WindLayer;
  /**
   * 重置方法
   */
  reset: () => void;
}
export interface IEarthConstructorOptions {
  /**
   * 地图容器ID
   */
  target?: string;
  /**
   * 缩放控件，默认关闭
   */
  zoom?: boolean;
  /**
   * 旋转控件，默认关闭
   */
  rotate?: boolean;
  /**
   * 归属控件，默认关闭
   */
  attribution?: boolean;
}
export interface IFeatureAtPixel {
  /**
   * 是否存在元素
   */
  isExists: boolean;
  /**
   * 元素id
   */
  id?: string;
  /**
   * 元素模块
   */
  module?: string;
  /**
   * 元素
   */
  feature?: Feature<Geometry>;
  /**
   * 元素所在图层
   */
  layer?: Layer<Source, LayerRenderer<any>>;
}