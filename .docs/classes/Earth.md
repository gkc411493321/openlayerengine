[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / Earth

# Class: Earth

地图基类

## Table of contents

### Constructors

- [constructor](Earth.md#constructor)

### Properties

- [center](Earth.md#center)
- [containerId](Earth.md#containerid)
- [draw](Earth.md#draw)
- [entities](Earth.md#entities)
- [globalEvent](Earth.md#globalevent)
- [map](Earth.md#map)
- [measure](Earth.md#measure)
- [view](Earth.md#view)

### Methods

- [addLayer](Earth.md#addlayer)
- [animateFlyTo](Earth.md#animateflyto)
- [closeDefaultEvent](Earth.md#closedefaultevent)
- [closeRightMenu](Earth.md#closerightmenu)
- [createOsmLayer](Earth.md#createosmlayer)
- [createXyzLayer](Earth.md#createxyzlayer)
- [flyHome](Earth.md#flyhome)
- [flyTo](Earth.md#flyto)
- [getFeatureAtPixel](Earth.md#getfeatureatpixel)
- [getLayerAtFeature](Earth.md#getlayeratfeature)
- [removeLayer](Earth.md#removelayer)
- [setMouseStyle](Earth.md#setmousestyle)
- [setMouseStyleToCrosshair](Earth.md#setmousestyletocrosshair)
- [setMouseStyleToDefault](Earth.md#setmousestyletodefault)
- [useDefaultLayer](Earth.md#usedefaultlayer)
- [useDrawTool](Earth.md#usedrawtool)
- [useGlobalEvent](Earth.md#useglobalevent)
- [useMeasure](Earth.md#usemeasure)
- [zeroFill](Earth.md#zerofill)

## Constructors

### constructor

• **new Earth**(`viewOptions?`, `options?`)

构造器

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `viewOptions?` | `ViewOptions` | 视图参数，详见ViewOptions |
| `options?` | [`IEarthConstructorOptions`](../interfaces/IEarthConstructorOptions.md) | 自定义参数，详见[IEarthConstructorOptions](../interfaces/IEarthConstructorOptions.md) |

#### Defined in

Earth.ts:79

## Properties

### center

• **center**: `number`[]

默认中心点

#### Defined in

Earth.ts:42

___

### containerId

• **containerId**: `string`

地图容器id

#### Defined in

Earth.ts:46

___

### draw

• `Private` `Optional` **draw**: [`DynamicDraw`](DynamicDraw.md)

动态绘制

#### Defined in

Earth.ts:34

___

### entities

• `Private` `Optional` **entities**: [`DefaultEntities`](../interfaces/DefaultEntities.md)<`unknown`\>

默认实例

#### Defined in

Earth.ts:50

___

### globalEvent

• `Private` `Optional` **globalEvent**: [`GlobalEvent`](GlobalEvent.md)

全局公共事件

#### Defined in

Earth.ts:54

___

### map

• **map**: `Map`

`map`实例

#### Defined in

Earth.ts:26

___

### measure

• `Private` `Optional` **measure**: [`Measure`](Measure.md)

测量

#### Defined in

Earth.ts:38

___

### view

• **view**: `View`

`view`实例

#### Defined in

Earth.ts:30

## Methods

### addLayer

▸ **addLayer**(`layer`): `void`

添加图层

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `layer` | `BaseLayer` | `layer`图层 |

#### Returns

`void`

#### Defined in

Earth.ts:150

___

### animateFlyTo

▸ **animateFlyTo**(`position`, `zoom?`, `duration?`): `void`

移动相机到指定位置(动画)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `position` | `Coordinate` | 位置 |
| `zoom?` | `number` | 缩放 |
| `duration?` | `number` | 动画时间(毫秒) |

#### Returns

`void`

#### Defined in

Earth.ts:188

___

### closeDefaultEvent

▸ `Private` **closeDefaultEvent**(): `void`

关闭默认事件

#### Returns

`void`

#### Defined in

Earth.ts:65

___

### closeRightMenu

▸ `Private` **closeRightMenu**(`event`): `void`

关闭右键菜单监听方法

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `MouseEvent` | 鼠标事件 |

#### Returns

`void`

#### Defined in

Earth.ts:59

___

### createOsmLayer

▸ **createOsmLayer**(): `TileLayer`<`OSM`\>

创建OSM底图图层

#### Returns

`TileLayer`<`OSM`\>

`TileLayer<OSM>`实例

#### Defined in

Earth.ts:120

___

### createXyzLayer

▸ **createXyzLayer**(`url`): `TileLayer`<`XYZ`\>

创建瓦片地图图层

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `url` | `string` | 瓦片地址 |

#### Returns

`TileLayer`<`XYZ`\>

`TileLayer<XYZ>`实例

#### Defined in

Earth.ts:130

___

### flyHome

▸ **flyHome**(): `void`

移动相机到默认位置

#### Returns

`void`

#### Defined in

Earth.ts:175

___

### flyTo

▸ **flyTo**(`position`, `zoom?`): `void`

移动相机到指定位置(无动画)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `position` | `Coordinate` | 位置 |
| `zoom?` | `number` | 缩放 |

#### Returns

`void`

#### Defined in

Earth.ts:200

___

### getFeatureAtPixel

▸ **getFeatureAtPixel**(`pixel`): [`IFeatureAtPixel`](../interfaces/IFeatureAtPixel.md)

判断当前像素位置是否存在feature对象

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pixel` | `number`[] | 像素坐标 |

#### Returns

[`IFeatureAtPixel`](../interfaces/IFeatureAtPixel.md)

返回该像素位置信息，详见[IFeatureAtPixel](../interfaces/IFeatureAtPixel.md)

#### Defined in

Earth.ts:303

___

### getLayerAtFeature

▸ **getLayerAtFeature**(`feature`): `undefined` \| `Layer`<`Source`, `LayerRenderer`<`any`\>\>

根据元素获取元素所在的图层

#### Parameters

| Name | Type |
| :------ | :------ |
| `feature` | `Feature`<`Geometry`\> |

#### Returns

`undefined` \| `Layer`<`Source`, `LayerRenderer`<`any`\>\>

#### Defined in

Earth.ts:221

___

### removeLayer

▸ **removeLayer**(`layer?`): `undefined` \| `BaseLayer`

移除图层

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `layer?` | `BaseLayer` | `layer`图层 |

#### Returns

`undefined` \| `BaseLayer`

BaseLayer | undefined

#### Defined in

Earth.ts:158

___

### setMouseStyle

▸ **setMouseStyle**(`cursor`): `void`

设置鼠标样式

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cursor` | `string` | 鼠标样式 |

#### Returns

`void`

#### Defined in

Earth.ts:208

___

### setMouseStyleToCrosshair

▸ **setMouseStyleToCrosshair**(): `void`

设置鼠标在地图上的样式为十字准线

#### Returns

`void`

#### Defined in

Earth.ts:214

___

### setMouseStyleToDefault

▸ **setMouseStyleToDefault**(): `void`

设置鼠标在地图上的样式为默认

#### Returns

`void`

#### Defined in

Earth.ts:236

___

### useDefaultLayer

▸ **useDefaultLayer**<`T`\>(): [`DefaultEntities`](../interfaces/DefaultEntities.md)<`T`\>

获取默认实体对象

#### Type parameters

| Name |
| :------ |
| `T` |

#### Returns

[`DefaultEntities`](../interfaces/DefaultEntities.md)<`T`\>

#### Defined in

Earth.ts:242

___

### useDrawTool

▸ **useDrawTool**(): [`DynamicDraw`](DynamicDraw.md)

使用动态绘制工具

#### Returns

[`DynamicDraw`](DynamicDraw.md)

#### Defined in

Earth.ts:283

___

### useGlobalEvent

▸ **useGlobalEvent**(): [`GlobalEvent`](GlobalEvent.md)

使用地图事件

#### Returns

[`GlobalEvent`](GlobalEvent.md)

#### Defined in

Earth.ts:274

___

### useMeasure

▸ **useMeasure**(): [`Measure`](Measure.md)

使用测量工具

#### Returns

[`Measure`](Measure.md)

#### Defined in

Earth.ts:292

___

### zeroFill

▸ `Private` **zeroFill**(`num`, `len`, `radix`): `string`

八进制字符串补0

#### Parameters

| Name | Type |
| :------ | :------ |
| `num` | `number` |
| `len` | `number` |
| `radix` | `number` |

#### Returns

`string`

#### Defined in

Earth.ts:113
