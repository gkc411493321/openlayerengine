/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { IPlotEditParams } from '../../interface';
import { Map as OlMap } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { useEarth } from '../../useEarth';
import PolygonLayer from '../../base/PolygonLayer';
import PointLayer from '../../base/PointLayer';
import { EPlotType } from '../../enum';
import AttackArrow from './geom/AttackArrow';
import { Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { Utils } from '../../common';
import TailedAttackArrow from './geom/TailedAttackArrow';

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
   * 中点图层
   */
  private midPointLayer: PointLayer | undefined;
  /**
   * 缓存控制点
   */
  private plotPoints: Coordinate[] = [];
  /**
   * 缓存序列中点
   */
  private midPoints: Coordinate[] = [];
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
  /** 初始(基准) world 索引，保证在多次平移(world wrap)后所有点仍保持在同一 world，避免形变 */
  private baseWorldIndex: number | undefined;
  /**
   * 事件监听器
   */
  private listeners = new globalThis.Map<PlotEditEventType, Set<(payload: IPlotEditEventPayload) => void>>();
  /**
   * 鼠标按下事件销毁回调
   */
  private mouseDown: (() => void) | undefined;
  /**
   * 映射点id与索引的map(控制点)
   */
  private pointIdMap: Map<string, number> | undefined;
  /**
   * 映射点id与索引的map(中点)
   */
  private midPointIdMap: Map<string, number> | undefined;
  /**
   * 鼠标右键按下事件销毁回调
   */
  private mouseRight: (() => void) | undefined;

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
  private emit(
    event: PlotEditEventType,
    payload: Omit<IPlotEditEventPayload, 'plotType' | 'points' | 'coords'> & { points?: Coordinate[]; plotType?: EPlotType; coords?: Coordinate[][] }
  ) {
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
    this.pointLayer = new PointLayer<Point>(useEarth());
    this.midPointLayer = new PointLayer<Point>(useEarth());
  }
  /**
   * 由控制点生成序列中点
   */
  private computeSequentialMidPoints(points: Coordinate[]): Coordinate[] {
    if (!points || points.length < 2) return [];
    // 计算 points[0] 与 points[1] 的中点
    const mid01: Coordinate = [(points[0][0] + points[1][0]) / 2, (points[0][1] + points[1][1]) / 2];
    // 构建临时数组 arr：mid01 + points[2..]
    const arr: Coordinate[] = [mid01].concat(points.slice(2));
    // 若 arr 长度不足以计算相邻中点，返回空数组
    if (arr.length < 2) return [];
    // 计算相邻中点序列
    const result: Coordinate[] = [];
    for (let i = 0; i < arr.length - 1; i++) {
      const a = arr[i];
      const b = arr[i + 1];
      result.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
    }
    return result;
  }
  /**
   * 创建控制点
   */
  private createEditPoint(points: Coordinate[]) {
    // 记录点与id映射map
    const pointIdMap = new Map<string, number>();
    for (let index = 0; index < points.length; index++) {
      const item = points[index];
      const id = Utils.GetGUID();
      pointIdMap.set(id, index);
      this.pointLayer?.add({
        id: id,
        center: item,
        stroke: { color: '#fff' },
        fill: { color: '#00aaff' },
        module: 'plot-ctl-point'
      });
    }
    this.pointIdMap = pointIdMap;
  }
  /**
   * 重新构建全部控制点与中点
   */
  private refreshEditPoints() {
    this.pointLayer?.remove();
    this.createEditPoint(this.plotPoints);
    this.rebuildMidPointsOnly();
  }
  /**
   * 仅重建中点（在控制点集不变或刚更新后调用）
   */
  private rebuildMidPointsOnly() {
    this.midPointLayer?.remove();
    this.createMidEditPoint(this.plotPoints);
  }
  /**
   * 创建控制点
   */
  private createMidEditPoint(points: Coordinate[]) {
    // 记录点与id映射map
    const midPointIdMap = new Map<string, number>();
    // 创建序列中点
    this.midPoints = this.computeSequentialMidPoints(points);
    for (let index = 0; index < this.midPoints.length; index++) {
      const item = this.midPoints[index];
      const id = Utils.GetGUID();
      midPointIdMap.set(id, index);
      this.midPointLayer?.add({
        id: id,
        center: item,
        stroke: { color: '#fff' },
        fill: { color: '#ffae009c' },
        module: 'plot-ctl-point'
      });
    }
    this.midPointIdMap = midPointIdMap;
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
      fill: { color: '#ffffff61' },
      module: 'plot-ctl-polygon'
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
    } else if (plotType === EPlotType.TailedAttackArrow) {
      const geom = new TailedAttackArrow([], plotPoints, {});
      coords = geom.getCoordinates();
    }
    return coords;
  }
  /**
   * 创建修改监听
   */
  private createModifyEvent() {
    const event = useEarth().useGlobalEvent();
    // 鼠标移入
    event.addMouseMoveEventByModule('plot-ctl-point', (e) => {
      if (e.feature) {
        useEarth().setMouseStyle('move');
      } else {
        useEarth().setMouseStyleToDefault();
      }
    });
    // 鼠标按下
    this.mouseDown = event.addMouseLeftDownEventByModule('plot-ctl-point', (e) => {
      if (!e || !e.feature) return;
      const isCtrlPoint = this.pointIdMap?.has(e.id) ?? false;
      const isMidPoint = !isCtrlPoint && (this.midPointIdMap?.has(e.id) ?? false);
      // 禁用地图拖拽
      useEarth().disabledMapDrag();
      // 公共：右键退出（一次注册即可）
      this.mouseRight = event.addMouseRightClickEventByGlobal(() => {
        this.mouseDown?.();
        this.mouseRight?.();
        this.pointLayer?.remove();
        this.midPointLayer?.remove();
        this.polygonLayer?.remove();
        this.emit('modifyExit', { index: this.modifyPointIndex });
      });
      this.midPointLayer?.hide();
      // =============== 中点新增逻辑 ===============
      if (isMidPoint) {
        const midIdx = this.midPointIdMap!.get(e.id)!; // 当前中点序号
        // 依据 computeSequentialMidPoints 的生成逻辑推导插入索引
        const insertionIndex = midIdx === 0 ? 2 : midIdx + 2;
        const center = (e.feature.getGeometry() as Point).getCoordinates();
        const safeIndex = Math.min(insertionIndex, this.plotPoints.length); // 容错
        this.plotPoints.splice(safeIndex, 0, center as Coordinate);
        // 更新多边形
        this.updateEditPolygon();
        // 重绘控制点与中点（会生成新 id 映射）
        this.refreshEditPoints();
        this.modifyPointIndex = safeIndex;
        // 找到新生成的控制点 id
        let newPointId: string | undefined;
        for (const [pid, idx] of this.pointIdMap!.entries()) {
          if (idx === safeIndex) {
            newPointId = pid;
            break;
          }
        }
        if (!newPointId) return;
        this.emit('modifyStart', { index: this.modifyPointIndex, coordinate: center, originalEvent: e });
        this.pointLayer?.set({ id: newPointId, size: 8 });
        const mouseMove = event.addMouseMoveEventByGlobal((move) => {
          if (this.modifyPointIndex === undefined) return;
          this.pointLayer?.setPosition(newPointId!, fromLonLat(move.position));
          let normalizedProjected = Utils.normalizeToViewWorld(fromLonLat(move.position));
          if (this.baseWorldIndex !== undefined) {
            normalizedProjected = Utils.restoreToWorldIndex(normalizedProjected, this.baseWorldIndex);
          }
          this.plotPoints[this.modifyPointIndex] = normalizedProjected as Coordinate;
          this.updateEditPolygon();
          this.emit('modifying', { index: this.modifyPointIndex, coordinate: normalizedProjected, originalEvent: move });
        });
        const mouseUp = event.addMouseLeftUpEventByGlobal((up) => {
          this.midPointLayer?.show();
          if (this.modifyPointIndex === undefined) return;
          useEarth().enableMapDrag();
          mouseMove();
          mouseUp();
          this.pointLayer?.set({ id: newPointId!, size: 4, center: fromLonLat(up.position) });
          let normalizedProjected = Utils.normalizeToViewWorld(fromLonLat(up.position));
          if (this.baseWorldIndex !== undefined) {
            normalizedProjected = Utils.restoreToWorldIndex(normalizedProjected, this.baseWorldIndex);
          }
          this.plotPoints[this.modifyPointIndex] = normalizedProjected as Coordinate;
          this.updateEditPolygon();
          this.emit('modifyEnd', { index: this.modifyPointIndex, coordinate: normalizedProjected, originalEvent: up });
          // 重新计算中点
          this.rebuildMidPointsOnly();
        });
        return; // 中点逻辑结束
      }

      // =============== 控制点拖拽逻辑（原逻辑） ===============
      if (isCtrlPoint) {
        const index = this.pointIdMap?.get(e.id);
        if (index !== undefined) this.modifyPointIndex = index;
        const center = (e.feature.getGeometry() as Point).getCoordinates();
        this.emit('modifyStart', { index: this.modifyPointIndex, coordinate: center, originalEvent: e });
        this.pointLayer?.set({ id: e.id, size: 8 });
        const mouseMove = event.addMouseMoveEventByGlobal((move) => {
          if (this.modifyPointIndex === undefined) return;
          this.pointLayer?.setPosition(e.id, fromLonLat(move.position));
          let normalizedProjected = Utils.normalizeToViewWorld(fromLonLat(move.position));
          if (this.baseWorldIndex !== undefined) {
            normalizedProjected = Utils.restoreToWorldIndex(normalizedProjected, this.baseWorldIndex);
          }
          this.plotPoints[this.modifyPointIndex] = normalizedProjected as Coordinate;
          this.updateEditPolygon();
          this.emit('modifying', { index: this.modifyPointIndex, coordinate: normalizedProjected, originalEvent: move });
        });
        const mouseUp = event.addMouseLeftUpEventByGlobal((up) => {
          this.midPointLayer?.show();
          if (this.modifyPointIndex === undefined) return;
          useEarth().enableMapDrag();
          mouseMove();
          mouseUp();
          this.pointLayer?.set({ id: e.id, size: 4, center: fromLonLat(up.position) });
          let normalizedProjected = Utils.normalizeToViewWorld(fromLonLat(up.position));
          if (this.baseWorldIndex !== undefined) {
            normalizedProjected = Utils.restoreToWorldIndex(normalizedProjected, this.baseWorldIndex);
          }
          this.plotPoints[this.modifyPointIndex] = normalizedProjected as Coordinate;
          this.updateEditPolygon();
          this.emit('modifyEnd', { index: this.modifyPointIndex, coordinate: normalizedProjected, originalEvent: up });
          // 控制点移动后更新中点
          this.rebuildMidPointsOnly();
        });
      }
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
    // 记录基准 world（取首点）
    if (this.plotPoints.length) {
      this.baseWorldIndex = Utils.getWorldIndex(this.plotPoints[0][0]);
    }
    // 记录标绘类型
    this.plotType = param.plotType;
    // 创建控制点
    this.createEditPoint(param.plotPoints);
    // 创建中间序列点
    this.createMidEditPoint(this.plotPoints);
    // 创建多边形
    this.createEditPolygon(param);
    // // 创建修改监听
    this.createModifyEvent();
  }

  /**
   * 销毁：移除交互、图层与事件监听
   */
  public destroy() {
    // 发出退出事件（如果未主动右键退出）
    this.mouseDown?.();
    this.mouseRight?.();
    // 销毁图层与监听
    this.pointLayer?.remove();
    this.midPointLayer?.remove();
    this.polygonLayer?.remove();
    this.listeners.clear();
    this.plotPoints = [];
    this.modifyPointIndex = undefined;
    this.plotType = undefined;
    this.baseWorldIndex = undefined;
  }
}

export default plotEdit;
