import { Overlay } from "ol";
import { toStringHDMS } from "ol/coordinate";
import { fromLonLat, toLonLat } from "ol/proj";
import { OverlayLayer, useEarth } from "../../src";

export const testOverlayLayer = () => {
  const layer = new OverlayLayer(useEarth());
  const div = document.createElement("div");
  div.className = "overlay";
  div.innerHTML = "<div class='title'>div，基于Overlay创建</div>"
  document.body.appendChild(div);
  layer.add({
    id: "overlay_1",
    position: fromLonLat([80, 22]),
    element: div
  })

  // let popup: Overlay;
  // useEarth().map.on('click', function (evt) {
  //   const coordinate = evt.coordinate;
  //   const hdms = toStringHDMS(toLonLat(coordinate));
  //   const div1 = document.createElement("div");
  //   div1.className = "overlay";
  //   div1.innerHTML = "<div class='title'>" + hdms + "</div>"
  //   document.body.appendChild(div1);
  //   if (!popup) {
  //     popup = layer.add({
  //       id: "overlay_2",
  //       position: coordinate,
  //       element: div1
  //     })
  //   } else {
  //     popup.setPosition(coordinate);
  //     popup.setElement(div1);
  //   }
  // });
  // layer.setPosition("overlay_x", fromLonLat([120, 22]))
  // const div2 = document.createElement("div");
  // div2.className = "overlay";
  // div2.innerHTML = "<div class='title'>div，基于Overlay创建2</div>"
  // document.body.appendChild(div2);
  // layer.set({
  //   id: "overlay_1",
  //   element: div2
  // })
}