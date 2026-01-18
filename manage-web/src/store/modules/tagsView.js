import { defineStore } from 'pinia'

// 从本地存储获取标签状态
function getVisitedViewsFromStorage() {
  try {
    const stored = localStorage.getItem('visitedViews')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to get visitedViews from localStorage:', e)
  }
  return []
}

// 保存标签状态到本地存储
function saveVisitedViewsToStorage(views) {
  try {
    localStorage.setItem('visitedViews', JSON.stringify(views))
  } catch (e) {
    console.error('Failed to save visitedViews to localStorage:', e)
  }
}

const useTagsViewStore = defineStore(
  'tags-view',
  {
    state: () => ({
      visitedViews: getVisitedViewsFromStorage(),
      cachedViews: [],
      iframeViews: []
    }),
    watch: {
      // 监听visitedViews变化，自动保存到本地存储
      visitedViews: {
        handler(newVal) {
          saveVisitedViewsToStorage(newVal)
        },
        deep: true
      }
    },
    actions: {
      addView(view) {
        // 确保 view 对象包含所有必要信息
        if (!view || !view.path) return
        
        // 确保使用完整的 view 对象，包含 name 属性
        const fullView = {
          ...view,
          name: view.name || view.path
        }
        
        this.addVisitedView(fullView)
        this.addCachedView(fullView)
      },
      addIframeView(view) {
        if (this.iframeViews.some(v => v.path === view.path)) return
        this.iframeViews.push(
          Object.assign({}, view, {
            title: view.meta.title || 'no-name'
          })
        )
      },
      addVisitedView(view) {
        // 确保 view 对象有效
        if (!view || !view.path) return
        
        // 标准化路径：将空路径、/和/index统一处理为/index
        const normalizedPath = (view.path === '' || view.path === '/' || view.path === '/index') ? '/index' : view.path;
        const normalizedFullPath = (view.fullPath === '' || view.fullPath === '/' || view.fullPath === '/index') ? '/index' : (view.fullPath || view.path);
        
        // 检查是否已存在相同路径的标签页（包括不同表示形式的首页）
        const isDuplicate = this.visitedViews.some(existingView => {
          // 标准化现有标签的路径
          const existingNormalizedPath = (existingView.path === '' || existingView.path === '/' || existingView.path === '/index') ? '/index' : existingView.path;
          const existingNormalizedFullPath = (existingView.fullPath === '' || existingView.fullPath === '/' || existingView.fullPath === '/index') ? '/index' : (existingView.fullPath || existingView.path);
          
          // 检查路径是否匹配
          return existingNormalizedPath === normalizedPath || 
                 existingNormalizedFullPath === normalizedFullPath ||
                 existingNormalizedPath === normalizedFullPath ||
                 existingNormalizedFullPath === normalizedPath;
        });
        
        // 如果是重复标签，直接返回，不添加
        if (isDuplicate) {
          return;
        }
        
        // 标准化最终路径，避免后续匹配问题
        const finalPath = normalizedPath;
        const finalFullPath = normalizedFullPath;
        
        // 添加新标签
        this.visitedViews.push(
          Object.assign({}, view, {
            title: view.meta.title || 'no-name',
            path: finalPath,
            fullPath: finalFullPath
          })
        );
      },
      addCachedView(view) {
        if (this.cachedViews.includes(view.name)) return
        if (!view.meta.noCache) {
          this.cachedViews.push(view.name)
        }
      },
      delView(view) {
        return new Promise(resolve => {
          this.delVisitedView(view)
          this.delCachedView(view)
          resolve({
            visitedViews: [...this.visitedViews],
            cachedViews: [...this.cachedViews]
          })
        })
      },
      delVisitedView(view) {
        return new Promise(resolve => {
          for (const [i, v] of this.visitedViews.entries()) {
            if (v.path === view.path) {
              this.visitedViews.splice(i, 1)
              break
            }
          }
          this.iframeViews = this.iframeViews.filter(item => item.path !== view.path)
          resolve([...this.visitedViews])
        })
      },
      delIframeView(view) {
        return new Promise(resolve => {
          this.iframeViews = this.iframeViews.filter(item => item.path !== view.path)
          resolve([...this.iframeViews])
        })
      },
      delCachedView(view) {
        return new Promise(resolve => {
          const index = this.cachedViews.indexOf(view.name)
          index > -1 && this.cachedViews.splice(index, 1)
          resolve([...this.cachedViews])
        })
      },
      delOthersViews(view) {
        return new Promise(resolve => {
          this.delOthersVisitedViews(view)
          this.delOthersCachedViews(view)
          resolve({
            visitedViews: [...this.visitedViews],
            cachedViews: [...this.cachedViews]
          })
        })
      },
      delOthersVisitedViews(view) {
        return new Promise(resolve => {
          this.visitedViews = this.visitedViews.filter(v => {
            return v.meta.affix || v.path === view.path
          })
          this.iframeViews = this.iframeViews.filter(item => item.path === view.path)
          resolve([...this.visitedViews])
        })
      },
      delOthersCachedViews(view) {
        return new Promise(resolve => {
          const index = this.cachedViews.indexOf(view.name)
          if (index > -1) {
            this.cachedViews = this.cachedViews.slice(index, index + 1)
          } else {
            this.cachedViews = []
          }
          resolve([...this.cachedViews])
        })
      },
      delAllViews(view) {
        return new Promise(resolve => {
          this.delAllVisitedViews(view)
          this.delAllCachedViews(view)
          resolve({
            visitedViews: [...this.visitedViews],
            cachedViews: [...this.cachedViews]
          })
        })
      },
      delAllVisitedViews(view) {
        return new Promise(resolve => {
          const affixTags = this.visitedViews.filter(tag => tag.meta.affix)
          this.visitedViews = affixTags
          this.iframeViews = []
          resolve([...this.visitedViews])
        })
      },
      delAllCachedViews(view) {
        return new Promise(resolve => {
          this.cachedViews = []
          resolve([...this.cachedViews])
        })
      },
      updateVisitedView(view) {
        const index = this.visitedViews.findIndex(v => v.path === view.path)
        if (index > -1) {
          this.visitedViews[index] = Object.assign({}, this.visitedViews[index], view)
        }
      },
      delRightTags(view) {
        return new Promise(resolve => {
          const index = this.visitedViews.findIndex(v => v.path === view.path)
          if (index === -1) {
            return
          }
          this.visitedViews = this.visitedViews.filter((item, idx) => {
            if (idx <= index || (item.meta && item.meta.affix)) {
              return true
            }
            const i = this.cachedViews.indexOf(item.name)
            if (i > -1) {
              this.cachedViews.splice(i, 1)
            }
            if(item.meta.link) {
              const fi = this.iframeViews.findIndex(v => v.path === item.path)
              this.iframeViews.splice(fi, 1)
            }
            return false
          })
          resolve([...this.visitedViews])
        })
      },
      delLeftTags(view) {
        return new Promise(resolve => {
          const index = this.visitedViews.findIndex(v => v.path === view.path)
          if (index === -1) {
            return
          }
          this.visitedViews = this.visitedViews.filter((item, idx) => {
            if (idx >= index || (item.meta && item.meta.affix)) {
              return true
            }
            const i = this.cachedViews.indexOf(item.name)
            if (i > -1) {
              this.cachedViews.splice(i, 1)
            }
            if(item.meta.link) {
              const fi = this.iframeViews.findIndex(v => v.path === item.path)
              this.iframeViews.splice(fi, 1)
            }
            return false
          })
          resolve([...this.visitedViews])
        })
      }
    }
  })

export default useTagsViewStore
