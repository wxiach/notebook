# ReentrantLock

特点：

- 可中断
- 可超时
- 可公平
- 可多个条件
- 可重入

> 什么是可重入？—— 同一个对象对自己反复加锁，如果是不可重入，同一个线程自己再次获得这把锁时会死锁。可重入的意思是同一个线程可以多次获得同一把锁。

基本语法：

```java
ReentrantLock lock = new ReentrantLock();

lock.lock(); // 加锁

try {
    // 临界区代码
} finally {
    lock.unlock(); // 解锁
}
```
