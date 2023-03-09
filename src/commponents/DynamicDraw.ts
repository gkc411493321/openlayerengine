import { DrawType, IDrawEvent, IDrawPoint } from "../interface";
import { Map } from "ol";
import { Geometry, LineString } from "ol/geom";
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
  drawStyle: Style;
  overlay: OverlayLayer<unknown>;
  overlayKey: any;
  div!: HTMLDivElement;
  /**
   * 构造器
   * @param earth 地图实例 
   */
  constructor(earth: Earth) {
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
    this.drawStyle = drawStyle;
    this.overlay = new OverlayLayer(useEarth());
  }
  private initHelpTooltip(limit?: number) {
    const div = document.createElement("div");
    this.div = div;
    let str = "重复模式："
    if (limit) {
      str = "剩余" + limit + "次："
    }
    div.innerHTML = "<div class='ol-tooltip'>" + str + "左击开始绘制，双击完成绘制，右击退出绘制</div>"
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
  private drawLineChange(callback: (e: IDrawEvent) => void, type: string, param?: IDrawPoint) {
    // 绘制计次
    let drawNum = 0;
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
      useEarth().useGlobalEvent().enableGlobalMouseDownEvent();
      useEarth().useGlobalEvent().addMouseDownEventByGlobal((event) => {
        callback.call(this, {
          type: DrawType.DrawingClick,
          eventPosition: event.position
        })
      })
    })
    // 绘制完成回调函数
    this.draw?.on("drawend", (event: DrawEvent) => {
      useEarth().useGlobalEvent().disableGlobalMouseMoveEvent();
      useEarth().useGlobalEvent().disableGlobalMouseDownEvent();
      const lineString = <LineString>event.feature.getGeometry();
      const coordinate = this.map.getCoordinateFromPixel(event.target.downPx_);
      const featurePosition = [];
      for (const item of lineString.getCoordinates()) {
        featurePosition.push(toLonLat(item))
      }
      callback.call(this, {
        type: DrawType.Drawend,
        eventPosition: toLonLat(coordinate),
        featurePosition: featurePosition,
        feature: event.feature
      })
      drawNum++;
      if (param?.keepGraphics === false) {
        setTimeout(() => {
          this.source.removeFeature(event.feature);
        }, 10);
      }
      if (this.draw && param?.limit && param.limit > 0) {
        this.div.innerHTML = "<div class='ol-tooltip'>剩余" + (param.limit - drawNum) + "次：左击开始绘制，双击完成绘制，右击退出绘制</div>"
        if (drawNum == param.limit) {
          this.overlay.remove("overlay_1");
          unByKey(this.overlayKey)
          this.map.removeInteraction(this.draw);
        }
      }
    })
    // 退出绘制回调函数
    useEarth().useGlobalEvent().addMouseOnceRightClickEventByGlobal((event) => {
      this.draw?.abortDrawing();
      if (useEarth().useGlobalEvent().hasGlobalMouseMoveEvent()) {
        useEarth().useGlobalEvent().disableGlobalMouseMoveEvent();
      }
      if (useEarth().useGlobalEvent().hasGlobalMouseDownEvent()) {
        useEarth().useGlobalEvent().disableGlobalMouseDownEvent();
      }
      this.overlay.remove("overlay_1");
      unByKey(this.overlayKey)
      if (this.draw) this.map.removeInteraction(this.draw);
      callback.call(this, {
        type: DrawType.Drawexit,
        eventPosition: event.position
      })
    })
  }
  drawLine(param?: IDrawPoint) {
    // 如果存在绘制工具 则清除以前的绘制工具
    if (this.draw) this.map.removeInteraction(this.draw);
    // 创建绘制
    this.draw = new Draw({
      source: this.source,
      type: "LineString",
      style: this.drawStyle
    })
    // 添加到map
    this.map.addInteraction(this.draw);
    // 调用事件监听
    this.drawLineChange((event => {
      param?.callback?.call(this, (event))
    }), "", param);
    // 初始化提示标牌
    this.initHelpTooltip(param?.limit)
  }
  drawPoint(param?: IDrawPoint) {
    // 如果存在绘制工具 则清除以前的绘制工具
    if (this.draw) this.map.removeInteraction(this.draw);
    // 创建绘制
    this.draw = new Draw({
      source: this.source,
      type: "Polygon",
      style: this.drawStyle
    })
    // 添加到map
    this.map.addInteraction(this.draw);
    // 调用事件监听
    this.drawLineChange((event => {
      param?.callback?.call(this, (event))
    }), "", param);
    // 初始化提示标牌
    this.initHelpTooltip(param?.limit)
  }
}