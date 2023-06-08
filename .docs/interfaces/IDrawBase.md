[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / IDrawBase

# Interface: IDrawBase

## Hierarchy

- **`IDrawBase`**

  ↳ [`IDrawPoint`](IDrawPoint.md)

  ↳ [`IDrawLine`](IDrawLine.md)

  ↳ [`IDrawPolygon`](IDrawPolygon.md)

## Table of contents

### Properties

- [callback](IDrawBase.md#callback)
- [keepGraphics](IDrawBase.md#keepgraphics)

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

#### Defined in

interface/dynamicDraw.ts:45

___

### keepGraphics

• `Optional` **keepGraphics**: `boolean`

保留绘制图像。默认为true

#### Defined in

interface/dynamicDraw.ts:41
