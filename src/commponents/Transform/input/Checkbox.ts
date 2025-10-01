import OlExtInputBase from './Base'

/**
 * 复选框输入组件。
 * 主要职责：
 * 1. 基于基础输入封装，创建一个带标签(label)与样式的复选框。
 * 2. 支持传入自定义 label 内容（元素或 HTML 字符串）以及尾部追加文本。
 * 3. 在值变化时派发 'check' 事件，事件包含 { checked, value }。
 *
 * 使用示例：
 * const checkbox = new Checkbox({ html: '显示网格', after: '(可选)' })
 * checkbox.on('check', e => console.log(e.checked))
 */
export interface CheckboxOptions {
  /** 额外添加到外层标签的 class */
  className?: string
  /** 标签内部内容，可以是一个已经存在的元素或 HTML 字符串 */
  html?: Element | string
  /** 标签后面追加的纯文本 */
  after?: string
  /** 复用已有的 input 元素（若不提供则内部创建 type=checkbox） */
  input?: HTMLInputElement
  /** 若需要自动插入到某父节点，可提供父节点 */
  parent?: Element
  /** 初始是否自动关闭（保留参数占位，与原实现一致，暂未使用） */
  autoClose?: boolean
  /** 初始是否可见（保留参数占位，与原实现一致，暂未使用） */
  visible?: boolean
}

class OlExtInputCheckbox extends OlExtInputBase {
  /** 外层 label 元素（复写基类的 element 类型） */
  public element: HTMLLabelElement

  constructor(options: CheckboxOptions = {}) {
    super({
      input: options.input || undefined,
      type: 'checkbox',
      parent: options.parent
    })

    // 创建 label 作为容器
    const label = (this.element = document.createElement('label'))

    // 处理 label 内部内容
    if (options.html instanceof Element) {
      label.appendChild(options.html)
    } else if (options.html !== undefined) {
      label.innerHTML = options.html
    }

    // 组合 class
    label.className = (
      'ol-ext-check ol-ext-checkbox ' + (options.className || '')
    ).trim()

    // 若 input 已经存在于 DOM 内，插入 label 到其前面，再把 input 移入 label
    const existingParent = this.getInputElement().parentNode
    if (existingParent) {
      existingParent.insertBefore(label, this.getInputElement())
    }

    // 将 input 放入 label
    label.appendChild(this.getInputElement())

    // 添加一个空 span（用于自定义样式中的伪元素或勾选样式占位）
    label.appendChild(document.createElement('span'))

    // 若有 after 文本，追加到末尾
    if (options.after) {
      label.appendChild(document.createTextNode(options.after))
    }

    // 监听 change，向外派发自定义事件
    this.getInputElement().addEventListener('change', () => {
      // 使用 OpenLayers BaseObject 的属性机制触发事件：会派发 'change:checked' 与 'change:value'
      this.set('checked', this.isChecked())
      this.set('value', this.getInputElement().value)
    })
  }

  /** 当前是否勾选 */
  public isChecked(): boolean {
    return this.getInputElement().checked
  }
}

export default OlExtInputCheckbox
