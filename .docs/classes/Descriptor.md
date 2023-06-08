[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / Descriptor

# Class: Descriptor<T\>

描述列表

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

## Table of contents

### Constructors

- [constructor](Descriptor.md#constructor)

### Properties

- [classNameList](Descriptor.md#classnamelist)
- [dom](Descriptor.md#dom)
- [earth](Descriptor.md#earth)
- [hook](Descriptor.md#hook)
- [id](Descriptor.md#id)
- [options](Descriptor.md#options)
- [overLayer](Descriptor.md#overlayer)
- [pixel](Descriptor.md#pixel)
- [positionDValue](Descriptor.md#positiondvalue)

### Methods

- [createHtmlList](Descriptor.md#createhtmllist)
- [destoryEvent](Descriptor.md#destoryevent)
- [destroy](Descriptor.md#destroy)
- [enableListEvent](Descriptor.md#enablelistevent)
- [hide](Descriptor.md#hide)
- [init](Descriptor.md#init)
- [set](Descriptor.md#set)
- [show](Descriptor.md#show)
- [updateLinePosition](Descriptor.md#updatelineposition)

## Constructors

### constructor

• **new Descriptor**<`T`\>(`earth`, `options`)

构造器

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `earth` | [`Earth`](Earth.md) | 地图实列 |
| `options` | [`IDescriptorParams`](../interfaces/IDescriptorParams.md)<`T`\> | 标牌参数，详见[IDescriptorParams](../interfaces/IDescriptorParams.md) |

#### Defined in

commponents/Descriptor.ts:52

## Properties

### classNameList

• `Private` **classNameList**: `string` = `"earth-engine-component-descriptor descriptor-list"`

容器className

#### Defined in

commponents/Descriptor.ts:34

___

### dom

• `Private` **dom**: `HTMLDivElement`

容器dom

#### Defined in

commponents/Descriptor.ts:26

___

### earth

• `Private` **earth**: [`Earth`](Earth.md)

地图实列

#### Defined in

commponents/Descriptor.ts:52

___

### hook

• `Private` **hook**: `Map`<`string`, `any`\>

事件缓存

#### Defined in

commponents/Descriptor.ts:46

___

### id

• `Private` **id**: `string`

容器id

#### Defined in

commponents/Descriptor.ts:22

___

### options

• `Private` **options**: [`IDescriptorParams`](../interfaces/IDescriptorParams.md)<`T`\>

标牌参数，详见[IDescriptorParams](../interfaces/IDescriptorParams.md)

#### Defined in

commponents/Descriptor.ts:52

___

### overLayer

• `Private` **overLayer**: [`OverlayLayer`](OverlayLayer.md)<`unknown`\>

overlay图层

#### Defined in

commponents/Descriptor.ts:30

___

### pixel

• `Private` `Optional` **pixel**: `Pixel`

记录容器初始化屏幕坐标

#### Defined in

commponents/Descriptor.ts:42

___

### positionDValue

• `Private` **positionDValue**: `number`[] = `[]`

容器坐标与事件坐标差值

#### Defined in

commponents/Descriptor.ts:38

## Methods

### createHtmlList

▸ `Private` **createHtmlList**(`element`): `string`

创建html文本

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `element` | [`IProperties`](../interfaces/IProperties.md)<`string` \| `number`\>[] | 容器内容 |

#### Returns

`string`

返回创建的html文本

#### Defined in

commponents/Descriptor.ts:187

___

### destoryEvent

▸ `Private` **destoryEvent**(): `void`

销毁事件

#### Returns

`void`

#### Defined in

commponents/Descriptor.ts:218

___

### destroy

▸ **destroy**(): `void`

销毁标牌及相关事件

#### Returns

`void`

#### Defined in

commponents/Descriptor.ts:306

___

### enableListEvent

▸ `Private` **enableListEvent**(): `void`

开始列表下容器事件

#### Returns

`void`

#### Defined in

commponents/Descriptor.ts:134

___

### hide

▸ **hide**(): `void`

隐藏标牌

#### Returns

`void`

#### Defined in

commponents/Descriptor.ts:299

___

### init

▸ `Private` **init**(): `void`

初始化地图容器及相关事件

#### Returns

`void`

#### Defined in

commponents/Descriptor.ts:59

___

### set

▸ **set**(`params`): `void`

设置标牌

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`IDescriptorSetParams`](../interfaces/IDescriptorSetParams.md)<`T`\> | 标牌参数，详见[IDescriptorSetParams](../interfaces/IDescriptorSetParams.md) |

#### Returns

`void`

#### Defined in

commponents/Descriptor.ts:232

___

### show

▸ **show**(): `void`

显示标牌

#### Returns

`void`

#### Defined in

commponents/Descriptor.ts:292

___

### updateLinePosition

▸ `Private` **updateLinePosition**(`coordinate`): `void`

更新连接线位置

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `coordinate` | `Coordinate` | 容器坐标点 |

#### Returns

`void`

#### Defined in

commponents/Descriptor.ts:71
