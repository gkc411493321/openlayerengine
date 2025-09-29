import { ETransfrom, Transfrom } from '../../src';

export const testTransfrom = () => {
  const a = new Transfrom({
  });
  a.on(ETransfrom.Select, (e) => {
    console.log('选中', e);
  });
};
