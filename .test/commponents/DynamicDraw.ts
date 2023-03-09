import { useEarth } from "../../src"

export const testDynamicDraw = () => {
  useEarth().useDrawTool().drawLine({
    limit: 2,
    callback: (e) => {
      console.log(e)
    }
  })
  // useEarth().useDrawTool().drawPoint({
  //   callback: (e) => {
  //     console.log(e)
  //   }
  // })
}