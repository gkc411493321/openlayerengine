import { Coordinate } from "ol/coordinate";
import { useEarth } from "../useEarth";
import { OverlayLayer, PolylineLayer } from "../base";
import { Utils } from "../common";
import Earth from "../Earth";
import { fromLonLat, toLonLat } from "ol/proj";
import { Overlay } from "ol";
import { LineString } from "ol/geom";
import { getVectorContext } from "ol/render";
import { getWidth } from "ol/extent";
export interface IDescriptorSetParams<T> {
  /**
   * 位置
   */
  position: Coordinate;
  /**
   * 容器内容
   */
  element?: IProperties<string | number>[] | string;
  /**
   * 偏移量,默认[0,0]
   */
  offset?: number[];
  /**
   * 自定义数据
   */
  data?: T;
}
export interface IProperties<T> extends IPropertiesBase<T> {
  type?: 'text';
  options?: IKeyValue<T>[];
  max?: number;
  min?: number;
  step?: number;
  children?: IProperties<T>[];
  color?: string;
  class?: string;
}
export interface IDescriptorParams<T> {
  /**
   * 描述器类型，list：列表，custom：自定义
   */
  type: 'list' | 'custom';
  /**
   * 是否显示定位线
   */
  isShowFixedline?: boolean;
  /**
   * 定位线颜色
   */
  fixedLineColor?: string;
  /**
   * 窗口定位模式，默认position。position：跟随地理位置固定， pixel：跟随屏幕坐标固定
   */
  fixedModel?: 'position' | 'pixel';
  /**
   * 启用拖动事件，默认开启
   */
  drag?: boolean;
  /**
   * 保存按钮文本
   */
  saveText?: string;
  /**
   * 关闭按钮文本
   */
  closeText?: string;
  /**
   * 删除按钮文本
   */
  deleteText?: string;
  /**
   * 头部
   */
  header?: string;
  /**
   * 底部
   */
  footer?: string;
  /**
   * 保存按钮回调函数
   */
  save?: (arg: { data?: T; props: IPropertiesBase<string>[] }) => void;
  /**
   * 关闭按钮回调函数
   */
  close?: (arg: { data?: T }) => void;
  /**
   * 删除按钮回调函数
   */
  delete?: (arg: { data?: T }) => void;
}
interface IPropertiesBase<T> extends IKeyValue<T> {
  key?: string;
  parent?: string;
}
interface IKeyValue<T> {
  label: string;
  value: T;
}
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
  private dom: HTMLDivElement;
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
  pixel: any;
  constructor(private earth: Earth, private options: IDescriptorParams<T>) {
    this.id = Utils.GetGUID();
    this.overLayer = new OverlayLayer(this.earth);
    this.dom = document.createElement("div");
    this.init();
  }
  private init() {
    const container = document.getElementById(this.earth.containerId);
    container?.append(this.dom);
    if (this.options.type === 'list') {
      this.enableListEvent();
    }
  }
  private updateLinePosition(coordinate: Coordinate) {
    const overlay = <Overlay>this.overLayer.get(this.id);
    const position = overlay.get("data").position;
    // 修改定位线位置
    const oldPixel = this.earth.map.getPixelFromCoordinate(position);
    const newPixel = this.earth.map.getPixelFromCoordinate(coordinate);
    const width = this.dom.clientWidth;
    const height = this.dom.clientHeight;
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
    let a = toLonLat(lineEndPosition);
    if (a[0] < 0) {
      a[0] = a[0]
    }
    useEarth().useDefaultLayer().polyline.setPosition(this.id, [position, fromLonLat(a)]);
  }
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
      this.earth.map.on("postrender", () => {
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
    }
  }
  private createHtmlList(element: IProperties<string | number>[]): string {
    const list: string[] = [];
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
    return `<ul class="descriptor-list">${list.join('')}</ul>`;
  }
  set(params: IDescriptorSetParams<T>) {
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
    this.dom.style.display = "none";
    // 绘制定位点、线
    if ((this.options.drag || this.options.drag == undefined) && (this.options.isShowFixedline || this.options.isShowFixedline == undefined)) {
      useEarth().useDefaultLayer().polyline.add({
        id: this.id,
        isFlowingDash: true,
        fullLineColor: "#ffffff00",
        dottedLineColor: this.options.fixedLineColor || "#aef",
        positions: [params.position, params.position]
      })
      // 控制窗口经度偏移10°
      const tL = toLonLat(params.position);
      this.overLayer.setPosition(this.id, fromLonLat([tL[0] + 10, tL[1] + 5]));
    }
  }
  show() {
    this.dom.style.display = 'block';

  }

}