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

/**
 * 创建线`Polyline`
 */
export default class Polyline<T = unknown> extends Base {
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
  constructor(earth: Earth) {
    const layer = new VectorLayer({
      source: new VectorSource(),
      declutter: true
    });
    super(earth, layer, 'Polyline');
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
    let style = new Style();
    style = super.setStroke(style, param.stroke, param.width);
    style = super.setFill(style, param.fill);
    style = super.setText(style, param.label);
    feature.setStyle(style);
    feature.setId(param.id);
    feature.set('param', param);
    feature.set('data', param.data);
    feature.set('module', param.module);
    feature.set('layerId', this.layer.get('id'));
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
    const baseLineStyle = feature.getStyle() as Style; // 基础线样式（包含 stroke/label 之前的）
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
    feature.setStyle((feat: any) => {
      const geom: LineString | null = feat.getGeometry ? feat.getGeometry() : null;
      if (!geom) return [baseLineStyle];
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
      if (param.label) return [baseLineStyle, ...cachedStyles, textStyle];
      return [baseLineStyle, ...cachedStyles];
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
        let lineDashOffset = <number>this.lineDash.get(param.id);
        lineDashOffset = lineDashOffset == 0 ? 100 : lineDashOffset - 2;
        this.lineDash.set(param.id, lineDashOffset);
        const newDottedLineStyle = new Style({
          stroke: new Stroke({
            color: param.dottedLineColor || 'rgba(255, 250, 250, 1)',
            width: param.width || 2,
            lineDash: [10, 25],
            lineDashOffset: lineDashOffset
          })
        });
        const line = new LineString(param.positions);
        const worldWidth = getWidth(this.earth.map.getView().getProjection().getExtent());
        const center = <Coordinate>this.earth.view.getCenter();
        const offset = Math.floor(center[0] / worldWidth);
        line.translate(offset * worldWidth, 0);
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
    const isArrows = features[0].get('isArrows');
    const param = <IPolylineParam<T>>features[0].get('param');
    param.positions = position;
    if (isArrows) {
      super.remove(id);
      this.addLineArrows(param);
    } else {
      features[0].set('param', param);
      features[0].getGeometry()?.setCoordinates(position);
    }
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
