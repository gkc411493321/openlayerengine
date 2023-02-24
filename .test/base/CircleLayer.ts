import CircleLayer from "../../src/base/CircleLayer"
import { useEarth } from '../../src';
import { fromLonLat } from "ol/proj";
export const testCircleLayer = () => {
  const layer = new CircleLayer(useEarth());
  layer.add({
    id: "test1",
    center: fromLonLat([120, 20]),
    radius: 100000,
    stroke: {
      color: "#ee4",
      width: 5
    },
    fill: {
      color: "#fff"
    },
    label: {
      text: "123"
    },
    module: "circle",
    data: {
      a: "1",
      b: "2"
    }
  })
  layer.add({
    id: "test2",
    center: fromLonLat([120, 30]),
    radius: 200000,
    stroke: {
      color: "#ee4",
      width: 5
    },
    fill: {
      color: "#fff"
    },
    label: {
      text: "123",
      stroke: {
        width: 1
      }
    },
    module: "circle",
    data: {
      a: "1",
      b: "2"
    }
  })
  console.log("根据id获取图层元素", layer.get("test1"));
  console.log("获取图层所有元素", layer.get());
  setTimeout(() => {
    console.log(layer.remove("test12"));
    console.log(layer.remove());
    setTimeout(() => {
      console.log(layer.destroy());
    }, 5000)
  }, 5000)

}