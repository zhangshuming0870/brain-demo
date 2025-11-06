<template>
  <div class="neuron-legend">
    <div class="legend-header">
      <span class="legend-title">神经元图例</span>
    </div>
    <div class="legend-items">
      <div class="legend-item">
        <div class="legend-line dendrite"></div>
        <span class="legend-label">树突</span>
      </div>
      <div class="legend-item">
        <div class="legend-line axon"></div>
        <span class="legend-label">轴突</span>
      </div>
      <div class="legend-item">
        <div class="legend-line synapse"></div>
        <span class="legend-label">突触</span>
      </div>
    </div>
  </div>
</template>

<script setup>
// 图例组件，无需逻辑
</script>

<style scoped>
.neuron-legend {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 150px;
}

.legend-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.legend-title {
  font-size: 14px;
  color: #fff;
  font-weight: 600;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-line {
  width: 40px;
  height: 3px;
  border-radius: 0;
  flex-shrink: 0;
}

.legend-line.dendrite {
  background: #00d4ff; /* 树突青色 */
}

.legend-line.axon {
  background: #ff8800; /* 轴突橙黄色 */
}

.legend-line.synapse {
  background: #00ff88; /* 突触绿色 */
}

.legend-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}
</style>

