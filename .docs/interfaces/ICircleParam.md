[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / ICircleParam

# Interface: ICircleParam<T\>

新增元素的基础参数

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- [`IAddBaseParam`](IAddBaseParam.md)<`T`\>

  ↳ **`ICircleParam`**

## Table of contents

### Properties

- [center](ICircleParam.md#center)
- [data](ICircleParam.md#data)
- [fill](ICircleParam.md#fill)
- [id](ICircleParam.md#id)
- [label](ICircleParam.md#label)
- [module](ICircleParam.md#module)
- [radius](ICircleParam.md#radius)
- [stroke](ICircleParam.md#stroke)

## Properties

### center

• **center**: `Coordinate`

圆中心

#### Defined in

interface/default.ts:28

___

### data

• `Optional` **data**: `T`

附加数据

#### Inherited from

[IAddBaseParam](IAddBaseParam.md).[data](IAddBaseParam.md#data)

#### Defined in

interface/default.ts:22

___

### fill

• `Optional` **fill**: [`IFill`](IFill.md)

填充样式

#### Defined in

interface/default.ts:40

___

### id

• `Optional` **id**: `string`

唯一ID

#### Inherited from

[IAddBaseParam](IAddBaseParam.md).[id](IAddBaseParam.md#id)

#### Defined in

interface/default.ts:15

___

### label

• `Optional` **label**: [`ILabel`](ILabel.md)

标签样式

#### Defined in

interface/default.ts:44

___

### module

• `Optional` **module**: `string`

模块名称

#### Inherited from

[IAddBaseParam](IAddBaseParam.md).[module](IAddBaseParam.md#module)

#### Defined in

interface/default.ts:21

___

### radius

• **radius**: `number`

圆半径，单位m

#### Defined in

interface/default.ts:32

___

### stroke

• `Optional` **stroke**: [`IStroke`](IStroke.md)

边框样式

#### Defined in

interface/default.ts:36
