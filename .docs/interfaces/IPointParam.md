[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / IPointParam

# Interface: IPointParam<T\>

新增元素的基础参数

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- [`IAddBaseParam`](IAddBaseParam.md)<`T`\>

  ↳ **`IPointParam`**

## Table of contents

### Properties

- [center](IPointParam.md#center)
- [data](IPointParam.md#data)
- [duration](IPointParam.md#duration)
- [fill](IPointParam.md#fill)
- [flashColor](IPointParam.md#flashcolor)
- [id](IPointParam.md#id)
- [isFlash](IPointParam.md#isflash)
- [isRepeat](IPointParam.md#isrepeat)
- [label](IPointParam.md#label)
- [module](IPointParam.md#module)
- [size](IPointParam.md#size)
- [stroke](IPointParam.md#stroke)

## Properties

### center

• **center**: `Coordinate`

点中心

#### Defined in

interface/default.ts:76

___

### data

• `Optional` **data**: `T`

附加数据

#### Inherited from

[IAddBaseParam](IAddBaseParam.md).[data](IAddBaseParam.md#data)

#### Defined in

interface/default.ts:22

___

### duration

• `Optional` **duration**: `number`

闪烁一次持续时间，默认1000ms

#### Defined in

interface/default.ts:92

___

### fill

• `Optional` **fill**: [`IFill`](IFill.md)

填充样式

#### Defined in

interface/default.ts:104

___

### flashColor

• `Optional` **flashColor**: [`IRgbColor`](IRgbColor.md)

闪烁颜色，默认为rgb(255,0,0)

#### Defined in

interface/default.ts:88

___

### id

• `Optional` **id**: `string`

唯一ID

#### Inherited from

[IAddBaseParam](IAddBaseParam.md).[id](IAddBaseParam.md#id)

#### Defined in

interface/default.ts:15

___

### isFlash

• `Optional` **isFlash**: `boolean`

是否开启闪烁点，默认false

#### Defined in

interface/default.ts:84

___

### isRepeat

• `Optional` **isRepeat**: `boolean`

是否重复闪烁，默认为true;该属性在isFlash属性为true时生效

#### Defined in

interface/default.ts:96

___

### label

• `Optional` **label**: [`ILabel`](ILabel.md)

标签样式

#### Defined in

interface/default.ts:108

___

### module

• `Optional` **module**: `string`

模块名称

#### Inherited from

[IAddBaseParam](IAddBaseParam.md).[module](IAddBaseParam.md#module)

#### Defined in

interface/default.ts:21

___

### size

• `Optional` **size**: `number`

点大小

#### Defined in

interface/default.ts:80

___

### stroke

• `Optional` **stroke**: [`IStroke`](IStroke.md)

边框样式

#### Defined in

interface/default.ts:100
