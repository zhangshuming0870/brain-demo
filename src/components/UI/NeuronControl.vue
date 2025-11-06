<template>
  <div class="neuron-control">
    <div class="control-header">
      <span class="control-label">神经元网络</span>
      <el-switch
        v-model="showNeurons"
        @change="handleShowChange"
        active-text="开启"
        inactive-text="关闭"
        size="default"
      />
    </div>
    
    <div v-show="showNeurons" class="control-content">
      <!-- 动画控制 -->
      <div class="control-item">
        <el-switch
          v-model="animateNeurons"
          @change="handleAnimateChange"
          active-text="信号动画"
          inactive-text="静态"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSceneStore } from '@/stores/sceneStore'

const sceneStore = useSceneStore()

const showNeurons = computed({
  get: () => sceneStore.showNeurons,
  set: (value) => sceneStore.setShowNeurons(value)
})

const animateNeurons = computed({
  get: () => sceneStore.animateNeurons,
  set: (value) => sceneStore.setAnimateNeurons(value)
})

function handleShowChange(value) {
  sceneStore.setShowNeurons(value)
}

function handleAnimateChange(value) {
  sceneStore.setAnimateNeurons(value)
}
</script>

<style scoped>
.neuron-control {
  position: absolute;
  top: 180px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 250px;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.control-label {
  font-size: 14px;
  color: #fff;
  font-weight: 600;
}

.control-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.value {
  font-size: 12px;
  font-weight: 600;
  color: #409eff;
  min-width: 50px;
  text-align: right;
}
</style>

<style>
/* 深度选择器，覆盖 Element Plus Switch 组件样式 */
.neuron-control :deep(.el-switch__label) {
  color: rgba(255, 255, 255, 0.8);
}

.neuron-control :deep(.el-switch__label.is-active) {
  color: #fff;
}
</style>

