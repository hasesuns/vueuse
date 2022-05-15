<script setup lang="ts">
import { usePinchScale } from '@vueuse/core'
import { reactive, ref } from 'vue'

const pinchScaleArea = ref<HTMLElement | null>(null)
const options = { preventDefault: true, target: pinchScaleArea }
const pinchScale = reactive(usePinchScale(options))
</script>

<template>
  <div
    ref="pinchScaleArea"
    class="h-40 mb-10 bg-[#3eaf7c] flex items-center justify-center rounded"
    style="border-radius"
  >
    <p class="text-white">
      Pinch Scale Area
    </p>
  </div>
  <pre lang="yaml">{{ pinchScale }}</pre>
</template>
