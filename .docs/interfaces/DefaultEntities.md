[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / DefaultEntities

# Interface: DefaultEntities<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

## Table of contents

### Properties

- [billboard](DefaultEntities.md#billboard)
- [circle](DefaultEntities.md#circle)
- [overlay](DefaultEntities.md#overlay)
- [point](DefaultEntities.md#point)
- [polygon](DefaultEntities.md#polygon)
- [polyline](DefaultEntities.md#polyline)
- [reset](DefaultEntities.md#reset)
- [wind](DefaultEntities.md#wind)

## Properties

### billboard

• **billboard**: [`BillboardLayer`](../classes/BillboardLayer.md)<`T`\>

广告牌

#### Defined in

interface/earth.ts:13

___

### circle

• **circle**: [`CircleLayer`](../classes/CircleLayer.md)<`T`\>

圆

#### Defined in

interface/earth.ts:17

___

### overlay

• **overlay**: [`OverlayLayer`](../classes/OverlayLayer.md)<`T`\>

覆盖物

#### Defined in

interface/earth.ts:21

___

### point

• **point**: [`PointLayer`](../classes/PointLayer.md)<`T`\>

点

#### Defined in

interface/earth.ts:25

___

### polygon

• **polygon**: [`PolygonLayer`](../classes/PolygonLayer.md)<`T`\>

多边形

#### Defined in

interface/earth.ts:29

___

### polyline

• **polyline**: [`PolylineLayer`](../classes/PolylineLayer.md)<`T`\>

线

#### Defined in

interface/earth.ts:33

___

### reset

• **reset**: () => `void`

#### Type declaration

▸ (): `void`

重置方法

##### Returns

`void`

#### Defined in

interface/earth.ts:41

___

### wind

• **wind**: [`WindLayer`](../classes/WindLayer.md)

风场

#### Defined in

interface/earth.ts:37
