/* eslint-disable @typescript-eslint/no-explicit-any */
import { IPointParam } from 'interface';
import { Feature } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { easeOut } from 'ol/easing';
import { getWidth, getCenter, boundingExtent } from 'ol/extent';
import { Geometry, Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { unByKey } from 'ol/Observable';
import { getVectorContext } from 'ol/render';
import arrowSvg from '../assets/image/arrow.svg';
import RenderEvent from 'ol/render/Event';
import VectorSource from 'ol/source/Vector';
import { Style, Stroke, Icon } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { useEarth } from '../useEarth';

export default class Utils<T> {
  /**
   * 屏幕像素 pixel作为元素的新中心点，重新计算元素坐标
   * 支持 Point、LineString、Polygon、Circle
   * 返回新的坐标数组或参数对象（不直接修改原 feature）
   * @param pixel 屏幕像素坐标 [x, y]
   * @param feature OpenLayers Feature 实例
   */
  static getFeatureToPixel(pixel: number[], position: Coordinate | Coordinate[] | Coordinate[][]): Coordinate | Coordinate[] | Coordinate[][] | null {
    if (!pixel || pixel.length !== 2 || position == null) return null;
    const map = useEarth().map;
    const target = map.getCoordinateFromPixel(pixel);
    if (!target) return null;

    // 处理跨屏(world wrap)问题：在 EPSG:3857 下当地图平移穿越国际换日线或重复世界时，
    // 原中心与目标点可能相差一个或多个 worldWidth，直接相减会得到巨大 dx，导致要素跳跃或不可见。
    // 通过将 X 方向的平移压缩为最短距离 (|dx| <= worldWidth/2) 来修复。
    const projectionExtent = map.getView().getProjection().getExtent();
    const worldWidth = projectionExtent ? projectionExtent[2] - projectionExtent[0] : undefined;
    const minX = projectionExtent ? projectionExtent[0] : undefined;
    const maxX = projectionExtent ? projectionExtent[2] : undefined;
    const shortestDeltaX = (from: number, to: number): number => {
      if (!worldWidth || !isFinite(worldWidth)) return to - from;
      let dx = to - from;
      if (dx > worldWidth / 2) dx -= worldWidth;
      else if (dx < -worldWidth / 2) dx += worldWidth;
      return dx;
    };
    const adjustX = (x: number): number => {
      if (!worldWidth || minX == null || maxX == null) return x;
      if (x > maxX) return x - worldWidth;
      if (x < minX) return x + worldWidth;
      return x;
    };

    // 判断结构层级：
    // Point: [x,y]
    // Line / MultiPoint: [[x,y],[x,y],...]
    // Polygon(单环或多环): [[[x,y],...],[...],...]
    const isNumberArray = (arr: unknown): arr is number[] => Array.isArray(arr) && arr.length === 2 && arr.every((n) => typeof n === 'number');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isLineLike = (p: any): p is Coordinate[] => Array.isArray(p) && p.length > 0 && isNumberArray(p[0]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isPolygonLike = (p: any): p is Coordinate[][] =>
      Array.isArray(p) && p.length > 0 && Array.isArray(p[0]) && !isNumberArray(p[0]) && isNumberArray(p[0][0]);

    // 直接 Point / Circle center：使用与线一致的“最短位移”规则，避免跨屏后 target.x 超出世界导致要素不可见
    if (isNumberArray(position)) {
      const base = position as Coordinate;
      const dx = shortestDeltaX(base[0], target[0]);
      const dy = target[1] - base[1];
      return [adjustX(base[0] + dx), base[1] + dy] as Coordinate;
    }

    // 线或多点
    if (isLineLike(position)) {
      const extent = boundingExtent(position as Coordinate[]);
      const center = getCenter(extent);
      const dx = shortestDeltaX(center[0], target[0]);
      const dy = target[1] - center[1];
      // 直接使用最短位移 (target - center 经过 wrap 修正) 即可
      return (position as Coordinate[]).map((c) => [adjustX(c[0] + dx), c[1] + dy]);
    }

    // 多边形（多环）
    if (isPolygonLike(position)) {
      // 扁平化所有 ring 计算中心
      const flat: Coordinate[] = (position as Coordinate[][]).reduce((acc: Coordinate[], ring) => {
        (ring || []).forEach((pt) => acc.push(pt as Coordinate));
        return acc;
      }, []);
      if (!flat.length) return null;
      const extent = boundingExtent(flat);
      const center = getCenter(extent);
      const dx = shortestDeltaX(center[0], target[0]);
      const dy = target[1] - center[1];
      return (position as Coordinate[][]).map((ring) => ring.map((c) => [adjustX(c[0] + dx), c[1] + dy] as Coordinate));
    }

    // 未识别的结构
    return null;
  }
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
   * @author: gkc
   */
  static linearInterpolation(startPos: number[], endPos: number[], t: number): number[] {
    const a = this.constantMultiVector2(1 - t, startPos);
    const b = this.constantMultiVector2(t, endPos);
    return this.vector2Add(a, b);
  }
  /**
   * @description: 常数乘以二维向量数组的函数
   * @param {number} constant
   * @param {number} vector2
   * @return {*} number[]
   * @author: gkc
   */
  static constantMultiVector2(constant: number, vector2: number[]): number[] {
    return [constant * vector2[0], constant * vector2[1]];
  }
  /**
   * @description: 计算曲线点
   * @param {number} a
   * @param {number} b
   * @return {*} number[]
   * @author: gkc
   */
  static vector2Add(a: number[], b: number[]): number[] {
    return [a[0] + b[0], a[1] + b[1]];
  }

  /**
   * @description: 计算贝塞尔曲线
   * @param {number} startPos
   * @param {number} center
   * @param {number} endPos
   * @param {number} t
   * @return {*} number[]
   * @author: gkc
   */
  static bezierSquareCalc(startPos: number[], center: number[], endPos: number[], t: number): number[] {
    const a = this.constantMultiVector2(Math.pow(1 - t, 2), startPos);
    const b = this.constantMultiVector2(2 * t * (1 - t), center);
    const c = this.constantMultiVector2(Math.pow(t, 2), endPos);
    return this.vector2Add(this.vector2Add(a, b), c);
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
        src: arrowSvg,
        anchor: [0.75, 0.5],
        imgSize: [16, 16],
        rotateWithView: true,
        rotation: -rotation,
        color: color || '#ffcc33'
      })
    });
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
                width: 0.25 + opacity
              })
            })
          });
          const flashGeomClone = flashGeom.clone();
          vectorContext.setStyle(style);
          flashGeomClone.translate(offset * worldWidth, 0);
          vectorContext.drawGeometry(flashGeomClone);
          flashGeomClone.translate(worldWidth, 0);
          vectorContext.drawGeometry(flashGeomClone);
          layer.changed();
        }
      });
      feature.set('listenerKey', listenerKey);
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
    return ((deg % 360) + 360) % 360;
  }

  /**
   * 函数节流：在等待窗口期内只执行一次
   * @param fn 需要节流的函数
   * @param wait 等待时间(ms)，默认100
   * @param options 配置
   *  - leading: 是否在首次调用时立即执行，默认 true
   *  - trailing: 是否在窗口结束后再执行最后一次调用，默认 true
   * @returns 包装后的函数，附带 cancel / flush / pending 方法
   * @example
   * const onMove = Utils.throttle((e) => { console.log(e.pixel); }, 200);
   * map.on('pointermove', onMove);
   * // 取消
   * onMove.cancel();
   */
  static throttle<Fn extends (...args: any[]) => any>(
    fn: Fn,
    wait = 100,
    options: { leading?: boolean; trailing?: boolean } = {}
  ): ((...args: Parameters<Fn>) => ReturnType<Fn> | undefined) & {
    cancel: () => void;
    flush: () => ReturnType<Fn> | undefined;
    pending: () => boolean;
  } {
    const { leading = true, trailing = true } = options;
    let timer: number | null = null;
    let lastCallTime: number | null = null; // 上一次触发 wrapper 的时间
    let lastInvokeTime = 0; // 上一次真正执行 fn 的时间
    let lastArgs: Parameters<Fn> | null = null;
    let lastThis: any;
    let result: ReturnType<Fn> | undefined;

    const now = () => Date.now();

    const invoke = () => {
      lastInvokeTime = now();
      if (lastArgs) {
        result = fn.apply(lastThis as any, lastArgs);
        lastArgs = null;
        lastThis = undefined;
      }
      return result;
    };

    const startTimer = (remaining: number) => {
      if (timer != null) window.clearTimeout(timer);
      timer = window.setTimeout(timerExpired, remaining);
    };

    const remainingWait = (current: number) => {
      if (lastCallTime == null) return 0;
      const sinceLastCall = current - lastCallTime;
      const sinceLastInvoke = current - lastInvokeTime;
      return Math.max(wait - sinceLastCall, wait - sinceLastInvoke);
    };

    const shouldInvoke = (current: number) => {
      if (lastCallTime == null) return true; // 首次
      const sinceLastCall = current - lastCallTime;
      const sinceLastInvoke = current - lastInvokeTime;
      return sinceLastCall >= wait || sinceLastInvoke >= wait || sinceLastCall < 0; // 处理系统时间回拨
    };

    const timerExpired = () => {
      timer = null;
      const current = now();
      if (trailing && lastArgs) {
        if (shouldInvoke(current)) {
          invoke();
        } else {
          // 仍在窗口内，重新启动定时器
          startTimer(remainingWait(current));
        }
      }
    };

    const leadingEdge = (current: number) => {
      lastInvokeTime = current;
      if (leading) {
        invoke();
      }
      // 启动 trailing 计时器
      startTimer(wait);
    };

    const throttled = (...args: Parameters<Fn>): ReturnType<Fn> | undefined => {
      const current = now();
      lastCallTime = current;
      lastArgs = args;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      lastThis = this;
      if (shouldInvoke(current)) {
        if (timer == null) {
          leadingEdge(current);
        } else if (trailing) {
          // 允许 trailing，则更新时间等待执行
          // 不立即执行，等待计时器结束
        }
      }
      return result;
    };

    throttled.cancel = () => {
      if (timer != null) {
        window.clearTimeout(timer);
        timer = null;
      }
      lastArgs = null;
      lastThis = undefined;
      lastCallTime = null;
    };

    throttled.flush = () => {
      if (timer != null) {
        window.clearTimeout(timer);
        timer = null;
        if (lastArgs) return invoke();
      }
      return result;
    };

    throttled.pending = () => !!timer;

    return throttled as typeof throttled & {
      cancel: () => void;
      flush: () => ReturnType<Fn> | undefined;
      pending: () => boolean;
    };
  }

  
}
