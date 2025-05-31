import { defineConfig } from 'vitepress'
import { withSidebar } from 'vitepress-sidebar'

const navConfig: any[] = [
  { text: 'Java', link: '/docs/Java/基础/语法知识点' },
  { text: '前端', link: '/docs/前端/JavaScript/Javascript Date 常用方法' },
  { text: '算法', link: '/docs/算法/KMP 字符串快速匹配' },
  { text: '编程基础', link: '/docs/编程基础/工具/Git 速查手册' },
]

const sidebarOptions: any[] = [
  { documentRootPath: '/docs', scanStartPath: 'Java', resolvePath: '/docs/Java/', collapsed: false },
  { documentRootPath: '/docs', scanStartPath: '前端', resolvePath: '/docs/前端/', collapsed: false },
  { documentRootPath: '/docs', scanStartPath: '算法', resolvePath: '/docs/算法/', collapsed: false },
  { documentRootPath: '/docs', scanStartPath: '编程基础', resolvePath: '/docs/编程基础/', collapsed: false },
]

const searchConfig: any = {
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
          button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
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
}

export default withSidebar(
  defineConfig({
    title: '无畏小生',
    description: '',
    head: [['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }]],
    themeConfig: {
      logo: '/favicon.svg',
      nav: navConfig,
      socialLinks: [{ icon: 'github', link: 'https://github.com/wxiach/notebook' }],
      search: searchConfig,
      outline: { level: [2, 4], label: '页面导航' },
      lastUpdated: { text: '最后更新于' },
      docFooter: { prev: '上一页', next: '下一页' },
      notFound: {
        title: '页面未找到',
        quote: '若你不改变航向，始终凝望远方，你终将抵达前行的彼岸。',
        linkLabel: '返回首页',
        linkText: '返回首页',
      },
    },
    markdown: { lineNumbers: true, image: { lazyLoading: true } },
  }),
  sidebarOptions
)
