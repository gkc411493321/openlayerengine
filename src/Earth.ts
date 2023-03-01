/*
 * @Description: 
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-23 18:12:58
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-03-01 11:05:45
 */
import { Map, View } from "ol";
import { defaults } from 'ol/control/defaults';
import { Coordinate } from "ol/coordinate";
import BaseLayer from "ol/layer/Base";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from "ol/proj";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import { TileCoord } from "ol/tilecoord";
import { ViewOptions } from "ol/View";

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

export default class Earth {
  public map: Map;
  public view: View;
  public center: number[] = fromLonLat([119, 39]);
  constructor(viewOptions?: ViewOptions, options?: IEarthConstructorOptions) {
    const el = options?.target || 'olContainer';
    const map: Map = new Map({
      target: el,
      view: new View(Object.assign({
        center: this.center,
        zoom: 4
      }, viewOptions)),
      controls: defaults(Object.assign({
        zoom: false,
        rotate: false,
        attribution: false
      }, options))
    })
    this.map = map;
    this.view = map.getView();
  }
  /**
   * @description: 8位字符串补0
   * @param {number} num
   * @param {number} len
   * @param {number} radix
   * @return {*}
   * @author: wuyue.nan
   */
  private zeroFill(num: number, len: number, radix: number): string {
    return num.toString(radix || 10).padStart(len, '0');
  }
  /**
   * @description: 创建OSM底图图层
   * @return {TileLayer<OSM>} OSM底图
   * @author: wuyue.nan
   */
  /** */
  createOsmLayer(): TileLayer<OSM> {
    return new TileLayer({
      source: new OSM(),
    })
  }
  /**
   * @description: 创建瓦片底图图层
   * @param {string} url 地图瓦片地址
   * @return {TileLayer<XYZ>} TileLayer<XYZ>
   * @author: wuyue.nan
   */
  createXyzLayer(url: string): TileLayer<XYZ> {
    return new TileLayer({
      properties: {
        id: "imageProvider"
      },
      source: new XYZ({
        tileUrlFunction: (coordinate: TileCoord) => {
          const x = 'C' + this.zeroFill(coordinate[1], 8, 16).toUpperCase();
          const y = 'R' + this.zeroFill(coordinate[2], 8, 16).toUpperCase();
          const z = 'L' + this.zeroFill(coordinate[0], 2, 10).toUpperCase();
          return `${url}/` + z + '/' + y + '/' + x + '.jpg';
        },
        projection: 'EPSG:3857'
      }),
    })
  }
  /**
   * @description: 添加影像层
   * @param {BaseLayer} layer
   * @return {*} void
   * @author: wuyue.nan
   */
  addImageryProvider(layer: BaseLayer): void {
    this.map.addLayer(layer);
  }
  /**
   * @description: 删除影像层
   * @param {BaseLayer} layer
   * @return {*} 返回被删除的图层或undefined
   * @author: wuyue.nan
   */
  removeImageryProvider(layer?: BaseLayer): BaseLayer | undefined {
    let removeLayer;
    if (layer) {
      removeLayer = this.map.removeLayer(layer);
    } else {
      const layers = this.map.getAllLayers();
      layers.map(item => {
        if (item.get("id") == "imageProvider") {
          removeLayer = this.map.removeLayer(item);
        }
      })
    }
    return removeLayer
  }
  /**
   * @description: 移动相机到默认位置
   * @return {*} void
   * @author: wuyue.nan
   */
  flyHome(): void {
    this.view.animate({
      center: this.center,
      zoom: 4,
      duration: 2000
    });
  }
  /**
   * @description: 移动相机到指定位置(动画)
   * @param {Coordinate} position 位置
   * @param {number} zoom 缩放
   * @param {number} duration 动画时间(毫秒)
   * @return {*} void
   * @author: wuyue.nan
   */
  animateFlyTo(position: Coordinate, zoom?: number, duration?: number): void {
    this.view.animate({
      center: position,
      zoom: zoom || this.view.getZoom(),
      duration: duration || 2000
    });
  }
  /**
   * @description: 移动相机到指定位置(无动画)
   * @param {Coordinate} position 位置
   * @param {number} zoom 缩放
   * @return {*} void
   * @author: wuyue.nan
   */
  flyTo(position: Coordinate, zoom?: number): void {
    this.view.setCenter(position);
    if (zoom) this.view.setZoom(zoom);
  }
  /**
   * @description: 设置鼠标在地图上的样式
   * @param {string} cursor
   * @return {*} void
   * @author: wuyue.nan
   */
  setMouseStyle(cursor: string): void {
    this.map.getTargetElement().style.cursor = cursor;
  }
  /**
   * @description: 设置鼠标在地图上的样式为十字准线
   * @return {*} void
   * @author: wuyue.nan
   */
  setMouseStyleToCrosshair(): void {
    this.setMouseStyle('crosshair');
  }
  /**
   * @description: 设置鼠标在地图上的样式为默认
   * @return {*} void
   * @author: wuyue.nan
   */
  setMouseStyleToDefault(): void {
    this.setMouseStyle('auto');
  }
}
