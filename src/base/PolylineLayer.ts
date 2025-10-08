import { Utils } from '../common';
import Earth from '../Earth';
import { IPolylineFlyParam, IPolylineParam, ISetPolylineParam } from '../interface';
import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import Base from './Base';
import { Coordinate } from 'ol/coordinate';
import Flightline from '../extends/flight-line/FlightLine';
import { getVectorContext } from 'ol/render';
import RenderEvent from 'ol/render/Event';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import { getWidth } from 'ol/extent';
import { useEarth } from '@/useEarth';

/**
 * 创建线`Polyline`
 */
export default class Polyline<T = LineString> extends Base {
  /**
   * 飞线缓存集合
   */
  private flyCatch: Map<string, Flightline> = new Map();
  /**
   * 流动线步进集合
   */
  private lineDash: Map<string, number> = new Map();
  /**
   * 流动线事件key集合
   */
  private flashKey: Map<string, EventsKey> = new Map();
  // 旧的箭头 geometry 监听方案已被动态 style function 替换

  /**
   * 构造器
   * @param earth 地图实例
   * @example
   * ```
   * const polyline = new Polyline(useEarth());
   * ```
   */
  constructor(earth?: Earth, options?: { wrapX?: boolean }) {
    const layer = new VectorLayer({
      source: new VectorSource({
        wrapX: options?.wrapX !== undefined ? options.wrapX : true
      }),
      declutter: true
    });
    const e = earth ? earth : useEarth();
    super(e, layer, 'Polyline');
  }
  /**
   * 创建矢量元素
   * @param param 详细参数，详见{@link IPolylineParam}
   * @returns 返回`Feature<LineString>`实例
   */
  private createFeature(param: IPolylineParam<T>): Feature<LineString> {
    const feature = new Feature({
      geometry: new LineString(param.positions)
    });
    // 初始 style（当不需要动态适配时使用）
    const baseStyle = new Style();
    super.setFill(baseStyle, param.fill);
    super.setText(baseStyle, param.label);
    // 如果未设置 stroke 或未提供 lineDash 或未启用 fitPatternOnce，直接常规处理
    const strokeCfg = param.stroke;
    const needFit = !!(strokeCfg && strokeCfg.lineDash && strokeCfg.lineDash.length > 0 && strokeCfg.fitPatternOnce);
    if (!needFit) {
      super.setStroke(baseStyle, strokeCfg, param.width);
      feature.setStyle(baseStyle);
    } else {
      // 动态 style function：随视图缩放或线坐标变动实时匹配一轮 pattern
      // pattern 视为比例数组，按其和做归一化
      const patternSrc = Array.isArray(strokeCfg?.lineDash) ? strokeCfg.lineDash : [];
      const pattern = patternSrc.slice();
      const patternSum = pattern.length ? pattern.reduce((a, b) => a + b, 0) : 1;
      const strokeWidth = strokeCfg?.width ?? param.width ?? 2;
      let lastSig = '';
      let cachedStyle: Style | null = null;
      // 生成坐标签名 + 分辨率签名：防止重复计算
      const buildSig = (coords: number[][], mapRes: number) => {
        if (!coords.length) return '0';
        const first = coords[0];
        const last = coords[coords.length - 1];
        return `${coords.length}|${first[0].toFixed(4)},${first[1].toFixed(4)}|${last[0].toFixed(4)},${last[1].toFixed(4)}|${mapRes}`;
      };
      feature.setStyle((feat: import('ol/Feature').FeatureLike, res: number) => {
        const geom = (feat as Feature<LineString>).getGeometry && (feat as Feature<LineString>).getGeometry();
        if (!geom || !(geom instanceof LineString)) return baseStyle;
        const map = this.earth?.map;
        if (!map) return baseStyle;
        const coords: number[][] = geom.getCoordinates();
        const sig = buildSig(coords, res);
        if (sig === lastSig && cachedStyle) return cachedStyle;
        lastSig = sig;
        // 计算屏幕像素总长度
        let totalPx = 0;
        for (let i = 1; i < coords.length; i++) {
          const p1 = map.getPixelFromCoordinate(coords[i - 1]);
          const p2 = map.getPixelFromCoordinate(coords[i]);
          if (p1 && p2) {
            const dx = p2[0] - p1[0];
            const dy = p2[1] - p1[1];
            totalPx += Math.sqrt(dx * dx + dy * dy);
          }
        }
        if (totalPx <= 0) totalPx = 1;
        // 为保证线条可见，限制最小参考长度
        const scaleFactor = totalPx / patternSum;
        const dashArray = pattern.map((v) => Math.max(1, Math.round(v * scaleFactor)));
        const stroke = new Stroke({
          color: strokeCfg?.color || '#ff0000',
          width: strokeWidth,
          lineDash: dashArray,
          lineDashOffset: strokeCfg?.lineDashOffset || 0
        });
        cachedStyle = new Style({
          stroke,
          text: baseStyle.getText(),
          fill: baseStyle.getFill()
        });
        return cachedStyle;
      });
    }
    // 其余属性挂载
    feature.setId(param.id);
    feature.set('data', param.data);
    feature.set('module', param.module);
    feature.set('layerId', this.layer.get('id'));
    feature.set('layerType', 'Polyline');
    feature.set('param', param);
    return feature;
  }
  /**
   * 增加带箭头的线段
   * @param param 详细参数，详见{@link IPolylineParam}
   * @returns 返回`Feature<LineString>`
   */
  private addLineArrows(param: IPolylineParam<T>): Feature<LineString> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    // 可能是 Style 或 styleFunction（当启用 fitPatternOnce 时）
    const originalStyle = feature.getStyle();
    const styleFn = typeof originalStyle === 'function' ? originalStyle : undefined;
    const staticBase = typeof originalStyle === 'function' ? undefined : (originalStyle as Style | Style[] | undefined);
    // 文本样式单独重建，避免引用被覆盖
    const textStyle = super.setText(new Style(), param.label);
    const color = param.stroke?.color;
    // 性能优化：缓存箭头 Style，只有在几何真正变化时重建
    let lastRevision = -1;
    let cachedStyles: Style[] = []; // 仅存放箭头部分（不含基础线与文本）
    let lastCoordSignature = '';
    const rebuildArrows = (geom: LineString, coords: number[][]) => {
      cachedStyles = [];
      if (param.arrowIsRepeat) {
        geom.forEachSegment((start, end) => {
          cachedStyles.push(Utils.createStyle(start, end, color));
        });
      } else if (coords.length >= 2) {
        const start = coords[coords.length - 2];
        const end = coords[coords.length - 1];
        cachedStyles.push(Utils.createStyle(start, end, color));
      }
    };
    // 生成坐标签名（避免调用大量 Style 构建）
    const buildSignature = (coords: number[][]) => {
      if (!coords.length) return '';
      const len = coords.length;
      const head = coords[0];
      const tail = coords[len - 1];
      return `${len}|${head[0].toFixed(4)},${head[1].toFixed(4)}|${tail[0].toFixed(4)},${tail[1].toFixed(4)}`;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    feature.setStyle((feat: any, res: number) => {
      const geom: LineString | null = feat.getGeometry ? feat.getGeometry() : null;
      // 运行原始基础样式（如果是函数）以获取当前分辨率下的动态样式
      let baseStyles: Style[] = [];
      if (styleFn) {
        const r = styleFn(feat, res);
        if (Array.isArray(r)) baseStyles = r as Style[];
        else if (r) baseStyles = [r as Style];
      } else if (staticBase) {
        if (Array.isArray(staticBase)) baseStyles = staticBase as Style[];
        else baseStyles = [staticBase as Style];
      }
      if (!geom || !baseStyles.length) return baseStyles;
      const coords = geom.getCoordinates();
      interface RevGeom {
        getRevision?: () => number;
      }
      const revGeom = geom as unknown as RevGeom;
      const revision = typeof revGeom.getRevision === 'function' ? revGeom.getRevision() : 0;
      const sig = buildSignature(coords);
      // 判断是否需要重建
      if (revision !== lastRevision || sig !== lastCoordSignature) {
        lastRevision = revision;
        lastCoordSignature = sig;
        rebuildArrows(geom, coords);
        // 只有坐标真实变化时同步 param.positions
        param.positions = coords;
      }
      // 组合最终样式数组（避免每帧创建新 Style 实例）
      if (param.label) return [...baseStyles, ...cachedStyles, textStyle];
      return [...baseStyles, ...cachedStyles];
    });
    feature.setId(param.id);
    feature.set('data', param.data);
    feature.set('module', param.module);
    feature.set('param', param);
    feature.set('isArrows', true);
    return <Feature<LineString>>super.save(feature);
  }
  /**
   * 增加流动线段
   * @param param 详细参数，详见{@link IPolylineParam}
   * @returns 返回`Feature<LineString>`
   */
  private addFlowingDash(param: IPolylineParam<T>): Feature<LineString> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    let textStyle = new Style();
    textStyle = super.setText(textStyle, param.label);
    const fullLineStyle = new Style({
      stroke: new Stroke({
        color: param.fullLineColor || 'rgba(30,144,255, 1)',
        width: param.width || 2,
        lineDash: [0]
      }),
      image: new Circle({
        radius: 100,
        fill: new Fill({
          color: 'red'
        })
      })
    });
    feature.setId(param.id);
    feature.set('data', param.data);
    feature.set('param', param);
    feature.set('module', param.module);
    this.lineDash.set(param.id, 100);
    const key = this.layer.on('postrender', (evt: RenderEvent) => {
      const vectorContext = getVectorContext(evt);
      if (param.id) {
        // 基础几何（支持更新后的坐标）
        const line = new LineString(param.positions);
        const worldWidth = getWidth(this.earth.map.getView().getProjection().getExtent());
        const center = <Coordinate>this.earth.view.getCenter();
        const offset = Math.floor(center[0] / worldWidth);
        line.translate(offset * worldWidth, 0);
        // === 动态 pattern 计算（支持 fitPatternOnce） ===
        const strokeCfg = param.stroke;
        const hasPattern = strokeCfg && Array.isArray(strokeCfg.lineDash) && strokeCfg.lineDash.length > 0;
        const basePattern = hasPattern && strokeCfg?.lineDash ? (strokeCfg.lineDash as number[]) : [10, 25];
        let dashToUse = basePattern.slice();
        const map = this.earth.map;
        // 计算像素长度
        let totalPx = 0;
        if (strokeCfg?.fitPatternOnce) {
          for (let i = 1; i < param.positions.length; i++) {
            const p1 = map.getPixelFromCoordinate(param.positions[i - 1]);
            const p2 = map.getPixelFromCoordinate(param.positions[i]);
            if (p1 && p2) {
              const dx = p2[0] - p1[0];
              const dy = p2[1] - p1[1];
              totalPx += Math.sqrt(dx * dx + dy * dy);
            }
          }
          if (totalPx <= 0) totalPx = basePattern.reduce((a, b) => a + b, 0) || 1;
          const sumPattern = basePattern.reduce((a, b) => a + b, 0) || 1;
          // 让 pattern 总和 ≈ totalPx
          const scaleFactor = totalPx / sumPattern;
          dashToUse = basePattern.map((v) => Math.max(1, Math.round(v * scaleFactor)));
        }
        // 动画 offset：基于 dash 总长循环
        const dashTotal = dashToUse.reduce((a, b) => a + b, 0) || 1;
        let lineDashOffset = <number>this.lineDash.get(param.id);
        if (lineDashOffset <= 0) lineDashOffset = dashTotal;
        else lineDashOffset -= 2; // 步进速度 2，可参数化
        this.lineDash.set(param.id, lineDashOffset);
        const newDottedLineStyle = new Style({
          stroke: new Stroke({
            color: param.dottedLineColor || 'rgba(255, 250, 250, 1)',
            width: param.width || 2,
            lineDash: dashToUse,
            lineDashOffset: lineDashOffset
          })
        });
        vectorContext.setStyle(fullLineStyle);
        vectorContext.drawGeometry(line);
        vectorContext.setStyle(newDottedLineStyle);
        vectorContext.drawGeometry(line);
        vectorContext.setStyle(textStyle);
        vectorContext.drawGeometry(line);
        line.translate(worldWidth, 0);
        vectorContext.setStyle(fullLineStyle);
        vectorContext.drawGeometry(line);
        vectorContext.setStyle(newDottedLineStyle);
        vectorContext.drawGeometry(line);
        vectorContext.setStyle(textStyle);
        vectorContext.drawGeometry(line);
        this.earth.map.render();
      }
    });
    feature.setStyle(
      new Style({
        stroke: new Stroke({
          color: '#ffffff00',
          width: 1
        })
      })
    );
    this.flashKey.set(param.id, key);
    return <Feature<LineString>>super.save(feature);
  }
  /**
   * 添加线段
   * @param param 详细参数，详见{@link IPolylineParam}
   * @returns 返回`Feature<LineString>`
   * @example
   * ```
   * const polyline = new Polyline(useEarth());
   * polyline.add({
   *  // ...
   * })
   * ```
   */
  add(param: IPolylineParam<T>): Feature<LineString> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    if (param.isArrow) {
      return this.addLineArrows(param);
    } else if (param.isFlowingDash) {
      return this.addFlowingDash(param);
    } else {
      return <Feature<LineString>>super.save(feature);
    }
  }
  /**
   * 添加飞行线
   * @param param 详细参数，详见{@link IPolylineFlyParam}
   * @returns 返回`Flightline`
   * @example
   * ```
   * const polyline = new Polyline(useEarth());
   * polyline.addFlightLine({
   *  // ...
   * })
   * ```
   */
  addFlightLine(param: IPolylineFlyParam<T>): Flightline {
    param.id = param.id || Utils.GetGUID();
    const flightline = new Flightline(this.layer, param, param.id);
    this.flyCatch.set(param.id, flightline);
    return flightline;
  }
  /**
   * 修改线段坐标
   * @param id `polyline`id
   * @param position 坐标
   * @returns 返回`Feature<LineString>`实例数组
   * @example
   * ```
   * const polyline = new Polyline(useEarth());
   * polyline.setPosition("1", [fromLonLat([100, 70]), fromLonLat([100, 50])]);
   * ```
   */
  setPosition(id: string, position: Coordinate[]): Feature<LineString>[] {
    const features = <Feature<LineString>[]>super.get(id);
    if (features[0] == undefined) {
      console.warn('没有找到元素，请检查ID');
      return [];
    }
    const param = <IPolylineParam<T>>features[0].get('param');
    param.positions = position;
    // if (isArrows) {
    //   super.remove(id);
    //   this.addLineArrows(param);
    // } else {
    //   features[0].set('param', param);
    //   features[0].getGeometry()?.setCoordinates(position);
    // }
    features[0].set('param', param);
    features[0].getGeometry()?.setCoordinates(position);
    return features;
  }
  /**
   * 删除所有线段
   */
  remove(): void;
  /**
   * 删除指定线段
   * @param id 线段id
   */
  remove(id: string): void;
  remove(id?: string | undefined): void {
    if (id) {
      if (this.flashKey.has(id)) {
        // 流动线
        const key = <EventsKey>this.flashKey.get(id);
        unByKey(key);
        this.flashKey.delete(id);
        this.lineDash.delete(id);
      } else {
        super.remove(id); // 普通 / 箭头线（动态 style 无需监听清理）
      }
    } else {
      super.remove();
      this.flashKey.forEach((item) => {
        unByKey(item);
      });
      this.flashKey.clear();
      this.lineDash.clear();
    }
  }
  /**
   * 修改飞线坐标
   * @param id `flyLine`id
   * @param position 坐标
   * @example
   * ```
   * const polyline = new Polyline(useEarth());
   * polyline.setFlightPosition("1", [fromLonLat([100, 70]), fromLonLat([100, 50])]);
   * ```
   */
  setFlightPosition(id: string, position: Coordinate[]): void {
    const flightline = this.flyCatch.get(id);
    if (flightline) {
      flightline.setPosition(id, position);
    }
  }
  /**
   * 删除所有飞行线
   * @example
   * ```
   * const polyline = new Polyline(useEarth());
   * polyline.removeFlightLine();
   * ```
   */
  removeFlightLine(): void;
  /**
   * 删除指定飞行线
   * @param id `flyLine`id
   * @example
   * ```
   * const polyline = new Polyline(useEarth());
   * polyline.removeFlightLine("1");
   * ```
   */
  removeFlightLine(id: string): void;
  removeFlightLine(id?: string): void {
    if (id) {
      const flightline = this.flyCatch.get(id);
      if (flightline) {
        flightline.removeFeatureById(id);
        this.flyCatch.delete(id);
      }
    } else {
      this.flyCatch.forEach((item, key) => {
        item.removeFeatureById(key);
      });
      this.flyCatch.clear();
    }
  }
  /**
   * 修改线。注意，此方法不适用飞行线修改
   * @param param 线参数，详见{@link ISetPolylineParam}
   * @returns 返回`Feature<LineString>`实例
   * @example
   * ```
   * const polyline = new Polyline(useEarth());
   * polyline.set({
   *  // ...
   * })
   * ```
   */
  set(param: ISetPolylineParam): Feature<LineString> | null {
    const features = <Feature<LineString>[]>super.get(param.id);
    if (features[0] == undefined) {
      console.warn('没有找到元素，请检查ID');
      return null;
    }
    this.remove(param.id);
    const oldParam = <IPolylineParam<T>>features[0].get('param');
    const newParam = Object.assign(oldParam, param);
    return this.add(newParam);
  }
  /**
   * 隐藏图层所有矢量元素
   * @example
   * ```
   * layer.hide();
   * ```
   */
  hide(): void;
  /**
   * 隐藏图层指定矢量元素
   * @param id 矢量元素id
   * @example
   * ```
   * layer.hide("1");
   * ```
   */
  hide(id: string): void;
  hide(id?: string | undefined): void {
    if (id) {
      const feature = this.get(id);
      if (feature[0] == undefined) {
        console.warn('没有找到元素，请检查ID');
        return;
      }
      this.hideFeatureMap.set(id, feature[0]);
      this.remove(id);
    } else {
      this.layer.setVisible(false);
    }
  }
  /**
   * 显示图层所有矢量元素
   * @example
   * ```
   * layer.show();
   * ```
   */
  show(): void;
  /**
   * 显示图层指定矢量元素
   * @param id 矢量元素id
   * @example
   * ```
   * layer.show("1");
   * ```
   */
  show(id: string): void;
  show(id?: string | undefined): void {
    if (id) {
      const feature = <Feature<LineString>>this.hideFeatureMap.get(id);
      const a = feature?.get('param');
      if (feature) this.add(a);
      this.hideFeatureMap.delete(id);
    } else {
      this.hideFeatureMap.clear();
      this.layer.setVisible(true);
    }
  }
}
