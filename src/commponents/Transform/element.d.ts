declare module './element.js' {
  const ol_ext_element: {
    setCursor: (target: HTMLElement | { getViewport?: () => HTMLElement } | unknown, cursor: string) => void;
  };
  export default ol_ext_element;
}

// Root export for direct import without module augmentation (TS resolution convenience)
declare const ol_ext_element: {
  setCursor: (target: HTMLElement | { getViewport?: () => HTMLElement } | unknown, cursor: string) => void;
};
export default ol_ext_element;
