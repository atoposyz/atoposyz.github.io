<script setup lang="ts">
import { useFrontmatter } from 'valaxy'
import { useYunCollection } from 'valaxy-theme-yun/composables/collection.ts'
import { useYunLocalMenu } from 'valaxy-theme-yun/composables/localMenu.ts'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { collection, currentIndex } = useYunCollection()
const { menuOpen, toggleMenu } = useYunLocalMenu()
const { t } = useI18n()

const frontmatter = useFrontmatter<{
  aiDisclosure?: {
    enabled?: boolean
    details?: string
  }
}>()

const disclosureText = computed(() => {
  const disclosure = frontmatter.value.aiDisclosure
  if (disclosure?.enabled !== true)
    return ''

  const details = typeof disclosure.details === 'string' ? disclosure.details.trim() : ''
  return details || '本文创作过程中使用了 AI。'
})
</script>

<template>
  <YunLayoutWrapper
    outline-nav
    author-notes
    :local-menu="!!collection"
    :local-menu-open="menuOpen"
    :local-menu-label="t('theme.collectionMenu')"
    local-menu-controls="yun-collection-menu"
    local-menu-kind="collection"
    @toggle-local-menu="toggleMenu"
  >
    <YunLayoutLeft />
    <YunCollectionMobile v-model:open="menuOpen" />

    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-header-after>
          <YunMainHeaderAfter />
        </template>

        <template v-if="disclosureText" #main-content-before>
          <aside class="ai-disclosure" aria-label="AI 生成披露">
            <p class="ai-disclosure-title">AI 生成披露</p>
            <p class="ai-disclosure-details">{{ disclosureText }}</p>
          </aside>
        </template>

        <template #main-content-after>
          <YunMainContentAfter />
        </template>

        <template v-if="collection" #main-nav>
          <YunCollectionPrevNext :collection="collection" :current-index="currentIndex" />
        </template>

        <template #aside-custom>
          <slot name="aside-custom" />
        </template>
      </component>
    </RouterView>

    <YunLayoutRight :floating-trigger="false" />
  </YunLayoutWrapper>
</template>

<style scoped>
.ai-disclosure {
  margin-block-end: 1.25rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--yun-surface-line);
  border-inline-start: 0.2rem solid var(--va-c-primary);
  border-radius: var(--va-card-border-radius, 0.5rem);
  background-color: var(--va-c-bg-alt);
  color: var(--va-c-text);
}

.ai-disclosure-title {
  margin: 0;
  font-weight: 700;
}

.ai-disclosure-details {
  margin: 0.375rem 0 0;
  line-height: 1.65;
  overflow-wrap: anywhere;
  white-space: pre-line;
}
</style>
