/*
 * @Description: 
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-23 18:12:58
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-03-02 14:59:46
 */
import CircleLayer from "../../src/base/CircleLayer"
import { useEarth } from '../../src';
import { fromLonLat } from "ol/proj";
export const testCircleLayer = () => {
  const layer = new CircleLayer(useEarth());
  layer.add({
    id: "circle_1",
    center: fromLonLat([155, 35]),
    radius: 700000,
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
    center: fromLonLat([155, 45]),
    radius: 700000,
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