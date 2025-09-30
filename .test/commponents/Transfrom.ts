import { ETransfrom, Transfrom } from '../../src';

export const testTransfrom = () => {
  const transfrom = new Transfrom({});
  transfrom.on(ETransfrom.Select, (e) => {
    console.log('选中', e);
  });
  transfrom.on(ETransfrom.SelectEnd, (e) => {
    console.log('退出选中', e);
  });
};
