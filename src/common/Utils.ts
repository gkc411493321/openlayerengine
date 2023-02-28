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
}
