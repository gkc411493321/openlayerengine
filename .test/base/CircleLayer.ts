/*
 * @Description: 
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-23 18:12:58
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-02-28 09:29:53
 */
import CircleLayer from "../../src/base/CircleLayer"
import { useEarth } from '../../src';
import { fromLonLat } from "ol/proj";
export const testCircleLayer = () => {
  const layer = new CircleLayer(useEarth());
  layer.add({
    id: "circle_1",
    center: fromLonLat([110, 20]),
    radius: 100000,
    stroke: {
      color: "#ee4",
      width: 5
    },
    fill: {
      color: "#fff"
    },
    module: "circle",
    data: {
      a: "1",
      b: "2"
    }
  })
  layer.add({
    id: "circle_2",
    center: fromLonLat([120, 20]),
    radius: 200000,
    label: {
      text: "带标签圆",
      scale: 1
    },
    module: "circle",
    data: {
      a: "1",
      b: "2"
    },
  })
}