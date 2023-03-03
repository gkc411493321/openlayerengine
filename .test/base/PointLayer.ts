/*
 * @Description: 
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-27 16:44:05
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-03-03 16:18:42
 */
import { fromLonLat } from 'ol/proj';
import { PointLayer, useEarth } from '../../src';
export const testPointLayer = () => {
  const layer = new PointLayer(useEarth());
  layer.add({
    id: "point_1",
    center: fromLonLat([125, 50]),
    label: {
      text: "带标签点"
    },
    isFlash: true
  })
  layer.add({
    id: "point_2",
    center: fromLonLat([125, 45]),
    size: 10,
    fill: {
      color: "blue"
    },
    isFlash: true,
    flashColor: {
      R: 0,
      G: 0,
      B: 255
    },
    duration: 3000,
    isRepeat: false
  })
  // setTimeout(() => {
  //   layer.set({
  //     id: "point_1",
  //     center: fromLonLat([125, 60]),
  //     size: 10,
  //     label: {
  //       text: "带标签点2",
  //       fill: {
  //         color: "#fff"
  //       }
  //     },
  //     stroke: {
  //       color: "blue"
  //     },
  //     fill: {
  //       color: "blue"
  //     },
  //     duration: 500,
  //     isFlash: true,
  //     isRepeat: true,
  //     flashColor: {
  //       R: 0,
  //       G: 0,
  //       B: 255
  //     },
  //   })
  // }, 3000)

}