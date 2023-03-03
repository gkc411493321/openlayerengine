/*
 * @Description: 点操作
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-27 15:33:02
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-03-03 12:37:46
 */
import Earth from "../Earth";
import { IPointParam } from "../interface";
import { Feature } from "ol";
import { Geometry, Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Base from "./Base";
import { Circle, Fill, Stroke, Style } from 'ol/style.js';
import { Utils } from "../common";
import { easeOut } from 'ol/easing.js';
import RenderEvent from "ol/render/Event";
import { unByKey } from "ol/Observable";
import { getVectorContext } from "ol/render";
import CircleStyle from "ol/style/Circle";
import { Coordinate } from "ol/coordinate";


export default class PointLayer<T = unknown> extends Base {
  constructor(earth: Earth) {
    const layer = new VectorLayer({
      source: new VectorSource()
    })
    super(earth, layer)
  }
  private createFeature(param: IPointParam<T>): Feature<Point> {
    const feature = new Feature({
      geometry: new Point(param.center)
    })
    let style = new Style();
    style.setImage(new Circle({
      radius: param.size || 4,
      stroke: new Stroke(Object.assign({
        color: param.fill?.color || 'red',
      }, param.stroke)),
      fill: new Fill(Object.assign({
        color: 'red',
      }, param.fill)),
    }))
    style = super.setText(style, param.label, -15);
    feature.setStyle(style)
    feature.setId(param.id);
    feature.set("data", param.data);
    feature.set("module", param.module)
    return feature
  }
  private flash(feature: Feature<Geometry>, param: IPointParam<T>) {
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
      const listenerKey = this.layer.on('postrender', (event: RenderEvent) => {
        const frameState = event.frameState;
        if (frameState) {
          let elapsed = frameState.time - start;
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
          vectorContext.setStyle(style);
          vectorContext.drawGeometry(flashGeom);
          this.layer.changed();
        }
      });
      feature.set("listenerKey", listenerKey);
    }
  }
  /**
   * @description: 增加一个点
   * @param {IPointParam} param 详细参数 
   * @return {*} Feature
   * @author: wuyue.nan
   */
  add(param: IPointParam<T>): Feature<Point> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    if (param.isFlash) {
      feature.set("param", param);
      this.flash(feature, param)
    }
    return <Feature<Point>>super.save(feature);
  }
  /**
   * @description: 停止所有点闪烁状态
   * @return {*} void
   * @author: wuyue.nan
   */
  stopFlash(): void;
  /**
   * @description: 根据ID停止点闪烁
   * @param {string} id id
   * @return {*} void
   * @author: wuyue.nan
   */
  stopFlash(id: string): void;
  /**
   * @description: 停止点闪烁
   * @param {string} id id
   * @return {*} void
   * @author: wuyue.nan
   */
  stopFlash(id?: string): void {
    if (id) {
      const features = <Feature<Point>[]>super.get(id);
      const listenerKey = features[0].get("listenerKey");
      if (listenerKey) {
        unByKey(listenerKey);
        features[0].set("listenerKey", null);
      }
    } else {
      const features = <Feature<Point>[]>super.get();
      for (const item of features) {
        const listenerKey = item.get("listenerKey");
        if (listenerKey) {
          unByKey(listenerKey);
          item.set("listenerKey", null);
        }
      }
    }
  }
  /**
   * @description: 所有点重新闪烁
   * @return {*} void
   * @author: wuyue.nan
   */
  continueFlash(): void;
  /**
   * @description: 根据id重新闪烁点
   * @param {string} id id
   * @return {*} void
   * @author: wuyue.nan
   */
  continueFlash(id: string): void;
  /**
   * @description: 点重新闪烁
   * @param {string} id id
   * @return {*} void
   * @author: wuyue.nan
   */
  continueFlash(id?: string): void {
    let features: Feature<Point>[] = [];
    if (id) {
      features = <Feature<Point>[]>super.get(id);
    } else {
      features = <Feature<Point>[]>super.get();
    }
    for (const item of features) {
      const param = item.get("param");
      if (param) this.flash(item, param)
    }
  }
  /**
   * @description: 修改点坐标
   * @param {string} id ID
   * @param {Coordinate} position 坐标
   * @return {*} Feature<Point>[]
   * @author: wuyue.nan
   */
  setPosition(id: string, position: Coordinate): Feature<Point>[] {
    const features = <Feature<Point>[]>super.get(id);
    features[0].getGeometry()?.setCoordinates(position);
    const listenerKey = features[0].get("listenerKey");
    const param = features[0].get("param");
    if (listenerKey) {
      unByKey(listenerKey);
      this.flash(features[0], param);
    }
    return features;
  }
}


