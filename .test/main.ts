/*
 * @Description: 
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-22 16:43:27
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-03-02 17:50:52
 */
import { useEarth } from "../src/useEarth"
import { testBillboardLayer } from "./base/BillboardLayer";
import { testCircleLayer } from "./base/CircleLayer";
import { testOverlayLayer } from "./base/OverlayLayer";
import { testPointLayer } from "./base/PointLayer";
import { testPolygonLayer } from "./base/PolygonLayer";
import { testPolylineLayer } from "./base/PolylineLayer";
window.onload = () => {
  const earth = useEarth();
  earth.addImageryProvider(earth.createXyzLayer('http://192.168.50.200:8080/_alllayers'));
  testCircleLayer()
  testPointLayer()
  testPolygonLayer()
  testPolylineLayer()
  testBillboardLayer()
  testOverlayLayer()
}