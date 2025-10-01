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
import { BillboardLayer, CircleLayer, OverlayLayer, PointLayer, PolygonLayer, PolylineLayer, WindLayer } from "./base";
import Base from "./base/Base";
import { DynamicDraw, GlobalEvent, Measure } from "./commponents";
import { DoubleClickZoom } from 'ol/interaction'
import { Geometry } from "ol/geom";
import { Layer } from "ol/layer";
import { Source } from "ol/source";
import LayerRenderer from "ol/renderer/Layer";
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
   * 测量
   */
  private measure?: Measure;
  /**
   * 默认中心点
   */
  public center: number[] = fromLonLat([119, 39]);
  /**
   * 地图容器id
   */
  public containerId: string;
  /**
   * 默认实例
   */
  private entities?: DefaultEntities;
  /**
   * 全局公共事件
   */
  private globalEvent?: GlobalEvent;
  /**
   * 自定义注册的图层（封装类实例，而不是 OpenLayers 原生图层）。
   * key -> Base 子类实例（如 PointLayer、PolygonLayer 等）
   */
  private customLayers: { [key: string]: Base } = {};
  /**
   * 关闭右键菜单监听方法
   * @param event 鼠标事件
   */
  private closeRightMenu(event: MouseEvent): void {
    event.preventDefault();
  }
  /**
   * 内部方法：供 Base 构造器在提供 registryKey 时自动注册
   * @param key 注册名称
   * @param layer Base 子类实例
   */
  _autoRegisterLayer(key: string, layer: Base): void {
    if (!this.customLayers[key]) {
      this.customLayers[key] = layer;
    } else {
      console.warn(`自定义图层名称 ${key} 已存在，已忽略自动注册`);
    }
  }
  /**
   * 手动注册一个自定义封装图层实例
   * @param key 名称（建议唯一）
   * @param layer Base 子类实例
   * @param override 已存在时是否覆盖
   */
  registerLayer(key: string, layer: Base, override: boolean = false): void {
    if (this.customLayers[key] && !override) {
      console.warn(`自定义图层名称 ${key} 已存在，若需覆盖请传 override=true`);
      return;
    }
    this.customLayers[key] = layer;
  }
  /**
   * 获取已注册的自定义封装图层
   * @param key 名称
   */
  getLayer<T extends Base = Base>(key: string): T | undefined {
    return this.customLayers[key] as T | undefined;
  }
  /**
   * 移除注册引用（不会销毁图层，不会从地图中移除）
   * @param key 名称
   * @param destroy 是否同时销毁（调用 Base.destroy）
   */
  removeRegisteredLayer(key: string, destroy: boolean = false): boolean {
    const layer = this.customLayers[key];
    if (!layer) return false;
    if (destroy) layer.destroy();
    delete this.customLayers[key];
    return true;
  }
  /**
   * 列出所有已注册的自定义封装图层名称
   */
  listRegisteredLayers(): string[] {
    return Object.keys(this.customLayers);
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
        zoom: 4,
      }, viewOptions)),
      controls: defaults(Object.assign({
        zoom: false,
        rotate: false,
        attribution: false
      }, options))
    });
    this.map = map;
    this.view = map.getView();
    this.containerId = el;
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
   * 根据元素获取元素所在的图层
   * @param feature 
   */
  // NOTE: LayerRenderer 泛型此处无需精确约束，使用 any 更符合当前抽象层级
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getLayerAtFeature(feature: Feature<Geometry>): Layer<Source, LayerRenderer<any>> | undefined {
    const layers = this.map.getAllLayers();
    const layerId = <string>feature.get("layerId");
    const filter = layers.filter(item => {
      return item.get("id") == layerId
    })
    if (filter.length) {
      return filter[0];
    } else {
      return undefined;
    }
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
        wind: new WindLayer(this),
        reset: () => {
          this.entities?.billboard.remove();
          this.entities?.circle.remove();
          this.entities?.overlay.remove();
          this.entities?.point.remove();
          this.entities?.polygon.remove();
          this.entities?.polyline.remove();
          this.entities?.polyline.removeFlightLine();
          this.entities?.wind.remove();
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
   * 使用测量工具
   */
  useMeasure(): Measure {
    if (!this.measure) {
      this.measure = new Measure(this);
    }
    return this.measure;
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
