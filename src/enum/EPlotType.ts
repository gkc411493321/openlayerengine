/**
 * 标绘类型
 */
export enum EPlotType {
  /**
   * 进攻箭头（平尾-多点）
   */
  AttackArrow = 'attackArrow',
  /**
   * 进攻箭头（燕尾-多点）
   */
  TailedAttackArrow = 'tailedAttackArrow',
  /**
   * 单箭头（平尾-2点）
   */
  FineArrow = 'fineArrow',
  /**
   * 单箭头（燕尾-2点）
   */
  TailedSquadCombatArrow = 'tailedSquadCombatArrow',
  /**
   * 单直箭头（平尾-2点）
   */
  AssaultDirectionArrow = 'assaultDirectionArrow',
  /**
   * 双箭头
   */
  DoubleArrow = 'doubleArrow',
  /**
   * 集结地
   */
  AssemblePolygon = 'assemblePolygon',
  /**
   * 闭合曲面
   */
  ClosedCurvePolygon = 'closedCurvePolygon',
  /**
   * 扇形
   */
  SectorPolygon = 'sectorPolygon',
  /**
   * 正圆
   */
  Circle = 'circle',
  /**
   * 椭圆
   */
  Ellipse = 'ellipse',
  /**
   * 弓形(区域)
   */
  LunePolygon = 'lunePolygon',
  /**
   * 弓形(线)
   */
  LuneLine = 'luneLine',
  /**
   * 曲线
   */
  CurvePolyline = 'curvePolyline',
}
