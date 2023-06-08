[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / IWindOptions

# Interface: IWindOptions

## Hierarchy

- **`IWindOptions`**

  ↳ [`IWindParam`](IWindParam.md)

## Table of contents

### Properties

- [colorScale](IWindOptions.md#colorscale)
- [globalAlpha](IWindOptions.md#globalalpha)
- [lineWidth](IWindOptions.md#linewidth)
- [paths](IWindOptions.md#paths)
- [velocityScale](IWindOptions.md#velocityscale)

## Properties

### colorScale

• `Optional` **colorScale**: `string` \| `string`[] \| (`e`: `number`) => `void`

粒子颜色

#### Defined in

interface/default.ts:671

___

### globalAlpha

• `Optional` **globalAlpha**: `number`

粒子透明度，影响粒子拖尾长度，默认0.9

#### Defined in

interface/default.ts:655

___

### lineWidth

• `Optional` **lineWidth**: `number`

粒子宽度，默认1

#### Defined in

interface/default.ts:667

___

### paths

• `Optional` **paths**: `number`

粒子数量，默认3000

#### Defined in

interface/default.ts:663

___

### velocityScale

• `Optional` **velocityScale**: `number`

粒子运动速度,默认1/25

#### Defined in

interface/default.ts:659
