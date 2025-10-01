import { fromExtent } from 'ol/geom/Polygon';
import { ETransfrom, Transfrom, useEarth } from '../../src';
import { Feature } from 'ol';
import { Vector } from 'ol/layer';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

export const testTransfrom = () => {
  const transfrom = new Transfrom({});
  transfrom.on(ETransfrom.Select, (e) => {
    console.log('选中', e);
    const extent = e.feature?.getGeometry()?.getExtent();
    if (extent && extent.every(Number.isFinite)) {
      const polygon = fromExtent(extent);
      const bboxFeature = new Feature(polygon);
      const layer = new VectorLayer(
        {source: new VectorSource()}
      );
      
      // 假设 vectorLayer 是你的 ol/layer/Vector 实例
      layer.getSource()?.addFeature(bboxFeature);
      useEarth().addLayer(layer);
    }
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
