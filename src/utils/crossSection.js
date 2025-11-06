/**
 * 横截面工具函数
 * 提供横截面计算和应用的核心逻辑
 */

import { Plane, Vector3 } from 'three'

/**
 * 截面类型枚举
 */
export const SectionType = {
  CORONAL: 'coronal',   // 冠状面：Y-Z 平面，沿 X 轴移动
  SAGITTAL: 'sagittal', // 矢状面：X-Z 平面，沿 Y 轴移动
  AXIAL: 'axial'        // 横断面：X-Y 平面，沿 Z 轴移动
}

/**
 * 创建截面平面
 * @param {string} type - 截面类型 (coronal/sagittal/axial)
 * @param {number} position - 截面位置 (0-1)
 * @returns {Plane} Three.js 平面对象
 */
export function createSectionPlane(type, position) {
  const normal = new Vector3()
  let constant = 0
  
  // 将位置从 0-1 转换为 -1 到 1 的范围
  const normalizedPosition = (position - 0.5) * 2
  
  switch (type) {
    case SectionType.CORONAL:
      // 冠状面：垂直于 X 轴
      normal.set(1, 0, 0)
      constant = normalizedPosition
      break
    case SectionType.SAGITTAL:
      // 矢状面：垂直于 Y 轴
      normal.set(0, 1, 0)
      constant = normalizedPosition
      break
    case SectionType.AXIAL:
      // 横断面：垂直于 Z 轴
      normal.set(0, 0, 1)
      constant = normalizedPosition
      break
    default:
      console.warn(`未知的截面类型: ${type}`)
      normal.set(0, 0, 1)
      constant = normalizedPosition
  }
  
  return new Plane(normal, constant)
}

/**
 * 应用截面到模型
 * @param {Object3D} model - Three.js 模型对象
 * @param {Plane} plane - 截面平面
 */
export function applySectionToModel(model, plane) {
  if (!model) return
  
  model.traverse((child) => {
    if (child.isMesh) {
      if (!Array.isArray(child.material)) {
        child.material.clippingPlanes = [plane]
        child.material.clipShadows = true
        child.material.needsUpdate = true
      } else {
        child.material.forEach(mat => {
          mat.clippingPlanes = [plane]
          mat.clipShadows = true
          mat.needsUpdate = true
        })
      }
    }
  })
}

/**
 * 移除截面效果
 * @param {Object3D} model - Three.js 模型对象
 */
export function removeSectionFromModel(model) {
  if (!model) return
  
  model.traverse((child) => {
    if (child.isMesh) {
      if (!Array.isArray(child.material)) {
        child.material.clippingPlanes = []
        child.material.needsUpdate = true
      } else {
        child.material.forEach(mat => {
          mat.clippingPlanes = []
          mat.needsUpdate = true
        })
      }
    }
  })
}

/**
 * 获取截面类型的中文名称
 * @param {string} type - 截面类型
 * @returns {string} 中文名称
 */
export function getSectionTypeName(type) {
  const names = {
    [SectionType.CORONAL]: '冠状面',
    [SectionType.SAGITTAL]: '矢状面',
    [SectionType.AXIAL]: '横断面'
  }
  return names[type] || type
}

/**
 * 获取截面类型的描述
 * @param {string} type - 截面类型
 * @returns {string} 描述
 */
export function getSectionTypeDescription(type) {
  const descriptions = {
    [SectionType.CORONAL]: '前后方向切割，从正面观察',
    [SectionType.SAGITTAL]: '左右方向切割，从侧面观察',
    [SectionType.AXIAL]: '上下方向切割，从顶部观察'
  }
  return descriptions[type] || ''
}

