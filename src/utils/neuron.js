/**
 * 神经元工具函数
 * 基于真实生物学原理的神经元网络生成
 * 
 * 生物学原理：
 * - 神经元由细胞体（soma）、树突（dendrites）、轴突（axon）组成
 * - 树突：多个短分支，从细胞体向外，接收信号
 * - 轴突：一个长分支，从细胞体延伸，传递信号
 * - 连接：轴突末端连接到其他神经元的树突（突触）
 * - 连接遵循距离衰减和小世界网络特性
 */

import * as THREE from 'three'

/**
 * 检查点是否在边界框内（带安全边距）
 * @param {Vector3} point - 要检查的点
 * @param {Box3} box - 边界框
 * @param {number} margin - 安全边距
 * @returns {boolean} 是否在安全范围内
 */
function isPointInSafeBox(point, box, margin = 0.05) {
  return point.x >= box.min.x + margin &&
         point.x <= box.max.x - margin &&
         point.y >= box.min.y + margin &&
         point.y <= box.max.y - margin &&
         point.z >= box.min.z + margin &&
         point.z <= box.max.z - margin
}

/**
 * 计算从位置到边界框的最大安全距离
 * @param {Vector3} position - 起始位置
 * @param {Vector3} direction - 方向向量（已归一化）
 * @param {Box3} box - 边界框
 * @param {number} margin - 安全边距
 * @returns {number} 最大安全距离
 */
function getMaxSafeDistance(position, direction, box, margin = 0.05) {
  const safeMin = {
    x: box.min.x + margin,
    y: box.min.y + margin,
    z: box.min.z + margin
  }
  const safeMax = {
    x: box.max.x - margin,
    y: box.max.y - margin,
    z: box.max.z - margin
  }
  
  let maxDist = Infinity
  
  // 检查各个方向的边界
  if (direction.x > 0) {
    maxDist = Math.min(maxDist, (safeMax.x - position.x) / direction.x)
  } else if (direction.x < 0) {
    maxDist = Math.min(maxDist, (position.x - safeMin.x) / -direction.x)
  }
  
  if (direction.y > 0) {
    maxDist = Math.min(maxDist, (safeMax.y - position.y) / direction.y)
  } else if (direction.y < 0) {
    maxDist = Math.min(maxDist, (position.y - safeMin.y) / -direction.y)
  }
  
  if (direction.z > 0) {
    maxDist = Math.min(maxDist, (safeMax.z - position.z) / direction.z)
  } else if (direction.z < 0) {
    maxDist = Math.min(maxDist, (position.z - safeMin.z) / -direction.z)
  }
  
  return maxDist > 0 ? maxDist : 0
}

/**
 * 创建单个神经元（包含细胞体、树突、轴突）
 * @param {Vector3} position - 神经元位置
 * @param {number} somaSize - 细胞体大小
 * @param {Object} options - 神经元参数
 * @param {Box3} boundaryBox - 边界框（可选，用于限制神经元大小）
 * @returns {Object3D} 神经元对象
 */
