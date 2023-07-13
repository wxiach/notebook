import { defineConfig } from 'vitepress'
import { sidebarConfig } from './sidebar.js'
import { navConfig } from './nav.js'

export default defineConfig({
  title: 'Soren Wei - Notes',
  description: '',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  themeConfig: {
    logo: '/logo.png',
    nav: navConfig,
    sidebar: sidebarConfig,
    search: { provider: 'local' },
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
    lineNumbers: true, // Enable line numbers for code blocks
  },
})
