/**
 * @description:材质类型
 */
export type MaterialType =
  | 'Color'
  | 'Image'
  | 'DiffuseMap'
  | 'AlphaMap'
  | 'BumpMap'
  | 'NormalMap'
  | 'Grid'
  | 'Stripe'
  | 'Checkerboard'
  | 'Dot'
  | 'Water'
  | 'RimLighting'
  | 'Fade'
  | 'PolylineArrow'
  | 'PolylineDash'
  | 'PolylineGlow'
  | 'PolylineOutline'
  | 'ElevationContour'
  | 'ElevationRamp'
  | 'SlopeRamp'
  | 'spectRamp';

/**
 * @description: 实体类型
 * @param {*}
 * @return {*}
 */
export enum EntityType {
  Point = 'Point',
  Polyline = 'Polyline',
  Polygon = 'Polygon',
  Circle = 'Circle',
  Rect = 'Rect',
  Billboard = 'Billboard',
  Label = 'Label',
  Heatmap = 'Heatmap',
  Model = 'Model',
  MilStd = 'MilStd',
  Custom = 'Custom'
}

/**
 * @description: 方向位置定义
 * @param {*}
 * @return {*}
 */
export type Origin = 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM';

export interface IEntityId {
  id: string;
  module?: string;
  child?: string;
  type?: string;
}

/**
 * @description: 圆属性
 */
export interface ICircle {
  longitude: number;
  latitude: number;
  radius: number;
}

export interface IHpr {
  heading: number;
  pitch: number;
  roll: number;
}
