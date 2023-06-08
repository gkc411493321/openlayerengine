[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / DynamicDraw

# Class: DynamicDraw

动态绘制类

## Table of contents

### Constructors

- [constructor](DynamicDraw.md#constructor)

### Properties

- [draw](DynamicDraw.md#draw)
- [layer](DynamicDraw.md#layer)
- [map](DynamicDraw.md#map)
- [overlay](DynamicDraw.md#overlay)
- [overlayKey](DynamicDraw.md#overlaykey)
- [source](DynamicDraw.md#source)

### Methods

- [drawChange](DynamicDraw.md#drawchange)
- [drawLine](DynamicDraw.md#drawline)
- [drawPoint](DynamicDraw.md#drawpoint)
- [drawPolygon](DynamicDraw.md#drawpolygon)
- [editPoint](DynamicDraw.md#editpoint)
- [editPolygon](DynamicDraw.md#editpolygon)
- [editPolyline](DynamicDraw.md#editpolyline)
- [exitDraw](DynamicDraw.md#exitdraw)
- [get](DynamicDraw.md#get)
- [initDraw](DynamicDraw.md#initdraw)
- [initHelpTooltip](DynamicDraw.md#inithelptooltip)
- [remove](DynamicDraw.md#remove)

## Constructors

### constructor

• **new DynamicDraw**(`earth`)

构造器

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `earth` | [`Earth`](Earth.md) | 地图实例 |

#### Defined in

commponents/DynamicDraw.ts:49

## Properties

### draw

• `Private` **draw**: `undefined` \| `Draw`

绘制工具

#### Defined in

commponents/DynamicDraw.ts:32

___

### layer

• `Private` **layer**: `VectorLayer`<`VectorSource`<`Geometry`\>\>

绘制图层

#### Defined in

commponents/DynamicDraw.ts:44

___

### map

• `Private` **map**: `Map`

map实例

#### Defined in

commponents/DynamicDraw.ts:24

___

### overlay

• `Private` **overlay**: [`OverlayLayer`](OverlayLayer.md)<`unknown`\>

绘制提示覆盖物

#### Defined in

commponents/DynamicDraw.ts:36

___

### overlayKey

• `Private` **overlayKey**: `any`

提示覆盖物监听器key

#### Defined in

commponents/DynamicDraw.ts:40

___

### source

• `Private` **source**: `VectorSource`<`Geometry`\>

图层数据源

#### Defined in

commponents/DynamicDraw.ts:28

## Methods

### drawChange

▸ `Private` **drawChange**(`callback`, `type`, `param?`): `void`

绘制事件监听

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | (`e`: [`IDrawEvent`](../interfaces/IDrawEvent.md)) => `void` | 回调函数，详见[IDrawEvent](../interfaces/IDrawEvent.md) |
| `type` | `string` | - |
| `param?` | [`IDrawPoint`](../interfaces/IDrawPoint.md) \| [`IDrawLine`](../interfaces/IDrawLine.md) \| [`IDrawPolygon`](../interfaces/IDrawPolygon.md) | 参数 |

#### Returns

`void`

#### Defined in

commponents/DynamicDraw.ts:176

___

### drawLine

▸ **drawLine**(`param?`): `void`

动态绘制线

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param?` | [`IDrawLine`](../interfaces/IDrawLine.md) | 详见[IDrawLine](../interfaces/IDrawLine.md) |

#### Returns

`void`

#### Defined in

commponents/DynamicDraw.ts:306

___

### drawPoint

▸ **drawPoint**(`param?`): `void`

动态绘制点

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param?` | [`IDrawPoint`](../interfaces/IDrawPoint.md) | 详见[IDrawPoint](../interfaces/IDrawPoint.md) |

#### Returns

`void`

#### Defined in

commponents/DynamicDraw.ts:314

___

### drawPolygon

▸ **drawPolygon**(`param?`): `void`

动态绘制面

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param?` | [`IDrawPolygon`](../interfaces/IDrawPolygon.md) | 详见[IDrawPolygon](../interfaces/IDrawPolygon.md) |

#### Returns

`void`

#### Defined in

commponents/DynamicDraw.ts:322

___

### editPoint

▸ **editPoint**(`param`): `void`

动态修改点

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`IEditParam`](../interfaces/IEditParam.md) | 参数，详见[IEditParam](../interfaces/IEditParam.md) |

#### Returns

`void`

#### Defined in

commponents/DynamicDraw.ts:523

___

### editPolygon

▸ **editPolygon**(`param`): `void`

动态修改面

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`IEditParam`](../interfaces/IEditParam.md) | 参数，详见[IEditParam](../interfaces/IEditParam.md) |

#### Returns

`void`

#### Defined in

commponents/DynamicDraw.ts:330

___

### editPolyline

▸ **editPolyline**(`param`): `void`

动态修改线

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`IEditParam`](../interfaces/IEditParam.md) | 参数，详见[IEditParam](../interfaces/IEditParam.md) |

#### Returns

`void`

#### Defined in

commponents/DynamicDraw.ts:417

___

### exitDraw

▸ `Private` **exitDraw**(`event`, `callback?`): `void`

退出绘制工具

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `Object` | 绘制事件 |
| `event.position` | `Coordinate` | - |
| `callback?` | (`e`: [`IDrawEvent`](../interfaces/IDrawEvent.md)) => `void` | 回调函数 |

#### Returns

`void`

#### Defined in

commponents/DynamicDraw.ts:145

___

### get

▸ **get**(): `undefined` \| `Feature`<`Geometry`\>[]

获取所有绘制对象

#### Returns

`undefined` \| `Feature`<`Geometry`\>[]

#### Defined in

commponents/DynamicDraw.ts:589

▸ **get**(`type`): `undefined` \| `Feature`<`Geometry`\>[]

按创建类型获取对象

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | ``"Point"`` \| ``"Polygon"`` \| ``"LineString"`` | 绘制类型 `Point` \| `LineString` \| `Polygon` |

#### Returns

`undefined` \| `Feature`<`Geometry`\>[]

#### Defined in

commponents/DynamicDraw.ts:594

___

### initDraw

▸ `Private` **initDraw**(`type`, `param?`): `void`

绘制工具初始化

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | ``"Circle"`` \| ``"Point"`` \| ``"Polygon"`` \| ``"LineString"`` \| ``"LinearRing"`` \| ``"MultiPoint"`` \| ``"MultiLineString"`` \| ``"MultiPolygon"`` \| ``"GeometryCollection"`` | 绘制类型 |
| `param?` | [`IDrawPoint`](../interfaces/IDrawPoint.md) \| [`IDrawLine`](../interfaces/IDrawLine.md) \| [`IDrawPolygon`](../interfaces/IDrawPolygon.md) | - |

#### Returns

`void`

#### Defined in

commponents/DynamicDraw.ts:81

___

### initHelpTooltip

▸ `Private` **initHelpTooltip**(`str`): `void`

提示牌初始化方法

#### Parameters

| Name | Type |
| :------ | :------ |
| `str` | `string` |

#### Returns

`void`

#### Defined in

commponents/DynamicDraw.ts:63

___

### remove

▸ **remove**(): `void`

清空绘制图层

#### Returns

`void`

#### Defined in

commponents/DynamicDraw.ts:612
