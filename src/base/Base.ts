/* eslint-disable @typescript-eslint/no-explicit-any */
import Earth from '../Earth';
import { IFill, ILabel, IStroke, IBillboardParam, IPolylineParam, IPolylineFlyParam } from '../interface';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Stroke, Fill, Text } from 'ol/style';
import Icon from 'ol/style/Icon';
import { Utils } from '../common';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
// import BaseEvent from 'ol/events/Event';
/**
 * 基类，提供图层常见的获取，删除及更新方法
 */
export default class Base {
  /**
   * 注册key
   */
  public registryKey: string;
  /**
   * 销毁标记
   */
  public allowDestroyed: boolean = true;
  /**
   * 图层
   */
  public layer: VectorLayer<VectorSource<Geometry>>;
  /**
   * 缓存featur的集合
   */
  public hideFeatureMap: Map<string, Feature<Geometry>> = new Map();
  /**
   * 元素监听器
   */
  private featureListenerMap: Map<string, EventsKey> = new Map();
  /**
   * 图层构造类
   * @param earth 地图实例
   * @param layer 图层实例
   */
  constructor(protected earth: Earth, layer: VectorLayer<VectorSource<Geometry>>, type: string) {
    const layerId = Utils.GetGUID();
    this.registryKey = layerId;
    layer.set('type', type);
    layer.set('id', layerId);
    this.layer = layer;
    earth.map.addLayer(layer);
    // 可选自动注册封装层实例
    if (this.registryKey) {
      // 定义一个临时接口描述内部注册方法（不对外暴露）
      interface IRegisterableEarth {
        _autoRegisterLayer?: (key: string, layer: Base) => void;
      }
      const e = earth as unknown as IRegisterableEarth;
      if (typeof e._autoRegisterLayer === 'function') {
        e._autoRegisterLayer(this.registryKey, this);
      }
    }
  }
  /**
   * 设置描边样式
   * @param style style实例
   * @param param 描边参数，`可选的`。详见{@link IStroke}
   * @param width 宽度，`可选的`
   * @returns 返回style实例
   */
  protected setStroke(style: Style, param?: IStroke, width?: number): Style {
    const stroke = new Stroke(
      Object.assign(
        {
          color: param?.color || style.getStroke()?.getColor() || '#ffcc33',
          width: width || style.getStroke()?.getWidth() || 2,
          lineDash: param?.lineDash || style.getStroke()?.getLineDash()
        },
        param
      )
    );
    style.setStroke(stroke);
    return style;
  }
  /**
   * 设置填充样式
   * @param style style实例
   * @param param 填充参数，`可选的`。详见{@link IFill}
   * @returns 返回style实例
   */
  protected setFill(style: Style, param?: IFill): Style {
    const fill = new Fill(
      Object.assign(
        {
          color: param?.color || style.getFill()?.getColor() || '#ffffff57'
        },
        param
      )
    );
    style.setFill(fill);
    return style;
  }
  /**
   * 设置文本样式
   * @param style style实例
   * @param param 文本参数，`可选的`。详见{@link ILabel}
   * @param offsetY 纵向偏移量，`可选的`。
   * @returns 返回style实例
   */
  protected setText(style: Style, param?: ILabel, offsetY?: number): Style {
    const text = new Text({
      text: param?.text || style.getText()?.getText(),
      font: param?.font || style.getText()?.getFont(),
      offsetX: param?.offsetX || style.getText()?.getOffsetX(),
      offsetY: param?.offsetY || offsetY || style.getText()?.getOffsetY(),
      scale: param?.scale || style.getText()?.getScale(),
      textAlign: param?.textAlign || style.getText()?.getTextAlign(),
      textBaseline: param?.textBaseline || style.getText()?.getTextBaseline(),
      rotation: param?.rotation || style.getText()?.getRotation(),
      fill: new Fill({
        color: param?.fill?.color || style.getText()?.getFill().getColor()
      }),
      stroke: new Stroke({
        color: param?.stroke?.color || style.getText()?.getStroke().getColor() || '#0000',
        width: param?.stroke?.width || style.getText()?.getStroke().getWidth() || 0
      }),
      backgroundFill: new Fill({
        color: param?.backgroundFill?.color || style.getText()?.getBackgroundFill().getColor() || '#0000'
      }),
      backgroundStroke: new Stroke({
        color: param?.backgroundStroke?.color || style.getText()?.getBackgroundStroke().getColor() || '#0000',
        width: param?.backgroundStroke?.width || style.getText()?.getBackgroundStroke().getWidth() || 0
      }),
      padding: param?.padding || style.getText()?.getPadding() || undefined
    });
    style.setText(text);
    return style;
  }
  /**
   * 往图层添加一个矢量元素
   * @param feature 矢量元素实例
   * @returns 返回矢量元素实例
   */
  protected save(feature: Feature<Geometry>): Feature<Geometry> {
    feature.set('registryKey', this.registryKey);
    this.addFeaturelistener(feature);
    this.layer.getSource()?.addFeature(feature);
    return feature;
  }
  /**
   * 添加元素事件监听
   * @param feature 矢量元素实例
   */
  protected addFeaturelistener(feature: Feature<Geometry>): void {
    const featureChangeListener = feature.on('change', () => {
      if (feature.get('layerType') === 'Billboard') {
        // 如果是BillboardLayer，则根据{@link IBillboardParam}同步param参数
        this.updateBillboardParam(feature);
      } else if (feature.get('layerType') === 'Polyline') {
        // 如果是PolylineLayer，则根据{@link IPolylineParam}同步param参数
        this.updatePolylineParam(feature);
      } else if (feature.get('layerType') === 'Point') {
        // 如果是PointLayer，则根据{@link IPointParam}同步param参数
        this.updatePointParam(feature);
      }
    });
    this.featureListenerMap.set(feature.getId() as string, featureChangeListener);
  }
  /**
   * 更新Billboard图标参数
   */
  protected updateBillboardParam(feature: Feature<Geometry>): void {
    const param = feature.get('param') as IBillboardParam<unknown> | undefined;
    // 同步最新的几何与样式信息到 param
    if (param) {
      // 更新中心点
      const geometry = feature.getGeometry();
      // 仅在 Point 几何时同步中心
      if (geometry && geometry.getType && geometry.getType() === 'Point') {
        try {
          // 使用 (geometry as any) 以避免类型不兼容，但不直接访问未声明方法
          const pointGeom = geometry as import('ol/geom').Point;
          param.center = pointGeom.getCoordinates();
        } catch (_) {
          /* ignore */
        }
      }
      // 更新样式与图标属性
      const style = feature.getStyle() as Style | undefined;
      const icon = style?.getImage() as Icon | undefined;
      if (icon) {
        // 仅当有值时才覆盖，避免把 undefined 写回
        const src = icon.getSrc();
        if (src) param.src = src;
        const size = icon.getSize();
        if (size) param.size = size;
        const color = icon.getColor();
        if (typeof color === 'string') param.color = color;
        const displacement = icon.getDisplacement();
        if (Array.isArray(displacement)) param.displacement = displacement as number[];
        const scaleVal = icon.getScale();
        if (scaleVal) {
          param.scale = scaleVal;
        }
        const rotation = icon.getRotation();
        if (rotation != null) param.rotation = Utils.rad2deg(rotation);
        const anchor = (icon as any).anchor_; // 原始 anchor 数组;
        if (anchor && Array.isArray(anchor)) param.anchor = anchor as number[];
      }
      // 同步文本标签
      const text = style?.getText();
      if (text) {
        const plainText = (() => {
          const t = text.getText();
          if (Array.isArray(t)) return t.join('');
          return t || '';
        })();
        param.label = {
          text: plainText || param.label?.text || '',
          font: text.getFont() || param.label?.font,
          offsetX: text.getOffsetX() || param.label?.offsetX,
          offsetY: text.getOffsetY() || param.label?.offsetY,
          scale:
            (typeof text.getScale === 'function'
              ? Array.isArray(text.getScale())
                ? (text.getScale() as number[])[0]
                : (text.getScale() as number)
              : undefined) || param.label?.scale,
          textAlign: text.getTextAlign() || param.label?.textAlign,
          textBaseline: text.getTextBaseline() || param.label?.textBaseline,
          rotation: (typeof text.getRotation === 'function' ? text.getRotation() : undefined) || param.label?.rotation,
          fill: text.getFill() && typeof text.getFill().getColor === 'function' ? { color: text.getFill().getColor() as string } : param.label?.fill,
          stroke:
            text.getStroke() && typeof text.getStroke().getColor === 'function'
              ? {
                  color: text.getStroke().getColor() as string,
                  width: (typeof text.getStroke().getWidth === 'function' ? text.getStroke().getWidth() : undefined) || param.label?.stroke?.width
                }
              : param.label?.stroke,
          backgroundFill:
            text.getBackgroundFill() && typeof text.getBackgroundFill().getColor === 'function'
              ? { color: text.getBackgroundFill().getColor() as string }
              : param.label?.backgroundFill,
          backgroundStroke:
            text.getBackgroundStroke() && typeof text.getBackgroundStroke().getColor === 'function'
              ? {
                  color: text.getBackgroundStroke().getColor() as string,
                  width:
                    (typeof text.getBackgroundStroke().getWidth === 'function' ? text.getBackgroundStroke().getWidth() : undefined) ||
                    param.label?.backgroundStroke?.width
                }
              : param.label?.backgroundStroke,
          padding: text.getPadding() || param.label?.padding
        };
      }
      // 回写最新 param
      feature.set('param', param);
    }
  }
  /**
   * 更新Polyline参数(仅同步可推导的几何/样式字段)
   * @param feature Polyline要素
   */
  protected updatePolylineParam(feature: Feature<Geometry>): void {
    // 兼容普通 Polyline 与 飞行线 Polyline（IPolylineFlyParam 不继承 IPolylineParam，字段名称也不同: position vs positions）
  const param = feature.get('param') as (IPolylineParam<unknown> | IPolylineFlyParam<unknown>) | undefined;
    if (!param) return;
    const isNormalPolyline = (p: any): p is IPolylineParam<unknown> => 'positions' in p;
    const isFlyPolyline = (p: any): p is IPolylineFlyParam<unknown> => 'position' in p && !('positions' in p);
    const geometry = feature.getGeometry();
    if (geometry && geometry.getType && geometry.getType() === 'LineString') {
      try {
        const line = geometry as import('ol/geom').LineString;
        const coords = line.getCoordinates();
        if (isNormalPolyline(param)) param.positions = coords;
        if (isFlyPolyline(param)) param.position = coords as number[][];
      } catch (_) {
        /* ignore */
      }
    }
    // 同步样式: 仅在静态 Style 情况下（当 style 是函数时跳过，因为箭头/动态样式内部已同步 positions）
    const styleLike = feature.getStyle();
    let style: Style | undefined;
    if (styleLike instanceof Style) style = styleLike;
    else if (Array.isArray(styleLike) && styleLike.length && styleLike[0] instanceof Style) style = styleLike[0];
    // style 为函数 (StyleFunction) 时不处理，避免调用导致副作用或无法提供 resolution
    if (style && isNormalPolyline(param)) {
      const stroke = style.getStroke && style.getStroke();
      if (stroke && typeof stroke.getColor === 'function') {
        param.stroke = Object.assign({}, param.stroke, {
          color: stroke.getColor?.() || param.stroke?.color,
          width: stroke.getWidth?.() || param.stroke?.width,
          lineDash: stroke.getLineDash?.() || param.stroke?.lineDash,
          lineDashOffset: stroke.getLineDashOffset?.() || param.stroke?.lineDashOffset
        });
        if (param.stroke?.width && !param.width) {
          param.width = param.stroke.width;
        }
      }
      const fill = style.getFill && style.getFill();
      if (fill && typeof fill.getColor === 'function') {
        const fillColor = fill.getColor();
        if (fillColor) param.fill = { color: fillColor as string };
      }
      const text = style.getText && style.getText();
      if (text) {
        const plainText = (() => {
          const t = text.getText?.();
          if (Array.isArray(t)) return t.join('');
          return t || '';
        })();
        param.label = {
          text: plainText || param.label?.text || '',
          font: text.getFont?.() || param.label?.font,
          offsetX: text.getOffsetX?.() || param.label?.offsetX,
          offsetY: text.getOffsetY?.() || param.label?.offsetY,
          scale:
            (typeof text.getScale === 'function'
              ? Array.isArray(text.getScale())
                ? (text.getScale() as number[])[0]
                : (text.getScale() as number)
              : undefined) || param.label?.scale,
          textAlign: text.getTextAlign?.() || param.label?.textAlign,
          textBaseline: text.getTextBaseline?.() || param.label?.textBaseline,
          rotation: (typeof text.getRotation === 'function' ? text.getRotation() : undefined) || param.label?.rotation,
          fill: (() => {
            const f = text.getFill && text.getFill();
            if (f && typeof f.getColor === 'function') {
              const c = f.getColor();
              if (c) return { color: c as string };
            }
            return param.label?.fill;
          })(),
          stroke: (() => {
            const s = text.getStroke && text.getStroke();
            if (s && typeof s.getColor === 'function') {
              const c = s.getColor();
              const w = typeof s.getWidth === 'function' ? s.getWidth() : undefined;
              return { color: c as string, width: w || param.label?.stroke?.width };
            }
            return param.label?.stroke;
          })(),
          backgroundFill: (() => {
            const bf = text.getBackgroundFill && text.getBackgroundFill();
            if (bf && typeof bf.getColor === 'function') {
              const c = bf.getColor();
              if (c) return { color: c as string };
            }
            return param.label?.backgroundFill;
          })(),
          backgroundStroke: (() => {
            const bs = text.getBackgroundStroke && text.getBackgroundStroke();
            if (bs && typeof bs.getColor === 'function') {
              const c = bs.getColor();
              const w = typeof bs.getWidth === 'function' ? bs.getWidth() : undefined;
              return { color: c as string, width: w || param.label?.backgroundStroke?.width };
            }
            return param.label?.backgroundStroke;
          })(),
          padding: text.getPadding?.() || param.label?.padding
        };
      }
    }
    feature.set('param', param);
  }
  /**
   * 更新Point参数(仅同步可推导的几何/样式字段)
   * @param feature Point要素
   */
  protected updatePointParam(feature: Feature<Geometry>): void {
    const param = feature.get('param') as any; // IPointParam<unknown> | undefined
    if (!param) return;
    // 同步几何中心
    const geometry = feature.getGeometry();
    if (geometry && geometry.getType && geometry.getType() === 'Point') {
      try {
        const point = geometry as import('ol/geom').Point;
        param.center = point.getCoordinates();
      } catch (_) {
        /* ignore */
      }
    }
    // 样式同步（仅静态 style）
    const styleLike = feature.getStyle();
    let style: Style | undefined;
    if (styleLike instanceof Style) style = styleLike;
    else if (Array.isArray(styleLike) && styleLike.length && styleLike[0] instanceof Style) style = styleLike[0];
    if (style) {
      const image: any = style.getImage && style.getImage();
      if (image) {
        // 半径 -> size
        if (typeof image.getRadius === 'function') {
          const r = image.getRadius();
            if (r != null) param.size = r;
        }
        // stroke
        const stroke = image.getStroke && image.getStroke();
        if (stroke && typeof stroke.getColor === 'function') {
          param.stroke = Object.assign({}, param.stroke, {
            color: stroke.getColor?.() || param.stroke?.color,
            width: stroke.getWidth?.() || param.stroke?.width,
            lineDash: stroke.getLineDash?.() || param.stroke?.lineDash,
            lineDashOffset: stroke.getLineDashOffset?.() || param.stroke?.lineDashOffset
          });
        }
        // fill
        const fill = image.getFill && image.getFill();
        if (fill && typeof fill.getColor === 'function') {
          const fillColor = fill.getColor();
          if (fillColor) param.fill = { color: fillColor as string };
        }
      }
      // label 同步
      const text = style.getText && style.getText();
      if (text) {
        const plainText = (() => {
          const t = text.getText?.();
          if (Array.isArray(t)) return t.join('');
          return t || '';
        })();
        param.label = {
          text: plainText || param.label?.text || '',
          font: text.getFont?.() || param.label?.font,
          offsetX: text.getOffsetX?.() || param.label?.offsetX,
          offsetY: text.getOffsetY?.() || param.label?.offsetY,
          scale:
            (typeof text.getScale === 'function'
              ? Array.isArray(text.getScale())
                ? (text.getScale() as number[])[0]
                : (text.getScale() as number)
              : undefined) || param.label?.scale,
          textAlign: text.getTextAlign?.() || param.label?.textAlign,
          textBaseline: text.getTextBaseline?.() || param.label?.textBaseline,
          rotation: (typeof text.getRotation === 'function' ? text.getRotation() : undefined) || param.label?.rotation,
          fill: (() => {
            const f = text.getFill && text.getFill();
            if (f && typeof f.getColor === 'function') {
              const c = f.getColor();
              if (c) return { color: c as string };
            }
            return param.label?.fill;
          })(),
          stroke: (() => {
            const s = text.getStroke && text.getStroke();
            if (s && typeof s.getColor === 'function') {
              const c = s.getColor();
              const w = typeof s.getWidth === 'function' ? s.getWidth() : undefined;
              return { color: c as string, width: w || param.label?.stroke?.width };
            }
            return param.label?.stroke;
          })(),
          backgroundFill: (() => {
            const bf = text.getBackgroundFill && text.getBackgroundFill();
            if (bf && typeof bf.getColor === 'function') {
              const c = bf.getColor();
              if (c) return { color: c as string };
            }
            return param.label?.backgroundFill;
          })(),
          backgroundStroke: (() => {
            const bs = text.getBackgroundStroke && text.getBackgroundStroke();
            if (bs && typeof bs.getColor === 'function') {
              const c = bs.getColor();
              const w = typeof bs.getWidth === 'function' ? bs.getWidth() : undefined;
              return { color: c as string, width: w || param.label?.backgroundStroke?.width };
            }
            return param.label?.backgroundStroke;
          })(),
          padding: text.getPadding?.() || param.label?.padding
        };
      }
    }
    feature.set('param', param);
  }
  /**
   * 删除图层所有矢量元素
   * @example
   * ```
   * layer.remove();
   * ```
   */
  remove(): void;
  /**
   * 删除图层指定矢量元素元素
   * @param id 矢量元素id
   * @example
   * ```
   * layer.remove("1");
   * ```
   */
  remove(id: string): void;
  remove(id?: string): void {
    if (id) {
      this.layer.getSource()?.removeFeature(this.get(id)[0]);
      const listener = this.featureListenerMap.get(id);
      if (listener) {
        unByKey(listener);
        this.featureListenerMap.delete(id);
      }
    } else {
      this.layer.getSource()?.clear();
      this.featureListenerMap.forEach((listener) => {
        unByKey(listener);
      });
      this.featureListenerMap.clear();
    }
  }
  /**
   * 获取图层中所有矢量元素
   * @returns 返回矢量元素数组
   * @example
   * ```
   * const features:Feature<Geometry>[] = layer.get();
   * ```
   */
  get(): Feature<Geometry>[];
  /**
   * 获取图层中指定矢量元素
   * @param id 矢量元素id
   * @returns 返回矢量元素数组
   * @example
   * ```
   * const features:Feature<Geometry>[] = layer.get("1");
   * ```
   */
  get(id: string): Feature<Geometry>[];
  get(id?: string): Feature<Geometry>[] {
    let features: Feature<Geometry>[] = [];
    if (id) {
      const feature = this.layer.getSource()?.getFeatureById(id);
      if (feature) features.push(feature);
    } else {
      const feature = this.layer.getSource()?.getFeatures();
      if (feature) features = feature;
    }
    return features;
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
  hide(id?: string): void {
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
  show(id?: string): void {
    if (id) {
      const feature = this.hideFeatureMap.get(id);
      if (feature) this.save(feature);
      this.hideFeatureMap.delete(id);
    } else {
      this.hideFeatureMap.clear();
      this.layer.setVisible(true);
    }
  }
  /**
   * 设置图层`z-index`等级
   * @param index 等级
   * @example
   * ```
   * layer.setLayerIndex(999)
   * ```
   */
  setLayerIndex(index: number): void {
    this.layer.setZIndex(index);
  }
  /**
   * 获取图层
   */
  getLayer(): VectorLayer<VectorSource<Geometry>> {
    return this.layer;
  }
  /**
   * 销毁图层，同时销毁该图层所有元素，不可恢复
   * @returns 返回boolean值
   * @example
   * ```
   * const flag:boolean = layer.destroy();
   * ```
   */
  destroy(): boolean {
    if (this.allowDestroyed) {
      const flag = this.earth.removeLayer(this.layer);
      if (flag) {
        this.earth.removeRegisteredLayer(this.registryKey);
        return true;
      } else {
        return false;
      }
    } else {
      console.warn('该图层受到保护，无法被销毁');
      return false;
    }
  }
}
