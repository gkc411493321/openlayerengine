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
import OverlayLayer from '../../base/OverlayLayer';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import TailedAttackArrow from './geom/TailedAttackArrow';
import FineArrow from './geom/FineArrow';
import TailedSquadCombatArrow from './geom/TailedSquadCombatArrow';
import AssaultDirectionArrow from './geom/AssaultDirectionArrow';
import DoubleArrow from './geom/DoubleArrow';
import AssemblePolygon from './polygon/AssemblePolygon';
import Circle from './circle/Circle';
import Ellipse from './circle/Ellipse';
import ClosedCurvePolygon from './polygon/ClosedCurvePolygon';

// 事件类型定义（新增 undo / redo）
export type PlotEditEventType = 'modifyStart' | 'modifying' | 'modifyEnd' | 'modifyExit' | 'undo' | 'redo';

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
  /** 键盘事件销毁回调 */
  private keyDownDispose: (() => void) | undefined;
  /** 历史记录栈（包含初始状态） */
  private historyStack: Coordinate[][] = [];
  /** 重做栈 */
  private redoStack: Coordinate[][] = [];
  /** 是否已经记录初始快照 */
  private hasRecordedInitial = false;
  /** 历史记录最大长度 */
  private historyLimit = 50;
  /** Tooltip Overlay */
  private overlay: OverlayLayer<unknown> | undefined;
  /** Tooltip overlay key */
  private overlayKey: EventsKey | undefined;
  /** Tooltip DOM */
  private helpTooltipElement: HTMLDivElement | null = null;
  /** 基础提示内容 */
  private baseTooltipContent = '拖拽控制点进行编辑，右键退出';
  /** 是否处于拖拽中 */
  private isDragging = false;

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
   * 记录当前控制点快照（若与上一快照一致则跳过）
   * @param forceInitial 是否强制作为初始快照（仅第一次）
   */
  private recordSnapshot(forceInitial = false) {
    if (forceInitial && this.hasRecordedInitial) return; // 初始已记录则忽略
    const clonePoints = this.plotPoints.map((p) => [p[0], p[1]] as Coordinate);
    if (!forceInitial && this.historyStack.length) {
      const last = this.historyStack[this.historyStack.length - 1];
      if (last && last.length === clonePoints.length) {
        let same = true;
        for (let i = 0; i < last.length; i++) {
          if (last[i][0] !== clonePoints[i][0] || last[i][1] !== clonePoints[i][1]) {
            same = false;
            break;
          }
        }
        if (same) return; // 无变化跳过
      }
    }
    this.historyStack.push(clonePoints);
    if (this.historyStack.length > this.historyLimit) this.historyStack.shift();
    // 新快照产生后清空 redo 栈
    this.redoStack = [];
    if (forceInitial) this.hasRecordedInitial = true;
    // 刷新提示中撤销/重做统计
    this.updateUndoRedoTooltip();
  }
  /** 应用某份快照 */
  private applySnapshot(snapshot?: Coordinate[]) {
    if (!snapshot) return;
    this.plotPoints = snapshot.map((p) => [p[0], p[1]] as Coordinate);
    this.updateEditPolygon();
    this.refreshEditPoints();
  }
  /** 撤销 */
  public undo() {
    if (this.historyStack.length <= 1) return; // 至少保留初始
    const current = this.historyStack.pop(); // 当前状态（将要撤销）
    if (current) this.redoStack.push(current);
    const prev = this.historyStack[this.historyStack.length - 1]; // 撤销后目标快照
    // 计算差异索引（仅在单点变化时提供）
    const diffIdx = this.computeSingleDiffIndex(current, prev);
    this.applySnapshot(prev);
    if (diffIdx !== undefined) {
      this.emit('modifying', { index: diffIdx, coordinate: this.plotPoints[diffIdx] });
    } else {
      this.emit('modifying', { index: undefined });
    }
    this.emit('undo', { index: diffIdx });
    this.updateUndoRedoTooltip();
  }
  /** 重做 */
  public redo() {
    if (!this.redoStack.length) return;
    const snap = this.redoStack.pop(); // 目标快照
    if (!snap) return;
    // 当前状态（应用前）
    const cur = this.plotPoints.map((p) => [p[0], p[1]] as Coordinate);
    this.historyStack.push(cur); // 入历史
    const diffIdx = this.computeSingleDiffIndex(cur, snap);
    this.applySnapshot(snap);
    if (diffIdx !== undefined) {
      this.emit('modifying', { index: diffIdx, coordinate: this.plotPoints[diffIdx] });
    } else {
      this.emit('modifying', { index: undefined });
    }
    this.emit('redo', { index: diffIdx });
    this.updateUndoRedoTooltip();
  }
  /** 计算两个快照间是否仅单点差异，返回该点索引 */
  private computeSingleDiffIndex(a?: Coordinate[], b?: Coordinate[]): number | undefined {
    if (!a || !b || a.length !== b.length) return undefined;
    let diffIdx: number | undefined = undefined;
    for (let i = 0; i < a.length; i++) {
      if (a[i][0] !== b[i][0] || a[i][1] !== b[i][1]) {
        if (diffIdx !== undefined) return undefined; // 超过一个差异
        diffIdx = i;
      }
    }
    return diffIdx;
  }
  /** 注册键盘撤销/重做 */
  private setupKeyDown() {
    try {
      useEarth().useGlobalEvent().enableGlobalKeyDownEvent && useEarth().useGlobalEvent().enableGlobalKeyDownEvent();
      this.keyDownDispose = useEarth()
        .useGlobalEvent()
        .addKeyDownEventByGlobal((ev: KeyboardEvent) => {
          const key = ev.key.toLowerCase();
          if (key === 'z' && ev.ctrlKey) {
            this.undo();
            ev.preventDefault();
          } else if (key === 'y' && ev.ctrlKey) {
            this.redo();
            ev.preventDefault();
          }
        });
    } catch (_) {
      /* ignore */
    }
  }
  /** 初始化帮助提示 */
  private initHelpTooltip(str: string) {
    if (typeof document === 'undefined') return;
    if (!this.overlay) this.overlay = new OverlayLayer();
    this.baseTooltipContent = str;
    if (!this.helpTooltipElement) {
      const div = document.createElement('div');
      div.className = 'ol-tooltip';
      div.innerHTML = str;
      document.body.appendChild(div);
      this.helpTooltipElement = div;
      // 添加 overlay
      this.overlay.add({
        id: 'plot_edit_help_tooltip',
        position: fromLonLat([0, 0]),
        element: div,
        offset: [15, -11]
      });
      this.overlayKey = this.map.on('pointermove', (evt) => {
        this.overlay?.setPosition('plot_edit_help_tooltip', evt.coordinate);
      });
    } else {
      this.helpTooltipElement.innerHTML = str;
      this.overlay.set({ id: 'plot_edit_help_tooltip', element: this.helpTooltipElement });
    }
    // 初次渲染撤销/重做提示
    this.updateUndoRedoTooltip();
  }
  /** 更新撤销/重做计数到提示 */
  private updateUndoRedoTooltip() {
    if (!this.helpTooltipElement) return;
    const undoCount = Math.max(0, this.historyStack.length - 1); // 初始不计入
    const redoCount = this.redoStack.length;
    let extra = '<br/>';
    if (undoCount > 0) {
      extra += `<span style="color:#ff9800; font-weight:bold; padding-right:6px;">Ctrl+Z 撤销 (${undoCount})</span>`;
    }
    if (redoCount > 0) {
      extra += `<span style="color:#00bfa5; font-weight:bold;">Ctrl+Y 重做 (${redoCount})</span>`;
    }
    this.helpTooltipElement.innerHTML = `<div>${this.baseTooltipContent}${undoCount > 0 || redoCount > 0 ? ' ' + extra : ''}</div>`;
  }
  /** 设置临时提示文本（不显示撤销/重做计数） */
  private setTransientTooltip(text: string) {
    if (!this.helpTooltipElement) return;
    this.helpTooltipElement.innerHTML = `<div>${text}</div>`;
  }
  /** 移除帮助提示 */
  private removeHelpTooltip() {
    if (this.overlayKey) {
      unByKey(this.overlayKey);
      this.overlayKey = undefined;
    }
    if (this.overlay) {
      this.overlay.remove();
    }
    if (this.helpTooltipElement && this.helpTooltipElement.parentNode) {
      this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement);
    }
    this.helpTooltipElement = null;
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
    if (this.midPoints && this.midPoints.length > 0) {
      this.rebuildMidPointsOnly();
    }
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
    } else if (plotType === EPlotType.FineArrow) {
      const geom = new FineArrow([], plotPoints, {});
      coords = geom.getCoordinates();
    } else if (plotType === EPlotType.TailedSquadCombatArrow) {
      const geom = new TailedSquadCombatArrow([], plotPoints, {});
      coords = geom.getCoordinates();
    } else if (plotType === EPlotType.AssaultDirectionArrow) {
      const geom = new AssaultDirectionArrow([], plotPoints, {});
      coords = geom.getCoordinates();
    } else if (plotType === EPlotType.DoubleArrow) {
      const geom = new DoubleArrow([], plotPoints, {});
      coords = geom.getCoordinates();
    } else if (plotType === EPlotType.AssemblePolygon) {
      const geom = new AssemblePolygon([], plotPoints, {});
      coords = geom.getCoordinates();
    } else if (plotType === EPlotType.Circle) {
      const geom = new Circle([], plotPoints, {});
      coords = geom.getCoordinates();
    } else if (plotType === EPlotType.Ellipse) {
      const geom = new Ellipse([], plotPoints, {});
      coords = geom.getCoordinates();
    } else if (plotType === EPlotType.ClosedCurvePolygon) {
      const geom = new ClosedCurvePolygon([], plotPoints, {});
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
        // 根据当前要素 id 判断是否是中点
        const id = e.id;
        if (this.isDragging) {
          this.setTransientTooltip('拖拽中...');
        } else if (id && this.midPointIdMap?.has(id)) {
          this.setTransientTooltip('添加点');
        } else {
          this.updateUndoRedoTooltip();
        }
      } else {
        useEarth().setMouseStyleToDefault();
        if (!this.isDragging) this.updateUndoRedoTooltip();
      }
    });
    // 鼠标按下
    this.mouseDown = event.addMouseLeftDownEventByModule('plot-ctl-point', (e) => {
      if (!e || !e.feature) return;
      const isCtrlPoint = this.pointIdMap?.has(e.id) ?? false;
      const isMidPoint = !isCtrlPoint && (this.midPointIdMap?.has(e.id) ?? false);
      // 禁用地图拖拽
      useEarth().disabledMapDrag();
      this.midPointLayer?.hide();
      // =============== 中点新增逻辑 ===============
      if (isMidPoint) {
        const midIdx = this.midPointIdMap!.get(e.id)!; // 当前中点序号
        const insertionIndex = midIdx === 0 ? 2 : midIdx + 2; // 推导插入索引
        const center = (e.feature.getGeometry() as Point).getCoordinates();
        const safeIndex = Math.min(insertionIndex, this.plotPoints.length);
        // 插入前当前最后一个快照即为修改前状态，无需重复记录
        this.plotPoints.splice(safeIndex, 0, center as Coordinate);
        this.updateEditPolygon();
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
        this.isDragging = true;
        this.setTransientTooltip('拖拽中...');
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
          // 记录快照（本次操作完成后）
          this.recordSnapshot();
          // 重新计算中点
          this.rebuildMidPointsOnly();
          this.isDragging = false;
          this.updateUndoRedoTooltip();
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
        this.isDragging = true;
        this.setTransientTooltip('拖拽中...');
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
          // 记录快照（结束）
          this.recordSnapshot();
          if (this.midPoints && this.midPoints.length > 0) {
            // 控制点移动后更新中点
            this.rebuildMidPointsOnly();
          }
          this.isDragging = false;
          this.updateUndoRedoTooltip();
        });
      }
    });
    // 右键退出（一次注册即可）
    this.mouseRight = event.addMouseRightClickEventByGlobal(() => {
      this.mouseDown?.();
      this.mouseRight?.();
      this.pointLayer?.remove();
      this.midPointLayer?.remove();
      this.polygonLayer?.remove();
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
    // 记录基准 world（取首点）
    if (this.plotPoints.length) {
      this.baseWorldIndex = Utils.getWorldIndex(this.plotPoints[0][0]);
    }
    // 记录标绘类型
    this.plotType = param.plotType;
    // 创建控制点
    this.createEditPoint(param.plotPoints);
    const exclude = [EPlotType.FineArrow, EPlotType.TailedSquadCombatArrow, EPlotType.AssaultDirectionArrow, EPlotType.DoubleArrow, EPlotType.AssemblePolygon, EPlotType.Circle];
    if (!exclude.includes(this.plotType)) {
      // 创建中间序列点
      this.createMidEditPoint(this.plotPoints);
    }
    // 创建多边形
    this.createEditPolygon(param);
    // // 创建修改监听
    this.createModifyEvent();
    // 注册键盘撤销/重做
    this.setupKeyDown();
    // 初始快照
    this.recordSnapshot(true);
    // 初始化提示牌
    this.initHelpTooltip(this.baseTooltipContent);
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
    this.historyStack = [];
    this.redoStack = [];
    this.hasRecordedInitial = false;
    this.keyDownDispose && this.keyDownDispose();
    this.keyDownDispose = undefined;
    this.removeHelpTooltip();
  }
}

export default plotEdit;
