<template>
  <!-- 这是一个逻辑组件，不渲染任何内容 -->
</template>

<script setup>
import { watch, onUnmounted } from 'vue'
import { useSceneStore } from '@/stores/sceneStore'
import { createSectionPlane, applySectionToModel, removeSectionFromModel } from '@/utils/crossSection'

const sceneStore = useSceneStore()

// 存储模型引用
let modelRef = null

// 监听横截面状态变化
watch(
  [() => sceneStore.crossSectionType, () => sceneStore.crossSectionPosition],
  () => {
    updateCrossSection()
  },
  { immediate: true }
)

// 监听三视图模式
watch(
  () => sceneStore.threeViewMode,
  (enabled) => {
    if (!enabled) {
      // 退出三视图模式时，恢复主视图的截面
      updateCrossSection()
    }
  }
)

/**
 * 更新横截面
 */
function updateCrossSection() {
  // 从全局获取模型引用（模型加载后设置）
  if (window.modelRef) {
    modelRef = window.modelRef
    
    const plane = createSectionPlane(
      sceneStore.crossSectionType,
      sceneStore.crossSectionPosition
    )
    
    applySectionToModel(modelRef, plane)
  }
}

/**
 * 设置模型引用（供外部调用）
 */
function setModelRef(model) {
  modelRef = model
  window.modelRef = model
  updateCrossSection()
}

/**
 * 清除截面效果
 */
function clearSection() {
  if (modelRef) {
    removeSectionFromModel(modelRef)
  }
}

// 暴露方法供外部调用
defineExpose({
  setModelRef,
  clearSection,
  updateCrossSection
})

onUnmounted(() => {
  clearSection()
})
</script>

