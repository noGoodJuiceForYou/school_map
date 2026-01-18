<template>
  <div v-if="!item.hidden">
    <template v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.alwaysShow">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path, onlyOneChild.query)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{ 'submenu-title-noDropdown': !isNest }">
          <svg-icon :icon-class="onlyOneChild.meta.icon || (item.meta && item.meta.icon)"/>
          <template #title><span class="menu-title" :title="hasTitle(onlyOneChild.meta.title)">{{ onlyOneChild.meta.title }}</span></template>
        </el-menu-item>
      </app-link>
    </template>

    <el-sub-menu v-else ref="subMenu" :index="resolvePath(item.path)" teleported>
      <template v-if="item.meta" #title>
        <svg-icon :icon-class="item.meta && item.meta.icon" />
        <span class="menu-title" :title="hasTitle(item.meta.title)">{{ item.meta.title }}</span>
      </template>

      <sidebar-item
        v-for="(child, index) in item.children"
        :key="child.path + index"
        :is-nest="true"
        :item="child"
        :base-path="item.path"
        class="nest-menu"
      />
    </el-sub-menu>
  </div>
</template>

<script setup>
import { isExternal } from '@/utils/validate'
import AppLink from './Link'

// 规范化路径函数
function getNormalPath(path) {
  if (path.length === 0) { return '/' }
  if (path[0] !== '/') { path = '/' + path }
  return path.replace(/\/+/g, '/')
}

const props = defineProps({
  // route object
  item: {
    type: Object,
    required: true
  },
  isNest: {
    type: Boolean,
    default: false
  },
  basePath: {
    type: String,
    default: ''
  }
})

const onlyOneChild = ref({})

function hasOneShowingChild(children = [], parent) {
  if (!children) {
    children = []
  }
  
  // 如果设置了alwaysShow，直接返回false，显示父菜单和所有子菜单
  if (parent.alwaysShow) {
    return false
  }
  
  const showingChildren = children.filter(item => {
    if (item.hidden) {
      return false
    }
    onlyOneChild.value = item
    return true
  })

  // When there is only one child router, the child router is displayed by default
  if (showingChildren.length === 1) {
    return true
  }

  // Show parent if there are no child router to display
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
    return true
  }

  return false
}

function resolvePath(routePath, routeQuery) {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  
  // 确保生成正确的嵌套路由路径
  let path = ''
  if (routePath.startsWith('/')) {
    // 如果是绝对路径，直接使用
    path = routePath
  } else {
    // 如果是相对路径，与 basePath 合并
    path = getNormalPath(props.basePath + '/' + routePath)
  }
  
  if (routeQuery) {
    let query = JSON.parse(routeQuery)
    return { path: path, query: query }
  }
  return path
}

function hasTitle(title){
  if (title.length > 5) {
    return title
  } else {
    return ""
  }
}
</script>
