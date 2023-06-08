[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / IDrawPolygon

# Interface: IDrawPolygon

## Hierarchy

- [`IDrawBase`](IDrawBase.md)

  ↳ **`IDrawPolygon`**

## Table of contents

### Properties

- [callback](IDrawPolygon.md#callback)
- [fillColor](IDrawPolygon.md#fillcolor)
- [keepGraphics](IDrawPolygon.md#keepgraphics)
- [strokeColor](IDrawPolygon.md#strokecolor)
- [strokeWidth](IDrawPolygon.md#strokewidth)

## Properties

### callback

• `Optional` **callback**: (`event`: [`IDrawEvent`](IDrawEvent.md)) => `void`

#### Type declaration

▸ (`event`): `void`

回调函数

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`IDrawEvent`](IDrawEvent.md) |

##### Returns

`void`

#### Inherited from

[IDrawBase](IDrawBase.md).[callback](IDrawBase.md#callback)

#### Defined in

interface/dynamicDraw.ts:45

___

### fillColor

• `Optional` **fillColor**: `string`

填充颜色

#### Defined in

interface/dynamicDraw.ts:111

___

### keepGraphics

• `Optional` **keepGraphics**: `boolean`

保留绘制图像。默认为true

#### Inherited from

[IDrawBase](IDrawBase.md).[keepGraphics](IDrawBase.md#keepgraphics)

#### Defined in

interface/dynamicDraw.ts:41

___

### strokeColor

• `Optional` **strokeColor**: `string`

边框颜色

#### Defined in

interface/dynamicDraw.ts:103

___

### strokeWidth

• `Optional` **strokeWidth**: `number`

边框大小

#### Defined in

interface/dynamicDraw.ts:107
