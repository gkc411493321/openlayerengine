import { Utils } from "../common";
import Earth from "../Earth";
import { IOverlayParam, ISetOverlayParam } from "../interface";
import { Map, Overlay } from "ol";
import { Coordinate } from "ol/coordinate";

/**
 * 创建覆盖物`Overlay`
 */
export default class OverlayLayer<T = unknown>{
  /**
   * 地图map对象
   */
  private map: Map;
  /**
   * 构造器
   * @param earth 地图实例
   * @example
   * ```
   * const overlayLayer = new OverlayLayer(useEarth()); 
   * ```
   */
  constructor(earth: Earth) {
    this.map = earth.map
  }
  /**
   * 添加覆盖物
   * @param param 覆盖物详细参数，详见{@link IOverlayParam}
   * @returns 返回`Overlay`实例
   * @example
   * ```
   * const overlayLayer = new OverlayLayer(useEarth());
   * // element 可以有多种方式创建
   * const div = document.getElementById("prop");
   * overlayLayer.add({
   *  // ...
   *  element:div,
   *  // ...
   * })
   */
  add(param: IOverlayParam<T>): Overlay {
    const overlay = new Overlay({
      id: param.id || Utils.GetGUID(),
      element: param.element,
      position: param.position,
      offset: param.offset,
      positioning: param.positioning,
      stopEvent: param.stopEvent,
      insertFirst: param.insertFirst,
      autoPan: param.autoPan,
      className: param.className
    });
    this.map.addOverlay(overlay);
    return overlay;
  }
  /**
   * 修改覆盖物
   * @param param 覆盖物详细参数，详见{@link ISetOverlayParam}
   * @returns 返回`Overlay`实例或`null`
   * @example
   * ```
   * const overlayLayer = new OverlayLayer(useEarth());
   * overlayLayer.set({
   *  // ...
   * })
   */
  set(param: ISetOverlayParam): Overlay | null {
    const overlay = this.get(param.id);
    if (overlay == undefined) {
      console.warn("没有找到元素，请检查ID");
      return null;
    }
    if (param.position) {
      overlay.setPosition(param.position);
    }
    if (param.element) {
      overlay.setElement(param.element);
    }
    if (param.offset) {
      overlay.setOffset(param.offset);
    }
    if (param.positioning) {
      overlay.setPositioning(param.positioning);
    }
    return overlay;
  }
  /**
   * 修改覆盖物坐标
   * @param id 覆盖物id
   * @param position 覆盖物位置信息
   * @returns 返回`Overlay`实例或`null`
   * @example
   * ```
   * const overlayLayer = new OverlayLayer(useEarth());
   * overlayLayer.setPosition("overlay_x", fromLonLat([120, 22]));
   * ```
   */
  setPosition(id: string, position: Coordinate): Overlay | null {
    const overlay = this.get(id);
    if (overlay == undefined) {
      console.warn("没有找到元素，请检查ID");
      return null;
    }
    overlay.setPosition(position);
    return overlay;
  }
  /**
   * 获取地图内所有覆盖物实例
   * @returns 返回`Overlay`实例数组
   * @example
   * ```
   * const overlayLayer = new OverlayLayer(useEarth());
   * overlayLayer.get();
   * ```
   */
  get(): Overlay[];
  /**
   * 获取指定覆盖物实例
   * @param id 覆盖物id
   * @returns 返回`Overlay`实例数组
   * @example
   * ```
   * const overlayLayer = new OverlayLayer(useEarth());
   * overlayLayer.get("1");
   * ```
   */
  get(id: string): Overlay;
  get(id?: string): Overlay[] | Overlay {
    if (id) {
      const overlay = this.map.getOverlayById(id);
      return overlay;
    } else {
      const overlays = this.map.getOverlays().getArray();
      return overlays;
    }
  }
  /**
   * 移除地图内所有覆盖物
   * @returns 返回`Overlay`实例数组
   * @example
   * ```
   * const overlayLayer = new OverlayLayer(useEarth());
   * overlayLayer.remove();
   * ```
   */
  remove(): Overlay[] | Overlay;
  /**
   * 移除指定覆盖物
   * @param id 覆盖物id
   * @returns 返回`Overlay`实例
   * @example
   * ```
   * const overlayLayer = new OverlayLayer(useEarth());
   * overlayLayer.remove("1");
   * ```
   */
  remove(id: string): Overlay[] | Overlay;
  remove(id?: string): Overlay[] | Overlay {
    if (id) {
      const overlay = this.get(id);
      if (overlay == undefined) {
        console.warn("没有找到元素，请检查ID");
        return [];
      }
      this.map.removeOverlay(overlay);
      return overlay;
    } else {
      const overlays = this.get();
      overlays.forEach(item => {
        this.map.removeOverlay(item);
      })
      return overlays;
    }
  }
}