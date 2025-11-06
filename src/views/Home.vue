<template>
  <div class="home-container">
    <!-- 3D 场景容器 -->
    <div ref="canvasContainerRef" class="canvas-container"></div>
    
    <!-- 横截面控制器（逻辑组件，不渲染） -->
    <!-- <CrossSectionController ref="sectionControllerRef" /> -->
    <TransparencyController ref="transparencyControllerRef" />
    <WireframeController ref="wireframeControllerRef" />
    <NeuronNetwork ref="neuronNetworkRef" />
    
    <!-- UI 组件 -->
    <TransparencyControl />
    <WireframeControl />
    <NeuronControl />
    <NeuronLegend />
    <!-- <CrossSectionPanel /> -->
    <!-- <ThreeViewMode 
      :enabled="threeViewMode"
      :model="modelRef"
      :main-scene="scene"
    /> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useSceneStore } from '@/stores/sceneStore'
import CrossSectionController from '@/components/Scene/CrossSectionController.vue'
import TransparencyController from '@/components/Scene/TransparencyController.vue'
import WireframeController from '@/components/Scene/WireframeController.vue'
import NeuronNetwork from '@/components/Scene/NeuronNetwork.vue'
import CrossSectionPanel from '@/components/UI/CrossSectionPanel.vue'
import TransparencyControl from '@/components/UI/TransparencyControl.vue'
import WireframeControl from '@/components/UI/WireframeControl.vue'
import NeuronControl from '@/components/UI/NeuronControl.vue'
import NeuronLegend from '@/components/UI/NeuronLegend.vue'
import ThreeViewMode from '@/components/Scene/ThreeViewMode.vue'

const sceneStore = useSceneStore()

// 容器引用
const canvasContainerRef = ref(null)
const sectionControllerRef = ref(null)
const transparencyControllerRef = ref(null)
const wireframeControllerRef = ref(null)
const neuronNetworkRef = ref(null)

// Three.js 对象
let scene = null
let camera = null
let renderer = null
let controls = null
let modelRef = null

// 计算属性
const threeViewMode = computed(() => sceneStore.threeViewMode)

/**
 * 初始化 3D 场景
 */
function initScene() {
  if (!canvasContainerRef.value) return

  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a1a)
  // 将场景引用存储到全局，供其他组件使用
  window.scene = scene

  // 创建相机
  const width = canvasContainerRef.value.clientWidth
  const height = canvasContainerRef.value.clientHeight
  camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 1000) // 减小近裁剪平面，允许进入模型内部
  camera.position.set(0, 1.6, 5)

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.shadowMap.enabled = true
  // 确保透明物体和线条能正确混合渲染
  renderer.sortObjects = true
  canvasContainerRef.value.appendChild(renderer.domElement)

  // 添加灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  // 将环境光引用存储到全局，供其他组件使用
  window.ambientLight = ambientLight

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(10, 10, 5)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  // 添加控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = true
  controls.enableZoom = true
  controls.enableRotate = true
  controls.minDistance = 0.1 // 允许相机非常接近甚至进入模型内部
  controls.maxDistance = 20

  // 添加辅助网格（可选，用于调试）
  const gridHelper = new THREE.GridHelper(10, 10)
  scene.add(gridHelper)

  // 添加坐标轴辅助（可选，用于调试）
  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  // 加载模型
  loadModel()

  // 开始渲染循环
  animate()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

/**
 * 加载 3D 模型
 */
function loadModel() {
  const loader = new GLTFLoader()
  
  // 加载 brain-3d 模型
  loader.load(
    '/models/brain-3d/source/Brain.glb',
    (gltf) => {
      modelRef = gltf.scene
      
      // 计算模型边界框，用于自动调整位置和缩放
      const box = new THREE.Box3().setFromObject(modelRef)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      
      // 计算合适的缩放比例（使模型适合场景）
      const maxDimension = Math.max(size.x, size.y, size.z)
      const targetSize = 2 // 目标大小
      const scale = targetSize / maxDimension
      
      // 应用缩放
      modelRef.scale.set(scale, scale, scale)
      
      // 居中模型（将模型中心移到原点）
      modelRef.position.sub(center.multiplyScalar(scale))
      
      // 添加到场景
      scene.add(modelRef)
      
      // 设置模型引用到全局和控制器
      window.modelRef = modelRef
      if (sectionControllerRef.value) {
        sectionControllerRef.value.setModelRef(modelRef)
      }
      if (transparencyControllerRef.value) {
        transparencyControllerRef.value.setModelRef(modelRef)
      }
      if (wireframeControllerRef.value) {
        wireframeControllerRef.value.setModelRef(modelRef)
      }
      if (neuronNetworkRef.value) {
        neuronNetworkRef.value.setSceneAndModel(scene, modelRef)
      }
      
      // 调整相机位置以适应模型
      adjustCameraForModel(box, scale)
      
      console.log('脑部 3D 模型加载成功', {
        originalSize: size,
        scale: scale,
        center: center
      })
    },
    (progress) => {
      if (progress.total > 0) {
        const percent = (progress.loaded / progress.total) * 100
        console.log('模型加载进度:', percent.toFixed(2) + '%')
      }
    },
    (error) => {
      console.error('模型加载失败:', error)
      // 创建占位几何体作为后备方案
      createPlaceholderModel()
    }
  )
}

/**
 * 调整相机位置以适应模型
 */
function adjustCameraForModel(box, scale) {
  if (!camera || !box) return
  
  const size = box.getSize(new THREE.Vector3())
  const maxDimension = Math.max(size.x, size.y, size.z) * scale
  
  // 根据模型大小调整相机距离
  const distance = maxDimension * 2
  camera.position.set(distance * 0.5, distance * 0.5, distance)
  camera.lookAt(0, 0, 0)
  
  // 更新控制器
  if (controls) {
    controls.target.set(0, 0, 0)
    controls.update()
  }
}

/**
 * 创建占位模型（用于测试，仅在模型加载失败时使用）
 */
function createPlaceholderModel() {
  console.warn('使用占位模型，请确保模型文件路径正确')
  
  // 创建一个简单的几何体作为占位
  const geometry = new THREE.BoxGeometry(1, 2, 1)
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x4ecdc4,
    transparent: true,
    opacity: 0.1
  })
  
  modelRef = new THREE.Mesh(geometry, material)
  modelRef.position.set(0, 1, 0)
  scene.add(modelRef)
  
  // 设置模型引用
  window.modelRef = modelRef
  if (sectionControllerRef.value) {
    sectionControllerRef.value.setModelRef(modelRef)
  }
  if (transparencyControllerRef.value) {
    transparencyControllerRef.value.setModelRef(modelRef)
  }
  if (wireframeControllerRef.value) {
    wireframeControllerRef.value.setModelRef(modelRef)
  }
  if (neuronNetworkRef.value) {
    neuronNetworkRef.value.setSceneAndModel(scene, modelRef)
  }
}

/**
 * 渲染循环
 */
function animate() {
  requestAnimationFrame(animate)
  if (controls) {
    controls.update()
  }
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

/**
 * 处理窗口大小变化
 */
function handleResize() {
  if (!canvasContainerRef.value || !camera || !renderer) return
  
  const width = canvasContainerRef.value.clientWidth
  const height = canvasContainerRef.value.clientHeight
  
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

onMounted(() => {
  initScene()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  
  // 清理 Three.js 资源
  if (renderer) {
    renderer.dispose()
  }
  if (controls) {
    controls.dispose()
  }
})
</script>

<style scoped>
.home-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.canvas-container {
  width: 100%;
  height: 100%;
}
</style>
