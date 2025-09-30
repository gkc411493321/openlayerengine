import { ETransfrom, Transfrom } from '../../src';

export const testTransfrom = () => {
  const transfrom = new Transfrom({});
  transfrom.on(ETransfrom.Select, (e) => {
    console.log('选中', e);
  });
  transfrom.on(ETransfrom.SelectEnd, (e) => {
    console.log('退出选中', e);
  });
  // transfrom.on(ETransfrom.EnterHandle, (e) => {
  //   console.log('进入变换点', e);
  // });
  // transfrom.on(ETransfrom.LeaveHandle, (e) => {
  //   console.log('离开变换点', e);
  // });
};
