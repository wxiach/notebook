# 线程局部变量 ThreadLocal

`ThreadLocal` 让每个线程都可以有自己的变量副本。

```java
public class ThreadLocalExample {
    // 定义为类变量，保证全局唯一性
    private static ThreadLocal<Integer> threadLocalValue = ThreadLocal.withInitial(() -> 0);

    public static void main(String[] args) {
        Runnable task = () -> {
            int value = threadLocalValue.get();
            System.out.println("Initial value: " + value);
            threadLocalValue.set(value + 1);
            System.out.println("Updated value: " + threadLocalValue.get());
        };

        Thread thread1 = new Thread(task);
        Thread thread2 = new Thread(task);

        thread1.start();
        thread2.start();
    }
}
```

它原理很简单，`Thread` 类中维护了一个 `ThreadLocalMap`，key 是 ThreadLocal 对象，value 是线程局部变量的值。每个线程都有自己的 `ThreadLocalMap` 实例，这样就可以保证每个线程都能访问到自己的变量副本。

```java
public class Thread implements Runnable {
    ThreadLocal.ThreadLocalMap threadLocals = null;

    public void set(T value) {
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);
        if (map != null) map.set(this, value);
        else createMap(t, value);
    }

    ThreadLocalMap getMap(Thread t) {
        return t.threadLocals;
    }
}
```
