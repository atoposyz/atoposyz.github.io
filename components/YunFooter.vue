<script lang="ts" setup>
import YunFooter from 'valaxy-theme-yun/components/YunFooter.vue'

</script>

<template>
  <YunFooter>
    <!-- 自定义页脚内容 -->
    <div class="beian" m="y-2" style="display: flex; justify-content: center;">
      <a href="https://icp.gov.moe/?keyword=20240313" target="_blank" rel="noopener" style="display: flex; padding-right: 5px;">
        <img style="width:24px;height:24px;margin-bottom:-8px" src="https://icp.gov.moe/favicon.ico">
        萌ICP备20240313号
      </a>
      |
      <a style="text-decoration:none;color:#55bb8a; display: flex; padding-left: 5px;" href="https://travel.moe/go.html" title="异次元之旅-跃迁-我们一起去萌站成员的星球旅行吧！" target="_blank">
        <img src="https://travel.moe/images/icon/icon64green.png" style="width:24px;height:24px">
        异次元之旅
      </a>
    </div>
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