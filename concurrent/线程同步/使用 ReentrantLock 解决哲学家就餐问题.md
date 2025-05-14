# 使用 ReentrantLock 解决哲学家就餐问题

哲学家就餐问题是一个经典的同步问题，描述了五位哲学家坐在圆桌旁，每位哲学家用餐时需要同时拿起左边和右边的叉子。
如果没有足够的叉子，哲学家就会饿死。

## 问题复现

假设我们用 `synchronized` 来实现这个问题，代码如下：

```java

Object[] forks = new Object[5];

// 初始化叉子
for (int i = 0; i < 5; i++) {
    forks[i] = new Object();
}

for (int i = 0; i < 5; i++) {
    int philosopher = i;
    new Thread(() -> {
        Object leftFork = forks[philosopher];
        Object rightFork = forks[(philosopher + 1) % 5];

        while (true) {
            try {
                // 思考
                Thread.sleep(500);

                synchronized (leftFork) {
                    synchronized (rightFork) {
                        // 吃饭
                        Thread.sleep(500);
                    }
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }).start();
}

```

上面是一个哲学家就餐问题的简单实现。我们使用 `synchronized` 来锁住每个叉子，确保同一时间只有一个哲学家可以使用它们。

但是，这种实现方式可能会导致死锁，因为每个哲学家在拿起左边的叉子时，可能会等待右边的叉子，而右边的哲学家也在等待左边的叉子。
这就导致了死锁的发生。

## 方案一：控制哲学家拿起叉子的顺序

可以通过控制哲学家拿起叉子的顺序来避免死锁。我们可以让偶数编号的哲学家先拿起左边的叉子，然后再拿起右边的叉子，而奇数编号的哲学家则先拿起右边的叉子，然后再拿起左边的叉子。

```java
Object[] forks = new Object[5];

for (int i = 0; i < 5; i++) {
    forks[i] = new Object();
}

for (int i = 0; i < 5; i++) {
    int philosopher = i;
    new Thread(() -> {
        Object leftFork = forks[philosopher];
        Object rightFork = forks[(philosopher + 1) % 5];

        while (true) {
            try {
                // 思考
                Thread.sleep(500);

                if (philosopher % 2 == 0) {
                    synchronized (leftFork) {
                        synchronized (rightFork) {
                            // 吃饭
                            Thread.sleep(500);
                        }
                    }
                } else {
                    synchronized (rightFork) {
                        synchronized (leftFork) {
                            // 吃饭
                            Thread.sleep(500);
                        }
                    }
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }).start();
}
```

这种解决方案的本质是为了破坏死锁的条件之一：**循环等待**。通过控制哲学家拿起叉子的顺序，我们可以确保不会出现循环等待的情况，从而避免死锁的发生。

## 方案二：使用 ReentrantLock

`synchronized` 一旦加锁就不能被中断，直到执行完毕才会释放锁，这就导致了死锁的发生。而 `ReentrantLock` 允许我们尝试获取锁，并在获取失败时放弃当前的尝试，这样可以避免死锁的发生。

```java
// forks 既是锁也是资源
ReantrantLock[] forks = new ReentrantLock[5];

for (int i = 0; i < 5; i++) {
    forks[i] = new ReentrantLock();
}

for (int i = 0; i < 5; i++) {
    int philosopher = i;
    new Thread(() -> {
        ReentrantLock leftFork = forks[philosopher];
        ReentrantLock rightFork = forks[(philosopher + 1) % 5];

        while (true) {
            try {
                // 思考
                Thread.sleep(500);

                // 尝试获取左叉子
                if (leftFork.tryLock(1, TimeUnit.SECONDS)) {
                    try {
                        // 尝试获取右叉子
                        if (rightFork.tryLock(1, TimeUnit.SECONDS)) {
                            try {
                                // 吃饭
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
                Thread.currentThread().interrupt();
            }
        }
    }).start();
}
```

在这个实现中，我们使用 `ReentrantLock` 来代替 `synchronized`。我们尝试获取左叉子和右叉子，如果获取失败，则放弃当前的尝试，继续思考。这样可以避免死锁的发生。
