<script setup lang="ts">
import { usePinchScale } from '@vueuse/core'
import { reactive, ref } from 'vue'

const target = ref<HTMLElement | null>(null)
const options = { target }
const pinchGestureScale = reactive(usePinchScale(options))
</script>

<template>
  <div
    ref="target"
    class="h-40 mb-10 bg-[#3eaf7c] flex items-center justify-center rounded"
    style="border-radius"
  >
    <p class="text-white">
      Pinch Gesture Target
    </p>
  </div>
  <pre lang="yaml">{{ pinchGestureScale }}</pre>
</template>
