import Interaction from "ol/interaction/Interaction"
import PointerInteraction from 'ol/interaction/Pointer.js';
import { unByKey } from "ol/Observable";
import { useEarth } from "../../src"

export const testGlobalEvent = () => {
  /**
   * 启用模块鼠标移动监听
   */
  // useEarth().useGlobalEvent().enableModuleMouseMoveEvent();
  // useEarth().useGlobalEvent().addMouseMoveEventByModule("circle", (param) => {
  //   console.log(param)
  // })
  // useEarth().useGlobalEvent().disableModuleMouseMoveEvent();
  /**
   * 启用全局鼠标移动监听
   */
  // useEarth().useGlobalEvent().enableGlobalMouseMoveEvent();
  // useEarth().useGlobalEvent().addMouseMoveEventByGlobal((param) => {
  //   console.log(param)
  // })
  // useEarth().useGlobalEvent().disableGlobalMouseMoveEvent();
  /**
   * 启用模块鼠标点击监听
   */
  // useEarth().useGlobalEvent().enableModuleMouseClickEvent();
  // useEarth().useGlobalEvent().addMouseClickEventByModule("point", (param) => {
  //   console.log(param)
  // })
  // setTimeout(() => {
  //   useEarth().useGlobalEvent().disableModuleMouseClickEvent();
  // }, 5000)
  /**
   * 启用模块鼠标左键按下监听
   */
  // useEarth().useGlobalEvent().enableModuleMouseLeftDownEvent();
  // useEarth().useGlobalEvent().addMouseLeftDownEventByModule("point", (param) => {
  //   console.log(param)
  // })
  // setTimeout(() => {
  //   useEarth().useGlobalEvent().disableModuleMouseLeftDownEvent();
  // }, 5000)
  /**
   * 启用全局鼠标左键按下监听
   */
  // useEarth().useGlobalEvent().enableGlobalMouseLeftDownEvent();
  // useEarth().useGlobalEvent().addMouseLeftDownEventByGlobal((param) => {
  //   console.log(param)
  // })
  // setTimeout(() => {
  //   useEarth().useGlobalEvent().disableGlobalMouseLeftDownEvent();
  // }, 5000)
  /**
   * 启用模块鼠标左键弹起监听
   */
  // useEarth().useGlobalEvent().enableModuleMouseLeftUpEvent();
  // useEarth().useGlobalEvent().addMouseLeftUpEventByModule("point", (param) => {
  //   console.log(param)
  // })
  // setTimeout(() => {
  //   useEarth().useGlobalEvent().disableModuleMouseLeftUpEvent();
  // }, 5000)
  /**
   * 启用全局鼠标左键弹起监听
   */
  // useEarth().useGlobalEvent().enableGlobalMouseLeftUpEvent();
  // useEarth().useGlobalEvent().addMouseLeftUpEventByGlobal((param) => {
  //   console.log(param)
  // })
  // setTimeout(() => {
  //   useEarth().useGlobalEvent().disableGlobalMouseLeftUpEvent();
  // }, 5000)
}