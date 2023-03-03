/*
 * @Description: 覆盖物操作
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-03-02 17:16:32
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-03-03 09:16:01
 */
import { Utils } from "../common";
import Earth from "../Earth";
import { IOverlayParam } from "../interface";
import { Map, Overlay } from "ol";

export default class OverlayLayer<T = unknown>{
  private map: Map;
  constructor(earth: Earth) {
    this.map = earth.map
  }
  /**
   * @description: 增加一个覆盖物
   * @param {IOverlayParam} param 详细参数
   * @return {*} Overlay
   * @author: wuyue.nan
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
   * @description: 移除所有覆盖物
   * @return {*} Overlay[] | Overlay
   * @author: wuyue.nan
   */
  remove(): Overlay[] | Overlay;
  /**
   * @description: 根据ID移除覆盖物
   * @return {*} Overlay[] | Overlay
   * @author: wuyue.nan
   */
  remove(id: string): Overlay[] | Overlay;
  /**
   * @description: 覆盖物删除方法
   * @param {string} id 覆盖物ID
   * @return {*} Overlay[] | Overlay
   * @author: wuyue.nan
   */
  remove(id?: string): Overlay[] | Overlay {
    if (id) {
      const overlay = this.map.getOverlayById(id);
      this.map.removeOverlay(overlay);
      return overlay;
    } else {
      const overlays = this.map.getOverlays();
      overlays.forEach(item => {
        this.map.removeOverlay(item);
      })
      return overlays.getArray();
    }
  }
}