import { fromLonLat } from 'ol/proj';
import { PolylineLayer, useEarth } from '../../src';
import CurvesLayer from "ol-dynamic-curves/src/curvesLayer"
export const testPolylineLayer = () => {
  const layer = new PolylineLayer(useEarth());
  layer.add({
    id: "polyline_1",
    positions: [fromLonLat([90, 30]), fromLonLat([90, 50])],
  })
  layer.add({
    id: "polyline_2",
    positions: [fromLonLat([100, 30]), fromLonLat([100, 50])],
    stroke: {
      color: "red",
      lineDash: [30, 20, 30, 20]
    },
    width: 5
  })
  layer.addLineArrows({
    id: "polyline_3",
    positions: [fromLonLat([80, 30]), fromLonLat([80, 50])]
  })
  layer.addLineArrows({
    id: "polyline_4",
    positions: [fromLonLat([70, 30]), fromLonLat([70, 50]), fromLonLat([60, 50]), fromLonLat([60, 30])],
    stroke: {
      color: "red",
      lineDash: [20, 30, 20, 30]
    },
    label: {
      text: "带箭头的虚线",
      offsetY: -10,
      fill: {
        color: "red"
      }
    }
  }, true)
  layer.addFlowingDash({
    id: "polyline_5",
    positions: [fromLonLat([100, 55]), fromLonLat([60, 55])],
    label: {
      text: "流动线",
      offsetY: -10
    }
  })
  layer.addFlowingDash({
    id: "polyline_6",
    positions: [fromLonLat([60, 60]), fromLonLat([100, 60])],
  }, "red", "yellow")
  let curves = new CurvesLayer({
    map: useEarth().map,
  });
  const defaultOptions = {
    pointPositions: [[[140.80, 15.90], [143.60, 33.00]], [[140.80, 15.90], [154.216463, 42.895035]], [[140.80, 15.90], [105.941956, 47.07053]], [[140.80, 15.90], [100.718274, 0.95006]]],
    splitLength: 180,
    oneFrameLimitTime: 0,
    radialColor: {
      0: '#BBFFFF',
      0.2: '#AEEEEE',
      0.4: '#96CDCD',
      0.6: '#668B8B',
      0.8: '#98F5FF',
      1: '#8EE5EE'
    },
    controlRatio: 1.0,
  }
  curves.addCurves(defaultOptions)
}