<script lang="ts" setup>
// do script
import { onMounted } from 'vue'

onMounted(() => {
  const utterScript = document.createElement('script')

  utterScript.src = 'https://utteranc.es/client.js'
  utterScript.async = true
  utterScript.crossOrigin = 'anonymous'

  utterScript.setAttribute('repo', 'atoposyz/anxiety_diary')
  utterScript.setAttribute('issue-term', 'title')
  // utterScript.setAttribute('label', 'utterances')
  utterScript.setAttribute('theme', 'github-light')

  // 挂载至 .comment，你也可以通过修改 selector 挂载至其他地方
  const anxiaryContainer = document.querySelector('.anxiary')
  if (anxiaryContainer)
  anxiaryContainer.appendChild(utterScript)
})
</script>

<template>
  <!-- try it -->
  <div />
</template>