import { useEarth } from "../src/useEarth"
import { testBillboardLayer } from "./base/BillboardLayer";
import { testCircleLayer } from "./base/CircleLayer";
import { testOverlayLayer } from "./base/OverlayLayer";
import { testPointLayer } from "./base/PointLayer";
import { testPolygonLayer } from "./base/PolygonLayer";
import { testPolylineLayer } from "./base/PolylineLayer";
import { testWindLayer } from "./base/WindLayer";
import { testDescriptor } from "./commponents/Descriptor";
import { testDynamicDraw } from "./commponents/DynamicDraw";
import { testGlobalEvent } from "./commponents/GlobalEvent";
import { testMeasure } from "./commponents/Measure";
import '../src/style/index.scss';

window.onload = () => {
  const earth = useEarth();
  earth.addLayer(earth.createXyzLayer('http://192.168.50.200:8080/_alllayers'));
  testCircleLayer()
  testPointLayer()
  testPolygonLayer()
  testPolylineLayer()
  testBillboardLayer()
  testOverlayLayer();
  testGlobalEvent();
  testDynamicDraw();
  testMeasure();
  testWindLayer();
  testDescriptor();
  // // 创建地图


  // // 创建地图
  // const map = new Map({
  //   target: 'olContainer', // 地图容器的id
  //   layers: [
  //     // 添加一个瓦片图层作为底图
  //     new TileLayer({
  //       source: new OSM(),
  //     }),
  //   ],
  //   view: new View({
  //     center: [0, 0], // 设置地图中心点
  //     zoom: 2, // 设置地图缩放级别
  //   }),
  // });

  // const features: any = [];
  // const gfsx = gfs;
  // let a: DataGrid = [];
  // type LatLonGrid = Array<Array<{ lat: number, lon: number }>>;
  // type DataGrid = Array<Array<{ lat: number, lon: number, value: number }>>;
  // for (const item of gfsx) {
  //   const { la1, la2, dy, lo1, lo2, dx, nx, ny } = item.header;
  //   const data_values = item.data;

  //   const lats = Array.from(Array(nx), (_, i) => la1 + i * dy);
  //   const lons = Array.from(Array(ny), (_, i) => lo1 + i * dx);

  //   const latlon_grid: LatLonGrid = lats.map(lat => lons.map(lon => ({ lat, lon })));

  //   const result: DataGrid = latlon_grid.map((row, i) =>
  //     row.map((coords, j) => ({ ...coords, value: data_values[i * ny + j] }))
  //   );
  //   a = result;
  // }
  // for (const item of a) {
  //   for (const items of item) {
  //     const feature = new Feature({
  //       geometry: new Point(fromLonLat([items.lon, items.lat])),
  //       value: items.value, // 颜色值，可以根据自己的需求进行改变
  //     });
  //     features.push(feature);
  //   }
  // }


  // // 创建数据源
  // const source = new VectorSource({
  //   features,
  // });
  // // 创建图层
  // const layer = new VectorLayer({
  //   source,
  //   updateWhileAnimating: true,
  //   updateWhileInteracting: true,
  // });


  // // 设置点的大小和颜色属性
  // const sizeAttr = 'size';
  // const colorAttr = 'color';

  // // 创建渲染器
  // const renderer = new WebGLPointsLayerRenderer(layer, {
  //   colorCallback: (index: number, x: number, y: number, x2: number, y2: number, data: number[]) => {
  //     // 计算颜色点的值
  //     const hue = computeHue(data[index]);
  //     // 使用hue计算颜色值
  //     const color = Color.fromHsl(hue, 1, 0.5);
  //     // 返回颜色点的值
  //     return [color[0], color[1], color[2], 255];
  //   },
  //   fragmentShader: `precision mediump float;
  //   varying vec4 vColor;
  //   void main() {
  //     gl_FragColor = vColor;
  //   }`,
  //   sizeCallback: (index: number, x: number, y: number, x2: number, y2: number, data: number[]) => {
  //     // 计算点的大小
  //     const size = computeSize(data[index]);
  //     // 返回点的大小值
  //     return size;
  //   },
  //   vertexShader: `attribute vec2 position;
  //   attribute float ${sizeAttr};
  //   attribute vec4 ${colorAttr};
  //   uniform vec2 resolution;
  //   varying vec4 vColor;
  //   ${glslPosition}
  //   ${glslData}
  //   void main() {
  //     vec2 pixel = vec2(1.0, 1.0) / resolution;
  //     vec2 offset = pixel * ${sizeAttr};
  //     vec2 pos = computePosition(position, offset, ${sizeAttr}, resolution);
  //     gl_Position = vec4(pos, 0.0, 1.0);
  //     vColor = ${colorAttr};
  //   }`
  // });



  // // 将图层添加到地图中
  // map.addLayer(layer);


}
