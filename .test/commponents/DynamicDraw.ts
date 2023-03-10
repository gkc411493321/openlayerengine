import { useEarth } from "../../src"

export const testDynamicDraw = () => {
  // useEarth().useDrawTool().drawLine({
  //   callback: (e) => {
  //     console.log(e)
  //   }
  // })
  // useEarth().useDrawTool().drawPoint({
  //   callback: (e) => {
  //     console.log(e)
  //   }
  // })
  useEarth().useDrawTool().drawPolygon({
    callback: (e) => {
      console.log(e)
    }
  })
}