# 3D 人体生物科学可视化平台

## 项目框架

项目基础框架已搭建完成，包含以下结构：

### 技术栈
- Vue 3 (Composition API)
- JavaScript
- Three.js
- Element Plus
- ECharts
- Pinia
- Vue Router

### 项目结构

```
renti/
├── src/
│   ├── components/
│   │   ├── Scene/              # 3D 场景组件
│   │   │   ├── HumanModel.vue
│   │   │   └── CrossSectionView.vue
│   │   ├── UI/                 # UI 组件
│   │   │   ├── Sidebar.vue
│   │   │   ├── LayerPanel.vue
│   │   │   ├── InfoPanel.vue
│   │   │   └── CrossSectionPanel.vue
│   │   └── DataViz/            # 数据可视化组件
│   │       └── ChartPanel.vue
│   ├── stores/                 # Pinia 状态管理
│   │   └── sceneStore.js
│   ├── utils/                   # 工具函数
│   │   ├── modelLoader.js
│   │   └── anatomyData.js
│   ├── data/                   # 数据文件
│   │   └── anatomy.json
│   ├── views/                  # 页面组件
│   │   └── Home.vue
│   ├── router/                 # 路由配置
│   │   └── index.js
│   ├── App.vue                 # 根组件
│   └── main.js                 # 入口文件
├── public/
│   └── models/                 # 3D 模型文件目录
├── docs/                       # 项目文档
├── package.json
├── vite.config.js
└── index.html
```

## 安装依赖

```bash
npm install
```

## 启动项目

```bash
npm run dev
```

项目将在 http://localhost:5173 启动

## 下一步

参考 `docs/快速启动指南.md` 和 `docs/技术实现方案-简化版.md` 开始实现功能。

