import { useEarth } from "../../src"

export const testMeasure = () => {
  useEarth().useMeasure().lineMeasure({
    pointColor: "red",
    callback: (e) => {
      console.log(e)
    }
  });
}