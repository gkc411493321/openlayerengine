
import ExtTransform from './Transform/Transform';
import { useEarth } from '../useEarth';
import { ITransfromParams } from '../interface';

export default class Transfrom {
  constructor(options: ITransfromParams) {
    this.createTransform();
  }

  createTransform() {
    // 添加 Transform 交互
    const transforms = new ExtTransform({
      enableRotatedTransform: true,
      hitTolerance: 2,
      translate: true, // 拖拽
      translateFeature: false,
      stretch: true, // 拉伸
      scale: true, // 缩放
      rotate: true // 旋转
    });
    useEarth().map.addInteraction(transforms);
  }
}

// const transform = new olPaintTransfrom({
//   hitTolerance: 2, //点选容差，即将鼠标所在位置扩大2px进行选择
//   translate: false, // 平移-点击要素的中心触发
//   translateFeature: true, //平移-点击要素任意位置触发
//   stretch: true, // 拉伸
//   scale: true, // 缩放
//   rotate: true, // 旋转
//   noFlip: true, //禁止翻转
//   keepRectangle: true, //保持包围框为矩形状态
//   keepAspectRation: always //保持要素宽高比（缩放时）
// });
// map.addInteraction(transform);
// //开始事件
// transform.on(['rotatestart', 'translatestart'], function (e) {
//   // Rotation
//   let startangle = e.feature.get('angle') || 0;
//   // Translation
//   console.log(xxx);
//   console.log(startangle);
// });
// //旋转
// transform.on('rotating', function (e) {
//   console.log(xxx);
//   console.log('rotate: ' + ((((e.angle * 180) / Math.PI - 180) % 360) + 180).toFixed(2));
//   console.log(e);
// });
// //移动
// transform.on('translating', function (e) {
//   console.log(xxx);
//   console.log(e.delta);
//   console.log(e);
// });
// //拖拽事件
// transform.on('scaling', function (e) {
//   console.log(xxx);
//   console.log(e.scale);
//   console.log(e);
// });
// //事件结束
// transform.on(['rotateend', 'translateend', 'scaleend'], function (e) {
//   console.log(xxx);
// });
