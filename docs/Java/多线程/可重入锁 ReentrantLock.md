# 可重入锁 ReentrantLock

`ReentrantLock` 实现了 `Lock` 接口，是一个可重入且独占式锁。它比传统的 `synchronized` 关键字更灵活，允许更复杂的线程同步控制。

可重入锁是指线程可以再次获取自己已经获取的锁，而不会导致死锁。

## 基本使用

不同于`synchronized`， `ReentrantLock` 是 Java 代码实现的锁，必须手动加锁和解锁。

```java
ReentrantLock lock = new ReentrantLock(); // 创建 ReentrantLock 锁对象

lock.lock(); // 进入临界区之前获取锁

try {

} finally {
    lock.unlock(); // 一般在 finally 块中解锁，以确保即使发生异常也能释放锁
}
```

### 允许被中断

如果要创建一个可以响应中断的锁，可以使用 `lockInterruptibly()` 方法。

```java
ReentrantLock lock = new ReentrantLock();

Thread thread = new Thread(() -> {
    try {
        lock.lockInterruptibly();
        try {

        } finally {
            lock.unlock();
        }
    } catch (InterruptedException e) {
        // 处理线程被中断的情况
        Thread.currentThread().interrupt();
    }
});
```

### 设置超时时间

为了避免线程长时间等待锁，可以使用 `tryLock(long timeout, TimeUnit unit)` 方法来设置获取锁的超时时间。

```java
ReentrantLock lock = new ReentrantLock();

Thread thread = new Thread(() -> {
    try {
        if (lock.tryLock(1, TimeUnit.SECONDS)) {
            try {

            } finally {
                lock.unlock();
            }
        } else {
            // 获取锁失败，处理其他逻辑
        }
    } catch (InterruptedException e) {}
});
```

### 更细粒度的唤醒机制

通过让线程等待在不同的条件变量上，可以实现更细粒度的唤醒机制。

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
}


// 唤醒等待 conditionA 的线程（只唤醒 A，不影响 B）
lock.lock();
try {
    conditionA.signal();
} finally {
    lock.unlock();
}

try {
    Thread.sleep(1000);
} catch (InterruptedException e) {
}

// 唤醒等待 conditionB 的线程
lock.lock();
try {
    conditionB.signal();
} finally {
    lock.unlock();
}
```

> 注意：在调用 `await()` 和 `signal()` 方法之前，必须先获取锁，并在调用这些方法之后释放锁。这样可以确保线程安全。

## 哲学家就餐问题

五位哲学家坐在圆桌旁，每位哲学家用餐时需要「同时拿起左边和右边的叉子」。如果没有足够的叉子，哲学家就会饿死。

```java
// 创建五把叉子，每把叉子用一个 ReentrantLock 表示，所以叉子既是共享资源又是锁。
ReantrantLock[] forks = new ReentrantLock[5];
for (int i = 0; i < 5; i++) {forks[i] = new ReentrantLock();}

// 创建五个线程表示五位哲学家
for (int philosopher = 0; philosopher < 5; philosopher++) {

    new Thread(() -> {
        ReentrantLock leftFork = forks[philosopher];
        ReentrantLock rightFork = forks[(philosopher + 1) % 5];

        while (true) {
            try {
                Thread.sleep(500); // 模拟哲学家思考
                // 为了避免死等，这里使用 tryLock 尝试获取叉子
                if (leftFork.tryLock(1, TimeUnit.SECONDS)) {
                    try {
                        // 如果哲学家获取到了左叉子，就会尝试获取右叉子
                        if (rightFork.tryLock(1, TimeUnit.SECONDS)) {
                            try {
                                Thread.sleep(500);
                            } finally {
                                rightFork.unlock();
                            }
                        }
                    } finally {
                        leftFork.unlock();
                    }
                }
            } catch (InterruptedException e) {
            }
        }
    }).start();
}
```

这个实现可以避免死锁，是因为哲学家如果无法获取到右叉子，就会放下左叉子，重新开始思考。这样就不会有哲学家一直持有一个叉子而等待另一个叉子的情况。
