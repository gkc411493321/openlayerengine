import { Map as Maps, MapBrowserEvent } from "ol";
import { Coordinate } from "ol/coordinate";
import { EventsKey } from "ol/events";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { Layer } from "ol/layer";
import { unByKey } from "ol/Observable";
import { toLonLat } from "ol/proj";
import LayerRenderer from "ol/renderer/Layer";
import { Source } from "ol/source";
import Earth from "../Earth";
export type ModuleEventCallbackParams = { position: Coordinate; feature?: Feature<Geometry>; layer?: Layer<Source, LayerRenderer<any>>; entityId?: any };
export type GlobalEEventCallbackParams = {};
export type ModuleEventCallback = (param: ModuleEventCallbackParams) => void;
export type GlobalEventCallback = (param: MapBrowserEvent<any>) => void;
export type GlobalMouseEventCallback = (param: { event: MouseEvent; position: Coordinate }) => void;
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
  private eventKey?: Map<string, EventsKey | any> = new Map();
  /**
   * 按模块的鼠标移动事件集合 
   */
  private moduleMouseMoveEvent: Map<string, { callback: ModuleEventCallback }> = new Map();
  /**
   * 按模块的鼠标点击事件集合 
   */
  private moduleMouseClickEvent: Map<string, { callback: ModuleEventCallback }> = new Map();
  /**
   * 按模块的鼠标左键按下事件集合 
   */
  private moduleMouseLeftDownEvent: Map<string, { callback: ModuleEventCallback }> = new Map();
  /**
   * 全局的鼠标移动事件
   */
  private globalMouseMoveEvent?: { callback: GlobalEventCallback };
  /**
   * 全局的鼠标点击事件
   */
  private globalMouseClickEvent?: { callback: GlobalEventCallback };
  /**
   * 全局的鼠标左键按下事件
   */
  private globalMouseLeftDownEvent?: { callback: GlobalMouseEventCallback };
  /**
   * 模块下鼠标左键按下监听器处理方法
   * @param event 鼠标事件
   */
  private moduleMousedown(event: MouseEvent): void {
    let pixel = this.map.getEventPixel({ clientX: event.x, clientY: event.y });
    let features = this.map.forEachFeatureAtPixel(pixel, (feature, layer) => {
      return {
        id: feature.getId(),
        module: feature.get("module"),
        feature: <Feature>feature,
        layer
      }
    })
    if (features && features.feature.get("module")) {
      const moduleEvent = this.moduleMouseLeftDownEvent.get(features.feature.get("module"));
      const coordinate = this.map.getEventCoordinate(event);
      if (moduleEvent) {
        moduleEvent.callback.call(this, {
          position: toLonLat(coordinate),
          feature: features.feature,
          layer: features.layer,
          entityId: features.id
        })
      }
    }
  }
  /**
   * 全局下鼠标左键按下监听器处理方法
   * @param event 鼠标事件
   */
  private globalMousedown(event: MouseEvent): void {
    const coordinate = this.map.getEventCoordinate(event);
    this.globalMouseLeftDownEvent?.callback.call(this, { event, position: toLonLat(coordinate) });
  }
  /**
   * 构造器
   * @param earth 地图实例 
   */
  constructor(earth: Earth) {
    this.map = earth.map;
  }
  /**
   * 启用模块下鼠标移动事件监听
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
      console.warn("重复启用模块下鼠标移动事件监听,请检查");
    }
  }
  /**
   * 启用模块下鼠标点击事件监听
   */
  enableModuleMouseClickEvent(): void {
    if (!this.eventKey?.has("moduleMouseClick")) {
      const key = this.map.on("click", (evt) => {
        let features = this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
          return {
            id: feature.getId(),
            module: feature.get("module"),
            feature: <Feature>feature,
            layer
          }
        })
        if (features && features.feature.get("module")) {
          const moduleEvent = this.moduleMouseClickEvent.get(features.feature.get("module"));
          if (moduleEvent) {
            moduleEvent.callback.call(this, {
              position: toLonLat(evt.coordinate),
              feature: features.feature,
              layer: features.layer,
              entityId: features.id
            })
          }
        }
      })
      this.eventKey?.set("moduleMouseClick", key);
    } else {
      console.warn("重复启用模块下鼠标点击事件监听,请检查");
    }
  }
  /**
   * 启用模块下鼠标左键按下事件监听
   */
  enableModuleMouseLeftDownEvent(): void {
    if (!this.eventKey?.has("moduleMouseLeftDown")) {
      this.map.getViewport().addEventListener("mousedown", this.moduleMousedown.bind(this));
      this.eventKey?.set("moduleMouseLeftDown", this.moduleMousedown);
    } else {
      console.warn("重复启用模块下鼠标左键按下事件监听,请检查")
    }
  }
  /**
   * 启用全局下鼠标移动事件监听
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
   * 启用全局下鼠标点击事件监听
   */
  enableGlobalMouseClickEvent(): void {
    if (!this.eventKey?.has("globalMouseClick")) {
      const key = this.map.on("pointermove", (evt) => {
        this.globalMouseClickEvent?.callback.call(this, evt);
      })
      this.eventKey?.set("globalMouseClick", key);
    } else {
      console.warn("重复启用全局鼠标点击事件监听,请检查");
    }
  }
  /**
   * 启用全局下鼠标左键按下事件监听
   */
  enableGlobalMouseLeftDownEvent(): void {
    if (!this.eventKey?.has("globalMouseLeftDown")) {
      this.map.getViewport().addEventListener("mousedown", this.globalMousedown.bind(this));
      this.eventKey?.set("globalMouseLeftDown", this.globalMousedown);
    } else {
      console.warn("重复启用全局下鼠标左键按下事件监听,请检查")
    }
  }
  /**
   * 停用模块下鼠标移动事件监听
   */
  disableModuleMouseMoveEvent(): void {
    const key = this.eventKey?.get("moduleMouseMove");
    if (key) {
      unByKey(key);
      this.eventKey?.delete("moduleMouseMove");
      this.moduleMouseMoveEvent.clear();
    } else {
      console.warn("未启用模块下鼠标移动事件监听，关闭失败");
    }
  }
  /**
   * 停用模块下鼠标点击事件监听
   */
  disableModuleMouseClickEvent(): void {
    const key = this.eventKey?.get("moduleMouseClick");
    if (key) {
      unByKey(key);
      this.eventKey?.delete("moduleMouseClick");
      this.moduleMouseClickEvent.clear();
    } else {
      console.warn("未启用模块下鼠标点击事件监听，关闭失败");
    }
  }
  /**
   * 停用模块下鼠标左键按下事件监听
   */
  disableModuleMouseLeftDownEvent(): void {
    const key = this.eventKey?.get("moduleMouseLeftDown");
    if (key) {
      this.map.getViewport().removeEventListener("mousedown", this.moduleMousedown);
      this.eventKey?.delete("moduleMouseLeftDown");
      this.moduleMouseLeftDownEvent.clear();
    } else {
      console.warn("未启用模块下鼠标左键按下事件监听，关闭失败");
    }
  }
  /**
   * 停用全局下鼠标移动事件监听
   */
  disableGlobalMouseMoveEvent(): void {
    const key = this.eventKey?.get("globalMouseMove");
    if (key) {
      unByKey(key);
      this.eventKey?.delete("globalMouseMove");
      this.globalMouseMoveEvent = undefined;
    } else {
      console.warn("未启用全局下鼠标移动事件监听，关闭失败");
    }
  }
  /**
   * 停用全局下鼠标点击事件监听
   */
  disableGlobalMouseClickEvent(): void {
    const key = this.eventKey?.get("globalMouseClick");
    if (key) {
      unByKey(key);
      this.eventKey?.delete("globalMouseClick");
      this.globalMouseClickEvent = undefined;
    } else {
      console.warn("未启用全局下鼠标点击事件监听，关闭失败");
    }
  }
  /**
   * 停用全局下鼠标左键按下事件监听
   */
  disableGlobalMouseLeftDownEvent(): void {
    const key = this.eventKey?.get("globalMouseLeftDown");
    if (key) {
      this.map.getViewport().removeEventListener("mousedown", this.globalMousedown);
      this.eventKey?.delete("globalMouseLeftDown");
      this.globalMouseLeftDownEvent = undefined;
    } else {
      console.warn("未启用全局下鼠标点击事件监听，关闭失败");
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
   * 按模块添加鼠标点击事件
   * @param module 模块名称
   * @param callback 回调函数，详见{@link ModuleEventCallback}
   */
  addMouseClickEventByModule(module: string, callback: ModuleEventCallback): void {
    if (module && module !== "") {
      if (!this.moduleMouseClickEvent.get(module)) {
        this.moduleMouseClickEvent.set(module, { callback });
      } else {
        console.warn('按模块追加全局鼠标点击事件: module参数重复', module);
      }
    } else {
      console.warn('按模块追加全局鼠标点击事件: module参数不能为空');
    }
  }
  /**
   * 按模块添加鼠标左键按下事件
   * @param module 模块名称
   * @param callback 回调函数，详见{@link ModuleEventCallback}
   */
  addMouseLeftDownEventByModule(module: string, callback: ModuleEventCallback): void {
    if (module && module !== "") {
      if (!this.moduleMouseLeftDownEvent.get(module)) {
        this.moduleMouseLeftDownEvent.set(module, { callback });
      } else {
        console.warn('按模块追加全局鼠标左键按下事件: module参数重复', module);
      }
    } else {
      console.warn('按模块追加全局鼠标左键按下事件: module参数不能为空');
    }
  }
  /**
   * 按全局添加鼠标移动事件
   * @param callback 回调函数，需使用ol原生方法调用。详见{@link GlobalEventCallback}
   */
  addMouseMoveEventByGlobal(callback: GlobalEventCallback): void {
    this.globalMouseMoveEvent = { callback };
  };
  /**
   * 按全局添加鼠标点击事件
   * @param callback 回调函数，需使用ol原生方法调用。详见{@link GlobalEventCallback}
   */
  addMouseClickEventByGlobal(callback: GlobalEventCallback): void {
    this.globalMouseClickEvent = { callback };
  };
  /**
   * 按全局添加鼠标左键按下事件
   * @param callback 回调函数，详见{@link GlobalMouseEventCallback}
   */
  addMouseLeftDownEventByGlobal(callback: GlobalMouseEventCallback): void {
    this.globalMouseLeftDownEvent = { callback };
  }
}
