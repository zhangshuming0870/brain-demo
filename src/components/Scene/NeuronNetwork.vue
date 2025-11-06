<template>
  <!-- 这是一个逻辑组件，不渲染任何内容 -->
</template>

<script setup>
import { watch, onUnmounted } from 'vue'
import { useSceneStore } from '@/stores/sceneStore'
import { 
  createNeuronNetwork, 
  startRandomNeuralSignals, 
  stopNeuralSignals 
} from '@/utils/neuron'

const sceneStore = useSceneStore()

// 存储神经元网络引用
let neuronNetwork = null
let signalInterval = null

// 监听神经元网络状态变化
watch(
  () => sceneStore.showNeurons,
  (show) => {
    updateNeuronNetwork()
  },
  { immediate: true }
)

// 监听神经元数量变化
watch(
  () => sceneStore.neuronCount,
  () => {
    if (sceneStore.showNeurons) {
      updateNeuronNetwork()
    }
  }
)

// 监听动画状态变化
watch(
  () => sceneStore.animateNeurons,
  (animate) => {
    if (sceneStore.showNeurons && neuronNetwork) {
      // 停止现有动画
      if (signalInterval) {
        stopNeuralSignals(signalInterval)
        signalInterval = null
      }
      
      // 如果启用动画，启动新动画
      if (animate) {
        signalInterval = startRandomNeuralSignals(
          neuronNetwork,
          sceneStore.neuronSignalInterval
        )
      }
    }
  }
)

// 监听信号间隔变化
watch(
  () => sceneStore.neuronSignalInterval,
  () => {
    if (sceneStore.showNeurons && sceneStore.animateNeurons && neuronNetwork) {
      // 重启动画以应用新的间隔
      if (signalInterval) {
        stopNeuralSignals(signalInterval)
      }
      signalInterval = startRandomNeuralSignals(
        neuronNetwork,
        sceneStore.neuronSignalInterval
      )
    }
  }
)

/**
 * 更新神经元网络
 */
function updateNeuronNetwork() {
  // 从全局获取场景和模型引用
  if (window.scene && window.modelRef) {
    const scene = window.scene
    const modelRef = window.modelRef
    
    // 如果之前有神经元网络，先移除
    if (neuronNetwork) {
      scene.remove(neuronNetwork)
      // 清理资源
      neuronNetwork.traverse((child) => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
      neuronNetwork = null
    }
    
    // 停止信号动画
    if (signalInterval) {
      stopNeuralSignals(signalInterval)
      signalInterval = null
    }
    
    // 如果需要显示神经元
    if (sceneStore.showNeurons) {
      // 创建神经元网络
      neuronNetwork = createNeuronNetwork(
        modelRef,
        sceneStore.neuronCount,
        sceneStore.neuronConnectionProbability
      )
      
      scene.add(neuronNetwork)
      
      // 启动随机信号动画
      if (sceneStore.animateNeurons) {
        // 延迟启动，确保网络已创建
        setTimeout(() => {
          signalInterval = startRandomNeuralSignals(
            neuronNetwork,
            sceneStore.neuronSignalInterval
          )
        }, 100)
      }
    }
  }
}

/**
 * 设置场景和模型引用（供外部调用）
 */
function setSceneAndModel(scene, model) {
  window.scene = scene
  window.modelRef = model
  updateNeuronNetwork()
}

// 暴露方法供外部调用
defineExpose({
  setSceneAndModel,
  updateNeuronNetwork
})

onUnmounted(() => {
  // 清理资源
  if (signalInterval) {
    stopNeuralSignals(signalInterval)
  }
})
</script>