export function createNeuron(position, somaSize = 0.01, options = {}, boundaryBox = null) {
  const {
    dendriteCount = 3 + Math.floor(Math.random() * 5), // 3-7个树突
    dendriteLength = 0.1 + Math.random() * 0.15, // 0.1-0.25
    axonLength = 0.2 + Math.random() * 0.3, // 0.2-0.5
    axonBranchProbability = 0.3 // 轴突分支概率
  } = options
  
  const margin = 0.05 // 安全边距

  const neuronGroup = new THREE.Group()
  
  // 1. 神经元细胞体（soma）
  const somaGeometry = new THREE.SphereGeometry(somaSize, 8, 8)
  const somaMaterial = new THREE.MeshStandardMaterial({
    color: 0xff6b6b, // 红色
    emissive: 0xff6b6b,
    emissiveIntensity: 0.5
  })
  const soma = new THREE.Mesh(somaGeometry, somaMaterial)
  soma.position.copy(position)
  // 设置渲染顺序，确保神经元在透明物体之后渲染
  soma.renderOrder = 999
  neuronGroup.add(soma)
  
  // 2. 树突（dendrites）- 多个短分支，从细胞体向外辐射
  const dendrites = []
  const dendriteMaterial = new THREE.LineBasicMaterial({
    color: 0x00d4ff, // 更饱和的青色，提高可见性
    transparent: false, // 不透明，确保始终可见
    opacity: 1.0,
    depthTest: true, // 启用深度测试，在透明模式下正确显示
    depthWrite: false, // 禁用深度写入，避免影响透明模型
    linewidth: 1 // 注意：WebGL 不支持 linewidth，但保留以兼容
  })
  
  for (let i = 0; i < dendriteCount; i++) {
    // 随机方向（球面均匀分布）
    const theta = Math.random() * Math.PI * 2 // 方位角
    const phi = Math.acos(2 * Math.random() - 1) // 极角
    
    let direction = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.sin(phi) * Math.sin(theta),
      Math.cos(phi)
    )
    direction.normalize()
    
    // 树突长度（可能分支）
    let length = dendriteLength * (0.7 + Math.random() * 0.6)
    
    // 如果提供了边界框，限制树突长度
    if (boundaryBox) {
      const maxLength = getMaxSafeDistance(position, direction, boundaryBox, margin)
      length = Math.min(length, maxLength * 0.8) // 留出20%安全边距
    }
    
    const endPoint = position.clone().add(direction.multiplyScalar(length))
    
    // 再次检查是否在边界内
    if (!boundaryBox || isPointInSafeBox(endPoint, boundaryBox, margin)) {
      // 创建树突曲线
      const dendrite = createDendriteBranch(position, endPoint)
      dendrite.material = dendriteMaterial
      neuronGroup.add(dendrite)
      dendrites.push(dendrite)
      
      // 30%概率添加树突分支
      if (Math.random() < 0.3) {
        const branchPoint = position.clone().add(direction.multiplyScalar(length * 0.6))
        if (!boundaryBox || isPointInSafeBox(branchPoint, boundaryBox, margin)) {
          let branchDirection = new THREE.Vector3().randomDirection()
          branchDirection.normalize()
          let branchLength = length * 0.4
          
          // 限制分支长度
          if (boundaryBox) {
            const maxBranchLength = getMaxSafeDistance(branchPoint, branchDirection, boundaryBox, margin)
            branchLength = Math.min(branchLength, maxBranchLength * 0.8)
          }
          
          const branchEnd = branchPoint.clone().add(branchDirection.multiplyScalar(branchLength))
          if (!boundaryBox || isPointInSafeBox(branchEnd, boundaryBox, margin)) {
            const branch = createDendriteBranch(branchPoint, branchEnd)
            branch.material = dendriteMaterial
            neuronGroup.add(branch)
            dendrites.push(branch)
          }
        }
      }
    }
  }
  
  // 3. 轴突（axon）- 一个长分支，从细胞体延伸
  let axonDirection = new THREE.Vector3().randomDirection()
  axonDirection.normalize()
  
  let actualAxonLength = axonLength
  // 如果提供了边界框，限制轴突长度
  if (boundaryBox) {
    const maxLength = getMaxSafeDistance(position, axonDirection, boundaryBox, margin)
    actualAxonLength = Math.min(axonLength, maxLength * 0.8) // 留出20%安全边距
  }
  
  let axonEnd = position.clone().add(axonDirection.multiplyScalar(actualAxonLength))
  let axon = null
  const axonMaterial = new THREE.LineBasicMaterial({
    color: 0xff8800, // 更饱和的橙红色，提高可见性
    transparent: false, // 不透明，确保始终可见
    opacity: 1.0,
    depthTest: true, // 启用深度测试，在透明模式下正确显示
    depthWrite: false, // 禁用深度写入，避免影响透明模型
    linewidth: 1.5 // 注意：WebGL 不支持 linewidth，但保留以兼容
  })
  
  // 确保轴突末端在边界内
  if (!boundaryBox || isPointInSafeBox(axonEnd, boundaryBox, margin)) {
    axon = createAxonBranch(position, axonEnd)
    axon.material = axonMaterial
    neuronGroup.add(axon)
    
    // 轴突可能分支（形成轴突末梢）
    if (Math.random() < axonBranchProbability) {
      const branchPoint = position.clone().add(axonDirection.multiplyScalar(actualAxonLength * 0.7))
      if (!boundaryBox || isPointInSafeBox(branchPoint, boundaryBox, margin)) {
        for (let i = 0; i < 2; i++) {
          let branchDir = new THREE.Vector3().randomDirection()
          branchDir.normalize()
          let branchLength = actualAxonLength * 0.3
          
          // 限制分支长度
          if (boundaryBox) {
            const maxBranchLength = getMaxSafeDistance(branchPoint, branchDir, boundaryBox, margin)
            branchLength = Math.min(branchLength, maxBranchLength * 0.8)
          }
          
          const branchEnd = branchPoint.clone().add(branchDir.multiplyScalar(branchLength))
          if (!boundaryBox || isPointInSafeBox(branchEnd, boundaryBox, margin)) {
            const branch = createAxonBranch(branchPoint, branchEnd)
            branch.material = axonMaterial
            neuronGroup.add(branch)
          }
        }
      }
    }
  } else {
    // 如果轴突末端超出边界，调整方向或长度
    const maxLength = getMaxSafeDistance(position, axonDirection, boundaryBox, margin)
    const adjustedLength = Math.max(0.05, maxLength * 0.7)
    axonEnd = position.clone().add(axonDirection.multiplyScalar(adjustedLength))
    
    axon = createAxonBranch(position, axonEnd)
    axon.material = axonMaterial
    neuronGroup.add(axon)
  }
  
  // 存储神经元信息
  neuronGroup.userData = {
    type: 'neuron',
    position: position.clone(),
    soma: soma,
    dendrites: dendrites,
    axon: axon,
    axonEnd: axonEnd, // 轴突末端位置（用于连接）
    axonCurve: axon ? axon.userData.curve : null, // 保存轴突曲线
    connections: [] // 突触连接列表
  }
  
  // 如果轴突存在，保存其曲线信息
  if (axon && axon.geometry) {
    const positions = axon.geometry.attributes.position
    if (positions) {
      // 从几何体中重建曲线
      const points = []
      for (let i = 0; i < positions.count; i++) {
        points.push(new THREE.Vector3(
          positions.getX(i),
          positions.getY(i),
          positions.getZ(i)
        ))
      }
      if (points.length > 0) {
        neuronGroup.userData.axonCurve = new THREE.CatmullRomCurve3(points)
      }
    }
  }
  
  return neuronGroup
}

