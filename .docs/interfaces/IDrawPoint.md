[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / IDrawPoint

# Interface: IDrawPoint

## Hierarchy

- [`IDrawBase`](IDrawBase.md)

  ↳ **`IDrawPoint`**

## Table of contents

### Properties

- [callback](IDrawPoint.md#callback)
- [fillColor](IDrawPoint.md#fillcolor)
- [keepGraphics](IDrawPoint.md#keepgraphics)
- [limit](IDrawPoint.md#limit)
- [size](IDrawPoint.md#size)

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

interface/dynamicDraw.ts:87

___

### keepGraphics

• `Optional` **keepGraphics**: `boolean`

保留绘制图像。默认为true

#### Inherited from

[IDrawBase](IDrawBase.md).[keepGraphics](IDrawBase.md#keepgraphics)

#### Defined in

interface/dynamicDraw.ts:41

___

### limit

• `Optional` **limit**: `number`

绘制次数。默认为0次：代表重复绘制

#### Defined in

interface/dynamicDraw.ts:79

___

### size

• `Optional` **size**: `number`

大小,默认2

#### Defined in

interface/dynamicDraw.ts:83
