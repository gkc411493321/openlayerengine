export enum ETransfrom {
  /**
   * 选中元素
   */
  Select = 'select',
  /**
   * 退出选中
   */
  SelectEnd = 'selectend',
  /**
   * 进入变换点
   */
  EnterHandle = 'enterHandle',
  /**
   * 离开变换点
   */
  LeaveHandle = 'leaveHandle',
  /**
   * 开始平移
   */
  TranslateStart = 'translatestart',
  /**
   * 平移中
   */
  Translating = 'translating',
  /**
   * 结束平移
   */
  TranslateEnd = 'translateend',
}

export enum ETranslateType {
  /**
   * 静止平移
   */
  None = 'none',
  /**
   * 点击中心点平移
   */
  Center = 'center',
  /**
   * 点击要素任意位置平移
   */
  Feature = 'feature'
}