/**
 * 创建树突分支（短而细的曲线）
 */
function createDendriteBranch(from, to) {
  const midPoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5)
  const direction = new THREE.Vector3().subVectors(to, from).normalize()
  
  // 轻微弯曲
  const perpendicular = new THREE.Vector3()
  if (Math.abs(direction.x) < 0.9) {
    perpendicular.set(1, 0, 0).cross(direction).normalize()
  } else {
    perpendicular.set(0, 1, 0).cross(direction).normalize()
  }
  
  const offset = perpendicular.multiplyScalar(from.distanceTo(to) * 0.1 * (Math.random() - 0.5))
  midPoint.add(offset)
  
  const curve = new THREE.CatmullRomCurve3([from, midPoint, to])
  const points = curve.getPoints(30) // 增加点数使线条更平滑
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  
  const line = new THREE.Line(geometry)
  // 设置渲染顺序，确保线条在透明物体之后渲染（数值越大越后渲染）
  line.renderOrder = 999
  return line
}

/**
 * 创建轴突分支（长而粗的曲线）
 */
function createAxonBranch(from, to) {
  const midPoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5)
  const direction = new THREE.Vector3().subVectors(to, from).normalize()
  
  // 更明显的弯曲
  const perpendicular = new THREE.Vector3()
  if (Math.abs(direction.x) < 0.9) {
    perpendicular.set(1, 0, 0).cross(direction).normalize()
  } else {
    perpendicular.set(0, 1, 0).cross(direction).normalize()
  }
  
  const offset = perpendicular.multiplyScalar(from.distanceTo(to) * 0.2 * (Math.random() - 0.5))
  midPoint.add(offset)
  
  const curve = new THREE.CatmullRomCurve3([from, midPoint, to])
  const points = curve.getPoints(40) // 增加点数使线条更平滑
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  
  const line = new THREE.Line(geometry)
  // 设置渲染顺序，确保线条在透明物体之后渲染（数值越大越后渲染）
  line.renderOrder = 999
  // 保存曲线信息，用于动画
  line.userData.curve = curve
  return line
}

