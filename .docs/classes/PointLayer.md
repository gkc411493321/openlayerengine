[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / PointLayer

# Class: PointLayer<T\>

创建点`Point`

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

## Hierarchy

- [`Base`](Base.md)

  ↳ **`PointLayer`**

## Table of contents

### Constructors

- [constructor](PointLayer.md#constructor)

### Properties

- [allowDestroyed](PointLayer.md#allowdestroyed)
- [earth](PointLayer.md#earth)
- [hideFeatureMap](PointLayer.md#hidefeaturemap)
- [layer](PointLayer.md#layer)

### Methods

- [add](PointLayer.md#add)
- [continueFlash](PointLayer.md#continueflash)
- [createFeature](PointLayer.md#createfeature)
- [destroy](PointLayer.md#destroy)
- [get](PointLayer.md#get)
- [getLayer](PointLayer.md#getlayer)
- [hide](PointLayer.md#hide)
- [remove](PointLayer.md#remove)
- [save](PointLayer.md#save)
- [set](PointLayer.md#set)
- [setFill](PointLayer.md#setfill)
- [setLayerIndex](PointLayer.md#setlayerindex)
- [setPosition](PointLayer.md#setposition)
- [setStroke](PointLayer.md#setstroke)
- [setText](PointLayer.md#settext)
- [show](PointLayer.md#show)
- [stopFlash](PointLayer.md#stopflash)

## Constructors

### constructor

• **new PointLayer**<`T`\>(`earth`)

构造器

**`Example`**

```
const pointLayer = new PointLayer(useEarth());
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

base/PointLayer.ts:29

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

▸ **add**(`param`): `Feature`<`Point`\>

创建点

**`Example`**

```
const pointLayer = new PointLayer(useEarth());
pointLayer.add({
 // ...
})
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`IPointParam`](../interfaces/IPointParam.md)<`T`\> | 详细参数，详见[IPointParam](../interfaces/IPointParam.md) |

#### Returns

`Feature`<`Point`\>

返回`Feature<Point>`实例

#### Defined in

base/PointLayer.ts:74

___

### continueFlash

▸ **continueFlash**(): `void`

图层内所有暂停的闪烁点重新闪烁

**`Example`**

```
const pointLayer = new PointLayer(useEarth());
pointLayer.continueFlash();
```

#### Returns

`void`

#### Defined in

base/PointLayer.ts:126

▸ **continueFlash**(`id`): `void`

图层内指定暂停的闪烁点重新闪烁

**`Example`**

```
const pointLayer = new PointLayer(useEarth());
pointLayer.continueFlash("1");
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | `point`id |

#### Returns

`void`

#### Defined in

base/PointLayer.ts:136

___

### createFeature

▸ `Private` **createFeature**(`param`): `Feature`<`Point`\>

创建矢量元素

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`IPointParam`](../interfaces/IPointParam.md)<`T`\> | 创建`Point`参数，详见[IPointParam](../interfaces/IPointParam.md) |

#### Returns

`Feature`<`Point`\>

返回`Feature<Point>`实例

#### Defined in

base/PointLayer.ts:40

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

▸ **set**(`param`): `Feature`<`Point`\>[]

修改点属性

**`Example`**

```
const pointLayer = new PointLayer(useEarth());
pointLayer.set({
 // ...
})
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`ISetPointParam`](../interfaces/ISetPointParam.md) | 点详细参数，详见[ISetPointParam](../interfaces/ISetPointParam.md) |

#### Returns

`Feature`<`Point`\>[]

返回`Feature<Point>`实例数组

#### Defined in

base/PointLayer.ts:161

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

▸ **setPosition**(`id`, `position`): `Feature`<`Point`\>[]

修改点坐标

**`Example`**

```
const pointLayer = new PointLayer(useEarth());
pointLayer.setPosition("1",fromLonLat([125, 60]));
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | `point`id |
| `position` | `Coordinate` | 坐标 |

#### Returns

`Feature`<`Point`\>[]

返回`Feature<Point>`实例

#### Defined in

base/PointLayer.ts:204

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

___

### stopFlash

▸ **stopFlash**(): `void`

停止当前图层所有点闪烁状态

**`Example`**

```
const pointLayer = new PointLayer(useEarth());
pointLayer.stopFlash();
```

#### Returns

`void`

#### Defined in

base/PointLayer.ts:92

▸ **stopFlash**(`id`): `void`

停止指定点闪烁状态

**`Example`**

```
const pointLayer = new PointLayer(useEarth());
pointLayer.stopFlash("1");
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | `point`id |

#### Returns

`void`

#### Defined in

base/PointLayer.ts:102
