<template>
  <div class="cross-section-panel">
    <div class="panel-header">
      <h3>横截面观测</h3>
      <el-button 
        text 
        @click="toggleExpand"
      >
        {{ isExpanded ? '收起' : '展开' }}
      </el-button>
    </div>
    
    <div v-show="isExpanded" class="panel-content">
      <!-- 截面类型选择 -->
      <div class="section-type-group">
        <label class="label">截面方向：</label>
        <el-radio-group 
          :model-value="crossSectionType"
          @change="handleTypeChange"
          size="small"
        >
          <el-radio-button label="coronal">冠状面</el-radio-button>
          <el-radio-button label="sagittal">矢状面</el-radio-button>
          <el-radio-button label="axial">横断面</el-radio-button>
        </el-radio-group>
        <el-tooltip 
          :content="sectionDescription" 
          placement="top"
          class="info-tooltip"
        >
          <span class="info-icon">ℹ️</span>
        </el-tooltip>
      </div>
      
      <!-- 截面位置控制 -->
      <div class="section-position-group">
        <div class="position-header">
          <label class="label">截面位置：</label>
          <span class="position-value">{{ (crossSectionPosition * 100).toFixed(1) }}%</span>
        </div>
        <el-slider
          :model-value="crossSectionPosition"
          :min="0"
          :max="1"
          :step="0.01"
          @change="handlePositionChange"
          show-input
          :show-input-controls="false"
        />
      </div>
      
      <!-- 截面厚度控制（可选） -->
      <div class="section-thickness-group">
        <div class="thickness-header">
          <label class="label">截面厚度：</label>
          <span class="thickness-value">{{ (crossSectionThickness * 100).toFixed(1) }}%</span>
        </div>
        <el-slider
          :model-value="crossSectionThickness"
          :min="0.01"
          :max="0.1"
          :step="0.01"
          @change="handleThicknessChange"
        />
      </div>
      
      <!-- 功能按钮 -->
      <div class="section-actions">
        <el-button 
          type="primary" 
          @click="playScanAnimation" 
          :disabled="isAnimating"
          :loading="isAnimating"
          size="small"
        >
          {{ isAnimating ? '扫描中...' : '播放扫描动画' }}
        </el-button>
        <el-button 
          @click="toggleThreeView"
          size="small"
        >
          {{ threeViewMode ? '退出' : '进入' }}三视图
        </el-button>
        <el-button 
          @click="resetSection"
          size="small"
        >
          重置
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
// Element Plus 图标（如果未安装 @element-plus/icons-vue，可以移除图标功能）
// import { InfoFilled } from '@element-plus/icons-vue'
import { useSceneStore } from '@/stores/sceneStore'
import { getSectionTypeDescription } from '@/utils/crossSection'
import { useSectionAnimation } from '@/composables/useSectionAnimation'

const sceneStore = useSceneStore()

// 面板展开状态
const isExpanded = ref(true)

// 计算属性
const crossSectionType = computed(() => sceneStore.crossSectionType)
const crossSectionPosition = computed(() => sceneStore.crossSectionPosition)
const crossSectionThickness = computed(() => sceneStore.crossSectionThickness)
const threeViewMode = computed(() => sceneStore.threeViewMode)

// 截面描述
const sectionDescription = computed(() => {
  return getSectionTypeDescription(crossSectionType.value)
})

// 扫描动画
const { isAnimating, playScanAnimation, stopAnimation } = useSectionAnimation()

// 方法
function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function handleTypeChange(type) {
  sceneStore.setCrossSectionType(type)
}

function handlePositionChange(position) {
  sceneStore.setCrossSectionPosition(position)
}

function handleThicknessChange(thickness) {
  sceneStore.crossSectionThickness = thickness
}

function toggleThreeView() {
  sceneStore.threeViewMode = !sceneStore.threeViewMode
}

function resetSection() {
  sceneStore.setCrossSectionPosition(0.5)
  stopAnimation()
}
</script>

<style scoped>
.cross-section-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 16px;
  border-radius: 0;
  min-width: 320px;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.panel-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-type-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  min-width: 80px;
}

.info-tooltip {
  cursor: help;
  color: rgba(255, 255, 255, 0.6);
}

.info-icon {
  font-size: 16px;
  cursor: help;
}

.section-position-group,
.section-thickness-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.position-header,
.thickness-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.position-value,
.thickness-value {
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
  min-width: 50px;
  text-align: right;
}
</style>

<style>
/* 深度选择器，覆盖 Element Plus 组件样式 */
.cross-section-panel :deep(.el-radio-button__inner) {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.cross-section-panel :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
}

.cross-section-panel :deep(.el-button) {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.cross-section-panel :deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;
}

.cross-section-panel :deep(.el-button:hover) {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.cross-section-panel :deep(.el-button--primary:hover) {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.cross-section-panel :deep(.el-slider__runway) {
  background-color: rgba(255, 255, 255, 0.2);
}

.cross-section-panel :deep(.el-slider__bar) {
  background-color: #409eff;
}

.cross-section-panel :deep(.el-slider__button) {
  border-color: #409eff;
}

.cross-section-panel :deep(.el-input__inner) {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.section-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.section-actions .el-button {
  flex: 1;
  min-width: 80px;
}
</style>