/**
 * 创建突触连接（从轴突末端到树突）
 * @param {Vector3} axonEnd - 轴突末端位置
 * @param {Vector3} dendritePoint - 树突上的点
 * @returns {Line} 突触连接
 */
function createSynapse(axonEnd, dendritePoint) {
  const distance = axonEnd.distanceTo(dendritePoint)
  
  // 使用更平滑的曲线连接
  const midPoint = new THREE.Vector3().addVectors(axonEnd, dendritePoint).multiplyScalar(0.5)
  const direction = new THREE.Vector3().subVectors(dendritePoint, axonEnd).normalize()
  
  const perpendicular = new THREE.Vector3()
  if (Math.abs(direction.x) < 0.9) {
    perpendicular.set(1, 0, 0).cross(direction).normalize()
  } else {
    perpendicular.set(0, 1, 0).cross(direction).normalize()
  }
  
  const offset = perpendicular.multiplyScalar(distance * 0.3 * (Math.random() - 0.5))
  midPoint.add(offset)
  
  const curve = new THREE.CatmullRomCurve3([axonEnd, midPoint, dendritePoint])
  const points = curve.getPoints(30)
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  
  const material = new THREE.LineBasicMaterial({
    color: 0x00ff88, // 更饱和的绿色，提高可见性
    transparent: true, // 启用透明度以支持动画效果
    opacity: 1.0,
    depthTest: true, // 启用深度测试，在透明模式下正确显示
    depthWrite: false, // 禁用深度写入，避免影响透明模型
    linewidth: 1 // 注意：WebGL 不支持 linewidth，但保留以兼容
  })
  
  const synapse = new THREE.Line(geometry, material)
  // 设置渲染顺序，确保线条在透明物体之后渲染（数值越大越后渲染）
  synapse.renderOrder = 999
  synapse.userData = {
    type: 'synapse',
    from: axonEnd,
    to: dendritePoint,
    active: false
  }
  
  return synapse
}

/**
 * 计算连接概率（基于距离衰减和小世界网络特性）
 * @param {number} distance - 距离
 * @param {number} maxDistance - 最大距离
 * @param {number} baseProbability - 基础概率
 * @returns {number} 连接概率
 */
function calculateConnectionProbability(distance, maxDistance, baseProbability) {
  // 距离衰减：使用指数衰减
  const distanceFactor = Math.exp(-distance / (maxDistance * 0.3))
  
  // 小世界网络特性：局部密集，全局稀疏
  const localFactor = distance < maxDistance * 0.2 ? 1.5 : 1.0
  const globalFactor = distance > maxDistance * 0.5 ? 0.3 : 1.0
  
  return baseProbability * distanceFactor * localFactor * globalFactor
}

/**
 * 创建神经元网络（基于真实生物学原理）
 * @param {Object3D} brainModel - 大脑模型
 * @param {number} count - 神经元数量
 * @param {number} connectionProbability - 基础连接概率
 * @returns {Object3D} 神经元网络组
 */
