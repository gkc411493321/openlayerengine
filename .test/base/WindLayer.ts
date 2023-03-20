import { useEarth, WindLayer } from "../../src"
import gfs from "../data/gfs.json";

export const testWindLayer = () => {
  const wind = new WindLayer(useEarth());
  wind.add({
    data: gfs,
    id: "1",
    paths: 15000
  });
  setTimeout(() => {
    wind.setOptions({
      id: "1",
      options: {
        paths: 3000
      }
    })
  }, 3000);
}