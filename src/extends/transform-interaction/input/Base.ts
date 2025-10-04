import BaseObject from 'ol/Object'

/**
 * 基础输入控件抽象类（不要直接实例化，供其他输入控件继承）。
 * 支持：color / size / width / font / symbol / dash / arrow / pattern 等地理样式相关输入。
 */
export interface InputBaseOptions {
  /** 现有的原生 input 元素（不传则内部创建） */
  input?: HTMLInputElement
  /** 创建 input 时使用的 type */
  type?: string
  /** 最小值（仅当内部创建 input 时生效） */
  min?: number
  /** 最大值（仅当内部创建 input 时生效） */
  max?: number
  /** 步长（仅当内部创建 input 时生效） */
  step?: number
  /** 初始值 */
  val?: string | number
  /** 初始是否勾选（对 checkbox / radio 等） */
  checked?: boolean
  /** 是否隐藏：添加 class 'ol-input-hidden' */
  hidden?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 若需要自动插入到某父节点，提供 parent */
  parent?: Element
}

/**
 * 基础输入控件类。
 * 负责：
 * 1. 创建或接管一个 input 元素。
 * 2. 处理基本属性（min/max/step/value/checked/disabled/hidden）。
 * 3. 聚焦 / 失焦时为外部包装元素添加 / 移除状态 class（ol-focus）。
 * 4. 提供拖拽监听工具方法 _listenDrag（子类可调用）。
 */
class OlExtInputBase extends BaseObject {
  /** 内部持有的原生 input 元素 */
  protected input: HTMLInputElement
  /** 外层容器（由子类通常设置），用于添加状态 class */
  public element?: HTMLElement
  /** 是否处于拖拽移动状态 */
  protected moving = false

  constructor(options: InputBaseOptions = {}) {
    super()

    let input = options.input
    if (!input) {
      input = document.createElement('input')
      if (options.type) input.setAttribute('type', options.type)
      if (options.min !== undefined) input.setAttribute('min', String(options.min))
      if (options.max !== undefined) input.setAttribute('max', String(options.max))
      if (options.step !== undefined) input.setAttribute('step', String(options.step))
      if (options.parent) options.parent.appendChild(input)
    }

    if (options.disabled) input.disabled = true
    if (options.checked !== undefined) input.checked = !!options.checked
    if (options.val !== undefined) input.value = String(options.val)
    if (options.hidden) input.classList.add('ol-input-hidden')

    this.input = input

    // 聚焦状态
    input.addEventListener('focus', () => {
      if (this.element) this.element.classList.add('ol-focus')
    })

    // 失焦后移除状态（使用 setTimeout 确保与其它事件顺序）
    let tout: number | undefined
    input.addEventListener('focusout', () => {
      if (this.element) {
        if (tout) window.clearTimeout(tout)
        tout = window.setTimeout(() => {
          this.element && this.element.classList.remove('ol-focus')
        }, 0)
      }
    })
  }

  /**
   * 监听拖拽（pointer）事件，子类可调用。
   * 仅当事件 target === 绑定的元素时才触发回调。
   * @param elt 需要绑定拖拽的元素
   * @param cback 拖拽过程中回调
   * @internal
   */
  protected _listenDrag(elt: Element, cback: (e: PointerEvent) => void): void {
    const handle = (e: Event) => {
      this.moving = true
      this.element?.classList.add('ol-moving')

  const listen = (ev: PointerEvent) => {
        if (ev.type === 'pointerup') {
          document.removeEventListener('pointermove', listen)
          document.removeEventListener('pointerup', listen)
          document.removeEventListener('pointercancel', listen)
          setTimeout(() => {
            this.moving = false
            this.element?.classList.remove('ol-moving')
          })
        }
        if (ev.target === elt) cback(ev)
        ev.stopPropagation()
        ev.preventDefault()
      }

      document.addEventListener('pointermove', listen, false)
      document.addEventListener('pointerup', listen, false)
      document.addEventListener('pointercancel', listen, false)
      e.stopPropagation()
      e.preventDefault()
    }
  elt.addEventListener('mousedown', handle as EventListener, false)
  elt.addEventListener('touchstart', handle as EventListener, false)
  }

  /** 设置当前值（并触发 change 事件） */
  public setValue(v: string | number | undefined): void {
    if (v !== undefined) this.input.value = String(v)
    this.input.dispatchEvent(new Event('change'))
  }

  /** 获取当前值 */
  public getValue(): string {
    return this.input.value
  }

  /** 获取内部原生 input 元素 */
  public getInputElement(): HTMLInputElement {
    return this.input
  }
}

export default OlExtInputBase
