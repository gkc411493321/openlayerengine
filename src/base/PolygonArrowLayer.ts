import { Polygon } from 'ol/geom';
import Base from './Base';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { useEarth } from '@/useEarth';
import Earth from '@/Earth';

/**
 * 创建箭头`PolygonArrow`
 */
export default class PolygonArrowLayer<T = Polygon> extends Base {
  /**
   * 构造器
   * @param earth 地图实例，可不传
   * @param options 图层参数
   * ```
   * const polygonArrowLayer = new PolygonArrowLayer();
   * ```
   */
  constructor(earth?: Earth, options?: { wrapX?: boolean }) {
    const layer = new VectorLayer({
      source: new VectorSource({
        wrapX: options?.wrapX !== undefined ? options.wrapX : true
      })
    });
    const e = earth ?? useEarth();
    super(e, layer, 'PolygonArrow');
  }
}
