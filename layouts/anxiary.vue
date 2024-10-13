<script setup lang="ts">

</script>

<template>
  <RouterView v-slot="{ Component }">
    <component :is="Component">
      <div flex="~ wrap" gap="4">
        <div class="justify-center items-end anxiary" flex="~ wrap" gap="1" style="width: 100%;">
            <p style="width: 100%;">&nbsp;</p>
            <p style="width: 100%;">
                Anxiary——由anxiety和diary组成，请写下你的diary吧！
            </p>
        </div>
      </div>
    </component>
  </RouterView>
</template>