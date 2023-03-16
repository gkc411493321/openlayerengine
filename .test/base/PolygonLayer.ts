/*
 * @Description: 
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-23 18:12:58
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-03-03 16:29:59
 */
import { Collection, Feature } from 'ol';
import { LineString, Polygon } from 'ol/geom';
import { Modify, Select, Translate } from 'ol/interaction';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { PointLayer, PolygonLayer, useEarth } from '../../src';
import * as turf from '@turf/turf';
export const testPolygonLayer = () => {
  const layer = new PolygonLayer(useEarth());
  const polygon = <Feature<Polygon>>layer.add({
    id: "polygon_1",
    positions: [[fromLonLat([110, 30]), fromLonLat([110, 50]), fromLonLat([120, 40]), fromLonLat([110, 30])]],
    label: {
      text: "带标签多边形"
    },
    module: "polygon"
  })
  layer.add({
    id: "polygon_2",
    positions: [[fromLonLat([110, 10]), fromLonLat([110, 20]), fromLonLat([120, 30]), fromLonLat([110, 10])]],
    fill: {
      color: "#fffff3"
    }
  })
  // useEarth().useDrawTool().editPolygon({
  //   feature: polygon,
  //   isShowUnderlay: true,
  //   callback: (e) => {
  //     console.log(e)
  //   }
  // });
}
