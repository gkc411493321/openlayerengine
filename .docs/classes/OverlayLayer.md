[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / OverlayLayer

# Class: OverlayLayer<T\>

创建覆盖物`Overlay`

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

## Table of contents

### Constructors

- [constructor](OverlayLayer.md#constructor)

### Properties

- [map](OverlayLayer.md#map)

### Methods

- [add](OverlayLayer.md#add)
- [get](OverlayLayer.md#get)
- [remove](OverlayLayer.md#remove)
- [set](OverlayLayer.md#set)
- [setPosition](OverlayLayer.md#setposition)

## Constructors

### constructor

• **new OverlayLayer**<`T`\>(`earth`)

构造器

**`Example`**

```
const overlayLayer = new OverlayLayer(useEarth()); 
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `earth` | [`Earth`](Earth.md) | 地图实例 |

#### Defined in

base/OverlayLayer.ts:23

## Properties

### map

• `Private` **map**: `Map`

地图map对象

#### Defined in

base/OverlayLayer.ts:14

## Methods

### add

▸ **add**(`param`): `Overlay`

添加覆盖物

**`Example`**

```
const overlayLayer = new OverlayLayer(useEarth());
// element 可以有多种方式创建
const div = document.getElementById("prop");
overlayLayer.add({
 // ...
 element:div,
 // ...
})

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`IOverlayParam`](../interfaces/IOverlayParam.md)<`T`\> | 覆盖物详细参数，详见[IOverlayParam](../interfaces/IOverlayParam.md) |

#### Returns

`Overlay`

返回`Overlay`实例

#### Defined in

base/OverlayLayer.ts:41

___

### get

▸ **get**(): `Overlay`[]

获取地图内所有覆盖物实例

**`Example`**

```
const overlayLayer = new OverlayLayer(useEarth());
overlayLayer.get();
```

#### Returns

`Overlay`[]

返回`Overlay`实例数组

#### Defined in

base/OverlayLayer.ts:117

▸ **get**(`id`): `Overlay`

获取指定覆盖物实例

**`Example`**

```
const overlayLayer = new OverlayLayer(useEarth());
overlayLayer.get("1");
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | 覆盖物id |

#### Returns

`Overlay`

返回`Overlay`实例数组

#### Defined in

base/OverlayLayer.ts:128

___

### remove

▸ **remove**(): `Overlay` \| `Overlay`[]

移除地图内所有覆盖物

**`Example`**

```
const overlayLayer = new OverlayLayer(useEarth());
overlayLayer.remove();
```

#### Returns

`Overlay` \| `Overlay`[]

返回`Overlay`实例数组

#### Defined in

base/OverlayLayer.ts:147

▸ **remove**(`id`): `Overlay` \| `Overlay`[]

移除指定覆盖物

**`Example`**

```
const overlayLayer = new OverlayLayer(useEarth());
overlayLayer.remove("1");
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | 覆盖物id |

#### Returns

`Overlay` \| `Overlay`[]

返回`Overlay`实例

#### Defined in

base/OverlayLayer.ts:158

___

### set

▸ **set**(`param`): ``null`` \| `Overlay`

修改覆盖物

**`Example`**

```
const overlayLayer = new OverlayLayer(useEarth());
overlayLayer.set({
 // ...
})

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`ISetOverlayParam`](../interfaces/ISetOverlayParam.md) | 覆盖物详细参数，详见[ISetOverlayParam](../interfaces/ISetOverlayParam.md) |

#### Returns

``null`` \| `Overlay`

返回`Overlay`实例或`null`

#### Defined in

base/OverlayLayer.ts:68

___

### setPosition

▸ **setPosition**(`id`, `position`): ``null`` \| `Overlay`

修改覆盖物坐标

**`Example`**

```
const overlayLayer = new OverlayLayer(useEarth());
overlayLayer.setPosition("overlay_x", fromLonLat([120, 22]));
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | 覆盖物id |
| `position` | `undefined` \| `Coordinate` | 覆盖物位置信息 |

#### Returns

``null`` \| `Overlay`

返回`Overlay`实例或`null`

#### Defined in

base/OverlayLayer.ts:99
