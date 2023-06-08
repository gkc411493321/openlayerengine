[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / IPolygonParam

# Interface: IPolygonParam<T\>

新增元素的基础参数

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- [`IAddBaseParam`](IAddBaseParam.md)<`T`\>

  ↳ **`IPolygonParam`**

## Table of contents

### Properties

- [data](IPolygonParam.md#data)
- [fill](IPolygonParam.md#fill)
- [id](IPolygonParam.md#id)
- [label](IPolygonParam.md#label)
- [module](IPolygonParam.md#module)
- [positions](IPolygonParam.md#positions)
- [stroke](IPolygonParam.md#stroke)

## Properties

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

interface/default.ts:317

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

interface/default.ts:321

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

• **positions**: `Coordinate`[][]

点集合

#### Defined in

interface/default.ts:309

___

### stroke

• `Optional` **stroke**: [`IStroke`](IStroke.md)

边框样式

#### Defined in

interface/default.ts:313
