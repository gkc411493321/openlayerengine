[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / ISetPointParam

# Interface: ISetPointParam

## Table of contents

### Properties

- [center](ISetPointParam.md#center)
- [duration](ISetPointParam.md#duration)
- [fill](ISetPointParam.md#fill)
- [flashColor](ISetPointParam.md#flashcolor)
- [id](ISetPointParam.md#id)
- [isFlash](ISetPointParam.md#isflash)
- [isRepeat](ISetPointParam.md#isrepeat)
- [label](ISetPointParam.md#label)
- [size](ISetPointParam.md#size)
- [stroke](ISetPointParam.md#stroke)

## Properties

### center

• `Optional` **center**: `Coordinate`

点中心

#### Defined in

interface/default.ts:118

___

### duration

• `Optional` **duration**: `number`

闪烁一次持续时间，默认1000ms

#### Defined in

interface/default.ts:134

___

### fill

• `Optional` **fill**: [`IFill`](IFill.md)

填充样式

#### Defined in

interface/default.ts:146

___

### flashColor

• `Optional` **flashColor**: [`IRgbColor`](IRgbColor.md)

闪烁颜色，默认为rgb(255,0,0)

#### Defined in

interface/default.ts:130

___

### id

• **id**: `string`

id

#### Defined in

interface/default.ts:114

___

### isFlash

• `Optional` **isFlash**: `boolean`

是否开启闪烁点，默认false

#### Defined in

interface/default.ts:126

___

### isRepeat

• `Optional` **isRepeat**: `boolean`

是否重复闪烁，默认为true;该属性在isFlash属性为true时生效

#### Defined in

interface/default.ts:138

___

### label

• `Optional` **label**: [`ILabel`](ILabel.md)

标签样式

#### Defined in

interface/default.ts:150

___

### size

• `Optional` **size**: `number`

点大小

#### Defined in

interface/default.ts:122

___

### stroke

• `Optional` **stroke**: [`IStroke`](IStroke.md)

边框样式

#### Defined in

interface/default.ts:142
