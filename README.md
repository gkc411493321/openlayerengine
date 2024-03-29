# 地图基础功能封装(Openlayers)

该组件库基于Openlayers 7.0进行开发，目的旨在为开发人员提供快捷高效的地图创建与业务开发，本组件库将持续更新。

`支持内容`

·图层类：点、线、圆、矩形、文本、图片、多边形、覆盖物，内置常用的交互与动态效果，详见文档

·组件类：右键菜单、动态标绘、动态测量、动态编辑、hover标牌等

·事件类：提供全局事件、模块事件

·工具类：提供与地图计算相关的常用算法

·拓展类：主要包含气象类组件，如：热力图、色斑图（用于气压、气温展示）、风场、洋流等

具体内容及使用方法请参见文档

## 运行测试环境

测试代码在`.test`文件夹中，若要进行组件库的预览及测试，请执行如下命令

**`Example`**

```
// 打开.test文件夹下 main.ts 文件，修改如下代码，二者选其一

// 本地或在线瓦片地图 需要填入可用的瓦片地址。如无有效的瓦片地址，请使用OSM地图
earth.addLayer(earth.createXyzLayer(‘http://xxxx’));

// OSM地图，在科学上网的环境能有限提示底图的加载速度
earth.addLayer(earth.createOsmLayer());

npm install
npm run dev

```

## 生成文档

**`Example`**

```
npm run doc
```

## 运行文档

**`Example`**
目前文档只支持API查看，相关示例及及开发文档会在之后逐步完善
```
// 注意，文档运行需要node 18.0及以上版本，若node低于该版本请将`.docs`文件夹下 package.json中`dev`命令替换为`"dev": "vuepress dev --temp .temp"`

// 将`docs`文件夹下内容复制粘贴至`.docs`文件夹下，`注意`:docs文件夹下`readme.md`文件无需复制

cd .docs

// 进入.docs文件下执行如下命令

npm install

npm run dev
```

## 打包项目与使用

**`Example`**

```
npm run build

// 将打包后的包放入node_modules即可使用
```




