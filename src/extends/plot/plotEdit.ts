/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { IPlotEditParams } from '../../interface';
import { Map as OlMap } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { useEarth } from '../../useEarth';
import PolygonLayer from '../../base/PolygonLayer';
import PointLayer from '../../base/PointLayer';
import { EPlotType } from '../../enum';
import AttackArrow from './geom/AttackArrow';
import { Modify } from 'ol/interaction';
import type { ModifyEvent } from 'ol/interaction/Modify';
import VectorSource from 'ol/source/Vector';
import { Geometry, Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { Utils } from '../../common';

// 事件类型定义
export type PlotEditEventType = 'modifyStart' | 'modifying' | 'modifyEnd' | 'modifyExit';

export interface IPlotEditEventPayload {
  /** 当前修改的控制点索引 */
  index?: number;
  /** 当前修改的控制点坐标 */
  coordinate?: Coordinate;
  /** 最新全部控制点(引用，为保持实时性，不要修改内部元素) */
  points: Coordinate[];
  /** 当前编辑要素（多边形/箭头等）实时坐标集合（外环+内环等），引用 this.coords */
  coords: Coordinate[][];
  /** 标绘类型 */
  plotType?: EPlotType;
  /** 原始事件对象（OpenLayers事件或全局鼠标事件） */
  originalEvent?: unknown;
}

// 全局鼠标移动事件最小类型定义（根据项目实际结构可扩展）
interface GlobalMoveEvent {
  position: Coordinate;
}

interface IPlotParam {
  plotType: EPlotType;
  plotPoints: Coordinate[];
  // 扩展字段（保持灵活性）
  [key: string]: unknown;
}

class plotEdit {
  /**
   * 地图对象
   */
  private map: OlMap;
  /**
   * 多边形图层
   */
  private polygonLayer: PolygonLayer | undefined;
  /**
   * 点图层
   */
  private pointLayer: PointLayer | undefined;
  /**
   * 缓存控制点
   */
  private plotPoints: Coordinate[] = [];
  /**
   * 要素坐标集合
   */
  private coords: Coordinate[][] = [];
  /**
   * 标绘类型
   */
  private plotType: EPlotType | undefined;
  /**
   * 修改点下标
   */
  private modifyPointIndex: number | undefined;
  /**
   * 事件监听器
   */
  private listeners = new globalThis.Map<PlotEditEventType, Set<(payload: IPlotEditEventPayload) => void>>();
  /**
   * 当前修改交互（便于销毁）
   */
  private modifyInteraction?: Modify;

  constructor() {
    this.map = useEarth().map;
    this.createLayer();
  }
  /**
   * 注册事件监听
   * @param event 事件名
   * @param handler 回调
   * @returns off 取消监听函数
   */
  public on(event: PlotEditEventType, handler: (payload: IPlotEditEventPayload) => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
    return () => this.off(event, handler);
  }
  /**
   * 取消监听
   */
  public off(event: PlotEditEventType, handler: (payload: IPlotEditEventPayload) => void) {
    this.listeners.get(event)?.delete(handler);
  }
  /**
   * 分发事件
   */
  private emit(event: PlotEditEventType, payload: Omit<IPlotEditEventPayload, 'plotType' | 'points' | 'coords'> & { points?: Coordinate[]; plotType?: EPlotType; coords?: Coordinate[][] }) {
    const list = this.listeners.get(event);
    if (!list || list.size === 0) return;
    const fullPayload: IPlotEditEventPayload = {
      ...payload, // 先展开外部，其后强制覆盖内部引用，确保回调中的 points 一定是 this.plotPoints
      plotType: this.plotType,
      points: this.plotPoints,
      coords: this.coords
    };
    list.forEach((cb) => {
      try {
        cb(fullPayload);
      } catch (err) {
        // 单个监听异常不影响其它监听
        // 可扩展日志系统
        console.error('[plotEdit emit error]', event, err);
      }
    });
  }
  /**
   * 创建编辑要素图层
   */
  private createLayer() {
    this.polygonLayer = new PolygonLayer(useEarth());
    this.pointLayer = new PointLayer(useEarth());
  }
  /**
   * 创建控制点
   */
  private createEditPoint(points: Coordinate[]) {
    for (const item of points) {
      this.pointLayer?.add({
        center: item,
        stroke: { color: '#fff' },
        fill: { color: '#00aaff' }
      });
    }
  }
  /**
   * 创建编辑要素
   */
  private createEditPolygon(param: IPlotParam) {
    const coords = this.getEditCoordinates(param.plotType, param.plotPoints);
    this.coords = coords;
    this.polygonLayer?.add({
      id: 'edit-plot',
      positions: coords,
      stroke: { color: '#00aaff', width: 2 },
      fill: { color: '#ffffff61' }
    });
  }
  /**
   * 更新编辑要素
   */
  private updateEditPolygon() {
    const coords = this.getEditCoordinates(this.plotType!, this.plotPoints);
    this.coords = coords;
    this.polygonLayer?.setPosition('edit-plot', coords);
  }
  /**
   * 根据plot类型获取要素坐标
   */
  private getEditCoordinates(plotType: EPlotType, plotPoints: Coordinate[]) {
    let coords: Coordinate[][] = [];
    if (plotType === EPlotType.AttackArrow) {
      const geom = new AttackArrow([], plotPoints, {});
      coords = geom.getCoordinates();
    }
    return coords;
  }
  /**
   * 创建修改监听
   */
  private createModifyEvent(modify: Modify) {
    let offMove: () => void;
    modify.on('modifystart', (e: ModifyEvent) => {
      // 分发修改开始回调
      const center = (e.features.getArray()[0].getGeometry()! as Point).getCoordinates();
      for (let i = 0; i < this.plotPoints.length; i++) {
        const p = this.plotPoints[i];
        if (p[0] == center[0] && p[1] == center[1]) {
          this.modifyPointIndex = i;
          break;
        }
      }
      this.emit('modifyStart', { index: this.modifyPointIndex, coordinate: center, originalEvent: e });
      offMove = useEarth()
        .useGlobalEvent()
        .addMouseMoveEventByGlobal((e: GlobalMoveEvent) => {
          if (this.modifyPointIndex !== undefined) {
            const normalizedProjected = Utils.normalizeToViewWorld(fromLonLat(e.position));
            this.plotPoints[this.modifyPointIndex] = normalizedProjected;
            // 更新多边形坐标
            this.updateEditPolygon();
            // 分发修改中回调
            this.emit('modifying', { index: this.modifyPointIndex, coordinate: normalizedProjected, originalEvent: e });
          }
        });
    });
    modify.on('modifyend', (e: ModifyEvent) => {
      const center = (e.features.getArray()[0].getGeometry()! as Point).getCoordinates();
      const normalizedProjected = Utils.normalizeToViewWorld(center);
      if (this.modifyPointIndex !== undefined) {
        this.plotPoints[this.modifyPointIndex] = normalizedProjected;
        // 更新多边形坐标
        this.updateEditPolygon();
        // 关闭鼠标移动监听
        offMove();
        // 分发修改完成回调
        this.emit('modifyEnd', { index: this.modifyPointIndex, coordinate: normalizedProjected, originalEvent: e });
      }
    });
    const offRightClick = useEarth()
      .useGlobalEvent()
      .addMouseRightClickEventByGlobal(() => {
        this.pointLayer?.remove();
        this.polygonLayer?.remove();
        this.map.removeInteraction(modify);
        offRightClick();
        // 分发退出修改回调
        this.emit('modifyExit', { index: this.modifyPointIndex });
      });
  }
  /**
   * 激活绘制工具
   */
  public init(params: IPlotEditParams) {
    // 判断是否存在控制点
    const param = params.feature.get('param') as IPlotParam | undefined;
    if (!param || !param.plotPoints) return;
    // 记录控制点位置
    this.plotPoints = param.plotPoints;
    // 记录标绘类型
    this.plotType = param.plotType;
    // 创建控制点
    this.createEditPoint(param.plotPoints);
    // 创建多边形
    this.createEditPolygon(param);
    // 创建modify
    const modify = new Modify({ source: <VectorSource<Geometry>>this.pointLayer?.getLayer().getSource() });
    modify.set('dynamicDraw', true);
    this.map.addInteraction(modify);
    this.modifyInteraction = modify;
    // 创建修改监听
    this.createModifyEvent(modify);
  }

  /**
   * 销毁：移除交互、图层与事件监听
   */
  public destroy() {
    // 发出退出事件（如果未主动右键退出）
    this.emit('modifyExit', { index: this.modifyPointIndex });
    if (this.modifyInteraction) {
      this.map.removeInteraction(this.modifyInteraction);
      this.modifyInteraction = undefined;
    }
    this.pointLayer?.remove();
    this.polygonLayer?.remove();
    this.listeners.clear();
    this.plotPoints = [];
    this.modifyPointIndex = undefined;
    this.plotType = undefined;
  }
}

export default plotEdit;
