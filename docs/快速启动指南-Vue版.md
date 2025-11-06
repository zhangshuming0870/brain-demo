# 快速启动指南（Vue 3 + JavaScript 版本）

## 第一步：环境准备

```bash
# 1. 创建 Vue 3 项目（不使用 TypeScript）
npm create vue@latest renti-3d
cd renti-3d

# 选择配置：
# ❌ TypeScript（不使用）
# ✅ Router
# ✅ Pinia
# ❌ Vitest (可选)
# ❌ E2E Testing (可选)

# 2. 安装核心依赖
npm install three
npm install element-plus
npm install echarts
npm install pinia
```

## 第二步：配置 Element Plus

**main.js**

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

// 注册 Element Plus
app.use(ElementPlus)

app.use(createPinia())
app.use(router)
app.mount('#app')
```

## 第三步：获取 3D 模型资源

### 免费资源推荐

1. **Sketchfab** - https://sketchfab.com
   - 搜索 "human anatomy"、"human body"
   - 选择 CC 协议可商用的模型
   - 下载 GLTF/GLB 格式

2. **TurboSquid** - https://www.turbosquid.com
   - 有免费和付费模型
   - 质量较高

3. **Blender 制作**
   - 使用 Blender 制作基础模型
   - 导出为 GLTF 格式

### 模型要求

- 格式：GLTF 或 GLB
- 大小：尽量控制在 50MB 以内
- 分层：模型需要按图层命名（skin、muscle、skeleton 等）

## 第四步：创建基础场景

### 1. 创建 App.vue（使用原生 Three.js）

```vue
<template>
  <div class="app-container">
    <div ref="containerRef" class="canvas-container"></div>
    <Sidebar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Sidebar from './components/UI/Sidebar.vue'

const containerRef = ref(null)
let scene, camera, renderer, controls

onMounted(() => {
  // 初始化场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a1a)
  
  // 初始化相机
  camera = new THREE.PerspectiveCamera(
    50,
    containerRef.value.clientWidth / containerRef.value.clientHeight,
    0.1,
    1000
  )
  camera.position.set(0, 1.6, 5)
  
  // 初始化渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
  containerRef.value.appendChild(renderer.domElement)
  
  // 添加灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(10, 10, 5)
  scene.add(directionalLight)
  
  // 添加控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = true
  controls.enableZoom = true
  controls.enableRotate = true
  
  // 加载模型
  loadModel()
  
  // 动画循环
  animate()
})

function loadModel() {
  const loader = new GLTFLoader()
  loader.load('/models/human-body.glb', (gltf) => {
    const model = gltf.scene
    scene.add(model)
    window.modelRef = model // 存储引用
  })
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
</script>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  position: relative;
}

.canvas-container {
  width: 100%;
  height: 100%;
}
</style>
```

### 3. 将模型文件放到 public/models/ 目录

```
public/
└── models/
    └── human-body.glb
```

## 第五步：实现基础交互

### 1. 创建 Pinia Store

```javascript
// src/stores/sceneStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSceneStore = defineStore('scene', () => {
  const selectedOrgan = ref(null)
  
  const setSelectedOrgan = (organ) => {
    selectedOrgan.value = organ
  }
  
  return {
    selectedOrgan,
    setSelectedOrgan
  }
})
```

### 2. 实现点击选择（在 App.vue 中添加）

```javascript
// 在 App.vue 的 script 部分添加
import { Raycaster, Vector2 } from 'three'
import { useSceneStore } from './stores/sceneStore'

const sceneStore = useSceneStore()

function onMouseClick(event) {
  const mouse = new Vector2()
  const rect = renderer.domElement.getBoundingClientRect()
  
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  
  const raycaster = new Raycaster()
  raycaster.setFromCamera(mouse, camera)
  
  const intersects = raycaster.intersectObjects(scene.children, true)
  
  if (intersects.length > 0) {
    const clickedObject = intersects[0].object
    const organName = clickedObject.userData.organName
    if (organName) {
      sceneStore.setSelectedOrgan(organName)
    }
  }
}

// 在 onMounted 中添加
renderer.domElement.addEventListener('click', onMouseClick)
```

## 第六步：添加 UI 界面

### 1. 创建侧边栏

```vue
<!-- src/components/UI/Sidebar.vue -->
<template>
  <div class="sidebar">
    <h2>3D 人体模型</h2>
    <div v-if="selectedOrgan" class="organ-info">
      <h3>选中器官：{{ selectedOrgan }}</h3>
      <!-- 显示器官信息 -->
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSceneStore } from '@/stores/sceneStore'

const sceneStore = useSceneStore()
const selectedOrgan = computed(() => sceneStore.selectedOrgan)
</script>

<style scoped>
.sidebar {
  position: absolute;
  top: 0;
  left: 0;
  width: 300px;
  height: 100vh;
  background: white;
  padding: 20px;
  z-index: 1000;
}
</style>
```

### 2. 更新 App.vue

```vue
<template>
  <div class="app-container">
    <TresCanvas shadows>
      <!-- Canvas 内容 -->
    </TresCanvas>
    
    <Sidebar />
  </div>
</template>

