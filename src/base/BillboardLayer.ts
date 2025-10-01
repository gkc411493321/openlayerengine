import Earth from 'Earth';
import { IBillboardParam, ISetBillboardParam } from '../interface';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Icon, Style } from 'ol/style';
import Base from './Base';
import { Utils } from '../common';
import { Coordinate } from 'ol/coordinate';
import { useEarth } from '../useEarth';
import { Feature } from 'ol';


/**
 * 创建广告牌`Billboard`
 */
export default class BillboardLayer<T = unknown> extends Base {
  /**
   * 构造器
   * @param earth 地图实例
   * @example
   * ```
   * const billboardLayer = new  BillboardLayer(useEarth());
   * ```
   */
  constructor(earth: Earth) {
    const layer = new VectorLayer({
      source: new VectorSource()
    });
    super(earth, layer, 'Billboard');
  }
  /**
   * 创建矢量元素
   * @param param 广告牌详细参数，详见{@link IBillboardParam}
   * @returns 返回`Feature<Point>`矢量元素
   */
  private createFeature(param: IBillboardParam<T>): Feature<Point> {
    const feature = new Feature({
      geometry: new Point(param.center)
    });
    const icon = new Icon({
      src: param.src,
      size: param.size,
      color: param.color,
      displacement: param.displacement,
      scale: param.scale,
      rotation: Utils.deg2rad(param.rotation || 0),
      anchor: param.anchor,
      anchorOrigin: param.anchorOrigin,
      anchorXUnits: param.anchorXUnits,
      anchorYUnits: param.anchorYUnits
    });
    let style = new Style();
    style = super.setText(style, param.label);
    style.setImage(icon);
    feature.setStyle(style);
    feature.setId(param.id);
    feature.set('data', param.data);
    feature.set('module', param.module);
    feature.set('layerId', this.layer.get('id'));
    return feature;
  }
  /**
   * 创建广告牌`Billboard`
   * @param param 广告牌详细参数，详见{@link IBillboardParam}
   * @returns 返回`Feature<Point>`矢量元素
   * @example
   * ```
   * const billboardLayer = new  BillboardLayer(useEarth());
   * billboardLayer.add({
   *  // ...
   * })
   * ```
   */
  add(param: IBillboardParam<T>): Feature<Point> {
    param.id = param.id || Utils.GetGUID();
    const feature = this.createFeature(param);
    return <Feature<Point>>super.save(feature);
  }
  /**
   * 修改广告牌`Billboard`
   * @param param 广告牌详细参数，详见{@link ISetBillboardParam}
   * @returns 返回修改后的`Feature<Point>`矢量元素
   * @example
   * ```
   * const billboardLayer = new  BillboardLayer(useEarth());
   * billboardLayer.set({
   *  // ...
   * })
   * ```
   */
  set(param: ISetBillboardParam): Feature<Point>[] {
    const features = <Feature<Point>[]>super.get(param.id);
    if (param.center) {
      this.setPosition(param.id, param.center);
    }
    if (features[0] == undefined) {
      console.warn('没有找到元素，请检查ID');
      return [];
    }
    const style = <Style>features[0].getStyle();
    const oldIcon = <Icon>style.getImage();
    const iconOptions: { [key: string]: any } = {
      src: param.src || oldIcon.getSrc(),
      size: param.size || oldIcon.getSize(),
      color: param.color || oldIcon.getColor(),
      displacement: param.displacement || oldIcon.getDisplacement(),
      scale: param.scale || oldIcon.getScale(),
      rotation: Utils.deg2rad(param.rotation || 0) || oldIcon.getRotation(),
      anchor: param.anchor || oldIcon.getAnchor()
    };
    for (const key in iconOptions) {
      if (iconOptions[key] == null) {
        delete iconOptions[key];
      }
    }
    const newIcon = new Icon(iconOptions);
    const newStyle = super.setText(style, param.label);
    style.setImage(newIcon);
    features[0].setStyle(newStyle);
    return features;
  }
  /**
   * 修改广告牌坐标位置
   * @param id 广告牌ID
   * @param position 位置信息
   * @returns 返回修改后的`Feature<Point>`矢量元素
   * @example
   * ```
   * const billboardLayer = new  BillboardLayer(useEarth());
   * billboardLayer.setPosition("billboard_1", fromLonLat([160, 60]));
   * ```
   */
  setPosition(id: string, position: Coordinate): Feature<Point>[] {
    const features = <Feature<Point>[]>super.get(id);
    if (features[0] == undefined) {
      console.warn('没有找到元素，请检查ID');
      return [];
    }
    const geometry = <Point>features[0].getGeometry();
    geometry.setCoordinates(position);
    return features;
  }
  /**
   * 计算广告牌(Point)图标在地图上的经纬度范围
   * @param feature 广告牌要素
   * @returns [minLon, minLat, maxLon, maxLat]
   */
  getIconExtent(feature: Feature<Point>): [number, number, number, number] | null {
    const map = useEarth().map;
    const style = feature.getStyle() as Style;
    const icon = style.getImage() as Icon;
    if (!icon || !icon.getSize()) return null;

    const center = (feature.getGeometry() as Point).getCoordinates();
    const size = icon.getSize()!;
    const scale: any = Array.isArray(icon.getScale()) ? icon.getScale() : [icon.getScale() || 1, icon.getScale() || 1];
    const anchor = icon.getAnchor() || [0, 0];
    const displacement = icon.getDisplacement() || [0, 0];

    // 计算像素四角相对中心的偏移
    const w = size[0] * scale[0];
    const h = size[1] * scale[1];
    const anchorPx = [anchor[0], anchor[1]];
    // 以左上为(0,0)，anchor为图标锚点像素
    const offsets = [
      [-anchorPx[0], -anchorPx[1]], // 左上
      [w - anchorPx[0], -anchorPx[1]], // 右上
      [w - anchorPx[0], h - anchorPx[1]], // 右下
      [-anchorPx[0], h - anchorPx[1]] // 左下
    ].map(([dx, dy]) => [dx + displacement[0], dy + displacement[1]]);

    // 中心点转像素
    const centerPx = map.getPixelFromCoordinate(center);

    // 四角像素转经纬度
    const corners = offsets.map(([dx, dy]) => {
      const px = [centerPx[0] + dx, centerPx[1] + dy];
      return map.getCoordinateFromPixel(px);
    });

    // 计算经纬度范围
    const lons = corners.map((c) => c[0]);
    const lats = corners.map((c) => c[1]);
    return [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)];
  }
}
