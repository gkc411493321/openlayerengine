/*
 * @Description: 覆盖物操作
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-03-02 17:16:32
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-03-03 15:30:21
 */
import { Utils } from "../common";
import Earth from "../Earth";
import { IOverlayParam } from "../interface";
import { Map, Overlay } from "ol";
import { Coordinate } from "ol/coordinate";

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
   * @description: 修改覆盖物位置
   * @param {string} id ID
   * @param {Coordinate} position 坐标
   * @return {*} Overlay
   * @author: wuyue.nan
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
   * @description: 获取所有覆盖物
   * @return {*}  Overlay[]
   * @author: wuyue.nan
   */
  get(): Overlay[];
  /**
   * @description: 根据ID获取覆盖物
   * @return {*} Overlay
   * @author: wuyue.nan
   */
  get(id: string): Overlay;
  /**
   * @description: 覆盖物获取方法
   * @param {string} id id
   * @return {*} Overlay[] | Overlay
   * @author: wuyue.nan
   */
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