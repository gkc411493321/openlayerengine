import { Coordinate } from 'ol/coordinate';
import { DrawType, EPlotType, PointLayer, useEarth } from '../../src';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import PlotDraw from '../../src/extends/plot/plotDraw';
import PlotEdit from '../../src/extends/plot/plotEdit';
import { fromLonLat } from 'ol/proj';

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

  useEarth().enableGraticule();
  useEarth().enableScaleLine();
  const dynamicDraw = useEarth().useDrawTool();
  dynamicDraw.drawEllipse({
    callback: (e) => {
      console.log(e);
      if (e.type === DrawType.Drawend) {
        // setTimeout(() => {
        //   useEarth()
        //     .useDrawTool()
        //     .editPolyline({
        //       feature: e.feature!,
        //       callback: (e) => {
        //         console.log(e);
        //       }
        //     });
        // }, 1000);
      }
    }
  });
};
