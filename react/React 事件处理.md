# React 事件处理

React 中最常见的两个需求，一个是列表渲染，另一个就是绑定点击事件。
这一篇就是从最基础的按钮点击开始，分四个阶段，逐步理解 React 中事件的写法和参数传递方式。

## 📍阶段一：最简单的点击事件

```jsx
function App() {
  const handleClick = () => {
    console.log('button 被点击了')
  }

  return (
    <div className="App">
      <button onClick={handleClick}>click me</button>
    </div>
  )
}
```

**解释：**

- 这里的 `onClick` 就是标准的 JSX 写法。
- 它接收一个函数引用，`handleClick` 就是点击时要执行的逻辑。
- 注意：不能直接写 `handleClick()`，否则是页面加载时就执行了，而不是等用户点击才执行。

## 📍阶段二：获取事件对象 `e`

```jsx
const handleClick = (e) => {
  console.log('button 被点击了', e)
}
```

**解释：**

- React 会把合成事件对象作为第一个参数传给事件处理函数。
- 虽然它看起来像原生事件，其实是 React 做了一层封装，叫 `SyntheticEvent`。
- 常见属性（如 `e.target`、`e.type`）都能用。

## 📍阶段三：传递自定义参数

```jsx
const handleClick = (name) => {
  console.log('button 被点击了', name)
}

;<button onClick={() => handleClick('jack')}>click me</button>
```

**解释：**

- 如果想给事件函数传参数，那就要用箭头函数包一层。
- 这里 `handleClick('jack')` 是传参形式，但要注意这样每次渲染都会生成一个新函数。
- 所以不要在大列表里滥用（比如 `list.map` 时）。

## 📍阶段四：既传参，又保留事件对象 `e`

```jsx
const handleClick = (name, e) => {
  console.log('button 被点击了', name, e)
}

;<button onClick={(e) => handleClick('jack', e)}>click me</button>
```

**解释：**

- 想要两个参数：一个是自定义的，另一个是系统传的 `e`，就得手动写出来。
- 顺序不能反，因为 React 默认把事件作为第一个参数。
- 所以我们得用箭头函数先拿到 `e`，再把 `name` 和 `e` 一起传给 `handleClick`。

## ✅ 总结（写给自己的话）

1. React 的事件是合成事件，不是原生 DOM 的 `onclick`，但基本用法类似。
2. 如果直接写函数名，就是**传引用**；想要传参数就要**用箭头函数包装**。
3. 想要拿到事件对象 `e`，要么写 `(e) => ...`，要么作为 `handleClick(e)` 的参数显式声明。
4. JSX 里不能直接调用函数（比如 `onClick={handleClick()}`），这样会直接执行，而不是绑定。

这一块内容写得越清楚越好，因为几乎所有交互逻辑都绕不开事件系统。写组件的时候，判断点击了谁、传了什么、触发了什么，最后全都绕回这个函数定义上。

后续我可能会再整理：

- 事件冒泡和阻止传播
- React 如何模拟事件池
- 在组件中统一封装多个事件处理逻辑

这一篇算是打基础，理解透之后，用起来会非常自然。
