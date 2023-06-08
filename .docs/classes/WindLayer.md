[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / WindLayer

# Class: WindLayer

风场类，可绘制风场、洋流

## Table of contents

### Constructors

- [constructor](WindLayer.md#constructor)

### Properties

- [map](WindLayer.md#map)
- [windCache](WindLayer.md#windcache)

### Methods

- [add](WindLayer.md#add)
- [get](WindLayer.md#get)
- [remove](WindLayer.md#remove)
- [set](WindLayer.md#set)
- [setOptions](WindLayer.md#setoptions)

## Constructors

### constructor

• **new WindLayer**(`earth`)

构造器

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `earth` | [`Earth`](Earth.md) | 地图实例 |

#### Defined in

base/WindLayer.ts:23

## Properties

### map

• `Private` **map**: `Map`

map实例

#### Defined in

base/WindLayer.ts:14

___

### windCache

• `Private` `Optional` **windCache**: `Map`<`string`, `WindLayer`\>

风场缓存

#### Defined in

base/WindLayer.ts:18

## Methods

### add

▸ **add**(`param`): `WindLayer`

新增风场

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`IWindParam`](../interfaces/IWindParam.md) | 参数，详见[IWindParam](../interfaces/IWindParam.md) |

#### Returns

`WindLayer`

返回WindLayers

#### Defined in

base/WindLayer.ts:31

___

### get

▸ **get**(): `undefined` \| `WindLayer`[]

获取所有风场

#### Returns

`undefined` \| `WindLayer`[]

#### Defined in

base/WindLayer.ts:75

▸ **get**(`id`): `undefined` \| `WindLayer`

获取指定风场

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | 风场id |

#### Returns

`undefined` \| `WindLayer`

#### Defined in

base/WindLayer.ts:80

___

### remove

▸ **remove**(): `boolean`

删除所有风场

#### Returns

`boolean`

#### Defined in

base/WindLayer.ts:95

▸ **remove**(`id`): `boolean`

删除指定风场

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | 风场id |

#### Returns

`boolean`

#### Defined in

base/WindLayer.ts:100

___

### set

▸ **set**(`param`): `undefined` \| `WindLayer`

修改风场数据

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`ISetWindParam`](../interfaces/ISetWindParam.md) | 参数，详见[ISetWindParam](../interfaces/ISetWindParam.md) |

#### Returns

`undefined` \| `WindLayer`

#### Defined in

base/WindLayer.ts:57

___

### setOptions

▸ **setOptions**(`param`): `void`

修改风场配置参数

#### Parameters

| Name | Type |
| :------ | :------ |
| `param` | [`ISetWindOptions`](../interfaces/ISetWindOptions.md) |

#### Returns

`void`

#### Defined in

base/WindLayer.ts:66
