import { DrawType, IDrawEvent, IDrawLine, IDrawPoint, IDrawPolygon } from "../interface";
import { Map, MapBrowserEvent } from "ol";
import { Geometry, LineString, Point, Polygon } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Earth from "../Earth";
import { Draw } from "ol/interaction";
import { useEarth } from "../useEarth";
import { DrawEvent } from "ol/interaction/Draw";
import { fromLonLat, toLonLat } from "ol/proj";
import { Fill, Stroke, Style, Text } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { OverlayLayer } from "../base";
import { unByKey } from "ol/Observable";
import { Coordinate } from "ol/coordinate";
import { feature } from "@turf/turf";
/**
 * 动态绘制类
 */
export default class DynamicDraw {
  /**
   * map实例
   */
  private map: Map;
  /**
   * 图层实例
   */
  private source: VectorSource<Geometry>;
  /**
   * 绘制工具
   */
  private draw: Draw | undefined;
  layer: VectorLayer<VectorSource<Geometry>>;
  overlay: OverlayLayer<unknown>;
  overlayKey: any;
  /**
   * 构造器
   * @param earth 地图实例 
   */
  constructor(earth: Earth) {

    const source = new VectorSource();
    const layer = new VectorLayer({
      source: source,
      style: {
        'fill-color': 'rgba(255, 255, 255, 0.2)',
        'stroke-color': '#ffcc33',
        'stroke-width': 2,
        'circle-radius': 7,
        'circle-fill-color': '#ffcc33',
      },
    });
    earth.addLayer(layer);
    this.map = earth.map;
    this.source = source;
    this.layer = layer;
    this.overlay = new OverlayLayer(useEarth());
  }
  /**
   * 提示牌初始化方法
   */
  private initHelpTooltip() {
    const div = document.createElement("div");
    div.innerHTML = "<div class='ol-tooltip'>左击开始绘制，右击退出绘制</div>"
    document.body.appendChild(div);
    this.overlay.add({
      id: "overlay_1",
      position: fromLonLat([0, 0]),
      element: div,
      offset: [15, -11]
    })
    this.overlayKey = this.map.on("pointermove", (evt) => {
      this.overlay.setPosition("overlay_1", evt.coordinate)
    })
  }
  /**
   * 绘制工具初始化
   * @param type 绘制类型
   */
  private initDraw(type: 'Point' | 'LineString' | 'LinearRing' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon' | 'GeometryCollection' | 'Circle', param?: IDrawPoint | IDrawLine | IDrawPolygon) {
    const drawStyle = new Style({
      fill: new Fill({
        color: '#ffcc33',
      }),
      stroke: new Stroke({
        color: '#ffcc33',
        lineDash: [10, 10],
        width: 2,
      }),
      image: new CircleStyle({
        radius: 5,
        stroke: new Stroke({
          color: '#ffcc33',
        }),
      }),
    })
    // 如果存在绘制工具 则清除以前的绘制工具
    if (this.draw) this.map.removeInteraction(this.draw);
    // 创建绘制
    this.draw = new Draw({
      source: this.source,
      type: type,
      style: drawStyle,
      stopClick: true,
      condition: (e) => {
        if (e.originalEvent.button == 0) {
          return true;
        } else {
          return false;
        }
      },
      finishCondition: (e) => {
        if (type == "Point") {
          return true;
        } else {
          return false;
        }
      }
    })
    // 添加到map
    this.map.addInteraction(this.draw);
    // 初始化提示标牌
    this.initHelpTooltip();
    // 调用事件监听
    this.drawChange((event => {
      param?.callback?.call(this, (event));
    }), type, param);
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
    this.overlay.remove("overlay_1");
    unByKey(this.overlayKey)
    callback?.call(this, {
      type: DrawType.Drawexit,
      eventPosition: event.position
    })
  }
  /**
   * 绘制事件监听
   * @param callback 回调函数，详见{@link IDrawEvent}
   * @param param 参数
   */
  private drawChange(callback: (e: IDrawEvent) => void, type: string, param?: IDrawPoint | IDrawLine | IDrawPolygon) {
    // 绘制计次
    let drawNum = 0;
    useEarth().useGlobalEvent().enableGlobalMouseRightClickEvent();
    // 开始绘制回调函数
    this.draw?.on("drawstart", (event: DrawEvent) => {
      const coordinate = this.map.getCoordinateFromPixel(event.target.downPx_);
      callback.call(this, {
        type: DrawType.Drawstart,
        eventPosition: toLonLat(coordinate)
      })
      // 绘制中移动回调函数
      useEarth().useGlobalEvent().enableGlobalMouseMoveEvent();
      useEarth().useGlobalEvent().addMouseMoveEventByGlobal((event) => {
        callback.call(this, {
          type: DrawType.Drawing,
          eventPosition: event.position
        })
      })
      // 绘制中点击回调函数
      useEarth().useGlobalEvent().enableGlobalMouseLeftDownEvent();
      useEarth().useGlobalEvent().addMouseLeftDownEventByGlobal((event) => {
        callback.call(this, {
          type: DrawType.DrawingClick,
          eventPosition: event.position
        })
      })
    })
    // 绘制完成回调函数
    this.draw?.on("drawend", (event: DrawEvent) => {
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
        eventPosition: toLonLat(coordinate),
      }
      if (type == "LineString") {
        geometry = <LineString>event.feature.getGeometry();
        featurePosition = [];
        for (const item of geometry.getCoordinates()) {
          featurePosition.push(toLonLat(item))
        }
      } else if (type == "Point") {
        geometry = <Point>event.feature.getGeometry();
        featurePosition = toLonLat(geometry.getCoordinates());
      } else if (type == "Polygon") {
        geometry = <Polygon>event.feature.getGeometry();
        featurePosition = [];
        for (const item of geometry.getCoordinates()[0]) {
          featurePosition.push(toLonLat(item))
        }
      }
      if (type == "LineString" && featurePosition && featurePosition?.length > 1) {
        response.featurePosition = featurePosition;
        response.feature = event.feature;
        callback.call(this, response);
      }
      if (type == "Polygon") {
        if (featurePosition && featurePosition?.length > 3) {
          response.featurePosition = featurePosition;
          response.feature = event.feature;
          callback.call(this, response);
        } else {
          setTimeout(() => {
            this.source.removeFeature(event.feature);
          }, 10);
        }
      }
      if (type == "Point" && featurePosition) {
        response.featurePosition = featurePosition;
        response.feature = event.feature;
        drawNum++;
        callback.call(this, response);
        const pointParam = <IDrawPoint>param;
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

    })
    // 退出绘制回调函数
    useEarth().useGlobalEvent().addMouseRightClickEventByGlobal((event) => {
      this.exitDraw(event, param?.callback);
    })
  }
  drawLine(param?: IDrawLine) {
    // 初始化绘制工具
    this.initDraw("LineString", param);
  }
  drawPoint(param?: IDrawPoint) {
    // 初始化绘制工具
    this.initDraw("Point", param);
  }
  drawPolygon(param?: IDrawPolygon) {
    // 初始化绘制工具
    this.initDraw("Polygon", param);
  }
}