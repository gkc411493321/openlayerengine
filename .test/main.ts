/*
 * @Description: 
 * @Version: 2.0
 * @Author: wuyue.nan
 * @Date: 2023-02-22 16:43:27
 * @LastEditors: wuyue.nan
 * @LastEditTime: 2023-02-23 16:45:14
 */
import { useEarth } from "../src/useEarth"
import { testCircleLayer } from "./base/CircleLayer";
window.onload = () => {
  const earth = useEarth();
  earth.addImageryProvider(earth.createXyzLayer('http://192.168.50.200:8080/_alllayers'));
  testCircleLayer()
}