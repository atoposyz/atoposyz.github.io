<script lang="ts" setup>
import YunFooter from 'valaxy-theme-yun/components/YunFooter.vue'

</script>

<template>
  <YunFooter>
    <!-- 自定义页脚内容 -->
    <div class="custom-footer-content">
      <div class="beian-links">
        <a href="https://icp.gov.moe/?keyword=20240313" target="_blank" rel="noopener" class="beian-link">
          <img class="beian-icon" src="https://icp.gov.moe/favicon.ico" alt="">
          萌ICP备20240313号
        </a>
        <span class="beian-divider">|</span>
        <a href="https://travel.moe/go.html" title="异次元之旅-跃迁-我们一起去萌站成员的星球旅行吧！" target="_blank" rel="noopener" class="beian-link travel-link">
          <img class="beian-icon" src="https://travel.moe/images/icon/icon64green.png" alt="">
          异次元之旅
        </a>
      </div>
      <VCLiveTime start-time="2023-07-08">
        <template #live-time-before>
          <span class="live-time-text">🍃 本站已运行 </span>
        </template>
        <template #live-time-after>
          <span class="live-time-text"> 啦</span>
        </template>
      </VCLiveTime>
    </div>
  </YunFooter>
</template>

<style scoped>
.custom-footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.beian-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.85rem;
}

.beian-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--va-c-text-2);
  background: rgba(255, 107, 157, 0.06);
  transition: all 0.25s ease;
  font-size: 0.85rem;
}

.beian-link:hover {
  background: rgba(255, 107, 157, 0.15);
  color: var(--va-c-primary);
  transform: translateY(-1px);
}

.travel-link {
  background: rgba(85, 187, 138, 0.08);
}

.travel-link:hover {
  background: rgba(85, 187, 138, 0.18);
  color: #55bb8a;
}

.beian-icon {
  width: 18px;
  height: 18px;
  border-radius: 4px;
}

.beian-divider {
  color: rgba(255, 107, 157, 0.15);
  font-weight: 300;
}

.live-time-text {
  color: var(--va-c-text-3);
  font-size: 0.8rem;
}

/* Dark mode */
html.dark .beian-link {
  background: rgba(255, 133, 179, 0.06);
}

html.dark .beian-link:hover {
  background: rgba(255, 133, 179, 0.15);
}

html.dark .travel-link {
  background: rgba(85, 187, 138, 0.06);
}

html.dark .travel-link:hover {
  background: rgba(85, 187, 138, 0.15);
}
</style>