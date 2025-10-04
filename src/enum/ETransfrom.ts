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
  /**
   * 开始旋转
   */
  RotateStart = 'rotatestart',
  /**
   * 旋转中
   */
  Rotating = 'rotating',
  /**
   * 结束旋转
   */
  RotateEnd = 'rotateend',
  /**
   * 开始缩放
   */
  ScaleStart = 'scalestart',
  /**
   * 缩放中
   */
  Scaling = 'scaling',
  /**
   * 结束缩放
   */
  ScaleEnd = 'scaleend',
  /**
   * 撤销
   */
  Undo = 'undo',
  /**
   * 重做
   */
  Redo = 'redo',
  /**
   * 删除
   */
  Remove = 'remove'
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
