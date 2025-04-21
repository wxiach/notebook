export const sidebarConfig = {
  '/Java/': [
    {
      text: '语法',
      items: [{ text: '泛型擦除和重载之间的冲突', link: '/Java/泛型擦除和重载之间的冲突' }],
      collapsed: false,
    },
    {
      text: '常用库',
      items: [
        { text: '如何使用 SLF4J 日志框架', link: '/Java/如何使用 SLF4J 日志框架' },
        {
          text: 'CGLIB 在 Java 21 下报 NoClassDefFoundError 的排查与解决',
          link: '/Java/CGLIB 在 Java 21 下报 NoClassDefFoundError 的排查与解决',
        },
        { text: 'JDK 与 CGLIB 动态代理最小示例笔记', link: '/Java/JDK 与 CGLIB 动态代理最小示例笔记' },
      ],
      collapsed: false,
    },
  ],
  '/Java Concurrency/': [
    {
      text: '基础概念',
      items: [
        { text: '多线程基础概念', link: '/Java Concurrency/多线程基础概念' },
        { text: '线程安全问题', link: '/Java Concurrency/线程安全问题' },
      ],
      collapsed: false,
    },
    {
      text: '常用写法',
      items: [{ text: '如何优雅的终止线程', link: '/Java Concurrency/如何优雅的终止线程' }],
      collapsed: false,
    },
  ],
  '/Web Server/': [
    {
      text: 'Tomcat',
      items: [
        { text: '简单理解Tomcat的各个组件', link: '/Web Server/Tomcat/简单理解Tomcat的各个组件' },
        { text: 'Tomcat生命周期管理', link: '/Web Server/Tomcat/Tomcat生命周期管理' },
        { text: 'Tomcat自定义类加载器', link: '/Web Server/Tomcat/Tomcat自定义类加载器' },
      ],
      collapsed: false,
    },
    {
      text: 'Netty',
      items: [
        { text: 'ChannelInboundHandler', link: '/Web Server/Netty/ChannelInboundHandler' },
        { text: 'Overview', link: '/Web Server/Netty/Overview' },
      ],
      collapsed: false,
    },
  ],
  '/Spring Notes/': [
    {
      text: 'Spring',
      items: [
        { text: '导读', link: '/Spring Notes/Spring/导读' },
        { text: 'Spring 容器刷新流程', link: '/Spring Notes/Spring/Spring 容器刷新流程' },
        { text: '容器启动流程', link: '/Spring Notes/Spring/容器启动流程' },
        { text: '组件注册', link: '/Spring Notes/Spring/组件注册' },
        { text: 'SpringMVC 初始化流程', link: '/Spring Notes/Spring/SpringMVC 初始化流程' },
      ],
      collapsed: false,
    },
    {
      text: 'SpringBoot',
      items: [{ text: '分析SpringBoot 启动流程', link: '/Spring Notes/SpringBoot/分析SpringBoot 启动流程' }],
      collapsed: false,
    },
  ],

  '/Javascript/': [
    {
      text: 'Javascript',
      items: [{ text: 'Javascript Date 常用方法', link: '/Javascript/Javascript Date 常用方法' }],
      collapsed: true,
    },
  ],

  '/React/': [
    {
      text: 'React 基础',
      items: [
        { text: 'React 列表渲染', link: '/React/React 列表渲染' },
        { text: 'React 事件处理', link: '/React/React 事件处理' },
        { text: 'React 受控表单绑定', link: '/React/React 受控表单绑定' },
        {
          text: 'React 获取 DOM：useRef 操作非受控组件',
          link: '/React/React 获取 DOM：useRef 操作非受控组件',
        },
        {
          text: 'React 组件通信方式',
          link: '/React/React 组件通信方式',
        },
        {
          text: 'React useEffect：副作用管理',
          link: '/React/React useEffect：副作用管理',
        },
        {
          text: 'React 自定义 Hook：抽象与复用',
          link: '/React/React 自定义 Hook：抽象与复用',
        },
        { text: 'React 路由导航配置', link: '/React/React 路由导航配置' },
      ],
      collapsed: false,
    },
    {
      text: '状态管理',
      items: [
        {
          text: '用 React 自带能力实现全局状态管理与持久化共享',
          link: '/React/用 React 自带能力实现全局状态管理与持久化共享',
        },
        {
          text: 'Redux 学习记录：从简单计数器到 React 集成',
          link: '/React/Redux 学习记录：从简单计数器到 React 集成',
        },
      ],
      collapsed: false,
    },
  ],

  '/Algorithm/': [
    {
      text: '算法',
      items: [{ text: 'KMP 字符串快速匹配', link: '/Algorithm/KMP 字符串快速匹配' }],
      collapsed: true,
    },
  ],

  '/Network/': [
    {
      text: '计算机网络',
      items: [{ text: '同源策略', link: '/Network/同源策略' }],
      collapsed: true,
    },
  ],

  '/Development Tools/': [
    {
      text: '编程工具',
      items: [
        { text: 'Git 速查手册', link: '/Development Tools/Git 速查手册' },
        {
          text: 'Gradle 使用误区：从本地安装到 Wrapper',
          link: '/Development Tools/Gradle 使用误区：从本地安装到 Wrapper',
        },
      ],
      collapsed: true,
    },
  ],

  '/Rust/': [
    {
      text: 'Rust',
      items: [{ text: 'Rust 安装', link: '/Rust/Rust 安装' }],
      collapsed: true,
    },
  ],
}
