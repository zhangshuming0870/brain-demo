/**
 * 横截面扫描动画 Composable
 * 提供截面扫描动画功能
 */

import { ref } from 'vue'
import { useSceneStore } from '@/stores/sceneStore'

export function useSectionAnimation() {
  const sceneStore = useSceneStore()
  const isAnimating = ref(false)
  let animationId = null
  let startTime = null
  const animationDuration = 1500 // 1.5秒完成一次扫描（频率提高一倍）

  /**
   * 播放扫描动画
   * @param {number} duration - 动画时长（毫秒）
   */
  function playScanAnimation(duration = animationDuration) {
    if (isAnimating.value) {
      stopAnimation()
    }

    isAnimating.value = true
    startTime = Date.now()
    const startPosition = sceneStore.crossSectionPosition

    function animate() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 从 0 到 1 的线性动画
      const newPosition = startPosition + (1 - startPosition) * progress
      sceneStore.setCrossSectionPosition(newPosition)

      if (progress < 1) {
        animationId = requestAnimationFrame(animate)
      } else {
        // 动画完成，重置位置
        setTimeout(() => {
          sceneStore.setCrossSectionPosition(0)
          isAnimating.value = false
        }, 500)
      }
    }

    animate()
  }

  /**
   * 停止动画
   */
  function stopAnimation() {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    isAnimating.value = false
  }

  /**
   * 暂停动画（保留当前状态）
   */
  function pauseAnimation() {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    isAnimating.value = false
  }

  return {
    isAnimating,
    playScanAnimation,
    stopAnimation,
    pauseAnimation
  }
}

