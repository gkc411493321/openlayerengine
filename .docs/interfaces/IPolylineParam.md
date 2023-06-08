[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / IPolylineParam

# Interface: IPolylineParam<T\>

新增元素的基础参数

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- [`IAddBaseParam`](IAddBaseParam.md)<`T`\>

  ↳ **`IPolylineParam`**

## Table of contents

### Properties

- [arrowIsRepeat](IPolylineParam.md#arrowisrepeat)
- [data](IPolylineParam.md#data)
- [dottedLineColor](IPolylineParam.md#dottedlinecolor)
- [fill](IPolylineParam.md#fill)
- [fullLineColor](IPolylineParam.md#fulllinecolor)
- [id](IPolylineParam.md#id)
- [isArrow](IPolylineParam.md#isarrow)
- [isFlowingDash](IPolylineParam.md#isflowingdash)
- [label](IPolylineParam.md#label)
- [module](IPolylineParam.md#module)
- [positions](IPolylineParam.md#positions)
- [stroke](IPolylineParam.md#stroke)
- [width](IPolylineParam.md#width)

## Properties

### arrowIsRepeat

• `Optional` **arrowIsRepeat**: `boolean`

箭头是否重复,isArrow为true生效

#### Defined in

interface/default.ts:373

___

### data

• `Optional` **data**: `T`

附加数据

#### Inherited from

[IAddBaseParam](IAddBaseParam.md).[data](IAddBaseParam.md#data)

#### Defined in

interface/default.ts:22

___

### dottedLineColor

• `Optional` **dottedLineColor**: `string`

流水线虚线填充色 isFlowingDash为true生效

#### Defined in

interface/default.ts:385

___

### fill

• `Optional` **fill**: [`IFill`](IFill.md)

填充样式

#### Defined in

interface/default.ts:361

___

### fullLineColor

• `Optional` **fullLineColor**: `string`

流水线实线填充色 isFlowingDash为true生效

#### Defined in

interface/default.ts:381

___

### id

• `Optional` **id**: `string`

唯一ID

#### Inherited from

[IAddBaseParam](IAddBaseParam.md).[id](IAddBaseParam.md#id)

#### Defined in

interface/default.ts:15

___

### isArrow

• `Optional` **isArrow**: `boolean`

箭头线

#### Defined in

interface/default.ts:369

___

### isFlowingDash

• `Optional` **isFlowingDash**: `boolean`

流水线

#### Defined in

interface/default.ts:377

___

### label

• `Optional` **label**: [`ILabel`](ILabel.md)

标签样式

#### Defined in

interface/default.ts:365

___

### module

• `Optional` **module**: `string`

模块名称

#### Inherited from

[IAddBaseParam](IAddBaseParam.md).[module](IAddBaseParam.md#module)

#### Defined in

interface/default.ts:21

___

### positions

• **positions**: `number`[][]

点集合

#### Defined in

interface/default.ts:349

___

### stroke

• `Optional` **stroke**: [`IStroke`](IStroke.md)

边框样式

#### Defined in

interface/default.ts:357

___

### width

• `Optional` **width**: `number`

线宽，默认为2

#### Defined in

interface/default.ts:353
