# ReentrantLock

`ReentrantLock` 是 Java 中的一个可重入锁，它是 `java.util.concurrent.locks` 包中的一部分。它提供了比传统的 `synchronized` 关键字更灵活的锁机制，允许更复杂的线程同步控制。

> 可重入锁的意思是同一个线程可以多次获得同一把锁，而不会导致死锁。

## 基本语法

```java
ReentrantLock lock = new ReentrantLock();

lock.lock(); // 加锁

try {
    // 临界区代码
} finally {
    lock.unlock(); // 解锁
}
```

与`synchronized`不同， `ReentrantLock` 是 Java 代码实现的锁，所以我们就必须先获取锁，然后在 `finally` 中正确释放锁。

## 可中断

```java
ReantrantLock lock = new ReentrantLock();

Thread thread = new Thread(() -> {
    try {
        lock.lockInterruptibly();
        try {

        } finally {
            lock.unlock();
        }
    } catch (InterruptedException e) {
        // 处理线程被中断的情况
    }
});
```

不同于 `lock()` 方法，`lockInterruptibly()` 方法可以响应中断。当线程在等待锁时，如果被中断，则会抛出 `InterruptedException`。这使得我们可以在需要时优雅地退出等待状态，而不是一直阻塞下去。

## 可尝试

```java
ReantrantLock lock = new ReentrantLock();

Thread thread = new Thread(() -> {
    try {
        if (lock.tryLock(1, TimeUnit.SECONDS)) {
            try {
                // 临界区代码
            } finally {
                lock.unlock();
            }
        } else {
            // 获取锁失败，处理其他逻辑
        }
    } catch (InterruptedException e) {
        // 处理线程被中断的情况
    }
});
```

`tryLock()` 方法尝试获取锁，如果在指定的时间内没有获取到锁，则返回 `false`。这使得我们可以避免长时间等待锁的情况，适用于需要快速响应的场景。

## 多条件

```java
ReentrantLock lock = new ReentrantLock();

Condition condition = lock.newCondition();

Thread thread = new Thread(() -> {
    lock.lock();
    try {
        // 等待条件
        condition.await();
    } finally {
        lock.unlock();
    }
});

```
