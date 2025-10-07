/* eslint-disable @typescript-eslint/no-explicit-any */
import { EPlotType } from '../../enum';
import { useEarth } from '../../useEarth';
import { Feature, Map } from 'ol';
import { Geometry } from 'ol/geom';
import AttackArrow from './geom/AttackArrow';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Style, Fill, Stroke } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { Coordinate } from 'ol/coordinate';
import * as PlotUtils from './utils';
import { fromLonLat } from 'ol/proj';
// import Utils from '../../common/Utils'; // 不再需要手动 normalize，改用 wrapX 让要素在复制世界可见

// 事件类型与监听器类型定义（放在类外部避免语法错误）
export type PlotDrawEventName = 'start' | 'add-point' | 'moving' | 'end' | 'cancel' | string;
export type PlotDrawListener = (payload: unknown) => void;

class PlotDraw {
  /**
   * 地图对象
   */
  private map: Map;
  /**
   * 绘制图层
   */
  private layer: VectorLayer<VectorSource<Geometry>> | undefined;
  /**
   * 元素geometry
   */
  private geom: AttackArrow | undefined;
  /**
   * 元素feature
   */
  private feature: Feature<AttackArrow> | undefined;
  /**
   * 元素坐标
   */
  private points: PlotUtils.Point[] = [];
  /** 事件监听集合：事件名 -> 回调集合 */
  private listeners: Record<string, Set<PlotDrawListener>> = {};
  /**
   * 事件监听注销函数集合
   */
  private offEvents: any[] = [];

