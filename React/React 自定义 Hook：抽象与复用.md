# React 自定义 Hook：抽象与复用

> 在学习 React 的过程中，我逐步理解了如何通过 **自定义 Hook** 来封装和复用逻辑。本文记录了我如何将组件内部的状态逻辑提炼成通用的工具函数，从而提升代码的复用性和可维护性。目标是通过简单易懂的方式讲解自定义 Hook 的设计思路及其应用。

## 1. 背景：如何避免组件中代码的“黏性”

在 React 中，随着业务逻辑的复杂化，直接在组件内部写状态和副作用逻辑可能会让代码变得难以维护和复用。通常，组件内部包括了：

- **UI 显示**：根据某些条件渲染视图。
- **状态管理**：处理组件内部的状态更新。
- **副作用处理**：例如，数据请求、订阅等。

这种将所有内容混在一起的做法虽然一开始简单，但随着项目规模的增大，问题也随之而来：

- **代码重复**：类似的逻辑在多个组件中不断复制粘贴，导致了难以维护的“重复代码”。
- **状态逻辑耦合**：状态更新的逻辑被埋在组件内部，无法轻松地被其他组件复用。
- **测试困难**：单元测试时很难单独测试状态逻辑，因为它们和 UI 渲染耦合在一起。

为了解决这些问题，React 提出了 **自定义 Hook**（Custom Hook）这一概念。自定义 Hook 允许我们将业务逻辑抽象成可复用的函数，而不依赖于组件的具体实现，从而实现更加模块化和易于维护的代码。

## 2. 逐步演进：从“直接写”到“抽象成自定义 Hook”

### 2.1 不封装：直接在组件内处理状态

我们首先看一个简单的例子，直接在组件内处理状态。假设我们想控制一个按钮点击后，显示或隐藏一个 `div`。

```jsx
function App() {
  const [visible, setVisible] = useState(true)

  return (
    <div>
      {visible && <div>this is div</div>}
      <button onClick={() => setVisible(!visible)}>toggle</button>
    </div>
  )
}
```

在这个例子中，状态和视图是紧耦合的，每次要修改状态逻辑时，我们不得不在每个需要的地方进行重复编写。

### 2.2 抽成自定义 Hook

为了使状态逻辑更具复用性，我们将逻辑提取到自定义 Hook 中，去除组件中的冗余代码：

```jsx
import { useState } from 'react'

/**
 * Custom Hook: useToggle
 * 用于控制一个布尔值状态的切换
 * @param {boolean} initial - 初始值
 * @returns {object} 包含状态和切换方法
 */
function useToggle(initial = true) {
  const [value, setValue] = useState(initial)

  const toggle = () => setValue(!value) // 切换状态

  return { value, toggle } // 返回状态和切换方法
}
```

接下来，组件中只需要使用 `useToggle`：

```jsx
function App() {
  const { value, toggle } = useToggle() // 使用自定义 Hook

  return (
    <div>
      {value && <div>this is div</div>}
      <button onClick={toggle}>toggle</button>
    </div>
  )
}
```

通过这种方式，组件变得更加简洁，**状态管理逻辑和 UI 渲染分离**，提高了代码的可维护性和可复用性。

### 2.3 再抽象：提炼“通用逻辑层”

为了使 `useToggle` 更加通用，我们可以将其扩展到支持 **任何可反转的值**，不仅限于布尔值。这样，我们就可以处理开关、数字、字符串，甚至更复杂的类型。

#### 代码实现

我们通过参数化 `initial` 和 `toggleFn`，使得自定义 Hook 可以支持不同类型的值和反转规则：

```jsx
import { useState } from 'react'

/**
 * Custom Hook: Toggle any value, not just boolean.
 * 支持反转任何类型的值（boolean, number, string 等）
 * @param {any} initial - 初始值
 * @param {function} toggleFn - 反转值的逻辑（可选，默认为切换布尔值）
 * @returns {object} 包含状态和切换方法
 */
function useToggle(initial, toggleFn = (value) => !value) {
  const [value, setValue] = useState(initial)

  const toggle = () => setValue(toggleFn(value)) // 使用传入的切换逻辑

  return { value, toggle } // 返回状态和切换方法
}
```

