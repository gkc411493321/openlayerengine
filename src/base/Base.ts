import Earth from "Earth";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

/*
 * @Description: 图层操作基类
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-23 13:30:45
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-02-27 17:44:08
 */
/**
 * 附加数据
 */
export interface IBaseData<T> {
  /** 模块名称 */ module?: string;
  /** 附加数据 */ data?: T;
}
/**
 * 新增元素的基础参数
 */
export interface IAddBaseParam<T> extends IBaseData<T> {
  /** 唯一ID */ id?: string;
}
interface ICollection {
  add: (arg: any) => any;
  show: boolean;
  remove: (arg: any) => boolean;
  removeAll: () => void;
}
/**
 * 缓存数据
 */
interface ICache<P, D> {
  primitive: P;
  data: D;
}
export default class Base {
  public layer: VectorLayer<VectorSource<Geometry>>;
  public hideFeatureMap: Map<string, Feature<Geometry>> = new Map;
  constructor(protected earth: Earth, layer: VectorLayer<VectorSource<Geometry>>) {
    this.layer = layer;
    earth.map.addLayer(layer);
  }
  /**
   * @description: 添加元素
   * @param {Feature} feature
   * @return {*}
   * @author: wuyue.nan
   */
  save(feature: Feature<Geometry>): Feature<Geometry> {
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