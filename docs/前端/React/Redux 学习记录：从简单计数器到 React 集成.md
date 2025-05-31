# Redux 学习记录：从简单计数器到 React 集成

> 这篇文章是我学习 Redux 的整理过程。从最基本的计数器入门，逐步过渡到 Redux Toolkit 和 React 结合使用。过程中我尽量把每一步的原理搞清楚，而不是只关注代码能不能跑起来。

## 1. 为什么要学 Redux

React 自带的 `useState` 和 `useReducer` 用起来很方便，大多数场景也够用。但是如果应用变得复杂，比如多个组件之间共享数据、某些状态需要跨页面使用，或者希望能统一管理、记录每一次状态变化，那就需要一个集中式的状态管理方案。

Redux 提供了一些基本原则：

- 所有状态保存在一个地方（Store）；
- 状态更新只能通过派发动作（dispatch）；
- 每一次更新都可以被记录和追踪。

这些规则虽然让使用 Redux 的流程变得更复杂一些，但带来的好处是数据的流向更清晰，也更容易调试。

## 2. 不依赖框架，先实现一个 Redux 计数器

我先写了一个不依赖任何框架的计数器。只用原生 JS 和 Redux 官方提供的库，主要是为了先理解 Redux 的工作流程。

```html
<body>
  <button id="decrement">-</button>
  <span id="count">0</span>
  <button id="increment">+</button>

  <script src="https://unpkg.com/redux@latest/dist/redux.min.js"></script>
  <script>
    // 1. 定义 reducer：根据当前 state 和 action 决定新的 state
    function reducer(state = { count: 0 }, action) {
      if (action.type === 'INCREMENT') return { count: state.count + 1 }
      if (action.type === 'DECREMENT') return { count: state.count - 1 }
      return state
    }

    // 2. 创建 store：内部会保存 state，并提供 dispatch 和 subscribe 方法
    const store = Redux.createStore(reducer)

    // 3. 监听状态变化：一旦 state 改变，就更新页面显示
    store.subscribe(() => {
      document.getElementById('count').innerText = store.getState().count
    })

    // 4. UI 绑定事件：点击按钮时派发对应的 action
    document.getElementById('increment').onclick = () => {
      store.dispatch({ type: 'INCREMENT' }) // dispatch 是触发更新的唯一方式
    }

    document.getElementById('decrement').onclick = () => {
      store.dispatch({ type: 'DECREMENT' })
    }
  </script>
</body>
```

这个例子很简单，但也足以说明 Redux 是怎么运作的：**状态保存在 store，动作通过 dispatch 派发，reducer 决定怎么修改状态。**

## 3. Redux 的设计思想

Redux 的核心目标是：把状态是怎么变的这件事，变得清楚、可控、可维护。

```plaintext
组件 → dispatch(action) → reducer → 更新状态 → 自动触发渲染
```

每一步都有明确的职责，状态的变化只能按照这个流程走，避免了随意修改带来的混乱。

### Store：状态集中存放的地方

Redux 会把所有状态放在一个 store 里，谁都可以读，但不能直接改，只能通过规定的流程更新。这样可以确保状态变化是有规律、可追踪的。

### Action：告诉系统你想做什么

你不能直接改状态，而要先发出一个 action，例如：

```js
{
  type: 'INCREMENT'
}
```

它只是一个描述“我想怎么改”的对象，不包含任何逻辑。这样做的目的是把“意图”和“执行”分离。

### Reducer：定义状态怎么变化

Reducer 是一个函数，接收当前状态和 action，根据 action 的类型返回一个新状态：

```js
function reducer(state, action) {
  if (action.type === 'INCREMENT') {
    return { count: state.count + 1 }
  }
  return state
}
```

Reducer 必须是纯函数，不能改原始状态，不能写副作用。这样状态变化就更容易测试和回溯。

### subscribe：状态变了之后触发更新

当状态发生变化时，Redux 会通知所有订阅者。React 项目里用的是 `react-redux` 提供的封装，自动帮我们完成这一步。

