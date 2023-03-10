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
    positions: [[fromLonLat([110, 30]), fromLonLat([110, 50]), fromLonLat([120, 40])]],
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
  useEarth().useDrawTool().editPolygon(polygon);
  // const s = new Select();
  // const mo = new Modify({ features: s.getFeatures() })
  // const translate = new Translate({
  //   features: s.getFeatures(),
  // });
  // useEarth().map.addInteraction(s)
  // useEarth().map.addInteraction(mo)
  // useEarth().map.addInteraction(translate)

  // layer.setPosition("polygon_2", [[fromLonLat([100, 50]), fromLonLat([130, 30]), fromLonLat([140, 30]), fromLonLat([140, 50])]])
  // layer.set({
  //   id: "polygon_1",
  //   positions: [[fromLonLat([110, 30]), fromLonLat([110, 50]), fromLonLat([120, 30])]],
  //   label: {
  //     text: "11"
  //   },
  //   stroke: {
  //     color: "red",
  //     width: 10
  //   },
  //   fill: {
  //     color: "#fff"
  //   }
  // })
}

const getCenterLonLat = (oneLon, oneLat, twoLon, twoLat) => {
  //oneLon：第一个点的经度；oneLat：第一个点的纬度；twoLon：第二个点的经度；twoLat：第二个点的纬度；
  let aLon = 0, aLat = 0;
  let bLon = Number(oneLon) - Number(twoLon);
  let bLat = Number(oneLat) - Number(twoLat);
  //Math.abs()绝对值
  if (bLon > 0) {
    aLon = Number(oneLon) - Math.abs(bLon) / 2;
  } else {
    aLon = Number(twoLon) - Math.abs(bLon) / 2;
  }
  if (bLat > 0) {
    aLat = Number(oneLat) - Math.abs(bLat) / 2;
  } else {
    aLat = Number(twoLat) - Math.abs(bLat) / 2;
  }
  return [aLon, aLat];
}
