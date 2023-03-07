import { Map as Maps, MapBrowserEvent } from "ol";
import { EventsKey } from "ol/events";
import Feature from "ol/Feature";
import { Circle, Geometry } from "ol/geom";
import { Layer } from "ol/layer";
import { unByKey } from "ol/Observable";
import { toLonLat } from "ol/proj";
import LayerRenderer from "ol/renderer/Layer";
import { Source } from "ol/source";
import Earth from "../Earth";
export type ModuleEventCallbackParams = { position: number[]; feature?: Feature<Geometry>; layer?: Layer<Source, LayerRenderer<any>>; entityId?: any };
export type GlobalEEventCallbackParams = {};
export type ModuleEventCallback = (param: ModuleEventCallbackParams) => void;
export type GlobalEventCallback = (param: MapBrowserEvent<any>) => void;
interface IEntity {
  id: any;
  module?: any;
  feature?: Feature<Geometry>;
  layer?: Layer<Source, LayerRenderer<any>>;
}
export default class GlobalEvent {
  /**
   * map实例
   */
  private map: Maps;
  /**
   * 鼠标指向的当前实体
   */
  private currentEntity?: IEntity;
  private eventKey?: Map<string, EventsKey> = new Map();
  /**
   * 按模块的鼠标移动事件集合 
   */
  private moduleMouseMoveEvent: Map<string, { callback: ModuleEventCallback }> = new Map();
  /**
   * 全局的鼠标移动事件
   */
  private globalMouseMoveEvent?: { callback: GlobalEventCallback };
  /**
   * 构造器
   * @param earth 地图实例 
   */
  constructor(earth: Earth) {
    this.map = earth.map;
  }
  /**
   * 启用模块鼠标移动事件监听
   */
  enableModuleMouseMoveEvent(): void {
    if (!this.eventKey?.has("moduleMouseMove")) {
      const key = this.map.on("pointermove", (evt) => {
        if (this.map.hasFeatureAtPixel(evt.pixel)) {
          let features = this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
            return {
              id: feature.getId(),
              module: feature.get("module"),
              feature: <Feature>feature,
              layer
            }
          })
          if (features && features.feature.get("module") && features.feature.getId() !== this.currentEntity?.feature?.getId()) {
            const moduleEvent = this.moduleMouseMoveEvent.get(features.feature.get("module"));
            if (moduleEvent) {
              this.currentEntity = features;
              moduleEvent.callback.call(this, {
                position: toLonLat(evt.coordinate),
                feature: features.feature,
                layer: features.layer,
                entityId: features.id
              })
            }
          }
        } else {
          if (this.currentEntity && this.currentEntity.module && this.currentEntity.feature) {
            const moduleEvent = this.moduleMouseMoveEvent.get(this.currentEntity.module);
            if (moduleEvent) {
              moduleEvent.callback.call(this, { position: toLonLat(evt.coordinate), entityId: this.currentEntity.id });
              this.currentEntity = undefined;
            }
          }
        }
      })
      this.eventKey?.set("moduleMouseMove", key);
    } else {
      console.warn("重复启用模块鼠标移动事件监听,请检查");
    }
  }
  /**
   * 启用全局鼠标移动事件监听
   */
  enableGlobalMouseMoveEvent(): void {
    if (!this.eventKey?.has("globalMouseMove")) {
      const key = this.map.on("pointermove", (evt) => {
        this.globalMouseMoveEvent?.callback.call(this, evt);
      })
      this.eventKey?.set("globalMouseMove", key);
    } else {
      console.warn("重复启用全局鼠标移动事件监听,请检查");
    }
  }
  /**
   * 停用模块鼠标移动事件监听
   */
  disableModuleMouseMoveEvent(): void {
    const key = this.eventKey?.get("moduleMouseMove");
    if (key) {
      unByKey(key);
      this.eventKey?.delete("moduleMouseMove");
      this.moduleMouseMoveEvent.clear();
    } else {
      console.warn("未启用模块鼠标移动事件监听，关闭失败");
    }
  }
  /**
   * 停用全局鼠标移动事件监听
   */
  disableGlobalMouseMoveEvent(): void {
    const key = this.eventKey?.get("globalMouseMove");
    if (key) {
      unByKey(key);
      this.eventKey?.delete("globalMouseMove");
      this.globalMouseMoveEvent = undefined;
    } else {
      console.warn("未启用全局鼠标移动事件监听，关闭失败");
    }
  }
  /**
   * 按模块添加鼠标移动事件
   * @param module 模块名称
   * @param callback 回调函数，详见{@link ModuleEventCallback}
   */
  addMouseMoveEventByModule(module: string, callback: ModuleEventCallback): void {
    if (module && module !== "") {
      if (!this.moduleMouseMoveEvent.get(module)) {
        this.moduleMouseMoveEvent.set(module, { callback });
      } else {
        console.warn('按模块追加全局鼠标移动事件: module参数重复', module);
      }
    } else {
      console.warn('按模块追加全局鼠标移动事件: module参数不能为空');
    }
  }
  /**
   * 全局添加鼠标移动事件
   * @param callback 回调函数，需使用ol原生方法调用。详见{@link GlobalEventCallback}
   */
  addMouseMoveEventByGlobal(callback: GlobalEventCallback): void {
    this.globalMouseMoveEvent = { callback }
  };
}