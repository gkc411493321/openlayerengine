import Earth from "../Earth";
import { Map as Maps } from "ol";
import { WindLayer as WindLayers } from "ol-wind";
import { ISetWindOptions, ISetWindParam, IWindParam } from "../interface";
import { Utils } from "../common";

/**
 * 风场类，可绘制风场、洋流
 */
export default class WindLayer {
  /**
   * map实例
   */
  private map: Maps;
  /**
   * 风场缓存
   */
  private windCache?: Map<string, WindLayers> = new Map;
  /**
   * 构造器
   * @param earth 地图实例
   */
  constructor(earth: Earth) {
    this.map = earth.map;
  }
  /**
   * 新增风场
   * @param param 参数，详见{@link IWindParam}
   * @returns 返回{@link WindLayers}
   */
  add(param: IWindParam): WindLayers {
    const id = Utils.GetGUID();
    const layer = new WindLayers(param.data, {
      forceRender: false,
      windOptions: {
        globalAlpha: param.globalAlpha || 0.9,
        velocityScale: param.velocityScale || 1 / 25,
        paths: param.paths || 3000,
        lineWidth: param.lineWidth || 1,
        colorScale: param.colorScale || ["rgb(36,104, 180)", "rgb(60,157, 194)", "rgb(128,205,193 )", "rgb(151,218,168 )", "rgb(198,231,181)", "rgb(238,247,217)", "rgb(255,238,159)", "rgb(252,217,125)", "rgb(255,182,100)", "rgb(252,150,75)", "rgb(250,112,52)", "rgb(245,64,32)", "rgb(237,45,28)", "rgb(220,24,32)", "rgb(180,0,35)"],
        generateParticleOption: false
      },
      fieldOptions: {
        wrapX: true,
      },
      id: param.id || id,
      className: param.className
    });
    this.map.addLayer(layer);
    this.windCache?.set(param.id || id, layer);
    return layer;
  }
  /**
   * 修改风场数据
   * @param param 参数，详见{@link ISetWindParam}
   */
  set(param: ISetWindParam): WindLayers | undefined {
    const layer = this.windCache?.get(param.id);
    if (layer) {
      return layer.setData(param.data, param.options);
    }
  }
  /**
   * 修改风场配置参数
   */
  setOptions(param: ISetWindOptions): void {
    const layer = this.windCache?.get(param.id);
    if (layer) {
      layer.setWindOptions(param.options);
    }
  }
  /**
   * 获取所有风场
   */
  get(): WindLayers[] | undefined;
  /**
  * 获取指定风场
  * @param id 风场id 
  */
  get(id: string): WindLayers | undefined;
  get(id?: string): WindLayers | WindLayers[] | undefined {
    if (id) {
      return this.windCache?.get(id);
    } else {
      const layers: WindLayers[] = []
      this.windCache?.forEach(item => {
        layers.push(item);
      })
      return layers;
    }
  }
  /**
   * 删除所有风场
   */
  remove(): boolean;
  /**
   * 删除指定风场
   * @param id 风场id
   */
  remove(id: string): boolean;
  remove(id?: string): boolean {
    if (id) {
      const layer = this.windCache?.get(id);
      if (layer) {
        this.map.removeLayer(layer);
        this.windCache?.delete(id);
        return true;
      } else {
        return false;
      }
    } else {
      this.windCache?.forEach(item => {
        this.map.removeLayer(item);
        this.windCache?.clear();
      })
      return true;
    }
  }
}