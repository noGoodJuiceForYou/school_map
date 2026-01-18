import { createApp } from 'vue'

import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import locale from 'element-plus/es/locale/lang/zh-cn'

import '@/assets/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive

// 注册指令
import plugins from './plugins' // plugins
import { download } from '@/utils/request'

// svg图标
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'
import elementIcons from '@/components/SvgIcon/svgicon'

import './permission' // permission control

// 从utils/index.js导入parseTime函数
import { parseTime } from '@/utils/index'

// 实现其他常用工具函数
function resetForm(refName) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields()
  }
}

function addDateRange(params, dateRange, propName) {
  if (!params || !dateRange) {
    return
  }
  propName = propName || ['beginTime', 'endTime']
  params[propName[0]] = dateRange[0]
  params[propName[1]] = dateRange[1]
  return params
}

function handleTree(data, id, parentId, children, rootId) {
  id = id || 'id'
  parentId = parentId || 'parentId'
  children = children || 'children'
  rootId = rootId || Math.min.apply(Math, data.map(item => { return item[parentId] })) || 0
  //对源数据深度克隆
  const cloneData = JSON.parse(JSON.stringify(data))
  //循环所有项
  const treeData = cloneData.filter(father => {
    let branchArr = cloneData.filter(child => {
      //返回每一项的子级数组
      return father[id] === child[parentId]
    })
    branchArr.length > 0 ? father[children] = branchArr : delete father[children]
    //返回第一层
    return father[parentId] === rootId
  })
  return treeData != '' ? treeData : data
}

function selectDictLabel(datas, value) {
  if (value === undefined) {
    return ''
  }
  let actions = []
  Object.keys(datas).some((key) => {
    if (datas[key].value == ('' + value)) {
      actions.push(datas[key].label)
      return true
    }
  })
  if (actions.length === 0) {
    actions.push(value)
  }
  return actions.join('')
}

function selectDictLabels(datas, value, separator) {
  if (value === undefined || value.length === 0) {
    return ''
  }
  if (!Array.isArray(value)) {
    value = [value]
  }
  separator = separator || ','
  let actions = []
  Object.keys(value).some((key) => {
    Object.keys(datas).some((dictKey) => {
      if (datas[dictKey].value == ('' + value[key])) {
        actions.push(datas[dictKey].label)
      }
    })
  })
  if (actions.length === 0) {
    actions = value
  }
  return actions.join(separator)
}

// 模拟useDict函数
function useDict(...args) {
  console.warn('useDict函数未实现')
  return args.map(() => ({
    loading: false,
    options: []
  }))
}

// 模拟getConfigKey函数
function getConfigKey(key) {
  console.warn('getConfigKey函数未实现')
  return Promise.resolve('')
}

// 分页组件
import Pagination from '@/components/Pagination'
// 自定义表格工具组件
import RightToolbar from '@/components/RightToolbar'

const app = createApp(App)

// 全局方法挂载
app.config.globalProperties.useDict = useDict
app.config.globalProperties.download = download
app.config.globalProperties.parseTime = parseTime
app.config.globalProperties.resetForm = resetForm
app.config.globalProperties.handleTree = handleTree
app.config.globalProperties.addDateRange = addDateRange
app.config.globalProperties.getConfigKey = getConfigKey
app.config.globalProperties.selectDictLabel = selectDictLabel
app.config.globalProperties.selectDictLabels = selectDictLabels

// 全局组件挂载
app.component('Pagination', Pagination)
app.component('RightToolbar', RightToolbar)

app.use(router)
app.use(store)
app.use(plugins)
app.use(elementIcons)
app.component('svg-icon', SvgIcon)

directive(app)

// 使用element-plus 并且设置全局的大小
app.use(ElementPlus, {
  locale: locale,
  // 支持 large、default、small
  size: Cookies.get('size') || 'default'
})

app.mount('#app')
