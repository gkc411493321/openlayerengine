import { Coordinate } from 'ol/coordinate';
import { DrawType, EPlotType, useEarth } from '../../src';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import PlotDraw from '../../src/extends/plot/plotDraw';
import PlotEdit from '../../src/extends/plot/plotEdit';

export const testDynamicDraw = () => {
  // useEarth().useDrawTool().drawPoint({
  //   callback: (e) => {
  //     console.log(e)
  //   }
  // })
  useEarth()
    .useDrawTool()
    .drawwAttackArrow({
      callback: (e) => {
        console.log(e);
        if (e.type === DrawType.Drawend) {
          setTimeout(() => {
            const p = new PlotEdit();
            p.init({ feature: e.feature! });
          }, 1000);
        }
      }
    });
};
