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
import { Circle, Fill, Icon, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { OverlayLayer, PointLayer, PolygonLayer, PolylineLayer } from '../base';
import { unByKey } from 'ol/Observable';
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
  private overlayKey: any;
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
      finishCondition: (e) => {
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
      let coordinate = this.map.getCoordinateFromPixel(event.target.downPx_);
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
    // 生成图层
    const polygonLayer = new PolygonLayer(useEarth());
    const pointLayer = new PointLayer(useEarth());
    // 删除原有面
    const layer = <VectorLayer<VectorSource<Geometry>>>useEarth().getLayerAtFeature(param.feature);
    if (!param.isShowUnderlay) {
      layer?.getSource()?.removeFeature(param.feature);
    }
    // 获取原有面坐标信息
    const geometry = <Polygon>param.feature.getGeometry();
    const position = <Coordinate[][]>geometry?.getCoordinates();
    for (const item of position[0]) {
      pointLayer.add({
        center: item,
        stroke: {
          color: '#fff'
        },
        fill: {
          color: '#00aaff'
        }
      });
    }
    // 生成编辑面
    const polygon = polygonLayer.add({
      positions: position,
      stroke: {
        color: '#00aaff',
        width: 2
      },
      fill: {
        color: '#ffffff61'
      }
    });
    const source = <VectorSource<Geometry>>polygonLayer.getLayer().getSource();
    const modify = new Modify({
      source: source
    });
    modify.on('modifyend', (evt) => {
      pointLayer.remove();
      const position = <Coordinate[][]>polygon.getGeometry()?.getCoordinates();
      for (const item of position[0]) {
        pointLayer.add({
          center: item,
          stroke: {
            color: '#fff'
          },
          fill: {
            color: '#00aaff'
          }
        });
      }
      const transformP = position[0].map((item) => {
        return (item = toLonLat(item));
      });
      param.callback?.call(this, {
        type: ModifyType.Modifying,
        position: transformP
      });
    });
    this.map.addInteraction(modify);
    useEarth()
      .useGlobalEvent()
      .addMouseOnceRightClickEventByGlobal((e) => {
        this.map.removeInteraction(modify);
        polygonLayer.destroy();
        pointLayer.destroy();
        const position = <Coordinate[][]>polygon.getGeometry()?.getCoordinates();
        const transformP = position[0].map((item) => {
          return (item = toLonLat(item));
        });
        geometry?.setCoordinates(position);
        // layer?.getSource()?.addFeature(param.feature);
        if (this.overlayKey) {
          this.overlay.remove('draw_help_tooltip');
          unByKey(this.overlayKey);
          this.overlayKey = undefined;
        }
        param.callback?.call(this, {
          type: ModifyType.Modifyexit,
          position: transformP
        });
      });
  }
  /**
   * 动态修改线
   * @param param 参数，详见{@link IEditParam}
   */
  editPolyline(param: IEditParam): void {
    this.initHelpTooltip('单击修改线 alt+单击删除点 右击退出编辑');
    // 创建编辑图层
    const polyline = new PolylineLayer(useEarth());
    const point = new PointLayer(useEarth());
    // 删除原有面
    const layer = <VectorLayer<VectorSource<Geometry>>>useEarth().getLayerAtFeature(param.feature);
    if (!param.isShowUnderlay) {
      layer?.getSource()?.removeFeature(param.feature);
    }
    // 获取原有面坐标信息
    const geometry = <LineString>param.feature.getGeometry();
    const position = <Coordinate[]>geometry?.getCoordinates();
    // 生成控制点
    for (const item of position) {
      point.add({
        center: item,
        stroke: {
          color: '#fff'
        },
        fill: {
          color: '#00aaff'
        }
      });
    }
    // 生成编辑面
    const line = polyline.add({
      positions: position,
      stroke: {
        color: '#00aaff',
        width: 2
      }
    });
    const source = <VectorSource<Geometry>>polyline.getLayer().getSource();
    const modify = new Modify({
      source: source
    });
    modify.on('modifyend', (evt) => {
      point.remove();
      const position = <Coordinate[]>line.getGeometry()?.getCoordinates();
      for (const item of position) {
        point.add({
          center: item,
          stroke: {
            color: '#fff'
          },
          fill: {
            color: '#00aaff'
          }
        });
      }
      const transformP = position.map((item) => {
        return (item = toLonLat(item));
      });
      param.callback?.call(this, {
        type: ModifyType.Modifying,
        position: transformP
      });
    });
    this.map.addInteraction(modify);
    useEarth()
      .useGlobalEvent()
      .addMouseOnceRightClickEventByGlobal((e) => {
        this.map.removeInteraction(modify);
        const position = <Coordinate[]>line.getGeometry()?.getCoordinates();
        const oldParam = param.feature.get('param');
        const styles = <Style[]>param.feature.getStyle();
        if (oldParam.isArrow) {
          // 删除原有箭头
          const newStyles = styles.filter((item) => {
            if (item.getImage() == null) {
              return item;
            }
          });
          if (oldParam.arrowIsRepeat) {
            line.getGeometry()?.forEachSegment((start, end) => {
              newStyles.push(Utils.createStyle(start, end, oldParam.stroke?.color));
            });
          } else {
            const start = position[position.length - 2];
            const end = position[position.length - 1];
            newStyles.push(Utils.createStyle(start, end, oldParam.stroke?.color));
          }
          param.feature.setStyle(newStyles);
        }
        layer?.getSource()?.addFeature(param.feature);
        polyline.destroy();
        point.destroy();
        const transformP = position.map((item) => {
          return (item = toLonLat(item));
        });
        geometry?.setCoordinates(position);
        layer?.getSource()?.addFeature(param.feature);
        if (this.overlayKey) {
          this.overlay.remove('draw_help_tooltip');
          unByKey(this.overlayKey);
          this.overlayKey = undefined;
        }
        param.callback?.call(this, {
          type: ModifyType.Modifyexit,
          position: transformP
        });
      });
  }
  /**
   * 动态修改点
   * @param param 参数，详见{@link IEditParam}
   */
  editPoint(param: IEditParam): void {
    this.initHelpTooltip('单击修改点 右击退出编辑');
    // 生成图层
    const pointLayer = new PointLayer(useEarth());
    // 删除原有面
    const layer = <VectorLayer<VectorSource<Geometry>>>useEarth().getLayerAtFeature(param.feature);
    if (!param.isShowUnderlay) {
      layer?.getSource()?.removeFeature(param.feature);
      let listenerKey = param.feature.get('listenerKey');
      if (listenerKey) {
        unByKey(listenerKey);
        param.feature.set('listenerKey', null);
      }
    }
    // 获取原有面坐标信息
    const geometry = <Point>param.feature.getGeometry();
    const position = <Coordinate>geometry.getCoordinates();
    // 生成编辑点
    const point = pointLayer.add({
      center: position,
      stroke: {
        color: '#00aaff',
        width: 2
      },
      fill: {
        color: '#ffffff61'
      }
    });
    const source = <VectorSource<Geometry>>pointLayer.getLayer().getSource();
    const modify = new Modify({
      source: source
    });
    modify.on('modifyend', (evt) => {
      const position = <Coordinate>point.getGeometry()?.getCoordinates();
      param.callback?.call(this, {
        type: ModifyType.Modifying,
        position: toLonLat(position)
      });
    });
    this.map.addInteraction(modify);
    useEarth()
      .useGlobalEvent()
      .addMouseOnceRightClickEventByGlobal((e) => {
        this.map.removeInteraction(modify);
        pointLayer.destroy();
        const position = <Coordinate>point.getGeometry()?.getCoordinates();
        const fParam = <IPointParam<unknown>>param.feature.get('param');
        geometry?.setCoordinates(position);
        if (fParam.isFlash) {
          fParam.center = toLonLat(position);
          param.feature.set('param', fParam);
          new Utils().flash(param.feature, fParam, layer);
        }
        layer?.getSource()?.addFeature(param.feature);
        if (this.overlayKey) {
          this.overlay.remove('draw_help_tooltip');
          unByKey(this.overlayKey);
          this.overlayKey = undefined;
        }
        param.callback?.call(this, {
          type: ModifyType.Modifyexit,
          position: toLonLat(position)
        });
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
