import { ETransfrom, Transfrom } from '../../src';

export const testTransfrom = () => {
  const transfrom = new Transfrom({});
  const eventNname = [ETransfrom.Select, ETransfrom.SelectEnd, ETransfrom.TranslateStart, ETransfrom.Translating, ETransfrom.TranslateEnd, ETransfrom.EnterHandle, ETransfrom.LeaveHandle];
  transfrom.on(eventNname, (e) => {
    console.log(e.type, e);
  });
  // transfrom.on(ETransfrom.EnterHandle, (e) => {
  //   console.log('进入变换点', e);
  // });
  // transfrom.on(ETransfrom.LeaveHandle, (e) => {
  //   console.log('离开变换点', e);
  // });
};
