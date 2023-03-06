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
/**
 * 地图基类
 */
export default class Earth {
  /**
   * `map`实例
   */
  public map: Map;
  /**
   * `view`实例
   */
  public view: View;
  /**
   * 默认中心点
   */
  public center: number[] = fromLonLat([119, 39]);
  /**
   * 构造器
   * @param viewOptions 视图参数，详见{@link ViewOptions}
   * @param options 自定义参数，详见{@link IEarthConstructorOptions}
   */
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
  /**
   * 八进制字符串补0
   * @param num 
   * @param len 
   * @param radix 
   */
  private zeroFill(num: number, len: number, radix: number): string {
    return num.toString(radix || 10).padStart(len, '0');
  }
  /**
   * 创建OSM底图图层
   * @returns `TileLayer<OSM>`实例
   */
  createOsmLayer(): TileLayer<OSM> {
    return new TileLayer({
      source: new OSM(),
    })
  }
  /**
   * 创建瓦片地图图层
   * @param url 瓦片地址
   * @returns `TileLayer<XYZ>`实例
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
   * 添加图层
   * @param layer `layer`图层
   */
  addLayer(layer: BaseLayer): void {
    this.map.addLayer(layer);
  }
  /**
   * 移除图层
   * @param layer `layer`图层
   * @returns BaseLayer | undefined
   */
  removeLayer(layer?: BaseLayer): BaseLayer | undefined {
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
   * 移动相机到默认位置
   */
  flyHome(): void {
    this.view.animate({
      center: this.center,
      zoom: 4,
      duration: 2000
    });
  }
  /**
   * 移动相机到指定位置(动画)
   * @param position 位置
   * @param zoom 缩放
   * @param duration 动画时间(毫秒)
   */
  animateFlyTo(position: Coordinate, zoom?: number, duration?: number): void {
    this.view.animate({
      center: position,
      zoom: zoom || this.view.getZoom(),
      duration: duration || 2000
    });
  }
  /**
   * 移动相机到指定位置(无动画)
   * @param position 位置
   * @param zoom 缩放
   */
  flyTo(position: Coordinate, zoom?: number): void {
    this.view.setCenter(position);
    if (zoom) this.view.setZoom(zoom);
  }
  /**
   * 设置鼠标样式
   * @param cursor 鼠标样式 
   */
  setMouseStyle(cursor: string): void {
    this.map.getTargetElement().style.cursor = cursor;
  }
  /**
   * 设置鼠标在地图上的样式为十字准线
   */
  setMouseStyleToCrosshair(): void {
    this.setMouseStyle('crosshair');
  }
  /**
   * 设置鼠标在地图上的样式为默认
   */
  setMouseStyleToDefault(): void {
    this.setMouseStyle('auto');
  }
}
