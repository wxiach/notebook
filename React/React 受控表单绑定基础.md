# React 受控表单绑定基础

React 中最常见的几个需求是：
- 渲染一组列表
- 绑定点击事件
- 表单数据与组件状态之间的绑定

**受控表单绑定**是理解表单交互的关键之一。

---

## 📍什么是受控组件？

在 React 中，所谓“受控组件”，指的是表单元素（如 `<input>`）的值**被 React 的 state 控制着**。

状态（state）和视图（input）形成一个双向绑定：

```text
state 绑定到 input 的 value 属性
input 变化后，通过 onChange 修改 state
```

也就是说，用户输入的值不是直接改变 input，而是改变了 state，input 的 value 再随着 state 一起更新。

---

## 🛠 使用步骤

### 1. 准备一个 React 状态值

```jsx
const [value, setValue] = useState('')
```

这一步很常规：先准备一个 state，初始值设为空字符串。

### 2. 把 state 绑定到 input 的 value，再用 onChange 更新它

```jsx
<input
  type="text"
  value={value}                      // 显示内容 = React 中的 value
  onChange={(e) => setValue(e.target.value)}  // 每次输入触发更新
/>
```

这个写法其实就是双向绑定的本质。

---

## 📖 小结（写给自己看的）

1. 表单受控绑定核心就是 value + onChange，不能少。
2. `value={state}` 是让 input 的值跟随 React 状态。
3. `onChange={(e) => setState(e.target.value)}` 是把用户输入的值塞回 state。
4. 如果不加 `value`，input 的值就不受 React 控制，是“非受控组件”。

---

虽然这段代码很短，但本质上已经是 React 数据驱动视图的典范了。
表单、搜索框、评论区……几乎所有输入型组件都离不开这一套。

下一步，我可能会整理一下：
- 多个 input 怎么管理？（用一个 state 对象）
- 复杂表单用 `useReducer` 管理
- 用 `ref` 实现非受控表单场景

但无论是哪种方式，这一段写法是核心基础。
理解清楚之后，再复杂的场景也只不过是组合和抽象。
