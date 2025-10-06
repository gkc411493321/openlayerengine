import { Coordinate } from 'ol/coordinate';
import { DrawType, EPlotType, useEarth } from '../../src';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import PlotDraw from '../../src/extends/plot/plotDraw';

export const testDynamicDraw = () => {
  // useEarth().useDrawTool().drawPoint({
  //   callback: (e) => {
  //     console.log(e)
  //   }
  // })
  new PlotDraw().startDraw(EPlotType.AttackArrow);
};
