import { fromLonLat } from 'ol/proj';
import { BillboardLayer, useEarth } from '../../src';

export const testBillboardLayer = () => {
  const layer = new BillboardLayer();
  layer.add({
    id: 'billboard_1',
    center: fromLonLat([65, 20]),
    src: '../../src/assets/image/fly.svg',
    color: 'red',
    scale: 1,
    label: {
      text: 'billboard',
      font: 'bold 24px serif',
      stroke: {
        color: 'red',
        width: 2
      },
      fill: {
        color: '#fff'
      },
      offsetY: -80
    }
  });
  /**
   * 修改位置
   */
  // layer.set({ id: 'billboard_1', center: fromLonLat([160, 60]) });
  /**
   * 修改信息
   */
  // layer.set({
  //   id: "billboard_x",
  //   label: {
  //     text: "a",
  //   }
  // })
};
