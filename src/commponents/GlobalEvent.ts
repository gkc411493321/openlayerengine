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
export type ModuleEventCallbackParams = { position: Coordinate; feature?: Feature<Geometry>; layer?: Layer<Source, LayerRenderer<any>>; id?: any };
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
 * `全局事件`：返回当前鼠标坐标、像素信息，详见{@link GlobalEventCallback}。可配合{@link Earth}类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素，获取元素信息
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
 *  // 调用`getFeatureAtPixel`方法查询该像素位置是否存在feature元素
 *  const data = useEarth().getFeatureAtPixel(param.pixel);
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
   * 模块的鼠标左键抬起事件
   */
  private moduleMouseLeftUpEvent: Map<string, { callback: ModuleEventCallback }> = new Map();
  /**
   * 模块的鼠标双击事件
   */
  private moduleMouseDblClickEvent: Map<string, { callback: ModuleEventCallback }> = new Map();
  /**
   * 模块的鼠标右击事件
   */
  private moduleMouseRightClickEvent: Map<string, { callback: ModuleEventCallback }> = new Map();
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
   * 全局的鼠标左键抬起事件
   */
  private globalMouseLeftUpEvent?: { callback: GlobalEventCallback };
  /**
   * 全局的鼠标双击事件
   */
  private globalMouseDblClickEvent?: { callback: GlobalEventCallback };
  /**
   * 全局的鼠标右键单击事件
   */
  private globalMouseRightClickEvent?: { callback: GlobalEventCallback };
  /**
   * 模块下鼠标左键按下监听器处理方法
   * @param event 鼠标事件
   */
  private moduleMouseLeftDown(event: MouseEvent): void {
    if (event.button != 0) return;
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
          id: features.id
        })
      }
    }
  }
  /**
   * 模块下鼠标左键抬起监听器处理方法
   * @param event 鼠标事件
   */
  private moduleMouseLeftUp(event: MouseEvent): void {
    if (event.button != 0) return;
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
          id: features.id
        })
      }
    }
  }
  /**
   * 模块下鼠标右键单击监听器处理方法
   * @param event 鼠标事件
   */
  private moduleMouseRightClick(event: MouseEvent): void {
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
      const moduleEvent = this.moduleMouseRightClickEvent.get(features.feature.get("module"));
      const coordinate = this.map.getEventCoordinate(event);
      if (moduleEvent) {
        moduleEvent.callback.call(this, {
          position: toLonLat(coordinate),
          feature: features.feature,
          layer: features.layer,
          id: features.id
        })
      }
    }
  }
  /**
   * 全局下鼠标左键按下监听器处理方法
   * @param event 鼠标事件
   */
  private globalMouseLeftDown(event: MouseEvent): void {
    if (event.button != 0) return;
    const coordinate = this.map.getEventCoordinate(event);
    this.globalMouseLeftDownEvent?.callback.call(this, { position: toLonLat(coordinate), pixel: [event.x, event.y] });
  }
  /**
   * 全局下鼠标左键抬起监听器处理方法
   * @param event 鼠标事件
   */
  private globalMouseLeftUp(event: MouseEvent): void {
    if (event.button != 0) return;
    const coordinate = this.map.getEventCoordinate(event);
    this.globalMouseLeftUpEvent?.callback.call(this, { position: toLonLat(coordinate), pixel: [event.x, event.y] });
  }
  /**
   * 全局下鼠标右键单击监听器处理方法
   * @param event 鼠标事件
   */
  private globalMouseRightClick(event: MouseEvent): void {
    const coordinate = this.map.getEventCoordinate(event);
    this.globalMouseRightClickEvent?.callback.call(this, { position: toLonLat(coordinate), pixel: [event.x, event.y] });
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
                id: features.id
              })
            }
          }
        } else {
          if (this.currentEntity && this.currentEntity.module && this.currentEntity.feature) {
            const moduleEvent = this.moduleMouseMoveEvent.get(this.currentEntity.module);
            if (moduleEvent) {
              moduleEvent.callback.call(this, { position: toLonLat(evt.coordinate), id: this.currentEntity.id });
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
              id: features.id
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
  enableModuleMouseLfetDownEvent(): void {
    if (!this.eventKey?.has("moduleMouseLeftDown")) {
      this.map.getViewport().addEventListener("mousedown", this.moduleMouseLeftDown.bind(this));
      this.eventKey?.set("moduleMouseLfetDown", this.moduleMouseLeftDown);
    } else {
      console.warn("重复启用模块下鼠标左键按下事件监听,请检查")
    }
  }
  /**
   * 启用模块下鼠标左键抬起事件监听
   */
  enableModuleMouseLeftUpEvent(): void {
    if (!this.eventKey?.has("moduleMouseLeftUp")) {
      this.map.getViewport().addEventListener("mouseup", this.moduleMouseLeftUp.bind(this));
      this.eventKey?.set("moduleMouseLeftUp", this.moduleMouseLeftUp);
    } else {
      console.warn("重复启用模块下鼠标左键抬起事件监听,请检查")
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
              id: features.id
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
   * 启用模块下鼠标右键单击事件监听
   */
  enableModuleMouseRightClickEvent(): void {
    if (!this.eventKey?.has("moduleMouseRightClick")) {
      this.map.getViewport().addEventListener("contextmenu", this.moduleMouseRightClick.bind(this));
      this.eventKey?.set("moduleMouseRightClick", this.moduleMouseRightClick);
    } else {
      console.warn("重复启用模块下鼠标右键点击事件监听,请检查")
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
      this.map.getViewport().addEventListener("mousedown", this.globalMouseLeftDown.bind(this));
      this.eventKey?.set("globalMouseLeftDown", this.globalMouseLeftDown);
    } else {
      console.warn("重复启用全局下鼠标左键按下事件监听,请检查")
    }
  }
  /**
   * 启用全局下鼠标左键抬起事件监听
   */
  enableGlobalMouseLeftUpEvent(): void {
    if (!this.eventKey?.has("globalMouseLeftUp")) {
      this.map.getViewport().addEventListener("mouseup", this.globalMouseLeftUp.bind(this));
      this.eventKey?.set("globalMouseLeftUp", this.globalMouseLeftUp);
    } else {
      console.warn("重复启用全局下鼠标左键抬起事件监听,请检查")
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
   * 启用全局下鼠标右键单击事件监听
   */
  enableGlobalMouseRightClickEvent(): void {
    if (!this.eventKey?.has("globalMouseRightClick")) {
      this.map.getViewport().addEventListener("contextmenu", this.globalMouseRightClick.bind(this));
      this.eventKey?.set("globalMouseRightClick", this.globalMouseRightClick);
    } else {
      console.warn("重复启用全局下鼠标右键单击事件监听,请检查")
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
      this.map.getViewport().removeEventListener("mousedown", this.moduleMouseLeftDown);
      this.eventKey?.delete("moduleMouseLeftDown");
      this.moduleMouseLeftDownEvent.clear();
    } else {
      console.warn("未启用模块下鼠标左键按下事件监听，关闭失败");
    }
  }
  /**
   * 停用模块下鼠标左键抬起事件监听
   */
  disableModuleMouseLeftUpEvent(): void {
    const key = this.eventKey?.get("moduleMouseLeftUp");
    if (key) {
      this.map.getViewport().removeEventListener("mouseup", this.moduleMouseLeftUp);
      this.eventKey?.delete("moduleMouseLeftUp");
      this.moduleMouseLeftUpEvent.clear();
    } else {
      console.warn("未启用模块下鼠标左键抬起事件监听，关闭失败");
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
   * 停用模块下鼠标右键单击事件监听
   */
  disableModuleMouseRightClickEvent(): void {
    const key = this.eventKey?.get("moduleMouseRightClick");
    if (key) {
      this.map.getViewport().removeEventListener("contextmenu", this.moduleMouseRightClick);
      this.eventKey?.delete("moduleMouseRightClick");
      this.moduleMouseRightClickEvent.clear();
    } else {
      console.warn("未启用模块下鼠标右键单击事件监听，关闭失败");
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
      this.map.getViewport().removeEventListener("mousedown", this.globalMouseLeftDown);
      this.eventKey?.delete("globalMouseLeftDown");
      this.globalMouseLeftDownEvent = undefined;
    } else {
      console.warn("未启用全局下鼠标左键按下事件监听，关闭失败");
    }
  }
  /**
   * 停用全局下鼠标左键抬起事件监听
   */
  disableGlobalMouseLeftUpEvent(): void {
    const key = this.eventKey?.get("globalMouseLeftUp");
    if (key) {
      this.map.getViewport().removeEventListener("mouseup", this.globalMouseLeftUp);
      this.eventKey?.delete("globalMouseLeftUp");
      this.globalMouseLeftUpEvent = undefined;
    } else {
      console.warn("未启用全局下鼠标左键抬起事件监听，关闭失败");
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
   * 停用全局下鼠标右键单击事件监听
   */
  disableGlobalMouseRightClickEvent(): void {
    const key = this.eventKey?.get("globalMouseRightClick");
    if (key) {
      this.map.getViewport().removeEventListener("contextmenu", this.globalMouseRightClick);
      this.eventKey?.delete("globalMouseRightClick");
      this.globalMouseRightClickEvent = undefined;
    } else {
      console.warn("未启用全局下鼠标右键单击事件监听，关闭失败");
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
   * 按模块添加鼠标左键抬起事件
   * @param module 模块名称
   * @param callback 回调函数，详见{@link ModuleEventCallback}
   */
  addMouseLeftUpEventByModule(module: string, callback: ModuleEventCallback): void {
    if (module && module !== "") {
      if (!this.moduleMouseLeftUpEvent.get(module)) {
        this.moduleMouseLeftUpEvent.set(module, { callback });
      } else {
        console.warn('按模块追加全局鼠标左键抬起事件: module参数重复', module);
      }
    } else {
      console.warn('按模块追加全局鼠标左键抬起事件: module参数不能为空');
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
   * 按模块添加鼠标右键单击事件
   * @param module 模块名称
   * @param callback 回调函数，详见{@link ModuleEventCallback}
   */
  addMouseRightClickEventByModule(module: string, callback: ModuleEventCallback): void {
    if (module && module !== "") {
      if (!this.moduleMouseRightClickEvent.get(module)) {
        this.moduleMouseRightClickEvent.set(module, { callback });
      } else {
        console.warn('按模块追加全局鼠标右键单击事件: module参数重复', module);
      }
    } else {
      console.warn('按模块追加全局鼠标右键单击事件: module参数不能为空');
    }
  }
  /**
   * 按全局添加鼠标移动事件
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseMoveEventByGlobal(callback: GlobalEventCallback): void {
    this.globalMouseMoveEvent = { callback };
  };
  /**
   * 按全局添加鼠标点击事件
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseClickEventByGlobal(callback: GlobalEventCallback): void {
    this.globalMouseClickEvent = { callback };
  };
  /**
   * 按全局添加鼠标左键按下事件
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseLeftDownEventByGlobal(callback: GlobalEventCallback): void {
    this.globalMouseLeftDownEvent = { callback };
  }
  /**
   * 按全局添加鼠标左键抬起事件
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseLeftUpEventByGlobal(callback: GlobalEventCallback): void {
    this.globalMouseLeftUpEvent = { callback };
  }
  /**
   * 按全局添加鼠标双击事件
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseDblClickEventByGlobal(callback: GlobalEventCallback): void {
    this.globalMouseDblClickEvent = { callback };
  };
  /**
   * 按全局添加鼠标右键单击事件
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseRightClickEventByGlobal(callback: GlobalEventCallback): void {
    this.globalMouseRightClickEvent = { callback };
  };
  /**
   * 按全局添加鼠标点击事件,只执行一次。该方法无需启用事件和删除事件，直接调用即可
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseOnceClickEventByGlobal(callback: GlobalEventCallback): void {
    this.map.once("click", (evt) => {
      callback.call(this, {
        position: toLonLat(evt.coordinate),
        pixel: evt.pixel
      });
    })
  };
  /**
   * 按全局添加鼠标右击事件,只执行一次。该方法无需启用事件和删除事件，直接调用即可
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseOnceRightClickEventByGlobal(callback: GlobalEventCallback): void {
    this.map.getViewport().addEventListener("contextmenu", (event: MouseEvent) => {
      const coordinate = this.map.getEventCoordinate(event);
      callback.call(this, {
        position: toLonLat(coordinate),
        pixel: [event.x, event.y]
      });
    }, { once: true });
  };
  /**
   * 校验模块是否注册鼠标移动事件
   * @param module 模块名称
   */
  hasModuleMouseMoveEvent(module: string): boolean {
    return this.moduleMouseMoveEvent.has(module);
  }
  /**
   * 校验模块是否注册鼠标单击事件
   * @param module 模块名称
   */
  hasModuleMouseClickEvent(module: string): boolean {
    return this.moduleMouseClickEvent.has(module);
  }
  /**
   * 校验模块是否注册鼠标左键按下事件
   * @param module 模块名称
   */
  hasModuleMouseLeftDownEvent(module: string): boolean {
    return this.moduleMouseLeftDownEvent.has(module);
  }
  /**
   * 校验模块是否注册鼠标左键抬起事件
   * @param module 模块名称
   */
  hasModuleMouseLeftUpEvent(module: string): boolean {
    return this.moduleMouseLeftUpEvent.has(module);
  }
  /**
   * 校验模块是否注册鼠标双击事件
   * @param module 模块名称
   */
  hasModuleMouseDblClickEvent(module: string): boolean {
    return this.moduleMouseDblClickEvent.has(module);
  }
  /**
   * 校验模块是否注册鼠标右键单击事件
   * @param module 模块名称
   */
  hasModuleMouseRightClickEvent(module: string): boolean {
    return this.moduleMouseRightClickEvent.has(module);
  }
  /**
  * 校验全局是否注册鼠标移动事件
  */
  hasGlobalMouseMoveEvent(): boolean {
    return this.globalMouseMoveEvent ? true : false;
  }
  /**
  * 校验全局是否注册鼠标点击事件
  */
  hasGlobalMouseClickEvent(): boolean {
    return this.globalMouseClickEvent ? true : false;
  }
  /**
  * 校验全局是否注册鼠标左键按下事件
  */
  hasGlobalMouseLeftDownEvent(): boolean {
    return this.globalMouseLeftDownEvent ? true : false;
  }
  /**
  * 校验全局是否注册鼠标左键抬起事件
  */
  hasGlobalMouseLeftUpEvent(): boolean {
    return this.globalMouseLeftUpEvent ? true : false;
  }
  /**
  * 校验全局是否注册鼠标双击事件
  */
  hasGlobalMouseDblClickEvent(): boolean {
    return this.globalMouseDblClickEvent ? true : false;
  }
  /**
  * 校验全局是否注册鼠标右键事件
  */
  hasGlobalMouseRightClickEvent(): boolean {
    return this.globalMouseRightClickEvent ? true : false;
  }
}
