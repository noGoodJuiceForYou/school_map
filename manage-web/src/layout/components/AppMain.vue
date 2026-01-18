<template>
  <section class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="tagsViewStore.cachedViews">
          <component :is="Component" :key="route.fullPath" v-if="!route.meta.link" />
        </keep-alive>
      </transition>
    </router-view>
    <iframe-toggle />
    <copyright />
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import copyright from "./Copyright/index"
import iframeToggle from "./IframeToggle/index"
import useTagsViewStore from '@/store/modules/tagsView'

const route = useRoute()
const tagsViewStore = useTagsViewStore()

// 移除未定义的 addIframe 函数调用
onMounted(() => {
  // 组件挂载时的逻辑
})
</script>