<script setup>
import Sidebar from './components/UI/Sidebar.vue'
// ... 其他导入
</script>
```

## 第七步：实现横截面功能

### 1. 创建横截面功能（在 App.vue 中添加）

```javascript
// 在 App.vue 的 script 部分添加
import { Plane, Vector3 } from 'three'

let sectionPlane = null

function createSectionPlane(type, position) {
  const normal = new Vector3()
  let constant = 0
  
  switch (type) {
    case 'coronal':
      normal.set(1, 0, 0)
      constant = (position - 0.5) * 2
      break
    case 'sagittal':
      normal.set(0, 1, 0)
      constant = (position - 0.5) * 2
      break
    case 'axial':
      normal.set(0, 0, 1)
      constant = (position - 0.5) * 2
      break
  }
  
  return new Plane(normal, constant)
}

function applySection(plane) {
  if (!window.modelRef) return
  
  window.modelRef.traverse((child) => {
    if (child.isMesh) {
      if (!Array.isArray(child.material)) {
        child.material.clippingPlanes = [plane]
        child.material.clipShadows = true
        child.material.needsUpdate = true
      } else {
        child.material.forEach(mat => {
          mat.clippingPlanes = [plane]
          mat.clipShadows = true
          mat.needsUpdate = true
        })
      }
    }
  })
}
```

### 2. 创建横截面控制面板

```vue
<!-- src/components/UI/CrossSectionPanel.vue -->
<template>
  <div class="cross-section-panel">
    <h3>横截面观测</h3>
    
    <el-radio-group v-model="sectionType" @change="handleTypeChange">
      <el-radio-button label="coronal">冠状面</el-radio-button>
      <el-radio-button label="sagittal">矢状面</el-radio-button>
      <el-radio-button label="axial">横断面</el-radio-button>
    </el-radio-group>
    
    <div class="position-control">
      <label>截面位置：{{ (position * 100).toFixed(1) }}%</label>
      <el-slider
        v-model="position"
        :min="0"
        :max="1"
        :step="0.01"
        @change="handlePositionChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Plane, Vector3 } from 'three'

const sectionType = ref('axial')
const position = ref(0.5)

function createSectionPlane(type, position) {
  const normal = new Vector3()
  let constant = 0
  
  switch (type) {
    case 'coronal':
      normal.set(1, 0, 0)
      constant = (position - 0.5) * 2
      break
    case 'sagittal':
      normal.set(0, 1, 0)
      constant = (position - 0.5) * 2
      break
    case 'axial':
      normal.set(0, 0, 1)
      constant = (position - 0.5) * 2
      break
  }
  
  return new Plane(normal, constant)
}

function applySection(plane) {
  if (!window.modelRef) return
  
  window.modelRef.traverse((child) => {
    if (child.isMesh) {
      if (!Array.isArray(child.material)) {
        child.material.clippingPlanes = [plane]
        child.material.clipShadows = true
        child.material.needsUpdate = true
      } else {
        child.material.forEach(mat => {
          mat.clippingPlanes = [plane]
          mat.clipShadows = true
          mat.needsUpdate = true
        })
      }
    }
  })
}

function updateSection() {
  const plane = createSectionPlane(sectionType.value, position.value)
  applySection(plane)
}

// 初始化
watch([sectionType, position], updateSection, { immediate: true })
</script>

<style scoped>
.cross-section-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  min-width: 300px;
}
</style>
```

## 第八步：测试运行

```bash
# 启动开发服务器
npm run dev

# 浏览器访问 http://localhost:5173
```

## 常见问题

### Q: 为什么不使用 TresJS？
A: 为了简化技术栈，直接使用 Three.js 原生 API。这样代码更直观，也更容易理解和维护。

### Q: 模型加载很慢怎么办？
A: 
- 使用模型压缩工具（如 gltf-pipeline）
- 实现渐进式加载
- 使用 CDN 托管模型
- 使用 Draco 压缩

### Q: 如何实现模型分层？
A:
- 在 Blender 中按图层命名模型
- 或者在代码中根据模型名称/标签分组
- 使用 userData 存储图层信息

### Q: 性能优化怎么做？
A:
- 使用 `shallowRef` 和 `markRaw` 优化响应式
- 实现 LOD（细节层次）
- 使用实例化渲染
- 减少不必要的重渲染
- 使用 Web Workers 处理复杂计算

### Q: 横截面功能性能如何优化？
A:
- 使用 GPU 加速的 ClippingPlanes
- 缓存截面计算结果
- 按需更新截面
- 使用 Web Workers 处理截面数据

## 下一步

完成基础框架后，按照《技术实现方案-简化版.md》逐步添加：
1. 分层显示功能
2. 标注系统
3. 横截面功能（已完成基础）
4. 切片工具
5. 测量工具
6. 数据可视化

---

**提示**：先实现 MVP（最小可行产品），再逐步添加高级特性。重点是让项目能够运行起来，展示核心功能。

**推荐学习资源**：
- Vue 3 文档：https://vuejs.org
- Three.js 文档：https://threejs.org
- Element Plus 文档：https://element-plus.org
- ECharts 文档：https://echarts.apache.org

**核心理念**：使用简单的技术解决复杂的业务问题，突出业务理解能力而非技术复杂度。