export function createNeuronNetwork(brainModel, count = 50, connectionProbability = 0.3) {
  const networkGroup = new THREE.Group()
  networkGroup.name = 'NeuronNetwork'
  
  // 获取大脑模型的边界框
  const box = new THREE.Box3()
  if (brainModel) {
    box.setFromObject(brainModel)
  } else {
    box.setFromCenterAndSize(new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 2, 2))
  }
  
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const maxDistance = Math.min(size.x, size.y, size.z) * 0.4
  
  // 计算安全的内部范围（缩小范围，确保神经元和其轴突/树突都在内部）
  // 考虑到轴突和树突的最大长度，需要留出足够的边距
  const margin = Math.min(size.x, size.y, size.z) * 0.28 // 28% 的边距（进一步增大边距）
  const safeMin = box.min.clone().addScalar(margin)
  const safeMax = box.max.clone().subScalar(margin)
  
  // 整体往上偏移（Y轴方向向上移动）
  const yOffset = size.y * 0.1 // 向上偏移10%
  safeMin.y += yOffset
  safeMax.y += yOffset
  
  const safeBox = new THREE.Box3(safeMin, safeMax)
  const safeCenter = safeBox.getCenter(new THREE.Vector3())
  const safeSize = safeBox.getSize(new THREE.Vector3())
  
  // 创建神经元（使用更真实的分布）
  const neurons = []
  
  // 使用泊松分布模拟神经元密度（局部聚类）
  const clusters = Math.floor(count / 10) // 创建聚类
  let neuronIndex = 0
  let attempts = 0
  const maxAttempts = count * 10 // 防止无限循环
  
  for (let c = 0; c < clusters && neuronIndex < count && attempts < maxAttempts; c++) {
    // 聚类中心（在安全范围内，进一步缩小范围）
    const clusterCenter = new THREE.Vector3(
      safeCenter.x + (Math.random() - 0.5) * safeSize.x * 0.35,
      safeCenter.y + (Math.random() - 0.5) * safeSize.y * 0.35,
      safeCenter.z + (Math.random() - 0.5) * safeSize.z * 0.35
    )
    
    // 确保聚类中心在安全范围内
    if (!safeBox.containsPoint(clusterCenter)) continue
    
    // 在聚类周围生成神经元（高斯分布，进一步减小聚类大小）
    const clusterSize = Math.min(safeSize.x, safeSize.y, safeSize.z) * 0.06
    const neuronsInCluster = Math.min(5 + Math.floor(Math.random() * 8), count - neuronIndex)
    
    for (let i = 0; i < neuronsInCluster && neuronIndex < count && attempts < maxAttempts; i++) {
      attempts++
      
      // 高斯分布偏移（进一步减小偏移范围）
      const offset = new THREE.Vector3(
        (Math.random() + Math.random() + Math.random() + Math.random() - 2) * clusterSize * 0.25,
        (Math.random() + Math.random() + Math.random() + Math.random() - 2) * clusterSize * 0.25,
        (Math.random() + Math.random() + Math.random() + Math.random() - 2) * clusterSize * 0.25
      )
      
      const position = clusterCenter.clone().add(offset)
      
      // 确保在大脑内部（使用原始边界框检查，但位置在安全范围内）
      if (safeBox.containsPoint(position) && box.containsPoint(position)) {
        // 创建神经元时传入边界框，让它在创建时就限制所有部分
        const neuron = createNeuron(position, 0.01, {}, box)
        
        // 验证神经元的所有关键点都在边界内
        const axonEnd = neuron.userData.axonEnd
        if (isPointInSafeBox(axonEnd, box, margin)) {
          neurons.push(neuron)
          networkGroup.add(neuron)
          neuronIndex++
        }
      }
    }
  }
  
  // 补充剩余的神经元（均匀分布，在安全范围内，进一步缩小范围）
  while (neuronIndex < count && attempts < maxAttempts) {
    attempts++
    const position = new THREE.Vector3(
      safeCenter.x + (Math.random() - 0.5) * safeSize.x * 0.4,
      safeCenter.y + (Math.random() - 0.5) * safeSize.y * 0.4,
      safeCenter.z + (Math.random() - 0.5) * safeSize.z * 0.4
    )
    
    if (safeBox.containsPoint(position) && box.containsPoint(position)) {
      // 创建神经元时传入边界框，让它在创建时就限制所有部分
      const neuron = createNeuron(position, 0.01, {}, box)
      
      // 验证神经元的所有关键点都在边界内
      const axonEnd = neuron.userData.axonEnd
      if (isPointInSafeBox(axonEnd, box, margin)) {
        neurons.push(neuron)
        networkGroup.add(neuron)
        neuronIndex++
      }
    }
  }
  
  // 创建突触连接（轴突到树突）
  for (let i = 0; i < neurons.length; i++) {
    const sourceNeuron = neurons[i]
    const axonEnd = sourceNeuron.userData.axonEnd
    
    // 寻找目标神经元（轴突连接到其他神经元的树突）
    for (let j = 0; j < neurons.length; j++) {
      if (i === j) continue
      
      const targetNeuron = neurons[j]
      const targetPosition = targetNeuron.userData.position
      
      const distance = axonEnd.distanceTo(targetPosition)
      
      // 计算连接概率（基于距离和生物学规则）
      const prob = calculateConnectionProbability(distance, maxDistance, connectionProbability)
      
      if (Math.random() < prob && distance < maxDistance) {
        // 在目标神经元附近选择一个点作为树突连接点
        // 模拟轴突末端连接到树突
        const directionToTarget = new THREE.Vector3().subVectors(targetPosition, axonEnd).normalize()
        const dendriteConnectionPoint = targetPosition.clone().add(
          directionToTarget.multiplyScalar(-0.05 - Math.random() * 0.05)
        )
        
        // 创建突触连接
        const synapse = createSynapse(axonEnd, dendriteConnectionPoint)
        networkGroup.add(synapse)
        
        sourceNeuron.userData.connections.push(synapse)
        targetNeuron.userData.connections.push(synapse)
      }
    }
  }
  
  return networkGroup
}

