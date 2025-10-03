/**
 * 轻量 DOM 工具集合（不依赖 jQuery）。
 * 部分方法参考常见工具集实现，提供创建元素、事件绑定、样式读写、滚动模拟等。
 */
import ol_Map from 'ol/Map'

// 位置矩形类型
export interface PositionRect { top: number; left: number; bottom: number; right: number }
import Checkbox from './input/Checkbox'
import Switch from './input/Switch'
import Radio from './input/Radio'

/** 创建元素时可用的参数 */
export interface CreateOptions {
  className?: string
  parent?: Element
  html?: Element | string
  text?: string
  options?: Record<string, string>
  style?: Partial<CSSStyleDeclaration> & { [k: string]: string | number | undefined }
  on?: Record<string, (e: Event) => void>
  click?: (e: Event) => void
  change?: (e: Event) => void
  checked?: boolean
  // 允许附加任意自定义属性（将被 setAttribute）
  [k: string]: unknown
}

export interface ScrollDivOptions {
  onmove?: (moving: boolean) => void
  vertical?: boolean
  animate?: boolean
  mousewheel?: boolean
  minibar?: boolean
}

// 工具主对象
const elementUtil = {
  /** 创建一个元素或文本节点 */
  create(tagName: string, options: CreateOptions = {}): HTMLElement | Text {
    let elt: HTMLElement | Text
    if (tagName === 'TEXT') {
      const raw = (options as { html?: unknown }).html
      elt = document.createTextNode(raw ? String(raw) : '')
      if (options.parent) options.parent.appendChild(elt)
    } else {
      elt = document.createElement(tagName.toLowerCase())
      if (/button/i.test(tagName)) elt.setAttribute('type', 'button')
      for (const attr in options) {
        const value = (options as Record<string, unknown>)[attr]
        switch (attr) {
          case 'className':
            if (options.className && options.className.trim) {
              elt.setAttribute('class', options.className.trim())
            }
            break
          case 'text':
            elt.innerText = options.text || ''
            break
          case 'html':
            if (options.html instanceof Element) elt.appendChild(options.html)
            else if (options.html !== undefined) elt.innerHTML = String(options.html)
            break
          case 'parent':
            if (options.parent) options.parent.appendChild(elt)
            break
          case 'options':
            if (/select/i.test(tagName) && options.options) {
              for (const key in options.options) {
                elementUtil.create('OPTION', {
                  html: key,
                  value: options.options[key],
                  parent: elt
                })
              }
            }
            break
          case 'style':
            if (options.style) elementUtil.setStyle(elt, options.style as Record<string, string | number | undefined>)
            break
          case 'change':
          case 'click':
            if (typeof value === 'function') elementUtil.addListener(elt, attr, value as EventListener)
            break
          case 'on':
            if (options.on) {
              for (const e in options.on) {
                const handler = options.on[e]
                if (handler) elementUtil.addListener(elt, e, handler)
              }
            }
            break
          case 'checked':
            (elt as HTMLInputElement).checked = !!options.checked
            break
          default:
            if (value !== undefined && typeof value !== 'object' && typeof value !== 'function') {
              elt.setAttribute(attr, String(value))
            }
        }
      }
    }
    return elt
  },

  /** 创建一个开关（Switch）输入 */
  createSwitch(options: CreateOptions & { on?: Record<string, (e: Event) => void> }): HTMLInputElement {
    const input = this.create('INPUT', {
      type: 'checkbox',
      on: options.on,
      click: options.click,
      change: options.change,
      parent: options.parent
    }) as HTMLInputElement
  type SwitchInit = CreateOptions & { input: HTMLInputElement }
  const opt: SwitchInit = Object.assign({ input }, options || {}) as SwitchInit
    new Switch(opt)
    return input
  },

  /** 创建一个勾选 / 单选输入 */
  createCheck(options: CreateOptions & { type?: string; name?: string }): HTMLInputElement {
    const input = this.create('INPUT', {
      name: options.name,
      type: options.type === 'radio' ? 'radio' : 'checkbox',
      on: options.on,
      parent: options.parent
    }) as HTMLInputElement
  type CheckInit = CreateOptions & { input: HTMLInputElement }
  const opt: CheckInit = Object.assign({ input }, options || {}) as CheckInit
    if (options.type === 'radio') new Radio(opt)
    else new Checkbox(opt)
    return input
  },

  /** 设置内部 html 或追加子节点 */
  setHTML(element: Element, html: Element | string | undefined): void {
    if (html instanceof Element) element.appendChild(html)
    else if (html !== undefined) element.innerHTML = String(html)
  },

  /** 追加文本节点 */
  appendText(element: Element, text: string): void {
    element.appendChild(document.createTextNode(text || ''))
  },

  /** 批量绑定事件 */
  addListener(element: Element | Window, eventType: string | string[], fn: EventListenerOrEventListenerObject, useCapture?: boolean): void {
    const events = typeof eventType === 'string' ? eventType.split(' ') : eventType
    events.forEach(e => element.addEventListener(e, fn, useCapture))
  },

  /** 批量移除事件 */
  removeListener(element: Element | Window, eventType: string | string[], fn: EventListenerOrEventListenerObject): void {
    const events = typeof eventType === 'string' ? eventType.split(' ') : eventType
    events.forEach(e => element.removeEventListener(e, fn))
  },

  show(element: HTMLElement): void {
    element.style.display = ''
  },
  hide(element: HTMLElement): void {
    element.style.display = 'none'
  },
  hidden(element: HTMLElement): boolean {
    return this.getStyle(element, 'display') === 'none'
  },
  toggle(element: HTMLElement): void {
    element.style.display = element.style.display === 'none' ? '' : 'none'
  },

  setStyle(el: HTMLElement, st: Record<string, string | number | undefined>): void {
    Object.keys(st).forEach(k => {
      const v = st[k]
      if (v === undefined) return
      if (['top','left','bottom','right','minWidth','maxWidth','width','height'].includes(k) && typeof v === 'number') {
        (el.style as unknown as Record<string, string>)[k] = v + 'px'
      } else {
        (el.style as unknown as Record<string, string>)[k] = String(v)
      }
    })
  },

  getStyle(el: HTMLElement, styleProp: string): string | number | undefined {
    const defaultView = (el.ownerDocument || document).defaultView
    if (defaultView && defaultView.getComputedStyle) {
      const cssName = styleProp.replace(/([A-Z])/g, '-$1').toLowerCase()
      const value = defaultView.getComputedStyle(el, null).getPropertyValue(cssName)
      if (/px$/.test(value)) return parseInt(value, 10)
      return value
    }
  const inlineMap = el.style as unknown as Record<string, string | undefined>
  const inline = inlineMap[styleProp as keyof typeof inlineMap]
    if (inline && /px$/.test(inline)) return parseInt(inline, 10)
    return inline
  },

  outerHeight(elt: HTMLElement): number {
    const mb = this.getStyle(elt, 'marginBottom')
    return elt.offsetHeight + (typeof mb === 'number' ? mb : 0)
  },
  outerWidth(elt: HTMLElement): number {
    const ml = this.getStyle(elt, 'marginLeft')
    return elt.offsetWidth + (typeof ml === 'number' ? ml : 0)
  },

  offsetRect(elt: HTMLElement) {
    const rect = elt.getBoundingClientRect()
    return {
      top:
        rect.top +
        (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0),
      left:
        rect.left +
        (window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0),
      height: rect.height || rect.bottom - rect.top,
      width: rect.width || rect.right - rect.left
    }
  },

  getFixedOffset(elt: HTMLElement) {
    const offset = { left: 0, top: 0 }
    const getOffset = (parent: HTMLElement | null): { left: number; top: number } => {
      if (!parent) return offset
      if (
        this.getStyle(parent, 'position') === 'absolute' &&
        this.getStyle(parent, 'transform') !== 'none'
      ) {
        const r = parent.getBoundingClientRect()
        offset.left += r.left
        offset.top += r.top
        return offset
      }
      return getOffset(parent.offsetParent as HTMLElement | null)
    }
    return getOffset(elt.offsetParent as HTMLElement | null)
  },

  positionRect(elt: HTMLElement, fixed?: boolean) {
    let gleft = 0
    let gtop = 0
  const getRect = (parent: HTMLElement | null): PositionRect => {
      if (parent) {
        gleft += parent.offsetLeft
        gtop += parent.offsetTop
        return getRect(parent.offsetParent as HTMLElement | null)
      } else {
        const r: PositionRect = {
          top: elt.offsetTop + gtop,
          left: elt.offsetLeft + gleft,
          bottom: 0,
          right: 0
        }
        if (fixed) {
          r.top -=
            window.pageYOffset ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            0
          r.left -=
            window.pageXOffset ||
            document.documentElement.scrollLeft ||
            document.body.scrollLeft ||
            0
        }
        r.bottom = r.top + elt.offsetHeight
        r.right = r.left + elt.offsetWidth
        return r
      }
    }
    return getRect(elt.offsetParent instanceof HTMLElement ? elt.offsetParent : null)
  },

  /** 让一个 div 可滚动（隐藏原生滚动条），支持动量、迷你滚动条等 */
  scrollDiv(elt: HTMLElement, options: ScrollDivOptions = {}) {
    let pos: number | false = false
    let speed = 0
  let d: Date, dt: number = 0
  const NOOP = () => { /* 空函数 */ }

  const onmove = typeof options.onmove === 'function' ? options.onmove : NOOP
    const page = options.vertical ? 'screenY' : 'screenX'
    const scroll = options.vertical ? 'scrollTop' : 'scrollLeft'
    let moving = false
    let scale: number, isbar: boolean | undefined

    let updateCounter = 0
    let scrollbar: HTMLElement | undefined
    let scrollContainer: HTMLElement | undefined

    const updateMinibarDelay = () => {
      if (!scrollbar) return
      updateCounter--
      if (updateCounter) return
      const pheight = elt.clientHeight
      const height = elt.scrollHeight
      scale = pheight / height
      scrollbar.style.height = scale * 100 + '%'
      scrollbar.style.top = (elt.scrollTop / height) * 100 + '%'
      if (scrollContainer) scrollContainer.style.height = pheight + 'px'
      if (pheight > height - 0.5) scrollContainer?.classList.add('ol-100pc')
      else scrollContainer?.classList.remove('ol-100pc')
    }
    const updateMinibar = () => {
      if (scrollbar) {
        updateCounter++
        setTimeout(updateMinibarDelay)
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      const tgt = e.target as Element | null
      if (tgt && tgt.classList && tgt.classList.contains('ol-noscroll')) return
      moving = false
      pos = (e as unknown as Record<string, number>)[page]
      dt = Date.now()
      elt.classList.add('ol-move')
      e.preventDefault()
      window.addEventListener('pointermove', onPointerMove as EventListener)
      this.addListener(window, ['pointerup', 'pointercancel'], onPointerUp as EventListener)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (pos !== false) {
        const current = (e as unknown as Record<string, number>)[page]
        const delta = (isbar ? -1 / scale : 1) * (pos - current)
        moving = moving || Math.round(delta) !== 0
        ;(elt as unknown as Record<string, number>)[scroll] += delta
        d = new Date()
        const diff = d.getTime() - dt
        if (diff) speed = (speed + delta / diff) / 2
        pos = current
        dt = d.getTime()
        if (delta) onmove(true)
      } else {
        moving = true
      }
    }

    const animate = (to: number) => {
      const step = to > 0 ? Math.min(100, to / 2) : Math.max(-100, to / 2)
      to -= step
  ;(elt as unknown as Record<string, number>)[scroll] += step
      if (-1 < to && to < 1) {
        if (moving) setTimeout(() => elt.classList.remove('ol-move'))
        else elt.classList.remove('ol-move')
        moving = false
        onmove(false)
      } else {
        setTimeout(() => animate(to), 40)
      }
    }

    if (options.vertical && options.minibar) {
      const init = (b?: boolean) => {
        elt.removeEventListener('pointermove', wrappedInit)
        if (elt.parentNode instanceof HTMLElement) {
          elt.parentNode.classList.add('ol-miniscroll')
        }
        scrollbar = this.create('DIV') as HTMLElement
        scrollContainer = this.create('DIV', { className: 'ol-scroll', html: scrollbar }) as HTMLElement
        if (elt.parentNode && scrollContainer) {
          elt.parentNode.insertBefore(scrollContainer, elt)
        }
        scrollbar.addEventListener('pointerdown', (e: PointerEvent) => {
          isbar = true
          onPointerDown(e)
        })
        if (options.mousewheel) {
          if (scrollContainer)
            this.addListener(scrollContainer, ['mousewheel', 'DOMMouseScroll', 'onmousewheel'], onMouseWheel as EventListener)
          this.addListener(scrollbar, ['mousewheel', 'DOMMouseScroll', 'onmousewheel'], onMouseWheel as EventListener)
        }
        if (elt.parentNode) elt.parentNode.addEventListener('pointerenter', updateMinibar)
        window.addEventListener('resize', updateMinibar)
        if (b !== false) updateMinibar()
      }
      const wrappedInit = (() => init()) as EventListener
      if (elt.parentNode) init(false)
      else elt.addEventListener('pointermove', wrappedInit)
      elt.addEventListener('scroll', () => updateMinibar())
    }

    elt.style.touchAction = 'none'
    elt.style.overflow = 'hidden'
    elt.classList.add('ol-scrolldiv')

    this.addListener(elt, ['pointerdown'], e => {
      isbar = false
      onPointerDown(e as PointerEvent)
    })

    elt.addEventListener(
      'click',
      e => {
        if (elt.classList.contains('ol-move')) {
          e.preventDefault()
          e.stopPropagation()
        }
      },
      true
    )

    const onPointerUp = (e: PointerEvent) => {
      const diff = Date.now() - dt
      if (diff > 100 || isbar) speed = 0
      else if (diff > 0) speed = ((speed || 0) + ((pos as number) - (e as unknown as Record<string, number>)[page]) / diff) / 2
      animate(options.animate === false ? 0 : speed * 200)
      pos = false
      speed = 0
      dt = 0
      if (!elt.classList.contains('ol-move')) {
        elt.classList.add('ol-hasClick')
        setTimeout(() => elt.classList.remove('ol-hasClick'), 500)
      } else {
        elt.classList.remove('ol-hasClick')
      }
      isbar = false
      window.removeEventListener('pointermove', onPointerMove as EventListener)
      this.removeListener(window, ['pointerup', 'pointercancel'], onPointerUp as EventListener)
    }

    const onMouseWheel = (e: WheelEvent | { wheelDelta?: number; detail?: number }) => {
      const deltaRaw = 'wheelDelta' in e && typeof e.wheelDelta === 'number'
        ? e.wheelDelta
        : (typeof (e as { detail?: number }).detail === 'number' ? -((e as { detail?: number }).detail as number) : 0)
      const delta = Math.max(-1, Math.min(1, deltaRaw))
      elt.classList.add('ol-move')
      ;(elt as unknown as Record<string, number>)[scroll] -= delta * 30
      elt.classList.remove('ol-move')
      return false
    }

    if (options.mousewheel) {
      this.addListener(elt, ['mousewheel', 'DOMMouseScroll', 'onmousewheel'], onMouseWheel as EventListener)
    }

    return { refresh: () => updateMinibar() }
  },

  dispatchEvent(eventName: string, element: Element) {
    let event: Event
    try {
      event = new CustomEvent(eventName)
    } catch (e) {
      const ce = document.createEvent('CustomEvent')
      ce.initCustomEvent(eventName, true, true, {})
      event = ce
    }
    element.dispatchEvent(event)
  },

  setCursor(elt: Element | ol_Map, cursor: string) {
    if (elt instanceof ol_Map) elt = (elt as ol_Map).getTargetElement() as Element
    if (!('ontouchstart' in window) && elt instanceof Element) {
      (elt as HTMLElement).style.cursor = cursor
    }
  }
}

export type OlExtElement = typeof elementUtil
const olExtElement: OlExtElement = elementUtil
export { olExtElement as ol_ext_element, olExtElement }
