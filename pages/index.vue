<route lang="yaml">
meta:
  layout: home
</route>

<template>
  <div class="home-welcome">
    <div class="tip custom-block">
      <p class="custom-block-title">✨ 欢迎来到我的小站</p>
      <p>这里记录着我的 OI 历程、数学思考、动漫热爱，以及生活中的点滴。</p>
    </div>

    <div class="home-quick-links">
      <a href="/posts/" class="quick-link-card">
        <span class="link-icon">📝</span>
        <span class="link-title">文章</span>
        <span class="link-desc">技术随笔 & 生活记录</span>
      </a>
      <a href="/about" class="quick-link-card">
        <span class="link-icon">🌸</span>
        <span class="link-title">关于</span>
        <span class="link-desc">关于我 & 关于站点</span>
      </a>
      <a href="/links" class="quick-link-card">
        <span class="link-icon">🔗</span>
        <span class="link-title">友链</span>
        <span class="link-desc">我的小伙伴们</span>
      </a>
      <a href="/anime-grid/" class="quick-link-card">
        <span class="link-icon">🎬</span>
        <span class="link-title">动画格子</span>
        <span class="link-desc">动画生涯个人喜好表</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.home-welcome {
  max-width: 720px;
  margin: 2rem auto;
  padding: 0 1.5rem;
  width: 100%;
}

.tip.custom-block {
  border-left-color: var(--va-c-primary);
  background: rgba(255, 107, 157, 0.06);
  border-radius: 0 12px 12px 0;
}

.tip.custom-block .custom-block-title {
  color: var(--va-c-primary);
  font-weight: 700;
}

.home-quick-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 2rem;
}

@media (max-width: 480px) {
  .home-quick-links {
    grid-template-columns: 1fr;
  }
}

.quick-link-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  border-radius: 16px;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.85);
  border: 1.5px solid rgba(255, 107, 157, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.08);
  color: inherit;
}

.quick-link-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(255, 107, 157, 0.2);
  border-color: rgba(255, 107, 157, 0.5);
  background: rgba(255, 255, 255, 0.95);
}

.link-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.link-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--va-c-primary);
  margin-bottom: 0.25rem;
}

.link-desc {
  font-size: 0.85rem;
  color: #999;
  text-align: center;
}

html.dark .quick-link-card {
  background: rgba(30, 25, 40, 0.7);
  border-color: rgba(255, 107, 157, 0.15);
}

html.dark .quick-link-card:hover {
  background: rgba(40, 35, 50, 0.85);
  border-color: rgba(255, 107, 157, 0.4);
}

html.dark .link-desc {
  color: #888;
}

html.dark .tip.custom-block {
  background: rgba(255, 133, 179, 0.05);
}
</style>
