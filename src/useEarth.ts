import Earth from "./Earth";
import { ViewOptions } from "ol/View";
import { IEarthConstructorOptions } from "./interface";

let earth: Earth;
/**
 * 创建地图实例
 * @param viewOptions 地图视图参数
 * @param options 地图自定义参数
 * @returns `Earth`实例，详见{@link Earth}
 */
const useEarth = (viewOptions?: ViewOptions, options?: IEarthConstructorOptions): Earth => {
  if (!earth) {
    earth = new Earth(viewOptions, options);
  }
  return earth;
}

export { useEarth }
