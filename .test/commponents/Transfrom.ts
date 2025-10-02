import { BillboardLayer, CircleLayer, ETransfrom, PointLayer, PolygonLayer, PolylineLayer, Transfrom } from '../../src';

export const testTransfrom = () => {
  const transfrom = new Transfrom({});
  const eventNname = [ETransfrom.Select, ETransfrom.SelectEnd, ETransfrom.ScaleStart, ETransfrom.Scaling, ETransfrom.ScaleEnd];
  transfrom.on(eventNname, (e) => {
    console.log(e.type, e);
  });
  // ETransfrom.TranslateStart, ETransfrom.Translating,
};
