[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / IEditParam

# Interface: IEditParam

## Table of contents

### Properties

- [callback](IEditParam.md#callback)
- [feature](IEditParam.md#feature)
- [isShowUnderlay](IEditParam.md#isshowunderlay)

## Properties

### callback

• `Optional` **callback**: (`e`: [`IModifyEvent`](IModifyEvent.md)) => `void`

#### Type declaration

▸ (`e`): `void`

回调函数

##### Parameters

| Name | Type |
| :------ | :------ |
| `e` | [`IModifyEvent`](IModifyEvent.md) |

##### Returns

`void`

#### Defined in

interface/dynamicDraw.ts:125

___

### feature

• **feature**: `Feature`<`Geometry`\>

元素

#### Defined in

interface/dynamicDraw.ts:117

___

### isShowUnderlay

• `Optional` **isShowUnderlay**: `boolean`

是否显示参考底图，默认false

#### Defined in

interface/dynamicDraw.ts:121
