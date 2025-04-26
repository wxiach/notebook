# Java 模块访问限制及其对 CGLIB 的影响

> 在调试一次 Spring 项目时，我在 Java 21 环境中遇到了 `NoClassDefFoundError`，最终排查发现根因是 JDK 模块系统对反射访问的限制。这篇文章通过这个案例，深入分析 Java 模块系统的访问机制，并说明它如何影响像 CGLIB 这样的字节码生成库，以及应对的几种方式。

## 什么是模块访问限制？

自 Java 9 起，JDK 引入了模块系统（JPMS），它将原本统一的 JDK 拆分成了多个逻辑模块，并引入访问边界的概念。

> 核心设计点是：模块默认对外是封闭的，即一个模块中的类和包，不再自动对其他模块可见，即使你用 `setAccessible(true)` 也没用。这和 Java 8 之前的包级可见规则相比，是一次"语义层级的封装升级"。

举个例子：

你现在的模块（比如项目代码）尝试通过反射去访问 `java.lang.Class` 里的某个私有字段，Java 8 可能警告但能访问，而 Java 9+ 下会直接抛出异常——因为 `java.base/java.lang` 这个包没有开放给你的模块。

开放访问只能通过两种方式实现：

1. **静态方式**：在 `module-info.java` 中添加 `opens java.lang`（仅适用于你自己控制的模块）。
2. **动态方式**：通过 JVM 参数 `--add-opens=java.base/java.lang=ALL-UNNAMED` 在运行时临时开放。

## CGLIB 为什么依赖反射？

CGLIB 是一个基于字节码生成（CGLIB）的动态代理库，它的原理并非直接使用 `java.lang.reflect.Proxy` 那一套，而是通过生成一个继承自目标类的子类，来实现方法的增强和拦截。

但注意——即便它底层是"写字节码"的，它在运行过程中仍然会用到反射，原因包括：

1. **查找目标类的构造方法**：动态生成子类时，需要知道如何调用父类构造器；
2. **复制字段结构**：有时候需要复制目标类的字段信息，或调用字段访问器；
3. **反射调用方法**：虽然子类中重写了方法，但可能仍需要调用父类中的原始方法（特别是 `MethodProxy.invokeSuper` 时）。

这些操作都会触碰到 Java 模块系统的边界。如果你生成的代理类试图去访问 `java.base` 模块中的核心类，比如 `Object` 或 `Class` 的内部结构，而这些包没有开放，就会报错。

## 问题排查与解决方案

在 Java 21 环境中运行项目时，抛出如下异常：

```text
java.lang.NoClassDefFoundError: net/sf/cglib/proxy/Enhancer Caused by: java.lang.reflect.InaccessibleObjectException: Unable to make ... accessible
```

这个错误不止一次出现过，也不是 CGLIB 本身的 bug，而是因为它在创建代理时，访问了未开放的模块内部类。

**堆栈中指向了 `Class.getDeclaredField` 或 `Class.getDeclaredMethod` 的失败调用**，这些 API 在 Java 9+ 中默认受模块保护，触发了 `InaccessibleObjectException` 或 `IllegalAccessException`，进而导致类初始化失败，最终表现为 `NoClassDefFoundError`。

### 方案一：使用 `--add-opens` 显式开放模块

最直接的解决方案是在 JVM 启动时添加模块开放参数，例如：

```bash
--add-opens=java.base/java.lang=ALL-UNNAMED
```

这样未命名模块（即 classpath 中的依赖）就可以访问 `java.lang` 的内部类型。

Gradle 示例：

```kotlin
test {
    useJUnitPlatform()
    jvmArgs = listOf(
        "--add-opens=java.base/java.lang=ALL-UNNAMED"
    )
}
```

命令行示例：

```bash
java --add-opens=java.base/java.lang=ALL-UNNAMED -jar your-app.jar
```

### 方案二：用 Byte Buddy 替代 CGLIB

相比 CGLIB，**Byte Buddy** 是一个现代化的字节码生成库：

- 更好地支持模块系统；
- 对反射调用做了封装优化；
- Spring 6.x 之后已经默认改用 Byte Buddy 实现动态代理。

如果你的项目允许升级，使用 Byte Buddy 可以规避手动开放模块的复杂性。
