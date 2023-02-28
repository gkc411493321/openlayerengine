import { fromLonLat } from 'ol/proj';
import { PolylineLayer, useEarth } from '../../src';
export const testPolylineLayer = () => {
  const layer = new PolylineLayer(useEarth());
  layer.add({
    id: "polyline_1",
    positions: [fromLonLat([80, 30]), fromLonLat([80, 50])],
  })
  layer.add({
    id: "polyline_2",
    positions: [fromLonLat([90, 30]), fromLonLat([90, 50])],
    stroke: {
      color: "red",
    },
    width: 5
  })
}