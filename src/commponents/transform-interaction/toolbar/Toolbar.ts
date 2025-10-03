import { useEarth } from '../../../useEarth';
import { OverlayLayer } from '../../../base';
import { EventsKey } from 'ol/events';

interface IToolbarOptions {
  point: number[];
  type: 'Point' | 'LineString' | 'Polygon';
}
class Toolbar {
  /**
   * 提示牌
   */
  private overlay: OverlayLayer<unknown>;
  /**
   * 提示覆盖物监听器key
   */
  private overlayKey: EventsKey | EventsKey[] | undefined = undefined;
  /**
   * Tooltip DOM 元素（复用避免内存泄漏）
   */
  private helpTooltipEl: HTMLDivElement | null = null;
  /**
   * 工具栏参数
   */
  private options: IToolbarOptions;

  constructor(options: IToolbarOptions) {
    this.options = options;
    this.overlay = new OverlayLayer(useEarth());
    this.createOverlay();
  }
  /**
   * 创建提示牌
   */
  private createOverlay() {
    if (typeof document === 'undefined') return; // SSR 安全
    if (!this.helpTooltipEl) {
      this.helpTooltipEl = document.createElement('div');
      this.helpTooltipEl.className = 'ol-tooltip';
      document.body.appendChild(this.helpTooltipEl);
    }
    this.helpTooltipEl.textContent = '====================================================================';
    if (!this.overlayKey) {
      this.overlay.add({
        id: 'toolbar',
        position: this.options.point,
        element: this.helpTooltipEl,
        offset: [15, -10]
      });
    }
  }
}
export { Toolbar, IToolbarOptions };
