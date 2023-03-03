/*
 * @Description: 
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-03-02 16:45:50
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-03-03 14:56:15
 */
import { fromLonLat } from "ol/proj";
import { BillboardLayer, useEarth } from "../../src";

export const testBillboardLayer = () => {
  const layer = new BillboardLayer(useEarth());
  layer.add({
    id: "billboard_1",
    center: fromLonLat([65, 20]),
    src: "/image/earth.png",
    label: {
      text: "billboard",
      font: "bold 24px serif",
      stroke: {
        color: "red",
        width: 2
      },
      fill: {
        color: "#fff"
      },
      offsetY: -80
    }
  })
  /**
   * 修改位置
   */
  // layer.setPosition("billboard_1", fromLonLat([160, 60]));
  /**
   * 修改信息
   */
  // layer.set({
  //   id: "billboard_1",
  //   label: {
  //     text: "a",
  //   }
  // })
}