<template>
  <div v-if="enabled" class="three-view-container">
    <div class="view-item">
      <div class="view-header">
        <h4>冠状面</h4>
        <span class="view-position">{{ getViewPosition('coronal') }}%</span>
      </div>
      <canvas ref="coronalCanvasRef" class="view-canvas"></canvas>
    </div>
    
    <div class="view-item">
      <div class="view-header">
        <h4>矢状面</h4>
        <span class="view-position">{{ getViewPosition('sagittal') }}%</span>
      </div>
      <canvas ref="sagittalCanvasRef" class="view-canvas"></canvas>
    </div>
    
    <div class="view-item">
      <div class="view-header">
        <h4>横断面</h4>
        <span class="view-position">{{ getViewPosition('axial') }}%</span>
      </div>
      <canvas ref="axialCanvasRef" class="view-canvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { useSceneStore } from '@/stores/sceneStore'
import { createSectionPlane, applySectionToModel } from '@/utils/crossSection'

const props = defineProps({
  enabled: {
    type: Boolean,
    default: false
  },
  model: {
    type: Object,
    default: null
  },
  mainScene: {
    type: Object,
    default: null
  }
})

const sceneStore = useSceneStore()

// Canvas 引用
const coronalCanvasRef = ref(null)
const sagittalCanvasRef = ref(null)
const axialCanvasRef = ref(null)

// 渲染器
let coronalRenderer = null
let sagittalRenderer = null
let axialRenderer = null

// 相机
let coronalCamera = null
let sagittalCamera = null
let axialCamera = null

// 场景
let coronalScene = null
let sagittalScene = null
let axialScene = null

/**
 * 初始化三视图
 */
function initThreeViews() {
  if (!props.model || !props.mainScene) return

  const canvasSize = 200

  // 初始化冠状面视图
  if (coronalCanvasRef.value) {
    coronalRenderer = new THREE.WebGLRenderer({ 
      canvas: coronalCanvasRef.value,
      antialias: true 
    })
    coronalRenderer.setSize(canvasSize, canvasSize)
    
    coronalCamera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 100)
    coronalCamera.position.set(5, 0, 0)
    coronalCamera.lookAt(0, 0, 0)
    
    coronalScene = props.mainScene.clone()
    const coronalPlane = createSectionPlane('coronal', sceneStore.crossSectionPosition)
    applySectionToModel(coronalScene, coronalPlane)
  }

  // 初始化矢状面视图
  if (sagittalCanvasRef.value) {
    sagittalRenderer = new THREE.WebGLRenderer({ 
      canvas: sagittalCanvasRef.value,
      antialias: true 
    })
    sagittalRenderer.setSize(canvasSize, canvasSize)
    
    sagittalCamera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 100)
    sagittalCamera.position.set(0, 5, 0)
    sagittalCamera.lookAt(0, 0, 0)
    
    sagittalScene = props.mainScene.clone()
    const sagittalPlane = createSectionPlane('sagittal', sceneStore.crossSectionPosition)
    applySectionToModel(sagittalScene, sagittalPlane)
  }

  // 初始化横断面视图
  if (axialCanvasRef.value) {
    axialRenderer = new THREE.WebGLRenderer({ 
      canvas: axialCanvasRef.value,
      antialias: true 
    })
    axialRenderer.setSize(canvasSize, canvasSize)
    
    axialCamera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 100)
    axialCamera.position.set(0, 0, 5)
    axialCamera.lookAt(0, 0, 0)
    
    axialScene = props.mainScene.clone()
    const axialPlane = createSectionPlane('axial', sceneStore.crossSectionPosition)
    applySectionToModel(axialScene, axialPlane)
  }

  // 开始渲染循环
  animate()
}

/**
 * 渲染循环
 */
function animate() {
  if (!props.enabled) return

  requestAnimationFrame(animate)

  if (coronalRenderer && coronalScene && coronalCamera) {
    coronalRenderer.render(coronalScene, coronalCamera)
  }

  if (sagittalRenderer && sagittalScene && sagittalCamera) {
    sagittalRenderer.render(sagittalScene, sagittalCamera)
  }

  if (axialRenderer && axialScene && axialCamera) {
    axialRenderer.render(axialScene, axialCamera)
  }
}

/**
 * 获取视图位置百分比
 */
function getViewPosition(type) {
  return (sceneStore.crossSectionPosition * 100).toFixed(1)
}

// 监听启用状态
watch(() => props.enabled, (enabled) => {
  if (enabled && props.model && props.mainScene) {
    initThreeViews()
  }
})

// 监听截面位置变化
watch(() => sceneStore.crossSectionPosition, () => {
  if (props.enabled) {
    // 更新截面平面
    if (coronalScene) {
      const coronalPlane = createSectionPlane('coronal', sceneStore.crossSectionPosition)
      applySectionToModel(coronalScene, coronalPlane)
    }
    if (sagittalScene) {
      const sagittalPlane = createSectionPlane('sagittal', sceneStore.crossSectionPosition)
      applySectionToModel(sagittalScene, sagittalPlane)
    }
    if (axialScene) {
      const axialPlane = createSectionPlane('axial', sceneStore.crossSectionPosition)
      applySectionToModel(axialScene, axialPlane)
    }
  }
})

onMounted(() => {
  if (props.enabled && props.model && props.mainScene) {
    initThreeViews()
  }
})

onUnmounted(() => {
  // 清理资源
  if (coronalRenderer) coronalRenderer.dispose()
  if (sagittalRenderer) sagittalRenderer.dispose()
  if (axialRenderer) axialRenderer.dispose()
})
</script>

<style scoped>
.three-view-container {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.view-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.view-position {
  font-size: 12px;
  color: #409eff;
  font-weight: 600;
}

.view-canvas {
  width: 200px;
  height: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f5f5f5;
}
</style>

