[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / IWindParam

# Interface: IWindParam

## Hierarchy

- [`IWindOptions`](IWindOptions.md)

  ↳ **`IWindParam`**

## Table of contents

### Properties

- [className](IWindParam.md#classname)
- [colorScale](IWindParam.md#colorscale)
- [data](IWindParam.md#data)
- [globalAlpha](IWindParam.md#globalalpha)
- [id](IWindParam.md#id)
- [lineWidth](IWindParam.md#linewidth)
- [paths](IWindParam.md#paths)
- [velocityScale](IWindParam.md#velocityscale)

## Properties

### className

• `Optional` **className**: `string`

类名

#### Defined in

interface/default.ts:710

___

### colorScale

• `Optional` **colorScale**: `string` \| `string`[] \| (`e`: `number`) => `void`

粒子颜色

#### Inherited from

[IWindOptions](IWindOptions.md).[colorScale](IWindOptions.md#colorscale)

#### Defined in

interface/default.ts:671

___

### data

• **data**: `any`

数据

#### Defined in

interface/default.ts:702

___

### globalAlpha

• `Optional` **globalAlpha**: `number`

粒子透明度，影响粒子拖尾长度，默认0.9

#### Inherited from

[IWindOptions](IWindOptions.md).[globalAlpha](IWindOptions.md#globalalpha)

#### Defined in

interface/default.ts:655

___

### id

• `Optional` **id**: `string`

id,唯一标识符

#### Defined in

interface/default.ts:706

___

### lineWidth

• `Optional` **lineWidth**: `number`

粒子宽度，默认1

#### Inherited from

[IWindOptions](IWindOptions.md).[lineWidth](IWindOptions.md#linewidth)

#### Defined in

interface/default.ts:667

___

### paths

• `Optional` **paths**: `number`

粒子数量，默认3000

#### Inherited from

[IWindOptions](IWindOptions.md).[paths](IWindOptions.md#paths)

#### Defined in

interface/default.ts:663

___

### velocityScale

• `Optional` **velocityScale**: `number`

粒子运动速度,默认1/25

#### Inherited from

[IWindOptions](IWindOptions.md).[velocityScale](IWindOptions.md#velocityscale)

#### Defined in

interface/default.ts:659
