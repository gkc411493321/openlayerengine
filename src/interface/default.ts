import { ECursor, ETransfrom, ETranslateType } from '../enum';
import { Feature } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { Geometry, Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { PanIntoViewOptions, Positioning } from 'ol/Overlay';
import { Size } from 'ol/size';
import VectorSource from 'ol/source/Vector';
import { IconAnchorUnits, IconOrigin } from 'ol/style/Icon';
import { IField, IOptions } from 'wind-core';

/**
 * 新增元素的基础参数
 */
export interface IAddBaseParam<T> extends IBaseData<T> {
  /** 唯一ID */ id?: string;
}
/**
 * 附加数据
 */
export interface IBaseData<T> {
  /** 模块名称 */ module?: string;
  /** 附加数据 */ data?: T;
}
export interface ICircleParam<T> extends IAddBaseParam<T> {
  /**
   * 圆中心
   */
  center: Coordinate;
  /**
   * 圆半径，单位m
   */
  radius: number;
  /**
   * 边框样式
   */
  stroke?: IStroke;
  /**
   * 填充样式
   */
  fill?: IFill;
  /**
   * 标签样式
   */
  label?: ILabel;
}
export interface ISetCircleParam {
  /**
   * id
   */
  id: string;
  /**
   * 圆中心
   */
  center?: Coordinate;
  /**
   * 圆半径，单位m
   */
  radius?: number;
  /**
   * 边框样式
   */
  stroke?: IStroke;
  /**
   * 填充样式
   */
  fill?: IFill;
  /**
   * 标签样式
   */
  label?: ILabel;
}
export interface IPointParam<T> extends IAddBaseParam<T> {
  /**
   * 点中心
   */
  center: Coordinate;
  /**
   * 点大小
   */
  size?: number;
  /**
   * 是否开启闪烁点，默认false
   */
  isFlash?: boolean;
  /**
   * 闪烁颜色，默认为rgb(255,0,0)
   */
  flashColor?: IRgbColor;
  /**
   * 闪烁一次持续时间，默认1000ms
   */
  duration?: number;
  /**
   * 是否重复闪烁，默认为true;该属性在isFlash属性为true时生效
   */
  isRepeat?: boolean;
  /**
   * 边框样式
   */
  stroke?: IStroke;
  /**
   * 填充样式
   */
  fill?: IFill;
  /**
   * 标签样式
   */
  label?: ILabel;
}
export interface ISetPointParam {
  /**
   * id
   */
  id: string;
  /**
   * 点中心
   */
  center?: Coordinate;
  /**
   * 点大小
   */
  size?: number;
  /**
   * 是否开启闪烁点，默认false
   */
  isFlash?: boolean;
  /**
   * 闪烁颜色，默认为rgb(255,0,0)
   */
  flashColor?: IRgbColor;
  /**
   * 闪烁一次持续时间，默认1000ms
   */
  duration?: number;
  /**
   * 是否重复闪烁，默认为true;该属性在isFlash属性为true时生效
   */
  isRepeat?: boolean;
  /**
   * 边框样式
   */
  stroke?: IStroke;
  /**
   * 填充样式
   */
  fill?: IFill;
  /**
   * 标签样式
   */
  label?: ILabel;
}
export interface IBillboardParam<T> extends IAddBaseParam<T> {
  /**
   * 点中心
   */
  center: Coordinate;
  /**
   * 图片地址
   */
  src: string;
  /**
   * 图片大小,[width,height]
   */
  size?: Size;
  /**
   * 图标颜色,未指定则图标保持原样
   */
  color?: string;
  /**
   * 图标位移，单位是像素，默认[0,0]。正值将使图标向右和向上移动。
   */
  displacement?: number[];
  /**
   * 图标缩放，默认为1
   */
  scale?: number | Size;
  /**
   * 旋转，默认0，单位度，范围0-360，正北为0，顺时针旋转
   */
  rotation?: number;
  /**
   * 锚，默认值是图标中心:[0.5,0.5]
   */
  anchor?: number[];
  /**
   * 锚的来源，默认top-left
   */
  anchorOrigin?: IconOrigin;
  /**
   * 指定锚 x 值的单位，默认'fraction'。'fraction'表示 x 值是图标的一部分。'pixels'表示以像素为单位的 x 值。
   */
  anchorXUnits?: IconAnchorUnits;
  /**
   * 指定锚 y 值的单位，默认'fraction'。'fraction'表示 y 值是图标的一部分。'pixels'表示以像素为单位的 y 值。
   */
  anchorYUnits?: IconAnchorUnits;
  /**
   * 标签样式
   */
  label?: ILabel;
}
export interface ISetBillboardParam {
  /**
   * id
   */
  id: string;
  /**
   * 点中心
   */
  center?: Coordinate;
  /**
   * 图片地址
   */
  src?: string;
  /**
   * 图片大小,[width,height]
   */
  size?: Size;
  /**
   * 图标颜色,未指定则图标保持原样
   */
  color?: string;
  /**
   * 图标位移，单位是像素，默认[0,0]。正值将使图标向右和向上移动。
   */
  displacement?: number[];
  /**
   * 图标缩放，默认为1
   */
  scale?: number;
  /**
   * 旋转，默认0
   */
  rotation?: number;
  /**
   * 锚，默认值是图标中心:[0.5,0.5]
   */
  anchor?: number[];
  /**
   * 标签样式
   */
  label?: ILabel;
}
export interface IRgbColor {
  R: number;
  G: number;
  B: number;
}
export interface IOverlayParam<T> extends IAddBaseParam<T> {
  /**
   * DOM容器
   */
  element: HTMLElement;
  /**
   * 位置
   */
  position: Coordinate;
  /**
   * 偏移量,默认[0,0]
   */
  offset?: number[];
  /**
   * 定位模式，默认'top-left'
   */
  positioning?: Positioning;
  /**
   * 地图的事件传播是否停止,默认为true，即阻止传播。举例：当鼠标在地图上进行缩放时会触发缩放事件，但在Overlay上滚动鼠标则不会触发地图缩放事件，若想要触发事件，则设置该属性为false
   */
  stopEvent?: boolean;
  /**
   * Overlay是否应该先添加到其所在的容器（当前地图容器），默认为true；举例：当stopEvent设置为true时，overlay和openlayers的控件（controls）是放于一个容器的，此时将insertFirst设置为true ，overlay会首先添加到容器。这样，overlay默认在控件的下一层。所以当stopEvent和insertFirst都采用默认值时，overlay默认在控件的下一层
   */
  insertFirst?: boolean;
  /**
   * 当Overlay超出地图边界时，地图自动移动，以保证Overlay全部可见，默认为false。PanIntoViewOptions：{animation：设置 autoPan 的效果动画，margin：地图自动平移时，地图边缘与overlay的留白（空隙），单位是像素，默认是 20像素}
   */
  autoPan?: PanIntoViewOptions | boolean;
  /**
   * class类名，默认'ol-overlay-container ol-selectable'
   */
  className?: string;
}
export interface ISetOverlayParam {
  /**
   * id
   */
  id: string;
  /**
   * DOM容器
   */
  element?: HTMLElement;
  /**
   * 位置
   */
  position?: Coordinate;
  /**
   * 偏移量,默认[0,0]
   */
  offset?: number[];
  /**
   * 定位模式，默认'top-left'
   */
  positioning?: Positioning;
}
export interface IPolygonParam<T> extends IAddBaseParam<T> {
  /**
   * 点集合
   */
  positions: Coordinate[][];
  /**
   * 边框样式
   */
  stroke?: IStroke;
  /**
   * 填充样式
   */
  fill?: IFill;
  /**
   * 标签样式
   */
  label?: ILabel;
}
export interface ISetPolygonParam {
  /**
   * id
   */
  id: string;
  /**
   * 点集合
   */
  positions?: Coordinate[][];
  /**
   * 边框样式
   */
  stroke?: IStroke;
  /**
   * 填充样式
   */
  fill?: IFill;
  /**
   * 标签样式
   */
  label?: ILabel;
}
export interface IPolylineParam<T> extends IAddBaseParam<T> {
  /**
   * 点集合
   */
  positions: number[][];
  /**
   * 线宽，默认为2
   */
  width?: number;
  /**
   * 边框样式
   */
  stroke?: IStroke;
  /**
   * 填充样式
   */
  fill?: IFill;
  /**
   * 标签样式
   */
  label?: ILabel;
  /**
   * 箭头线
   */
  isArrow?: boolean;
  /**
   * 箭头是否重复,isArrow为true生效
   */
  arrowIsRepeat?: boolean;
  /**
   * 流水线
   */
  isFlowingDash?: boolean;
  /**
   * 流水线实线填充色 isFlowingDash为true生效
   */
  fullLineColor?: string;
  /**
   * 流水线虚线填充色 isFlowingDash为true生效
   */
  dottedLineColor?: string;
}
export interface ISetPolylineParam {
  /**
   * id
   */
  id: string;
  /**
   * 点集合
   */
  positions?: number[][];
  /**
   * 线宽，默认为2
   */
  width?: number;
  /**
   * 边框样式
   */
  stroke?: IStroke;
  /**
   * 填充样式
   */
  fill?: IFill;
  /**
   * 标签样式
   */
  label?: ILabel;
  /**
   * 箭头线
   */
  isArrow?: boolean;
  /**
   * 箭头是否重复,isArrow为true生效
   */
  arrowIsRepeat?: boolean;
  /**
   * 流水线
   */
  isFlowingDash?: boolean;
  /**
   * 流水线实线填充色 isFlowingDash为true生效
   */
  fullLineColor?: string;
  /**
   * 流水线虚线填充色 isFlowingDash为true生效
   */
  dottedLineColor?: string;
}
export interface IPolylineFlyParam<T> extends IAddBaseParam<T>, IFlightLineParams {
  /**
   * 点集合
   */
  position: number[][];
  /**
   * 线宽,默认2
   */
  width?: number;
  /**
   * 是否重复播放，默认为true
   */
  isRepeat?: boolean;
  /**
   * 是否展示定位点,默认为true
   */
  isShowAnchorPoint?: boolean;
  /**
   * 是否展示定位线,默认为false。当重复播放属性为false时，此属性生效
   */
  isShowAnchorLine?: boolean;
  /**
   * 是否显示箭头,默认为true
   */
  isShowArrow?: boolean;
  /**
   * 飞行线颜色, 可设置为纯色或渐变色, 默认渐变色
   */
  color?: string | IRadialColor;
  /**
   * 定位线颜色
   */
  anchorLineColor?: string;
  /**
   * 箭头颜色
   */
  arrowColor?: string;
}
export interface IFlightLineParams {
  /**
   * 分割线长度，默认180。该值越高则曲线越平滑
   */
  splitLength?: number;
  /**
   * 每帧耗时多少秒，默认为0。值越大则播放速度越慢。
   */
  oneFrameLimitTime?: number;
  /**
   * 线段弯曲程度，默认为1。值越大，则弯曲程度越高
   */
  controlRatio?: number;
}
export interface IPointsFeature {
  id: string;
  feature: Feature<Point>[];
}
export interface IFlyPosition {
  id: string;
  position: number[][];
}
export interface IRadialColor {
  0: string;
  0.2: string;
  0.4: string;
  0.6: string;
  0.8: string;
  1.0: string;
  [key: number]: string;
}
export interface IStroke {
  /**
   * 颜色
   */
  color?: string;
  /**
   * 线宽
   */
  width?: number;
  /**
   * 线形，如[20,20,20,20]。数组下标0和2代表实线长度，1和3代表虚线长度，默认为null
   */
  lineDash?: number[];
  /**
   * 偏移量
   */
  lineDashOffset?: number;
  /**
   * 是否将 lineDash 视为“比例 pattern”并自动按当前屏幕像素总长度放大，使整条线恰好显示一轮 pattern；
   * true 时 lineDash 不循环；随视图缩放 / 线坐标变化自动重新计算。
   */
  fitPatternOnce?: boolean;
}
export interface IFill {
  /**
   * 颜色
   */
  color?: string;
}
export interface ILabel {
  /**
   * 文本
   */
  text: string;
  /**
   * 字体及字体大小。注意！！！必须遵循css字体样式，如：'10px sans-serif' | 'bold 10px sans-serif'
   */
  font?: string;
  /**
   * 水平偏移，单位是像素
   */
  offsetX?: number;
  /**
   * 垂直偏移，单位是像素
   */
  offsetY?: number;
  /**
   * 缩放
   */
  scale?: number;
  /**
   * 文本对齐方式，'left' | 'right' | 'center' | 'end'
   */
  textAlign?: CanvasTextAlign;
  /**
   * 文本基线， 'bottom' | 'top' | 'middle' | 'alphabetic' | 'hanging' | 'ideographic'
   */
  textBaseline?: CanvasTextBaseline;
  /**
   * 文本颜色
   */
  fill?: IFill;
  /**
   * 文本边框颜色
   */
  stroke?: IStroke;
  /**
   * 文本背景颜色
   */
  backgroundFill?: IFill;
  /**
   * 文本背景边框颜色
   */
  backgroundStroke?: IStroke;
  /**
   * 文本padding
   */
  padding?: number[];
  /**
   * 顺时针旋转，默认为0
   */
  rotation?: number;
}
export interface IMeasureData {
  /**
   * 开始点
   */
  startP: Coordinate;
  /**
   * 结束点
   */
  endP: Coordinate;
  /**
   * 距离(KM)
   */
  distance: number;
}
export interface IMeasureEvent {
  /**
   * 分段测量数据
   */
  data: IMeasureData[] | any;
  /**
   * 总距
   */
  totalDistance?: number;
  /**
   * 面积
   */
  area?: number;
}
export interface IMeasure {
  /**
   * 线颜色
   */
  lineColor?: string;
  /**
   * 线宽
   */
  lineWidth?: number;
  /**
   * 是否展示定位点
   */
  pointShow?: boolean;
  /**
   * 定位点颜色
   */
  pointColor?: string;
  /**
   * 定位点大小
   */
  pointSzie?: number;
  /**
   * 文本颜色
   */
  textColor?: string;
  /**
   * 文本大小
   */
  textSize?: number;
  /**
   * 背景色
   */
  textBackgroundColor?: string;
  /**
   * 显示总距
   */
  isShowTotalDistance?: boolean;
  /**
   * 回调函数
   */
  callback?: (e: IMeasureEvent) => void;
}
export interface IWindOptions {
  /**
   * 粒子透明度，影响粒子拖尾长度，默认0.9
   */
  globalAlpha?: number;
  /**
   * 粒子运动速度,默认1/25
   */
  velocityScale?: number;
  /**
   * 粒子数量，默认3000
   */
  paths?: number;
  /**
   * 粒子宽度，默认1
   */
  lineWidth?: number;
  /**
   * 粒子颜色
   */
  colorScale?: string | string[] | ((e: number) => void);
}
export interface ISetWindParam {
  /**
   * 数据
   */
  data: any;
  /**
   * id,唯一标识符
   */
  id: string;
  /**
   * 属性
   */
  options?: Partial<IField>;
}
export interface ISetWindOptions {
  /**
   * id,唯一标识符
   */
  id: string;
  /**
   * 属性
   */
  options: Partial<IOptions>;
}

export interface IWindParam extends IWindOptions {
  /**
   * 数据
   */
  data: any;
  /**
   * id,唯一标识符
   */
  id?: string;
  /**
   * 类名
   */
  className?: string;
}

export interface ITransformCallback {
  /**
   * 绘制类型
   */
  type: ETransfrom;
  /**
   * 像素位置
   */
  eventPixel?: number[];
  /**
   * 鼠标事件类型，用于鼠标进入和离开变换点事件
   */
  cursor?: ECursor;
  /**
   * 坐标位置
   */
  eventPosition?: Coordinate | Coordinate[];
  /**
   * 元素id
   */
  featureId?: string;
  /**
   * 元素
   */
  feature?: Feature<Geometry>;
  /**
   * 元素坐标
   */
  featurePosition?: Coordinate | Coordinate[];
}

export interface ITransfromParams {
  /**
   * 点选容差，默认值2，即将鼠标所在位置扩大2px进行选择
   */
  hitTolerance?: number;
  /**
   * 是否可以平移，默认点击要素任意位置平移 ETranslateType.feature
   */
  translateType?: ETranslateType;
  /**
   * 是否可以缩放，默认true
   */
  scale?: boolean;
  /**
   * 是否可以拉伸，默认true, scale属性为false时该属性无效， 此参数在point元素无效
   */
  stretch?: boolean;
  /**
   * 是否可以旋转，默认true,此参数在circle元素无效
   */
  rotate?: boolean;
  /**
   * 传入一个函数，判断该要素是否可以执行变换，true表示可以，false表示不可以
   */
  beforeTransform?: (e: Feature) => boolean;
  /**
   * 传入一个可参与变换的图层数组，默认全部地图图层都可参与变换
   */
  transformLayers?: Array<VectorLayer<VectorSource<Geometry>>>;
  /**
   * 传入一个可参与变换的元素数组，默认全部地图元素都可参与变换
   */
  transformFeatures?: Array<Feature>;
  /**
   * 历史记录最大缓存次数（一次选中周期内），默认 10。
   * 仅在一次 Select -> SelectEnd 生命周期内生效，SelectEnd 时会清空。
   */
  historyLimit?: number;
}
