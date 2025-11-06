<template>
  <!-- 这是一个逻辑组件，不渲染任何内容 -->
</template>

<script setup>
import { watch } from 'vue'
import { useSceneStore } from '@/stores/sceneStore'
import { applyWireframe } from '@/utils/wireframe'

const sceneStore = useSceneStore()

// 存储模型引用和环境光引用
let modelRef = null
let ambientLight = null

// 监听网格视图状态变化
watch(
  () => sceneStore.isWireframe,
  (isWireframe) => {
    updateWireframe()
  },
  { immediate: true }
)

/**
 * 更新网格视图
 */
function updateWireframe() {
  // 从全局获取模型引用（模型加载后设置）
  if (window.modelRef) {
    modelRef = window.modelRef
    
    // 应用网格视图
    applyWireframe(modelRef, sceneStore.isWireframe)
  }
  
  // 控制环境光
  updateAmbientLight()
}

/**
 * 更新环境光
 */
function updateAmbientLight() {
  if (window.ambientLight) {
    ambientLight = window.ambientLight
    
    // 开启网格视图时关闭环境光，关闭时恢复环境光
    if (sceneStore.isWireframe) {
      ambientLight.intensity = 0
    } else {
      ambientLight.intensity = 0.5 // 恢复默认值
    }
  }
}

/**
 * 设置模型引用（供外部调用）
 */
function setModelRef(model) {
  modelRef = model
  window.modelRef = model
  updateWireframe()
}

// 暴露方法供外部调用
defineExpose({
  setModelRef,
  updateWireframe,
  updateAmbientLight
})
</script>

