/*
 * @Description: 
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-23 18:12:58
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-02-27 17:04:23
 */
import { fromLonLat } from 'ol/proj';
import { PointLayer, useEarth } from '../../src';
export const testPointLayer = () => {
  const layer = new PointLayer(useEarth());
  layer.add({
    id: "point_1",
    center: fromLonLat([120, 10]),
    size: 5,
    label: {
      text: "带标签点"
    }
  })
  layer.add({
    id: "point_2",
    center: fromLonLat([110, 10]),
    size: 10,
    fill: {
      color: "blue"
    }
  })
}