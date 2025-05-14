# volatile 关键字

`volatile` 关键字用于告诉编译器一个变量可能会被多个线程同时访问，因此编译器在优化代码时不能对这个变量进行缓存。
它的主要作用是防止编译器对变量的优化，确保每次访问都从内存中读取最新的值。

它解决了线程安全问题中的可见性问题，但并不能解决原子性和有序性的问题。

## 可见性问题

```java
public class VolatileExample {
    private static volatile boolean flag = false;

    public static void main(String[] args) throws InterruptedException {
        new Thread(() -> {
            while (!flag) {
                // do something
            }
            System.out.println("Thread 1 finished.");
        }).start();

        Thread.sleep(1000); // 等待一段时间

        flag = true; // 修改 flag 的值
        System.out.println("Main thread finished.");
    }
}
```
