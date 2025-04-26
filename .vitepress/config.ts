import { defineConfig } from 'vitepress'
import { sidebarConfig } from './sidebar.js'

export default defineConfig({
  title: '无畏小生',
  description: '',
  head: [['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }]],
  themeConfig: {
    logo: '/favicon.svg',
    nav: [
      { text: 'Java', link: '/java/泛型擦除和重载之间的冲突' },
      { text: '前端', link: '/javascript/Javascript Date 常用方法' },
      { text: '算法', link: '/algorithm/KMP 字符串快速匹配' },
      { text: '工具', link: '/rust/Rust 安装' },
    ],
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
    outline: { level: [2, 4], label: '页面导航' },
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
