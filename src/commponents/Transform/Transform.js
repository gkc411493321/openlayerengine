import ol_style_Style from 'ol/style/Style.js';
import ol_style_Stroke from 'ol/style/Stroke.js';
import ol_source_Vector from 'ol/source/Vector.js';
import ol_style_Fill from 'ol/style/Fill.js';
import ol_layer_Vector from 'ol/layer/Vector.js';
import ol_geom_Point from 'ol/geom/Point.js';
import ol_Feature from 'ol/Feature.js';
import ol_Collection from 'ol/Collection.js';
import ol_interaction_Pointer from 'ol/interaction/Pointer.js';
import ol_style_RegularShape from 'ol/style/RegularShape.js';
import { fromExtent as ol_geom_Polygon_fromExtent } from 'ol/geom/Polygon.js';
import {
  boundingExtent as ol_extent_boundingExtent,
  buffer as ol_extent_buffer,
  createEmpty as ol_extent_createEmpty,
  extend as ol_extent_extend,
  getCenter as ol_extent_getCenter
} from 'ol/extent.js';
import { unByKey as ol_Observable_unByKey } from 'ol/Observable.js';
import ol_geom_Polygon from 'ol/geom/Polygon.js';
import ol_ext_element from './element.js';

/** Interaction rotate
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @fires select | rotatestart | rotating | rotateend | translatestart | translating | translateend | scalestart | scaling | scaleend
 * @param {any} options
 *  @param {function} options.filter A function that takes a Feature and a Layer and returns true if the feature may be transformed or false otherwise.
 *  @param {Array<ol.Layer>} options.layers array of layers to transform,
 *  @param {ol.Collection<ol.Feature>} options.features collection of feature to transform,
 *  @param {ol.interaction.Select} [options.select] a select interaction to synchronize with
 *	@param {ol.EventsConditionType|undefined} options.condition A function that takes an ol.MapBrowserEvent and a feature collection and returns a boolean to indicate whether that event should be handled. default: ol.events.condition.always.
 *	@param {ol.EventsConditionType|undefined} options.addCondition A function that takes an ol.MapBrowserEvent and returns a boolean to indicate whether that event should be handled ie. the feature will be added to the transforms features. default: ol.events.condition.never.
 *	@param {number | undefined} options.hitTolerance Tolerance to select feature in pixel, default 0
 *	@param {bool} options.translateFeature Translate when click on feature
 *	@param {bool} options.translate Can translate the feature
 *  @param {bool} options.translateBBox Enable translate when the user drags inside the bounding box
 *	@param {bool} options.stretch can stretch the feature
 *	@param {bool} options.scale can scale the feature
 *	@param {bool} options.rotate can rotate the feature
 *	@param {bool} options.noFlip prevent the feature geometry to flip, default false
 *	@param {bool} options.selection the intraction handle selection/deselection, if not use the select prototype to add features to transform, default true
 *	@param {ol.events.ConditionType | undefined} options.keepAspectRatio A function that takes an ol.MapBrowserEvent and returns a boolean to keep aspect ratio, default ol.events.condition.shiftKeyOnly.
 *	@param {ol.events.ConditionType | undefined} options.modifyCenter A function that takes an ol.MapBrowserEvent and returns a boolean to apply scale & strech from the center, default ol.events.condition.metaKey or ol.events.condition.ctrlKey.
 *	@param {boolean} options.enableRotatedTransform Enable transform when map is rotated
 *	@param {boolean} [options.keepRectangle=false] keep rectangle when possible
 *  @param {number} [options.buffer] Increase the extent used as bounding box, default 0
 *	@param {*} options.style list of ol.style for handles
 *  @param {number|Array<number>|function} [options.pointRadius=0] radius for points or a function that takes a feature and returns the radius (or [radiusX, radiusY]). If not null show handles to transform the points
 */
