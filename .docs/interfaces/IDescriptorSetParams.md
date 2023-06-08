[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / IDescriptorSetParams

# Interface: IDescriptorSetParams<T\>

## Type parameters

| Name |
| :------ |
| `T` |

## Table of contents

### Properties

- [data](IDescriptorSetParams.md#data)
- [element](IDescriptorSetParams.md#element)
- [offset](IDescriptorSetParams.md#offset)
- [position](IDescriptorSetParams.md#position)

## Properties

### data

• `Optional` **data**: `T`

自定义数据

#### Defined in

interface/descriptor.ts:19

___

### element

• `Optional` **element**: `string` \| [`IProperties`](IProperties.md)<`string` \| `number`\>[]

容器内容

#### Defined in

interface/descriptor.ts:11

___

### offset

• `Optional` **offset**: `number`[]

偏移量,默认[0,0]

#### Defined in

interface/descriptor.ts:15

___

### position

• **position**: `Coordinate`

位置

#### Defined in

interface/descriptor.ts:7
