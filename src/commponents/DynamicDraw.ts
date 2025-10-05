import { DrawType, IDrawEvent, IDrawLine, IDrawPoint, IDrawPolygon, IEditParam, IPointParam, ModifyType } from '../interface';
import { Feature, Map } from 'ol';
import { Geometry, LineString, Point, Polygon } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Earth from '../Earth';
import { Draw, Modify } from 'ol/interaction';
import { useEarth } from '../useEarth';
import { DrawEvent } from 'ol/interaction/Draw';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { OverlayLayer, PointLayer, PolygonLayer, PolylineLayer } from '../base';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import { Coordinate } from 'ol/coordinate';
import { Utils } from '../common';
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
  /**
   * 构造器
   * @param earth 地图实例
   */
  constructor(earth: Earth) {
    const source = new VectorSource();
    const layer = new VectorLayer({
      source: source
    });
    layer.set('layerType', 'dynamicDrawLayer');
    earth.addLayer(layer);
    this.map = earth.map;
    this.source = source;
    this.layer = layer;
    this.overlay = new OverlayLayer(useEarth());
  }
  /**
   * 提示牌初始化方法
   */
  private initHelpTooltip(str: string) {
    const div = document.createElement('div');
    div.innerHTML = "<div class='ol-tooltip'>" + str + '</div>';
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
  /**
   * 绘制工具初始化
   * @param type 绘制类型
   */
  private initDraw(
    type: 'Point' | 'LineString' | 'LinearRing' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon' | 'GeometryCollection' | 'Circle',
    param?: IDrawPoint | IDrawLine | IDrawPolygon
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
    this.draw = new Draw({
      source: this.source,
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
      if (type == 'LineString' && featurePosition && featurePosition?.length > 1) {
        response.featurePosition = featurePosition;
        response.feature = event.feature;
        const LineParam = <IDrawLine>param;
        event.feature.setStyle(
          new Style({
            stroke: new Stroke({
              color: LineParam?.strokeColor || '#ffcc33',
              width: LineParam?.strokeWidth || 2
            })
          })
        );
        callback.call(this, response);
      }
      if (type == 'Polygon') {
        if (featurePosition && featurePosition?.length > 3) {
          response.featurePosition = featurePosition;
          response.feature = event.feature;
          const polygonParam = <IDrawPolygon>param;
          event.feature.setStyle(
            new Style({
              stroke: new Stroke({
                color: polygonParam?.strokeColor || '#ffcc33',
                width: polygonParam?.strokeWidth || 2
              }),
              fill: new Fill({
                color: polygonParam?.fillColor || 'rgba(255, 255, 255, 0.2)'
              })
            })
          );
          callback.call(this, response);
        } else {
          setTimeout(() => {
            this.source.removeFeature(event.feature);
          }, 10);
        }
      }
      if (type == 'Point' && featurePosition) {
        drawNum++;
        response.featurePosition = featurePosition;
        response.feature = event.feature;
        const pointParam = <IDrawPoint>param;
        event.feature.setStyle(
          new Style({
            image: new Circle({
              radius: pointParam.size || 2,
              fill: new Fill({
                color: pointParam.fillColor || '#ffcc33'
              })
            })
          })
        );
        callback.call(this, response);
        if (this.draw && pointParam.limit) {
          if (drawNum == pointParam.limit) {
            this.exitDraw({ position: toLonLat(coordinate) }, callback);
          }
        }
      }
      if (param?.keepGraphics === false) {
        setTimeout(() => {
          this.source.removeFeature(event.feature);
        }, 10);
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
  /**
   * 动态修改面
   * @param param 参数，详见{@link IEditParam}
   */
  editPolygon(param: IEditParam): void {
    this.initHelpTooltip('单击修改面 alt+单击删除点 右击退出编辑');
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
    // 7. 编辑过程中回调（不改变原要素，只回调地理坐标）
    modify.on('modifyend', () => {
      pointLayer.remove();
      const ring = (<Coordinate[][]>polygon.getGeometry()?.getCoordinates())[0];
      editRing = ensureClosed(ring);
      for (const p of editRing) {
        pointLayer.add({
          center: p,
          stroke: { color: '#fff' },
          fill: { color: '#00aaff' }
        });
      }
      const lonlat = editRing.map((c) => toLonLat(c));
      param.callback?.call(this, { type: ModifyType.Modifying, position: lonlat });
    });
    this.map.addInteraction(modify);
    // 8. 退出（右键）保存：将编辑 ring 映射回原始 world copy
    useEarth()
      .useGlobalEvent()
      .addMouseOnceRightClickEventByGlobal(() => {
        this.map.removeInteraction(modify);
        polygonLayer.destroy();
        pointLayer.destroy();
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
    this.initHelpTooltip('单击修改线 alt+单击删除点 右击退出编辑');
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
    modify.on('modifyend', () => {
      point.remove();
      editCoords = (<Coordinate[]>line.getGeometry()?.getCoordinates()).slice();
      for (const c of editCoords) {
        point.add({ center: c, stroke: { color: '#fff' }, fill: { color: '#00aaff' } });
      }
      param.callback?.call(this, { type: ModifyType.Modifying, position: editCoords.map((p) => toLonLat(p)) });
    });
    this.map.addInteraction(modify);
    useEarth()
      .useGlobalEvent()
      .addMouseOnceRightClickEventByGlobal(() => {
        this.map.removeInteraction(modify);
        polyline.destroy();
        point.destroy();
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
    this.initHelpTooltip('单击修改点 右击退出编辑');
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
    modify.on('modifyend', () => {
      editPos = <Coordinate>point.getGeometry()?.getCoordinates();
      param.callback?.call(this, { type: ModifyType.Modifying, position: toLonLat(editPos) });
    });
    this.map.addInteraction(modify);
    useEarth()
      .useGlobalEvent()
      .addMouseOnceRightClickEventByGlobal(() => {
        this.map.removeInteraction(modify);
        pointLayer.destroy();
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
    if (type) {
      const features = this.layer.getSource()?.getFeatures();
      const arr: Feature<Geometry>[] = [];
      if (features) {
        for (const item of features) {
          if (type == item.getGeometryName()) arr.push(item);
        }
      }
      return arr;
    } else {
      return this.layer.getSource()?.getFeatures();
    }
  }
  /**
   * 清空绘制图层
   */
  remove() {
    this.layer.getSource()?.clear();
  }
}
