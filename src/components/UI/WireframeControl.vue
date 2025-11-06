<template>
  <div class="wireframe-control">
    <div class="control-header">
      <span class="control-label">视图模式</span>
      <el-switch
        v-model="isWireframe"
        @change="handleChange"
        active-text="网格"
        inactive-text="正常"
        size="default"
      />
    </div>
    <div class="control-hint">
      <span v-if="isWireframe">当前为网格视图模式</span>
      <span v-else>当前为正常渲染模式</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSceneStore } from '@/stores/sceneStore'

const sceneStore = useSceneStore()

const isWireframe = computed({
  get: () => sceneStore.isWireframe,
  set: (value) => sceneStore.setWireframe(value)
})

function handleChange(value) {
  sceneStore.setWireframe(value)
}
</script>

<style scoped>
.wireframe-control {
  position: absolute;
  top: 100px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 200px;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.control-label {
  font-size: 14px;
  color: #fff;
  font-weight: 600;
}

.control-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
}
</style>

<style>
/* 深度选择器，覆盖 Element Plus Switch 组件样式 */
.wireframe-control :deep(.el-switch__label) {
  color: rgba(255, 255, 255, 0.8);
}

.wireframe-control :deep(.el-switch__label.is-active) {
  color: #fff;
}
</style>

