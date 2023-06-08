[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / IBillboardParam

# Interface: IBillboardParam<T\>

新增元素的基础参数

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- [`IAddBaseParam`](IAddBaseParam.md)<`T`\>

  ↳ **`IBillboardParam`**

## Table of contents

### Properties

- [anchor](IBillboardParam.md#anchor)
- [anchorOrigin](IBillboardParam.md#anchororigin)
- [anchorXUnits](IBillboardParam.md#anchorxunits)
- [anchorYUnits](IBillboardParam.md#anchoryunits)
- [center](IBillboardParam.md#center)
- [color](IBillboardParam.md#color)
- [data](IBillboardParam.md#data)
- [displacement](IBillboardParam.md#displacement)
- [id](IBillboardParam.md#id)
- [label](IBillboardParam.md#label)
- [module](IBillboardParam.md#module)
- [rotation](IBillboardParam.md#rotation)
- [scale](IBillboardParam.md#scale)
- [size](IBillboardParam.md#size)
- [src](IBillboardParam.md#src)

## Properties

### anchor

• `Optional` **anchor**: `number`[]

锚，默认值是图标中心:[0.5,0.5]

#### Defined in

interface/default.ts:184

___

### anchorOrigin

• `Optional` **anchorOrigin**: `IconOrigin`

锚的来源，默认top-left

#### Defined in

interface/default.ts:188

___

### anchorXUnits

• `Optional` **anchorXUnits**: `IconAnchorUnits`

指定锚 x 值的单位，默认'fraction'。'fraction'表示 x 值是图标的一部分。'pixels'表示以像素为单位的 x 值。

#### Defined in

interface/default.ts:192

___

### anchorYUnits

• `Optional` **anchorYUnits**: `IconAnchorUnits`

指定锚 y 值的单位，默认'fraction'。'fraction'表示 y 值是图标的一部分。'pixels'表示以像素为单位的 y 值。

#### Defined in

interface/default.ts:196

___

### center

• **center**: `Coordinate`

点中心

#### Defined in

interface/default.ts:156

___

### color

• `Optional` **color**: `string`

图标颜色,未指定则图标保持原样

#### Defined in

interface/default.ts:168

___

### data

• `Optional` **data**: `T`

附加数据

#### Inherited from

[IAddBaseParam](IAddBaseParam.md).[data](IAddBaseParam.md#data)

#### Defined in

interface/default.ts:22

___

### displacement

• `Optional` **displacement**: `number`[]

图标位移，单位是像素，默认[0,0]。正值将使图标向右和向上移动。

#### Defined in

interface/default.ts:172

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

interface/default.ts:200

___

### module

• `Optional` **module**: `string`

模块名称

#### Inherited from

[IAddBaseParam](IAddBaseParam.md).[module](IAddBaseParam.md#module)

#### Defined in

interface/default.ts:21

___

### rotation

• `Optional` **rotation**: `number`

旋转，默认0

#### Defined in

interface/default.ts:180

___

### scale

• `Optional` **scale**: `number`

图标缩放，默认为1

#### Defined in

interface/default.ts:176

___

### size

• `Optional` **size**: `Size`

图片大小,[width,height]

#### Defined in

interface/default.ts:164

___

### src

• **src**: `string`

图片地址

#### Defined in

interface/default.ts:160
