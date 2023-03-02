/*
 * @Description: 
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-23 18:12:58
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-03-02 14:56:33
 */
import { fromLonLat } from 'ol/proj';
import { PolygonLayer, useEarth } from '../../src';
export const testPolygonLayer = () => {
  const layer = new PolygonLayer(useEarth());
  layer.add({
    id: "polygon_1",
    positions: [fromLonLat([110, 30]), fromLonLat([110, 50]), fromLonLat([120, 40])],
    label: {
      text: "带标签多边形"
    }
  })
  layer.add({
    id: "polygon_2",
    positions: [fromLonLat([130, 50]), fromLonLat([130, 30]), fromLonLat([140, 30]), fromLonLat([140, 50])],
    fill: {
      color: "#fffff3"
    }
  })
}