[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / Utils

# Class: Utils<T\>

## Type parameters

| Name |
| :------ |
| `T` |

## Table of contents

### Constructors

- [constructor](Utils.md#constructor)

### Methods

- [flash](Utils.md#flash)
- [GetGUID](Utils.md#getguid)
- [bezierSquareCalc](Utils.md#beziersquarecalc)
- [constantMultiVector2](Utils.md#constantmultivector2)
- [createStyle](Utils.md#createstyle)
- [linearInterpolation](Utils.md#linearinterpolation)
- [vector2Add](Utils.md#vector2add)

## Constructors

### constructor

• **new Utils**<`T`\>()

#### Type parameters

| Name |
| :------ |
| `T` |

## Methods

### flash

▸ **flash**(`feature`, `param`, `layer`): `void`

动态点刷新方法

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `feature` | `Feature`<`Geometry`\> | `Point` 实例 |
| `param` | [`IPointParam`](../interfaces/IPointParam.md)<`T`\> | 详细参数，详见[IPointParam](../interfaces/IPointParam.md) |
| `layer` | `VectorLayer`<`VectorSource`<`Geometry`\>\> | - |

#### Returns

`void`

#### Defined in

common/Utils.ts:123

___

### GetGUID

▸ `Static` **GetGUID**(`format?`): `string`

@description: 获取一个新的GUID

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `format` | ``"N"`` \| ``"D"`` \| ``"B"`` \| ``"P"`` \| ``"X"`` | `'D'` | 输出字符串样式，N-无连接符、D-减号连接符，BPX-未实现，默认D |

#### Returns

`string`

#### Defined in

common/Utils.ts:22

___

### bezierSquareCalc

▸ `Static` **bezierSquareCalc**(`startPos`, `center`, `endPos`, `t`): `number`[]

@description: 计算贝塞尔曲线

#### Parameters

| Name | Type |
| :------ | :------ |
| `startPos` | `number`[] |
| `center` | `number`[] |
| `endPos` | `number`[] |
| `t` | `number` |

#### Returns

`number`[]

number[]
@author: wuyue.nan

#### Defined in

common/Utils.ts:88

___

### constantMultiVector2

▸ `Static` **constantMultiVector2**(`constant`, `vector2`): `number`[]

@description: 常数乘以二维向量数组的函数

#### Parameters

| Name | Type |
| :------ | :------ |
| `constant` | `number` |
| `vector2` | `number`[] |

#### Returns

`number`[]

number[]
@author: wuyue.nan

#### Defined in

common/Utils.ts:65

___

### createStyle

▸ `Static` **createStyle**(`start`, `end`, `color?`): `Style`

创建样式

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start` | `Coordinate` | 开始点 |
| `end` | `Coordinate` | 结束点 |
| `color?` | `string` | 填充颜色 |

#### Returns

`Style`

返回`Style`

#### Defined in

common/Utils.ts:101

___

### linearInterpolation

▸ `Static` **linearInterpolation**(`startPos`, `endPos`, `t`): `number`[]

@description: 线性插值函数 此处的计算只处理二维带x ,y 的向量

#### Parameters

| Name | Type |
| :------ | :------ |
| `startPos` | `number`[] |
| `endPos` | `number`[] |
| `t` | `number` |

#### Returns

`number`[]

number[]
@author: wuyue.nan

#### Defined in

common/Utils.ts:53

___

### vector2Add

▸ `Static` **vector2Add**(`a`, `b`): `number`[]

@description: 计算曲线点

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `number`[] |
| `b` | `number`[] |

#### Returns

`number`[]

number[]
@author: wuyue.nan

#### Defined in

common/Utils.ts:75
