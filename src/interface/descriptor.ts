import { Coordinate } from "ol/coordinate";

export interface IDescriptorSetParams<T> {
  /**
   * 位置
   */
  position: Coordinate;
  /**
   * 容器内容
   */
  element?: IProperties<string | number>[] | string;
  /**
   * 偏移量,默认[0,0]
   */
  offset?: number[];
  /**
   * 自定义数据
   */
  data?: T;
}
export interface IProperties<T> extends IPropertiesBase<T> {
  type?: 'text';
  options?: IKeyValue<T>[];
  color?: string;
  class?: string;
}
export interface IDescriptorParams<T> {
  /**
   * 描述器类型，list：列表，custom：自定义
   */
  type: 'list' | 'custom';
  /**
   * 是否显示定位线
   */
  isShowFixedline?: boolean;
  /**
   * 定位线颜色
   */
  fixedLineColor?: string;
  /**
   * 窗口定位模式，默认position。position：跟随地理位置固定， pixel：跟随屏幕坐标固定
   */
  fixedModel?: 'position' | 'pixel';
  /**
   * 启用拖动事件，默认开启
   */
  drag?: boolean;
  /**
   * 是否开启关闭按钮，默认开启
   */
  isShowClose?: boolean;
  /**
   * 头部
   */
  header?: string;
  /**
   * 底部
   */
  footer?: string;
  /**
   * 关闭按钮回调函数
   */
  close?: (arg: { data?: T }) => void;
}
export interface IPropertiesBase<T> extends IKeyValue<T> {
  key?: string;
  parent?: string;
}
export interface IKeyValue<T> {
  label: string;
  value: T;
}