# React 中如何获取 DOM：用 useRef 操作非受控组件
## 📌 场景说明

在写 React 的时候，通常我们是通过“受控组件”来管理表单元素，比如用 `useState` 控制 `<input>` 的值。

但有些时候，控制的需求只是临时性的，或者完全不需要重新渲染组件，这时候直接访问 DOM 元素更合适，也更高效。

比如下面这段代码：

```jsx
import { useRef } from "react"

// 1. useRef 生成 ref 对象，绑定到 DOM 标签身上
// 2. DOM 可用时，通过 ref.current 获取真实 DOM
// 3. 这个时机是在组件渲染完成之后

function App() {
  const inputRef = useRef(null)

  return (
    <div>
      <input type="text" ref={inputRef} />
    </div>
  )
}

export default App
```

---

## 🧠 核心理解

这里用到了 `useRef`，它的作用是生成一个可变的引用对象，并且可以挂载到任意 DOM 元素上。

在这段代码中，我们做了三件事：

1. `const inputRef = useRef(null)` —— 创建一个 ref 对象，初始值设为 null。
2. `<input ref={inputRef} />` —— 把这个 ref 绑定在 `<input>` 标签上。
3. 等组件渲染完毕后，就可以通过 `inputRef.current` 访问到真实的 DOM 元素。

这种方式非常适合处理“非受控组件”的需求，比如：

- 页面加载后自动聚焦某个输入框
- 读取元素的 `scrollTop`、宽高等属性
- 与基于 DOM 的第三方库（比如一些图表库）集成

---

## ⚠️ 一点小提醒

虽然 `useRef` 很方便，但也要注意它**不会引发组件的重新渲染**，所以它不适合用来存储那些希望“响应式更新”的数据。

它更像是一个“通用口袋”，可以放点什么，但不会影响 React 的生命周期。

---

## ✍️ 后记

我现在渐渐觉得，`useRef` 在 React 里其实就像是那种“不请自来的幕后小帮手”：

> 默默地跟着我们，从不打扰组件的渲染逻辑，但一旦需要操作 DOM，它总是第一时间可以派上用场。

这是我在写一些小型交互逻辑时经常依赖的工具，也算是我理解 React“控制 vs 非控制”思想的一个小切口。

如果你有类似的需求，比如想让一个输入框在页面加载后自动获得焦点，不妨试试看用 `useRef` 处理看看。

它不会改变 React 的声明式风格，却能给你一点必要的“命令式能力”。

如果有兴趣，我可以在下一篇里记录一下“如何在 `useEffect` 中结合 `useRef` 自动聚焦输入框”。