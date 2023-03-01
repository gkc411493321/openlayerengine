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
   * @description: 线性插值函数 此处的计算只处理二维带x ,y 的向量
   * @param {number[]} startPos
   * @param {number[]} endPos
   * @param {number} t
   * @return {*} number[]
   * @author: wuyue.nan
   */
  static linearInterpolation(startPos: number[], endPos: number[], t: number): number[] {
    let a = this.constantMultiVector2(1 - t, startPos)
    let b = this.constantMultiVector2(t, endPos)
    return this.vector2Add(a, b)
  }
  /**
   * @description: 常数乘以二维向量数组的函数
   * @param {number} constant
   * @param {number} vector2
   * @return {*} number[]
   * @author: wuyue.nan
   */
  static constantMultiVector2(constant: number, vector2: number[]): number[] {
    return [constant * vector2[0], constant * vector2[1]];
  }
  /**
   * @description: 计算曲线点
   * @param {number} a
   * @param {number} b
   * @return {*} number[]
   * @author: wuyue.nan
   */
  static vector2Add(a: number[], b: number[]): number[] {
    return [a[0] + b[0], a[1] + b[1]]
  }

  /**
   * @description: 计算贝塞尔曲线
   * @param {number} startPos
   * @param {number} center
   * @param {number} endPos
   * @param {number} t
   * @return {*} number[]
   * @author: wuyue.nan
   */
  static bezierSquareCalc(startPos: number[], center: number[], endPos: number[], t: number): number[] {
    let a = this.constantMultiVector2(Math.pow((1 - t), 2), startPos)
    let b = this.constantMultiVector2((2 * t * (1 - t)), center)
    let c = this.constantMultiVector2(Math.pow(t, 2), endPos)
    return this.vector2Add(this.vector2Add(a, b), c)
  }
}
