# 用 React 自带能力实现全局状态管理与持久化共享

这篇文章整理了我使用 React 自带的 Hook 和浏览器原生能力，实现全局状态共享与持久化的一些方法。从 useState 到 useContext，再到 localStorage 和 BroadcastChannel，按需组合即可覆盖常见的状态管理场景。

## 1. useState：组件内部状态

最基础的状态管理方式是 `useState`，适合只在一个组件内使用的简单场景。

```js
const [count, setCount] = useState(0)
```

但 `useState` 无法跨组件共享，一刷新页面状态也会丢。

## 2. useReducer：集中管理状态逻辑

当状态结构变复杂，比如有多个字段、不同修改方式时，用 `useReducer` 会更清晰。

```js
// reducer 函数负责根据 action 描述的意图，生成新的不可变状态
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      // 不直接修改 state，而是返回新对象，符合不可变性原则
      return { ...state, count: state.count + 1 }
    case 'decrement':
      return { ...state, count: state.count - 1 }
    default:
      return state // 保持默认行为，确保 reducer 是纯函数
  }
}

// useReducer 接收 reducer 和初始值，返回状态和 dispatch 方法
const [state, dispatch] = useReducer(reducer, { count: 0 })
```

相比 `useState`，`useReducer` 把修改逻辑集中到一个函数里，更规范，也方便后期维护。

## 3. useContext：跨组件共享状态

`useReducer` 管理了状态，如果还希望在多个组件之间共享，就可以用 `useContext` 来“提供”这个状态。

### 3.1 创建 context 和 provider

```js
// 创建全局上下文对象，后续通过 useContext 访问它
const GlobalContext = createContext()

function GlobalProvider({ children }) {
  // 使用 useReducer 统一管理全局状态
  const [state, dispatch] = useReducer(reducer, { count: 0 })

  // 将状态和 dispatch 封装进 Provider 向下传递
  return <GlobalContext.Provider value={{ state, dispatch }}>{children}</GlobalContext.Provider>
}
```

### 3.2 在组件中使用

```js
function Counter() {
  // 使用 useContext 获取当前上下文中的 state 和 dispatch
  const { state, dispatch } = useContext(GlobalContext)
  return (
    <>
      <p>{state.count}</p>
      {/* 派发一个 increment 动作，触发 reducer 中定义的逻辑 */}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
    </>
  )
}
```

### 3.3 在最外层包裹组件树

```js
// 必须在应用的根组件外包裹 Provider 才能让子组件访问到上下文
<GlobalProvider>
  <App />
</GlobalProvider>
```

这样就实现了组件之间的状态共享，逻辑也很清晰。

## 4. localStorage：刷新后状态不丢

到目前为止，状态共享已经实现了。但只要一刷新页面，状态还是会丢失。这时可以用 localStorage 来做持久化。

### 4.1 初始化时读取

```js
// 初始化函数：首次加载组件时尝试从 localStorage 读取已保存的状态
const init = () => {
  const stored = localStorage.getItem('globalState')
  // 如果有持久化数据则使用，否则回退到默认初始值
  return stored ? JSON.parse(stored) : { count: 0 }
}

// useReducer 的第三个参数支持懒初始化，只有第一次渲染时才会调用 init 函数
const [state, dispatch] = useReducer(reducer, null, init)
```

### 4.2 状态更新时写入

```js
// 每当状态变更时，同步写入 localStorage，实现刷新后恢复状态的能力
useEffect(() => {
  localStorage.setItem('globalState', JSON.stringify(state))
}, [state])
```

这样就实现了“刷新不丢状态”。

## 5. sessionStorage：只在当前页面保留

如果希望状态**只在当前标签页内有效**，可以把 localStorage 替换成 sessionStorage。

使用方式一样，只是换了 API：

```js
sessionStorage.setItem(...)
sessionStorage.getItem(...)
```

这种方式适合“短生命周期”的数据，比如临时缓存、不登录不持久。

## 6. storage 事件：多标签页同步（被动）

localStorage 本身不能自动同步状态，但浏览器提供了 `storage` 事件，可以监听其他标签页的改动。

```js
// 使用 storage 事件监听其他标签页对 localStorage 的修改，实现被动同步
useEffect(() => {
  const handler = (e) => {
    if (e.key === 'globalState') {
      const newState = JSON.parse(e.newValue)
      // 将新状态同步到当前页面，通常需 reducer 支持此类型
      dispatch({ type: 'sync_from_storage', payload: newState })
    }
  }

  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}, [])
```

`storage` 事件只会在其他标签页修改 localStorage 时触发，所以我们需要在当前页面监听它，并通过 dispatch 手动同步状态。

> 其中的 `sync_from_channel` 是一个标识，你可以根据业务起别的名字，比如 `'merge_state'` 或 `'sync_user'` 等。

## 7. BroadcastChannel：多标签页同步（主动）

BroadcastChannel 是浏览器提供的一个通信通道，适合做“主动广播”。比 `storage` 更灵活。

### 7.1 初始化频道

```js
const channel = new BroadcastChannel('my-global-channel')
```

这个名字要一致，才能互相通信。每个页面都得写这一句，才能互相“收发”。

### 7.2 发送同步消息

```js
// 每当状态变化时，通过 BroadcastChannel 主动广播给所有打开的标签页
useEffect(() => {
  channel.postMessage(state)
}, [state])
```

### 7.3 接收其他标签页的更新

```js
// 监听来自 BroadcastChannel 的消息，接收到后更新本页状态
useEffect(() => {
  channel.onmessage = (e) => {
    dispatch({ type: 'sync_from_channel', payload: e.data })
  }
  return () => channel.close()
}, [])
```

BroadcastChannel 支持任意数据结构，适合做复杂的同步协作。

### 7.4 实现持久化

BroadcastChannel 只负责同步，它不具备存储能力。如果希望状态在刷新后还能保留，就还需要配合 `localStorage`

```js
useEffect(() => {
  channel.postMessage(state)
  localStorage.setItem('globalState', JSON.stringify(state))
}, [state])
```

并在初始化时从 localStorage 读取：

```js
const init = () => {
  const stored = localStorage.getItem('globalState')
  return stored ? JSON.parse(stored) : { count: 0 }
}
```

## 总结

我们可以通过 React 自带的 Hook + 浏览器的存储和通信能力，搭出一套完整的状态管理方案。包括：

- `useReducer` 管状态逻辑；
- `useContext` 实现共享；
- `localStorage` 做持久化；
- `storage` 或 `BroadcastChannel` 实现跨标签页同步。

用下来感觉非常灵活，也更容易掌控。
