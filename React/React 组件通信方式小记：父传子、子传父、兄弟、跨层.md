# React 组件通信方式小记：父传子、子传父、兄弟、跨层

> 这几天复习了一下 React 中组件之间的通信方式。虽然这些内容之前用过，但总觉得理解还停留在“知道怎么写”的层面，这次想系统梳理一下，尤其是几种方式之间的区别和适用场景。主要涉及四种常见通信方式：父传子、子传父、兄弟组件通信（通过状态提升）、跨层通信（使用 Context）。简单记录一下我理解的过程和示例代码，方便以后回顾。

## 一、父组件向子组件传值（props）

最基本的通信方式就是 props，父组件可以通过在 JSX 标签上绑定属性的方式，把数据传递给子组件。

```javascript
function Son(props) {
  // props 是一个对象，包含所有父组件传递过来的数据
  console.log(props);
  return <div>this is son {props.name}</div>;
}

function App() {
  const name = 'this is app name';
  return (
    <div>
      <Son name={name} />
    </div>
  );
}
```

**要点：**
- 父组件 `<Son name={name} />` 中，name 是自定义属性。
- 子组件通过 `props.name` 读取这个值。

## 二、特殊的 props.children

还有一种比较“隐性”的父传子方式是 children。当我们把内容写在组件标签之间时，这部分内容会作为 children 被传递：

```javascript
<Son>
  <span>this is span</span>
</Son>
```

子组件内部就可以通过 `props.children` 来访问这段嵌套的内容。

## 三、子组件向父组件传值（函数回调）

子传父通常通过回调函数实现：父组件先定义一个函数传给子组件，子组件内部调用它来“通知”父组件。

```javascript
function Son({ onGetSonMsg }) {
  const sonMsg = 'this is son msg';
  return (
    <div>
      this is Son
      <button onClick={() => onGetSonMsg(sonMsg)}>sendMsg</button>
    </div>
  );
}

function App() {
  const getMsg = (msg) => {
    console.log(msg); // 接收到子组件传来的数据
  };
  return (
    <div>
      this is App
      <Son onGetSonMsg={getMsg} />
    </div>
  );
}
```

**要点：**
- 父组件把一个函数 `getMsg` 传给子组件。
- 子组件在事件中调用这个函数，把数据当参数传出去。

## 四、兄弟组件通信：状态提升

兄弟之间不能直接通信，但可以借助共同的父组件。方法是把需要共享的数据提升到父组件的 state 中。

**实现步骤：**
1. 子组件 A 通过 props 向父组件传递数据。
2. 父组件接收到数据后，更新自己的 state。
3. 再通过 props 将数据传递给兄弟组件 B。

这种方式本质是：“子传父 + 父传子”。

## 五、跨层通信：使用 Context

当通信的组件相隔层级比较深时，一层一层地 props 传下去很麻烦，可以使用 React 的 Context。

**实现步骤：**
- 使用 `createContext` 创建一个上下文对象。
- 在顶层组件中用 `<Provider>` 提供数据。
- 在需要的子组件中用 `useContext` 获取数据。

```javascript
const MsgContext = React.createContext();

function App() {
  return (
    <MsgContext.Provider value="this is app name">
      <A />
    </MsgContext.Provider>
  );
}

function A() {
  return <B />;
}

function B() {
  const msg = useContext(MsgContext);
  return <div>{msg}</div>;
}
```

## 小结

| 通信方式 | 应用场景       | 实现方式                   |
|------------|----------------|----------------------------|
| 父传子     | 最常见         | 通过 props                |
| 子传父     | 子组件向父组件汇报 | 回调函数                   |
| 兄弟通信   | 同级组件       | 状态提升 + 父组件中转     |
| 跨层通信   | 深层嵌套组件   | Context + Provider        |

React 的通信模型虽然看起来种类多，但归根到底还是数据的单向流动：从父传子，从子传父，一切都在组件的组合结构中体现。

越复杂的通信需求，越需要我们在设计组件结构时多想一步。

