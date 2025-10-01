import Checkbox, { CheckboxOptions } from './Checkbox'

/**
 * 单选框输入组件。
 * 在样式及结构上复用复选框组件，仅调整外层样式类名为单选风格。
 */
export interface RadioOptions extends Omit<CheckboxOptions, 'after'> {
  /** 额外 class */
  className?: string
}

class OlExtInputRadio extends Checkbox {
  constructor(options: RadioOptions = {}) {
    super(options)
    this.element.className = (
      'ol-ext-check ol-ext-radio ' + (options.className || '')
    ).trim()
  }
}

export default OlExtInputRadio
