[@vrsim/earth-engine-ol](../README.md) / [Exports](../modules.md) / GlobalEvent

# Class: GlobalEvent

地图事件类：分为`全局事件`和`模块事件`

`全局事件`：返回当前鼠标坐标、像素信息，详见[GlobalEventCallback](../modules.md#globaleventcallback)。可配合[Earth](Earth.md)类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素，获取元素信息

`模块事件`：返回当前鼠标坐标、元素、元素图层、元素Id信息，详见[ModuleEventCallback](../modules.md#moduleeventcallback)

**`Example`**

```
// 全局事件：全局事件如何获取当前位置元素信息，下面以全局鼠标双击事件为例
// 启用全局下鼠标双击事件
useEarth().useGlobalEvent().enableGlobalMouseDblClickEvent();
// 添加全局下鼠标双击事件。全局下同类事件监听只可添加一个
useEarth().useGlobalEvent().addMouseDblClickEventByGlobal((param) => {
 // 触发事件回调函数
 // 调用`getFeatureAtPixel`方法查询该像素位置是否存在feature元素
 const data = useEarth().getFeatureAtPixel(param.pixel);
})
// 关闭全局下鼠标双击事件
useEarth().useGlobalEvent().disableGlobalMouseDblClickEvent();
// 模块事件：必须传入`module`参数
// 启用模块下鼠标双击事件
useEarth().useGlobalEvent().enableModuleMouseDblClickEvent();
// 添加模块下鼠标双击事件。模块下同类事件监听可添加多个，但module不能相同
useEarth().useGlobalEvent().addMouseDblClickEventByModule("module1", (param) => {
 // 触发模块module1回调函数
})
useEarth().useGlobalEvent().addMouseDblClickEventByModule("module2", (param) => {
 // 触发模块module2回调函数
})
// 关闭模块下鼠标双击事件
useEarth().useGlobalEvent().disableModuleMouseDblClickEvent();
```

## Table of contents

### Constructors

- [constructor](GlobalEvent.md#constructor)

### Properties

- [currentEntity](GlobalEvent.md#currententity)
- [eventKey](GlobalEvent.md#eventkey)
- [globalMouseClickEvent](GlobalEvent.md#globalmouseclickevent)
- [globalMouseDblClickEvent](GlobalEvent.md#globalmousedblclickevent)
- [globalMouseLeftDownEvent](GlobalEvent.md#globalmouseleftdownevent)
- [globalMouseLeftUpEvent](GlobalEvent.md#globalmouseleftupevent)
- [globalMouseMoveEvent](GlobalEvent.md#globalmousemoveevent)
- [globalMouseRightClickEvent](GlobalEvent.md#globalmouserightclickevent)
- [map](GlobalEvent.md#map)
- [moduleMouseClickEvent](GlobalEvent.md#modulemouseclickevent)
- [moduleMouseDblClickEvent](GlobalEvent.md#modulemousedblclickevent)
- [moduleMouseLeftDownEvent](GlobalEvent.md#modulemouseleftdownevent)
- [moduleMouseLeftUpEvent](GlobalEvent.md#modulemouseleftupevent)
- [moduleMouseMoveEvent](GlobalEvent.md#modulemousemoveevent)
- [moduleMouseRightClickEvent](GlobalEvent.md#modulemouserightclickevent)

### Methods

- [addMouseClickEventByGlobal](GlobalEvent.md#addmouseclickeventbyglobal)
- [addMouseClickEventByModule](GlobalEvent.md#addmouseclickeventbymodule)
- [addMouseDblClickEventByGlobal](GlobalEvent.md#addmousedblclickeventbyglobal)
- [addMouseDblClickEventByModule](GlobalEvent.md#addmousedblclickeventbymodule)
- [addMouseLeftDownEventByGlobal](GlobalEvent.md#addmouseleftdowneventbyglobal)
- [addMouseLeftDownEventByModule](GlobalEvent.md#addmouseleftdowneventbymodule)
- [addMouseLeftUpEventByGlobal](GlobalEvent.md#addmouseleftupeventbyglobal)
- [addMouseLeftUpEventByModule](GlobalEvent.md#addmouseleftupeventbymodule)
- [addMouseMoveEventByGlobal](GlobalEvent.md#addmousemoveeventbyglobal)
- [addMouseMoveEventByModule](GlobalEvent.md#addmousemoveeventbymodule)
- [addMouseOnceClickEventByGlobal](GlobalEvent.md#addmouseonceclickeventbyglobal)
- [addMouseOnceRightClickEventByGlobal](GlobalEvent.md#addmouseoncerightclickeventbyglobal)
- [addMouseRightClickEventByGlobal](GlobalEvent.md#addmouserightclickeventbyglobal)
- [addMouseRightClickEventByModule](GlobalEvent.md#addmouserightclickeventbymodule)
- [disableGlobalMouseClickEvent](GlobalEvent.md#disableglobalmouseclickevent)
- [disableGlobalMouseDblClickEvent](GlobalEvent.md#disableglobalmousedblclickevent)
- [disableGlobalMouseLeftDownEvent](GlobalEvent.md#disableglobalmouseleftdownevent)
- [disableGlobalMouseLeftUpEvent](GlobalEvent.md#disableglobalmouseleftupevent)
- [disableGlobalMouseMoveEvent](GlobalEvent.md#disableglobalmousemoveevent)
- [disableGlobalMouseRightClickEvent](GlobalEvent.md#disableglobalmouserightclickevent)
- [disableModuleMouseClickEvent](GlobalEvent.md#disablemodulemouseclickevent)
- [disableModuleMouseDblClickEvent](GlobalEvent.md#disablemodulemousedblclickevent)
- [disableModuleMouseLeftDownEvent](GlobalEvent.md#disablemodulemouseleftdownevent)
- [disableModuleMouseLeftUpEvent](GlobalEvent.md#disablemodulemouseleftupevent)
- [disableModuleMouseMoveEvent](GlobalEvent.md#disablemodulemousemoveevent)
- [disableModuleMouseRightClickEvent](GlobalEvent.md#disablemodulemouserightclickevent)
- [enableGlobalMouseClickEvent](GlobalEvent.md#enableglobalmouseclickevent)
- [enableGlobalMouseDblClickEvent](GlobalEvent.md#enableglobalmousedblclickevent)
- [enableGlobalMouseLeftDownEvent](GlobalEvent.md#enableglobalmouseleftdownevent)
- [enableGlobalMouseLeftUpEvent](GlobalEvent.md#enableglobalmouseleftupevent)
- [enableGlobalMouseMoveEvent](GlobalEvent.md#enableglobalmousemoveevent)
- [enableGlobalMouseRightClickEvent](GlobalEvent.md#enableglobalmouserightclickevent)
- [enableModuleMouseClickEvent](GlobalEvent.md#enablemodulemouseclickevent)
- [enableModuleMouseDblClickEvent](GlobalEvent.md#enablemodulemousedblclickevent)
- [enableModuleMouseLeftDownEvent](GlobalEvent.md#enablemodulemouseleftdownevent)
- [enableModuleMouseLeftUpEvent](GlobalEvent.md#enablemodulemouseleftupevent)
- [enableModuleMouseMoveEvent](GlobalEvent.md#enablemodulemousemoveevent)
- [enableModuleMouseRightClickEvent](GlobalEvent.md#enablemodulemouserightclickevent)
- [globalMouseLeftDown](GlobalEvent.md#globalmouseleftdown)
- [globalMouseLeftUp](GlobalEvent.md#globalmouseleftup)
- [globalMouseRightClick](GlobalEvent.md#globalmouserightclick)
- [hasGlobalMouseClickEvent](GlobalEvent.md#hasglobalmouseclickevent)
- [hasGlobalMouseDblClickEvent](GlobalEvent.md#hasglobalmousedblclickevent)
- [hasGlobalMouseLeftDownEvent](GlobalEvent.md#hasglobalmouseleftdownevent)
- [hasGlobalMouseLeftUpEvent](GlobalEvent.md#hasglobalmouseleftupevent)
- [hasGlobalMouseMoveEvent](GlobalEvent.md#hasglobalmousemoveevent)
- [hasGlobalMouseRightClickEvent](GlobalEvent.md#hasglobalmouserightclickevent)
- [hasModuleMouseClickEvent](GlobalEvent.md#hasmodulemouseclickevent)
- [hasModuleMouseDblClickEvent](GlobalEvent.md#hasmodulemousedblclickevent)
- [hasModuleMouseLeftDownEvent](GlobalEvent.md#hasmodulemouseleftdownevent)
- [hasModuleMouseLeftUpEvent](GlobalEvent.md#hasmodulemouseleftupevent)
- [hasModuleMouseMoveEvent](GlobalEvent.md#hasmodulemousemoveevent)
- [hasModuleMouseRightClickEvent](GlobalEvent.md#hasmodulemouserightclickevent)
- [moduleMouseLeftDown](GlobalEvent.md#modulemouseleftdown)
- [moduleMouseLeftUp](GlobalEvent.md#modulemouseleftup)
- [moduleMouseRightClick](GlobalEvent.md#modulemouserightclick)

## Constructors

### constructor

• **new GlobalEvent**(`earth`)

构造器

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `earth` | [`Earth`](Earth.md) | 地图实例 |

#### Defined in

commponents/GlobalEvent.ts:226

## Properties

### currentEntity

• `Private` `Optional` **currentEntity**: `IEntity`

鼠标指向的当前实体

#### Defined in

commponents/GlobalEvent.ts:62

___

### eventKey

• `Private` `Optional` **eventKey**: `Map`<`string`, `any`\>

#### Defined in

commponents/GlobalEvent.ts:63

___

### globalMouseClickEvent

• `Private` `Optional` **globalMouseClickEvent**: `Object`

全局的鼠标点击事件

#### Type declaration

| Name | Type |
| :------ | :------ |
| `callback` | [`GlobalEventCallback`](../modules.md#globaleventcallback) |

#### Defined in

commponents/GlobalEvent.ts:95

___

### globalMouseDblClickEvent

• `Private` `Optional` **globalMouseDblClickEvent**: `Object`

全局的鼠标双击事件

#### Type declaration

| Name | Type |
| :------ | :------ |
| `callback` | [`GlobalEventCallback`](../modules.md#globaleventcallback) |

#### Defined in

commponents/GlobalEvent.ts:107

___

### globalMouseLeftDownEvent

• `Private` `Optional` **globalMouseLeftDownEvent**: `Object`

全局的鼠标左键按下事件

#### Type declaration

| Name | Type |
| :------ | :------ |
| `callback` | [`GlobalEventCallback`](../modules.md#globaleventcallback) |

#### Defined in

commponents/GlobalEvent.ts:99

___

### globalMouseLeftUpEvent

• `Private` `Optional` **globalMouseLeftUpEvent**: `Object`

全局的鼠标左键抬起事件

#### Type declaration

| Name | Type |
| :------ | :------ |
| `callback` | [`GlobalEventCallback`](../modules.md#globaleventcallback) |

#### Defined in

commponents/GlobalEvent.ts:103

___

### globalMouseMoveEvent

• `Private` `Optional` **globalMouseMoveEvent**: `Object`

全局的鼠标移动事件

#### Type declaration

| Name | Type |
| :------ | :------ |
| `callback` | [`GlobalEventCallback`](../modules.md#globaleventcallback) |

#### Defined in

commponents/GlobalEvent.ts:91

___

### globalMouseRightClickEvent

• `Private` `Optional` **globalMouseRightClickEvent**: `Object`

全局的鼠标右键单击事件

#### Type declaration

| Name | Type |
| :------ | :------ |
| `callback` | [`GlobalEventCallback`](../modules.md#globaleventcallback) |

#### Defined in

commponents/GlobalEvent.ts:111

___

### map

• `Private` **map**: `Map`

map实例

#### Defined in

commponents/GlobalEvent.ts:58

___

### moduleMouseClickEvent

• `Private` **moduleMouseClickEvent**: `Map`<`string`, { `callback`: [`ModuleEventCallback`](../modules.md#moduleeventcallback)  }\>

模块的鼠标点击事件

#### Defined in

commponents/GlobalEvent.ts:71

___

### moduleMouseDblClickEvent

• `Private` **moduleMouseDblClickEvent**: `Map`<`string`, { `callback`: [`ModuleEventCallback`](../modules.md#moduleeventcallback)  }\>

模块的鼠标双击事件

#### Defined in

commponents/GlobalEvent.ts:83

___

### moduleMouseLeftDownEvent

• `Private` **moduleMouseLeftDownEvent**: `Map`<`string`, { `callback`: [`ModuleEventCallback`](../modules.md#moduleeventcallback)  }\>

模块的鼠标左键按下事件

#### Defined in

commponents/GlobalEvent.ts:75

___

### moduleMouseLeftUpEvent

• `Private` **moduleMouseLeftUpEvent**: `Map`<`string`, { `callback`: [`ModuleEventCallback`](../modules.md#moduleeventcallback)  }\>

模块的鼠标左键抬起事件

#### Defined in

commponents/GlobalEvent.ts:79

___

### moduleMouseMoveEvent

• `Private` **moduleMouseMoveEvent**: `Map`<`string`, { `callback`: [`ModuleEventCallback`](../modules.md#moduleeventcallback)  }\>

模块的鼠标移动事件

#### Defined in

commponents/GlobalEvent.ts:67

___

### moduleMouseRightClickEvent

• `Private` **moduleMouseRightClickEvent**: `Map`<`string`, { `callback`: [`ModuleEventCallback`](../modules.md#moduleeventcallback)  }\>

模块的鼠标右击事件

#### Defined in

commponents/GlobalEvent.ts:87

## Methods

### addMouseClickEventByGlobal

▸ **addMouseClickEventByGlobal**(`callback`): `void`

按全局添加鼠标点击事件

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | [`GlobalEventCallback`](../modules.md#globaleventcallback) | 回调函数，详见[GlobalEventCallback](../modules.md#globaleventcallback)。可配合[Earth](Earth.md)类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素 |

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:711

___

### addMouseClickEventByModule

▸ **addMouseClickEventByModule**(`module`, `callback`): `void`

按模块添加鼠标点击事件

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `module` | `string` | 模块名称 |
| `callback` | [`ModuleEventCallback`](../modules.md#moduleeventcallback) | 回调函数，详见[ModuleEventCallback](../modules.md#moduleeventcallback) |

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:625

___

### addMouseDblClickEventByGlobal

▸ **addMouseDblClickEventByGlobal**(`callback`): `void`

按全局添加鼠标双击事件

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | [`GlobalEventCallback`](../modules.md#globaleventcallback) | 回调函数，详见[GlobalEventCallback](../modules.md#globaleventcallback)。可配合[Earth](Earth.md)类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素 |

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:732

___

### addMouseDblClickEventByModule

▸ **addMouseDblClickEventByModule**(`module`, `callback`): `void`

按模块添加鼠标双击事件

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `module` | `string` | 模块名称 |
| `callback` | [`ModuleEventCallback`](../modules.md#moduleeventcallback) | 回调函数，详见[ModuleEventCallback](../modules.md#moduleeventcallback) |

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:673

___

### addMouseLeftDownEventByGlobal

▸ **addMouseLeftDownEventByGlobal**(`callback`): `void`

按全局添加鼠标左键按下事件

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | [`GlobalEventCallback`](../modules.md#globaleventcallback) | 回调函数，详见[GlobalEventCallback](../modules.md#globaleventcallback)。可配合[Earth](Earth.md)类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素 |

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:718

___

### addMouseLeftDownEventByModule

▸ **addMouseLeftDownEventByModule**(`module`, `callback`): `void`

按模块添加鼠标左键按下事件

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `module` | `string` | 模块名称 |
| `callback` | [`ModuleEventCallback`](../modules.md#moduleeventcallback) | 回调函数，详见[ModuleEventCallback](../modules.md#moduleeventcallback) |

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:641

___

### addMouseLeftUpEventByGlobal

▸ **addMouseLeftUpEventByGlobal**(`callback`): `void`

按全局添加鼠标左键抬起事件

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | [`GlobalEventCallback`](../modules.md#globaleventcallback) | 回调函数，详见[GlobalEventCallback](../modules.md#globaleventcallback)。可配合[Earth](Earth.md)类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素 |

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:725

___

### addMouseLeftUpEventByModule

▸ **addMouseLeftUpEventByModule**(`module`, `callback`): `void`

按模块添加鼠标左键抬起事件

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `module` | `string` | 模块名称 |
| `callback` | [`ModuleEventCallback`](../modules.md#moduleeventcallback) | 回调函数，详见[ModuleEventCallback](../modules.md#moduleeventcallback) |

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:657

___

### addMouseMoveEventByGlobal

▸ **addMouseMoveEventByGlobal**(`callback`): `void`

按全局添加鼠标移动事件

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | [`GlobalEventCallback`](../modules.md#globaleventcallback) | 回调函数，详见[GlobalEventCallback](../modules.md#globaleventcallback)。可配合[Earth](Earth.md)类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素 |

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:704

___

### addMouseMoveEventByModule

▸ **addMouseMoveEventByModule**(`module`, `callback`): `void`

按模块添加鼠标移动事件

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `module` | `string` | 模块名称 |
| `callback` | [`ModuleEventCallback`](../modules.md#moduleeventcallback) | 回调函数，详见[ModuleEventCallback](../modules.md#moduleeventcallback) |

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:609

___

### addMouseOnceClickEventByGlobal

▸ **addMouseOnceClickEventByGlobal**(`callback`): `void`

按全局添加鼠标点击事件,只执行一次。该方法无需启用事件和删除事件，直接调用即可

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | [`GlobalEventCallback`](../modules.md#globaleventcallback) | 回调函数，详见[GlobalEventCallback](../modules.md#globaleventcallback)。可配合[Earth](Earth.md)类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素 |

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:746

___

### addMouseOnceRightClickEventByGlobal

▸ **addMouseOnceRightClickEventByGlobal**(`callback`): `void`

按全局添加鼠标右击事件,只执行一次。该方法无需启用事件和删除事件，直接调用即可

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | [`GlobalEventCallback`](../modules.md#globaleventcallback) | 回调函数，详见[GlobalEventCallback](../modules.md#globaleventcallback)。可配合[Earth](Earth.md)类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素 |

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:758

___

### addMouseRightClickEventByGlobal

▸ **addMouseRightClickEventByGlobal**(`callback`): `void`

按全局添加鼠标右键单击事件

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | [`GlobalEventCallback`](../modules.md#globaleventcallback) | 回调函数，详见[GlobalEventCallback](../modules.md#globaleventcallback)。可配合[Earth](Earth.md)类`getFeatureAtPixel`方法查询该像素位置是否存在feature元素 |

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:739

___

### addMouseRightClickEventByModule

▸ **addMouseRightClickEventByModule**(`module`, `callback`): `void`

按模块添加鼠标右键单击事件

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `module` | `string` | 模块名称 |
| `callback` | [`ModuleEventCallback`](../modules.md#moduleeventcallback) | 回调函数，详见[ModuleEventCallback](../modules.md#moduleeventcallback) |

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:689

___

### disableGlobalMouseClickEvent

▸ **disableGlobalMouseClickEvent**(): `void`

停用全局下鼠标点击事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:542

___

### disableGlobalMouseDblClickEvent

▸ **disableGlobalMouseDblClickEvent**(): `void`

停用全局下鼠标双击事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:581

___

### disableGlobalMouseLeftDownEvent

▸ **disableGlobalMouseLeftDownEvent**(): `void`

停用全局下鼠标左键按下事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:555

___

### disableGlobalMouseLeftUpEvent

▸ **disableGlobalMouseLeftUpEvent**(): `void`

停用全局下鼠标左键抬起事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:568

___

### disableGlobalMouseMoveEvent

▸ **disableGlobalMouseMoveEvent**(): `void`

停用全局下鼠标移动事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:529

___

### disableGlobalMouseRightClickEvent

▸ **disableGlobalMouseRightClickEvent**(): `void`

停用全局下鼠标右键单击事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:594

___

### disableModuleMouseClickEvent

▸ **disableModuleMouseClickEvent**(): `void`

停用模块下鼠标点击事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:464

___

### disableModuleMouseDblClickEvent

▸ **disableModuleMouseDblClickEvent**(): `void`

停用模块下鼠标双击事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:503

___

### disableModuleMouseLeftDownEvent

▸ **disableModuleMouseLeftDownEvent**(): `void`

停用模块下鼠标左键按下事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:477

___

### disableModuleMouseLeftUpEvent

▸ **disableModuleMouseLeftUpEvent**(): `void`

停用模块下鼠标左键抬起事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:490

___

### disableModuleMouseMoveEvent

▸ **disableModuleMouseMoveEvent**(): `void`

停用模块下鼠标移动事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:451

___

### disableModuleMouseRightClickEvent

▸ **disableModuleMouseRightClickEvent**(): `void`

停用模块下鼠标右键单击事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:516

___

### enableGlobalMouseClickEvent

▸ **enableGlobalMouseClickEvent**(): `void`

启用全局下鼠标点击事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:385

___

### enableGlobalMouseDblClickEvent

▸ **enableGlobalMouseDblClickEvent**(): `void`

启用全局下鼠标双击事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:424

___

### enableGlobalMouseLeftDownEvent

▸ **enableGlobalMouseLeftDownEvent**(): `void`

启用全局下鼠标左键按下事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:402

___

### enableGlobalMouseLeftUpEvent

▸ **enableGlobalMouseLeftUpEvent**(): `void`

启用全局下鼠标左键抬起事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:413

___

### enableGlobalMouseMoveEvent

▸ **enableGlobalMouseMoveEvent**(): `void`

启用全局下鼠标移动事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:369

___

### enableGlobalMouseRightClickEvent

▸ **enableGlobalMouseRightClickEvent**(): `void`

启用全局下鼠标右键单击事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:440

___

### enableModuleMouseClickEvent

▸ **enableModuleMouseClickEvent**(): `void`

启用模块下鼠标点击事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:274

___

### enableModuleMouseDblClickEvent

▸ **enableModuleMouseDblClickEvent**(): `void`

启用模块下鼠标双击事件

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:327

___

### enableModuleMouseLeftDownEvent

▸ **enableModuleMouseLeftDownEvent**(): `void`

启用模块下鼠标左键按下事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:305

___

### enableModuleMouseLeftUpEvent

▸ **enableModuleMouseLeftUpEvent**(): `void`

启用模块下鼠标左键抬起事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:316

___

### enableModuleMouseMoveEvent

▸ **enableModuleMouseMoveEvent**(): `void`

启用模块下鼠标移动事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:232

___

### enableModuleMouseRightClickEvent

▸ **enableModuleMouseRightClickEvent**(): `void`

启用模块下鼠标右键单击事件监听

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:358

___

### globalMouseLeftDown

▸ `Private` **globalMouseLeftDown**(`event`): `void`

全局下鼠标左键按下监听器处理方法

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `MouseEvent` | 鼠标事件 |

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:199

___

### globalMouseLeftUp

▸ `Private` **globalMouseLeftUp**(`event`): `void`

全局下鼠标左键抬起监听器处理方法

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `MouseEvent` | 鼠标事件 |

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:208

___

### globalMouseRightClick

▸ `Private` **globalMouseRightClick**(`event`): `void`

全局下鼠标右键单击监听器处理方法

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `MouseEvent` | 鼠标事件 |

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:217

___

### hasGlobalMouseClickEvent

▸ **hasGlobalMouseClickEvent**(): `boolean`

校验全局是否注册鼠标点击事件

#### Returns

`boolean`

#### Defined in

commponents/GlobalEvent.ts:818

___

### hasGlobalMouseDblClickEvent

▸ **hasGlobalMouseDblClickEvent**(): `boolean`

校验全局是否注册鼠标双击事件

#### Returns

`boolean`

#### Defined in

commponents/GlobalEvent.ts:836

___

### hasGlobalMouseLeftDownEvent

▸ **hasGlobalMouseLeftDownEvent**(): `boolean`

校验全局是否注册鼠标左键按下事件

#### Returns

`boolean`

#### Defined in

commponents/GlobalEvent.ts:824

___

### hasGlobalMouseLeftUpEvent

▸ **hasGlobalMouseLeftUpEvent**(): `boolean`

校验全局是否注册鼠标左键抬起事件

#### Returns

`boolean`

#### Defined in

commponents/GlobalEvent.ts:830

___

### hasGlobalMouseMoveEvent

▸ **hasGlobalMouseMoveEvent**(): `boolean`

校验全局是否注册鼠标移动事件

#### Returns

`boolean`

#### Defined in

commponents/GlobalEvent.ts:812

___

### hasGlobalMouseRightClickEvent

▸ **hasGlobalMouseRightClickEvent**(): `boolean`

校验全局是否注册鼠标右键事件

#### Returns

`boolean`

#### Defined in

commponents/GlobalEvent.ts:842

___

### hasModuleMouseClickEvent

▸ **hasModuleMouseClickEvent**(`module`): `boolean`

校验模块是否注册鼠标单击事件

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `module` | `string` | 模块名称 |

#### Returns

`boolean`

#### Defined in

commponents/GlobalEvent.ts:778

___

### hasModuleMouseDblClickEvent

▸ **hasModuleMouseDblClickEvent**(`module`): `boolean`

校验模块是否注册鼠标双击事件

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `module` | `string` | 模块名称 |

#### Returns

`boolean`

#### Defined in

commponents/GlobalEvent.ts:799

___

### hasModuleMouseLeftDownEvent

▸ **hasModuleMouseLeftDownEvent**(`module`): `boolean`

校验模块是否注册鼠标左键按下事件

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `module` | `string` | 模块名称 |

#### Returns

`boolean`

#### Defined in

commponents/GlobalEvent.ts:785

___

### hasModuleMouseLeftUpEvent

▸ **hasModuleMouseLeftUpEvent**(`module`): `boolean`

校验模块是否注册鼠标左键抬起事件

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `module` | `string` | 模块名称 |

#### Returns

`boolean`

#### Defined in

commponents/GlobalEvent.ts:792

___

### hasModuleMouseMoveEvent

▸ **hasModuleMouseMoveEvent**(`module`): `boolean`

校验模块是否注册鼠标移动事件

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `module` | `string` | 模块名称 |

#### Returns

`boolean`

#### Defined in

commponents/GlobalEvent.ts:771

___

### hasModuleMouseRightClickEvent

▸ **hasModuleMouseRightClickEvent**(`module`): `boolean`

校验模块是否注册鼠标右键单击事件

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `module` | `string` | 模块名称 |

#### Returns

`boolean`

#### Defined in

commponents/GlobalEvent.ts:806

___

### moduleMouseLeftDown

▸ `Private` **moduleMouseLeftDown**(`event`): `void`

模块下鼠标左键按下监听器处理方法

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `MouseEvent` | 鼠标事件 |

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:116

___

### moduleMouseLeftUp

▸ `Private` **moduleMouseLeftUp**(`event`): `void`

模块下鼠标左键抬起监听器处理方法

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `MouseEvent` | 鼠标事件 |

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:144

___

### moduleMouseRightClick

▸ `Private` **moduleMouseRightClick**(`event`): `void`

模块下鼠标右键单击监听器处理方法

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `MouseEvent` | 鼠标事件 |

#### Returns

`void`

#### Defined in

commponents/GlobalEvent.ts:172
