[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / Measure

# Class: Measure

测量类

## Table of contents

### Constructors

- [constructor](Measure.md#constructor)

### Properties

- [draw](Measure.md#draw)
- [labelStyle](Measure.md#labelstyle)
- [labels](Measure.md#labels)
- [layer](Measure.md#layer)
- [map](Measure.md#map)
- [measureData](Measure.md#measuredata)
- [pointLayer](Measure.md#pointlayer)
- [segmentStyle](Measure.md#segmentstyle)
- [segmentStyles](Measure.md#segmentstyles)
- [segments](Measure.md#segments)
- [source](Measure.md#source)
- [style](Measure.md#style)
- [tipStyle](Measure.md#tipstyle)

### Methods

- [clear](Measure.md#clear)
- [formatArea](Measure.md#formatarea)
- [formatLength](Measure.md#formatlength)
- [lineCenter](Measure.md#linecenter)
- [lineFirst](Measure.md#linefirst)
- [lineMeasure](Measure.md#linemeasure)
- [lineSegmentation](Measure.md#linesegmentation)
- [polygonMeasure](Measure.md#polygonmeasure)
- [styleFunction](Measure.md#stylefunction)

## Constructors

### constructor

• **new Measure**(`earth`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `earth` | [`Earth`](Earth.md) |

#### Defined in

commponents/Measure.ts:89

## Properties

### draw

• `Private` `Optional` **draw**: `Draw`

绘制工具

#### Defined in

commponents/Measure.ts:28

___

### labelStyle

• `Private` **labelStyle**: `Style`

label样式

#### Defined in

commponents/Measure.ts:61

___

### labels

• `Private` **labels**: `boolean` = `false`

总距标签显隐

#### Defined in

commponents/Measure.ts:84

___

### layer

• `Private` **layer**: `VectorLayer`<`VectorSource`<`Geometry`\>\>

图层

#### Defined in

commponents/Measure.ts:32

___

### map

• `Private` **map**: `Map`

map实例

#### Defined in

commponents/Measure.ts:24

___

### measureData

• `Private` **measureData**: [`IMeasureEvent`](../interfaces/IMeasureEvent.md)

#### Defined in

commponents/Measure.ts:74

___

### pointLayer

• `Private` **pointLayer**: [`PointLayer`](PointLayer.md)<`unknown`\>

定位点图层

#### Defined in

commponents/Measure.ts:73

___

### segmentStyle

• `Private` **segmentStyle**: `Style`

片段样式

#### Defined in

commponents/Measure.ts:65

___

### segmentStyles

• `Private` **segmentStyles**: `Style`[] = `[]`

片段样式数组

#### Defined in

commponents/Measure.ts:69

___

### segments

• `Private` **segments**: `boolean` = `false`

分段标签显隐

#### Defined in

commponents/Measure.ts:80

___

### source

• `Private` **source**: `VectorSource`<`Geometry`\>

图层数据源

#### Defined in

commponents/Measure.ts:36

___

### style

• `Private` **style**: `Style`

公共样式

#### Defined in

commponents/Measure.ts:57

___

### tipStyle

• `Private` **tipStyle**: `Style`

tip样式

#### Defined in

commponents/Measure.ts:40

## Methods

### clear

▸ **clear**(): `void`

清空测量

#### Returns

`void`

#### Defined in

commponents/Measure.ts:463

___

### formatArea

▸ `Private` **formatArea**(`polygon`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `polygon` | `Polygon` |

#### Returns

`number`

#### Defined in

commponents/Measure.ts:108

___

### formatLength

▸ `Private` **formatLength**(`line`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | `LineString` |

#### Returns

`number`

#### Defined in

commponents/Measure.ts:102

___

### lineCenter

▸ **lineCenter**(`param`): `void`

画线测量-中心方距

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`IMeasure`](../interfaces/IMeasure.md) | 参数，详见[IMeasure](../interfaces/IMeasure.md) |

#### Returns

`void`

#### Defined in

commponents/Measure.ts:319

___

### lineFirst

▸ **lineFirst**(`param`): `void`

画线测量-首点方距

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`IMeasure`](../interfaces/IMeasure.md) | 参数，详见[IMeasure](../interfaces/IMeasure.md) |

#### Returns

`void`

#### Defined in

commponents/Measure.ts:310

___

### lineMeasure

▸ `Private` **lineMeasure**(`param`): `void`

画线测量

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`IMeasure`](../interfaces/IMeasure.md) | 参数，详见[IMeasure](../interfaces/IMeasure.md) |

#### Returns

`void`

#### Defined in

commponents/Measure.ts:235

___

### lineSegmentation

▸ **lineSegmentation**(`param`): `void`

画线测量-分段方距

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`IMeasure`](../interfaces/IMeasure.md) | 参数，详见[IMeasure](../interfaces/IMeasure.md) |

#### Returns

`void`

#### Defined in

commponents/Measure.ts:301

___

### polygonMeasure

▸ **polygonMeasure**(`param`): `void`

面积测量

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`IMeasure`](../interfaces/IMeasure.md) | 参数，详见[IMeasure](../interfaces/IMeasure.md) |

#### Returns

`void`

#### Defined in

commponents/Measure.ts:406

___

### styleFunction

▸ `Private` **styleFunction**(`feature`, `param?`, `drawType?`, `tip?`): `Style`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `feature` | `FeatureLike` |
| `param?` | [`IMeasure`](../interfaces/IMeasure.md) |
| `drawType?` | `string` |
| `tip?` | `string` |

#### Returns

`Style`[]

#### Defined in

commponents/Measure.ts:114
