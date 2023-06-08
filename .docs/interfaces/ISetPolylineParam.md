[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / ISetPolylineParam

# Interface: ISetPolylineParam

## Table of contents

### Properties

- [arrowIsRepeat](ISetPolylineParam.md#arrowisrepeat)
- [dottedLineColor](ISetPolylineParam.md#dottedlinecolor)
- [fill](ISetPolylineParam.md#fill)
- [fullLineColor](ISetPolylineParam.md#fulllinecolor)
- [id](ISetPolylineParam.md#id)
- [isArrow](ISetPolylineParam.md#isarrow)
- [isFlowingDash](ISetPolylineParam.md#isflowingdash)
- [label](ISetPolylineParam.md#label)
- [positions](ISetPolylineParam.md#positions)
- [stroke](ISetPolylineParam.md#stroke)
- [width](ISetPolylineParam.md#width)

## Properties

### arrowIsRepeat

• `Optional` **arrowIsRepeat**: `boolean`

箭头是否重复,isArrow为true生效

#### Defined in

interface/default.ts:419

___

### dottedLineColor

• `Optional` **dottedLineColor**: `string`

流水线虚线填充色 isFlowingDash为true生效

#### Defined in

interface/default.ts:431

___

### fill

• `Optional` **fill**: [`IFill`](IFill.md)

填充样式

#### Defined in

interface/default.ts:407

___

### fullLineColor

• `Optional` **fullLineColor**: `string`

流水线实线填充色 isFlowingDash为true生效

#### Defined in

interface/default.ts:427

___

### id

• **id**: `string`

id

#### Defined in

interface/default.ts:391

___

### isArrow

• `Optional` **isArrow**: `boolean`

箭头线

#### Defined in

interface/default.ts:415

___

### isFlowingDash

• `Optional` **isFlowingDash**: `boolean`

流水线

#### Defined in

interface/default.ts:423

___

### label

• `Optional` **label**: [`ILabel`](ILabel.md)

标签样式

#### Defined in

interface/default.ts:411

___

### positions

• `Optional` **positions**: `number`[][]

点集合

#### Defined in

interface/default.ts:395

___

### stroke

• `Optional` **stroke**: [`IStroke`](IStroke.md)

边框样式

#### Defined in

interface/default.ts:403

___

### width

• `Optional` **width**: `number`

线宽，默认为2

#### Defined in

interface/default.ts:399
