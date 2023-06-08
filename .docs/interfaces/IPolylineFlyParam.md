[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / IPolylineFlyParam

# Interface: IPolylineFlyParam<T\>

新增元素的基础参数

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- [`IAddBaseParam`](IAddBaseParam.md)<`T`\>

- [`IFlightLineParams`](IFlightLineParams.md)

  ↳ **`IPolylineFlyParam`**

## Table of contents

### Properties

- [anchorLineColor](IPolylineFlyParam.md#anchorlinecolor)
- [arrowColor](IPolylineFlyParam.md#arrowcolor)
- [color](IPolylineFlyParam.md#color)
- [controlRatio](IPolylineFlyParam.md#controlratio)
- [data](IPolylineFlyParam.md#data)
- [id](IPolylineFlyParam.md#id)
- [isRepeat](IPolylineFlyParam.md#isrepeat)
- [isShowAnchorLine](IPolylineFlyParam.md#isshowanchorline)
- [isShowAnchorPoint](IPolylineFlyParam.md#isshowanchorpoint)
- [isShowArrow](IPolylineFlyParam.md#isshowarrow)
- [module](IPolylineFlyParam.md#module)
- [oneFrameLimitTime](IPolylineFlyParam.md#oneframelimittime)
- [position](IPolylineFlyParam.md#position)
- [splitLength](IPolylineFlyParam.md#splitlength)
- [width](IPolylineFlyParam.md#width)

## Properties

### anchorLineColor

• `Optional` **anchorLineColor**: `string`

定位线颜色

#### Defined in

interface/default.ts:465

___

### arrowColor

• `Optional` **arrowColor**: `string`

箭头颜色

#### Defined in

interface/default.ts:469

___

### color

• `Optional` **color**: `string` \| [`IRadialColor`](IRadialColor.md)

飞行线颜色, 可设置为纯色或渐变色, 默认渐变色

#### Defined in

interface/default.ts:461

___

### controlRatio

• `Optional` **controlRatio**: `number`

线段弯曲程度，默认为1。值越大，则弯曲程度越高

#### Inherited from

[IFlightLineParams](IFlightLineParams.md).[controlRatio](IFlightLineParams.md#controlratio)

#### Defined in

interface/default.ts:483

___

### data

• `Optional` **data**: `T`

附加数据

#### Inherited from

[IAddBaseParam](IAddBaseParam.md).[data](IAddBaseParam.md#data)

#### Defined in

interface/default.ts:22

___

### id

• `Optional` **id**: `string`

唯一ID

#### Inherited from

[IAddBaseParam](IAddBaseParam.md).[id](IAddBaseParam.md#id)

#### Defined in

interface/default.ts:15

___

### isRepeat

• `Optional` **isRepeat**: `boolean`

是否重复播放，默认为true

#### Defined in

interface/default.ts:445

___

### isShowAnchorLine

• `Optional` **isShowAnchorLine**: `boolean`

是否展示定位线,默认为false。当重复播放属性为false时，此属性生效

#### Defined in

interface/default.ts:453

___

### isShowAnchorPoint

• `Optional` **isShowAnchorPoint**: `boolean`

是否展示定位点,默认为true

#### Defined in

interface/default.ts:449

___

### isShowArrow

• `Optional` **isShowArrow**: `boolean`

是否显示箭头,默认为true

#### Defined in

interface/default.ts:457

___

### module

• `Optional` **module**: `string`

模块名称

#### Inherited from

[IAddBaseParam](IAddBaseParam.md).[module](IAddBaseParam.md#module)

#### Defined in

interface/default.ts:21

___

### oneFrameLimitTime

• `Optional` **oneFrameLimitTime**: `number`

每帧耗时多少秒，默认为0。值越大则播放速度越慢。

#### Inherited from

[IFlightLineParams](IFlightLineParams.md).[oneFrameLimitTime](IFlightLineParams.md#oneframelimittime)

#### Defined in

interface/default.ts:479

___

### position

• **position**: `number`[][]

点集合

#### Defined in

interface/default.ts:437

___

### splitLength

• `Optional` **splitLength**: `number`

分割线长度，默认180。该值越高则曲线越平滑

#### Inherited from

[IFlightLineParams](IFlightLineParams.md).[splitLength](IFlightLineParams.md#splitlength)

#### Defined in

interface/default.ts:475

___

### width

• `Optional` **width**: `number`

线宽,默认2

#### Defined in

interface/default.ts:441
