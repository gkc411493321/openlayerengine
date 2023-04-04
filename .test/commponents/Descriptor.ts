import { fromLonLat } from "ol/proj"
import { Descriptor, useEarth } from "../../src"
export const testDescriptor = () => {
  const a = new Descriptor(useEarth(), {
    type: "list",
    drag: true,
    fixedModel: "pixel",
    header: "ceshi",
    footer: "尾部"
  })

  a.set({
    position: fromLonLat([20, 60]),
    element: [
      { label: "测试", key: "1", value: "123123123123123123123123123123123123123" },
      { label: "测试", key: "2", value: "123123123123123123123123123123123123123" },
      { label: "测试", key: "4", value: "123123123123123123123123123123123123123" },
    ]
  })
  a.show();
  setTimeout(() => {
    a.set({
      position: fromLonLat([20, 60]),
      element: [
        { label: "测试1", key: "1", value: "123123123123123123123123123123123123123" },
        { label: "测试", key: "2", value: "123123123123123123123123123123123123123" },
        { label: "测试", key: "4", value: "123123123123123123123123123123123123123" },
      ]
    })
  }, 3000);
  // const b = new Descriptor(useEarth(), {
  //   type: "list",
  //   drag: true,
  // })
  // b.set({
  //   position: fromLonLat([30, 60]),
  //   element: [
  //     { label: "测试", key: "1", value: "123123123123123123123123123123123123123" },
  //     { label: "测试", key: "2", value: "123123123123123123123123123123123123123" },
  //     { label: "测试", key: "3", value: "123123123123123123123123123123123123123" },
  //     { label: "测试", key: "4", value: "123123123123123123123123123123123123123" },
  //     { label: "测试长label", key: "5", value: "123123123123123123123123123123123123123" }
  //   ]
  // })
  // b.show();
}
