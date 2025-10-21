import { BillboardLayer, CircleLayer, EPlotType, ETransfrom, PointLayer, PolygonLayer, PolylineLayer, Transfrom, useEarth, Utils } from '../../src';
import AttackArrow from '../../src/extends/plot/geom/AttackArrow';

export const testTransfrom = () => {
  const transfrom = new Transfrom({});
  const eventNname = [ETransfrom.Select, ETransfrom.SelectEnd, ETransfrom.ModifyStart, ETransfrom.Modifying, ETransfrom.ModifyEnd, ETransfrom.Copy];
  transfrom.on(eventNname, (e) => {
    console.log(e.type, e);
    if (e.type === ETransfrom.SelectEnd) {
      const a = new AttackArrow({}, e.feature?.get('param').plotPoints, {});
      const b = useEarth().map.getAllLayers();
      // for (const item of b) {
      //   useEarth().map.removeLayer(item);
      // }
      setTimeout(() => {
        const baseLayer = new PolygonLayer();
        const coords = a.getCoordinates();
        debugger;
        const f = baseLayer?.add({
          positions: coords,
          stroke: { color: '#ffcc33', width: 2 },
          fill: { color: 'rgba(255,255,255,0.2)' }
        });
        const attackArrowParam = {
          positions: coords,
          plotType: EPlotType.AttackArrow,
          plotPoints: e.feature?.get('param').plotPoints
        };
        f?.set('param', attackArrowParam);
      }, 2000);
    }
  });
  // document.addEventListener('keydown', function (event) {
  //   // 检查是否同时按下了Ctrl键和字母S
  //   console.log(event.key, event.ctrlKey);
  //   if (event.key === 'z' && event.ctrlKey) {
  //     // 执行你的代码
  //     transfrom.undo();
  //     console.log('undo');
  //     event.preventDefault();
  //   }
  //   if (event.key === 'y' && event.ctrlKey) {
  //     // 执行你的代码
  //     transfrom.redo();
  //     // 阻止默认行为，例如防止浏览器保存页面
  //     event.preventDefault();
  //   }
  // });

  // ETransfrom.TranslateStart, ETransfrom.Translating,
};
