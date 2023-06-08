module.exports = {
  title: 'OpenLayersEngine手册',
  description: 'ol-engine',
  base: '/OL/',
  theme: 'reco',
  themeConfig: {
    logo: './image/earth.png',
    nav: [
      { text: '首页', link: '/' },
      { text: '示例', link: '/view/example/example' },
      { text: '文档', link: '/view/docs' },
      { text: 'API', link: '/view/api/api' },
      {
        text: '相关链接',
        items: [
          { text: 'Openlayers文档', link: 'https://openlayers.org/en/latest/apidoc/', target: '_target' },
          { text: 'EarthEngine手册', link: 'http://192.168.50.200:8866/cesium/', target: '_target' },
        ]
      }
    ],
    sidebar: {
      '/view/api/': [
        {
          title: '地图实例',
          collapsable: false,
          children: [
            { title: "实例", path: '/classes/Earth.md' },
          ]
        },
        {
          title: '图层类',
          collapsable: false,
          children: [
            { title: "基类", path: '/classes/Base' },
            { title: "广告牌", path: '/classes/BillboardLayer' },
            { title: "点", path: '/classes/PointLayer' },
            { title: "线", path: '/classes/PolylineLayer' },
            { title: "圆", path: '/classes/CircleLayer' },
            { title: "多边形", path: '/classes/PolygonLayer' },
            { title: "覆盖物", path: '/classes/OverlayLayer' },
          ]
        },
        {
          title: '工具类',
          collapsable: false,
          children: [
            { title: "工具", path: '/classes/Utils' },
          ]
        },
        {
          title: '组件类',
          collapsable: false,
          children: [
            { title: "右键菜单", path: '/classes/ContextMenu' },
            { title: "标牌", path: '/classes/Descriptor' },
            { title: "地图事件", path: '/classes/GlobalEvent' },
            { title: "动态绘制", path: '/classes/DynamicDraw' },
            { title: "动态测量", path: '/classes/Measure' },
          ]
        },
        {
          title: '气象类',
          collapsable: false,
          children: [
            { title: "风场", path: '/classes/WindLayer' },
          ]
        }
      ],
      '/classes/': [
        {
          title: '地图实例',
          collapsable: false,
          children: [
            { title: "实例", path: '/classes/Earth.md' },
          ]
        },
        {
          title: '图层类',
          collapsable: false,
          children: [
            { title: "基类", path: '/classes/Base' },
            { title: "广告牌", path: '/classes/BillboardLayer' },
            { title: "点", path: '/classes/PointLayer' },
            { title: "线", path: '/classes/PolylineLayer' },
            { title: "圆", path: '/classes/CircleLayer' },
            { title: "多边形", path: '/classes/PolygonLayer' },
            { title: "覆盖物", path: '/classes/OverlayLayer' },
          ]
        },
        {
          title: '工具类',
          collapsable: false,
          children: [
            { title: "工具", path: '/classes/Utils' },
          ]
        },
        {
          title: '组件类',
          collapsable: false,
          children: [
            { title: "右键菜单", path: '/classes/ContextMenu' },
            { title: "标牌", path: '/classes/Descriptor' },
            { title: "地图事件", path: '/classes/GlobalEvent' },
            { title: "动态绘制", path: '/classes/DynamicDraw' },
            { title: "动态测量", path: '/classes/Measure' },
          ]
        },
        {
          title: '气象类',
          collapsable: false,
          children: [
            { title: "风场", path: '/classes/WindLayer' },
          ]
        }
      ],
      '/enums/': [
        {
          title: '地图实例',
          collapsable: false,
          children: [
            { title: "实例", path: '/classes/Earth.md' },
          ]
        },
        {
          title: '图层类',
          collapsable: false,
          children: [
            { title: "基类", path: '/classes/Base' },
            { title: "广告牌", path: '/classes/BillboardLayer' },
            { title: "点", path: '/classes/PointLayer' },
            { title: "线", path: '/classes/PolylineLayer' },
            { title: "圆", path: '/classes/CircleLayer' },
            { title: "多边形", path: '/classes/PolygonLayer' },
            { title: "覆盖物", path: '/classes/OverlayLayer' },
          ]
        },
        {
          title: '工具类',
          collapsable: false,
          children: [
            { title: "工具", path: '/classes/Utils' },
          ]
        },
        {
          title: '组件类',
          collapsable: false,
          children: [
            { title: "右键菜单", path: '/classes/ContextMenu' },
            { title: "标牌", path: '/classes/Descriptor' },
            { title: "地图事件", path: '/classes/GlobalEvent' },
            { title: "动态绘制", path: '/classes/DynamicDraw' },
            { title: "动态测量", path: '/classes/Measure' },
          ]
        },
        {
          title: '气象类',
          collapsable: false,
          children: [
            { title: "风场", path: '/classes/WindLayer' },
          ]
        }
      ],
      '/interfaces/': [
        {
          title: '地图实例',
          collapsable: false,
          children: [
            { title: "实例", path: '/classes/Earth.md' },
          ]
        },
        {
          title: '图层类',
          collapsable: false,
          children: [
            { title: "基类", path: '/classes/Base' },
            { title: "广告牌", path: '/classes/BillboardLayer' },
            { title: "点", path: '/classes/PointLayer' },
            { title: "线", path: '/classes/PolylineLayer' },
            { title: "圆", path: '/classes/CircleLayer' },
            { title: "多边形", path: '/classes/PolygonLayer' },
            { title: "覆盖物", path: '/classes/OverlayLayer' },
          ]
        },
        {
          title: '工具类',
          collapsable: false,
          children: [
            { title: "工具", path: '/classes/Utils' },
          ]
        },
        {
          title: '组件类',
          collapsable: false,
          children: [
            { title: "右键菜单", path: '/classes/ContextMenu' },
            { title: "标牌", path: '/classes/Descriptor' },
            { title: "地图事件", path: '/classes/GlobalEvent' },
            { title: "动态绘制", path: '/classes/DynamicDraw' },
            { title: "动态测量", path: '/classes/Measure' },
          ]
        },
        {
          title: '气象类',
          collapsable: false,
          children: [
            { title: "风场", path: '/classes/WindLayer' },
          ]
        }
      ],
    }
  }
}
