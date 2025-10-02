import { BillboardLayer, CircleLayer, ETransfrom, PointLayer, PolygonLayer, PolylineLayer, Transfrom } from '../../src';

export const testTransfrom = () => {
  const transfrom = new Transfrom({});
  const eventNname = [ETransfrom.Select, ETransfrom.SelectEnd];
  transfrom.on(eventNname, (e) => {
    console.log(e.type, e);
  });

  document.addEventListener('keydown', function (event) {
    // 检查是否同时按下了Ctrl键和字母S
    if (event.key === 'z' && event.ctrlKey) {
      // 执行你的代码
      transfrom.undo();
      console.log('undo');
      event.preventDefault();
    }
    if (event.key === 'y' && event.ctrlKey) {
      // 执行你的代码
      transfrom.redo();
      // 阻止默认行为，例如防止浏览器保存页面
      event.preventDefault();
    }
  });
  // ETransfrom.TranslateStart, ETransfrom.Translating,
};
