# volatile 关键字

`volatile` 修饰共享变量，确保多线程环境下的可见性并禁止指令重排序，其实现依赖于内存屏障。

## 可见性：状态标记

```java
public class VolatileExample {

    private static volatile boolean flag = false;

    public static void main(String[] args) throws InterruptedException {
        new Thread(() -> {
            while (!flag) {
            }
            System.out.println("Thread finished.");
        }).start();

        Thread.sleep(1000);

        flag = true;
        System.out.println("Main thread finished.");
    }
}
```

这个示例中，`flag` 被声明为 `volatile`，确保了当主线程修改 `flag` 的值时，其他线程能够立即看到这个变化。

## 有序性：双重检查锁定

双重检查锁定（DCL，Double-Checked Locking）是一种常见的设计模式，用于在多线程环境中延迟初始化单例对象。

```java

public class Singleton {
    private static volatile Singleton instance;

    private Singleton() {}

    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}

```

在这个示例中，`volatile` 确保了 `new Singletone()` 这个操作在将引用值赋值给 `instance` 之前就已经完成了。

因为，`instance = new Singleton()` 这行代码实际上是分为三步执行的：

1. 分配内存空间。
2. 调用构造函数初始化对象。
3. 将 `instance` 引用指向分配的内存空间。

如果没有 `volatile`，那么步骤 3 可能会在步骤 2 之前执行，这样其他线程就可能看到一个未完全初始化的对象。
