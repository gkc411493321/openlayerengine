import Earth, { IEarthConstructorOptions } from "./Earth";
import { ViewOptions } from "ol/View";

let earth: Earth;
/**
 * @description: 创建地图实例
 * @param viewOptions 地图视图参数
 * @param options 地图自定义参数
 * @return {*} Earth
 * @author: wuyue.nan
 */
const useEarth = (viewOptions?: ViewOptions, options?: IEarthConstructorOptions): Earth => {
  if (!earth) {
    earth = new Earth(viewOptions, options);
  }
  return earth;
}

export { useEarth }
