/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DrawType, IDrawEvent, IDrawLine, IDrawPoint, IDrawPolygon, IEditParam, IPointParam, ModifyType } from '../interface';
import { Feature, Map } from 'ol';
import { Geometry, LineString, Point, Polygon, Circle as CircleGeom } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Earth from '../Earth';
import { Draw, Modify } from 'ol/interaction';
import { useEarth } from '../useEarth';
import { DrawEvent } from 'ol/interaction/Draw';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { OverlayLayer, PointLayer, PolygonLayer, PolylineLayer, CircleLayer, Base } from '../base';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import { Coordinate } from 'ol/coordinate';
import { Utils } from '../common';
import PlotDraw from '../extends/plot/plotDraw';
import { EPlotType } from '../enum';
import { IPlotAttackArrow } from '../interface';
import AttackArrow from '../extends/plot/geom/AttackArrow';
import PlotEdit from '../extends/plot/plotEdit';
import TailedAttackArrow from '@/extends/plot/geom/TailedAttackArrow';
import FineArrow from '@/extends/plot/geom/FineArrow';
import TailedSquadCombat from '@/extends/plot/geom/TailedSquadCombatArrow';
import AssaultDirectionArrow from '@/extends/plot/geom/AssaultDirectionArrow';
import DoubleArrow from '@/extends/plot/geom/DoubleArrow';

// 编辑历史记录类型定义（用于当前会话内 Ctrl+Z / Ctrl+Y）
type HistoryLineRecord = { type: 'LineString'; before: Coordinate[]; after: Coordinate[]; apply: (coords: Coordinate[]) => void };
type HistoryPolygonRecord = { type: 'Polygon'; before: Coordinate[]; after: Coordinate[]; apply: (coords: Coordinate[]) => void };
type HistoryPointRecord = { type: 'Point'; before: Coordinate; after: Coordinate; apply: (coord: Coordinate) => void };
type HistoryRecord = HistoryLineRecord | HistoryPolygonRecord | HistoryPointRecord;
/**
 * 动态绘制类
 */
export default class DynamicDraw {
  /**
   * map实例
   */
  private map: Map;
  /**
   * 图层数据源
   */
  private source: VectorSource<Geometry>;
  /**
   * 绘制工具
   */
  private draw: Draw | undefined;
  /**
   * 绘制提示覆盖物
   */
  private overlay: OverlayLayer<unknown>;
  /**
   * 提示覆盖物监听器key
   */
  private overlayKey: EventsKey | undefined;
  /**
   * 绘制图层
   */
  private layer: VectorLayer<VectorSource<Geometry>>;
  /** 撤销栈 */
  private undoStack: HistoryRecord[] = [];
  /** 重做栈 */
  private redoStack: HistoryRecord[] = [];
  /** 当前编辑阶段键盘监听 */
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  /** 提示牌 DOM */
  private helpTooltipElement: HTMLDivElement | null = null;
  /** 基础提示内容（不含撤销/重做动态部分） */
  private baseTooltipContent = '';
  /** 使用的临时绘制 source（不再长期存储结果） */
  private tempSource: VectorSource<Geometry>;
  /** 临时绘制图层（仅用于交互过程显示） */
  private tempLayer: VectorLayer<VectorSource<Geometry>>;
  /** 目标基础图层实例（懒加载） */
  private pointLayer?: PointLayer;
  private polylineLayer?: PolylineLayer;
  private polygonLayer?: PolygonLayer;
  private circleLayer?: CircleLayer;
  /**
   * 构造器
   * @param earth 地图实例
   */
  constructor(earth: Earth) {
    // 仅保留一个临时绘制图层用于交互，结果要素将写入基础图层
    const source = new VectorSource();
    const layer = new VectorLayer({ source });
    layer.set('layerType', 'dynamicDrawTempLayer');
    earth.addLayer(layer); // 保持与旧实现兼容（仍在地图上显示绘制过程）
    this.map = earth.map;
    this.source = source; // 兼容旧属性命名
    this.layer = layer; // 兼容旧属性命名
    this.tempSource = source;
    this.tempLayer = layer;
    this.overlay = new OverlayLayer();
  }
  /** 获取对应基础图层（懒创建，避免与用户手工创建重复冲突：如果外部已存在同类型图层，可在 Earth 封装里拓展一个获取逻辑；这里简单内部创建一次） */
  private getBaseLayer(type: 'Point' | 'LineString' | 'Polygon' | 'Circle') {
    if (type === 'Point') {
      if (!this.pointLayer) this.pointLayer = new PointLayer();
      return this.pointLayer;
    }
    if (type === 'LineString') {
      if (!this.polylineLayer) this.polylineLayer = new PolylineLayer();
      return this.polylineLayer;
    }
    if (type === 'Polygon') {
      if (!this.polygonLayer) this.polygonLayer = new PolygonLayer();
      return this.polygonLayer;
    }
    if (type === 'Circle') {
      if (!this.circleLayer) this.circleLayer = new CircleLayer();
      return this.circleLayer;
    }
    return undefined;
  }
  /**
   * 提示牌初始化方法
   */
  private initHelpTooltip(str: string) {
    this.baseTooltipContent = str;
    const div = document.createElement('div');
    div.innerHTML = "<div class='ol-tooltip'>" + str + '</div>';
    this.helpTooltipElement = div as HTMLDivElement;
    document.body.appendChild(div);
    this.overlay.add({
      id: 'draw_help_tooltip',
      position: fromLonLat([0, 0]),
      element: div,
      offset: [15, -11]
    });
    this.overlayKey = this.map.on('pointermove', (evt) => {
      this.overlay.setPosition('draw_help_tooltip', evt.coordinate);
    });
  }

