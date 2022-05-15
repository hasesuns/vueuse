---
category: Sensors
---

# usePinchScale

Reactive pinch gesture scale.


## Usage

```html
<script setup>
import { ref, reactive } from 'vue'
import { usePinchScale, PinchScaleOptions } from '@vueuse/core'

const pinchScaleArea = ref<HTMLElement | null>(null)
const options = { preventDefault: true, target: pinchScaleArea }
const pinchScale = reactive(usePinchScale(options))
</script>

<template>
  <div ref="pinchScaleArea">
      Pinch Scale Area
  </div>
</template>
```
