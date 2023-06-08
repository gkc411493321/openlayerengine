[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / PolygonLayer

# Class: PolygonLayer<T\>

创建多边形`Polygon`

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

## Hierarchy

- [`Base`](Base.md)

  ↳ **`PolygonLayer`**

## Table of contents

### Constructors

- [constructor](PolygonLayer.md#constructor)

### Properties

- [allowDestroyed](PolygonLayer.md#allowdestroyed)
- [earth](PolygonLayer.md#earth)
- [hideFeatureMap](PolygonLayer.md#hidefeaturemap)
- [layer](PolygonLayer.md#layer)

### Methods

- [add](PolygonLayer.md#add)
- [createFeature](PolygonLayer.md#createfeature)
- [destroy](PolygonLayer.md#destroy)
- [get](PolygonLayer.md#get)
- [getLayer](PolygonLayer.md#getlayer)
- [hide](PolygonLayer.md#hide)
- [remove](PolygonLayer.md#remove)
- [save](PolygonLayer.md#save)
- [set](PolygonLayer.md#set)
- [setFill](PolygonLayer.md#setfill)
- [setLayerIndex](PolygonLayer.md#setlayerindex)
- [setPosition](PolygonLayer.md#setposition)
- [setStroke](PolygonLayer.md#setstroke)
- [setText](PolygonLayer.md#settext)
- [show](PolygonLayer.md#show)

## Constructors

### constructor

• **new PolygonLayer**<`T`\>(`earth`)

构造器

**`Example`**

```
const polygonLayer = new PolygonLayer(useEarth());
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `earth` | [`Earth`](Earth.md) | 地图实例 |

#### Overrides

[Base](Base.md).[constructor](Base.md#constructor)

#### Defined in

base/PolygonLayer.ts:24

## Properties

### allowDestroyed

• **allowDestroyed**: `boolean` = `true`

销毁标记

#### Inherited from

[Base](Base.md).[allowDestroyed](Base.md#allowdestroyed)

#### Defined in

base/Base.ts:16

___

### earth

• `Protected` **earth**: [`Earth`](Earth.md)

地图实例

#### Inherited from

[Base](Base.md).[earth](Base.md#earth)

#### Defined in

base/Base.ts:30

___

### hideFeatureMap

• **hideFeatureMap**: `Map`<`string`, `Feature`<`Geometry`\>\>

缓存featur的集合

#### Inherited from

[Base](Base.md).[hideFeatureMap](Base.md#hidefeaturemap)

#### Defined in

base/Base.ts:24

___

### layer

• **layer**: `VectorLayer`<`VectorSource`<`Geometry`\>\>

图层

#### Inherited from

[Base](Base.md).[layer](Base.md#layer)

#### Defined in

base/Base.ts:20

## Methods

### add

▸ **add**(`param`): `Feature`<`Polygon`\>

添加多边形

**`Example`**

```
const polygonLayer = new PolygonLayer(useEarth());
polygonLayer.add({
 // ...
})
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`IPolygonParam`](../interfaces/IPolygonParam.md)<`T`\> | 详细参数，详见[IPolygonParam](../interfaces/IPolygonParam.md) |

#### Returns

`Feature`<`Polygon`\>

返回`Feature<Polygon>`实例

#### Defined in

base/PolygonLayer.ts:62

___

### createFeature

▸ `Private` **createFeature**(`param`): `Feature`<`Polygon`\>

创建矢量元素

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`IPolygonParam`](../interfaces/IPolygonParam.md)<`T`\> | 详细参数，详见[IPolygonParam](../interfaces/IPolygonParam.md) |

#### Returns

`Feature`<`Polygon`\>

返回`Feature<Polygon>`实例

#### Defined in

base/PolygonLayer.ts:35

___

### destroy

▸ **destroy**(): `boolean`

销毁图层，同时销毁该图层所有元素，不可恢复

**`Example`**

```
const flag:boolean = layer.destroy();
```

#### Returns

`boolean`

返回boolean值

#### Inherited from

[Base](Base.md).[destroy](Base.md#destroy)

#### Defined in

base/Base.ts:247

___

### get

▸ **get**(): `Feature`<`Geometry`\>[]

获取图层中所有矢量元素

**`Example`**

```
const features:Feature<Geometry>[] = layer.get();
```

#### Returns

`Feature`<`Geometry`\>[]

返回矢量元素数组

#### Inherited from

[Base](Base.md).[get](Base.md#get)

#### Defined in

base/Base.ts:143

▸ **get**(`id`): `Feature`<`Geometry`\>[]

获取图层中指定矢量元素

**`Example`**

```
const features:Feature<Geometry>[] = layer.get("1");
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | 矢量元素id |

#### Returns

`Feature`<`Geometry`\>[]

返回矢量元素数组

#### Inherited from

[Base](Base.md).[get](Base.md#get)

#### Defined in

base/Base.ts:153

___

### getLayer

▸ **getLayer**(): `VectorLayer`<`VectorSource`<`Geometry`\>\>

获取图层

#### Returns

`VectorLayer`<`VectorSource`<`Geometry`\>\>

#### Inherited from

[Base](Base.md).[getLayer](Base.md#getlayer)

#### Defined in

base/Base.ts:236

___

### hide

▸ **hide**(): `void`

隐藏图层所有矢量元素

**`Example`**

```
layer.hide();
```

#### Returns

`void`

#### Inherited from

[Base](Base.md).[hide](Base.md#hide)

#### Defined in

base/Base.ts:172

▸ **hide**(`id`): `void`

隐藏图层指定矢量元素

**`Example`**

```
layer.hide("1");
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | 矢量元素id |

#### Returns

`void`

#### Inherited from

[Base](Base.md).[hide](Base.md#hide)

#### Defined in

base/Base.ts:181

___

### remove

▸ **remove**(): `void`

删除图层所有矢量元素

**`Example`**

```
layer.remove();
```

#### Returns

`void`

#### Inherited from

[Base](Base.md).[remove](Base.md#remove)

#### Defined in

base/Base.ts:118

▸ **remove**(`id`): `void`

删除图层指定矢量元素元素

**`Example`**

```
layer.remove("1");
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | 矢量元素id |

#### Returns

`void`

#### Inherited from

[Base](Base.md).[remove](Base.md#remove)

#### Defined in

base/Base.ts:127

___

### save

▸ `Protected` **save**(`feature`): `Feature`<`Geometry`\>

往图层添加一个矢量元素

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `feature` | `Feature`<`Geometry`\> | 矢量元素实例 |

#### Returns

`Feature`<`Geometry`\>

返回矢量元素实例

#### Inherited from

[Base](Base.md).[save](Base.md#save)

#### Defined in

base/Base.ts:107

___

### set

▸ **set**(`param`): `Feature`<`Polygon`\>[]

修改多边形

**`Example`**

```
const polygonLayer = new PolygonLayer(useEarth());
polygonLayer.set({
 // ...
})
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`ISetPolygonParam`](../interfaces/ISetPolygonParam.md) | 详细参数，详见[ISetPolygonParam](../interfaces/ISetPolygonParam.md) |

#### Returns

`Feature`<`Polygon`\>[]

返回`Feature<Polygon>`实例数组

#### Defined in

base/PolygonLayer.ts:79

___

### setFill

▸ `Protected` **setFill**(`style`, `param?`): `Style`

设置填充样式

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `style` | `Style` | style实例 |
| `param?` | [`IFill`](../interfaces/IFill.md) | 填充参数，`可选的`。详见[IFill](../interfaces/IFill.md) |

#### Returns

`Style`

返回style实例

#### Inherited from

[Base](Base.md).[setFill](Base.md#setfill)

#### Defined in

base/Base.ts:59

___

### setLayerIndex

▸ **setLayerIndex**(`index`): `void`

设置图层`z-index`等级

**`Example`**

```
layer.setLayerIndex(999)
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `index` | `number` | 等级 |

#### Returns

`void`

#### Inherited from

[Base](Base.md).[setLayerIndex](Base.md#setlayerindex)

#### Defined in

base/Base.ts:230

___

### setPosition

▸ **setPosition**(`id`, `position`): `Feature`<`Polygon`\>[]

修改多边形

**`Example`**

```
const polygonLayer = new PolygonLayer(useEarth());
polygonLayer.setPosition("polygon_2", [[fromLonLat([100, 50]), fromLonLat([130, 30]), fromLonLat([140, 30]), fromLonLat([140, 50])]]);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | `polygon`id |
| `position` | `Coordinate`[][] | 坐标 |

#### Returns

`Feature`<`Polygon`\>[]

返回`Feature<Polygon>`实例数组

#### Defined in

base/PolygonLayer.ts:111

___

### setStroke

▸ `Protected` **setStroke**(`style`, `param?`, `width?`): `Style`

设置描边样式

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `style` | `Style` | style实例 |
| `param?` | [`IStroke`](../interfaces/IStroke.md) | 描边参数，`可选的`。详见[IStroke](../interfaces/IStroke.md) |
| `width?` | `number` | 宽度，`可选的` |

#### Returns

`Style`

返回style实例

#### Inherited from

[Base](Base.md).[setStroke](Base.md#setstroke)

#### Defined in

base/Base.ts:44

___

### setText

▸ `Protected` **setText**(`style`, `param?`, `offsetY?`): `Style`

设置文本样式

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `style` | `Style` | style实例 |
| `param?` | [`ILabel`](../interfaces/ILabel.md) | 文本参数，`可选的`。详见[ILabel](../interfaces/ILabel.md) |
| `offsetY?` | `number` | 纵向偏移量，`可选的`。 |

#### Returns

`Style`

返回style实例

#### Inherited from

[Base](Base.md).[setText](Base.md#settext)

#### Defined in

base/Base.ts:73

___

### show

▸ **show**(): `void`

显示图层所有矢量元素

**`Example`**

```
layer.show();
```

#### Returns

`void`

#### Inherited from

[Base](Base.md).[show](Base.md#show)

#### Defined in

base/Base.ts:202

▸ **show**(`id`): `void`

显示图层指定矢量元素

**`Example`**

```
layer.show("1");
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | 矢量元素id |

#### Returns

`void`

#### Inherited from

[Base](Base.md).[show](Base.md#show)

#### Defined in

base/Base.ts:211