  /** 根据 undo/redo 状态动态刷新提示 */
  private updateUndoRedoTooltip() {
    if (!this.helpTooltipElement) return;
    // 仅在编辑过程中使用：当两栈都为空时不显示快捷键提示
    let extra = '<br/>';
    if (this.undoStack.length > 0) {
      extra += `<span style="color:#ff9800; font-weight: bold; padding-right:6px;">Ctrl+Z 撤销 (${this.undoStack.length})</span>`;
    }
    if (this.redoStack.length > 0) {
      if (extra) extra += `<span style="color:#888;"></span>`;
      extra += `<span style="color:#00bfa5; font-weight: bold;">Ctrl+Y 重做 (${this.redoStack.length})</span>`;
    }
    this.helpTooltipElement.innerHTML = `<div class='ol-tooltip'>${this.baseTooltipContent}${extra ? ' ' + extra : ''}</div>`;
  }
  /**
   * 绘制工具初始化
   * @param type 绘制类型
   */
  private initDraw(
    type: 'Point' | 'LineString' | 'LinearRing' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon' | 'GeometryCollection' | 'Circle',
    param?: (IDrawPoint | IDrawLine | IDrawPolygon | undefined) & {
      strokeColor?: string;
      strokeWidth?: number;
      fillColor?: string;
      // 绘制结束后是否保留图形（沿用旧逻辑）
      keepGraphics?: boolean;
      // 限制点数量（旧参数在 IDrawPoint 内）
      limit?: number;
      callback?: (e: IDrawEvent) => void;
    }
  ) {
    if (this.draw) {
      this.map.removeInteraction(this.draw);
    }
    if (this.overlayKey) {
      this.overlay.remove('draw_help_tooltip');
      unByKey(this.overlayKey);
      this.overlayKey = undefined;
    }
    // 初始化提示标牌
    this.initHelpTooltip('左击开始绘制，右击退出绘制');
    useEarth().setMouseStyle('pointer');
    const drawStyle = new Style({
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
    // 如果存在绘制工具 则清除以前的绘制工具
    // if (this.draw) this.map.removeInteraction(this.draw);
    // 创建绘制
    // 使用临时 source 承载交互中的要素
    this.draw = new Draw({
      source: this.tempSource,
      type: type,
      style: drawStyle,
      stopClick: true,
      geometryName: type,
      condition: (e) => {
        if (e.originalEvent.button == 0) {
          return true;
        } else {
          return false;
        }
      },
      finishCondition: () => {
        if (type == 'Point') {
          return true;
        } else {
          return false;
        }
      }
    });
    this.draw.set('dynamicDraw', true);
    // 添加到map
    this.map.addInteraction(this.draw);
    // 调用事件监听
    this.drawChange(
      (event) => {
        param?.callback?.call(this, event);
      },
      type,
      param
    );
  }
  /**
   * 退出绘制工具
   * @param event 绘制事件
   * @param callback 回调函数
   */
  private exitDraw(event: { position: Coordinate }, callback?: (e: IDrawEvent) => void) {
    if (useEarth().useGlobalEvent().hasGlobalMouseRightClickEvent()) {
      useEarth().useGlobalEvent().disableGlobalMouseRightClickEvent();
    }
    if (useEarth().useGlobalEvent().hasGlobalMouseMoveEvent()) {
      useEarth().useGlobalEvent().disableGlobalMouseMoveEvent();
    }
    if (useEarth().useGlobalEvent().hasGlobalMouseLeftDownEvent()) {
      useEarth().useGlobalEvent().disableGlobalMouseLeftDownEvent();
    }
    if (this.draw) {
      // this.draw.removeLastPoint();
      this.draw.finishDrawing();
      this.map.removeInteraction(this.draw);
    }
    if (this.overlayKey) {
      this.overlay.remove('draw_help_tooltip');
      unByKey(this.overlayKey);
      this.overlayKey = undefined;
    }
    useEarth().setMouseStyleToDefault();
    callback?.call(this, {
      type: DrawType.Drawexit,
      eventPosition: event.position
    });
  }
  /**
   * 绘制事件监听
   * @param callback 回调函数，详见{@link IDrawEvent}
   * @param param 参数
   */
  private drawChange(callback: (e: IDrawEvent) => void, type: string, param?: IDrawPoint | IDrawLine | IDrawPolygon) {
    // 绘制计次
    let drawNum = 0;
    if (!useEarth().useGlobalEvent().hasGlobalMouseRightClickEvent()) {
      useEarth().useGlobalEvent().enableGlobalMouseRightClickEvent();
    }
    // 开始绘制回调函数
    this.draw?.on('drawstart', (event: DrawEvent) => {
      const coordinate = this.map.getCoordinateFromPixel(event.target.downPx_);
      callback.call(this, {
        type: DrawType.Drawstart,
        eventPosition: toLonLat(coordinate)
      });
      // 绘制中移动回调函数
      useEarth().useGlobalEvent().enableGlobalMouseMoveEvent();
      useEarth()
        .useGlobalEvent()
        .addMouseMoveEventByGlobal((event) => {
          callback.call(this, {
            type: DrawType.Drawing,
            eventPosition: event.position
          });
        });
      // 绘制中点击回调函数
      useEarth().useGlobalEvent().enableGlobalMouseLeftDownEvent();
      useEarth()
        .useGlobalEvent()
        .addMouseLeftDownEventByGlobal((event) => {
          callback.call(this, {
            type: DrawType.DrawingClick,
            eventPosition: event.position
          });
        });
    });
    // 绘制完成回调函数
    this.draw?.on('drawend', (event: DrawEvent) => {
      if (useEarth().useGlobalEvent().hasGlobalMouseMoveEvent()) {
        useEarth().useGlobalEvent().disableGlobalMouseMoveEvent();
      }
      if (useEarth().useGlobalEvent().hasGlobalMouseLeftDownEvent()) {
        useEarth().useGlobalEvent().disableGlobalMouseLeftDownEvent();
      }
      let geometry;
      const coordinate = this.map.getCoordinateFromPixel(event.target.downPx_);
      let featurePosition;
      const response: IDrawEvent = {
        type: DrawType.Drawend,
        eventPosition: toLonLat(coordinate)
      };
      if (type == 'LineString') {
        geometry = <LineString>event.feature.getGeometry();
        featurePosition = [];
        for (const item of geometry.getCoordinates()) {
          featurePosition.push(toLonLat(item));
        }
      } else if (type == 'Point') {
        geometry = <Point>event.feature.getGeometry();
        featurePosition = toLonLat(geometry.getCoordinates());
      } else if (type == 'Polygon') {
        geometry = <Polygon>event.feature.getGeometry();
        featurePosition = [];
        for (const item of geometry.getCoordinates()[0]) {
          featurePosition.push(toLonLat(item));
        }
      }
      // ==== 新增：将结果写入对应基础图层 ====
      const geometryType = type;
      const baseLayer = this.getBaseLayer(geometryType === 'Circle' ? 'Circle' : (geometryType as 'Point' | 'LineString' | 'Polygon'));
      try {
        if (geometryType === 'LineString' && featurePosition && featurePosition.length > 1 && baseLayer instanceof PolylineLayer) {
          const lineParam = param as IDrawLine;
          const geom = event.feature.getGeometry() as LineString;
          const coords = geom.getCoordinates();
          const f = baseLayer.add({
            positions: coords,
            stroke: { color: lineParam?.strokeColor || '#ffcc33', width: lineParam?.strokeWidth || 2 }
          });
          f.set('dynamicDraw', true);
          response.feature = f;
          response.featurePosition = featurePosition;
          callback.call(this, response);
        } else if (geometryType === 'Polygon') {
          if (featurePosition && featurePosition.length > 3 && baseLayer instanceof PolygonLayer) {
            const geom = event.feature.getGeometry() as Polygon;
            const coords = geom.getCoordinates();
            const polygonParam = param as IDrawPolygon;
            const f = baseLayer.add({
              positions: coords,
              stroke: { color: polygonParam?.strokeColor || '#ffcc33', width: polygonParam?.strokeWidth || 2 },
              fill: { color: polygonParam?.fillColor || 'rgba(255,255,255,0.2)' }
            });
            f.set('dynamicDraw', true);
            response.feature = f;
            response.featurePosition = featurePosition;
            callback.call(this, response);
          }
        } else if (geometryType === 'Point' && featurePosition && baseLayer instanceof PointLayer) {
          drawNum++;
          const pointParam = param as IDrawPoint & { strokeColor?: string; strokeWidth?: number; fillColor?: string };
          const geom = event.feature.getGeometry() as Point;
          const coord = geom.getCoordinates();
          const f = baseLayer.add({
            center: coord,
            size: pointParam?.size || 2,
            fill: { color: pointParam?.fillColor || '#ffcc33' },
            stroke: pointParam?.strokeColor ? { color: pointParam.strokeColor, width: pointParam.strokeWidth } : undefined
          });
          f.set('dynamicDraw', true);
          response.feature = f;
          response.featurePosition = featurePosition;
          callback.call(this, response);
          if (this.draw && pointParam.limit) {
            if (drawNum == pointParam.limit) {
              this.exitDraw({ position: toLonLat(coordinate) }, callback);
            }
          }
        } else if (geometryType === 'Circle' && baseLayer instanceof CircleLayer) {
          const circleGeom = event.feature.getGeometry() as CircleGeom;
          const center = circleGeom.getCenter();
          const radius = circleGeom.getRadius();
          const circleParam = (param as { strokeColor?: string; strokeWidth?: number; fillColor?: string }) || {};
          const f = baseLayer.add({
            center,
            radius,
            stroke: { color: circleParam.strokeColor || '#ffcc33', width: circleParam.strokeWidth || 2 },
            fill: { color: circleParam.fillColor || 'rgba(255,255,255,0.2)' }
          });
          f.set('dynamicDraw', true);
          response.feature = f;
          response.featurePosition = toLonLat(center);
          callback.call(this, response);
        }
      } finally {
        // 无论是否成功添加，都移除临时要素
        setTimeout(() => {
          this.tempSource.removeFeature(event.feature);
        }, 0);
        if (param?.keepGraphics === false && response.feature) {
          // 如果用户要求不保留结果，则从基础图层移除
          try {
            const feat = response.feature as Feature<Geometry>;
            const l = useEarth().getLayerAtFeature(feat) as VectorLayer<VectorSource<Geometry>> | undefined;
            l?.getSource()?.removeFeature(feat);
          } catch {
            /* ignore */
          }
        }
      }
    });
    // 退出绘制回调函数
    useEarth()
      .useGlobalEvent()
      .addMouseRightClickEventByGlobal((event) => {
        this.exitDraw(event, param?.callback);
      });
  }
  /**
   * 处理箭头编辑
   */
  private handleArrowEdit(param: IEditParam) {
    const isShowUnderlay = param.isShowUnderlay === undefined ? true : param.isShowUnderlay;
    const layer = useEarth().getLayer(param.feature.get('layerId')) as Base;
    if (!isShowUnderlay) {
      layer.hide(param.feature.getId() as string);
    }
    const p = new PlotEdit();
    p.init({ feature: param.feature });
    p.on('modifyStart', (e) => {
      // 回调：绘制开始
      param.callback?.call(this, { type: ModifyType.Modifying, plotParam: e });
    });
    p.on('modifying', (e) => {
      // 回调：绘制移动
      param.callback?.call(this, { type: ModifyType.Modifying, plotParam: e });
    });
    p.on('modifyEnd', (e) => {
      // 回调：绘制移动结束
      param.callback?.call(this, { type: ModifyType.Modifying, plotParam: e });
    });
    p.on('modifyExit', (e) => {
      // 回调：退出绘制
      p.destroy();
      (param.feature.getGeometry() as Polygon).setCoordinates(e.coords);
      const fParam = param.feature.get('param');
      fParam.plotPoints = e.points;
      param.feature.set('param', fParam);
      if (!isShowUnderlay) {
        layer.show(param.feature.getId() as string);
      }
      param.callback?.call(this, { type: ModifyType.Modifyexit, plotParam: e });
    });
  }
  /**
   * 动态绘制线
   * @param param 详见{@link IDrawLine}
   */
  drawLine(param?: IDrawLine) {
    // 初始化绘制工具
    this.initDraw('LineString', param);
  }
  /**
   * 动态绘制点
   * @param param 详见{@link IDrawPoint}
   */
  drawPoint(param?: IDrawPoint) {
    // 初始化绘制工具
    this.initDraw('Point', param);
  }
  /**
   * 动态绘制面
   * @param param 详见{@link IDrawPolygon}
   */
  drawPolygon(param?: IDrawPolygon) {
    // 初始化绘制工具
    this.initDraw('Polygon', param);
  }
  /** 动态绘制圆 */
  drawCircle(param?: { strokeColor?: string; strokeWidth?: number; fillColor?: string; callback?: (e: IDrawEvent) => void }) {
    this.initDraw('Circle', param);
  }
  /**
   * 动态绘制进攻箭头
   */
  drawwAttackArrow(param?: IDrawPolygon) {
    // 初始化绘制工具
    const plot = new PlotDraw();
    plot.init(EPlotType.AttackArrow);
    plot.on<IPlotAttackArrow>('start', (e) => {
      // 回调：绘制开始
      param?.callback?.call(this, {
        type: DrawType.Drawstart,
        eventPosition: toLonLat(e.point)
      });
    });
    plot.on<IPlotAttackArrow>('add-point', (e) => {
      // 回调：绘制中点击（新增控制点）
      param?.callback?.call(this, {
        type: DrawType.DrawingClick,
        eventPosition: toLonLat(e.point)
      });
    });
    plot.on<IPlotAttackArrow>('moving', (e) => {
      // 回调：绘制移动（实时移动位置，优先使用临时点）
      param?.callback?.call(this, {
        type: DrawType.Drawing,
        eventPosition: toLonLat(e.tempPoint || e.point)
      });
    });
    plot.on<IPlotAttackArrow>('end', (e) => {
      if (e.points && e.points.length > 2) {
        const response: IDrawEvent = {
          type: DrawType.Drawend,
          eventPosition: toLonLat(e.points[e.points.length - 1])
        };
        if (param?.keepGraphics === true) {
          const geom = new AttackArrow([], e.points, {});
          const baseLayer = this.getBaseLayer('Polygon') as PolygonLayer | undefined;
          const coords = geom.getCoordinates();
          const f = baseLayer?.add({
            positions: coords,
            stroke: { color: param?.strokeColor || '#ffcc33', width: param?.strokeWidth || 2 },
            fill: { color: param?.fillColor || 'rgba(255,255,255,0.2)' }
          });
          const attackArrowParam = {
            positions: coords,
            plotType: EPlotType.AttackArrow,
            plotPoints: e.points
          };
          f?.set('param', attackArrowParam);
          response.feature = f;
        }
        const featurePosition = [];
        for (const item of e.coordinates![0]) {
          featurePosition.push(toLonLat(item));
        }
        response.featurePosition = featurePosition;
        response.ctlPoints = e.points;
        param?.callback?.call(this, response);
      }
      plot.destroy();
    });
  }
  /**(
   * 动态绘制进攻箭头(燕尾)
   */
  drawwTailedAttackArrow(param?: IDrawPolygon) {
    // 初始化绘制工具
    const plot = new PlotDraw();
    plot.init(EPlotType.TailedAttackArrow);
    plot.on<IPlotAttackArrow>('start', (e) => {
      // 回调：绘制开始
      param?.callback?.call(this, {
        type: DrawType.Drawstart,
        eventPosition: toLonLat(e.point)
      });
    });
    plot.on<IPlotAttackArrow>('add-point', (e) => {
      // 回调：绘制中点击（新增控制点）
      param?.callback?.call(this, {
        type: DrawType.DrawingClick,
        eventPosition: toLonLat(e.point)
      });
    });
    plot.on<IPlotAttackArrow>('moving', (e) => {
      // 回调：绘制移动（实时移动位置，优先使用临时点）
      param?.callback?.call(this, {
        type: DrawType.Drawing,
        eventPosition: toLonLat(e.tempPoint || e.point)
      });
    });
    plot.on<IPlotAttackArrow>('end', (e) => {
      if (e.points && e.points.length > 2) {
        const baseLayer = this.getBaseLayer('Polygon') as PolygonLayer | undefined;
        const geom = new TailedAttackArrow([], e.points, {});
        const coords = geom.getCoordinates();
        const f = baseLayer?.add({
          positions: coords,
          stroke: { color: param?.strokeColor || '#ffcc33', width: param?.strokeWidth || 2 },
          fill: { color: param?.fillColor || 'rgba(255,255,255,0.2)' }
        });
        const tailedattackArrowParam = {
          positions: coords,
          plotType: EPlotType.TailedAttackArrow,
          plotPoints: e.points
        };
        f?.set('param', tailedattackArrowParam);
        const response: IDrawEvent = {
          type: DrawType.Drawend,
          eventPosition: toLonLat(e.points[e.points.length - 1])
        };
        const featurePosition = [];
        for (const item of e.coordinates![0]) {
          featurePosition.push(toLonLat(item));
        }
        response.feature = f;
        response.featurePosition = featurePosition;
        param?.callback?.call(this, response);
      }
      plot.destroy();
    });
  }
  /**(
   * 动态绘制单箭头(2控制点)
   */
  drawwFineArrow(param?: IDrawPolygon) {
    // 初始化绘制工具
    const plot = new PlotDraw();
    plot.init(EPlotType.FineArrow);
    plot.on<IPlotAttackArrow>('start', (e) => {
      // 回调：绘制开始
      param?.callback?.call(this, {
        type: DrawType.Drawstart,
        eventPosition: toLonLat(e.point)
      });
    });
    plot.on<IPlotAttackArrow>('add-point', (e) => {
      // 回调：绘制中点击（新增控制点）
      param?.callback?.call(this, {
        type: DrawType.DrawingClick,
        eventPosition: toLonLat(e.point)
      });
    });
    plot.on<IPlotAttackArrow>('moving', (e) => {
      // 回调：绘制移动（实时移动位置，优先使用临时点）
      param?.callback?.call(this, {
        type: DrawType.Drawing,
        eventPosition: toLonLat(e.tempPoint || e.point)
      });
    });
    plot.on<IPlotAttackArrow>('end', (e) => {
      if (e.points && e.points.length == 2) {
        const baseLayer = this.getBaseLayer('Polygon') as PolygonLayer | undefined;
        const geom = new FineArrow([], e.points, {});
        const coords = geom.getCoordinates();
        const f = baseLayer?.add({
          positions: coords,
          stroke: { color: param?.strokeColor || '#ffcc33', width: param?.strokeWidth || 2 },
          fill: { color: param?.fillColor || 'rgba(255,255,255,0.2)' }
        });
        const fineArrowParam = {
          positions: coords,
          plotType: EPlotType.FineArrow,
          plotPoints: e.points
        };
        f?.set('param', fineArrowParam);
        const response: IDrawEvent = {
          type: DrawType.Drawend,
          eventPosition: toLonLat(e.points[e.points.length - 1])
        };
        const featurePosition = [];
        for (const item of e.coordinates![0]) {
          featurePosition.push(toLonLat(item));
        }
        response.feature = f;
        response.featurePosition = featurePosition;
        param?.callback?.call(this, response);
      }
      plot.destroy();
    });
  }
  /**(
   * 动态绘制单箭头(燕尾-2控制点)
   */
  drawwTailedSquadCombatArrow(param?: IDrawPolygon) {
    // 初始化绘制工具
    const plot = new PlotDraw();
    plot.init(EPlotType.TailedSquadCombatArrow);
    plot.on<IPlotAttackArrow>('start', (e) => {
      // 回调：绘制开始
      param?.callback?.call(this, {
        type: DrawType.Drawstart,
        eventPosition: toLonLat(e.point)
      });
    });
    plot.on<IPlotAttackArrow>('add-point', (e) => {
      // 回调：绘制中点击（新增控制点）
      param?.callback?.call(this, {
        type: DrawType.DrawingClick,
        eventPosition: toLonLat(e.point)
      });
    });
    plot.on<IPlotAttackArrow>('moving', (e) => {
      // 回调：绘制移动（实时移动位置，优先使用临时点）
      param?.callback?.call(this, {
        type: DrawType.Drawing,
        eventPosition: toLonLat(e.tempPoint || e.point)
      });
    });
    plot.on<IPlotAttackArrow>('end', (e) => {
      if (e.points && e.points.length == 2) {
        const baseLayer = this.getBaseLayer('Polygon') as PolygonLayer | undefined;
        const geom = new TailedSquadCombat([], e.points, {});
        const coords = geom.getCoordinates();
        const f = baseLayer?.add({
          positions: coords,
          stroke: { color: param?.strokeColor || '#ffcc33', width: param?.strokeWidth || 2 },
          fill: { color: param?.fillColor || 'rgba(255,255,255,0.2)' }
        });
        const tailedSquadCombatParam = {
          positions: coords,
          plotType: EPlotType.TailedSquadCombatArrow,
          plotPoints: e.points
        };
        f?.set('param', tailedSquadCombatParam);
        const response: IDrawEvent = {
          type: DrawType.Drawend,
          eventPosition: toLonLat(e.points[e.points.length - 1])
        };
        const featurePosition = [];
        for (const item of e.coordinates![0]) {
          featurePosition.push(toLonLat(item));
        }
        response.feature = f;
        response.featurePosition = featurePosition;
        param?.callback?.call(this, response);
      }
      plot.destroy();
    });
  }
  /**(
   * 动态绘制单直箭头(平尾-2控制点)
   */
  drawwAssaultDirectionArrow(param?: IDrawPolygon) {
    // 初始化绘制工具
    const plot = new PlotDraw();
    plot.init(EPlotType.AssaultDirectionArrow);
    plot.on<IPlotAttackArrow>('start', (e) => {
      // 回调：绘制开始
      param?.callback?.call(this, {
        type: DrawType.Drawstart,
        eventPosition: toLonLat(e.point)
      });
    });
    plot.on<IPlotAttackArrow>('add-point', (e) => {
      // 回调：绘制中点击（新增控制点）
      param?.callback?.call(this, {
        type: DrawType.DrawingClick,
        eventPosition: toLonLat(e.point)
      });
    });
    plot.on<IPlotAttackArrow>('moving', (e) => {
      // 回调：绘制移动（实时移动位置，优先使用临时点）
      param?.callback?.call(this, {
        type: DrawType.Drawing,
        eventPosition: toLonLat(e.tempPoint || e.point)
      });
    });
    plot.on<IPlotAttackArrow>('end', (e) => {
      if (e.points && e.points.length == 2) {
        const baseLayer = this.getBaseLayer('Polygon') as PolygonLayer | undefined;
        const geom = new AssaultDirectionArrow([], e.points, {});
        const coords = geom.getCoordinates();
        const f = baseLayer?.add({
          positions: coords,
          stroke: { color: param?.strokeColor || '#ffcc33', width: param?.strokeWidth || 2 },
          fill: { color: param?.fillColor || 'rgba(255,255,255,0.2)' }
        });
        const assaultDirectionArrowParam = {
          positions: coords,
          plotType: EPlotType.AssaultDirectionArrow,
          plotPoints: e.points
        };
        f?.set('param', assaultDirectionArrowParam);
        const response: IDrawEvent = {
          type: DrawType.Drawend,
          eventPosition: toLonLat(e.points[e.points.length - 1])
        };
        const featurePosition = [];
        for (const item of e.coordinates![0]) {
          featurePosition.push(toLonLat(item));
        }
        response.feature = f;
        response.featurePosition = featurePosition;
        param?.callback?.call(this, response);
      }
      plot.destroy();
    });
  }
  /**(
   * 动态绘制双箭头(平尾-4控制点)
   */
  drawwDoubleArrow(param?: IDrawPolygon) {
    // 初始化绘制工具
    const plot = new PlotDraw();
    plot.init(EPlotType.DoubleArrow);
    plot.on<IPlotAttackArrow>('start', (e) => {
      // 回调：绘制开始
      param?.callback?.call(this, {
        type: DrawType.Drawstart,
        eventPosition: toLonLat(e.point)
      });
    });
    plot.on<IPlotAttackArrow>('add-point', (e) => {
      // 回调：绘制中点击（新增控制点）
      param?.callback?.call(this, {
        type: DrawType.DrawingClick,
        eventPosition: toLonLat(e.point)
      });
    });
    plot.on<IPlotAttackArrow>('moving', (e) => {
      // 回调：绘制移动（实时移动位置，优先使用临时点）
      param?.callback?.call(this, {
        type: DrawType.Drawing,
        eventPosition: toLonLat(e.tempPoint || e.point)
      });
    });
    plot.on<IPlotAttackArrow>('end', (e) => {
      if (e.points && e.points.length == 5) {
        const baseLayer = this.getBaseLayer('Polygon') as PolygonLayer | undefined;
        const geom = new DoubleArrow([], e.points, {});
        const coords = geom.getCoordinates();
        const f = baseLayer?.add({
          positions: coords,
          stroke: { color: param?.strokeColor || '#ffcc33', width: param?.strokeWidth || 2 },
          fill: { color: param?.fillColor || 'rgba(255,255,255,0.2)' }
        });
        const doubleArrowParam = {
          positions: coords,
          plotType: EPlotType.DoubleArrow,
          plotPoints: e.points
        };
        f?.set('param', doubleArrowParam);
        const response: IDrawEvent = {
          type: DrawType.Drawend,
          eventPosition: toLonLat(e.points[e.points.length - 1])
        };
        const featurePosition = [];
        for (const item of e.coordinates![0]) {
          featurePosition.push(toLonLat(item));
        }
        response.feature = f;
        response.featurePosition = featurePosition;
        param?.callback?.call(this, response);
      }
      plot.destroy();
    });
  }
  /**
   * 动态编辑进攻箭头
   */
  editAttackArrow(param: IEditParam): void {
    this.handleArrowEdit(param);
  }
  /**
   * 动态编辑进攻箭头
   */
  editTailedAttackArrow(param: IEditParam): void {
    this.handleArrowEdit(param);
  }
  /**
   * 动态编辑单箭头(2控制点)
   */
  editFineArrow(param: IEditParam): void {
    this.handleArrowEdit(param);
  }
  /**
   * 动态编辑单箭头(燕尾-2控制点)
   */
  editTailedSquadCombatArrow(param: IEditParam): void {
    this.handleArrowEdit(param);
  }
  /**
   * 动态编辑单直箭头(平尾-2控制点)
   */
  editAssaultDirectionArrow(param: IEditParam): void {
    this.handleArrowEdit(param);
  }
  /**
   * 动态编辑双箭头(平尾-4控制点)
   */
  editDoubleArrow(param: IEditParam): void {
    this.handleArrowEdit(param);
  }
  /**
   * 动态修改面
   * @param param 参数，详见{@link IEditParam}
   */
  editPolygon(param: IEditParam): void {
    this.initHelpTooltip('单击修改面，alt+单击删除点，右击退出编辑');
    // 开始新的编辑会话，清空历史并移除旧监听
    this.undoStack = [];
    this.redoStack = [];
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    // 1. 创建编辑临时图层（关闭 wrapX 避免多世界复制下命中异常）
    const polygonLayer = new PolygonLayer(useEarth(), { wrapX: false });
    const pointLayer = new PointLayer(useEarth(), { wrapX: false });
    // 2. 原始图层与要素
    const layer = <VectorLayer<VectorSource<Geometry>>>useEarth().getLayerAtFeature(param.feature);
    if (!param.isShowUnderlay) layer?.getSource()?.removeFeature(param.feature);
    const geometry = <Polygon>param.feature.getGeometry();
    const originalPositions = <Coordinate[][]>geometry.getCoordinates();
    // 3. 记录原始 world 索引（首点）
    let baseWorldIndex: number | undefined;
    try {
      const g0 = originalPositions?.[0]?.[0];
      if (g0) {
        const projExtent = this.map.getView().getProjection().getExtent?.();
        if (projExtent) {
          const ww = projExtent[2] - projExtent[0];
          baseWorldIndex = Math.floor(g0[0] / ww);
        }
      }
    } catch {
      /* ignore */
    }
    const ensureClosed = (ring: Coordinate[]): Coordinate[] => {
      if (ring.length > 2) {
        const h = ring[0];
        const t = ring[ring.length - 1];
        if (h[0] !== t[0] || h[1] !== t[1]) return [...ring, [h[0], h[1]] as Coordinate];
      }
      return ring;
    };
    // 4. 复制一份用于编辑的坐标（规范化至当前视图 world copy）
    let editRing = Utils.normalizeToViewWorld(originalPositions[0]);
    // 5. 创建控制点
    for (const p of editRing) {
      pointLayer.add({
        center: p,
        stroke: { color: '#fff' },
        fill: { color: '#00aaff' }
      });
    }
    // 6. 创建临时多边形要素
    const polygon = polygonLayer.add({
      positions: [editRing],
      stroke: { color: '#00aaff', width: 2 },
      fill: { color: '#ffffff61' }
    });
    const modify = new Modify({ source: <VectorSource<Geometry>>polygonLayer.getLayer().getSource() });
    modify.set('dynamicDraw', true);
    let beforeRing: Coordinate[] | null = null;
    const cloneRing = (ring: Coordinate[]) => ring.map((c) => [c[0], c[1]] as Coordinate);
    const refreshControlPoints = (ring: Coordinate[]) => {
      pointLayer.remove();
      for (const p of ring) {
        pointLayer.add({ center: p, stroke: { color: '#fff' }, fill: { color: '#00aaff' } });
      }
    };
    // 捕获拖动开始前坐标
    modify.on('modifystart', () => {
      const ring = (<Coordinate[][]>polygon.getGeometry()?.getCoordinates())[0] || [];
      beforeRing = cloneRing(ring);
    });
    // 7. 编辑过程中回调（不改变原要素，只回调地理坐标）并记录历史
    modify.on('modifyend', () => {
      const ring = (<Coordinate[][]>polygon.getGeometry()?.getCoordinates())[0] || [];
      editRing = ensureClosed(ring);
      refreshControlPoints(editRing);
      // 推入历史（before -> after）
      if (beforeRing) {
        const afterRing = cloneRing(editRing);
        // 若前后不同再记录
        const changed = beforeRing.length !== afterRing.length || beforeRing.some((p, i) => p[0] !== afterRing[i][0] || p[1] !== afterRing[i][1]);
        if (changed) {
          this.undoStack.push({
            type: 'Polygon',
            before: beforeRing,
            after: afterRing,
            apply: (coords: Coordinate[]) => {
              polygon.getGeometry() && (<Polygon>polygon.getGeometry()).setCoordinates([coords]);
              editRing = coords;
              refreshControlPoints(editRing);
              const lonlatApply = editRing.map((c) => toLonLat(c));
              param.callback?.call(this, { type: ModifyType.Modifying, position: lonlatApply });
            }
          });
          this.redoStack.length = 0;
          this.updateUndoRedoTooltip();
        }
        beforeRing = null;
      }
      const lonlat = editRing.map((c) => toLonLat(c));
      param.callback?.call(this, { type: ModifyType.Modifying, position: lonlat });
    });
    this.map.addInteraction(modify);
    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
        if (this.undoStack.length) {
          e.preventDefault();
          const rec = this.undoStack.pop() as HistoryPolygonRecord;
          this.redoStack.push(rec);
          rec.apply(rec.before.map((c: Coordinate) => [c[0], c[1]] as Coordinate));
          this.updateUndoRedoTooltip();
        }
      } else if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) {
        if (this.redoStack.length) {
          e.preventDefault();
          const rec = this.redoStack.pop() as HistoryPolygonRecord;
          this.undoStack.push(rec);
          rec.apply(rec.after.map((c: Coordinate) => [c[0], c[1]] as Coordinate));
          this.updateUndoRedoTooltip();
        }
      }
    };
    window.addEventListener('keydown', this.keydownHandler);
    this.updateUndoRedoTooltip();
    // 8. 退出（右键）保存：将编辑 ring 映射回原始 world copy
    useEarth()
      .useGlobalEvent()
      .addMouseOnceRightClickEventByGlobal(() => {
        this.map.removeInteraction(modify);
        polygonLayer.destroy();
        pointLayer.destroy();
        // 清空历史 & 移除键盘监听
        this.undoStack = [];
        this.redoStack = [];
        if (this.keydownHandler) {
          window.removeEventListener('keydown', this.keydownHandler);
          this.keydownHandler = null;
        }
        this.updateUndoRedoTooltip();
        // 最新编辑 ring
        let ring = (<Coordinate[][]>polygon.getGeometry()?.getCoordinates())[0];
        ring = ensureClosed(ring);
        if (baseWorldIndex !== undefined && ring.length) {
          ring = Utils.restoreToWorldIndex(ring, baseWorldIndex);
          ring = ensureClosed(ring);
        }
        // 写回原几何 & 重新挂回原图层
        geometry.setCoordinates([ring]);
        layer?.getSource()?.addFeature(param.feature);
        if (this.overlayKey) {
          this.overlay.remove('draw_help_tooltip');
          unByKey(this.overlayKey);
          this.overlayKey = undefined;
        }
        // 生成回调坐标（去除可能的闭合重复点再 lonlat 化）
        const outputRing = (() => {
          if (ring.length > 1) {
            const h = ring[0];
            const t = ring[ring.length - 1];
            if (h[0] === t[0] && h[1] === t[1]) return ring.slice(0, ring.length - 1);
          }
          return ring;
        })();
        const lonlat = outputRing.map((c) => toLonLat(c));
        param.callback?.call(this, { type: ModifyType.Modifyexit, position: lonlat });
      });
  }
  /**
   * 动态修改线
   * @param param 参数，详见{@link IEditParam}
   */
  editPolyline(param: IEditParam): void {
    this.initHelpTooltip('单击修改线，alt+单击删除点，右击退出编辑');
    // 新会话清空历史
    this.undoStack = [];
    this.redoStack = [];
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    const polyline = new PolylineLayer(useEarth(), { wrapX: false });
    const point = new PointLayer(useEarth(), { wrapX: false });
    const layer = <VectorLayer<VectorSource<Geometry>>>useEarth().getLayerAtFeature(param.feature);
    if (!param.isShowUnderlay) {
      try {
        const oldParam = param.feature.get('param');
        if (oldParam?.isArrow) {
          const style = param.feature.getStyle();
          if (Array.isArray(style)) {
            const filtered = style.filter((s: Style) => s.getImage() == null);
            param.feature.setStyle(filtered);
          }
        }
      } catch {
        /* ignore */
      }
      layer?.getSource()?.removeFeature(param.feature);
    }
    const geometry = <LineString>param.feature.getGeometry();
    const original = <Coordinate[]>geometry.getCoordinates();
    let baseWorldIndex: number | undefined;
    try {
      if (original[0]) {
        const projExtent = this.map.getView().getProjection().getExtent?.();
        if (projExtent) {
          const ww = projExtent[2] - projExtent[0];
          baseWorldIndex = Math.floor(original[0][0] / ww);
        }
      }
    } catch {
      /* ignore */
    }
    let editCoords = Utils.normalizeToViewWorld(original);
    // 控制点
    for (const c of editCoords) {
      point.add({ center: c, stroke: { color: '#fff' }, fill: { color: '#00aaff' } });
    }
    const line = polyline.add({ positions: editCoords, stroke: { color: '#00aaff', width: 2 } });
    const modify = new Modify({ source: <VectorSource<Geometry>>polyline.getLayer().getSource() });
    modify.set('dynamicDraw', true);
    let beforeLine: Coordinate[] | null = null;
    const cloneLine = (arr: Coordinate[]) => arr.map((c) => [c[0], c[1]] as Coordinate);
    modify.on('modifystart', () => {
      beforeLine = cloneLine((<LineString>line.getGeometry()).getCoordinates());
    });
    modify.on('modifyend', () => {
      point.remove();
      editCoords = (<Coordinate[]>line.getGeometry()?.getCoordinates()).slice();
      for (const c of editCoords) {
        point.add({ center: c, stroke: { color: '#fff' }, fill: { color: '#00aaff' } });
      }
      if (beforeLine) {
        const afterLine = cloneLine(editCoords);
        const changed = beforeLine.length !== afterLine.length || beforeLine.some((p, i) => p[0] !== afterLine[i][0] || p[1] !== afterLine[i][1]);
        if (changed) {
          this.undoStack.push({
            type: 'LineString',
            before: beforeLine,
            after: afterLine,
            apply: (coords: Coordinate[]) => {
              line.getGeometry() && (<LineString>line.getGeometry()).setCoordinates(coords);
              editCoords = coords.slice();
              point.remove();
              for (const c2 of editCoords) point.add({ center: c2, stroke: { color: '#fff' }, fill: { color: '#00aaff' } });
              param.callback?.call(this, { type: ModifyType.Modifying, position: editCoords.map((p) => toLonLat(p)) });
            }
          });
          this.redoStack.length = 0;
          this.updateUndoRedoTooltip();
        }
        beforeLine = null;
      }
      param.callback?.call(this, { type: ModifyType.Modifying, position: editCoords.map((p) => toLonLat(p)) });
    });
    this.map.addInteraction(modify);
    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
        if (this.undoStack.length) {
          e.preventDefault();
          const rec = this.undoStack.pop() as HistoryLineRecord;
          this.redoStack.push(rec);
          rec.apply(rec.before.map((c: Coordinate) => [c[0], c[1]] as Coordinate));
          this.updateUndoRedoTooltip();
        }
      } else if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) {
        if (this.redoStack.length) {
          e.preventDefault();
          const rec = this.redoStack.pop() as HistoryLineRecord;
          this.undoStack.push(rec);
          rec.apply(rec.after.map((c: Coordinate) => [c[0], c[1]] as Coordinate));
          this.updateUndoRedoTooltip();
        }
      }
    };
    window.addEventListener('keydown', this.keydownHandler);
    this.updateUndoRedoTooltip();
    useEarth()
      .useGlobalEvent()
      .addMouseOnceRightClickEventByGlobal(() => {
        this.map.removeInteraction(modify);
        polyline.destroy();
        point.destroy();
        // 退出清空历史并移除监听
        this.undoStack = [];
        this.redoStack = [];
        if (this.keydownHandler) {
          window.removeEventListener('keydown', this.keydownHandler);
          this.keydownHandler = null;
        }
        this.updateUndoRedoTooltip();
        let finalCoords = (<Coordinate[]>line.getGeometry()?.getCoordinates()).slice();
        if (baseWorldIndex !== undefined && finalCoords.length) {
          finalCoords = Utils.restoreToWorldIndex(finalCoords, baseWorldIndex) as Coordinate[];
        }
        geometry.setCoordinates(finalCoords);
        layer?.getSource()?.addFeature(param.feature);
        // 箭头恢复（仅静态 style 情况）
        try {
          const oldParam = param.feature.get('param');
          const currentStyle = param.feature.getStyle();
          if (oldParam?.isArrow && typeof currentStyle !== 'function') {
            let baseStyles: Style[] = [];
            if (Array.isArray(currentStyle)) baseStyles = currentStyle.filter((s: Style) => s.getImage() == null);
            else if (currentStyle && (currentStyle as Style).getImage() == null) baseStyles = [currentStyle as Style];
            if (oldParam.arrowIsRepeat) {
              geometry.forEachSegment((start, end) => baseStyles.push(Utils.createStyle(start, end, oldParam.stroke?.color)));
            } else if (finalCoords.length >= 2) {
              baseStyles.push(Utils.createStyle(finalCoords[finalCoords.length - 2], finalCoords[finalCoords.length - 1], oldParam.stroke?.color));
            }
            param.feature.setStyle(baseStyles);
          }
        } catch {
          /* ignore */
        }
        if (this.overlayKey) {
          this.overlay.remove('draw_help_tooltip');
          unByKey(this.overlayKey);
          this.overlayKey = undefined;
        }
        param.callback?.call(this, { type: ModifyType.Modifyexit, position: finalCoords.map((p) => toLonLat(p)) });
      });
  }
  /**
   * 动态修改点
   * @param param 参数，详见{@link IEditParam}
   */
  editPoint(param: IEditParam): void {
    this.initHelpTooltip('单击修改点，右击退出编辑');
    // 新会话清空历史
    this.undoStack = [];
    this.redoStack = [];
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    const pointLayer = new PointLayer(useEarth(), { wrapX: false });
    const layer = <VectorLayer<VectorSource<Geometry>>>useEarth().getLayerAtFeature(param.feature);
    if (!param.isShowUnderlay) {
      layer?.getSource()?.removeFeature(param.feature);
      const listenerKey = param.feature.get('listenerKey');
      if (listenerKey) {
        unByKey(listenerKey);
        param.feature.set('listenerKey', null);
      }
    }
    const geometry = <Point>param.feature.getGeometry();
    const original = <Coordinate>geometry.getCoordinates();
    let baseWorldIndex: number | undefined;
    try {
      const projExtent = this.map.getView().getProjection().getExtent?.();
      if (projExtent) {
        const ww = projExtent[2] - projExtent[0];
        baseWorldIndex = Math.floor(original[0] / ww);
      }
    } catch {
      /* ignore */
    }
    let editPos = Utils.normalizeToViewWorld(original);
    const point = pointLayer.add({ center: editPos, stroke: { color: '#00aaff', width: 2 }, fill: { color: '#ffffff61' } });
    const modify = new Modify({ source: <VectorSource<Geometry>>pointLayer.getLayer().getSource() });
    let beforePos: Coordinate | null = null;
    modify.on('modifystart', () => {
      beforePos = (<Point>point.getGeometry()).getCoordinates().slice() as Coordinate;
    });
    modify.on('modifyend', () => {
      editPos = <Coordinate>point.getGeometry()?.getCoordinates();
      if (beforePos) {
        const afterPos = (<Point>point.getGeometry()).getCoordinates().slice() as Coordinate;
        const changed = beforePos[0] !== afterPos[0] || beforePos[1] !== afterPos[1];
        if (changed) {
          this.undoStack.push({
            type: 'Point',
            before: beforePos,
            after: afterPos,
            apply: (coord: Coordinate) => {
              point.getGeometry() && (<Point>point.getGeometry()).setCoordinates(coord.slice() as Coordinate);
              editPos = coord.slice() as Coordinate;
              param.callback?.call(this, { type: ModifyType.Modifying, position: toLonLat(editPos) });
            }
          });
          this.redoStack.length = 0;
          this.updateUndoRedoTooltip();
        }
        beforePos = null;
      }
      param.callback?.call(this, { type: ModifyType.Modifying, position: toLonLat(editPos) });
    });
    this.map.addInteraction(modify);
    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
        if (this.undoStack.length) {
          e.preventDefault();
          const rec = this.undoStack.pop() as HistoryPointRecord;
          this.redoStack.push(rec);
          rec.apply([rec.before[0], rec.before[1]] as Coordinate);
          this.updateUndoRedoTooltip();
        }
      } else if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) {
        if (this.redoStack.length) {
          e.preventDefault();
          const rec = this.redoStack.pop() as HistoryPointRecord;
          this.undoStack.push(rec);
          rec.apply([rec.after[0], rec.after[1]] as Coordinate);
          this.updateUndoRedoTooltip();
        }
      }
    };
    window.addEventListener('keydown', this.keydownHandler);
    this.updateUndoRedoTooltip();
    useEarth()
      .useGlobalEvent()
      .addMouseOnceRightClickEventByGlobal(() => {
        this.map.removeInteraction(modify);
        pointLayer.destroy();
        // 清空历史并移除监听
        this.undoStack = [];
        this.redoStack = [];
        if (this.keydownHandler) {
          window.removeEventListener('keydown', this.keydownHandler);
          this.keydownHandler = null;
        }
        this.updateUndoRedoTooltip();
        let finalPos = <Coordinate>point.getGeometry()?.getCoordinates();
        if (baseWorldIndex !== undefined) {
          finalPos = Utils.restoreToWorldIndex(finalPos, baseWorldIndex) as Coordinate;
        }
        geometry.setCoordinates(finalPos);
        const fParam = <IPointParam<unknown>>param.feature.get('param');
        if (fParam?.isFlash) {
          fParam.center = toLonLat(finalPos);
          param.feature.set('param', fParam);
          new Utils().flash(param.feature, fParam, layer);
        }
        layer?.getSource()?.addFeature(param.feature);
        if (this.overlayKey) {
          this.overlay.remove('draw_help_tooltip');
          unByKey(this.overlayKey);
          this.overlayKey = undefined;
        }
        param.callback?.call(this, { type: ModifyType.Modifyexit, position: toLonLat(finalPos) });
      });
  }
  /**
   * 获取所有绘制对象
   */
  get(): Feature<Geometry>[] | undefined;
  /**
   * 按创建类型获取对象
   * @param type 绘制类型 `Point` | `LineString` | `Polygon`
   */
  get(type: 'Point' | 'LineString' | 'Polygon'): Feature<Geometry>[] | undefined;
  get(type?: 'Point' | 'LineString' | 'Polygon'): Feature<Geometry>[] | undefined {
    // 新策略：汇总所有基础图层中由 DynamicDraw 创建的要素（带 dynamicDraw 标记）
    const collect = <T extends BaseLayerLike>(layer?: T, matchType?: string) => {
      if (!layer) return [] as Feature<Geometry>[];
      const feats = layer.getLayer().getSource()?.getFeatures() || [];
      return feats.filter((f) => f.get('dynamicDraw') && (!matchType || f.getGeometry()?.getType() === matchType));
    };
    type BaseLayerLike = { getLayer: () => VectorLayer<VectorSource<Geometry>> };
    if (type) {
      if (type === 'Point') return collect(this.pointLayer, 'Point');
      if (type === 'LineString') return collect(this.polylineLayer, 'LineString');
      if (type === 'Polygon') return collect(this.polygonLayer, 'Polygon');
      return [];
    }
    return [
      ...collect(this.pointLayer, 'Point'),
      ...collect(this.polylineLayer, 'LineString'),
      ...collect(this.polygonLayer, 'Polygon'),
      ...collect(this.circleLayer, 'Circle')
    ];
  }
  /**
   * 清空绘制图层
   */
  remove(): void;
  remove(feature: Feature<Geometry>): void;
  remove(feature?: Feature<Geometry>) {
    if (feature) {
      const type = feature.getGeometry()?.getType();
      const baseLayer = this.getBaseLayer(type === 'Circle' ? 'Circle' : (type as 'Point' | 'LineString' | 'Polygon'));
      baseLayer?.remove(feature.getId() as string);
    } else {
      if (this.overlayKey) {
        this.overlay.remove('draw_help_tooltip');
        unByKey(this.overlayKey);
        this.overlayKey = undefined;
      }
      // 仅清空临时绘制层，不移除基础图层结果
      this.tempSource.clear();
    }
  }
}
