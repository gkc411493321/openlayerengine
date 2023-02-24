/*
 * @Author: wuyue
 * @Date: 2021-01-11 17:01:24
 * @LastEditTime: 2023-02-23 15:23:01
 * @LastEditors: wuyue.nan
 * @Description: 工具类
 */

import { defined, Entity, HeadingPitchRoll, PrimitiveCollection, Math } from 'cesium';
import { IEntityId } from '../ast';

export default class Utils {
  static separator = '⚝';
  /**
   * @description: 获取一个新的GUID
   * @param {'N'|'D'|'B'|'P'|'X'} format 输出字符串样式，N-无连接符、D-减号连接符，BPX-未实现，默认D
   * @return {string}
   */
  static GetGUID(format: 'N' | 'D' | 'B' | 'P' | 'X' = 'D'): string {
    const gen = (count: number) => {
      let out = '';
      for (let i = 0; i < count; i++) {
        out += (((1 + window.Math.random()) * 0x10000) | 0).toString(16).substring(1);
      }
      return out;
    };
    const arr = [gen(2), gen(1), gen(1), gen(1), gen(3)];
    let guid: string;
    switch (format) {
      case 'N':
        guid = arr.join('');
        break;
      case 'D':
        guid = arr.join('-');
        break;
      default:
        guid = arr.join('-');
        break;
    }
    return guid;
  }

  /**
   * @description:
   * @param {number} heading
   * @param {number} startPitch
   * @param {number} endPitch
   * @param {number} startDirection
   * @param {number} endDirection
   */
  static genHpr(heading: number, pitch: number, roll: number, startPitch: number, endPitch: number, startDirection: number, endDirection: number) {
    const xHalfAngle = (endPitch - startPitch) / 2;
    const p = xHalfAngle + startPitch + pitch;
    const yHalfAngle = (endDirection - startDirection) / 2;
    const hpr = new HeadingPitchRoll(Math.toRadians(heading + 90), Math.toRadians(-p + 90), Math.toRadians(roll));
    return { hpr, xHalfAngle, pitch: p, yHalfAngle, roll };
  }

  /**
   * @description: 对实体ID进行编码
   * @param {string} type 实体类型
   * @param {string} id
   * @return {*} 格式:'Type_ChildrenType_占位_占位_ID'
   */
  static EncodeEntityId({ id, module, child, type }: IEntityId) {
    if (module || child || type) {
      return `${encodeURIComponent(module || '')}${this.separator}${encodeURIComponent(id)}${this.separator}${encodeURIComponent(child || '')}${this.separator
        }${encodeURIComponent(type || '')}`;
    } else {
      return id;
    }
  }

  /**
   * @description: 对实体ID进行解码
   * @param {string} id
   * @return {*}
   */
  static DecodeEntityId(id: string) {
    const ids = id.split(this.separator);
    const ido: IEntityId = { id: '' };
    ido.module = decodeURIComponent(ids[0]);
    if (ids.length >= 4) {
      ido.id = decodeURIComponent(ids[1]);
      ido.child = decodeURIComponent(ids[2]);
      ido.type = decodeURIComponent(ids[3]);
    }
    return ido;
  }

  /**
   * @description: 数字转字符串,长度不够就补0
   * @param {object} num 需要转换的数字
   * @param {number} len 填充长度
   * @param {string} radix 进制基数
   * @return {*}
   */
  static ZeroFill(num: { toString: (arg0: number) => string }, len: number, radix: number | undefined) {
    return num.toString(radix || 10).padStart(len, '0');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static removePrimitive(entity: Entity, hash: Record<string, any>, primitives: PrimitiveCollection) {
    const data = hash[entity.id];
    if (defined(data)) {
      const primitive = data.primitive;
      primitives.remove(primitive);
      if (!primitive.isDestroyed()) {
        primitive.destroy();
      }
      delete hash[entity.id];
    }
  }

  /**
   * @description: 防抖函数
   * @param {Function} fn
   * @param {number} delay
   * @return {*}
   */
  static debounce(fn: Function, delay = 200) {
    let timer: number | undefined;
    return {
      clear: () => window.clearTimeout(timer),
      exec: (...args: object[]) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          fn.apply(fn, args);
        }, delay);
      }
    };
  }

  /**
   * @description: 格式化经度
   * @param {number} longitude 经度
   * @param {number} format DMS:度分秒(Degrees Minute Second) DMSS:度分秒简写(Degrees Minute Second Short)
   * @return {*}
   */
  static formatGeoLongitude(longitude: number, format: 'DMS' | 'DMSS' = 'DMS') {
    if (!/^-?\d{1,3}(.\d+)?$/g.test(longitude.toString())) return longitude.toString();
    const absLongitude = window.Math.abs(longitude);
    const d = window.Math.floor(absLongitude);
    const f = window.Math.floor((absLongitude - d) * 60);
    const m = window.Math.floor((absLongitude - d) * 3600 - f * 60);
    let result = '';
    if (format === 'DMS') {
      result = `${window.Math.abs(d)}°${f}′${m}″${longitude >= 0 ? 'E' : 'W'}`;
    } else if (format === 'DMSS') {
      result = window.Math.abs(d) + '' + ((f < 10 ? '0' : '') + f) + '' + ((m < 10 ? '0' : '') + m) + '' + (longitude >= 0 ? 'E' : 'W');
    }
    return result;
  }

  /**
   * @description: 格式化纬度
   * @param {number} latitude 纬度
   * @param {number} format DMS:度分秒(Degrees Minute Second) DMSS:度分秒简写(Degrees Minute Second Short)
   * @return {*}
   */
  static formatGeoLatitude(latitude: number, format: 'DMS' | 'DMSS' = 'DMS') {
    if (!/^-?\d{1,2}(.\d+)?$/g.test(latitude.toString())) return latitude.toString();
    const absLatitude = window.Math.abs(latitude);
    const d = window.Math.floor(absLatitude);
    const f = window.Math.floor((absLatitude - d) * 60);
    const m = window.Math.floor((absLatitude - d) * 3600 - f * 60);
    let result = '';
    if (format === 'DMS') {
      result = `${window.Math.abs(d)}°${f}′${m}″${latitude >= 0 ? 'N' : 'S'}`;
    } else if (format === 'DMSS') {
      result = window.Math.abs(d) + '' + ((f < 10 ? '0' : '') + f) + '' + ((m < 10 ? '0' : '') + m) + '' + (latitude >= 0 ? 'N' : 'S');
    }
    return result;
  }
}
