[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / ContextMenu

# Class: ContextMenu

菜单类

## Table of contents

### Constructors

- [constructor](ContextMenu.md#constructor)

### Properties

- [earth](ContextMenu.md#earth)
- [menus](ContextMenu.md#menus)
- [option](ContextMenu.md#option)

### Methods

- [addDefaultMenu](ContextMenu.md#adddefaultmenu)
- [addModuleMenu](ContextMenu.md#addmodulemenu)
- [destory](ContextMenu.md#destory)
- [remove](ContextMenu.md#remove)
- [watchContextMenu](ContextMenu.md#watchcontextmenu)

## Constructors

### constructor

• **new ContextMenu**(`earth`, `option`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `earth` | [`Earth`](Earth.md) |
| `option` | `IContextMenuOption` |

#### Defined in

commponents/ContextMenu.ts:14

## Properties

### earth

• `Private` **earth**: [`Earth`](Earth.md)

#### Defined in

commponents/ContextMenu.ts:11

___

### menus

• `Private` **menus**: `Map`<`string`, {}\>

#### Defined in

commponents/ContextMenu.ts:13

___

### option

• `Private` **option**: `IContextMenuOption`

#### Defined in

commponents/ContextMenu.ts:12

## Methods

### addDefaultMenu

▸ **addDefaultMenu**(): `void`

设置默认点击事件

#### Returns

`void`

#### Defined in

commponents/ContextMenu.ts:41

___

### addModuleMenu

▸ **addModuleMenu**(): `void`

按模块添加点击事件

#### Returns

`void`

#### Defined in

commponents/ContextMenu.ts:35

___

### destory

▸ **destory**(): `void`

销毁菜单

#### Returns

`void`

#### Defined in

commponents/ContextMenu.ts:53

___

### remove

▸ **remove**(): `void`

按模块销毁菜单

#### Returns

`void`

#### Defined in

commponents/ContextMenu.ts:47

___

### watchContextMenu

▸ `Private` **watchContextMenu**(): `void`

启用上下文事件监听

#### Returns

`void`

#### Defined in

commponents/ContextMenu.ts:22
