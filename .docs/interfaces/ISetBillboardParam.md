[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / ISetBillboardParam

# Interface: ISetBillboardParam

## Table of contents

### Properties

- [anchor](ISetBillboardParam.md#anchor)
- [center](ISetBillboardParam.md#center)
- [color](ISetBillboardParam.md#color)
- [displacement](ISetBillboardParam.md#displacement)
- [id](ISetBillboardParam.md#id)
- [label](ISetBillboardParam.md#label)
- [rotation](ISetBillboardParam.md#rotation)
- [scale](ISetBillboardParam.md#scale)
- [size](ISetBillboardParam.md#size)
- [src](ISetBillboardParam.md#src)

## Properties

### anchor

• `Optional` **anchor**: `number`[]

锚，默认值是图标中心:[0.5,0.5]

#### Defined in

interface/default.ts:238

___

### center

• `Optional` **center**: `Coordinate`

点中心

#### Defined in

interface/default.ts:210

___

### color

• `Optional` **color**: `string`

图标颜色,未指定则图标保持原样

#### Defined in

interface/default.ts:222

___

### displacement

• `Optional` **displacement**: `number`[]

图标位移，单位是像素，默认[0,0]。正值将使图标向右和向上移动。

#### Defined in

interface/default.ts:226

___

### id

• **id**: `string`

id

#### Defined in

interface/default.ts:206

___

### label

• `Optional` **label**: [`ILabel`](ILabel.md)

标签样式

#### Defined in

interface/default.ts:242

___

### rotation

• `Optional` **rotation**: `number`

旋转，默认0

#### Defined in

interface/default.ts:234

___

### scale

• `Optional` **scale**: `number`

图标缩放，默认为1

#### Defined in

interface/default.ts:230

___

### size

• `Optional` **size**: `Size`

图片大小,[width,height]

#### Defined in

interface/default.ts:218

___

### src

• `Optional` **src**: `string`

图片地址

#### Defined in

interface/default.ts:214
