import Earth from "Earth";
import { Feature, Map } from "ol";
import { Geometry, LineString, Point } from "ol/geom";
import { Draw } from "ol/interaction";
import VectorSource from "ol/source/Vector";
import { Fill, RegularShape, Stroke, Style, Text } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { getLength } from 'ol/sphere.js';
import { Coordinate } from "ol/coordinate";
import { FeatureLike } from "ol/Feature";
import RenderFeature from "ol/render/Feature";
import VectorLayer from "ol/layer/Vector";
import { IMeasure, IMeasureEvent } from "interface";
import { PointLayer } from "../base";
import { useEarth } from "../useEarth";
import { toLonLat } from "ol/proj";
/**
 * 测量类
 */
export default class Measure {
  /**
   * map实例
   */
  private map: Map;
  /**
   * 绘制工具
   */
  private draw?: Draw;
  /**
   * 图层
   */
  private layer: VectorLayer<VectorSource<Geometry>>;
  /**
   * 图层数据源
   */
  private source: VectorSource<Geometry>;
  /**
   * tip样式
   */
  private tipStyle: Style = new Style({
    text: new Text({
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: '#ffcc33',
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)',
      }),
      padding: [5, 5, 4, 5],
      textAlign: 'left',
      offsetX: 15,
    }),
  });
  /**
   * 公共样式
   */
  private style!: Style;
  /**
   * label样式
   */
  private labelStyle!: Style;
  /**
    * 片段样式
    */
  private segmentStyle!: Style;
  /**
   * 片段样式数组
   */
  private segmentStyles: Style[] = [];
  /**
   * 定位点图层
   */
  private pointLayer: PointLayer<unknown>;
  private measureData: IMeasureEvent = {
    data: [],
    totalDistance: 0
  };
  /**
   * 
   * @param earth 
   */
  constructor(earth: Earth) {
    this.map = earth.map;
    this.source = new VectorSource();
    this.layer = new VectorLayer({
      source: this.source,
      style: (feature) => {
        return this.styleFunction(feature);
      },
    });
    this.map.addLayer(this.layer);
    this.pointLayer = new PointLayer(useEarth());

  }
  private formatLength(line: LineString): number {
    const length = getLength(line);
    let output;
    output = Math.round((length / 1000) * 100) / 100;
    return output;
  };
  private styleFunction(feature: FeatureLike, param?: IMeasure, drawType?: string, tip?: string): Style[] {
    if (tip) {
      this.style = new Style({
        fill: new Fill({
          color: param?.lineColor || '#ffcc33',
        }),
        stroke: new Stroke({
          color: param?.lineColor || '#ffcc33',
          lineDash: [10, 10],
          width: param?.lineWidth || 2,
        }),
        image: new CircleStyle({
          radius: param?.pointSzie || 5,
          stroke: new Stroke({
            color: '#fff',
          }),
          fill: new Fill({
            color: '#ffcc33',
          }),
        }),
      })
    } else {
      this.style.getStroke().setLineDash(null);
    }
    const styles = [this.style];
    const geometry = feature.getGeometry();
    const type = geometry?.getType();
    let point: Point | undefined, label: String | any, line: LineString | undefined;
    if (!drawType || drawType === type || type === 'LineString') {
      const lineString = <LineString>geometry;
      point = new Point(lineString.getLastCoordinate());
      label = this.formatLength(lineString);
      line = lineString;
    }
    if (line) {
      this.segmentStyle = new Style({
        text: new Text({
          font: '12px Calibri,sans-serif',
          fill: new Fill({
            color: param?.textColor || '#ffcc33',
          }),
          backgroundFill: new Fill({
            color: param?.textBackgroundColor || 'rgba(0, 0, 0, 0.4)',
          }),
          padding: [4, 4, 4, 4],
          textBaseline: 'bottom',
          offsetY: -12,
        }),
        image: new RegularShape({
          radius: 6,
          points: 3,
          angle: Math.PI,
          displacement: [0, 8],
          fill: new Fill({
            color: 'rgba(0, 0, 0, 0.4)',
          }),
        }),
      })
      this.segmentStyles.push(this.segmentStyle);
      let count = 0;
      line.forEachSegment((a: Coordinate, b: Coordinate) => {
        const segment = new LineString([a, b]);
        const label = this.formatLength(segment);
        if (this.segmentStyles.length - 1 < count) {
          this.segmentStyles.push(this.segmentStyle.clone());
        }
        const segmentPoint = new Point(segment.getCoordinateAt(0.5));
        this.segmentStyles[count].setGeometry(segmentPoint);
        this.segmentStyles[count].getText().setText(label + ' km');
        styles.push(this.segmentStyles[count]);
        count++;
      });
    }
    if (label && point) {
      this.labelStyle = new Style({
        text: new Text({
          font: '12px Calibri,sans-serif',
          fill: new Fill({
            color: param?.textColor || '#ffcc33',
          }),
          backgroundFill: new Fill({
            color: param?.textBackgroundColor || 'rgba(0, 0, 0, 0.4)',
          }),
          padding: [4, 4, 4, 4],
          textBaseline: 'bottom',
          offsetY: -12,
        }),
        image: new RegularShape({
          radius: 6,
          points: 3,
          angle: Math.PI,
          displacement: [0, 8],
          fill: new Fill({
            color: 'rgba(0, 0, 0, 0.4)',
          }),
        }),
      })
      this.labelStyle.setGeometry(point);
      this.labelStyle.getText().setText('合计：' + label + ' km');
      styles.push(this.labelStyle);
    }
    if (tip && type === 'Point') {
      this.tipStyle.getText().setText(tip);
      styles.push(this.tipStyle);
    }
    return styles;
  }
  /**
   * 画线测量-分段方距
   */
  lineMeasure(param: IMeasure) {
    const activeTip = '单击继续绘制线 右击退出测量';
    const idleTip = '单击开始测量';
    let tip = idleTip;
    this.draw = new Draw({
      source: this.source,
      type: "LineString",
      style: (feature) => {
        return this.styleFunction(feature, param, "line", tip);
      },
      condition: (e) => {
        if (e.originalEvent.button == 0) {
          return true;
        } else {
          return false;
        }
      },
      finishCondition: (e) => {
        return false;
      }
    });
    this.draw.on('drawstart', () => {
      tip = activeTip;
    });
    this.draw.on('drawend', (e) => {
      tip = idleTip;
      const line = <Feature<LineString>>e.feature;
      line.getGeometry()?.getCoordinates().map(item => {
        if (param?.pointShow == undefined || param.pointShow == true) {
          this.pointLayer.add({
            center: item,
            fill: {
              color: param?.pointColor || "#fff"
            },
            size: param?.pointSzie || 3
          })
        }
      })
      let totalDistance = 0;
      line.getGeometry()?.forEachSegment((a: Coordinate, b: Coordinate) => {
        const segment = new LineString([a, b]);
        const distance = this.formatLength(segment);
        this.measureData.data.push({
          startP: toLonLat(a),
          endP: toLonLat(b),
          distance: distance
        })
        totalDistance += distance;
      })
      this.measureData.totalDistance = totalDistance;
      param.callback?.call(this, this.measureData);
    });
    useEarth().useGlobalEvent().addMouseOnceRightClickEventByGlobal(e => {
      if (this.draw) {
        this.draw.finishDrawing();
        this.map.removeInteraction(this.draw);
      }
    })
    this.map.addInteraction(this.draw);
  }
  /**
   * 清空测量
   */
  clear() {
    this.map.removeLayer(this.layer);
    this.pointLayer.destroy();
  }
}