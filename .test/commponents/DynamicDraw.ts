import { Coordinate } from 'ol/coordinate';
import { DrawType, useEarth } from '../../src';
import { Feature } from 'ol';
import { Point } from 'ol/geom';

export const testDynamicDraw = () => {
  // useEarth().useDrawTool().drawPoint({
  //   callback: (e) => {
  //     console.log(e)
  //   }
  // })
  useEarth()
    .useDrawTool()
    .drawPolygon({
      callback: (e) => {
        console.log(e);
        if (e.type === DrawType.Drawend) {
          setTimeout(() => {
            useEarth()
              .useDrawTool()
              .editPolygon({
                feature: e.feature!,
                isShowUnderlay: true,
                callback: (ev) => {
                  console.log(ev);
                }
              });
          }, 1000);
        }
      }
    });
};
