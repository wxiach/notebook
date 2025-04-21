# React 路由导航配置

在 Web 应用中，前端路由的作用非常重要。它是指将用户在浏览器地址栏输入的 URL 和页面上渲染的组件之间建立联系的机制。React Router 是一个非常流行的前端路由库，它帮助我们在不刷新页面的情况下，在不同的页面之间进行跳转。今天，我将根据自己的学习，深入讲解一下 React 路由的使用及其原理。

## 什么是前端路由？

前端路由的本质是将浏览器中的 URL 与组件的渲染绑定。当用户在浏览器的地址栏输入一个 URL 时，React Router 会根据这个 URL 找到对应的组件并将其渲染到页面上。这种方式称为路由导航，它是现代单页应用（SPA）的核心。

### 路由和组件的关系

在前端路由中，每一个路由路径（path）都会对应一个组件。当我们访问某个路径时，React Router 会渲染与该路径匹配的组件。

举个例子，我们可以定义一个简单的路由配置：

```jsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <div>Hello world!</div>,
  },
])

;<RouterProvider router={router} />
```

在这个例子中，当我们访问根路径 `/` 时，会渲染一个包含 “Hello world!” 的 `div` 元素。

## 路由导航的方式

React Router 提供了几种不同的方式来进行路由导航，分别是声明式导航和编程式导航。

### 1. 声明式导航

声明式导航是指我们在 JSX 中使用 `<Link />` 组件来定义跳转链接。这样可以很自然地将页面的跳转集成到 UI 中，适合用于菜单、列表等交互元素。

```jsx
<Link to="/article">文章</Link>
```

`<Link />` 组件的 `to` 属性定义了要跳转的路径。当用户点击这个链接时，React Router 会自动根据路径找到对应的组件并渲染。

### 2. 编程式导航

编程式导航则是在业务逻辑中动态地控制路由跳转。我们可以通过 `useNavigate()` 钩子来获取一个 `navigate` 方法，调用该方法实现页面跳转。这种方式适合用于用户行为触发的路由跳转，比如用户登录后自动跳转到某个页面。

```jsx
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const navigate = useNavigate()

  return (
    <div>
      <p>我是登录页</p>
      <button onClick={() => navigate('/article')}>跳转至文章</button>
    </div>
  )
}
```

在这个例子中，当用户点击“跳转至文章”按钮时，页面会跳转到 `/article` 路径。

## 路由参数传递

有时候，我们需要在路由跳转时携带一些参数，比如文章的 ID 或搜索关键词。React Router 提供了两种方式来传递参数：通过 `searchParams` 和 `params`。

### 1. searchParams 传参

`searchParams` 是通过 URL 查询字符串来传递参数。例如：`/article?id=1001&name=jack`。

```jsx
// 进行跳转
navigate('/article?id=1001&name=jack')

// 获取参数
const [params] = useSearchParams()
let id = params.get('id')
```

这种方式适合传递较为简单的参数，通常用于查询或筛选条件。

### 2. params 传参

`params` 则是通过 URL 路径中的动态部分来传递参数。例如：`/article/1001`。

```jsx
// 进行跳转
navigate('/article/1001')

// 获取参数
const params = useParams()
let id = params.id
```

这种方式适合传递页面的 ID 或其他关键标识符，通常用于访问单个资源的详情页。

## 嵌套路由与布局

React Router 支持嵌套路由的配置，这意味着我们可以在父路由组件中嵌套子路由，并在渲染父组件时显示子组件。我们可以通过 `children` 或 `<Outlet />` 来实现路由的嵌套。

### 使用 children 配置嵌套路由

```jsx
{
  path: '/',
  element: <Layout />,
  children: [
    { path: 'board', element: <Board /> },
    { path: 'about', element: <About /> },
  ],
}
```

在这个配置中，`Layout` 组件作为父组件，包含两个子路由 `board` 和 `about`。这些子路由会根据路径在父组件的 `<Outlet />` 中渲染。

```jsx
// Layout 组件中
<Outlet /> // 用于渲染子路由
```

通过这种方式，我们可以方便地实现多层嵌套的页面布局，尤其适合后台管理系统。

## 默认路由

默认路由用于当用户访问一个父路径时，自动跳转到其子路径。这样可以确保当用户访问某个页面时，不会感到空白或缺少内容。

例如，当用户访问 `/` 路径时，我们可以自动将其重定向到 `/home`：

```jsx
{
  path: '/',
  element: <Layout />,
  children: [
    { index: true, element: <Home /> }, // 默认子路由
    { path: 'about', element: <About /> },
  ],
}
```

在上面的例子中，`{ index: true, element: <Home /> }` 表示当用户访问 `/` 时，默认渲染 `Home` 组件，而不是显示空白。

## 404 路由

为了增强用户体验，当用户访问一个不存在的 URL 时，我们通常会显示一个 404 页面。在 React Router 中，我们可以通过配置一个通配符路径 `*` 来捕获所有未匹配的路径，并渲染一个 `NotFound` 组件。

```jsx
{
  path: '*',
  element: <NotFound />,
}
```

这样，无论用户输入什么路径，如果没有匹配到任何路由，都会显示 404 页面。

## 路由模式：`history` vs `hash`

React Router 支持两种路由模式：`history` 模式和 `hash` 模式。

| 路由模式 | URL 表现 | 底层原理                | 是否需要后端支持 |
| -------- | -------- | ----------------------- | ---------------- |
| history  | /login   | `history` + `pushState` | ✅ 需要          |
| hash     | /#/login | 监听 `hashChange` 事件  | ❌ 不需要        |

- `history` 模式使用 `pushState` 来管理浏览器历史记录，适合现代 SPA，URL 看起来干净且符合 SEO 要求，但需要服务器配置支持。
- `hash` 模式使用 URL 的 `#` 字符，适合静态站点，因为不需要服务器端支持，但 URL 显得较为丑陋。

## 总结

通过这篇文章，我整理了 React 路由的一些基本概念和用法。React 路由帮助我们在单页应用中实现页面间的切换，它提供了声明式导航和编程式导航两种方式，方便开发者根据实际需求选择合适的方式。同时，路由参数传递、嵌套路由的使用以及 404 路由的配置，都是实现复杂 Web 应用时常见的需求。

掌握这些基础内容之后，我们可以更加灵活地构建和管理前端路由，使得应用的导航更加流畅和高效。
