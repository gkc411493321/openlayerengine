import { ETransfrom, Transfrom } from '../../src';

export const testTransfrom = () => {
  const transfrom = new Transfrom({});
  const eventNname = [ETransfrom.Select, ETransfrom.SelectEnd, ETransfrom.TranslateEnd];
  transfrom.on(eventNname, (e) => {
    console.log(e.type, e);
  });
  // ETransfrom.TranslateStart, ETransfrom.Translating,
};
