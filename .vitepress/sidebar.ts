export const sidebarConfig = {
  '/Java/': [
    {
      text: '语法',
      items: [{ text: '泛型擦除和重载的之间冲突', link: 'Java 基础知识/泛型擦除和重载之间的冲突' }],
      collapsed: false,
    },
    {
      text: '常用库',
      items: [{ text: '如何使用 SLF4J 日志框架', link: '/Java 基础知识/如何使用 SLF4J 日志框架' }],
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
        { text: '导读', link: '/Spring/SpringFramework/导读' },
        { text: '理解Spring容器刷新流程', link: '/Spring/SpringFramework/理解Spring容器刷新流程' },
        { text: '容器启动流程', link: '/Spring/SpringFramework/容器启动流程' },
        { text: '组件注册', link: '/Spring/SpringFramework/组件注册' },
        { text: '理解SpringMVC初始化流程', link: '/Spring/SpringMVC/理解SpringMVC初始化流程' },
      ],
      collapsed: false,
    },
    {
      text: 'SpringBoot',
      items: [{ text: '分析SpringBoot 启动流程', link: '/Spring/SpringBoot/分析SpringBoot 启动流程' }],
      collapsed: false,
    },
  ],

  '/Javascript/': [
    {
      text: 'Javascript',
      items: [{ text: 'Javascript中Date对象的常用用法', link: '/Javascript/Javascript中Date对象的常用用法' }],
      collapsed: true,
    },
  ],

  '/React/': [
    {
      text: 'React',
      items: [{ text: 'React 列表渲染基础示例', link: '/React/React 列表渲染基础示例' }],
      collapsed: true,
    },
  ],

  '/Algorithm/': [
    {
      text: '算法',
      items: [{ text: 'KMP 字符串快速匹配', link: '/算法/KMP 字符串快速匹配' }],
      collapsed: true,
    },
  ],

  '/Design Pattern/': [
    {
      text: '设计模式',
      items: [
        { text: '导读', link: '/设计模式/导读' },
        {
          text: '创建型模式',
          items: [
            { text: '抽象工厂', link: '/设计模式/创建型模式/抽象工厂' },
            { text: '单例', link: '/设计模式/创建型模式/单例' },
            { text: '工厂方法', link: '/设计模式/创建型模式/工厂方法' },
            { text: '生成器', link: '/设计模式/创建型模式/生成器' },
            { text: '原型', link: '/设计模式/创建型模式/原型' },
          ],
          collapsed: true,
        },
        {
          text: '结构型模式',
          items: [
            { text: '代理', link: '/设计模式/结构型模式/代理' },
            { text: '桥接', link: '/设计模式/结构型模式/桥接' },
            { text: '适配器', link: '/设计模式/结构型模式/适配器' },
            { text: '外观', link: '/设计模式/结构型模式/外观' },
            { text: '享元', link: '/设计模式/结构型模式/享元' },
            { text: '装饰', link: '/设计模式/结构型模式/装饰' },
            { text: '组合', link: '/设计模式/结构型模式/组合' },
          ],
          collapsed: true,
        },
        {
          text: '行为模式',
          items: [
            { text: '备忘录', link: '/设计模式/行为模式/备忘录' },
            { text: '策略', link: '/设计模式/行为模式/策略' },
            { text: '迭代器', link: '/设计模式/行为模式/迭代器' },
            { text: '访问者', link: '/设计模式/行为模式/访问者' },
            { text: '观察者', link: '/设计模式/行为模式/观察者' },
            { text: '命令', link: '/设计模式/行为模式/命令' },
            { text: '模版方法', link: '/设计模式/行为模式/模版方法' },
            { text: '责任链', link: '/设计模式/行为模式/责任链' },
            { text: '中介者', link: '/设计模式/行为模式/中介者' },
            { text: '状态', link: '/设计模式/行为模式/状态' },
          ],
          collapsed: true,
        },
      ],
      collapsed: true,
    },
  ],

  '/Network/': [
    {
      text: '计算机网络',
      items: [{ text: '计算机网络', link: '/计算机网络/计算机网络' }],
      collapsed: true,
    },
  ],

  '/Development Tools/': [
    {
      text: '编程工具',
      items: [{ text: 'Git', link: '/编程工具/Git' }],
      collapsed: true,
    },
  ],

  '/Rust/': [
    {
      text: 'Rust',
      items: [{ text: 'Rust 语言', link: '/Rust/Rust 语言' }],
      collapsed: true,
    },
  ],
}
