import { BillboardLayer, ETransfrom, PolylineLayer, Transfrom } from '../../src';

export const testTransfrom = () => {
  const transfrom = new Transfrom({});
  const eventNname = [ETransfrom.Select, ETransfrom.SelectEnd, ETransfrom.TranslateEnd];
  transfrom.on(eventNname, (e) => {
    console.log(e.type, e);
    if (e.type === ETransfrom.TranslateEnd) {
      const param = e.feature?.get('param');
      (transfrom.checkLayer as PolylineLayer).remove(param.id);
      setTimeout(() => {
        (transfrom.checkLayer as PolylineLayer).add(param);
      }, 1000);
    }
  });
  // ETransfrom.TranslateStart, ETransfrom.Translating,
};