#### 使用示例

现在我们可以在多个场景中使用 `useToggle`，不仅仅是处理布尔值。

##### 示例 1：切换布尔值

```jsx
function App() {
  const { value, toggle } = useToggle(true) // 默认是 true

  return (
    <div>
      {value && <div>this is div</div>}
      <button onClick={toggle}>toggle</button>
    </div>
  )
}
```

##### 示例 2：切换数字（0 和 1）

```jsx
function App() {
  const { value, toggle } = useToggle(0, (value) => (value === 0 ? 1 : 0))

  return (
    <div>
      {value === 1 ? <div>active</div> : <div>inactive</div>}
      <button onClick={toggle}>toggle</button>
    </div>
  )
}
```

##### 示例 3：切换字符串（'open' 和 'closed'）

```jsx
function App() {
  const { value, toggle } = useToggle('closed', (value) => (value === 'closed' ? 'open' : 'closed'))

  return (
    <div>
      <div>Status: {value}</div>
      <button onClick={toggle}>toggle</button>
    </div>
  )
}
```

通过这样的抽象，我们使 `useToggle` 成为一个高度灵活的工具，可以适应不同类型的反转需求。

## 3. 深层次理解：为什么要这样设计

### 3.1 保持函数式 UI 的纯粹性

React 组件本质上是 **纯函数**：给定相同的 `props` 和 `state`，组件的输出始终相同。通过自定义 Hook，我们能把复杂的状态管理和副作用逻辑提取到组件外部，这样可以保持 UI 层的纯粹性，避免状态和渲染逻辑混杂。

### 3.2 为什么 Hook 调用必须在顶层？

React 在渲染过程中维护了一个 Hook 链表，这个链表记录了每个 Hook 的状态。当渲染发生时，React 会按顺序遍历这些 Hook。如果我们在 `if` 或 `for` 等控制流中调用 Hook，可能导致 Hook 的调用顺序变化，进而破坏状态的正确关联。因此，React 强制要求 Hook 只能在组件的顶层调用。

## 4. 写自定义 Hook 的最佳时机

自定义 Hook 适用于以下场景：

- **需要在多个组件中复用相同的逻辑**：例如，表单验证、用户认证状态、数据请求等。
- **逻辑复杂，难以与 UI 解耦**：例如，有多个 `useEffect` 或复杂的条件判断时，可以通过自定义 Hook 将逻辑抽象出来。
- **需要单元测试**：将逻辑与 UI 分离，便于隔离测试。

## 5. 常见陷阱与思考

1. **闭包陷阱**  
   如果返回的函数依赖于旧的 state，但没有使用 `useCallback`，在异步场景下可能会得到过期值。
2. **共享与隔离**  
   自定义 Hook 每次调用时都会重新生成内部状态。如果希望多个组件共享相同的状态，可以使用 Context 或状态库。
3. **命名与规范**  
   自定义 Hook 必须以 `use` 开头，这样才能让 React 及 ESLint 插件正确识别它。同时，返回值应该清晰地分为状态和行为两部分：`{ state, doAction }`。

## 6. 小结

- 自定义 Hook 是通过 `use` 开头的普通函数，它允许我们将可复用的逻辑从组件内部抽取出来，**让代码更清晰、更易维护**。
- 通过将 `useToggle` 抽象成支持不同数据类型的通用 Hook，我们提高了它的复用性，减少了冗余代码。
- 写自定义 Hook 时要遵循 React 的规则，保证 **Hook 调用顺序稳定**，否则会导致渲染和状态同步错误。

通过这篇文章的总结，我更加理解了自定义 Hook 的强大作用，并将在项目中逐步应用它来提升代码质量。
