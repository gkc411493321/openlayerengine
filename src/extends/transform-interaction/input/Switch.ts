import Checkbox, { CheckboxOptions } from './Checkbox'

/**
 * 开关（Switch）输入组件。
 * 复用复选框逻辑，仅修改样式类。
 */
export interface SwitchOptions extends CheckboxOptions {
  className?: string
}

class OlExtInputSwitch extends Checkbox {
  constructor(options: SwitchOptions = {}) {
    super(options)
    this.element.className = (
      'ol-ext-toggle-switch ' + (options.className || '')
    ).trim()
  }
}

export default OlExtInputSwitch
