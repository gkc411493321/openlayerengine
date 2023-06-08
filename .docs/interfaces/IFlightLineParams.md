[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / IFlightLineParams

# Interface: IFlightLineParams

## Hierarchy

- **`IFlightLineParams`**

  ↳ [`IPolylineFlyParam`](IPolylineFlyParam.md)

## Table of contents

### Properties

- [controlRatio](IFlightLineParams.md#controlratio)
- [oneFrameLimitTime](IFlightLineParams.md#oneframelimittime)
- [splitLength](IFlightLineParams.md#splitlength)

## Properties

### controlRatio

• `Optional` **controlRatio**: `number`

线段弯曲程度，默认为1。值越大，则弯曲程度越高

#### Defined in

interface/default.ts:483

___

### oneFrameLimitTime

• `Optional` **oneFrameLimitTime**: `number`

每帧耗时多少秒，默认为0。值越大则播放速度越慢。

#### Defined in

interface/default.ts:479

___

### splitLength

• `Optional` **splitLength**: `number`

分割线长度，默认180。该值越高则曲线越平滑

#### Defined in

interface/default.ts:475
