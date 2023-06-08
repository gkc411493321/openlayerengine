[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / Base

# Class: Base

基类，提供图层常见的获取，删除及更新方法

## Hierarchy

- **`Base`**

  ↳ [`CircleLayer`](CircleLayer.md)

  ↳ [`PointLayer`](PointLayer.md)

  ↳ [`PolygonLayer`](PolygonLayer.md)

  ↳ [`PolylineLayer`](PolylineLayer.md)

  ↳ [`BillboardLayer`](BillboardLayer.md)

## Table of contents

### Constructors

- [constructor](Base.md#constructor)

### Properties

- [allowDestroyed](Base.md#allowdestroyed)
- [earth](Base.md#earth)
- [hideFeatureMap](Base.md#hidefeaturemap)
- [layer](Base.md#layer)

### Methods

- [destroy](Base.md#destroy)
- [get](Base.md#get)
- [getLayer](Base.md#getlayer)
- [hide](Base.md#hide)
- [remove](Base.md#remove)
- [save](Base.md#save)
- [setFill](Base.md#setfill)
- [setLayerIndex](Base.md#setlayerindex)
- [setStroke](Base.md#setstroke)
- [setText](Base.md#settext)
- [show](Base.md#show)

## Constructors

### constructor

• **new Base**(`earth`, `layer`, `type`)

图层构造类

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `earth` | [`Earth`](Earth.md) | 地图实例 |
| `layer` | `VectorLayer`<`VectorSource`<`Geometry`\>\> | 图层实例 |
| `type` | `string` | - |

#### Defined in

base/Base.ts:30

## Properties

### allowDestroyed

• **allowDestroyed**: `boolean` = `true`

销毁标记

#### Defined in

base/Base.ts:16

___

### earth

• `Protected` **earth**: [`Earth`](Earth.md)

地图实例

#### Defined in

base/Base.ts:30

___

### hideFeatureMap

• **hideFeatureMap**: `Map`<`string`, `Feature`<`Geometry`\>\>

缓存featur的集合

#### Defined in

base/Base.ts:24

___

### layer

• **layer**: `VectorLayer`<`VectorSource`<`Geometry`\>\>

图层

#### Defined in

base/Base.ts:20

## Methods

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

#### Defined in

base/Base.ts:153

___

### getLayer

▸ **getLayer**(): `VectorLayer`<`VectorSource`<`Geometry`\>\>

获取图层

#### Returns

`VectorLayer`<`VectorSource`<`Geometry`\>\>

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

#### Defined in

base/Base.ts:107

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

#### Defined in

base/Base.ts:230

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

#### Defined in

base/Base.ts:211
