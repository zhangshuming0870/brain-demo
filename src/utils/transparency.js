/**
 * 透视/透明度工具函数
 * 提供模型透视效果的控制
 */

/**
 * 应用透视效果到模型
 * @param {Object3D} model - Three.js 模型对象
 * @param {boolean} transparent - 是否透视（半透明）
 * @param {number} opacity - 透明度值 (0-1)，默认 0.5
 */
export function applyTransparency(model, transparent, opacity = 0.5) {
  if (!model) return
  
  model.traverse((child) => {
    if (child.isMesh) {
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      
      materials.forEach(material => {
        if (!material) return
        
        if (transparent) {
          // 启用透视效果
          material.transparent = true
          material.opacity = opacity
          // 设置深度写入，确保正确的渲染顺序
          material.depthWrite = opacity < 1
        } else {
          // 关闭透视效果
          material.transparent = false
          material.opacity = 1.0
          material.depthWrite = true
        }
        
        // 更新材质
        material.needsUpdate = true
      })
    }
  })
}

/**
 * 移除透视效果
 * @param {Object3D} model - Three.js 模型对象
 */
export function removeTransparency(model) {
  applyTransparency(model, false)
}

