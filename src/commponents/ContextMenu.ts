import { useEarth } from "../useEarth";
import Earth from "../Earth";

interface IContextMenuOption {

}
/**
 * 菜单类
 */
export default class ContextMenu {
  private earth: Earth;
  private option: IContextMenuOption;
  private menus: Map<string, {}> = new Map();
  constructor(earth: Earth, option: IContextMenuOption) {
    this.earth = earth;
    this.option = option;
    this.watchContextMenu();
  }
  /**
   * 启用上下文事件监听
   */
  private watchContextMenu() {
    // 启用右键点击事件
    useEarth().useGlobalEvent().enableGlobalMouseRightClickEvent();
    useEarth().useGlobalEvent().addMouseRightClickEventByGlobal((e) => {
      console.log(e)
    })
    // 判断是否存在元素
    // 显示菜单
    // 触发回调
  }
  /**
   * 按模块添加点击事件
   */
  public addModuleMenu() {

  }
  /**
   * 设置默认点击事件
   */
  public addDefaultMenu() {

  }
  /**
   * 按模块销毁菜单
   */
  public remove() {

  }
  /**
   * 销毁菜单
   */
  public destory() {

  }
}