/**
 * 创建信号传播光点（沿着曲线移动）
 * @param {THREE.Curve} curve - 曲线路径
 * @param {THREE.Object3D} parent - 父对象（用于添加到场景）
 * @param {number} duration - 动画时长（毫秒）
 * @param {number} color - 光点颜色（十六进制）
 * @returns {THREE.Object3D} 信号光点对象
 */
function createSignalPulse(curve, parent, duration = 400, color = 0x00ffff, size = 0.015) { // 默认频率提高一倍（800ms -> 400ms）
  if (!curve || !parent) return null
  
  // 创建信号光点（小球体）
  const pulseGeometry = new THREE.SphereGeometry(size, 8, 8)
  const pulseMaterial = new THREE.MeshBasicMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 2.0, // 增强发光强度
    transparent: true,
    opacity: 1.0,
    depthTest: false, // 禁用深度测试，确保始终可见
    depthWrite: false
  })
  const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial)
  pulse.renderOrder = 1000
  
  // 立即添加到场景
  if (parent) {
    parent.add(pulse)
  }
  
  // 设置初始位置（曲线起点）
  const startPoint = curve.getPoint(0)
  pulse.position.copy(startPoint)
  
  const startTime = Date.now()
  let animationId = null
  
  function animate() {
    const elapsed = Date.now() - startTime
    const progress = elapsed / duration
    
    if (progress < 1) {
      // 沿着曲线移动
      const point = curve.getPoint(progress)
      pulse.position.copy(point)
      
      // 脉冲效果：大小和透明度变化
      const intensity = Math.sin(progress * Math.PI * 2) * 0.2 + 0.8
      pulse.scale.setScalar(intensity)
      pulseMaterial.opacity = intensity
      
      animationId = requestAnimationFrame(animate)
    } else {
      // 动画结束，移除光点
      if (parent) {
        parent.remove(pulse)
      }
      pulseGeometry.dispose()
      pulseMaterial.dispose()
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }
  
  animate()
  return pulse
}

/**
 * 创建神经信号传播动画（从神经元细胞体沿轴突传播，再通过突触传递）
 * @param {Object3D} sourceNeuron - 源神经元
 * @param {Object3D} targetNeuron - 目标神经元（可选）
 * @param {Line} synapse - 突触连接（可选）
 * @param {THREE.Object3D} scene - 场景对象
 * @returns {Object} 动画控制对象
 */
