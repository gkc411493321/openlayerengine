import { useEarth } from '../../useEarth';
import { OverlayLayer } from '../../base';
import saveSvg from '../../assets/image/toolbar-save.svg?raw';
import undoSvg from '../../assets/image/toolbar-undo.svg?raw';
import redoSvg from '../../assets/image/toolbar-redo.svg?raw';
import copySvg from '../../assets/image/toolbar-copy.svg?raw';
import editSvg from '../../assets/image/toolbar-edit.svg?raw';
import removeSvg from '../../assets/image/toolbar-remove.svg?raw';

interface IToolbarOptions {
  point: number[];
  type: 'Point' | 'LineString' | 'Polygon' | 'Circle';
}

// 单个工具条按钮配置
interface IToolbarItem {
  key: string; // 唯一标识 (data-type)
  title: string; // 提示文字
  icon: string;
  iconClass?: string; // 额外图标 class
  visible?: boolean; // 是否显示
  disabled?: boolean; // 是否禁用
  active?: boolean; // 是否激活状态
}

class Toolbar {
  /**
   * 提示牌
   */
  private overlay: OverlayLayer<unknown>;
  /**
   * 工具栏参数
   */
  private options: IToolbarOptions;

  /** 根元素 */
  private rootEl: HTMLDivElement | null = null;

