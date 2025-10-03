declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.jpeg' {
  const src: string;
  export default src;
}
declare module '*.svg' {
  const src: string;
  export default src;
}
// 以 raw 文本方式导入 svg (vite '?raw')
declare module '*.svg?raw' {
  const content: string;
  export default content;
}
