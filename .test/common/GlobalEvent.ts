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
  // useEarth().map.getViewport().onclick = (e) => {
  //   console.log(e, "click")
  // }
  // useEarth().map.getViewport().onmousedown = (e) => {
  //   console.log(e, "down")
  // }
  // useEarth().map.getViewport().onmouseup = (e) => {
  //   console.log(e, "up")
  // }
  const test = (e: MouseEvent) => {
    e.preventDefault();
    let pixel = useEarth().map.getEventPixel({ clientX: e.x, clientY: e.y });
    let feature = useEarth().map.forEachFeatureAtPixel(pixel, function (feature) {
      return feature;
    })
    if (feature) {
      let coordinate = useEarth().map.getEventCoordinate(e);
      console.log(feature, coordinate)
    }
  }
  useEarth().map.getViewport().addEventListener("contextmenu", test)
  // setTimeout(() => {
  //   useEarth().map.getViewport().removeEventListener("contextmenu", test)
  // }, 3000)
}