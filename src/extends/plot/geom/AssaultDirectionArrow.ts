/**
 * 粗单直箭头
 */
import { EPlotType } from '@/enum';
import FineArrow from './FineArrow';

class AssaultDirection extends FineArrow {
  constructor(coordinates: any, points: any, params: any) {
    super(coordinates, points, params);
    this.tailWidthFactor = 0.03;
    this.neckWidthFactor = 0.1;
    this.headWidthFactor = 0.15;
    this.type = EPlotType.AssaultDirectionArrow;
    this.headAngle = Math.PI / 5.5;
    this.neckAngle = Math.PI / 12;
    if (points && points.length > 0) {
      this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      this.setCoordinates(coordinates);
    }
    this.set('params', params);
  }
}

export default AssaultDirection;