  /** 按钮集合（可根据 geometry type 动态裁剪） */
  private items: IToolbarItem[] = [];

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
    // 初始化按钮配置（可提取到单独方法）
    this.initItems();
    if (!this.rootEl) {
      this.rootEl = document.createElement('div');
      this.rootEl.className = 'ol-toolbar';
      this.render();
      this.bindEvents();
      this.overlay.add({
        id: 'toolbar',
        position: this.options.point,
        element: this.rootEl,
        offset: [15, 0]
      });
    } else {
      this.render();
    }
  }

  /**
   * 根据 geometry type 初始化可用按钮
   */
  private initItems() {
    console.log(this.options.type);
    // 基础按钮集合
    const base: IToolbarItem[] = [
      { key: 'exit', title: '确认', iconClass: 'ol-toolbar-exit', icon: saveSvg, visible: true, disabled: false, active: false },
      { key: 'undo', title: '撤销 Ctrl+Z', iconClass: 'ol-toolbar-undo', icon: undoSvg, visible: true, disabled: true, active: false },
      { key: 'redo', title: '重做 Ctrl+Y', iconClass: 'ol-toolbar-redo', icon: redoSvg, visible: true, disabled: true, active: false },
      { key: 'copy', title: '复制 Ctrl+C', iconClass: 'ol-toolbar-edit', icon: copySvg, visible: true, disabled: false, active: false },
      { key: 'edit', title: '编辑', iconClass: 'ol-toolbar-edit', icon: editSvg, visible: true, disabled: false, active: false },
      { key: 'remove', title: '删除', iconClass: 'ol-toolbar-remove', icon: removeSvg, visible: true, disabled: false, active: false }
    ];
    if (this.options.type === 'Point' || this.options.type === 'Circle') {
      base[4].visible = false; // 编辑
    }
    this.items = base;
  }

  /**
   * 生成模板字符串
   */
  private template(items: IToolbarItem[]) {
    return items
      .filter((i) => i.visible !== false)
      .map((i) => {
        const cls = ['ol-toolbar-item', i.iconClass, i.active ? 'is-active' : '', i.disabled ? 'is-disabled' : ''].filter(Boolean).join(' ');
        return `<div class="${cls}" data-type="${i.key}" ${i.disabled ? 'aria-disabled="true"' : ''}>${this.wrapSvg(i.icon, i.title)}</div>`;
      })
      .join('');
  }

  /** 包装 svg，确保可控性（可加 aria-label / role） */
  private wrapSvg(raw: string, title: string) {
    // 给最外层 svg 注入统一 class 方便样式控制
    // 简单替换第一个 <svg ...>
    return raw.replace('<svg', `<svg class="ol-toolbar-icon" aria-label="${title}" role="img" focusable="false"`);
  }

  /** 渲染（首渲染或更新） */
  private render() {
    if (!this.rootEl) return;
    this.rootEl.innerHTML = this.template(this.items);
  }

  /** 事件绑定（事件委托方式） */
  private bindEvents() {
    if (!this.rootEl) return;
    // click 事件
    this.rootEl.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.ol-toolbar-item') as HTMLElement | null;
      if (!target) return;
      const type = target.dataset.type;
      if (!type) return;
      const item = this.items.find((i) => i.key === type);
      if (!item || item.disabled) return;
      // 可在此派发一个通用点击事件
      this.dispatchCustomEvent('toolbar:itemclick', { key: type, item, pixel: [e.screenX, e.screenY] });
    });

    // mouseenter（使用 mouseover + relatedTarget 组合实现委托）
    this.rootEl.addEventListener('mouseover', (e) => {
      const target = (e.target as HTMLElement).closest('.ol-toolbar-item') as HTMLElement | null;
      if (!target || !this.rootEl || !this.rootEl.contains(target)) return;
      const rel = (e as MouseEvent).relatedTarget as HTMLElement | null;
      // 如果来自同一个按钮内部（例如 img）不触发
      if (rel && target.contains(rel)) return;
      const type = target.dataset.type;
      if (!type) return;
      const item = this.items.find((i) => i.key === type);
      if (!item) return;
      this.dispatchCustomEvent('toolbar:itementer', { key: type, item });
    });

    // mouseleave（使用 mouseout + relatedTarget 组合实现委托）
    this.rootEl.addEventListener('mouseout', (e) => {
      const target = (e.target as HTMLElement).closest('.ol-toolbar-item') as HTMLElement | null;
      if (!target || !this.rootEl || !this.rootEl.contains(target)) return;
      const rel = (e as MouseEvent).relatedTarget as HTMLElement | null;
      // 仍在本按钮内部则不算离开
      if (rel && target.contains(rel)) return;
      const type = target.dataset.type;
      if (!type) return;
      const item = this.items.find((i) => i.key === type);
      if (!item) return;
      this.dispatchCustomEvent('toolbar:itemleave', { key: type, item });
    });
  }

  /** 派发自定义事件，方便外部监听 */
  private dispatchCustomEvent(name: string, detail: unknown) {
    if (!this.rootEl) return;
    const evt = new CustomEvent(name, { detail });
    this.rootEl.dispatchEvent(evt);
  }

  /** 设置激活按钮（单选示例） */
  public setActive(key: string) {
    let changed = false;
    this.items.forEach((i) => {
      const next = i.key === key;
      if (i.active !== next) {
        i.active = next;
        changed = true;
      }
    });
    if (changed) this.render();
  }

  /** 更新按钮属性 */
  public updateItem(key: string, patch: Partial<IToolbarItem>) {
    const item = this.items.find((i) => i.key === key);
    if (!item) return;
    Object.assign(item, patch);
    this.render();
  }

  /** 更新位置或类型等（外部可调用） */
  public updateOptions(patch: Partial<IToolbarOptions>) {
    this.options = { ...this.options, ...patch } as IToolbarOptions;
    if (patch.type) {
      this.initItems();
    }
    // 位置更新
    if (patch.point) {
      // 使用已有 OverlayLayer.setPosition 方法
      try {
        this.overlay.setPosition('toolbar', patch.point);
      } catch (e) {
        // 如果首次未创建成功，兜底重新添加
        if (this.rootEl) {
          this.overlay.add({
            id: 'toolbar',
            position: patch.point,
            element: this.rootEl,
            offset: [15, -10]
          });
        }
      }
    }
    this.render();
  }
  /**
   * 销毁
   */
  public destroy() {
    if (this.rootEl) {
      this.rootEl.remove();
      this.rootEl = null;
    }
    this.overlay.remove('toolbar');
  }
}
export { Toolbar, IToolbarOptions, IToolbarItem };
