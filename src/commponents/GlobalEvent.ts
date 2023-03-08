import { Map as Maps } from "ol";
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
export type ModuleEventCallback = (param: ModuleEventCallbackParams) => void;
export type GlobalEventCallback = (param: { position: Coordinate; pixel: number[] }) => void;
interface IEntity {
  id: any;
  module?: any;
  feature?: Feature<Geometry>;
  layer?: Layer<Source, LayerRenderer<any>>;
}
/**
 * 地图事件类：分为`全局事件`和`模块事件`
 * 
 * `全局事件`：返回当前鼠标坐标、像素信息，详见{@link GlobalEventCallback}。可配合{@link Earth}类`hasFeatureAtPixel`方法查询该像素位置是否存在feature元素，获取元素信息
 * 
 * `模块事件`：返回当前鼠标坐标、元素、元素图层、元素Id信息，详见{@link ModuleEventCallback}
 * @example
 * ```
 * // 全局事件：全局事件如何获取当前位置元素信息，下面以全局鼠标双击事件为例
 * // 启用全局下鼠标双击事件
 * useEarth().useGlobalEvent().enableGlobalMouseDblClickEvent();
 * // 添加全局下鼠标双击事件。全局下同类事件监听只可添加一个
 * useEarth().useGlobalEvent().addMouseDblClickEventByGlobal((param) => {
 *  // 触发事件回调函数
 *  // 调用`hasFeatureAtPixel`方法查询该像素位置是否存在feature元素
 *  const data = useEarth().hasFeatureAtPixel(param.pixel);
 * })
 * // 关闭全局下鼠标双击事件
 * useEarth().useGlobalEvent().disableGlobalMouseDblClickEvent();
 * // 模块事件：必须传入`module`参数
 * // 启用模块下鼠标双击事件
 * useEarth().useGlobalEvent().enableModuleMouseDblClickEvent();
 * // 添加模块下鼠标双击事件。模块下同类事件监听可添加多个，但module不能相同
 * useEarth().useGlobalEvent().addMouseDblClickEventByModule("module1", (param) => {
 *  // 触发模块module1回调函数
 * })
 * useEarth().useGlobalEvent().addMouseDblClickEventByModule("module2", (param) => {
 *  // 触发模块module2回调函数
 * })
 * // 关闭模块下鼠标双击事件
 * useEarth().useGlobalEvent().disableModuleMouseDblClickEvent();
 * ```
 */
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
   * 模块的鼠标移动事件
   */
  private moduleMouseMoveEvent: Map<string, { callback: ModuleEventCallback }> = new Map();
  /**
   * 模块的鼠标点击事件
   */
  private moduleMouseClickEvent: Map<string, { callback: ModuleEventCallback }> = new Map();
  /**
   * 模块的鼠标左键按下事件
   */
  private moduleMouseLeftDownEvent: Map<string, { callback: ModuleEventCallback }> = new Map();
  /**
   * 模块的鼠标左键弹起事件
   */
  private moduleMouseLeftUpEvent: Map<string, { callback: ModuleEventCallback }> = new Map();
  /**
   * 模块的鼠标双击事件
   */
  private moduleMouseDblClickEvent: Map<string, { callback: ModuleEventCallback }> = new Map();
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
  private globalMouseLeftDownEvent?: { callback: GlobalEventCallback };
  /**
   * 全局的鼠标左键弹起事件
   */
  private globalMouseLeftUpEvent?: { callback: GlobalEventCallback };
  /**
   * 全局的鼠标双击事件
   */
  private globalMouseDblClickEvent?: { callback: GlobalEventCallback };
  /**
   * 模块下鼠标左键按下监听器处理方法
   * @param event 鼠标事件
   */
  private moduleMouseDown(event: MouseEvent): void {
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
 * 模块下鼠标左键弹起监听器处理方法
 * @param event 鼠标事件
 */
  private moduleMouseUp(event: MouseEvent): void {
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
      const moduleEvent = this.moduleMouseLeftUpEvent.get(features.feature.get("module"));
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
  private globalMouseDown(event: MouseEvent): void {
    const coordinate = this.map.getEventCoordinate(event);
    this.globalMouseLeftDownEvent?.callback.call(this, { position: toLonLat(coordinate), pixel: [event.x, event.y] });
  }
  /**
   * 全局下鼠标左键弹起监听器处理方法
   * @param event 鼠标事件
   */
  private globalMouseUp(event: MouseEvent): void {
    const coordinate = this.map.getEventCoordinate(event);
    this.globalMouseLeftUpEvent?.callback.call(this, { position: toLonLat(coordinate), pixel: [event.x, event.y] });
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
      this.map.getViewport().addEventListener("mousedown", this.moduleMouseDown.bind(this));
      this.eventKey?.set("moduleMouseLeftDown", this.moduleMouseDown);
    } else {
      console.warn("重复启用模块下鼠标左键按下事件监听,请检查")
    }
  }
  /**
   * 启用模块下鼠标左键弹起事件监听
   */
  enableModuleMouseLeftUpEvent(): void {
    if (!this.eventKey?.has("moduleMouseLeftUp")) {
      this.map.getViewport().addEventListener("mouseup", this.moduleMouseUp.bind(this));
      this.eventKey?.set("moduleMouseLeftUp", this.moduleMouseUp);
    } else {
      console.warn("重复启用模块下鼠标左键弹起事件监听,请检查")
    }
  }
  /**
   * 启用模块下鼠标双击事件
   */
  enableModuleMouseDblClickEvent(): void {
    if (!this.eventKey?.has("moduleMouseDblClick")) {
      const key = this.map.on("dblclick", (evt) => {
        let features = this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
          return {
            id: feature.getId(),
            module: feature.get("module"),
            feature: <Feature>feature,
            layer
          }
        })
        if (features && features.feature.get("module")) {
          const moduleEvent = this.moduleMouseDblClickEvent.get(features.feature.get("module"));
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
      this.eventKey?.set("moduleMouseDblClick", key);
    } else {
      console.warn("重复启用模块下鼠标双击事件监听,请检查");
    }
  }
  /**
   * 启用全局下鼠标移动事件监听
   */
  enableGlobalMouseMoveEvent(): void {
    if (!this.eventKey?.has("globalMouseMove")) {
      const key = this.map.on("pointermove", (evt) => {
        this.globalMouseMoveEvent?.callback.call(this, {
          position: toLonLat(evt.coordinate),
          pixel: evt.pixel
        });
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
        this.globalMouseClickEvent?.callback.call(this, {
          position: toLonLat(evt.coordinate),
          pixel: evt.pixel

        });
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
      this.map.getViewport().addEventListener("mousedown", this.globalMouseDown.bind(this));
      this.eventKey?.set("globalMouseLeftDown", this.globalMouseDown);
    } else {
      console.warn("重复启用全局下鼠标左键按下事件监听,请检查")
    }
  }
  /**
   * 启用全局下鼠标左键弹起事件监听
   */
  enableGlobalMouseLeftUpEvent(): void {
    if (!this.eventKey?.has("globalMouseLeftUp")) {
      this.map.getViewport().addEventListener("mouseup", this.globalMouseUp.bind(this));
      this.eventKey?.set("globalMouseLeftUp", this.globalMouseUp);
    } else {
      console.warn("重复启用全局下鼠标左键弹起事件监听,请检查")
    }
  }
  /**
   * 启用全局下鼠标双击事件监听
   */
  enableGlobalMouseDblClickEvent(): void {
    if (!this.eventKey?.has("globalMouseDblClick")) {
      const key = this.map.on("dblclick", (evt) => {
        this.globalMouseDblClickEvent?.callback.call(this, {
          position: toLonLat(evt.coordinate),
          pixel: evt.pixel
        });
      })
      this.eventKey?.set("globalMouseDblClick", key);
    } else {
      console.warn("重复启用全局鼠标双击事件监听,请检查");
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
      this.map.getViewport().removeEventListener("mousedown", this.moduleMouseDown);
      this.eventKey?.delete("moduleMouseLeftDown");
      this.moduleMouseLeftDownEvent.clear();
    } else {
      console.warn("未启用模块下鼠标左键按下事件监听，关闭失败");
    }
  }
  /**
   * 停用模块下鼠标左键弹起事件监听
   */
  disableModuleMouseLeftUpEvent(): void {
    const key = this.eventKey?.get("moduleMouseLeftUp");
    if (key) {
      this.map.getViewport().removeEventListener("mouseup", this.moduleMouseUp);
      this.eventKey?.delete("moduleMouseLeftUp");
      this.moduleMouseLeftUpEvent.clear();
    } else {
      console.warn("未启用模块下鼠标左键弹起事件监听，关闭失败");
    }
  }
  /**
   * 停用模块下鼠标双击事件监听
   */
  disableModuleMouseDblClickEvent(): void {
    const key = this.eventKey?.get("moduleMouseDblClick");
    if (key) {
      unByKey(key);
      this.eventKey?.delete("moduleMouseDblClick");
      this.moduleMouseDblClickEvent.clear();
    } else {
      console.warn("未启用模块下鼠标双击击事件监听，关闭失败");
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
      this.map.getViewport().removeEventListener("mousedown", this.globalMouseDown);
      this.eventKey?.delete("globalMouseLeftDown");
      this.globalMouseLeftDownEvent = undefined;
    } else {
      console.warn("未启用全局下鼠标左键按下事件监听，关闭失败");
    }
  }
  /**
   * 停用全局下鼠标左键弹起事件监听
   */
  disableGlobalMouseLeftUpEvent(): void {
    const key = this.eventKey?.get("globalMouseLeftUp");
    if (key) {
      this.map.getViewport().removeEventListener("mouseup", this.globalMouseUp);
      this.eventKey?.delete("globalMouseLeftUp");
      this.globalMouseLeftUpEvent = undefined;
    } else {
      console.warn("未启用全局下鼠标左键弹起事件监听，关闭失败");
    }
  }
  /**
   * 停用全局下鼠标双击事件监听
   */
  disableGlobalMouseDblClickEvent(): void {
    const key = this.eventKey?.get("globalMouseDblClick");
    if (key) {
      unByKey(key);
      this.eventKey?.delete("globalMouseDblClick");
      this.globalMouseDblClickEvent = undefined;
    } else {
      console.warn("未启用全局下鼠标双击事件监听，关闭失败");
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
   * 按模块添加鼠标左键弹起事件
   * @param module 模块名称
   * @param callback 回调函数，详见{@link ModuleEventCallback}
   */
  addMouseLeftUpEventByModule(module: string, callback: ModuleEventCallback): void {
    if (module && module !== "") {
      if (!this.moduleMouseLeftUpEvent.get(module)) {
        this.moduleMouseLeftUpEvent.set(module, { callback });
      } else {
        console.warn('按模块追加全局鼠标左键弹起事件: module参数重复', module);
      }
    } else {
      console.warn('按模块追加全局鼠标左键弹起事件: module参数不能为空');
    }
  }
  /**
   * 按模块添加鼠标双击事件
   * @param module 模块名称
   * @param callback 回调函数，详见{@link ModuleEventCallback}
   */
  addMouseDblClickEventByModule(module: string, callback: ModuleEventCallback): void {
    if (module && module !== "") {
      if (!this.moduleMouseDblClickEvent.get(module)) {
        this.moduleMouseDblClickEvent.set(module, { callback });
      } else {
        console.warn('按模块追加全局鼠标双击事件: module参数重复', module);
      }
    } else {
      console.warn('按模块追加全局鼠标双击事件: module参数不能为空');
    }
  }
  /**
   * 按全局添加鼠标移动事件
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`hasFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseMoveEventByGlobal(callback: GlobalEventCallback): void {
    this.globalMouseMoveEvent = { callback };
  };
  /**
   * 按全局添加鼠标点击事件
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`hasFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseClickEventByGlobal(callback: GlobalEventCallback): void {
    this.globalMouseClickEvent = { callback };
  };
  /**
   * 按全局添加鼠标左键按下事件
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`hasFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseLeftDownEventByGlobal(callback: GlobalEventCallback): void {
    this.globalMouseLeftDownEvent = { callback };
  }
  /**
   * 按全局添加鼠标左键弹起事件
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`hasFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseLeftUpEventByGlobal(callback: GlobalEventCallback): void {
    this.globalMouseLeftUpEvent = { callback };
  }
  /**
   * 按全局添加鼠标双击事件
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`hasFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseDblClickEventByGlobal(callback: GlobalEventCallback): void {
    this.globalMouseDblClickEvent = { callback };
  };
}
