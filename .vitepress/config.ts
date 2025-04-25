import { defineConfig } from 'vitepress'
import { sidebarConfig } from './sidebar.js'
import { navConfig } from './nav.js'

export default defineConfig({
  title: "SorenWei's Notes",
  description: '',
  head: [['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }]],
  themeConfig: {
    logo: '/favicon.svg',
    nav: navConfig,
    socialLinks: [{ icon: 'github', link: 'https://github.com/wxiach/notebook' }],
    sidebar: sidebarConfig,
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          searchOptions: {
            boost: { title: 5, text: 2, titles: 1 },
            fuzzy: 0.3,
          },
        },
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索',
                buttonAriaLabel: '搜索',
              },
              modal: {
                displayDetails: '显示详细列表',
                resetButtonTitle: '重置搜索',
                backButtonTitle: '关闭搜索',
                noResultsText: '没有结果',
                footer: {
                  selectText: '选择',
                  selectKeyAriaLabel: '输入',
                  navigateText: '导航',
                  navigateUpKeyAriaLabel: '上箭头',
                  navigateDownKeyAriaLabel: '下箭头',
                  closeText: '关闭',
                  closeKeyAriaLabel: 'esc',
                },
              },
            },
          },
        },
      },
    },
    outline: { level: [2, 3], label: '页面导航' },
    lastUpdated: {
      text: '最后更新于',
    },
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
  },
  markdown: {
    lineNumbers: true,
    image: {
      lazyLoading: true,
    },
  },
  vite: {
    publicDir: '.vitepress/public',
  },
})
