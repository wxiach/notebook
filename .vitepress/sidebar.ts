export const sidebarConfig = {
  '/java/': [
    {
      text: '语法',
      items: [{ text: '泛型擦除和重载之间的冲突', link: '/java/泛型擦除和重载之间的冲突' }],
      collapsed: false,
    },
    {
      text: '常用库',
      items: [
        { text: '如何使用 SLF4J 日志框架', link: '/java/如何使用 SLF4J 日志框架' },
        {
          text: 'CGLIB 在 Java 21 下报 NoClassDefFoundError 的排查与解决',
          link: '/java/CGLIB 在 Java 21 下报 NoClassDefFoundError 的排查与解决',
        },
        { text: 'JDK 与 CGLIB 动态代理最小示例笔记', link: '/java/JDK 与 CGLIB 动态代理最小示例笔记' },
      ],
      collapsed: false,
    },
  ],
  '/java concurrency/': [
    {
      text: '基础概念',
      items: [
        { text: '多线程基础概念', link: '/java concurrency/多线程基础概念' },
        { text: '线程安全问题', link: '/java concurrency/线程安全问题' },
      ],
      collapsed: false,
    },
    {
      text: '常用写法',
      items: [{ text: '如何优雅的终止线程', link: '/java concurrency/如何优雅的终止线程' }],
      collapsed: false,
    },
  ],
  '/web server/': [
    {
      text: 'Tomcat',
      items: [
        { text: '简单理解Tomcat的各个组件', link: '/web server/Tomcat/简单理解Tomcat的各个组件' },
        { text: 'Tomcat生命周期管理', link: '/web server/Tomcat/Tomcat生命周期管理' },
        { text: 'Tomcat自定义类加载器', link: '/web server/Tomcat/Tomcat自定义类加载器' },
      ],
      collapsed: false,
    },
    {
      text: 'Netty',
      items: [
        { text: 'ChannelInboundHandler', link: '/web server/Netty/ChannelInboundHandler' },
        { text: 'Overview', link: '/web server/Netty/Overview' },
      ],
      collapsed: false,
    },
  ],
  '/spring notes/': [
    {
      text: 'Spring',
      items: [
        { text: '导读', link: '/spring notes/Spring/导读' },
        { text: 'Spring 容器刷新流程', link: '/spring notes/Spring/Spring 容器刷新流程' },
        { text: '容器启动流程', link: '/spring notes/Spring/容器启动流程' },
        { text: '组件注册', link: '/spring notes/Spring/组件注册' },
        { text: 'SpringMVC 初始化流程', link: '/spring notes/Spring/SpringMVC 初始化流程' },
      ],
      collapsed: false,
    },
    {
      text: 'SpringBoot',
      items: [{ text: '分析SpringBoot 启动流程', link: '/spring notes/SpringBoot/分析SpringBoot 启动流程' }],
      collapsed: false,
    },
  ],

  '/javascript/': [
    {
      text: 'Javascript',
      items: [{ text: 'Javascript Date 常用方法', link: '/javascript/Javascript Date 常用方法' }],
      collapsed: true,
    },
  ],

  '/react/': [
    {
      text: 'React 基础',
      items: [
        { text: 'React 列表渲染', link: '/react/React 列表渲染' },
        { text: 'React 事件处理', link: '/react/React 事件处理' },
        { text: 'React 受控表单绑定', link: '/react/React 受控表单绑定' },
        {
          text: 'React 获取 DOM：useRef 操作非受控组件',
          link: '/react/React 获取 DOM：useRef 操作非受控组件',
        },
        {
          text: 'React 组件通信方式',
          link: '/react/React 组件通信方式',
        },
        {
          text: 'React useEffect：副作用管理',
          link: '/react/React useEffect：副作用管理',
        },
        {
          text: 'React 自定义 Hook：抽象与复用',
          link: '/react/React 自定义 Hook：抽象与复用',
        },
        { text: 'React 路由导航配置', link: '/react/React 路由导航配置' },
      ],
      collapsed: false,
    },
    {
      text: '状态管理',
      items: [
        {
          text: '用 React 自带能力实现全局状态管理与持久化共享',
          link: '/react/用 React 自带能力实现全局状态管理与持久化共享',
        },
        {
          text: 'Redux 学习记录：从简单计数器到 React 集成',
          link: '/react/Redux 学习记录：从简单计数器到 React 集成',
        },
      ],
      collapsed: false,
    },
  ],

  '/algorithm/': [
    {
      text: '算法',
      items: [{ text: 'KMP 字符串快速匹配', link: '/algorithm/KMP 字符串快速匹配' }],
      collapsed: true,
    },
  ],

  '/network/': [
    {
      text: '计算机网络',
      items: [{ text: '同源策略', link: '/network/同源策略' }],
      collapsed: true,
    },
  ],
  '/design pattern/': [
    {
      text: '设计模式',
      items: [{ text: '观察者模式到事件总线', link: '/design pattern/观察者模式到事件总线' }],
      collapsed: true,
    },
  ],

  '/development tools/': [
    {
      text: '编程工具',
      items: [
        { text: 'Git 速查手册', link: '/development tools/Git 速查手册' },
        {
          text: 'Gradle 使用误区：从本地安装到 Wrapper',
          link: '/development tools/Gradle 使用误区：从本地安装到 Wrapper',
        },
      ],
      collapsed: true,
    },
  ],

  '/rust/': [
    {
      text: 'Rust',
      items: [{ text: 'Rust 安装', link: '/rust/Rust 安装' }],
      collapsed: true,
    },
  ],
}
