import { Coordinate } from "ol/coordinate";
import { useEarth } from "../useEarth";
import { OverlayLayer } from "../base";
import { Utils } from "../common";
import Earth from "../Earth";
import { fromLonLat, toLonLat } from "ol/proj";
import { Overlay } from "ol";
import { LineString } from "ol/geom";
import { getWidth } from "ol/extent";
import { unByKey } from "ol/Observable";
import { Pixel } from "ol/pixel";
import { IDescriptorParams, IDescriptorSetParams, IProperties } from "../interface/descriptor";
import { EventsKey } from "ol/events";

/**
 * 描述列表
 */
export default class Descriptor<T = any> {
  /**
   * 容器id
   */
  private id: string;
  /**
   * 容器dom
   */
  private dom!: HTMLDivElement;
  /**
   * overlay图层
   */
  private overLayer: OverlayLayer<unknown>;
  /**
   * 容器className
   */
  private classNameList: string = "earth-engine-component-descriptor descriptor-list";
  /**
   * 容器坐标与事件坐标差值
   */
  private positionDValue: number[] = [];
  /**
   * 记录容器初始化屏幕坐标
   */
  private pixel?: Pixel;
  /**
   * 事件缓存
   */
  private hook: Map<string, any> = new Map();
  /**
   * 构造器
   * @param earth 地图实列 
   * @param options 标牌参数，详见{@link IDescriptorParams<T>}
   */
  constructor(private earth: Earth, private options: IDescriptorParams<T>) {
    this.id = Utils.GetGUID();
    this.overLayer = new OverlayLayer(this.earth);
  }
  /**
   * 初始化地图容器及相关事件
   */
  private init() {
    this.dom = document.createElement("div");
    const container = document.getElementById(this.earth.containerId);
    container?.append(this.dom);
    if (this.options.type === 'list') {
      this.enableListEvent();
    }
  }
  /**
   * 更新连接线位置
   * @param coordinate 容器坐标点 
   */
  private updateLinePosition(coordinate: Coordinate) {
    const overlay = <Overlay>this.overLayer.get(this.id);
    const position = overlay.get("data").position;
    // 修改定位线位置
    let oldPixel: number[] = [];
    const newPixel = this.earth.map.getPixelFromCoordinate(coordinate);
    const width = this.dom.clientWidth;
    const height = this.dom.clientHeight;
    const worldWidth = getWidth(this.earth.map.getView().getProjection().getExtent());
    const center = <Coordinate>this.earth.view.getCenter();
    const offset = Math.floor(center[0] / worldWidth);
    if (offset != 0) {
      const feature = <LineString>useEarth().useDefaultLayer().polyline.get(this.id)[0].getGeometry();
      const coords = feature.getCoordinates();
      const line = new LineString(coords);
      line.translate(offset * worldWidth, 0);
      oldPixel = this.earth.map.getPixelFromCoordinate(line.getCoordinates()[0])
    } else {
      oldPixel = this.earth.map.getPixelFromCoordinate(position)
    }
    const lt = coordinate;
    const lb = this.earth.map.getCoordinateFromPixel([newPixel[0], newPixel[1] + height]);
    const rt = this.earth.map.getCoordinateFromPixel([newPixel[0] + width, newPixel[1]]);
    const rb = this.earth.map.getCoordinateFromPixel([newPixel[0] + width, newPixel[1] + height]);
    let lineEndPosition: Coordinate = [];
    if (oldPixel[0] < newPixel[0] && oldPixel[1] + height < newPixel[1]) {
      // 窗口在右下
      lineEndPosition = lt;
    } else if (oldPixel[0] < newPixel[0] && oldPixel[1] - height > newPixel[1]) {
      // 窗口在右上
      lineEndPosition = lb;
    } else if (oldPixel[0] > newPixel[0] + width && oldPixel[1] - height > newPixel[1]) {
      // 窗口在左上
      lineEndPosition = rb;
    } else if (oldPixel[0] > newPixel[0] + width && oldPixel[1] + height < newPixel[1]) {
      // 窗口在左下
      lineEndPosition = rt;
    } else if (oldPixel[0] < newPixel[0] && (oldPixel[1] < newPixel[1] - height || oldPixel[1] > newPixel[1] - height)) {
      // 窗口在右
      lineEndPosition = new LineString([lt, lb]).getCoordinateAt(0.5);
    } else if (oldPixel[1] < newPixel[1] && (oldPixel[0] - newPixel[0] < width / 2 || newPixel[0] - oldPixel[0] < width / 2)) {
      // 窗口在下
      lineEndPosition = new LineString([lt, rt]).getCoordinateAt(0.5);
    } else if (oldPixel[0] > newPixel[0] + width && (oldPixel[1] < newPixel[1] - height || oldPixel[1] > newPixel[1] - height)) {
      // 窗口在左
      lineEndPosition = new LineString([rt, rb]).getCoordinateAt(0.5);
    } else if (oldPixel[1] > newPixel[1] && (oldPixel[0] - newPixel[0] < width / 2 || newPixel[0] - oldPixel[0] < width / 2)) {
      // 窗口在上
      lineEndPosition = new LineString([lb, rb]).getCoordinateAt(0.5);
    }
    let positions = toLonLat(lineEndPosition);
    if (positions[0] < 0) {
      positions[0] = positions[0]
    }
    const line = useEarth().useDefaultLayer().polyline.get(this.id);
    const param = line[0].get("param");
    param.positions = [position, fromLonLat(positions)];
    line[0].set("param", param);
    useEarth().useDefaultLayer().polyline.setPosition(this.id, [position, fromLonLat(positions)]);
  }
  /**
   * 开始列表下容器事件
   */
  private enableListEvent() {
    if (this.options.drag || this.options.drag == undefined) {
      const handleMouseMove = (event: any) => {
        const overlay = <Overlay>this.overLayer.get(this.id);
        // 修改窗口位置
        const coordinate = this.earth.map.getCoordinateFromPixel([event.x, event.y]);
        coordinate[0] = coordinate[0] - this.positionDValue[0];
        coordinate[1] = coordinate[1] - this.positionDValue[1];
        if (this.options.fixedModel == "pixel") {
          this.pixel = this.earth.map.getPixelFromCoordinate(coordinate)
        }
        overlay.setPosition(coordinate);
        if (this.options.isShowFixedline || this.options.isShowFixedline == undefined) {
          this.updateLinePosition(coordinate);
        }
      };
      const handleMouseLeftUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseLeftUp);
      };
      const handleMouseLeftDown = (event: any) => {
        const overlay = <Overlay>this.overLayer.get(this.id);
        const position = <Coordinate>overlay.getPosition();
        const coordinate = this.earth.map.getCoordinateFromPixel([event.x, event.y]);
        this.positionDValue = [coordinate[0] - position[0], coordinate[1] - position[1]];
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseLeftUp);
      };
      this.dom.addEventListener('mousedown', handleMouseLeftDown);
      this.hook.set('eventListener', () => {
        this.dom.removeEventListener('mousedown', handleMouseLeftDown);
      });
      const postrender = this.earth.map.on("postrender", (e) => {
        const overlay = <Overlay>this.overLayer.get(this.id);
        const position = <Coordinate>overlay.getPosition();
        if (this.options.isShowFixedline || this.options.isShowFixedline == undefined) {
          this.updateLinePosition(position);
        }
        if (this.options.fixedModel == "pixel") {
          if (!this.pixel) {
            this.pixel = this.earth.map.getPixelFromCoordinate(position);
          }
          overlay.setPosition(this.earth.map.getCoordinateFromPixel(this.pixel));
        }
      })
      this.hook.set('postrender', postrender);
    }
  }
  /**
   * 创建html文本
   * @param element 容器内容
   * @returns 返回创建的html文本
   */
  private createHtmlList(element: IProperties<string | number>[]): string {
    const list: string[] = [];
    let header: string = "";
    if (this.options.isShowClose || this.options.isShowClose == undefined) {
      header += `<img class="close" src='image/close.png' id=${this.id} />`;
    }
    if (this.options.header) {
      header += `<span>${this.options.header}</span>`;
    }
    if (header != "") {
      list.push(`<li class="header">${header}</li>`);
    }
    element.forEach(item => {
      if (item.type == "text") {
      } else {
        list.push(
          `<li class="item ${item.class ? item.class : ''}">
            <label>${item.label}</label>
            <span style="${item.color ? 'color:' + item.color : ''}">${item.value}</span>
          </li>`
        )
      }
    })
    if (this.options.footer) {
      list.push(`<li class="footer">${this.options.footer}</li>`);
    }
    return `<ul class="descriptor-list">${list.join('')}</ul>`;
  }
  /**
   * 销毁事件
   */
  private destoryEvent() {
    this.hook.forEach((value, key) => {
      if (key == "postrender") {
        unByKey(value);
      } else {
        value();
      }
    });
    this.hook.clear();
  }
  /**
   * 设置标牌
   * @param params 标牌参数，详见{@link IDescriptorSetParams<T>}
   */
  set(params: IDescriptorSetParams<T>) {
    if (this.dom) {
      document.getElementsByClassName(this.id)[0].remove();
      this.destoryEvent();
    }
    this.init();
    let html = "";
    if (params.element) {
      if (this.options.type === 'list' && params.element instanceof Array) {
        this.dom.className = this.classNameList;
        html += this.createHtmlList(params.element);
      }
    }
    this.dom.innerHTML = html;
    const data = Object.assign(params.data || {}, { position: params.position })
    this.overLayer.add({
      id: this.id,
      position: params.position,
      element: this.dom,
      offset: params.offset,
      data: data,
      className: this.id,
    })

    const line = useEarth().useDefaultLayer().polyline.get(this.id)
    // 绘制定位点、线
    if (line.length == 0 && (this.options.drag || this.options.drag == undefined) && (this.options.isShowFixedline || this.options.isShowFixedline == undefined)) {
      useEarth().useDefaultLayer().polyline.add({
        id: this.id,
        isFlowingDash: true,
        fullLineColor: "#ffffff00",
        dottedLineColor: this.options.fixedLineColor || "#aef",
        positions: [params.position, params.position]
      })
    }
    if (line.length == 0) {
      this.dom.style.display = "none";
    }
    if ((this.options.drag || this.options.drag == undefined) && (this.options.isShowFixedline || this.options.isShowFixedline == undefined)) {
      // 控制窗口经度偏移10°
      const tL = toLonLat(params.position);
      this.overLayer.setPosition(this.id, fromLonLat([tL[0] + 10, tL[1] + 5]));
    }
    if ((this.options.isShowClose || this.options.isShowClose == undefined) && (this.options.drag || this.options.drag == undefined)) {
      const callback = (event: Event) => {
        const item = event.target as HTMLElement;
        if (item.className === 'close') {
          this.hide();
        };
      }
      this.dom.addEventListener('click', callback);
      this.hook.set('setListener', () => {
        this.dom.removeEventListener('click', callback);
      });
    }

  }
  /**
   * 显示标牌
   */
  show() {
    this.dom.style.display = 'block';
    useEarth().useDefaultLayer().polyline.show(this.id);
  }
  /**
   * 隐藏标牌
   */
  hide() {
    this.dom.style.display = 'none';
    useEarth().useDefaultLayer().polyline.hide(this.id);
  }
  /**
   * 销毁标牌及相关事件
   */
  destroy() {
    this.overLayer.remove(this.id);
    useEarth().useDefaultLayer().polyline.remove(this.id);
    this.destoryEvent();
  }

}