  constructor() {
    this.map = useEarth().map;
    // 创建图层
    this.layer = this.createLayer();
  }
  /** 获取投影 worldWidth（可能为 undefined） */
  private getWorldWidth(): number | undefined {
    try {
      const extent = this.map.getView().getProjection().getExtent?.();
      if (extent) return extent[2] - extent[0];
    } catch {/* ignore */}
    return undefined;
  }
  /**
   * 将 newPoint 的 x 调整到与 basePoint 最近的 world copy，保证 |dx| <= worldWidth/2
   * 若缺少 worldWidth 则直接返回 newPoint（浅拷贝避免外部修改）
   */
  private adjustToNearestWorld(basePoint: [number, number], newPoint: [number, number]): [number, number] {
    const ww = this.getWorldWidth();
    if (!ww || !isFinite(ww) || ww <= 0) return [newPoint[0], newPoint[1]];
    let x = newPoint[0];
    // 使用 while 处理极端情况下跨越多个 world 的点击
    while (x - basePoint[0] > ww / 2) x -= ww;
    while (x - basePoint[0] < -ww / 2) x += ww;
    return [x, newPoint[1]];
  }
  /**
   * 创建图层
   */
  private createLayer() {
    // 开启 wrapX: 使要素在地图左右无限平移(复制世界)时会被 OpenLayers 自动复制显示
    // 之前通过手动 normalizeToViewWorld 平移坐标到当前 world，会导致要素坐标跳出基础投影范围从而在绘制过程中或结束后不可见
    const source = new VectorSource({ wrapX: true });
    const style = new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new Stroke({
        color: '#ffcc33',
        lineDash: [10, 10],
        width: 2
      }),
      image: new CircleStyle({
        radius: 5,
        stroke: new Stroke({
          color: '#ffcc33'
        })
      })
    });
    const layer = new VectorLayer({ source, style });
    layer.set('dynamicDraw', true);
    this.map.addLayer(layer);
    return layer;
  }
  //   private createLayer() {
  //     return new PolygonLayer<Polygon>(useEarth());
  //   }
  /**
   * 创建元素geometry
   */
  private createGeom(type: EPlotType) {
    if (type === EPlotType.AttackArrow) {
      return new AttackArrow([], [], {});
    }
  }
  /**
   * 创建监听事件
   */
  private createEvent() {
    const event = useEarth().useGlobalEvent();
    const off = event.addMouseClickEventByGlobal(this.mouseClickEvent.bind(this));
    this.offEvents.push(off);
  }
  /**
   * 鼠标单击事件
   */
  private mouseClickEvent(param: { position: Coordinate; pixel: number[] }) {
    // 直接使用基础 world 投影坐标；借助 wrapX=true 让要素在所有复制世界中自动显示
    const projectedRaw = fromLonLat(param.position as [number, number]);
    const projected = this.points.length > 0 ? this.adjustToNearestWorld(this.points[this.points.length - 1] as [number, number], projectedRaw as [number, number]) : projectedRaw;
    if (this.points.length > 0 && PlotUtils.MathDistance(projected, this.points[this.points.length - 1]) < 0.0001) {
      console.warn('点过近');
      return false;
    }
    this.points.push(projected);
    this.geom?.setPoints(this.points);
    // 事件：新增点
    this.emit('add-point', {
      index: this.points.length - 1,
      point: projected,
      pointCount: this.points.length,
      type: this.geom?.getPlotType?.()
    });
    if (this.points.length === 1) {
      const event = useEarth().useGlobalEvent();
      const offMove = event.addMouseMoveEventByGlobal(this.mouseMoveEvent.bind(this));
      const offRightClick = event.addMouseRightClickEventByGlobal(this.mouseRightClickEvent.bind(this));
      this.offEvents.push(offMove, offRightClick);
      // 事件：开始绘制（首点）
      this.emit('start', { type: this.geom?.getPlotType?.(), point: projected, index: 0, pointCount: 1 });
    }
    // 判断是否绘制到最大值
    if (this.geom?.fixPointCount === this.geom?.getPointCount()) {
      // todo 执行退出绘制
    }
  }
  /**
   * 鼠标移动事件
   */
  private mouseMoveEvent(param: { position: Coordinate; pixel: number[] }) {
    if (!this.geom) return;
    const projectedRaw = fromLonLat(param.position as [number, number]);
    const projected = this.points.length > 0 ? this.adjustToNearestWorld(this.points[this.points.length - 1] as [number, number], projectedRaw as [number, number]) : projectedRaw;
    const points = this.points.concat([projected]);
    this.geom.setPoints(points);
    // 事件：移动（动态预览点）
    this.emit('moving', { tempPoint: projected, points, pointCount: this.points.length, index: this.points.length - 1, type: this.geom?.getPlotType?.() });
  }
  /**
   * 鼠标右键事件
   */
  private mouseRightClickEvent() {
    // 结束绘制
    this.geom?.finishDrawing();
    this.drawEnd();
  }
  /**
   * 绘制结束
   */
  private drawEnd() {
    // 事件：结束（在状态清理前收集结果）
    const payload = {
      type: this.geom?.getPlotType?.(),
      points: this.points.slice(),
      coordinates: this.geom?.getCoordinates ? this.geom.getCoordinates() : undefined,
      feature: this.feature
    };
    this.emit('end', payload);
    // 退出绘制
    this.exitDraw();
  }
  /**
   * 退出绘制
   */
  private exitDraw() {
    // 移除图层
    if (this.layer) useEarth().map.removeLayer(this.layer);
    // 清空状态
    this.points = [];
    this.layer = undefined;
    this.geom = undefined;
    this.feature = undefined;
    // 移除监听
    this.offEvents.forEach((off: any) => off());

  }
  /**
   * 事件分发
   */
  private emit(event: PlotDrawEventName, payload?: unknown) {
    const set = this.listeners[event as string];
    if (!set || set.size === 0) return;
    set.forEach((cb: PlotDrawListener) => {
      try {
        cb(payload);
      } catch (e) {
        console.error('[PlotDraw][listener error]', event, e);
      }
    });
  }
  /**
   * 对外事件订阅
   * @param event 事件名称：start | add-point | moving | end | cancel(预留)
   * @param handler 回调函数
   * @returns unsubscribe 取消订阅函数
   */
  public on<T = unknown>(event: PlotDrawEventName, handler: (payload: T) => void): () => void {
    const key = event as string;
    if (!this.listeners[key]) this.listeners[key] = new Set();
    const set = this.listeners[key];
    set.add(handler as PlotDrawListener);
    return () => {
      set.delete(handler as PlotDrawListener);
      if (set.size === 0) delete this.listeners[key];
    };
  }
  /**
   * 只监听一次
   */
  public once<T = unknown>(event: PlotDrawEventName, handler: (payload: T) => void): () => void {
    const off = this.on<T>(event, (p: T) => {
      off();
      handler(p);
    });
    return off;
  }
  /**
   * 取消指定事件/指定回调
   */
  public off(event?: PlotDrawEventName, handler?: (payload: unknown) => void) {
    if (!event) {
      Object.keys(this.listeners).forEach((k) => delete this.listeners[k]);
      return;
    }
    const key = event as string;
    const set = this.listeners[key];
    if (!set) return;
    if (!handler) {
      delete this.listeners[key];
      return;
    }
    set.delete(handler as PlotDrawListener);
    if (set.size === 0) delete this.listeners[key];
  }

  /**
   * 开始绘制
   */
  public init(type: EPlotType) {
    this.geom = this.createGeom(type);
    this.feature = new Feature(this.geom);
    this.feature.set('dynamicDraw', true);
    this.layer?.getSource()?.addFeature(this.feature);
    // 创建监听事件
    this.createEvent();
  }
  /**
   * 销毁：结束绘制、移除图层、清空事件监听。可多次调用（幂等）。
   */
  public destroy() {
    try {
      // 先关闭地图事件监听，避免 exitDraw 二次 remove 报错
      this.off();
      this.exitDraw();
    } catch (e) {
      console.error('[PlotDraw][destroy] error', e);
    } finally {
      // 保底清空
      this.listeners = {};
    }
  }
}

export default PlotDraw;