这些设计看起来有点绕，但目的是让数据变更更容易追踪。

## 4. Redux Toolkit 简化写法

Redux Toolkit（简称 RTK）是 Redux 官方推荐的使用方式。相比原生 Redux，它的主要优势是：代码更少，结构更集中，写起来更顺手。

### 使用 createSlice 定义模块

```js
// store/modules/counterStore.js
import { createSlice } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { count: 0 },
  reducers: {
    increment(state) {
      state.count += 1
    },
    decrement(state) {
      state.count -= 1
    },
  },
})

export const { increment, decrement } = counterSlice.actions
export default counterSlice.reducer
```

这段代码把状态、修改逻辑、action 一起定义在一个地方：

- 可以直接修改 state（底层由 immer 处理不可变性）
- 不用手写 action 类型或 action creator
- 模块结构清晰，容易维护

> immer 会把 state 包成一个代理对象，你修改的其实是草稿，最后由它生成一个新的不可变对象

### 使用 configureStore 创建全局 store

```js
// store/index.js
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './modules/counterStore'

const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
})

export default store
```

- 支持组合多个模块
- 内置了 DevTools 和 thunk，无需额外配置

### 小结

使用 Redux Toolkit 后，写 Redux 不再需要关注繁琐的类型声明和不可变数据管理，可以把注意力放在业务逻辑本身上。写法更自然，调试也更方便。

## 5. React 中使用 Redux

### 使用 Provider 注入 store

```jsx
import { Provider } from 'react-redux'
import store from './store'

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

### 获取 store 中的状态

```jsx
import { useSelector } from 'react-redux'

function Counter() {
  const count = useSelector((state) => state.counter.count)
  return <div>Count: {count}</div>
}
```

### 触发状态更新

```jsx
import { useDispatch } from 'react-redux'
import { increment, decrement } from './store/modules/counterStore'

function Counter() {
  const dispatch = useDispatch()
  return (
    <div>
      <button onClick={() => dispatch(decrement())}>-</button>
      {/* ... existing code ... */}
      <button onClick={() => dispatch(increment())}>+</button>
    </div>
  )
}
```

## 6. 给 Action 传参

有时候我们希望在触发动作时传入参数，比如“加到一个指定的数字”。

```js
addToNum(state, action) {
  state.count = action.payload
}
```

调用的时候：

```jsx
dispatch(addToNum(10))
dispatch(addToNum(20))
```

RTK 自动把传入的参数封装成了 action.payload。

## 7. 异步操作（Thunk）

Redux Toolkit 默认支持异步 action（Thunk）。当我们需要从后台请求数据时，可以写一个函数返回另一个函数，在里面执行异步操作。

```js
// store/api/channelThunk.js
import axios from 'axios'
import { setChannels } from '../modules/channelStore'

export const fetchChannelList = () => {
  return async (dispatch) => {
    const res = await axios.get('/api/channels')
    dispatch(setChannels(res.data))
  }
}
```

组件中直接 dispatch：

```jsx
useEffect(() => {
  dispatch(fetchChannelList())
}, [dispatch])
```

> 虽然 Redux 的 dispatch 函数本身不会变，但出于规范和 ESLint 检查的考虑，建议在 useEffect 的依赖数组中写上 [dispatch]

## 8. 项目结构建议

```bash
store/
├─ modules/         # 每个 slice 一个文件
│  ├─ counterStore.js
│  └─ channelStore.js
├─ api/             # 存放异步请求封装
│  └─ channelThunk.js
└─ index.js         # 汇总所有 reducer，创建 store
```

这样的结构清晰明了，便于维护。

## 9. 总结

Redux 的核心原理不复杂，只是流程略多。掌握了几个关键点之后，搭配 Redux Toolkit 和 react-redux，可以比较简单地实现状态集中管理。

适合使用 Redux 的场景包括：

- 跨组件共享状态比较多；
- 状态变化需要调试追踪；
- 异步数据流复杂。

但如果只是局部状态管理，React 自带的 `useState` 和 `Context` 往往就足够用了。
