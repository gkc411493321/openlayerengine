import { DefaultEntities, IEarthConstructorOptions, IFeatureAtPixel } from "./interface";
import { Feature, Map, View } from "ol";
import { defaults } from 'ol/control/defaults';
import { Coordinate } from "ol/coordinate";
import BaseLayer from "ol/layer/Base";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from "ol/proj";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import { TileCoord } from "ol/tilecoord";
import { ViewOptions } from "ol/View";
import { BillboardLayer, CircleLayer, OverlayLayer, PointLayer, PolygonLayer, PolylineLayer } from "./base";
import { DynamicDraw, GlobalEvent } from "./commponents";
import { DoubleClickZoom } from 'ol/interaction'
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
   * 动态绘制
   */
  private draw?: DynamicDraw;
  /**
   * 默认中心点
   */
  public center: number[] = fromLonLat([119, 39]);
  /**
   * 默认实例
   */
  private entities?: DefaultEntities;
  /**
   * 全局公共事件
   */
  private globalEvent?: GlobalEvent;
  /**
   * 关闭右键菜单监听方法
   * @param event 鼠标事件
   */
  private closeRightMenu(event: MouseEvent): void {
    event.preventDefault();
  }
  /**
   * 关闭默认事件
   */
  private closeDefaultEvent(): void {
    // 删除默认的双击事件
    const dblClickInteraction = this.map.getInteractions().getArray().find(interaction => {
      return interaction instanceof DoubleClickZoom;
    })
    if (dblClickInteraction) this.map.removeInteraction(dblClickInteraction);
    // 关闭浏览器右键菜单
    document.addEventListener("contextmenu", this.closeRightMenu);
  }
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
    });
    this.map = map;
    this.view = map.getView();
    // 关闭默认事件
    this.closeDefaultEvent();
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
  /**
   * 获取默认实体对象
   */
  useDefaultLayer<T>(): DefaultEntities<T> {
    if (!this.entities) {
      this.entities = {
        billboard: new BillboardLayer<T>(this),
        circle: new CircleLayer<T>(this),
        overlay: new OverlayLayer<T>(this),
        point: new PointLayer<T>(this),
        polygon: new PolygonLayer<T>(this),
        polyline: new PolylineLayer<T>(this),
        reset: () => {
          this.entities?.billboard.remove();
          this.entities?.circle.remove();
          this.entities?.overlay.remove();
          this.entities?.point.remove();
          this.entities?.polygon.remove();
          this.entities?.polyline.remove();
          this.entities?.polyline.removeFlightLine();
        }
      }
      this.entities.billboard.allowDestroyed = false;
      this.entities.circle.allowDestroyed = false;
      this.entities.point.allowDestroyed = false;
      this.entities.polygon.allowDestroyed = false;
      this.entities.polyline.allowDestroyed = false;
    }
    return this.entities as DefaultEntities<T>;
  }
  /**
   * 使用地图事件
   */
  useGlobalEvent(): GlobalEvent {
    if (!this.globalEvent) {
      this.globalEvent = new GlobalEvent(this);
    }
    return this.globalEvent as GlobalEvent;
  }
  /**
   * 使用动态绘制工具
   */
  useDrawTool(): DynamicDraw {
    if (!this.draw) {
      this.draw = new DynamicDraw(this);
    }
    return this.draw;
  }
  /**
   * 判断当前像素位置是否存在feature对象
   * @param pixel 像素坐标
   * @returns 返回该像素位置信息，详见{@link IFeatureAtPixel}
   */
  getFeatureAtPixel(pixel: number[]): IFeatureAtPixel {
    let data: IFeatureAtPixel = {
      isExists: false
    }
    if (this.map.hasFeatureAtPixel(pixel)) {
      const pixelData = this.map.forEachFeatureAtPixel(pixel, (feature, layer) => {
        return {
          isExists: true,
          id: <string>feature.getId(),
          module: <string>feature.get("module"),
          feature: <Feature>feature,
          layer
        }
      })
      if (pixelData) {
        data = pixelData;
      }
    }
    return data;
  }
}
