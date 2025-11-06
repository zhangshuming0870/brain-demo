<template>
  <!-- 这是一个逻辑组件，不渲染任何内容 -->
</template>

<script setup>
import { watch } from 'vue'
import { useSceneStore } from '@/stores/sceneStore'
import { applyTransparency } from '@/utils/transparency'

const sceneStore = useSceneStore()

// 存储模型引用
let modelRef = null

// 监听透视状态变化
watch(
  () => sceneStore.isTransparent,
  (isTransparent) => {
    updateTransparency()
  },
  { immediate: true }
)

/**
 * 更新透视效果
 */
function updateTransparency() {
  // 从全局获取模型引用（模型加载后设置）
  if (window.modelRef) {
    modelRef = window.modelRef
    
    // 应用透视效果，透明度设为 0.6（可以调整）
    applyTransparency(modelRef, sceneStore.isTransparent, 0.6)
  }
}

/**
 * 设置模型引用（供外部调用）
 */
function setModelRef(model) {
  modelRef = model
  window.modelRef = model
  updateTransparency()
}

// 暴露方法供外部调用
defineExpose({
  setModelRef,
  updateTransparency
})
</script>