var ol_interaction_Transform = class olinteractionTransform extends ol_interaction_Pointer {
  constructor(options) {
    options = options || {};
    // Extend pointer
    super({
      handleDownEvent: function (e) {
        return self.handleDownEvent_(e);
      },
      handleDragEvent: function (e) {
        return this.handleDragEvent_(e);
      },
      handleMoveEvent: function (e) {
        return this.handleMoveEvent_(e);
      },
      handleUpEvent: function (e) {
        return this.handleUpEvent_(e);
      }
    });

    var self = this;
    this.selection_ = new ol_Collection();

    // Create a new overlay layer for the sketch
    this.handles_ = new ol_Collection();
    this.overlayLayer_ = new ol_layer_Vector({
      source: new ol_source_Vector({
        features: this.handles_,
        useSpatialIndex: false,
        wrapX: false // For vector editing across the -180° and 180° meridians to work properly, this should be set to false
      }),
      name: 'Transform overlay',
      displayInLayerSwitcher: false,
      // Return the style according to the handle type
      style: function (feature) {
        return self.style[(feature.get('handle') || 'default') + (feature.get('constraint') || '') + (feature.get('option') || '')];
      },
      updateWhileAnimating: true,
      updateWhileInteracting: true
    });

    // Collection of feature to transform
    this.features_ = options.features;
    // Filter or list of layers to transform
    if (typeof options.filter === 'function') this._filter = options.filter;
    this.layers_ = options.layers ? (options.layers instanceof Array ? options.layers : [options.layers]) : null;

    this._handleEvent =
      options.condition ||
      function () {
        return true;
      };
    this.addFn_ =
      options.addCondition ||
      function () {
        return false;
      };
    this.setPointRadius(options.pointRadius);
    /* Translate when click on feature */
    this.set('translateFeature', options.translateFeature !== false);
    /* Can translate the feature */
    this.set('translate', options.translate !== false);
    /* Translate when click on the bounding box */
    this.set('translateBBox', options.translateBBox === true);
    /* Can stretch the feature */
    this.set('stretch', options.stretch !== false);
    /* Can scale the feature */
    this.set('scale', options.scale !== false);
    /* Can rotate the feature */
    this.set('rotate', options.rotate !== false);
    /* Keep aspect ratio */
    this.set(
      'keepAspectRatio',
      options.keepAspectRatio ||
        function (e) {
          return e.originalEvent.shiftKey;
        }
    );
    /* Modify center */
    this.set(
      'modifyCenter',
      options.modifyCenter ||
        function (e) {
          return e.originalEvent.metaKey || e.originalEvent.ctrlKey;
        }
    );
    /* Prevent flip */
    this.set('noFlip', options.noFlip || false);
    /* Handle selection */
    this.set('selection', options.selection !== false);
    /*  */
    this.set('hitTolerance', options.hitTolerance || 0);
    /* Enable view rotated transforms */
    this.set('enableRotatedTransform', options.enableRotatedTransform || false);
    /* Keep rectangle angles 90 degrees */
    this.set('keepRectangle', options.keepRectangle || false);
    /* Add buffer to the feature's extent */
    this.set('buffer', options.buffer || 0);

    // Force redraw when changed
    this.on('propertychange', function () {
      this.drawSketch_();
    });

    // setstyle
    this.setDefaultStyle();

    // Synchronize selection
    if (options.select) {
      // this.selection_ = options.select.getFeatures();
      this.on(
        'change:active',
        function () {
          if (this.getActive()) {
            this.setSelection(options.select.getFeatures().getArray());
          } else {
            options.select.getFeatures().extend(this.selection_);
            this.selection_.forEach(function (f) {
              options.select.getFeatures().push(f);
            });
            this.select(null);
          }
        }.bind(this)
      );
    } else {
      this.on(
        'change:active',
        function () {
          this.select(null);
        }.bind(this)
      );
    }
  }
  /**
   * Remove the interaction from its current map, if any,  and attach it to a new
   * map, if any. Pass `null` to just remove the interaction from the current map.
   * @param {ol.Map} map Map.
   * @api stable
   */
  setMap(map) {
    var oldMap = this.getMap();
    if (oldMap) {
      oldMap.removeLayer(this.overlayLayer_);
      if (this.previousCursor_) {
        ol_ext_element.setCursor(oldMap, this.previousCursor_);
      }
      this.previousCursor_ = undefined;
      // 移除事件监听
      if (this._moveendListener) {
        oldMap.un('moveend', this._moveendListener);
        this._moveendListener = null;
      }
    }
    super.setMap(map);
    this.overlayLayer_.setMap(map);
    if (map === null) {
      this.select(null);
    }
    if (map !== null) {
      this.isTouch = /touch/.test(map.getViewport().className);
      this.setDefaultStyle();
      // 添加地图拖拽后刷新编辑控件
      this._moveendListener = () => {
        this.drawSketch_();
      };
      map.on('moveend', this._moveendListener);
    }
  }
  /**
   * Activate/deactivate interaction
   * @param {bool}
   * @api stable
   */
  setActive(b) {
    // this.select(null)
    if (this.overlayLayer_) this.overlayLayer_.setVisible(b);
    super.setActive(b);
  }
  /** Set default sketch style
   * @param {Object} [options]
   *  @param {ol_style_Stroke} [stroke] stroke style for selection rectangle, default red dash
   *  @param {ol_style_Fill} [fill] fill style for selection rectangle, default red
   *  @param {ol_style_Stroke} [pointStroke] stroke style for handles, default red
   *  @param {ol_style_Fill} [pointFill] fill style for handles, default white
   */
  setDefaultStyle(options) {
    options = options || {};
    // Style
    var stroke = options.pointStroke || new ol_style_Stroke({ color: [255, 0, 0, 1], width: 1 });
    var strokedash = options.stroke || new ol_style_Stroke({ color: [255, 0, 0, 1], width: 1, lineDash: [4, 4] });
    var fill0 = options.fill || new ol_style_Fill({ color: [255, 0, 0, 0.01] });
  // var fillScale = options.pointFill || new ol_style_Fill({ color: [255, 255, 255, 0.8] }); // 未使用，移除
    var fill = options.pointFill || new ol_style_Fill({ color: [255, 255, 255, 0.8] });
    var circle = new ol_style_RegularShape({
      fill: fill,
      stroke: stroke,
      radius: this.isTouch ? 12 : 6,
      //displacement: this.isTouch ? [24, -24] : [12, -12],
      displacement: [0, 30],
      points: 15
    });
    // Old version with no displacement
    if (!circle.setDisplacement) circle.getAnchor()[0] = this.isTouch ? -10 : -5;
    var bigpt = new ol_style_RegularShape({
      stroke: new ol_style_Stroke({ color: '#f38200ff', width: 1 }),
      radius: this.isTouch ? 12 : 6,
      points: 14,
      angle: Math.PI / 4
    });
    var smallpt = new ol_style_RegularShape({
      stroke: new ol_style_Stroke({ color: '#f38200ff', width: 1 }),
      radius: this.isTouch ? 12 : 6,
      points: 14,
      angle: Math.PI / 4
    });
    function createStyle(img, stroke, fill) {
      return [new ol_style_Style({ image: img, stroke: stroke, fill: fill })];
    }
    /** Style for handles */
    this.style = {
      default: createStyle(bigpt, strokedash, fill0),
      translate: createStyle(bigpt, stroke, fill),
      rotate: createStyle(circle, stroke, fill),
      rotate0: createStyle(bigpt, stroke, fill),
      scale: createStyle(bigpt, stroke, fill),
      scale1: createStyle(bigpt, stroke, fill),
      scale2: createStyle(bigpt, stroke, fill),
      scale3: createStyle(bigpt, stroke, fill),
      scalev: createStyle(smallpt, stroke, fill),
      scaleh1: createStyle(smallpt, stroke, fill),
      scalev2: createStyle(smallpt, stroke, fill),
      scaleh3: createStyle(smallpt, stroke, fill)
    };
    this.drawSketch_();
  }
  /**
   * Set sketch style.
   * @param {style} style Style name: 'default','translate','rotate','rotate0','scale','scale1','scale2','scale3','scalev','scaleh1','scalev2','scaleh3'
   * @param {ol.style.Style|Array<ol.style.Style>} olstyle
   * @api stable
   */
  setStyle(style, olstyle) {
    if (!olstyle) return;
    if (olstyle instanceof Array) this.style[style] = olstyle;
    else this.style[style] = [olstyle];
    for (var i = 0; i < this.style[style].length; i++) {
      var im = this.style[style][i].getImage();
      if (im) {
        if (style == 'rotate') {
          im.getAnchor()[0] = -5;
        }
        if (this.isTouch) im.setScale(1.8);
      }
      var tx = this.style[style][i].getText();
      if (tx) {
        if (style == 'rotate') tx.setOffsetX(this.isTouch ? 14 : 7);
        if (this.isTouch) tx.setScale(1.8);
      }
    }
    this.drawSketch_();
  }
  /** Get Feature at pixel
   * @param {ol.Pixel}
   * @return {ol.feature}
   * @private
   */
  getFeatureAtPixel_(pixel) {
    var self = this;
    let hit =
      this.getMap().forEachFeatureAtPixel(
        pixel,
        function (feature, layer) {
          var found = false;
          // Overlay ?
            if (!layer) {
              if (feature === self.bbox_) {
                // 对点要素：允许点击 bbox 内部也能触发操作，避免只能点像素中心
                if (self.ispt_) {
                  // 如果开启平移功能，返回 translate 句柄，否则当作普通选中
                  if (self.get('translate')) {
                    return { feature: self.selection_.item(0) || feature, handle: 'translate', constraint: '', option: '' };
                  }
                  return { feature: self.selection_.item(0) || feature };
                }
                if (self.get('translateBBox')) {
                  return { feature: feature, handle: 'translate', constraint: '', option: '' };
                }
                return false;
              }
              self.handles_.forEach(function (f) {
                if (f === feature) found = true;
              });
              if (found) return { feature: feature, handle: feature.get('handle'), constraint: feature.get('constraint'), option: feature.get('option') };
            }
            // No seletion
            if (!self.get('selection')) {
              // Return the currently selected feature the user is interacting with.
              if (
                self.selection_.getArray().some(function (f) {
                  return feature === f;
                })
              ) {
                return { feature: feature };
              }
              return null;
            }
            // filter condition
            if (self._filter) {
              if (self._filter(feature, layer)) return { feature: feature };
              else return null;
            }

            // feature belong to a layer
            else if (self.layers_) {
              for (var i = 0; i < self.layers_.length; i++) {
                if (self.layers_[i] === layer) return { feature: feature };
              }
              return null;
            }

            // feature in the collection
            else if (self.features_) {
              self.features_.forEach(function (f) {
                if (f === feature) found = true;
              });
              if (found) return { feature: feature };
              else return null;
            }

            // Others
            else return { feature: feature };
        },
        { hitTolerance: this.get('hitTolerance') }
      ) || {};

    // 如果常规命中失败，额外对 Point 做一次“视觉半径”拾取，解决缩放后命中困难
    if (!hit.feature) {
      const map = this.getMap();
      if (!map) return hit;
      // 收集候选点要素（优先指定集合 / 图层）
      let candidates = [];
      if (this.features_) {
        candidates = this.features_.getArray();
      } else if (this.layers_) {
        this.layers_.forEach(l => {
          const src = l && l.getSource && l.getSource();
            if (src && src.getFeatures) candidates = candidates.concat(src.getFeatures());
        });
      } else {
        // 遍历地图所有 vector 图层（可能稍慢，但只在第一次命中失败时走）
        map.getLayers().forEach(l => {
          const src = l && l.getSource && l.getSource();
          if (src && src.getFeatures) candidates = candidates.concat(src.getFeatures());
        });
      }
      const px = pixel[0];
      const py = pixel[1];
      let best, bestDist = Infinity;
      for (let i = 0; i < candidates.length; i++) {
        const f = candidates[i];
        if (!f.getGeometry || f.getGeometry().getType() !== 'Point') continue;
        const p = f.getGeometry().getCoordinates();
        const fpixel = map.getPixelFromCoordinate(p);
        if (!fpixel) continue;
        const visualR = this._getPointVisualRadiusPixel_(f); // 已经考虑缩放的视觉半径
        const dx = fpixel[0] - px;
        const dy = fpixel[1] - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= visualR + 2 && dist < bestDist) { // +2 做轻微松弛
          best = f;
          bestDist = dist;
        }
      }
      if (best) {
        hit = { feature: best };
      }
    }
    return hit;
  }
  /** Rotate feature from map view rotation
   * @param {ol.Feature} f the feature
   * @param {boolean} clone clone resulting geom
   * @param {ol.geom.Geometry} rotated geometry
   */
  getGeometryRotateToZero_(f, clone) {
    var origGeom = f.getGeometry();
    var viewRotation = this.getMap().getView().getRotation();
    if (viewRotation === 0 || !this.get('enableRotatedTransform')) {
      return clone ? origGeom.clone() : origGeom;
    }
    var rotGeom = origGeom.clone();
    rotGeom.rotate(viewRotation * -1, this.getMap().getView().getCenter());
    return rotGeom;
  }
  /** Test if rectangle
   * @param {ol.Geometry} geom
   * @returns {boolean}
   * @private
   */
  _isRectangle(geom) {
    if (this.get('keepRectangle') && geom.getType() === 'Polygon') {
      var coords = geom.getCoordinates()[0];
      return coords.length === 5;
    }
    return false;
  }
  /** Draw transform sketch
   * @param {boolean} draw only the center
   */
  drawSketch_(center) {
    var i, f, geom;
    var keepRectangle = this.selection_.item(0) && this._isRectangle(this.selection_.item(0).getGeometry());
    this.overlayLayer_.getSource().clear();
    if (!this.selection_.getLength()) return;
    var viewRotation = this.getMap().getView().getRotation();
    var ext = this.getGeometryRotateToZero_(this.selection_.item(0)).getExtent();
    var coords;
    if (keepRectangle) {
      coords = this.getGeometryRotateToZero_(this.selection_.item(0)).getCoordinates()[0].slice(0, 4);
      coords.unshift(coords[3]);
    }
    // Clone and extend
    ext = ol_extent_buffer(ext, this.get('buffer'));
    this.selection_.forEach(
      function (f) {
        var extendExt = this.getGeometryRotateToZero_(f).getExtent();
        ol_extent_extend(ext, extendExt);
      }.bind(this)
    );

    var ptRadius = this.selection_.getLength() === 1 ? this._pointRadius(this.selection_.item(0)) : 0;
    if (ptRadius && !(ptRadius instanceof Array)) ptRadius = [ptRadius, ptRadius];

    // 只绘制一次，且在地图拖拽后自动 wrap 到当前视图
    var map = this.getMap();
    var view = map.getView();
    var proj = view.getProjection();
    var extentWidth = proj.getExtent ? proj.getExtent()[2] - proj.getExtent()[0] : 40075016.68557849; // EPSG:3857
    var centerX = view.getCenter()[0];
    // 判断选中要素是否超出当前视图，经度 wrap 到视图中心附近
    var wrapOffset = 0;
    var geomCenter = ol_extent_getCenter(ext);
    if (Math.abs(geomCenter[0] - centerX) > extentWidth / 2) {
      wrapOffset = Math.round((centerX - geomCenter[0]) / extentWidth) * extentWidth;
    }
    // 只用于控件显示，不参与交互计算
    // 控件坐标做 wrap，feature 坐标不变
    var extWrap = ext.slice();
    extWrap[0] += wrapOffset;
    extWrap[2] += wrapOffset;
    var coordsWrap = coords
      ? coords.map(function (c) {
          return [c[0] + wrapOffset, c[1]];
        })
      : coords;
    if (center === true) {
      if (!this.ispt_) {
        this.overlayLayer_
          .getSource()
          .addFeature(new ol_Feature({ geometry: new ol_geom_Point([this.center_[0] + wrapOffset, this.center_[1]]), handle: 'rotate0' }));
        geom = ol_geom_Polygon_fromExtent(extWrap);
        if (this.get('enableRotatedTransform') && viewRotation !== 0) {
          geom.rotate(viewRotation, map.getView().getCenter());
        }
        f = this.bbox_ = new ol_Feature(geom);
        this.overlayLayer_.getSource().addFeature(f);
      }
    } else {
      var ext2 = extWrap;
      if (this.ispt_) {
        var p = map.getPixelFromCoordinate([ol_extent_getCenter(ext2)[0], ol_extent_getCenter(ext2)[1]]);
        if (p) {
          var dx = ptRadius ? ptRadius[0] || 10 : 10;
          var dy = ptRadius ? ptRadius[1] || 10 : 10;
          ext2 = ol_extent_boundingExtent([map.getCoordinateFromPixel([p[0] - dx, p[1] - dy]), map.getCoordinateFromPixel([p[0] + dx, p[1] + dy])]);
        }
      }
      geom = keepRectangle ? new ol_geom_Polygon([coordsWrap]) : ol_geom_Polygon_fromExtent(ext2);
      if (this.get('enableRotatedTransform') && viewRotation !== 0) {
        geom.rotate(viewRotation, map.getView().getCenter());
      }
      f = this.bbox_ = new ol_Feature(geom);
      var features = [];
      var g = geom.getCoordinates()[0];
      if (!this.ispt_ || ptRadius) {
        features.push(f);
        // Middle
        if (!this.iscircle_ && !this.ispt_ && this.get('stretch') && this.get('scale'))
          for (i = 0; i < g.length - 1; i++) {
            f = new ol_Feature({
              geometry: new ol_geom_Point([(g[i][0] + g[i + 1][0]) / 2, (g[i][1] + g[i + 1][1]) / 2]),
              handle: 'scale',
              constraint: i % 2 ? 'h' : 'v',
              option: i
            });
            features.push(f);
          }
        // Handles
        if (this.get('scale'))
          for (i = 0; i < g.length - 1; i++) {
            f = new ol_Feature({ geometry: new ol_geom_Point(g[i]), handle: 'scale', option: i });
            features.push(f);
          }
        // Center
        if (this.get('translate') && !this.get('translateFeature')) {
          f = new ol_Feature({ geometry: new ol_geom_Point([(g[0][0] + g[2][0]) / 2, (g[0][1] + g[2][1]) / 2]), handle: 'translate' });
          features.push(f);
        }
      }
      // Rotate handle: lines/polygons always; point only if it has Icon-like image (getSrc or getImageSize)
      if (!this.iscircle_ && this.get('rotate')) {
        let allowRotate = true;
        if (this.ispt_) {
          allowRotate = false;
          if (this.selection_.getLength() === 1) {
            const pf = this.selection_.item(0);
            if (this._pointHasIconImage_(pf)) allowRotate = true;
          }
        }
        if (allowRotate) {
          f = new ol_Feature({ geometry: new ol_geom_Point([(g[0][0] + g[2][0]) / 2, g[2][1]]), handle: 'rotate' });
          features.push(f);
        }
      }
      // 点要素也添加四个角的scale handle
      if (this.ispt_ && this.get('scale')) {
        for (i = 0; i < g.length - 1; i++) {
          f = new ol_Feature({ geometry: new ol_geom_Point(g[i]), handle: 'scale', option: i });
          features.push(f);
        }
      }
      // Add sketch
      this.overlayLayer_.getSource().addFeatures(features);
    }
  }
  /** Select a feature to transform
   * @param {ol.Feature} feature the feature to transform
   * @param {boolean} add true to add the feature to the selection, default false
   */
  select(feature, add) {
    if (!feature) {
      if (this.selection_) {
        this.selection_.clear();
        this.drawSketch_();
      }
      return;
    }
    if (!feature.getGeometry || !feature.getGeometry()) return;
    // Add to selection
    if (add) {
      this.selection_.push(feature);
    } else {
      var index = this.selection_.getArray().indexOf(feature);
      this.selection_.removeAt(index);
    }
    this.ispt_ = this.selection_.getLength() === 1 ? this.selection_.item(0).getGeometry().getType() == 'Point' : false;
    this.iscircle_ = this.selection_.getLength() === 1 ? this.selection_.item(0).getGeometry().getType() == 'Circle' : false;
    this.drawSketch_();
    this.watchFeatures_();
    // select event
    this.dispatchEvent({ type: 'select', feature: feature, features: this.selection_ });
  }
  /** Update the selection collection.
   * @param {ol.Collection<ol.Feature>} features the features to transform
   */
  setSelection(features) {
    this.selection_.clear();
    features.forEach(
      function (feature) {
        this.selection_.push(feature);
      }.bind(this)
    );

    this.ispt_ = this.selection_.getLength() === 1 ? this.selection_.item(0).getGeometry().getType() == 'Point' : false;
    this.iscircle_ = this.selection_.getLength() === 1 ? this.selection_.item(0).getGeometry().getType() == 'Circle' : false;
    this.drawSketch_();
    this.watchFeatures_();
    // select event
    this.dispatchEvent({ type: 'select', features: this.selection_ });
  }
  /** Watch selected features
   * @private
   */
  watchFeatures_() {
    // Listen to feature modification
    if (this._featureListeners) {
      this._featureListeners.forEach(function (l) {
        ol_Observable_unByKey(l);
      });
    }
    this._featureListeners = [];
    this.selection_.forEach(
      function (f) {
        this._featureListeners.push(
          f.on(
            'change',
            function () {
              if (!this.isUpdating_) {
                this.drawSketch_();
              }
            }.bind(this)
          )
        );
      }.bind(this)
    );
  }
  /**
   * @param {ol.MapBrowserEvent} evt Map browser event.
   * @return {boolean} `true` to start the drag sequence.
   * @private
   */
  handleDownEvent_(evt) {
    if (!this._handleEvent(evt, this.selection_)) return;
    var sel = this.getFeatureAtPixel_(evt.pixel);
    var feature = sel.feature;
    if (
      this.selection_.getLength() &&
      this.selection_.getArray().indexOf(feature) >= 0 &&
      ((this.ispt_ && this.get('translate')) || this.get('translateFeature'))
    ) {
      sel.handle = 'translate';
    }
    if (sel.handle) {
      this.mode_ = sel.handle;
      this.opt_ = sel.option;
      this.constraint_ = sel.constraint;
      // Save info
      var viewRotation = this.getMap().getView().getRotation();
      // Get coordinate of the handle (for snapping)
      this.coordinate_ = feature.get('handle') ? feature.getGeometry().getCoordinates() : evt.coordinate;
      this.pixel_ = this.getMap().getCoordinateFromPixel(this.coordinate_); // evt.pixel;
      this.geoms_ = [];
      this.rotatedGeoms_ = [];
      var extent = ol_extent_createEmpty();
      var rotExtent = ol_extent_createEmpty();
      this.hasChanged_ = false;
      // eslint-disable-next-line no-cond-assign
      for (var i = 0, f; (f = this.selection_.item(i)); i++) {
        this.geoms_.push(f.getGeometry().clone());
        extent = ol_extent_extend(extent, f.getGeometry().getExtent());
        if (this.get('enableRotatedTransform') && viewRotation !== 0) {
          var rotGeom = this.getGeometryRotateToZero_(f, true);
          this.rotatedGeoms_.push(rotGeom);
          rotExtent = ol_extent_extend(rotExtent, rotGeom.getExtent());
        }
      }
      this.extent_ = ol_geom_Polygon_fromExtent(extent).getCoordinates()[0];
      if (this.get('enableRotatedTransform') && viewRotation !== 0) {
        this.rotatedExtent_ = ol_geom_Polygon_fromExtent(rotExtent).getCoordinates()[0];
      }
      // 设置鼠标为 grabbing
      var element = evt.map.getTargetElement();
      this._prevCursorStyle = element.style.cursor;
      ol_ext_element.setCursor(element, this.Cursors.mouseDown || 'grabbing');
      if (this.mode_ === 'rotate') {
        this.center_ = this.getCenter() || ol_extent_getCenter(extent);
      } else {
        this.center_ = ol_extent_getCenter(extent);
      }
      // 修复：初始化旋转角度时也做 wrap，保证首次旋转无跳变
      var mouseX = evt.coordinate[0];
      var map = this.getMap();
      var view = map.getView();
      var proj = view.getProjection();
      var extentWidth = proj.getExtent ? proj.getExtent()[2] - proj.getExtent()[0] : 40075016.68557849; // EPSG:3857
      if (Math.abs(mouseX - this.center_[0]) > extentWidth / 2) {
        mouseX = mouseX + Math.round((this.center_[0] - mouseX) / extentWidth) * extentWidth;
      }
      this.angle_ = Math.atan2(this.center_[1] - evt.coordinate[1], this.center_[0] - mouseX);

      // 点缩放：记录归一化起点与基准长度，避免跨屏 wrap 造成缩放比例跳变
      if (this.mode_ === 'scale' && this.ispt_) {
        const view = this.getMap().getView();
        const proj = view.getProjection();
        const extentWidth = proj.getExtent ? proj.getExtent()[2] - proj.getExtent()[0] : 40075016.68557849;
        const normalize = (coord, center) => {
          let x = coord[0];
          if (Math.abs(x - center[0]) > extentWidth / 2) {
            x = x + Math.round((center[0] - x) / extentWidth) * extentWidth;
          }
          return [x, coord[1]];
        };
        this._ptDownCoordNorm = normalize(this.coordinate_, this.center_);
        const v = [this._ptDownCoordNorm[0] - this.center_[0], this._ptDownCoordNorm[1] - this.center_[1]];
        this._ptBaseLen = Math.sqrt(v[0] * v[0] + v[1] * v[1]) || 1;
      }

      this.dispatchEvent({
        type: this.mode_ + 'start',
        feature: this.selection_.item(0),
        features: this.selection_,
        pixel: evt.pixel,
        coordinate: evt.coordinate
      });
      return true;
    } else if (this.get('selection')) {
      if (feature) {
        if (!this.addFn_(evt)) this.selection_.clear();
        var index = this.selection_.getArray().indexOf(feature);
        if (index < 0) this.selection_.push(feature);
        else this.selection_.removeAt(index);
      } else {
        this.selection_.clear();
      }
      this.ispt_ = this.selection_.getLength() === 1 ? this.selection_.item(0).getGeometry().getType() == 'Point' : false;
      this.iscircle_ = this.selection_.getLength() === 1 ? this.selection_.item(0).getGeometry().getType() == 'Circle' : false;
      this.drawSketch_();
      this.watchFeatures_();
      const type = feature ? 'select' : 'selectend';
      this.dispatchEvent({ type, feature: feature, features: this.selection_, pixel: evt.pixel, coordinate: evt.coordinate });
      return false;
    }
  }
  /**
   * Get the rotation center
   * @return {ol.coordinate|undefined}
   */
  getCenter() {
    return this.get('center');
  }
  /**
   * Set the rotation center
   * @param {ol.coordinate|undefined} c the center point, default center on the objet
   */
  setCenter(c) {
    return this.set('center', c);
  }
  /**
   * @param {ol.MapBrowserEvent} evt Map browser event.
   * @private
   */
  handleDragEvent_(evt) {
    if (!this._handleEvent(evt, this.features_)) return;
    function wrapToCenter(x, centerX, extentWidth) {
      if (Math.abs(x - centerX) > extentWidth / 2) {
        return x + Math.round((centerX - x) / extentWidth) * extentWidth;
      }
      return x;
    }
    const map = this.getMap();
    const view = map.getView();
    const proj = view.getProjection();
    const extentWidth = proj.getExtent ? proj.getExtent()[2] - proj.getExtent()[0] : 40075016.68557849; // EPSG:3857
    const centerX = view.getCenter()[0];
    let geomCenter = this.center_ || [0, 0];
    if (this.selection_ && this.selection_.getLength()) {
      geomCenter = ol_extent_getCenter(this.selection_.item(0).getGeometry().getExtent());
    }
    let wrapOffset = 0;
    if (Math.abs(geomCenter[0] - centerX) > extentWidth / 2) {
      wrapOffset = Math.round((centerX - geomCenter[0]) / extentWidth) * extentWidth;
    }
    const viewRotation = view.getRotation();
    let i, j, f, geometry;
    const pt0 = [this.coordinate_[0], this.coordinate_[1]];
    const pt = [evt.coordinate[0], evt.coordinate[1]];
    this.isUpdating_ = true;
    this.hasChanged_ = true;
    switch (this.mode_) {
      case 'rotate': {
        // ...existing code...
        var mouseX = pt[0];
        if (Math.abs(mouseX - this.center_[0]) > extentWidth / 2) {
          mouseX = mouseX + Math.round((this.center_[0] - mouseX) / extentWidth) * extentWidth;
        }
        var a = Math.atan2(this.center_[1] - pt[1], this.center_[0] - mouseX);
        for (i = 0, f; (f = this.selection_.item(i)); i++) {
          geometry = this.geoms_[i].clone();
          // 对非点几何直接旋转 geometry
          if (geometry.getType() !== 'Point') {
            geometry.rotate(a - this.angle_, this.center_);
            if (geometry.getType() == 'Circle') geometry.setCenterAndRadius(geometry.getCenter(), geometry.getRadius());
            f.setGeometry(geometry);
          } else {
            // Point：仅当是 Icon / image 样式时才旋转（不旋转纯 RegularShape/Circle）
            if (this._pointHasIconImage_(f)) {
              const style = f.getStyle && f.getStyle();
              if (style && typeof style.getImage === 'function') {
                const img = style.getImage();
                if (img && typeof img.setRotation === 'function') {
                  const baseRot = this._ptBaseRotation != null ? this._ptBaseRotation : (typeof img.getRotation === 'function' ? img.getRotation() || 0 : 0);
                  if (this._ptBaseRotation == null) this._ptBaseRotation = baseRot; // 记录初始角度
                  // 修复：Point 图标旋转方向与鼠标拖动方向相反 => 取反增量
                  // geometry.rotate 使用 (a - this.angle_) 获得正确方向；Icon 在 OL 中正角度同为逆时针
                  // 若出现方向相反，说明此处需要反向增量
                  img.setRotation(baseRot - (a - this.angle_));
                  if (typeof f.changed === 'function') f.changed();
                }
              }
            }
          }
        }
        this.drawSketch_(true);
        this.dispatchEvent({
          type: 'rotating',
          feature: this.selection_.item(0),
          features: this.selection_,
          angle: a - this.angle_,
          pixel: evt.pixel,
          coordinate: [mouseX, pt[1]]
        });
        break;
      }
      case 'translate': {
        // ...existing code...
        var deltaX = pt[0] - pt0[0];
        var deltaY = pt[1] - pt0[1];
        for (i = 0, f; (f = this.selection_.item(i)); i++) {
          f.getGeometry().translate(deltaX, deltaY);
        }
        this.handles_.forEach(function (f) {
          f.getGeometry().translate(deltaX, deltaY);
        });
        this.coordinate_ = evt.coordinate;
        this.dispatchEvent({
          type: 'translating',
          feature: this.selection_.item(0),
          features: this.selection_,
          delta: [deltaX, deltaY],
          pixel: evt.pixel,
          coordinate: evt.coordinate
        });
        break;
      }
      case 'scale': {
        // 点要素缩放/拉伸
        if (this.ispt_) {
          const feature = this.selection_.item(0);
          const style = feature.getStyle ? feature.getStyle() : null;
          const center = this.center_;
          const view = this.getMap().getView();
          const proj = view.getProjection();
          const extentWidth = proj.getExtent ? proj.getExtent()[2] - proj.getExtent()[0] : 40075016.68557849;
          // 归一化（wrap）当前拖拽坐标与起始坐标
          const normalize = (coord, ctr) => {
            let x = coord[0];
            if (Math.abs(x - ctr[0]) > extentWidth / 2) {
              x = x + Math.round((ctr[0] - x) / extentWidth) * extentWidth;
            }
            return [x, coord[1]];
          };
          const downCoordinate = this._ptDownCoordNorm || normalize(this.coordinate_, center);
          const dragCoordinate = normalize(evt.coordinate, center);
          const v0 = [downCoordinate[0] - center[0], downCoordinate[1] - center[1]];
          const v1 = [dragCoordinate[0] - center[0], dragCoordinate[1] - center[1]];
          const len1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
          const baseLen = this._ptBaseLen || Math.sqrt(v0[0] * v0[0] + v0[1] * v0[1]) || 1;
          const minScale = 0.2;
            let scale = len1 / baseLen;
          if (scale < minScale) scale = minScale;
          // 始终等比缩放
          const scx = scale, scy = scale;
          // 修改 image size 或 style size
          if (style && typeof style.getImage === 'function' && style.getImage()) {
            const image = style.getImage();
            // Circle / RegularShape 情况：只有 radius，没有 width/height
            if (typeof image.getRadius === 'function' && typeof image.setRadius === 'function') {
              if (!this._ptCircleBaseRadius) {
                this._ptCircleBaseRadius = image.getRadius();
                this._ptCircleBaseLen = baseLen;
              }
              let newRadius = this._ptCircleBaseRadius * (len1 / (this._ptCircleBaseLen || 1));
              if (newRadius < 2) newRadius = 2; // 最小半径保护
              image.setRadius(newRadius);
            }
            // 优先 setScale，避免 setSize 导致锯齿 (针对 Icon / 图像样式)
            else if (typeof image.setScale === 'function' && typeof image.getScale === 'function') {
              const baseScale = image.getScale() || 1;
              if (!this._ptImageBaseScale) {
                this._ptImageBaseScale = baseScale;
                this._ptImageBaseLen = baseLen;
              }
              let trueScale = this._ptImageBaseScale * (len1 / (this._ptImageBaseLen || 1));
              if (trueScale < minScale) trueScale = minScale;
              image.setScale(trueScale);
            } else if (typeof image.setSize === 'function' && typeof image.getSize === 'function') {
              const imgSize = image.getSize();
              if (imgSize && imgSize.length === 2) {
                // 鼠标按下时记录原始 size，避免叠加误差
                if (!this._ptImageBaseSize) {
                  this._ptImageBaseSize = imgSize.slice();
                  this._ptImageBaseLen = baseLen;
                }
                let newW = this._ptImageBaseSize[0] * (len1 / (this._ptImageBaseLen || 1));
                let newH = this._ptImageBaseSize[1] * (len1 / (this._ptImageBaseLen || 1));
                if (newW < 5) newW = 5;
                if (newH < 5) newH = 5;
                image.setSize([newW, newH]);
              }
            }
          } else if (style && typeof style.getSize === 'function' && typeof style.setSize === 'function') {
            const styleSize = style.getSize();
            if (styleSize && styleSize.length === 2) {
              // 鼠标按下时记录原始 size，避免叠加误差
              if (!this._ptStyleBaseSize) {
                this._ptStyleBaseSize = styleSize.slice();
                this._ptStyleBaseLen = baseLen;
              }
              let newW = this._ptStyleBaseSize[0] * (len1 / (this._ptStyleBaseLen || 1));
              let newH = this._ptStyleBaseSize[1] * (len1 / (this._ptStyleBaseLen || 1));
              if (newW < 5) newW = 5;
              if (newH < 5) newH = 5;
              style.setSize([newW, newH]);
            }
          }
          feature.changed && feature.changed();
          this.drawSketch_(); // bbox 跟随缩放
          this.dispatchEvent({
            type: 'scaling',
            feature: feature,
            features: this.selection_,
            scale: [scx, scy],
            pixel: evt.pixel,
            coordinate: evt.coordinate
          });
          break;
        }
        // ...existing code for non-point...
        let center = this.center_;
        if (this.get('modifyCenter')(evt)) {
          let extentCoordinates = this.extent_;
          if (this.get('enableRotatedTransform') && viewRotation !== 0) {
            extentCoordinates = this.rotatedExtent_;
          }
          center = extentCoordinates[(Number(this.opt_) + 2) % 4];
        }
        const keepRectangle = this.geoms_.length == 1 && this._isRectangle(this.geoms_[0]);
        const stretch = this.constraint_;
        const opt = this.opt_;
        let downCoordinate = this.coordinate_;
        let dragCoordinate = evt.coordinate;
        downCoordinate = [wrapToCenter(downCoordinate[0], center[0], extentWidth), downCoordinate[1]];
        dragCoordinate = [wrapToCenter(dragCoordinate[0], center[0], extentWidth), dragCoordinate[1]];
        if (this.get('enableRotatedTransform') && viewRotation !== 0) {
          var downPoint = new ol_geom_Point(downCoordinate);
          downPoint.rotate(viewRotation * -1, center);
          downCoordinate = downPoint.getCoordinates();
          var dragPoint = new ol_geom_Point(dragCoordinate);
          dragPoint.rotate(viewRotation * -1, center);
          dragCoordinate = dragPoint.getCoordinates();
        }
        var dx0 = downCoordinate[0] - center[0];
        var dy0 = downCoordinate[1] - center[1];
        var dx1 = dragCoordinate[0] - center[0];
        var dy1 = dragCoordinate[1] - center[1];
        var scx = dx0 === 0 ? 1 : dx1 / dx0;
        var scy = dy0 === 0 ? 1 : dy1 / dy0;
        var displacementVector = [dragCoordinate[0] - downCoordinate[0], dragCoordinate[1] - downCoordinate[1]];
        if (this.get('enableRotatedTransform') && viewRotation !== 0) {
          var centerPoint = new ol_geom_Point(center);
          centerPoint.rotate(viewRotation * -1, this.getMap().getView().getCenter());
          center = centerPoint.getCoordinates();
        }
        if (this.get('noFlip')) {
          if (scx < 0) scx = -scx;
          if (scy < 0) scy = -scy;
        }
        if (this.constraint_) {
          if (this.constraint_ == 'h') scx = 1;
          else scy = 1;
        } else {
          if (this.get('keepAspectRatio')(evt)) {
            scx = scy = Math.min(scx, scy);
          }
        }
        for (i = 0, f; (f = this.selection_.item(i)); i++) {
          geometry = viewRotation === 0 || !this.get('enableRotatedTransform') ? this.geoms_[i].clone() : this.rotatedGeoms_[i].clone();
          geometry.applyTransform(
            function (g1, g2, dim) {
              if (dim < 2) return g2;
              if (!keepRectangle) {
                for (j = 0; j < g1.length; j += dim) {
                  if (scx != 1) g2[j] = center[0] + (g1[j] - center[0]) * scx;
                  if (scy != 1) g2[j + 1] = center[1] + (g1[j + 1] - center[1]) * scy;
                }
              } else {
                var pointArray = [[6], [0, 8], [2], [4]];
                var pointA = [g1[0], g1[1]];
                var pointB = [g1[2], g1[3]];
                var pointC = [g1[4], g1[5]];
                var pointD = [g1[6], g1[7]];
                var pointA1 = [g1[8], g1[9]];
                if (stretch) {
                  var base = opt % 2 === 0 ? this._countVector(pointA, pointB) : this._countVector(pointD, pointA);
                  var projectedVector = this._projectVectorOnVector(displacementVector, base);
                  var nextIndex = opt + 1 < pointArray.length ? opt + 1 : 0;
                  var coordsToChange = [...pointArray[opt], ...pointArray[nextIndex]];
                  for (j = 0; j < g1.length; j += dim) {
                    g2[j] = coordsToChange.includes(j) ? g1[j] + projectedVector[0] : g1[j];
                    g2[j + 1] = coordsToChange.includes(j) ? g1[j + 1] + projectedVector[1] : g1[j + 1];
                  }
                } else {
                  var projectedLeft, projectedRight;
                  switch (opt) {
                    case 0:
                      displacementVector = this._countVector(pointD, dragCoordinate);
                      projectedLeft = this._projectVectorOnVector(displacementVector, this._countVector(pointC, pointD));
                      projectedRight = this._projectVectorOnVector(displacementVector, this._countVector(pointA, pointD));
                      [g2[0], g2[1]] = this._movePoint(pointA, projectedLeft);
                      [g2[4], g2[5]] = this._movePoint(pointC, projectedRight);
                      [g2[6], g2[7]] = this._movePoint(pointD, displacementVector);
                      [g2[8], g2[9]] = this._movePoint(pointA1, projectedLeft);
                      break;
                    case 1:
                      displacementVector = this._countVector(pointA, dragCoordinate);
                      projectedLeft = this._projectVectorOnVector(displacementVector, this._countVector(pointD, pointA));
                      projectedRight = this._projectVectorOnVector(displacementVector, this._countVector(pointB, pointA));
                      [g2[0], g2[1]] = this._movePoint(pointA, displacementVector);
                      [g2[2], g2[3]] = this._movePoint(pointB, projectedLeft);
                      [g2[6], g2[7]] = this._movePoint(pointD, projectedRight);
                      [g2[8], g2[9]] = this._movePoint(pointA1, displacementVector);
                      break;
                    case 2:
                      displacementVector = this._countVector(pointB, dragCoordinate);
                      projectedLeft = this._projectVectorOnVector(displacementVector, this._countVector(pointA, pointB));
                      projectedRight = this._projectVectorOnVector(displacementVector, this._countVector(pointC, pointB));
                      [g2[0], g2[1]] = this._movePoint(pointA, projectedRight);
                      [g2[2], g2[3]] = this._movePoint(pointB, displacementVector);
                      [g2[4], g2[5]] = this._movePoint(pointC, projectedLeft);
                      [g2[8], g2[9]] = this._movePoint(pointA1, projectedRight);
                      break;
                    case 3:
                      displacementVector = this._countVector(pointC, dragCoordinate);
                      projectedLeft = this._projectVectorOnVector(displacementVector, this._countVector(pointB, pointC));
                      projectedRight = this._projectVectorOnVector(displacementVector, this._countVector(pointD, pointC));
                      [g2[2], g2[3]] = this._movePoint(pointB, projectedRight);
                      [g2[4], g2[5]] = this._movePoint(pointC, displacementVector);
                      [g2[6], g2[7]] = this._movePoint(pointD, projectedLeft);
                      break;
                  }
                }
              }
              if (geometry.getType() == 'Circle') geometry.setCenterAndRadius(geometry.getCenter(), geometry.getRadius());
              return g2;
            }.bind(this)
          );
          if (this.get('enableRotatedTransform') && viewRotation !== 0) {
            geometry.rotate(viewRotation, this.getMap().getView().getCenter());
          }
          f.setGeometry(geometry);
        }
        this.drawSketch_();
        this.dispatchEvent({
          type: 'scaling',
          feature: this.selection_.item(0),
          features: this.selection_,
          scale: [scx, scy],
          pixel: evt.pixel,
          coordinate: [evt.coordinate[0] + wrapOffset, evt.coordinate[1]]
        });
        break;
      }
      default:
        break;
    }
    this.isUpdating_ = false;
  }
  /**
   * @param {ol.MapBrowserEvent} evt Event.
   * @private
   */
  handleMoveEvent_(evt) {
    if (!this._handleEvent(evt, this.features_)) return;
    // 仅在有选中元素且未处于编辑模式下触发 enterHandle/leaveHandle 事件
    if (!this.mode_ && this.selection_ && this.selection_.getLength() > 0) {
      var sel = this.getFeatureAtPixel_(evt.pixel);
      var element = evt.map.getTargetElement();
      if (sel.feature) {
        var c = sel.handle ? this.Cursors[(sel.handle || 'default') + (sel.constraint || '') + (sel.option || '')] : this.Cursors.select;
        if (this.previousCursor_ === undefined) {
          this.previousCursor_ = element.style.cursor;
        }
        ol_ext_element.setCursor(element, c);
        this.dispatchEvent({
          type: 'enterHandle',
          cursor: c,
          eventPixel: evt.pixel
        });
      } else {
        if (this.previousCursor_ !== undefined) {
          ol_ext_element.setCursor(element, this.previousCursor_);
        }
        this.previousCursor_ = undefined;
        this.dispatchEvent({
          type: 'leaveHandle',
          eventPixel: evt.pixel
        });
      }
    }
  }
  /**
   * @param {ol.MapBrowserEvent} evt Map browser event.
   * @return {boolean} `false` to stop the drag sequence.
   */
  handleUpEvent_(evt) {
  // 清理点缩放的临时基准
  this._ptImageBaseScale = undefined;
  this._ptImageBaseLen = undefined;
  this._ptImageBaseSize = undefined;
  this._ptStyleBaseSize = undefined;
  this._ptStyleBaseLen = undefined;
  this._ptDownCoordNorm = undefined;
  this._ptBaseLen = undefined;
  this._ptCircleBaseRadius = undefined;
  this._ptCircleBaseLen = undefined;
  this._ptBaseRotation = undefined;
    // 鼠标抬起时恢复为按下前的样式
    var element = evt.map.getTargetElement();
    if (this._prevCursorStyle !== undefined) {
      ol_ext_element.setCursor(element, this._prevCursorStyle);
      this._prevCursorStyle = undefined;
    } else if (this.mode_ === 'rotate') {
      ol_ext_element.setCursor(element, this.Cursors.default);
      this.previousCursor_ = undefined;
    }

    // 修复拖拽后元素消失（wrapX）
    if (this.mode_ === 'translate' && this.selection_ && this.selection_.getLength()) {
      var map = this.getMap();
      var view = map.getView();
      var proj = view.getProjection();
      var extentWidth = proj.getExtent ? proj.getExtent()[2] - proj.getExtent()[0] : 40075016.68557849; // EPSG:3857
      var centerX = view.getCenter()[0];
      // eslint-disable-next-line no-cond-assign
      for (var i = 0, f; (f = this.selection_.item(i)); i++) {
        var geom = f.getGeometry();
        var geomCenter = geom.getType() === 'Point' ? geom.getCoordinates() : ol_extent_getCenter(geom.getExtent());
        var wrapOffset = 0;
        if (Math.abs(geomCenter[0] - centerX) > extentWidth / 2) {
          wrapOffset = Math.round((centerX - geomCenter[0]) / extentWidth) * extentWidth;
        }
        if (wrapOffset !== 0) {
          // 平移 geometry 到当前 wrap 屏
          var wrapCoord = function (x, extentWidth) {
            var half = extentWidth / 2;
            // wrap 到 [-half, half]
            return ((((x + half) % extentWidth) + extentWidth) % extentWidth) - half;
          };
          if (geom.getType() === 'Point') {
            var x = geomCenter[0] + wrapOffset;
            x = wrapCoord(x, extentWidth);
            geom.setCoordinates([x, geomCenter[1]]);
          } else if (geom.getType() === 'LineString' || geom.getType() === 'MultiPoint') {
            var coords = geom.getCoordinates().map(function (c) {
              var x = c[0] + wrapOffset;
              x = wrapCoord(x, extentWidth);
              return [x, c[1]];
            });
            geom.setCoordinates(coords);
          } else if (geom.getType() === 'Polygon' || geom.getType() === 'MultiLineString') {
            // eslint-disable-next-line no-redeclare
            var coords = geom.getCoordinates().map(function (ring) {
              return ring.map(function (c) {
                var x = c[0] + wrapOffset;
                x = wrapCoord(x, extentWidth);
                return [x, c[1]];
              });
            });
            geom.setCoordinates(coords);
          } else if (geom.getType() === 'MultiPolygon') {
            // eslint-disable-next-line no-redeclare
            var coords = geom.getCoordinates().map(function (poly) {
              return poly.map(function (ring) {
                return ring.map(function (c) {
                  var x = c[0] + wrapOffset;
                  x = wrapCoord(x, extentWidth);
                  return [x, c[1]];
                });
              });
            });
            geom.setCoordinates(coords);
          } else if (geom.getType() === 'Circle') {
            var c = geom.getCenter();
            // eslint-disable-next-line no-redeclare
            var x = c[0] + wrapOffset;
            x = wrapCoord(x, extentWidth);
            geom.setCenterAndRadius([x, c[1]], geom.getRadius());
          }
          // 强制触发 feature.changed()，确保主图层重新渲染
          if (typeof f.changed === 'function') {
            f.changed();
          }
          // 自动检测主图层并重新添加 feature
          // eslint-disable-next-line no-redeclare
          var map = this.getMap();
          if (map && map.getLayers) {
            var layers = map.getLayers().getArray();
            layers.forEach(function (layer) {
              var source = layer.getSource && layer.getSource();
              if (source && typeof source.getFeatures === 'function' && source.getFeatures().indexOf(f) !== -1) {
                // 确保 wrapX 为 true
                if (typeof source.setWrapX === 'function') {
                  source.setWrapX(true);
                } else if (source.wrapX !== undefined) {
                  source.wrapX = true;
                }
                // 重新索引 feature
                source.removeFeature(f);
                source.addFeature(f);
              }
            });
          }
        }
      }
    }

    //dispatchEvent
    this.dispatchEvent({
      type: this.mode_ + 'end',
      feature: this.selection_.item(0),
      features: this.selection_,
      oldgeom: this.geoms_[0],
      oldgeoms: this.geoms_,
      // handle changes
      transformed: this.hasChanged_
    });

    this.drawSketch_();
    this.hasChanged_ = false;
    this.mode_ = null;
    return false;
  }
  /** Set the point radius to calculate handles on points
   *  @param {number|Array<number>|function} [pointRadius=0] radius for points or a function that takes a feature and returns the radius (or [radiusX, radiusY]). If not null show handles to transform the points
   */
  setPointRadius(pointRadius) {
    if (typeof pointRadius === 'function') {
      this._pointRadius = pointRadius;
    } else {
      // 自动推断 pointRadius
      this._pointRadius = function (feature) {
        // 只对 Point 类型要素处理
        if (feature && feature.getGeometry && feature.getGeometry().getType() === 'Point') {
          // 1. 优先取 feature 的 style.image.width
          const style = feature.getStyle ? feature.getStyle() : null;
          if (style && typeof style.getImage === 'function') {
            const image = style.getImage();
            if (image) {
              let s = 1;
              if (typeof image.getScale === 'function') s = image.getScale() || 1;
              // 优先尝试 imageSize（Icon 常用）
              if (typeof image.getImageSize === 'function') {
                const isz = image.getImageSize();
                if (isz && isz.length === 2) {
                  return [ (isz[0] * s) / 2, (isz[1] * s) / 2 ];
                }
              }
              // Icon / Image: 使用 width / height
              let w = null, h = null;
              if (typeof image.getWidth === 'function') w = image.getWidth();
              if (typeof image.getHeight === 'function') h = image.getHeight();
              // getSize
              if ((!w || !h) && typeof image.getSize === 'function') {
                const sz = image.getSize();
                if (sz && sz.length === 2) {
                  if (!w) w = sz[0];
                  if (!h) h = sz[1];
                }
              }
              if (w && h) {
                return [ (w * s) / 2, (h * s) / 2 ];
              } else if (w) {
                return (w * s) / 2; // 退回单值
              }
              // Circle / RegularShape: 使用 radius * scale
              if (typeof image.getRadius === 'function') {
                const r = image.getRadius();
                if (r) return [ r * s, r * s ];
              }
            }
          }
          // 2. 其次取 style.size
          if (style && typeof style.getSize === 'function') {
            const styleSize = style.getSize();
            if (styleSize && styleSize[0] && styleSize[1]) {
              return [ styleSize[0] / 2, styleSize[1] / 2 ];
            }
          }
        }
        // 3. 否则用默认 pointRadius
        return pointRadius || 50;
      };
    }
  }
  /** 获取点要素视觉半径（像素）内部使用，与 _pointRadius 保持一致但不会返回函数引用 */
  _getPointVisualRadiusPixel_(feature) {
    try {
      if (!feature || !feature.getGeometry || feature.getGeometry().getType() !== 'Point') return 0;
      const style = feature.getStyle ? feature.getStyle() : null;
      if (style && typeof style.getImage === 'function') {
        const image = style.getImage();
        if (image) {
          let scale = 1;
          if (typeof image.getScale === 'function') scale = image.getScale() || 1;
          if (typeof image.getImageSize === 'function') {
            const isz = image.getImageSize();
            if (isz && isz.length === 2) return Math.max(isz[0], isz[1]) * scale / 2;
          }
          if (typeof image.getWidth === 'function') {
            const w = image.getWidth();
            if (w) return (w * scale) / 2;
          }
          if (typeof image.getSize === 'function') {
            const sz = image.getSize();
            if (sz && sz.length === 2) return (Math.max(sz[0], sz[1]) * scale) / 2;
          }
          if (typeof image.getRadius === 'function') {
            const r = image.getRadius();
            if (r) return r * scale;
          }
        }
      }
      if (style && typeof style.getSize === 'function') {
        const s = style.getSize();
        if (s && s.length === 2) return Math.max(s[0], s[1]) / 2;
      }
      return 8; // 保守默认
    } catch (e) {
      return 8;
    }
  }
  /** Get the features that are selected for transform
   * @return ol.Collection
   */
  getFeatures() {
    return this.selection_;
  }
  /**
   * @private
   */
  _projectVectorOnVector(displacement_vector, base) {
    var k = (displacement_vector[0] * base[0] + displacement_vector[1] * base[1]) / (base[0] * base[0] + base[1] * base[1]);
    return [base[0] * k, base[1] * k];
  }
  /**
   * @private
   */
  _countVector(start, end) {
    return [end[0] - start[0], end[1] - start[1]];
  }
  /**
   * @private
   */
  _movePoint(point, displacementVector) {
    return [point[0] + displacementVector[0], point[1] + displacementVector[1]];
  }
  /** 判断 point 要素是否具有可旋转的图片（Icon / Image），排除 RegularShape / Circle
   * @private
   */
  _pointHasIconImage_(feature) {
    if (!feature || !feature.getGeometry || feature.getGeometry().getType() !== 'Point') return false;
    const style = feature.getStyle && feature.getStyle();
    if (!style || typeof style.getImage !== 'function') return false;
    const img = style.getImage();
    if (!img) return false;
    // RegularShape / Circle 通常有 getRadius，排除
    if (typeof img.getRadius === 'function') return false;
    // Icon / Image 通常具备 getSrc 或 getImageSize
    if (typeof img.getSrc === 'function') return true;
    if (typeof img.getImageSize === 'function' && img.getImageSize()) return true;
    // 兜底：存在宽高也认为是图片
    if (typeof img.getSize === 'function' && img.getSize()) return true;
    return false;
  }
};

/** Cursors for transform
 */
ol_interaction_Transform.prototype.Cursors = {
  default: 'auto',
  select: 'pointer',
  translate: 'move',
  rotate: 'grab',
  rotate0: 'grab',
  scale: 'nesw-resize',
  scale1: 'nwse-resize',
  scale2: 'nesw-resize',
  scale3: 'nwse-resize',
  scalev: 'ew-resize',
  scaleh1: 'ns-resize',
  scalev2: 'ew-resize',
  scaleh3: 'ns-resize',
  mouseDown: 'grabbing'
};

export default ol_interaction_Transform;
