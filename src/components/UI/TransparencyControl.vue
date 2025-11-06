<template>
  <div class="transparency-control">
    <div class="control-header">
      <span class="control-label">透视模式</span>
      <el-switch
        v-model="isTransparent"
        @change="handleChange"
        active-text="开启"
        inactive-text="关闭"
        size="default"
      />
    </div>
    <div class="control-hint">
      <span v-if="isTransparent">模型已启用透视效果（半透明）</span>
      <span v-else>模型为不透明显示</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSceneStore } from '@/stores/sceneStore'

const sceneStore = useSceneStore()

const isTransparent = computed({
  get: () => sceneStore.isTransparent,
  set: (value) => sceneStore.setTransparent(value)
})

function handleChange(value) {
  sceneStore.setTransparent(value)
}
</script>

<style scoped>
.transparency-control {
  position: absolute;
  top: 20px;
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
.transparency-control :deep(.el-switch__label) {
  color: rgba(255, 255, 255, 0.8);
}

.transparency-control :deep(.el-switch__label.is-active) {
  color: #fff;
}
</style>

