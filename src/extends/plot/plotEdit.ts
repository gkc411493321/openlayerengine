import { IPlotEditParams } from '../../interface';
import { Map } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { useEarth } from '../../useEarth';
import PolygonLayer from '../../base/PolygonLayer';
import PointLayer from '../../base/PointLayer';
import { EPlotType } from '../../enum';
import AttackArrow from './geom/AttackArrow';
import { Modify } from 'ol/interaction';
import VectorSource from 'ol/source/Vector';
import { Geometry, Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { Utils } from '../../common';

class plotEdit {
  /**
   * 地图对象
   */
  private map: Map;
  /**
   * 多边形图层
   */
  private polygonLayer: PolygonLayer | undefined;
  /**
   * 点图层
   */
  private pointLayer: PointLayer | undefined;
  /**
   * 缓存控制点
   */
  private plotPoints: Coordinate[] = [];
  /**
   * 标绘类型
   */
  private plotType: EPlotType | undefined;
  /**
   * 修改点下标
   */
  private modifyPointIndex: number | undefined;
  constructor() {
    this.map = useEarth().map;
    this.createLayer();
  }
  /**
   * 创建编辑要素图层
   */
  private createLayer() {
    this.polygonLayer = new PolygonLayer(useEarth());
    this.pointLayer = new PointLayer(useEarth());
  }
  /**
   * 创建控制点
   */
  private createEditPoint(points: Coordinate[]) {
    for (const item of points) {
      this.pointLayer?.add({
        center: item,
        stroke: { color: '#fff' },
        fill: { color: '#00aaff' }
      });
    }
  }
  /**
   * 创建编辑要素
   */
  private createEditPolygon(param: any) {
    const coords = this.getEditCoordinates(param.plotType, param.plotPoints);
    this.polygonLayer?.add({
      id: 'edit-plot',
      positions: coords,
      stroke: { color: '#00aaff', width: 2 },
      fill: { color: '#ffffff61' }
    });
  }
  /**
   * 更新编辑要素
   */
  private updateEditPolygon() {
    const coords = this.getEditCoordinates(this.plotType!, this.plotPoints);
    this.polygonLayer?.setPosition('edit-plot', coords);
  }
  /**
   * 根据plot类型获取要素坐标
   */
  private getEditCoordinates(plotType: EPlotType, plotPoints: Coordinate[]) {
    let coords: Coordinate[][] = [];
    if (plotType === EPlotType.AttackArrow) {
      const geom = new AttackArrow([], plotPoints, {});
      coords = geom.getCoordinates();
    }
    return coords;
  }
  /**
   * 创建修改监听
   */
  private createModifyEvent(modify: Modify) {
    modify.on('modifystart', (e) => {
      const center = (e.features.getArray()[0].getGeometry()! as Point).getCoordinates();
      for (let i = 0; i < this.plotPoints.length; i++) {
        const p = this.plotPoints[i];
        if (p[0] == center[0] && p[1] == center[1]) {
          this.modifyPointIndex = i;
          if (!useEarth().useGlobalEvent().hasGlobalMouseMoveEvent()) {
            useEarth().useGlobalEvent().enableGlobalMouseMoveEvent();
          }
          useEarth()
            .useGlobalEvent()
            .addMouseMoveEventByGlobal((e) => {
              if (this.modifyPointIndex !== undefined) {
                const normalizedProjected = Utils.normalizeToViewWorld(fromLonLat(e.position));
                this.plotPoints[this.modifyPointIndex] = normalizedProjected;
                // 更新多边形坐标
                this.updateEditPolygon();
              }
            });
          break;
        }
      }
    });
    modify.on('modifyend', (e) => {
      const center = (e.features.getArray()[0].getGeometry()! as Point).getCoordinates();
      const normalizedProjected = Utils.normalizeToViewWorld(center);
      if (this.modifyPointIndex !== undefined) {
        this.plotPoints[this.modifyPointIndex] = normalizedProjected;
        if (useEarth().useGlobalEvent().hasGlobalMouseMoveEvent()) {
          useEarth().useGlobalEvent().disableGlobalMouseMoveEvent();
        }
        // 更新多边形坐标
        this.updateEditPolygon();
      }
    });
    // 创建右键监听
    if (!useEarth().useGlobalEvent().hasGlobalMouseRightClickEvent()) {
      useEarth().useGlobalEvent().enableGlobalMouseRightClickEvent();
    }
    useEarth()
      .useGlobalEvent()
      .addMouseRightClickEventByGlobal(() => {
        this.pointLayer?.remove();
        this.polygonLayer?.remove();
        this.map.removeInteraction(modify);
        // off();
      });
  }
  /**
   * 激活绘制工具
   */
  public init(params: IPlotEditParams) {
    // 判断是否存在控制点
    const param = params.feature.get('param');
    if (!param || !param.plotPoints) return;
    // 记录控制点位置
    this.plotPoints = param.plotPoints;
    // 记录标绘类型
    this.plotType = param.plotType;
    // 创建控制点
    this.createEditPoint(param.plotPoints);
    // 创建多边形
    this.createEditPolygon(param);
    // 创建modify
    const modify = new Modify({ source: <VectorSource<Geometry>>this.pointLayer?.getLayer().getSource() });
    modify.set('dynamicDraw', true);
    this.map.addInteraction(modify);
    // 创建修改监听
    this.createModifyEvent(modify);
  }
}

export default plotEdit;
