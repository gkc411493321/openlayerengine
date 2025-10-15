import Base from './Base';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { useEarth } from '@/useEarth';
import Earth from '@/Earth';
import { IPolygonArrowParam } from '@/interface';

/**
 * 创建箭头`PolygonArrow`
 */
export default class PolygonArrowLayer<T = unknown> extends Base {
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

  /**
   * 创建箭头
   */
  add(param: IPolygonArrowParam<T>) {
    if (param.isShowTail === false) {
      // 只显示边框线
    } else {
      // 显示箭头和边框线
    }
  }
  /**
   * 修改箭头
   */
  set() {
    console.log('set arrow');
  }
  /**
   * 修改坐标
   */
  setPosition() {
    console.log('set position');
  }
  /**
   * 移除箭头
   */
  remove(): void;
  remove(id: string): void;
  remove(id?: string): void {
    if (id) {
      super.remove(id);
    } else {
      super.remove();
    }
  }
}
