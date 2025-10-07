import { Coordinate } from 'ol/coordinate';
import { DrawType, EPlotType, useEarth } from '../../src';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import PlotDraw from '../../src/extends/plot/plotDraw';
import PlotEdit from '../../src/extends/plot/plotEdit';

export const testDynamicDraw = () => {
  // setTimeout(() => {
  //   useEarth()
  //     .useDrawTool()
  //     .drawPolygon({
  //       callback: (e) => {
  //         console.log(e);
  //       }
  //     });
  // }, 5000);
  setTimeout(() => {
    useEarth()
      .useDrawTool()
      .drawwAttackArrow({
        callback: (e) => {
          console.log(e);
          // if (e.type === DrawType.Drawend) {
          //   setTimeout(() => {
          //     useEarth().useDrawTool().editAttackArrow({ feature: e.feature! });
          //   }, 0);
          // }
        }
      });
  }, 5000);
};
