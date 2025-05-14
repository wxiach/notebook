# ReentrantLock

`ReentrantLock` 是 Java 中的一个可重入锁，它是 `java.util.concurrent.locks` 包中的一部分。它提供了比传统的 `synchronized` 关键字更灵活的锁机制，允许更复杂的线程同步控制。

> 可重入锁的意思是同一个线程可以多次获得同一把锁，而不会导致死锁。

## 基本语法

```java
ReentrantLock lock = new ReentrantLock();

// 加锁
lock.lock();

try {
    // 临界区代码
} finally {
    // 解锁
    lock.unlock();
}
```

与`synchronized`不同， `ReentrantLock` 是 Java 代码实现的锁，所以我们就必须先获取锁，然后在 `finally` 中正确释放锁。

## 可中断的锁

```java
ReentrantLock lock = new ReentrantLock();

Thread thread = new Thread(() -> {
    try {
        lock.lockInterruptibly();
        try {
            // 临界区代码
        } finally {
            lock.unlock();
        }
    } catch (InterruptedException e) {
        // 处理线程被中断的情况
        Thread.currentThread().interrupt();
    }
});
```

不同于 `lock()` 方法，`lockInterruptibly()` 方法可以响应中断。当线程在等待锁时，如果被中断，则会抛出 `InterruptedException`。这使得我们可以在需要时优雅地退出等待状态，而不是一直阻塞下去。

## 可尝试与可超时

```java
ReentrantLock lock = new ReentrantLock();

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
        Thread.currentThread().interrupt();
    }
});
```

`tryLock()` 方法尝试获取锁，如果在指定的时间内没有获取到锁，则返回 `false`。这使得我们可以避免长时间等待锁的情况，适用于需要快速响应的场景。

## 多条件等待与唤醒

ReentrantLock 允许我们创建多个条件变量（`Condition`），每个条件变量可以用于不同的线程等待和通知。这样可以实现更复杂的线程间通信机制。

```java
ReentrantLock lock = new ReentrantLock();
Condition conditionA = lock.newCondition();
Condition conditionB = lock.newCondition();

// 线程 A，等待在 conditionA 上
Thread threadA = new Thread(() -> {
    lock.lock();
    try {
        conditionA.await();
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    } finally {
        lock.unlock();
    }
});

// 线程 B，等待在 conditionB 上
Thread threadB = new Thread(() -> {
    lock.lock();
    try {
        conditionB.await();
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    } finally {
        lock.unlock();
    }
});

threadA.start();
threadB.start();

// 确保两个线程都进入等待状态
try {
    Thread.sleep(1000);
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
}


lock.lock();
try {
    // 唤醒等待 conditionA 的线程（只唤醒 A，不影响 B）
    conditionA.signal();
} finally {
    lock.unlock();
}

try {
    Thread.sleep(1000);
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
}

lock.lock();
try {
    // 唤醒等待 conditionB 的线程
    conditionB.signal();
} finally {
    lock.unlock();
}
```

在上面的例子中，我们创建了两个条件变量 `conditionA` 和 `conditionB`。线程 A 等待在 `conditionA` 上，而线程 B 等待在 `conditionB` 上。主线程在适当的时候唤醒这两个条件变量，允许相应的线程继续执行。

> 注意：在使用 `Condition` 时，必须在 `ReentrantLock` 的保护下进行操作。也就是说，在调用 `await()` 和 `signal()` 方法之前，必须先获取锁，并在调用这些方法之后释放锁。这样可以确保线程安全。

我自己通俗的理解是：根据不同的条件变量，线程可以在不同的条件下进行等待和唤醒，这样可以减少虚假唤醒的情况。
