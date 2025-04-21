# CGLIB 在 Java 21 下报 NoClassDefFoundError 的排查与解决

> 记录一次在 Java 21 运行时使用 CGLIB 遇到 `NoClassDefFoundError` 的经历，以及对应的几种解决办法。

## 1 现象

- **环境**：Java 21 + CGLIB
- **报错**：程序启动时抛出 `java.lang.NoClassDefFoundError`，堆栈指向 CGLIB 的 `net.sf.cglib.proxy.Enhancer` 初始化阶段。

## 2 根因

自 **Java 9** 起，JDK 引入模块系统（JPMS）。模块化默认收紧了反射访问权限：

| 行为       | 说明                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------ |
| **默认**   | 模块内部的包不对外开放，其他模块即使 `setAccessible(true)` 也无法反射访问                        |
| **开放包** | 只有在 `module-info.java` 中明确 `opens`，或通过 JVM 参数 `--add-opens` 临时打开，才能被外部反射 |

CGLIB 在运行时需要生成子类，并通过反射操作目标类；若目标类位于 **JDK 内置模块**（如 `java.base/java.lang`），而该包又未开放，就会触发上述异常。

示例堆栈片段：

```text
java.lang.NoSuchFieldException: ...
    at java.base/java.lang.Class.getDeclaredField(Class.java:...) // 反射失败
    ...
```

## 3 解决方案：显式打开包

在启动 JVM 时加上 `--add-opens` 参数，将需要反射的包开放给未命名模块（常见第三方库都属于未命名模块）。

### 3.1 Gradle 配置示例

```kotlin
test {
    useJUnitPlatform()
    jvmArgs = listOf(
        "--add-opens=java.base/java.lang=ALL-UNNAMED",
        "--add-opens=java.base/sun.net=ALL-UNNAMED"
    )
}

tasks.withType<JavaExec>().configureEach {
    jvmArgs += listOf(
        "--add-opens=java.base/java.lang=ALL-UNNAMED",
        "--add-opens=java.base/sun.net=ALL-UNNAMED"
    )
}
```

- `java.base/java.lang`：常见的目标类所在包。
- `ALL-UNNAMED`：表示开放给所有未命名模块（第三方依赖默认在此）。

### 3.2 命令行直接运行

```bash
java --add-opens=java.base/java.lang=ALL-UNNAMED \
     --add-opens=java.base/sun.net=ALL-UNNAMED \
     -jar your-app.jar
```

## 4 替代方案：切换字节码框架

- **Byte Buddy**：现代化字节码生成库，对 JPMS 有更完善的适配策略。
- 若项目可升级，可考虑用 Spring 6+ 默认的 Byte Buddy 代理实现，避免手动开放包。

## 5 小结

1. Java 9+ 模块系统默认限制了跨模块反射。
2. CGLIB 依赖反射生成子类，若目标包未开放会触发 `NoClassDefFoundError`。
3. 通过 `--add-opens` 临时开放包即可解决；或升级到对 JPMS 友好的字节码库（如 Byte Buddy）。

希望这份记录能帮到在新版 JDK 中使用 CGLIB 的同学。
