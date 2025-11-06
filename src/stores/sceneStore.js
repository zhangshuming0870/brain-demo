import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSceneStore = defineStore('scene', () => {
  // 状态定义
  const selectedOrgan = ref(null)
  const visibleLayers = ref({
    skin: true,
    muscle: false,
    skeleton: false,
    organs: true,
    vessels: false
  })
  const layerOpacity = ref({})
  const toolMode = ref('select')
  const crossSectionType = ref('axial')
  const crossSectionPosition = ref(0.5)
  const crossSectionThickness = ref(0.02)
  const threeViewMode = ref(false)
  const isTransparent = ref(true) // 默认透视
  const isWireframe = ref(true) // 默认网格模式
  const showNeurons = ref(true) // 默认显示神经元
  const neuronCount = ref(50) // 神经元数量（固定50个）
  const neuronConnectionProbability = ref(1.0) // 连接概率（固定100%）
  const animateNeurons = ref(true) // 是否动画
  const neuronSignalInterval = ref(8000) // 信号间隔（固定8000ms）

  // 方法定义
  function setSelectedOrgan(organ) {
    selectedOrgan.value = organ
  }

  function toggleLayer(layer, visible) {
    visibleLayers.value[layer] = visible
  }

  function setLayerOpacity(layer, opacity) {
    layerOpacity.value[layer] = opacity
  }

  function setToolMode(mode) {
    toolMode.value = mode
  }

  function setCrossSectionType(type) {
    crossSectionType.value = type
  }

  function setCrossSectionPosition(position) {
    crossSectionPosition.value = position
  }

  function setCrossSectionThickness(thickness) {
    crossSectionThickness.value = thickness
  }

  function setThreeViewMode(enabled) {
    threeViewMode.value = enabled
  }

  function setTransparent(enabled) {
    isTransparent.value = enabled
  }

  function toggleTransparent() {
    isTransparent.value = !isTransparent.value
  }

  function setWireframe(enabled) {
    isWireframe.value = enabled
  }

  function toggleWireframe() {
    isWireframe.value = !isWireframe.value
  }

  function setShowNeurons(show) {
    showNeurons.value = show
  }

  function setNeuronCount(count) {
    neuronCount.value = count
  }

  function setNeuronConnectionProbability(probability) {
    neuronConnectionProbability.value = probability
  }

  function setAnimateNeurons(animate) {
    animateNeurons.value = animate
  }

  function setNeuronSignalInterval(interval) {
    neuronSignalInterval.value = interval
  }

  return {
    // 状态
    selectedOrgan,
    visibleLayers,
    layerOpacity,
    toolMode,
    crossSectionType,
    crossSectionPosition,
    crossSectionThickness,
    threeViewMode,
    isTransparent,
    isWireframe,
    showNeurons,
    neuronCount,
    neuronConnectionProbability,
    animateNeurons,
    neuronSignalInterval,
    // 方法
    setSelectedOrgan,
    toggleLayer,
    setLayerOpacity,
    setToolMode,
    setCrossSectionType,
    setCrossSectionPosition,
    setCrossSectionThickness,
    setThreeViewMode,
    setTransparent,
    toggleTransparent,
    setWireframe,
    toggleWireframe,
    setShowNeurons,
    setNeuronCount,
    setNeuronConnectionProbability,
    setAnimateNeurons,
    setNeuronSignalInterval
  }
})

