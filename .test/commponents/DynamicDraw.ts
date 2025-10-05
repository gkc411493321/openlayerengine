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
    .drawCircle({
      callback: (e) => {
        console.log(e);
      }
    });
};
