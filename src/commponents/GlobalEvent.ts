/* eslint-disable @typescript-eslint/no-extra-semi */
import { Map as Maps } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { EventsKey } from 'ol/events';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';
import { Layer } from 'ol/layer';
import { unByKey } from 'ol/Observable';
import { toLonLat } from 'ol/proj';
import LayerRenderer from 'ol/renderer/Layer';
import { Source } from 'ol/source';
import Earth from '../Earth';
export type ModuleEventCallbackParams = { position: Coordinate; feature?: Feature<Geometry>; layer?: Layer<Source, LayerRenderer<any>>; id?: any };
export type ModuleEventCallback = (param: ModuleEventCallbackParams) => void;
export type GlobalEventCallback = (param: { position: Coordinate; pixel: number[] }) => void;
export type GlobalKeyDownEventCallback = (param: any) => void;

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
   * 全局鼠标移动事件
   */
  private globalMouseMoveEvents: Set<GlobalEventCallback> = new Set();
  /**
   * 全局鼠标点击事件
   */
  private globalMouseClickEvents: Set<GlobalEventCallback> = new Set();
  /**
   * 全局鼠标左键按下事件
   */
  private globalMouseLeftDownEvents: Set<GlobalEventCallback> = new Set();
  /**
   * 全局鼠标左键抬起事件
   */
  private globalMouseLeftUpEvents: Set<GlobalEventCallback> = new Set();
  /**
   * 全局鼠标双击事件
   */
  private globalMouseDblClickEvents: Set<GlobalEventCallback> = new Set();
  /**
   * 全局鼠标右键单击事件
   */
  private globalMouseRightClickEvents: Set<GlobalEventCallback> = new Set();
  /**
   * 全局下键盘按下事件
   */
  private globalKeyDownEvents: Set<GlobalKeyDownEventCallback> = new Set();
  /**
   * 当对应模块事件集合为空时自动关闭监听
   */
  private tryAutoDisableModuleListener(type: 'move' | 'click' | 'leftDown' | 'leftUp' | 'dblClick' | 'rightClick'): void {
    switch (type) {
      case 'move':
        if (this.moduleMouseMoveEvent.size === 0 && this.eventKey?.has('moduleMouseMove')) this.disableModuleMouseMoveEvent();
        break;
      case 'click':
        if (this.moduleMouseClickEvent.size === 0 && this.eventKey?.has('moduleMouseClick')) this.disableModuleMouseClickEvent();
        break;
      case 'leftDown':
        if (this.moduleMouseLeftDownEvent.size === 0 && this.eventKey?.has('moduleMouseLeftDown')) this.disableModuleMouseLeftDownEvent();
        break;
      case 'leftUp':
        if (this.moduleMouseLeftUpEvent.size === 0 && this.eventKey?.has('moduleMouseLeftUp')) this.disableModuleMouseLeftUpEvent();
        break;
      case 'dblClick':
        if (this.moduleMouseDblClickEvent.size === 0 && this.eventKey?.has('moduleMouseDblClick')) this.disableModuleMouseDblClickEvent();
        break;
      case 'rightClick':
        if (this.moduleMouseRightClickEvent.size === 0 && this.eventKey?.has('moduleMouseRightClick')) this.disableModuleMouseRightClickEvent();
        break;
    }
  }
  /**
   * 全局事件空集合时自动关闭监听
   */
  private tryAutoDisableGlobalListener(type: 'move' | 'click' | 'leftDown' | 'leftUp' | 'dblClick' | 'rightClick' | 'keyDown'): void {
    switch (type) {
      case 'move':
        if (this.globalMouseMoveEvents.size === 0 && this.eventKey?.has('globalMouseMove')) this.disableGlobalMouseMoveEvent();
        break;
      case 'click':
        if (this.globalMouseClickEvents.size === 0 && this.eventKey?.has('globalMouseClick')) this.disableGlobalMouseClickEvent();
        break;
      case 'leftDown':
        if (this.globalMouseLeftDownEvents.size === 0 && this.eventKey?.has('globalMouseLeftDown')) this.disableGlobalMouseLeftDownEvent();
        break;
      case 'leftUp':
        if (this.globalMouseLeftUpEvents.size === 0 && this.eventKey?.has('globalMouseLeftUp')) this.disableGlobalMouseLeftUpEvent();
        break;
      case 'dblClick':
        if (this.globalMouseDblClickEvents.size === 0 && this.eventKey?.has('globalMouseDblClick')) this.disableGlobalMouseDblClickEvent();
        break;
      case 'rightClick':
        if (this.globalMouseRightClickEvents.size === 0 && this.eventKey?.has('globalMouseRightClick')) this.disableGlobalMouseRightClickEvent();
        break;
      case 'keyDown':
        if (this.globalKeyDownEvents.size === 0 && this.eventKey?.has('globalKeyDown')) this.disableGlobalKeyDownEvent();
        break;
    }
  }
  /**
   * 模块下鼠标左键按下监听器处理方法
   * @param event 鼠标事件
   */
  private moduleMouseLeftDown(event: MouseEvent): void {
    if (event.button != 0) return;
    const pixel = this.map.getEventPixel({ clientX: event.x, clientY: event.y });
    const features = this.map.forEachFeatureAtPixel(pixel, (feature, layer) => {
      return {
        id: feature.getId(),
        module: feature.get('module'),
        feature: <Feature>feature,
        layer
      };
    });
    if (features && features.feature.get('module')) {
      const moduleEvent = this.moduleMouseLeftDownEvent.get(features.feature.get('module'));
      const coordinate = this.map.getEventCoordinate(event);
      if (moduleEvent) {
        moduleEvent.callback.call(this, {
          position: toLonLat(coordinate),
          feature: features.feature,
          layer: features.layer,
          id: features.id
        });
      }
    }
  }
  /**
   * 模块下鼠标左键抬起监听器处理方法
   * @param event 鼠标事件
   */
  private moduleMouseLeftUp(event: MouseEvent): void {
    if (event.button != 0) return;
    const pixel = this.map.getEventPixel({ clientX: event.x, clientY: event.y });
    const features = this.map.forEachFeatureAtPixel(pixel, (feature, layer) => {
      return {
        id: feature.getId(),
        module: feature.get('module'),
        feature: <Feature>feature,
        layer
      };
    });
    if (features && features.feature.get('module')) {
      const moduleEvent = this.moduleMouseLeftUpEvent.get(features.feature.get('module'));
      const coordinate = this.map.getEventCoordinate(event);
      if (moduleEvent) {
        moduleEvent.callback.call(this, {
          position: toLonLat(coordinate),
          feature: features.feature,
          layer: features.layer,
          id: features.id
        });
      }
    }
  }
  /**
   * 模块下鼠标右键单击监听器处理方法
   * @param event 鼠标事件
   */
  private moduleMouseRightClick(event: MouseEvent): void {
    const pixel = this.map.getEventPixel({ clientX: event.x, clientY: event.y });
    const features = this.map.forEachFeatureAtPixel(pixel, (feature, layer) => {
      return {
        id: feature.getId(),
        module: feature.get('module'),
        feature: <Feature>feature,
        layer
      };
    });
    if (features && features.feature.get('module')) {
      const moduleEvent = this.moduleMouseRightClickEvent.get(features.feature.get('module'));
      const coordinate = this.map.getEventCoordinate(event);
      if (moduleEvent) {
        moduleEvent.callback.call(this, {
          position: toLonLat(coordinate),
          feature: features.feature,
          layer: features.layer,
          id: features.id
        });
      }
    }
  }
  /**
   * 全局下鼠标左键按下监听器处理方法
   * @param event 鼠标事件
   */
  private globalMouseLeftDown(event: MouseEvent): void {
    if (event.button != 0) return;
    if (this.globalMouseLeftDownEvents.size === 0) return;
    const coordinate = this.map.getEventCoordinate(event);
    this.globalMouseLeftDownEvents.forEach((cb) => {
      try {
        cb.call(this, { position: toLonLat(coordinate), pixel: [event.x, event.y] });
      } catch (e) {
        console.error('global mousedown callback error:', e);
      }
    });
  }
  /**
   * 全局下鼠标左键抬起监听器处理方法
   * @param event 鼠标事件
   */
  private globalMouseLeftUp(event: MouseEvent): void {
    if (event.button != 0) return;
    if (this.globalMouseLeftUpEvents.size === 0) return;
    const coordinate = this.map.getEventCoordinate(event);
    this.globalMouseLeftUpEvents.forEach((cb) => {
      try {
        cb.call(this, { position: toLonLat(coordinate), pixel: [event.x, event.y] });
      } catch (e) {
        console.error('global mouseup callback error:', e);
      }
    });
  }
  /**
   * 全局下鼠标右键单击监听器处理方法
   * @param event 鼠标事件
   */
  private globalMouseRightClick(event: MouseEvent): void {
    if (this.globalMouseRightClickEvents.size === 0) return;
    const coordinate = this.map.getEventCoordinate(event);
    this.globalMouseRightClickEvents.forEach((cb) => {
      try {
        cb.call(this, { position: toLonLat(coordinate), pixel: [event.x, event.y] });
      } catch (e) {
        console.error('global contextmenu callback error:', e);
      }
    });
  }
  /**
   * 全局下键盘按下监听器处理方法
   */
  private globalKeyDown(event: KeyboardEvent): void {
    if (!event.repeat) {
      if (this.globalKeyDownEvents.size === 0) return;
      this.globalKeyDownEvents.forEach((cb) => {
        try {
          cb.call(this, event);
        } catch (e) {
          // 单个回调报错不影响其它回调执行
          console.error('global keydown callback error:', e);
        }
      });
    }
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
    if (!this.eventKey?.has('moduleMouseMove')) {
      const key = this.map.on('pointermove', (evt) => {
        if (this.map.hasFeatureAtPixel(evt.pixel)) {
          const features = this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
            return {
              id: feature.getId(),
              module: feature.get('module'),
              feature: <Feature>feature,
              layer
            };
          });
          if (features && features.feature.get('module') && features.feature.getId() !== this.currentEntity?.feature?.getId()) {
            const moduleEvent = this.moduleMouseMoveEvent.get(features.feature.get('module'));
            if (moduleEvent) {
              this.currentEntity = features;
              moduleEvent.callback.call(this, {
                position: toLonLat(evt.coordinate),
                feature: features.feature,
                layer: features.layer,
                id: features.id
              });
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
      });
      this.eventKey?.set('moduleMouseMove', key);
    } else {
      console.warn('重复启用模块下鼠标移动事件监听,请检查');
    }
  }
  /**
   * 启用模块下鼠标点击事件监听
   */
  enableModuleMouseClickEvent(): void {
    if (!this.eventKey?.has('moduleMouseClick')) {
      const key = this.map.on('click', (evt) => {
        const features = this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
          return {
            id: feature.getId(),
            module: feature.get('module'),
            feature: <Feature>feature,
            layer
          };
        });
        if (features && features.feature.get('module')) {
          const moduleEvent = this.moduleMouseClickEvent.get(features.feature.get('module'));
          if (moduleEvent) {
            moduleEvent.callback.call(this, {
              position: toLonLat(evt.coordinate),
              feature: features.feature,
              layer: features.layer,
              id: features.id
            });
          }
        }
      });
      this.eventKey?.set('moduleMouseClick', key);
    } else {
      console.warn('重复启用模块下鼠标点击事件监听,请检查');
    }
  }
  /**
   * 启用模块下鼠标左键按下事件监听
   */
  enableModuleMouseLeftDownEvent(): void {
    if (!this.eventKey?.has('moduleMouseLeftDown')) {
      const handler = this.moduleMouseLeftDown.bind(this);
      this.map.getViewport().addEventListener('mousedown', handler);
      this.eventKey?.set('moduleMouseLeftDown', handler);
    } else {
      console.warn('重复启用模块下鼠标左键按下事件监听,请检查');
    }
  }
  /**
   * 启用模块下鼠标左键抬起事件监听
   */
  enableModuleMouseLeftUpEvent(): void {
    if (!this.eventKey?.has('moduleMouseLeftUp')) {
      const handler = this.moduleMouseLeftUp.bind(this);
      this.map.getViewport().addEventListener('mouseup', handler);
      this.eventKey?.set('moduleMouseLeftUp', handler);
    } else {
      console.warn('重复启用模块下鼠标左键抬起事件监听,请检查');
    }
  }
  /**
   * 启用模块下鼠标双击事件
   */
  enableModuleMouseDblClickEvent(): void {
    if (!this.eventKey?.has('moduleMouseDblClick')) {
      const key = this.map.on('dblclick', (evt) => {
        const features = this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
          return {
            id: feature.getId(),
            module: feature.get('module'),
            feature: <Feature>feature,
            layer
          };
        });
        if (features && features.feature.get('module')) {
          const moduleEvent = this.moduleMouseDblClickEvent.get(features.feature.get('module'));
          if (moduleEvent) {
            moduleEvent.callback.call(this, {
              position: toLonLat(evt.coordinate),
              feature: features.feature,
              layer: features.layer,
              id: features.id
            });
          }
        }
      });
      this.eventKey?.set('moduleMouseDblClick', key);
    } else {
      console.warn('重复启用模块下鼠标双击事件监听,请检查');
    }
  }
  /**
   * 启用模块下鼠标右键单击事件监听
   */
  enableModuleMouseRightClickEvent(): void {
    if (!this.eventKey?.has('moduleMouseRightClick')) {
      const handler = this.moduleMouseRightClick.bind(this);
      this.map.getViewport().addEventListener('contextmenu', handler);
      this.eventKey?.set('moduleMouseRightClick', handler);
    } else {
      console.warn('重复启用模块下鼠标右键点击事件监听,请检查');
    }
  }
  /**
   * 启用全局下鼠标移动事件监听
   */
  enableGlobalMouseMoveEvent(): void {
    if (!this.eventKey?.has('globalMouseMove')) {
      const key = this.map.on('pointermove', (evt) => {
        if (this.globalMouseMoveEvents.size === 0) return;
        this.globalMouseMoveEvents.forEach((cb) => {
          try {
            cb.call(this, { position: toLonLat(evt.coordinate), pixel: evt.pixel });
          } catch (e) {
            console.error('global pointermove callback error:', e);
          }
        });
      });
      this.eventKey?.set('globalMouseMove', key);
    } else {
      console.warn('重复启用全局鼠标移动事件监听,请检查');
    }
  }
  /**
   * 启用全局下鼠标点击事件监听
   */
  enableGlobalMouseClickEvent(): void {
    if (!this.eventKey?.has('globalMouseClick')) {
      const key = this.map.on('click', (evt) => {
        if (this.globalMouseClickEvents.size === 0) return;
        this.globalMouseClickEvents.forEach((cb) => {
          try {
            cb.call(this, { position: toLonLat(evt.coordinate), pixel: evt.pixel });
          } catch (e) {
            console.error('global click callback error:', e);
          }
        });
      });
      this.eventKey?.set('globalMouseClick', key);
    } else {
      console.warn('重复启用全局鼠标点击事件监听,请检查');
    }
  }
  /**
   * 启用全局下鼠标左键按下事件监听
   */
  enableGlobalMouseLeftDownEvent(): void {
    if (!this.eventKey?.has('globalMouseLeftDown')) {
      const handler = this.globalMouseLeftDown.bind(this);
      this.map.getViewport().addEventListener('mousedown', handler);
      this.eventKey?.set('globalMouseLeftDown', handler);
    } else {
      console.warn('重复启用全局下鼠标左键按下事件监听,请检查');
    }
  }
  /**
   * 启用全局下鼠标左键抬起事件监听
   */
  enableGlobalMouseLeftUpEvent(): void {
    if (!this.eventKey?.has('globalMouseLeftUp')) {
      const handler = this.globalMouseLeftUp.bind(this);
      this.map.getViewport().addEventListener('mouseup', handler);
      this.eventKey?.set('globalMouseLeftUp', handler);
    } else {
      console.warn('重复启用全局下鼠标左键抬起事件监听,请检查');
    }
  }
  /**
   * 启用全局下鼠标双击事件监听
   */
  enableGlobalMouseDblClickEvent(): void {
    if (!this.eventKey?.has('globalMouseDblClick')) {
      const key = this.map.on('dblclick', (evt) => {
        if (this.globalMouseDblClickEvents.size === 0) return;
        this.globalMouseDblClickEvents.forEach((cb) => {
          try {
            cb.call(this, { position: toLonLat(evt.coordinate), pixel: evt.pixel });
          } catch (e) {
            console.error('global dblclick callback error:', e);
          }
        });
      });
      this.eventKey?.set('globalMouseDblClick', key);
    } else {
      console.warn('重复启用全局鼠标双击事件监听,请检查');
    }
  }
  /**
   * 启用全局下鼠标右键单击事件监听
   */
  enableGlobalMouseRightClickEvent(): void {
    if (!this.eventKey?.has('globalMouseRightClick')) {
      const handler = this.globalMouseRightClick.bind(this);
      this.map.getViewport().addEventListener('contextmenu', handler);
      this.eventKey?.set('globalMouseRightClick', handler);
    } else {
      console.warn('重复启用全局下鼠标右键单击事件监听,请检查');
    }
  }
  /**
   * 启用全局下键盘监听
   */
  enableGlobalKeyDownEvent(): void {
    if (!this.eventKey?.has('globalKeyDown')) {
      const handler = this.globalKeyDown.bind(this);
      document.addEventListener('keydown', handler);
      this.eventKey?.set('globalKeyDown', handler);
    } else {
      console.warn('重复启用全局下键盘监听,请检查');
    }
  }
  /**
   * 停用全局下键盘按下事件监听
   */
  disableGlobalKeyDownEvent(): void {
    const handler = this.eventKey?.get('globalKeyDown');
    if (handler) {
      document.removeEventListener('keydown', handler);
      this.eventKey?.delete('globalKeyDown');
      this.globalKeyDownEvents.clear();
    } else {
      console.warn('未启用全局下键盘监听，关闭失败');
    }
  }
  /**
   * 停用模块下鼠标移动事件监听
   */
  disableModuleMouseMoveEvent(): void {
    const key = this.eventKey?.get('moduleMouseMove');
    if (key) {
      unByKey(key);
      this.eventKey?.delete('moduleMouseMove');
      this.moduleMouseMoveEvent.clear();
    } else {
      console.warn('未启用模块下鼠标移动事件监听，关闭失败');
    }
  }
  /**
   * 停用模块下鼠标点击事件监听
   */
  disableModuleMouseClickEvent(): void {
    const key = this.eventKey?.get('moduleMouseClick');
    if (key) {
      unByKey(key);
      this.eventKey?.delete('moduleMouseClick');
      this.moduleMouseClickEvent.clear();
    } else {
      console.warn('未启用模块下鼠标点击事件监听，关闭失败');
    }
  }
  /**
   * 停用模块下鼠标左键按下事件监听
   */
  disableModuleMouseLeftDownEvent(): void {
    const key = this.eventKey?.get('moduleMouseLeftDown');
    if (key) {
      this.map.getViewport().removeEventListener('mousedown', key);
      this.eventKey?.delete('moduleMouseLeftDown');
      this.moduleMouseLeftDownEvent.clear();
    } else {
      console.warn('未启用模块下鼠标左键按下事件监听，关闭失败');
    }
  }
  /**
   * 停用模块下鼠标左键抬起事件监听
   */
  disableModuleMouseLeftUpEvent(): void {
    const key = this.eventKey?.get('moduleMouseLeftUp');
    if (key) {
      this.map.getViewport().removeEventListener('mouseup', key);
      this.eventKey?.delete('moduleMouseLeftUp');
      this.moduleMouseLeftUpEvent.clear();
    } else {
      console.warn('未启用模块下鼠标左键抬起事件监听，关闭失败');
    }
  }
  /**
   * 停用模块下鼠标双击事件监听
   */
  disableModuleMouseDblClickEvent(): void {
    const key = this.eventKey?.get('moduleMouseDblClick');
    if (key) {
      unByKey(key);
      this.eventKey?.delete('moduleMouseDblClick');
      this.moduleMouseDblClickEvent.clear();
    } else {
      console.warn('未启用模块下鼠标双击击事件监听，关闭失败');
    }
  }
  /**
   * 停用模块下鼠标右键单击事件监听
   */
  disableModuleMouseRightClickEvent(): void {
    const key = this.eventKey?.get('moduleMouseRightClick');
    if (key) {
      this.map.getViewport().removeEventListener('contextmenu', key);
      this.eventKey?.delete('moduleMouseRightClick');
      this.moduleMouseRightClickEvent.clear();
    } else {
      console.warn('未启用模块下鼠标右键单击事件监听，关闭失败');
    }
  }
  /**
   * 停用全局下鼠标移动事件监听
   */
  disableGlobalMouseMoveEvent(): void {
    const key = this.eventKey?.get('globalMouseMove');
    if (key) {
      unByKey(key);
      this.eventKey?.delete('globalMouseMove');
      this.globalMouseMoveEvents.clear();
    } else {
      console.warn('未启用全局下鼠标移动事件监听，关闭失败');
    }
  }
  /**
   * 停用全局下鼠标点击事件监听
   */
  disableGlobalMouseClickEvent(): void {
    const key = this.eventKey?.get('globalMouseClick');
    if (key) {
      unByKey(key);
      this.eventKey?.delete('globalMouseClick');
      this.globalMouseClickEvents.clear();
    } else {
      console.warn('未启用全局下鼠标点击事件监听，关闭失败');
    }
  }
  /**
   * 停用全局下鼠标左键按下事件监听
   */
  disableGlobalMouseLeftDownEvent(): void {
    const key = this.eventKey?.get('globalMouseLeftDown');
    if (key) {
      this.map.getViewport().removeEventListener('mousedown', key);
      this.eventKey?.delete('globalMouseLeftDown');
      this.globalMouseLeftDownEvents.clear();
    } else {
      console.warn('未启用全局下鼠标左键按下事件监听，关闭失败');
    }
  }
  /**
   * 停用全局下鼠标左键抬起事件监听
   */
  disableGlobalMouseLeftUpEvent(): void {
    const key = this.eventKey?.get('globalMouseLeftUp');
    if (key) {
      this.map.getViewport().removeEventListener('mouseup', key);
      this.eventKey?.delete('globalMouseLeftUp');
      this.globalMouseLeftUpEvents.clear();
    } else {
      console.warn('未启用全局下鼠标左键抬起事件监听，关闭失败');
    }
  }
  /**
   * 停用全局下鼠标双击事件监听
   */
  disableGlobalMouseDblClickEvent(): void {
    const key = this.eventKey?.get('globalMouseDblClick');
    if (key) {
      unByKey(key);
      this.eventKey?.delete('globalMouseDblClick');
      this.globalMouseDblClickEvents.clear();
    } else {
      console.warn('未启用全局下鼠标双击事件监听，关闭失败');
    }
  }
  /**
   * 停用全局下鼠标右键单击事件监听
   */
  disableGlobalMouseRightClickEvent(): void {
    const key = this.eventKey?.get('globalMouseRightClick');
    if (key) {
      this.map.getViewport().removeEventListener('contextmenu', key);
      this.eventKey?.delete('globalMouseRightClick');
      this.globalMouseRightClickEvents.clear();
    } else {
      console.warn('未启用全局下鼠标右键单击事件监听，关闭失败');
    }
  }
  /**
   * 按模块添加鼠标移动事件
   * @param module 模块名称
   * @param callback 回调函数，详见{@link ModuleEventCallback}
   */
  /**
   * 按模块添加鼠标移动事件（返回注销函数）
   */
  addMouseMoveEventByModule(module: string, callback: ModuleEventCallback): () => void {
    if (module && module !== '') {
      // 自动启用监听，防止遗忘
      if (!this.eventKey?.has('moduleMouseMove')) this.enableModuleMouseMoveEvent();
      if (!this.moduleMouseMoveEvent.get(module)) {
        this.moduleMouseMoveEvent.set(module, { callback });
        return () => {
          const stored = this.moduleMouseMoveEvent.get(module);
          if (stored && stored.callback === callback) {
            this.moduleMouseMoveEvent.delete(module);
            this.tryAutoDisableModuleListener('move');
          }
        };
      } else {
        console.warn('按模块追加全局鼠标移动事件: module参数重复', module);
      }
    } else {
      console.warn('按模块追加全局鼠标移动事件: module参数不能为空');
    }
    return () => void 0;
  }
  /**
   * 按模块添加鼠标点击事件
   * @param module 模块名称
   * @param callback 回调函数，详见{@link ModuleEventCallback}
   */
  /**
   * 按模块添加鼠标点击事件（返回注销函数）
   */
  addMouseClickEventByModule(module: string, callback: ModuleEventCallback): () => void {
    if (module && module !== '') {
      if (!this.eventKey?.has('moduleMouseClick')) this.enableModuleMouseClickEvent();
      if (!this.moduleMouseClickEvent.get(module)) {
        this.moduleMouseClickEvent.set(module, { callback });
        return () => {
          const stored = this.moduleMouseClickEvent.get(module);
          if (stored && stored.callback === callback) {
            this.moduleMouseClickEvent.delete(module);
            this.tryAutoDisableModuleListener('click');
          }
        };
      } else {
        console.warn('按模块追加全局鼠标点击事件: module参数重复', module);
      }
    } else {
      console.warn('按模块追加全局鼠标点击事件: module参数不能为空');
    }
    return () => void 0;
  }
  /**
   * 按模块添加鼠标左键按下事件
   * @param module 模块名称
   * @param callback 回调函数，详见{@link ModuleEventCallback}
   */
  /**
   * 按模块添加鼠标左键按下事件（返回注销函数）
   */
  addMouseLeftDownEventByModule(module: string, callback: ModuleEventCallback): () => void {
    if (module && module !== '') {
      if (!this.eventKey?.has('moduleMouseLeftDown')) this.enableModuleMouseLeftDownEvent();
      if (!this.moduleMouseLeftDownEvent.get(module)) {
        this.moduleMouseLeftDownEvent.set(module, { callback });
        return () => {
          const stored = this.moduleMouseLeftDownEvent.get(module);
          if (stored && stored.callback === callback) {
            this.moduleMouseLeftDownEvent.delete(module);
            this.tryAutoDisableModuleListener('leftDown');
          }
        };
      } else {
        console.warn('按模块追加全局鼠标左键按下事件: module参数重复', module);
      }
    } else {
      console.warn('按模块追加全局鼠标左键按下事件: module参数不能为空');
    }
    return () => void 0;
  }
  /**
   * 按模块添加鼠标左键抬起事件
   * @param module 模块名称
   * @param callback 回调函数，详见{@link ModuleEventCallback}
   */
  /**
   * 按模块添加鼠标左键抬起事件（返回注销函数）
   */
  addMouseLeftUpEventByModule(module: string, callback: ModuleEventCallback): () => void {
    if (module && module !== '') {
      if (!this.eventKey?.has('moduleMouseLeftUp')) this.enableModuleMouseLeftUpEvent();
      if (!this.moduleMouseLeftUpEvent.get(module)) {
        this.moduleMouseLeftUpEvent.set(module, { callback });
        return () => {
          const stored = this.moduleMouseLeftUpEvent.get(module);
          if (stored && stored.callback === callback) {
            this.moduleMouseLeftUpEvent.delete(module);
            this.tryAutoDisableModuleListener('leftUp');
          }
        };
      } else {
        console.warn('按模块追加全局鼠标左键抬起事件: module参数重复', module);
      }
    } else {
      console.warn('按模块追加全局鼠标左键抬起事件: module参数不能为空');
    }
    return () => void 0;
  }
  /**
   * 按模块添加鼠标双击事件
   * @param module 模块名称
   * @param callback 回调函数，详见{@link ModuleEventCallback}
   */
  /**
   * 按模块添加鼠标双击事件（返回注销函数）
   */
  addMouseDblClickEventByModule(module: string, callback: ModuleEventCallback): () => void {
    if (module && module !== '') {
      if (!this.eventKey?.has('moduleMouseDblClick')) this.enableModuleMouseDblClickEvent();
      if (!this.moduleMouseDblClickEvent.get(module)) {
        this.moduleMouseDblClickEvent.set(module, { callback });
        return () => {
          const stored = this.moduleMouseDblClickEvent.get(module);
          if (stored && stored.callback === callback) {
            this.moduleMouseDblClickEvent.delete(module);
            this.tryAutoDisableModuleListener('dblClick');
          }
        };
      } else {
        console.warn('按模块追加全局鼠标双击事件: module参数重复', module);
      }
    } else {
      console.warn('按模块追加全局鼠标双击事件: module参数不能为空');
    }
    return () => void 0;
  }
  /**
   * 按模块添加鼠标右键单击事件
   * @param module 模块名称
   * @param callback 回调函数，详见{@link ModuleEventCallback}
   */
  /**
   * 按模块添加鼠标右键单击事件（返回注销函数）
   */
  addMouseRightClickEventByModule(module: string, callback: ModuleEventCallback): () => void {
    if (module && module !== '') {
      if (!this.eventKey?.has('moduleMouseRightClick')) this.enableModuleMouseRightClickEvent();
      if (!this.moduleMouseRightClickEvent.get(module)) {
        this.moduleMouseRightClickEvent.set(module, { callback });
        return () => {
          const stored = this.moduleMouseRightClickEvent.get(module);
          if (stored && stored.callback === callback) {
            this.moduleMouseRightClickEvent.delete(module);
            this.tryAutoDisableModuleListener('rightClick');
          }
        };
      } else {
        console.warn('按模块追加全局鼠标右键单击事件: module参数重复', module);
      }
    } else {
      console.warn('按模块追加全局鼠标右键单击事件: module参数不能为空');
    }
    return () => void 0;
  }
  /**
   * 按全局添加鼠标移动事件
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseMoveEventByGlobal(callback: GlobalEventCallback): () => void {
    if (!this.eventKey?.has('globalMouseMove')) this.enableGlobalMouseMoveEvent();
    this.globalMouseMoveEvents.add(callback);
    return () => {
      this.globalMouseMoveEvents.delete(callback);
      this.tryAutoDisableGlobalListener('move');
    };
  }
  /**
   * 按全局添加鼠标点击事件
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseClickEventByGlobal(callback: GlobalEventCallback): () => void {
    if (!this.eventKey?.has('globalMouseClick')) this.enableGlobalMouseClickEvent();
    this.globalMouseClickEvents.add(callback);
    return () => {
      this.globalMouseClickEvents.delete(callback);
      this.tryAutoDisableGlobalListener('click');
    };
  }
  /**
   * 按全局添加鼠标左键按下事件
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseLeftDownEventByGlobal(callback: GlobalEventCallback): () => void {
    if (!this.eventKey?.has('globalMouseLeftDown')) this.enableGlobalMouseLeftDownEvent();
    this.globalMouseLeftDownEvents.add(callback);
    return () => {
      this.globalMouseLeftDownEvents.delete(callback);
      this.tryAutoDisableGlobalListener('leftDown');
    };
  }
  /**
   * 按全局添加鼠标左键抬起事件
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseLeftUpEventByGlobal(callback: GlobalEventCallback): () => void {
    if (!this.eventKey?.has('globalMouseLeftUp')) this.enableGlobalMouseLeftUpEvent();
    this.globalMouseLeftUpEvents.add(callback);
    return () => {
      this.globalMouseLeftUpEvents.delete(callback);
      this.tryAutoDisableGlobalListener('leftUp');
    };
  }
  /**
   * 按全局添加鼠标双击事件
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseDblClickEventByGlobal(callback: GlobalEventCallback): () => void {
    if (!this.eventKey?.has('globalMouseDblClick')) this.enableGlobalMouseDblClickEvent();
    this.globalMouseDblClickEvents.add(callback);
    return () => {
      this.globalMouseDblClickEvents.delete(callback);
      this.tryAutoDisableGlobalListener('dblClick');
    };
  }
  /**
   * 按全局添加鼠标右键单击事件
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseRightClickEventByGlobal(callback: GlobalEventCallback): () => void {
    if (!this.eventKey?.has('globalMouseRightClick')) this.enableGlobalMouseRightClickEvent();
    this.globalMouseRightClickEvents.add(callback);
    return () => {
      this.globalMouseRightClickEvents.delete(callback);
      this.tryAutoDisableGlobalListener('rightClick');
    };
  }
  /**
   * 按全局添加键盘按下事件
   * @param callback 回调函数，详见{@link GlobalKeyDownEventCallback}
   * 可重复添加，返回一个取消当前回调的方法
   */
  addKeyDownEventByGlobal(callback: GlobalKeyDownEventCallback): () => void {
    if (!this.eventKey?.has('globalKeyDown')) this.enableGlobalKeyDownEvent();
    this.globalKeyDownEvents.add(callback);
    // 返回注销函数
    return () => {
      this.globalKeyDownEvents.delete(callback);
      this.tryAutoDisableGlobalListener('keyDown');
    };
  }
  /**
   * 按全局添加鼠标点击事件,只执行一次。该方法无需启用事件和删除事件，直接调用即可
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseOnceClickEventByGlobal(callback: GlobalEventCallback): void {
    this.map.once('click', (evt) => {
      callback.call(this, {
        position: toLonLat(evt.coordinate),
        pixel: evt.pixel
      });
    });
  }
  /**
   * 按全局添加鼠标右击事件,只执行一次。该方法无需启用事件和删除事件，直接调用即可
   * @param callback 回调函数，详见{@link GlobalEventCallback}。可配合{@link Earth}类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素
   */
  addMouseOnceRightClickEventByGlobal(callback: GlobalEventCallback): void {
    this.map.getViewport().addEventListener(
      'contextmenu',
      (event: MouseEvent) => {
        const coordinate = this.map.getEventCoordinate(event);
        callback.call(this, {
          position: toLonLat(coordinate),
          pixel: [event.x, event.y]
        });
      },
      { once: true }
    );
  }
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
    return !!this.eventKey?.has('globalMouseMove') || this.globalMouseMoveEvents.size > 0;
  }
  /**
   * 校验全局是否注册鼠标点击事件
   */
  hasGlobalMouseClickEvent(): boolean {
    return !!this.eventKey?.has('globalMouseClick') || this.globalMouseClickEvents.size > 0;
  }
  /**
   * 校验全局是否注册鼠标左键按下事件
   */
  hasGlobalMouseLeftDownEvent(): boolean {
    return !!this.eventKey?.has('globalMouseLeftDown') || this.globalMouseLeftDownEvents.size > 0;
  }
  /**
   * 校验全局是否注册鼠标左键抬起事件
   */
  hasGlobalMouseLeftUpEvent(): boolean {
    return !!this.eventKey?.has('globalMouseLeftUp') || this.globalMouseLeftUpEvents.size > 0;
  }
  /**
   * 校验全局是否注册鼠标双击事件
   */
  hasGlobalMouseDblClickEvent(): boolean {
    return !!this.eventKey?.has('globalMouseDblClick') || this.globalMouseDblClickEvents.size > 0;
  }
  /**
   * 校验全局是否注册鼠标右键事件
   */
  hasGlobalMouseRightClickEvent(): boolean {
    return !!this.eventKey?.has('globalMouseRightClick') || this.globalMouseRightClickEvents.size > 0;
  }
  /**
   * 校验全局是否注册键盘按下事件
   */
  hasGlobalKeyDownEvent(): boolean {
    return this.globalKeyDownEvents.size > 0;
  }

  /**
   * 移除指定模块的某一类鼠标事件回调
   * @param module 模块名称
   * @param type 事件类型：move | click | leftDown | leftUp | dblClick | rightClick
   * @returns 是否成功移除
   */
  removeModuleEvent(module: string, type: 'move' | 'click' | 'leftDown' | 'leftUp' | 'dblClick' | 'rightClick'): boolean {
    if (!module) return false;
    let removed = false;
    switch (type) {
      case 'move':
        removed = this.moduleMouseMoveEvent.delete(module);
        this.tryAutoDisableModuleListener('move');
        break;
      case 'click':
        removed = this.moduleMouseClickEvent.delete(module);
        this.tryAutoDisableModuleListener('click');
        break;
      case 'leftDown':
        removed = this.moduleMouseLeftDownEvent.delete(module);
        this.tryAutoDisableModuleListener('leftDown');
        break;
      case 'leftUp':
        removed = this.moduleMouseLeftUpEvent.delete(module);
        this.tryAutoDisableModuleListener('leftUp');
        break;
      case 'dblClick':
        removed = this.moduleMouseDblClickEvent.delete(module);
        this.tryAutoDisableModuleListener('dblClick');
        break;
      case 'rightClick':
        removed = this.moduleMouseRightClickEvent.delete(module);
        this.tryAutoDisableModuleListener('rightClick');
        break;
    }
    return removed;
  }

  /**
   * 移除指定模块注册的所有类型鼠标事件回调
   * @param module 模块名称
   */
  removeAllModuleEvents(module: string): void {
    if (!module) return;
    this.moduleMouseMoveEvent.delete(module);
    this.moduleMouseClickEvent.delete(module);
    this.moduleMouseLeftDownEvent.delete(module);
    this.moduleMouseLeftUpEvent.delete(module);
    this.moduleMouseDblClickEvent.delete(module);
    this.moduleMouseRightClickEvent.delete(module);
    // 分别尝试关闭
    this.tryAutoDisableModuleListener('move');
    this.tryAutoDisableModuleListener('click');
    this.tryAutoDisableModuleListener('leftDown');
    this.tryAutoDisableModuleListener('leftUp');
    this.tryAutoDisableModuleListener('dblClick');
    this.tryAutoDisableModuleListener('rightClick');
  }
}
