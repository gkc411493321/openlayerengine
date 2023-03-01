import { fromLonLat } from 'ol/proj';
import { PolylineLayer, useEarth } from '../../src';
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
    positions: [fromLonLat([80, 30]), fromLonLat([80, 50])],
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
    positions: [fromLonLat([100, 60]), fromLonLat([60, 55])],
    label: {
      text: "流动线",
      offsetY: -10
    }
  })
  layer.addFlowingDash({
    id: "polyline_6",
    positions: [fromLonLat([60, 60]), fromLonLat([100, 60])],
  }, "red", "yellow")
  layer.addFlightLine({
    id: "fly_1",
    position: [fromLonLat([60, 55]), fromLonLat([100, 55])],
    isRepeat: true,
  })
  layer.addFlightLine({
    id: "fly_2",
    position: [fromLonLat([100, 55]), fromLonLat([140, 60])],
    isRepeat: true,
    isShowArrow: true,
    isShowAnchorPoint: false,
    arrowColor: "red",
    color: "red"
  })
  layer.addFlightLine({
    id: "fly_3",
    position: [fromLonLat([100, 55]), fromLonLat([140, 50])],
    isRepeat: true,
    isShowArrow: true,
    isShowAnchorPoint: false,
    color: {
      0: "#ccfbff",
      0.2: "#ef96c5",
      0.4: "#a0f1ea",
      0.6: "#eebd89",
      0.8: "#d13abd",
      1.0: "#6cc6cb",
    }
  })
  layer.addFlightLine({
    id: "fly_4",
    position: [fromLonLat([100, 55]), fromLonLat([140, 55])],
    isRepeat: false,
    isShowArrow: false,
    isShowAnchorLine: true,
    isShowAnchorPoint: false,
  })
  setTimeout(() => {
    layer.removeFlightLine("fly_1")
    layer.removeFlightLine("fly_2")
  }, 5000)
}