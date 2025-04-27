import { defineConfig } from 'vitepress'
import { withSidebar } from 'vitepress-sidebar'

const navConfig: any[] = [
  { text: 'Javascript', link: '/javascript/' },
  { text: 'React', link: '/react/' },
  { text: 'Java', link: '/java/' },
  { text: 'Spring', link: '/spring/' },
  { text: 'Tomcat', link: '/tomcat/' },
  { text: 'Netty', link: '/netty/' },
  { text: '多线程', link: '/concurrent/基础/什么是多线程' },
  { text: '算法', link: '/algorithms/' },
  { text: '设计模式', link: '/patterns/' },
  { text: '工具', link: '/tools/' },
]

const sidebarOptions: any[] = [
  { documentRootPath: '/', scanStartPath: 'java', resolvePath: '/java/', collapsed: false },
  { documentRootPath: '/', scanStartPath: 'concurrent', resolvePath: '/concurrent/', collapsed: false },
  { documentRootPath: '/', scanStartPath: 'spring', resolvePath: '/spring/', collapsed: false },
  { documentRootPath: '/', scanStartPath: 'tomcat', resolvePath: '/tomcat/', collapsed: false },
  { documentRootPath: '/', scanStartPath: 'netty', resolvePath: '/netty/', collapsed: false },
  { documentRootPath: '/', scanStartPath: 'javascript', resolvePath: '/javascript/', collapsed: false },
  { documentRootPath: '/', scanStartPath: 'react', resolvePath: '/react/', collapsed: false },
  { documentRootPath: '/', scanStartPath: 'algorithms', resolvePath: '/algorithms/', collapsed: false },
  { documentRootPath: '/', scanStartPath: 'patterns', resolvePath: '/patterns/', collapsed: false },
  { documentRootPath: '/', scanStartPath: 'tools', resolvePath: '/tools/', collapsed: false },
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
