<script lang="ts" setup>
import YunFooter from 'valaxy-theme-yun/components/YunFooter.vue'

</script>

<template>
  <YunFooter>
    <!-- 自定义页脚内容 -->
    <div class="beian" m="y-2"><a href="https://icp.gov.moe/?keyword=20240313" target="_blank" rel="noopener">萌ICP备20240313号</a></div>
    <VCLiveTime start-time="2023-07-08">
      <template #live-time-before>
        <span>本站已运行</span>
      </template>
      <template #live-time-after>
        <span>啦</span>
      </template>
    </VCLiveTime>
  </YunFooter>
</template>