export function animateNeuralSignalPropagation(sourceNeuron, targetNeuron = null, synapse = null, scene = null) {
  if (!sourceNeuron || !sourceNeuron.userData) return null
  if (!scene) scene = window.scene
  if (!scene) return null
  
  const signals = []
  let completed = false
  
  // 1. 首先在源神经元细胞体上闪烁，表示信号产生（蓝色）
  if (sourceNeuron.userData.soma) {
    const soma = sourceNeuron.userData.soma
    const originalEmissive = soma.material.emissive.clone()
    const originalIntensity = soma.material.emissiveIntensity
    
    let flashStart = Date.now()
    const flashDuration = 75 // 频率提高一倍（150ms -> 75ms）
    function sourceFlash() {
      const elapsed = Date.now() - flashStart
      const progress = elapsed / flashDuration
      
      if (progress < 1) {
        const intensity = Math.sin(progress * Math.PI)
        soma.material.emissive.setHex(0x0088ff) // 蓝色，表示信号产生
        soma.material.emissiveIntensity = originalIntensity + intensity * 0.8
        requestAnimationFrame(sourceFlash)
      } else {
        soma.material.emissive.copy(originalEmissive)
        soma.material.emissiveIntensity = originalIntensity
      }
    }
    sourceFlash()
  }
  
  // 2. 直接通过突触传递（跳过轴突传播）
  setTimeout(() => {
    if (synapse && synapse.geometry && targetNeuron) {
      const synapsePositions = synapse.geometry.attributes.position
      if (synapsePositions && synapsePositions.count > 0) {
        const synapsePoints = []
        for (let i = 0; i < synapsePositions.count; i++) {
          synapsePoints.push(new THREE.Vector3(
            synapsePositions.getX(i),
            synapsePositions.getY(i),
            synapsePositions.getZ(i)
          ))
        }
        
        if (synapsePoints.length > 0) {
          const synapseCurve = new THREE.CatmullRomCurve3(synapsePoints)
          // 突触传递：使用绿色光点（与突触颜色一致）
          const synapsePulse = createSignalPulse(synapseCurve, scene, 300, 0x00ff00, 0.012) // 频率提高一倍（600ms -> 300ms）
          if (synapsePulse && scene) {
            scene.add(synapsePulse)
            signals.push(synapsePulse)
            
            // 突触传递完成后，在目标神经元细胞体上闪烁（黄色，表示信号接收）
            setTimeout(() => {
              if (targetNeuron && targetNeuron.userData.soma) {
                const soma = targetNeuron.userData.soma
                const originalEmissive = soma.material.emissive.clone()
                const originalIntensity = soma.material.emissiveIntensity
                
                let flashTime = Date.now()
                const flashDuration = 100 // 频率提高一倍（200ms -> 100ms）
                function flash() {
                  const elapsed = Date.now() - flashTime
                  const progress = elapsed / flashDuration
                  
                  if (progress < 1) {
                    const intensity = Math.sin(progress * Math.PI)
                    soma.material.emissive.setHex(0xffff00) // 黄色，表示信号接收
                    soma.material.emissiveIntensity = originalIntensity + intensity * 0.5
                    requestAnimationFrame(flash)
                  } else {
                    soma.material.emissive.copy(originalEmissive)
                    soma.material.emissiveIntensity = originalIntensity
                    completed = true
                  }
                }
                flash()
              } else {
                completed = true
              }
            }, 300) // 频率提高一倍（600ms -> 300ms）
          }
        }
      }
    } else {
      completed = true
    }
  }, 75) // 源神经元闪烁后立即开始突触传递（频率提高一倍，150ms -> 75ms）
  
  return {
    signals,
    completed: () => completed
  }
}

/**
 * 创建神经信号脉冲动画（沿连接线传播 - 兼容旧版本）
 * @param {Line} connection - 连接线（轴突或突触）
 * @param {number} duration - 动画时长（毫秒）
 */
export function animateNeuralSignal(connection, duration = 500) { // 默认频率提高一倍（1000ms -> 500ms）
  if (!connection || !connection.userData || !connection.material) return
  
  // 如果连接正在动画中，跳过
  if (connection.userData.active) return
  
  const startTime = Date.now()
  const material = connection.material
  const originalColor = material.color.clone()
  const originalOpacity = material.opacity || 1.0
  
  // 确保材质可以更新
  material.needsUpdate = true
  material.transparent = true
  
  let animationId = null
  
  function animate() {
    const elapsed = Date.now() - startTime
    const progress = elapsed / duration
    
    if (progress < 1) {
      // 创建渐变效果：信号从起点传播到终点
      const intensity = Math.sin(progress * Math.PI) // 0 到 1 再到 0
      
      // 颜色变化：从原始颜色到亮青色
      const brightColor = new THREE.Color(0x00ffff) // 亮青色
      material.color.lerpColors(originalColor, brightColor, intensity)
      
      // 透明度变化
      material.transparent = true
      material.opacity = originalOpacity + intensity * (1.0 - originalOpacity) * 0.5
      
      material.needsUpdate = true
      animationId = requestAnimationFrame(animate)
    } else {
      // 动画结束，恢复原始状态
      material.color.copy(originalColor)
      material.opacity = originalOpacity
      material.transparent = true
      material.needsUpdate = true
      connection.userData.active = false
    }
  }
  
  connection.userData.active = true
  animate()
  
  return animationId
}

