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