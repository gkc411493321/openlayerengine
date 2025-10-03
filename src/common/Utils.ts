import { IPointParam } from "interface";
import { Feature } from "ol";
import { Coordinate } from "ol/coordinate";
import { easeOut } from "ol/easing";
import { getWidth } from "ol/extent";
import { Geometry, Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import { unByKey } from "ol/Observable";
import { getVectorContext } from "ol/render";
import RenderEvent from "ol/render/Event";
import VectorSource from "ol/source/Vector";
import { Style, Stroke, Icon } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { useEarth } from "../useEarth";

export default class Utils<T> {
  /**
   * @description: 获取一个新的GUID
   * @param {'N'|'D'|'B'|'P'|'X'} format 输出字符串样式，N-无连接符、D-减号连接符，BPX-未实现，默认D
   * @return {string}
   */
  static GetGUID(format: 'N' | 'D' | 'B' | 'P' | 'X' = 'D'): string {
    const gen = (count: number) => {
      let out = '';
      for (let i = 0; i < count; i++) {
        out += (((1 + window.Math.random()) * 0x10000) | 0).toString(16).substring(1);
      }
      return out;
    };
    const arr = [gen(2), gen(1), gen(1), gen(1), gen(3)];
    let guid: string;
    switch (format) {
      case 'N':
        guid = arr.join('');
        break;
      case 'D':
        guid = arr.join('-');
        break;
      default:
        guid = arr.join('-');
        break;
    }
    return guid;
  }
  /**
   * @description: 线性插值函数 此处的计算只处理二维带x ,y 的向量
   * @param {number[]} startPos
   * @param {number[]} endPos
   * @param {number} t
   * @return {*} number[]
   * @author: wuyue.nan
   */
  static linearInterpolation(startPos: number[], endPos: number[], t: number): number[] {
  const a = this.constantMultiVector2(1 - t, startPos)
  const b = this.constantMultiVector2(t, endPos)
    return this.vector2Add(a, b)
  }
  /**
   * @description: 常数乘以二维向量数组的函数
   * @param {number} constant
   * @param {number} vector2
   * @return {*} number[]
   * @author: wuyue.nan
   */
  static constantMultiVector2(constant: number, vector2: number[]): number[] {
    return [constant * vector2[0], constant * vector2[1]];
  }
  /**
   * @description: 计算曲线点
   * @param {number} a
   * @param {number} b
   * @return {*} number[]
   * @author: wuyue.nan
   */
  static vector2Add(a: number[], b: number[]): number[] {
    return [a[0] + b[0], a[1] + b[1]]
  }

  /**
   * @description: 计算贝塞尔曲线
   * @param {number} startPos
   * @param {number} center
   * @param {number} endPos
   * @param {number} t
   * @return {*} number[]
   * @author: wuyue.nan
   */
  static bezierSquareCalc(startPos: number[], center: number[], endPos: number[], t: number): number[] {
  const a = this.constantMultiVector2(Math.pow((1 - t), 2), startPos)
  const b = this.constantMultiVector2((2 * t * (1 - t)), center)
  const c = this.constantMultiVector2(Math.pow(t, 2), endPos)
    return this.vector2Add(this.vector2Add(a, b), c)
  }
  /**
  * 创建样式
  * @param start 开始点 
  * @param end 结束点
  * @param color 填充颜色
  * @returns 返回`Style`
  */
  static createStyle(start: Coordinate, end: Coordinate, color?: string): Style {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const rotation = Math.atan2(dy, dx);
    const style = new Style({
      geometry: new Point(end),
      image: new Icon({
  src: '/image/arrow.svg',
        anchor: [0.75, 0.5],
        imgSize: [16, 16],
        rotateWithView: true,
        rotation: -rotation,
        color: color || "#ffcc33"
      })
    })
    return style;
  }
  /**
   * 动态点刷新方法
   * @param feature `Point` 实例
   * @param param 详细参数，详见{@link IPointParam}
   */
  flash(feature: Feature<Geometry>, param: IPointParam<T>, layer: VectorLayer<VectorSource<Geometry>>): void {
    const defaultOption = {
      duration: 1000,
      flashColor: param.flashColor || { R: 255, G: 0, B: 0 },
      isRepeat: true,
      size: param.size || 6
    };
    const options = Object.assign(defaultOption, param);
    let start = Date.now();
    const geometry = feature.getGeometry();
    if (geometry) {
      const flashGeom = geometry.clone();
      const listenerKey = layer.on('postrender', (event: RenderEvent) => {
        const worldWidth = getWidth(useEarth().map.getView().getProjection().getExtent());
        const center = <Coordinate>useEarth().view.getCenter();
        const offset = Math.floor(center[0] / worldWidth);
        const frameState = event.frameState;
        if (frameState) {
          const elapsed = frameState.time - start;
          if (elapsed >= options.duration) {
            if (options.isRepeat) {
              start = Date.now();
            } else {
              unByKey(listenerKey);
              return;
            }
          }
          const vectorContext = getVectorContext(event);
          const elapsedRatio = elapsed / options.duration;
          const radius = easeOut(elapsedRatio) * 10 + options.size;
          const opacity = easeOut(1 - elapsedRatio);
          const style = new Style({
            image: new CircleStyle({
              radius: radius,
              stroke: new Stroke({
                color: `rgba(${options.flashColor.R}, ${options.flashColor.G}, ${options.flashColor.B},${opacity})`,
                width: 0.25 + opacity,
              }),
            }),
          });
          const flashGeomClone = flashGeom.clone()
          vectorContext.setStyle(style);
          flashGeomClone.translate(offset * worldWidth, 0);
          vectorContext.drawGeometry(flashGeomClone);
          flashGeomClone.translate(worldWidth, 0);
          vectorContext.drawGeometry(flashGeomClone);
          layer.changed()
        }
      });
      feature.set("listenerKey", listenerKey);
    }
  }

  /**
   * 角度转弧度
   * @param deg 角度 (degree)
   * @returns 弧度 (radian)
   * @example
   * const rad = Utils.deg2rad(90); // Math.PI / 2
   */
  static deg2rad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  /**
   * 弧度转角度
   * @param rad 弧度 (radian)
   * @returns 角度 (degree)
   * @example
   * const deg = Utils.rad2deg(Math.PI); // 180
   */
  static rad2deg(rad: number): number {
    const deg = (rad * 180) / Math.PI;
    return (deg % 360 + 360) % 360;
  }
}