/**
 * 随机触发神经元信号（模拟真实的神经活动 - 完整传导过程）
 * @param {Object3D} networkGroup - 神经元网络组
 * @param {number} interval - 触发间隔（毫秒）
 */
export function startRandomNeuralSignals(networkGroup, interval = 1000) { // 默认频率提高一倍（2000ms -> 1000ms）
  if (!networkGroup) return null
  
  // 收集所有神经元和它们的突触连接
  const neurons = []
  const neuronSynapseMap = new Map() // 神经元 -> 突触连接列表
  
  networkGroup.traverse((child) => {
    if (child.userData && child.userData.type === 'neuron') {
      neurons.push(child)
      neuronSynapseMap.set(child, [])
    }
    if (child.userData && child.userData.type === 'synapse') {
      // 找到这个突触连接的源神经元和目标神经元
      const synapse = child
      networkGroup.traverse((neuron) => {
        if (neuron.userData && neuron.userData.type === 'neuron') {
          if (neuron.userData.connections && neuron.userData.connections.includes(synapse)) {
            neuronSynapseMap.get(neuron).push({
              synapse: synapse,
              sourceNeuron: neuron
            })
          }
        }
      })
    }
  })
  
  if (neurons.length === 0) {
    console.warn('没有找到神经元，无法启动动画')
    return null
  }
  
  // 找到有突触连接的神经元对
  const neuronPairs = []
  networkGroup.traverse((child) => {
    if (child.userData && child.userData.type === 'synapse') {
      const synapse = child
      // 查找源神经元和目标神经元
      for (const sourceNeuron of neurons) {
        if (sourceNeuron.userData.connections && sourceNeuron.userData.connections.includes(synapse)) {
          // 查找目标神经元（通过突触的to位置）
          for (const targetNeuron of neurons) {
            if (targetNeuron !== sourceNeuron) {
              const targetPos = targetNeuron.userData.position
              const synapseTo = synapse.userData.to
              if (synapseTo && targetPos.distanceTo(synapseTo) < 0.1) {
                neuronPairs.push({
                  source: sourceNeuron,
                  target: targetNeuron,
                  synapse: synapse
                })
                break
              }
            }
          }
          break
        }
      }
    }
  })
  
  if (neuronPairs.length === 0) {
    console.warn('没有找到神经元连接对，无法启动动画')
    return null
  }
  
  // 获取场景引用
  const scene = networkGroup.parent || window.scene
  
  // 立即触发一次动画
  const triggerSignal = () => {
    // 随机选择一个神经元对
    const pair = neuronPairs[Math.floor(Math.random() * neuronPairs.length)]
    if (pair && !pair.source.userData.animating) {
      pair.source.userData.animating = true
      animateNeuralSignalPropagation(pair.source, pair.target, pair.synapse, scene)
      
      // 0.5秒后允许再次动画（频率提高一倍，1000ms -> 500ms）
      setTimeout(() => {
        pair.source.userData.animating = false
      }, 500)
    }
  }
  
  // 立即触发一次
  triggerSignal()
  
  const signalInterval = setInterval(() => {
    // 随机选择1-3个神经元对同时触发
    const signalCount = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < signalCount; i++) {
      triggerSignal()
    }
  }, interval)
  
  return signalInterval
}

/**
 * 停止神经信号动画
 * @param {number} intervalId - 定时器ID
 */
export function stopNeuralSignals(intervalId) {
  if (intervalId) {
    clearInterval(intervalId)
  }
}
