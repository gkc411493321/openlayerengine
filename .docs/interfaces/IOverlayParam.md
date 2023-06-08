[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / IOverlayParam

# Interface: IOverlayParam<T\>

新增元素的基础参数

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- [`IAddBaseParam`](IAddBaseParam.md)<`T`\>

  ↳ **`IOverlayParam`**

## Table of contents

### Properties

- [autoPan](IOverlayParam.md#autopan)
- [className](IOverlayParam.md#classname)
- [data](IOverlayParam.md#data)
- [element](IOverlayParam.md#element)
- [id](IOverlayParam.md#id)
- [insertFirst](IOverlayParam.md#insertfirst)
- [module](IOverlayParam.md#module)
- [offset](IOverlayParam.md#offset)
- [position](IOverlayParam.md#position)
- [positioning](IOverlayParam.md#positioning)
- [stopEvent](IOverlayParam.md#stopevent)

## Properties

### autoPan

• `Optional` **autoPan**: `boolean` \| `PanIntoViewOptions`

当Overlay超出地图边界时，地图自动移动，以保证Overlay全部可见，默认为false。PanIntoViewOptions：{animation：设置 autoPan 的效果动画，margin：地图自动平移时，地图边缘与overlay的留白（空隙），单位是像素，默认是 20像素}

#### Defined in

interface/default.ts:277

___

### className

• `Optional` **className**: `string`

class类名，默认'ol-overlay-container ol-selectable'

#### Defined in

interface/default.ts:281

___

### data

• `Optional` **data**: `T`

附加数据

#### Inherited from

[IAddBaseParam](IAddBaseParam.md).[data](IAddBaseParam.md#data)

#### Defined in

interface/default.ts:22

___

### element

• **element**: `HTMLElement`

DOM容器

#### Defined in

interface/default.ts:253

___

### id

• `Optional` **id**: `string`

唯一ID

#### Inherited from

[IAddBaseParam](IAddBaseParam.md).[id](IAddBaseParam.md#id)

#### Defined in

interface/default.ts:15

___

### insertFirst

• `Optional` **insertFirst**: `boolean`

Overlay是否应该先添加到其所在的容器（当前地图容器），默认为true；举例：当stopEvent设置为true时，overlay和openlayers的控件（controls）是放于一个容器的，此时将insertFirst设置为true ，overlay会首先添加到容器。这样，overlay默认在控件的下一层。所以当stopEvent和insertFirst都采用默认值时，overlay默认在控件的下一层

#### Defined in

interface/default.ts:273

___

### module

• `Optional` **module**: `string`

模块名称

#### Inherited from

[IAddBaseParam](IAddBaseParam.md).[module](IAddBaseParam.md#module)

#### Defined in

interface/default.ts:21

___

### offset

• `Optional` **offset**: `number`[]

偏移量,默认[0,0]

#### Defined in

interface/default.ts:261

___

### position

• **position**: `Coordinate`

位置

#### Defined in

interface/default.ts:257

___

### positioning

• `Optional` **positioning**: `Positioning`

定位模式，默认'top-left'

#### Defined in

interface/default.ts:265

___

### stopEvent

• `Optional` **stopEvent**: `boolean`

地图的事件传播是否停止,默认为true，即阻止传播。举例：当鼠标在地图上进行缩放时会触发缩放事件，但在Overlay上滚动鼠标则不会触发地图缩放事件，若想要触发事件，则设置该属性为false

#### Defined in

interface/default.ts:269
