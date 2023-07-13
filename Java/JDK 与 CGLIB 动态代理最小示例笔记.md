# JDK 与 CGLIB 动态代理最小示例笔记

> 这是一份个人备忘，记录两种常见 Java 动态代理方式的最小可运行代码，方便日后查阅 Spring AOP 等框架源码时快速对照。

---

## 目录
1. [动态代理简介](#动态代理简介)
2. [JDK Dynamic Proxy](#jdk-dynamic-proxy)
3. [CGLIB Proxy](#cglib-proxy)
4. [两种方式对比](#两种方式对比)
5. [可能的扩展实践](#可能的扩展实践)

---

## 动态代理简介

* **静态代理**：手写 `ProxyFoo` 类，将调用逐一转发到 `Foo`。
* **动态代理**：在运行时生成代理对象，拦截方法调用后再决定执行逻辑（日志、权限、事务等）。

动态代理的本质是 **在调用点织入横切逻辑**。

---

## JDK Dynamic Proxy

* 依赖 Java 反射，只能代理 **接口**。
* 运行时生成 `com.sun.proxy.$ProxyXXX` 字节码。

### 1. 定义接口及实现
```java
public interface GreetingService {
    String greet(String name);
}

public class SimpleGreetingService implements GreetingService {
    @Override
    public String greet(String name) {
        return "Hello, " + name;
    }
}
```

### 2. 编写 `InvocationHandler`
```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

public class LoggingHandler implements InvocationHandler {
    private final Object target;

    public LoggingHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("-> " + method.getName());
        Object result = method.invoke(target, args);
        System.out.println("<- " + method.getName());
        return result;
    }
}
```

### 3. 生成并使用代理
```java
import java.lang.reflect.Proxy;

public class JdkProxyDemo {
    public static void main(String[] args) {
        GreetingService origin = new SimpleGreetingService();

        GreetingService proxy = (GreetingService) Proxy.newProxyInstance(
                origin.getClass().getClassLoader(),
                new Class<?>[] { GreetingService.class },
                new LoggingHandler(origin)
        );

        System.out.println(proxy.greet("Alice"));
    }
}
```

---

## CGLIB Proxy

* 依赖 ASM，在运行时生成目标类的子类。
* 可以代理普通类；`final` 类或 `final` 方法无法代理。

### 1. 依赖
```kotlin
// build.gradle.kts
implementation("cglib:cglib:3.3.0")
```

### 2. 目标类
```java
public class FriendlyService {
    public String sayHi(String name) {
        return "Hi, " + name;
    }
}
```

### 3. `MethodInterceptor`
```java
import net.sf.cglib.proxy.MethodInterceptor;
import net.sf.cglib.proxy.MethodProxy;
import java.lang.reflect.Method;

public class CglibLoggingInterceptor implements MethodInterceptor {
    @Override
    public Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) throws Throwable {
        System.out.println("-> " + method.getName());
        Object result = proxy.invokeSuper(obj, args);
        System.out.println("<- " + method.getName());
        return result;
    }
}
```

### 4. 生成并使用代理
```java
import net.sf.cglib.proxy.Enhancer;

public class CglibProxyDemo {
    public static void main(String[] args) {
        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(FriendlyService.class);
        enhancer.setCallback(new CglibLoggingInterceptor());

        FriendlyService proxy = (FriendlyService) enhancer.create();
        System.out.println(proxy.sayHi("Bob"));
    }
}
```

---

## 两种方式对比

| 维度 | JDK Proxy | CGLIB |
| :--- | :---: | :---: |
| 是否必须接口 | 是 | 否 |
| 支持 `final` 类/方法 | 否 | 否 |
| 额外依赖 | 无 | `cglib + asm` |
| Spring 默认策略 | 有接口 → JDK | 无接口 → CGLIB |
| 运行时性能差异 | 极小 | 极小（启动生成子类略慢） |

---

## 可能的扩展实践

1. **拦截器链**：在 `invoke`/`intercept` 中串联多个处理器，模拟 Spring AOP 的责任链。
2. **注解驱动代理**：扫描 `@Transactional` 等注解，根据需要为 Bean 创建代理。
3. **代理缓存**：单例 Bean 只生成一次代理，避免重复开销。
4. **尝试 Byte Buddy**：现代字节码框架；Spring 6+ 与 Hibernate 6+ 已开始使用。

---

### 小结

- JDK Dynamic Proxy 适用于接口场景。
- CGLIB 适用于没有接口、且类／方法非 `final` 的场景。
- 两者都在方法调用时织入横切逻辑，底层实现细节不同。

以上示例代码共约 50 行，足以支撑阅读 Spring AOP 的核心实现。

