/**
 * 网格视图工具函数
 * 提供模型网格视图（wireframe）的控制
 */

import * as THREE from 'three'

// 存储原始材质属性，用于恢复
const originalColors = new WeakMap()
const originalMaterials = new WeakMap()
const originalProperties = new WeakMap() // 存储其他属性（metalness, roughness, emissive等）

/**
 * 应用网格视图到模型
 * @param {Object3D} model - Three.js 模型对象
 * @param {boolean} wireframe - 是否启用网格视图
 */
export function applyWireframe(model, wireframe) {
  if (!model) return
  
  model.traverse((child) => {
    if (child.isMesh) {
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      
      materials.forEach(material => {
        if (!material) return
        
        if (wireframe) {
          // 保存原始材质属性（如果还没有保存）
          if (!originalMaterials.has(material)) {
            originalMaterials.set(material, material)
            originalColors.set(material, material.color.clone())
            
            // 保存其他可能被修改的属性
            const props = {}
            if (material.metalness !== undefined) {
              props.metalness = material.metalness
            }
            if (material.roughness !== undefined) {
              props.roughness = material.roughness
            }
            if (material.emissive) {
              props.emissive = material.emissive.clone()
              props.emissiveIntensity = material.emissiveIntensity
            }
            originalProperties.set(material, props)
          }
          
          // 设置网格视图模式
          material.wireframe = true
          material.color.setHex(0xd3d3d3) // 淡灰色
          material.visible = true
          material.transparent = false
          material.opacity = 1.0
          
          // 对于受光照影响的材质，调整属性以减少光照影响
          if (material.type === 'MeshStandardMaterial' || material.type === 'MeshPhysicalMaterial') {
            if (material.metalness !== undefined) {
              material.metalness = 0
            }
            if (material.roughness !== undefined) {
              material.roughness = 1
            }
            // 设置 emissive 来增强线框颜色显示
            if (material.emissive) {
              material.emissive.setHex(0xd3d3d3)
              material.emissiveIntensity = 0.3
            }
          }
        } else {
          // 关闭网格视图
          material.wireframe = false
          
          // 恢复原始颜色
          if (originalColors.has(material)) {
            const originalColor = originalColors.get(material)
            material.color.copy(originalColor)
            originalColors.delete(material)
          }
          
          // 恢复所有原始属性
          if (originalProperties.has(material)) {
            const props = originalProperties.get(material)
            
            if (props.metalness !== undefined && material.metalness !== undefined) {
              material.metalness = props.metalness
            }
            if (props.roughness !== undefined && material.roughness !== undefined) {
              material.roughness = props.roughness
            }
            if (props.emissive && material.emissive) {
              material.emissive.copy(props.emissive)
              material.emissiveIntensity = props.emissiveIntensity
            }
            
            originalProperties.delete(material)
          }
          
          // 清理引用
          originalMaterials.delete(material)
        }
        
        // 强制更新材质（重要：必须在所有属性设置后调用）
        material.needsUpdate = true
      })
    }
  })
}

/**
 * 移除网格视图
 * @param {Object3D} model - Three.js 模型对象
 */
export function removeWireframe(model) {
  applyWireframe(model, false)
}

