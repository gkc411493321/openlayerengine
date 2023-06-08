[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / PolylineLayer

# Class: PolylineLayer<T\>

创建线`Polyline`

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

## Hierarchy

- [`Base`](Base.md)

  ↳ **`PolylineLayer`**

## Table of contents

### Constructors

- [constructor](PolylineLayer.md#constructor)

### Properties

- [allowDestroyed](PolylineLayer.md#allowdestroyed)
- [earth](PolylineLayer.md#earth)
- [flashKey](PolylineLayer.md#flashkey)
- [flyCatch](PolylineLayer.md#flycatch)
- [hideFeatureMap](PolylineLayer.md#hidefeaturemap)
- [layer](PolylineLayer.md#layer)
- [lineDash](PolylineLayer.md#linedash)

### Methods

- [add](PolylineLayer.md#add)
- [addFlightLine](PolylineLayer.md#addflightline)
- [addFlowingDash](PolylineLayer.md#addflowingdash)
- [addLineArrows](PolylineLayer.md#addlinearrows)
- [createFeature](PolylineLayer.md#createfeature)
- [destroy](PolylineLayer.md#destroy)
- [get](PolylineLayer.md#get)
- [getLayer](PolylineLayer.md#getlayer)
- [hide](PolylineLayer.md#hide)
- [remove](PolylineLayer.md#remove)
- [removeFlightLine](PolylineLayer.md#removeflightline)
- [save](PolylineLayer.md#save)
- [set](PolylineLayer.md#set)
- [setFill](PolylineLayer.md#setfill)
- [setFlightPosition](PolylineLayer.md#setflightposition)
- [setLayerIndex](PolylineLayer.md#setlayerindex)
- [setPosition](PolylineLayer.md#setposition)
- [setStroke](PolylineLayer.md#setstroke)
- [setText](PolylineLayer.md#settext)
- [show](PolylineLayer.md#show)

## Constructors

### constructor

• **new PolylineLayer**<`T`\>(`earth`)

构造器

**`Example`**

```
const polyline = new Polyline(useEarth());
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

base/PolylineLayer.ts:45

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

### flashKey

• `Private` **flashKey**: `Map`<`string`, `EventsKey`\>

流动线事件key集合

#### Defined in

base/PolylineLayer.ts:35

___

### flyCatch

• `Private` **flyCatch**: `Map`<`string`, `default`<`unknown`\>\>

飞线缓存集合

#### Defined in

base/PolylineLayer.ts:27

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

___

### lineDash

• `Private` **lineDash**: `Map`<`string`, `number`\>

流动线步进集合

#### Defined in

base/PolylineLayer.ts:31

## Methods

### add

▸ **add**(`param`): `Feature`<`LineString`\>

添加线段

**`Example`**

```
const polyline = new Polyline(useEarth());
polyline.add({
 // ...
})
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`IPolylineParam`](../interfaces/IPolylineParam.md)<`T`\> | 详细参数，详见[IPolylineParam](../interfaces/IPolylineParam.md) |

#### Returns

`Feature`<`LineString`\>

返回`Feature<LineString>`

#### Defined in

base/PolylineLayer.ts:191

___

### addFlightLine

▸ **addFlightLine**(`param`): `default`<`unknown`\>

添加飞行线

**`Example`**

```
const polyline = new Polyline(useEarth());
polyline.addFlightLine({
 // ...
})
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`IPolylineFlyParam`](../interfaces/IPolylineFlyParam.md)<`T`\> | 详细参数，详见[IPolylineFlyParam](../interfaces/IPolylineFlyParam.md) |

#### Returns

`default`<`unknown`\>

返回`Flightline`

#### Defined in

base/PolylineLayer.ts:214

___

### addFlowingDash

▸ `Private` **addFlowingDash**(`param`): `Feature`<`LineString`\>

增加流动线段

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`IPolylineParam`](../interfaces/IPolylineParam.md)<`T`\> | 详细参数，详见[IPolylineParam](../interfaces/IPolylineParam.md) |

#### Returns

`Feature`<`LineString`\>

返回`Feature<LineString>`

#### Defined in

base/PolylineLayer.ts:112

___

### addLineArrows

▸ `Private` **addLineArrows**(`param`): `Feature`<`LineString`\>

增加带箭头的线段

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`IPolylineParam`](../interfaces/IPolylineParam.md)<`T`\> | 详细参数，详见[IPolylineParam](../interfaces/IPolylineParam.md) |

#### Returns

`Feature`<`LineString`\>

返回`Feature<LineString>`

#### Defined in

base/PolylineLayer.ts:78

___

### createFeature

▸ `Private` **createFeature**(`param`): `Feature`<`LineString`\>

创建矢量元素

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`IPolylineParam`](../interfaces/IPolylineParam.md)<`T`\> | 详细参数，详见[IPolylineParam](../interfaces/IPolylineParam.md) |

#### Returns

`Feature`<`LineString`\>

返回`Feature<LineString>`实例

#### Defined in

base/PolylineLayer.ts:57

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

#### Overrides

[Base](Base.md).[hide](Base.md#hide)

#### Defined in

base/PolylineLayer.ts:358

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

#### Overrides

[Base](Base.md).[hide](Base.md#hide)

#### Defined in

base/PolylineLayer.ts:367

___

### remove

▸ **remove**(): `void`

删除所有线段

#### Returns

`void`

#### Overrides

[Base](Base.md).[remove](Base.md#remove)

#### Defined in

base/PolylineLayer.ts:252

▸ **remove**(`id`): `void`

删除指定线段

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | 线段id |

#### Returns

`void`

#### Overrides

[Base](Base.md).[remove](Base.md#remove)

#### Defined in

base/PolylineLayer.ts:257

___

### removeFlightLine

▸ **removeFlightLine**(): `void`

删除所有飞行线

**`Example`**

```
const polyline = new Polyline(useEarth());
polyline.removeFlightLine();
```

#### Returns

`void`

#### Defined in

base/PolylineLayer.ts:303

▸ **removeFlightLine**(`id`): `void`

删除指定飞行线

**`Example`**

```
const polyline = new Polyline(useEarth());
polyline.removeFlightLine("1");
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | `flyLine`id |

#### Returns

`void`

#### Defined in

base/PolylineLayer.ts:313

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

▸ **set**(`param`): ``null`` \| `Feature`<`LineString`\>

修改线。注意，此方法不适用飞行线修改

**`Example`**

```
const polyline = new Polyline(useEarth());
polyline.set({
 // ...
})
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`ISetPolylineParam`](../interfaces/ISetPolylineParam.md) | 线参数，详见[ISetPolylineParam](../interfaces/ISetPolylineParam.md) |

#### Returns

``null`` \| `Feature`<`LineString`\>

返回`Feature<LineString>`实例

#### Defined in

base/PolylineLayer.ts:340

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

### setFlightPosition

▸ **setFlightPosition**(`id`, `position`): `void`

修改飞线坐标

**`Example`**

```
const polyline = new Polyline(useEarth());
polyline.setFlightPosition("1", [fromLonLat([100, 70]), fromLonLat([100, 50])]);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | `flyLine`id |
| `position` | `Coordinate`[] | 坐标 |

#### Returns

`void`

#### Defined in

base/PolylineLayer.ts:289

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

▸ **setPosition**(`id`, `position`): `Feature`<`LineString`\>[]

修改线段坐标

**`Example`**

```
const polyline = new Polyline(useEarth());
polyline.setPosition("1", [fromLonLat([100, 70]), fromLonLat([100, 50])]);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | `polyline`id |
| `position` | `Coordinate`[] | 坐标 |

#### Returns

`Feature`<`LineString`\>[]

返回`Feature<LineString>`实例数组

#### Defined in

base/PolylineLayer.ts:231

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

#### Overrides

[Base](Base.md).[show](Base.md#show)

#### Defined in

base/PolylineLayer.ts:388

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

#### Overrides

[Base](Base.md).[show](Base.md#show)

#### Defined in

base/PolylineLayer.ts:397
