import { fromLonLat } from "ol/proj"
import { Descriptor, useEarth } from "../../src"

export const testDescriptor = () => {
  const a = new Descriptor(useEarth(), {
    type: "list"
  })
  a.set({
    position: fromLonLat([20, 60]),
    element: [
      { label: "测试", key: "1", value: "123123123123123123123123123123123123123" },
      { label: "测试", key: "2", value: "123123123123123123123123123123123123123" },
      { label: "测试", key: "3", value: "123123123123123123123123123123123123123" },
      { label: "测试", key: "4", value: "123123123123123123123123123123123123123" },
      { label: "测试", key: "5", value: "123123123123123123123123123123123123123" }
    ]
  })
  a.show();
}