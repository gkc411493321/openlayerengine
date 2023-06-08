[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / IDescriptorParams

# Interface: IDescriptorParams<T\>

## Type parameters

| Name |
| :------ |
| `T` |

## Table of contents

### Properties

- [close](IDescriptorParams.md#close)
- [drag](IDescriptorParams.md#drag)
- [fixedLineColor](IDescriptorParams.md#fixedlinecolor)
- [fixedModel](IDescriptorParams.md#fixedmodel)
- [footer](IDescriptorParams.md#footer)
- [header](IDescriptorParams.md#header)
- [isShowClose](IDescriptorParams.md#isshowclose)
- [isShowFixedline](IDescriptorParams.md#isshowfixedline)
- [type](IDescriptorParams.md#type)

## Properties

### close

• `Optional` **close**: (`arg`: { `data?`: `T`  }) => `void`

#### Type declaration

▸ (`arg`): `void`

关闭按钮回调函数

##### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | `Object` |
| `arg.data?` | `T` |

##### Returns

`void`

#### Defined in

interface/descriptor.ts:63

___

### drag

• `Optional` **drag**: `boolean`

启用拖动事件，默认开启

#### Defined in

interface/descriptor.ts:47

___

### fixedLineColor

• `Optional` **fixedLineColor**: `string`

定位线颜色

#### Defined in

interface/descriptor.ts:39

___

### fixedModel

• `Optional` **fixedModel**: ``"position"`` \| ``"pixel"``

窗口定位模式，默认position。position：跟随地理位置固定， pixel：跟随屏幕坐标固定

#### Defined in

interface/descriptor.ts:43

___

### footer

• `Optional` **footer**: `string`

底部

#### Defined in

interface/descriptor.ts:59

___

### header

• `Optional` **header**: `string`

头部

#### Defined in

interface/descriptor.ts:55

___

### isShowClose

• `Optional` **isShowClose**: `boolean`

是否开启关闭按钮，默认开启

#### Defined in

interface/descriptor.ts:51

___

### isShowFixedline

• `Optional` **isShowFixedline**: `boolean`

是否显示定位线

#### Defined in

interface/descriptor.ts:35

___

### type

• **type**: ``"list"`` \| ``"custom"``

描述器类型，list：列表，custom：自定义

#### Defined in

interface/descriptor.ts:31
