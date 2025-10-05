import { useEarth } from '../src/useEarth';
import { testBillboardLayer } from './base/BillboardLayer';
import { testCircleLayer } from './base/CircleLayer';
import { testOverlayLayer } from './base/OverlayLayer';
import { testPointLayer } from './base/PointLayer';
import { testPolygonLayer } from './base/PolygonLayer';
import { testPolylineLayer } from './base/PolylineLayer';
import { testWindLayer } from './base/WindLayer';
import { testDescriptor } from './commponents/Descriptor';
import { testDynamicDraw } from './commponents/DynamicDraw';
import { testGlobalEvent } from './commponents/GlobalEvent';
import { testMeasure } from './commponents/Measure';
import { testContextMenu } from './commponents/ContextMenu';
import '../src/assets/style/index.scss';
import { testTransfrom } from './commponents/Transfrom';

window.onload = () => {
  const earth = useEarth();
  // earth.addLayer(earth.createXyzLayer('http://192.168.50.200:8080/_alllayers'));
  earth.addLayer(earth.createOsmLayer());
  testBillboardLayer();

  testCircleLayer()
  testPointLayer()
  testPolygonLayer();
  testPolylineLayer();
  // testTransfrom();
  // testOverlayLayer();
  // testGlobalEvent();
  // testDynamicDraw();
  // testMeasure();
  // testWindLayer();
  // testDescriptor();
  // testContextMenu();
};
