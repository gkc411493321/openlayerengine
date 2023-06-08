[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / ILabel

# Interface: ILabel

## Table of contents

### Properties

- [backgroundFill](ILabel.md#backgroundfill)
- [backgroundStroke](ILabel.md#backgroundstroke)
- [fill](ILabel.md#fill)
- [font](ILabel.md#font)
- [offsetX](ILabel.md#offsetx)
- [offsetY](ILabel.md#offsety)
- [padding](ILabel.md#padding)
- [rotation](ILabel.md#rotation)
- [scale](ILabel.md#scale)
- [stroke](ILabel.md#stroke)
- [text](ILabel.md#text)
- [textAlign](ILabel.md#textalign)
- [textBaseline](ILabel.md#textbaseline)

## Properties

### backgroundFill

• `Optional` **backgroundFill**: [`IFill`](IFill.md)

文本背景颜色

#### Defined in

interface/default.ts:567

___

### backgroundStroke

• `Optional` **backgroundStroke**: [`IStroke`](IStroke.md)

文本背景边框颜色

#### Defined in

interface/default.ts:571

___

### fill

• `Optional` **fill**: [`IFill`](IFill.md)

文本颜色

#### Defined in

interface/default.ts:559

___

### font

• `Optional` **font**: `string`

字体及字体大小。注意！！！必须遵循css字体样式，如：'10px sans-serif' | 'bold 10px sans-serif'

#### Defined in

interface/default.ts:535

___

### offsetX

• `Optional` **offsetX**: `number`

水平偏移，单位是像素

#### Defined in

interface/default.ts:539

___

### offsetY

• `Optional` **offsetY**: `number`

垂直偏移，单位是像素

#### Defined in

interface/default.ts:543

___

### padding

• `Optional` **padding**: `number`[]

文本padding

#### Defined in

interface/default.ts:575

___

### rotation

• `Optional` **rotation**: `number`

顺时针旋转，默认为0

#### Defined in

interface/default.ts:579

___

### scale

• `Optional` **scale**: `number`

缩放

#### Defined in

interface/default.ts:547

___

### stroke

• `Optional` **stroke**: [`IStroke`](IStroke.md)

文本边框颜色

#### Defined in

interface/default.ts:563

___

### text

• **text**: `string`

文本

#### Defined in

interface/default.ts:531

___

### textAlign

• `Optional` **textAlign**: `CanvasTextAlign`

文本对齐方式，'left' | 'right' | 'center' | 'end'

#### Defined in

interface/default.ts:551

___

### textBaseline

• `Optional` **textBaseline**: `CanvasTextBaseline`

文本基线， 'bottom' | 'top' | 'middle' | 'alphabetic' | 'hanging' | 'ideographic'

#### Defined in

interface/default.ts:555
