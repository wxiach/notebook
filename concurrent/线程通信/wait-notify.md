# wait-notify 使用全解

本文以 wait-notify 为核心，介绍其在线程协作中的三种常见演进模式，包括基础条件等待、保护性暂停及生产者消费者模型。

## 1. wait-notify 机制

`wait()` 和 `notify()` 是依赖**对象监视器**（即 `synchronized` 的锁对象）进行通信的方式。一个线程可以调用 `wait()` 主动放弃锁并进入等待队列，直到另一个线程通过 `notify()` 或 `notifyAll()` 唤醒它。

这些方法只能在持有锁的前提下使用，否则会抛出 `IllegalMonitorStateException`。

### 1.1 基本示例

```java
class MailBox {
    private final Object lock = new Object();
    private boolean hasMail = false;

    public void waitForMail() throws InterruptedException {
        synchronized (lock) {
            while (!hasMail) {
                lock.wait(); // 当前线程进入等待状态，并释放锁
            }
        }
    }

    public void deliverMail() {
        synchronized (lock) {
            hasMail = true;
            lock.notify(); // 唤醒一个正在等待 lock 的线程
        }
    }
}
```

> `wait()` 会释放锁，而 `sleep()` 不会。

### 1.2 虚假唤醒

JVM 允许虚假唤醒，因此在等待前必须用 `while` 判断条件，避免提前继续。

```java
while (!condition) {
    lock.wait(); // 等待前一定要判断，防止条件不成立也被唤醒
}
```

### 1.3 多线程场景

当有多个线程在等待时，使用 `notify()` 可能导致唤醒了不满足条件的线程，从而造成“线程被唤醒但又继续等待”的情况。更保险的做法是使用 `notifyAll()`，并配合 `while`。

```java
synchronized (lock) {
    hasMail = true;
    lock.notifyAll(); // 通知所有等待线程，再由各线程判断条件是否满足
}
```

## 2. 保护性暂停

保护性暂停（Guarded Suspension）适用于「一对一等待」的场景。例如：一个线程等待另一个线程返回结果。这种等待往往带有超时控制，并且希望结果与请求线程绑定在一起。

### 2.1 代码示例

```java
class GuardedObject {
    private Object result;

    // 等待结果，支持超时
    public synchronized Object get(long timeout) {
        long start = System.currentTimeMillis();
        long elapsed = 0;

        while (result == null) {
            long remaining = timeout - elapsed;
            if (remaining <= 0) break;

            try {
                wait(remaining); // 等待一段时间
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            elapsed = System.currentTimeMillis() - start;
        }
        return result;
    }

    // 设置结果并通知等待线程
    public synchronized void complete(Object value) {
        this.result = value;
        notifyAll(); // 唤醒正在等待的线程
    }
}
```

下面的例子展示了：一个线程等待结果，另一个线程负责提供结果，二者通过 `GuardedObject` 协调。

```java
public class Example {
    public static void main(String[] args) {
        GuardedObject go = new GuardedObject();

        new Thread(() -> {
            Object res = go.get(3000); // 最多等待3秒
            System.out.println("Got result: " + res);
        }).start();

        new Thread(() -> {
            try {
                Thread.sleep(1000); // 模拟执行耗时任务
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            go.complete("Hello"); // 提供结果
        }).start();
    }
}
```

### 2.2 多对多场景

当多个线程同时发出请求，另有多个线程异步返回结果时，可使用 `GuardedObject` 和请求 ID 组合管理“多对多”的一一对应关系。

使用 `ConcurrentHashMap` 来管理多个 `GuardedObject`，以 ID 作为唯一标识，实现线程之间的「定向等待」。

```java
class MailBoxes {
    private static final Map<Integer, GuardedObject> boxes = new ConcurrentHashMap<>();
    private static final AtomicInteger idGenerator = new AtomicInteger(1);

    // 生成唯一 id
    public static int generateId() {
        return idGenerator.getAndIncrement();
    }

    // 创建新的等待容器
    public static GuardedObject createGuardedObject(int id) {
        GuardedObject go = new GuardedObject();
        boxes.put(id, go);
        return go;
    }

    // 获取并移除对应容器
    public static GuardedObject removeGuardedObject(int id) {
        return boxes.remove(id);
    }
}
```

多个请求线程

```java
for (int i = 0; i < 3; i++) {
    final int id = MailBoxes.generateId();
    final GuardedObject go = MailBoxes.createGuardedObject(id);

    new Thread(() -> {
        System.out.println("Thread " + id + " waiting for result...");
        Object result = go.get(5000); // 最多等待 5 秒
        System.out.println("Thread " + id + " got result: " + result);
    }).start();
}
```

多个响应线程

```java
for (Integer id : MailBoxes.getIds()) {
    new Thread(() -> {
        try {
            Thread.sleep(new Random().nextInt(3000)); // 模拟延迟
            GuardedObject go = MailBoxes.removeGuardedObject(id);
            if (go != null) {
                go.complete("Result for ID " + id);
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }).start();
}
```

### 2.3 保护性暂停特例

`Thread.join()` 实际上也是一种等待，只不过它等待的是线程的生命周期结束，而不是某个结果。内部也是使用 wait() 实现的：

```java
public final void join(long millis) throws InterruptedException {
    if (millis < 0)
        throw new IllegalArgumentException("timeout value is negative");

    if (this instanceof VirtualThread vthread) {
        if (isAlive()) {
            long nanos = MILLISECONDS.toNanos(millis);
            vthread.joinNanos(nanos);
        }
        return;
    }

    synchronized (this) {
        if (millis > 0) {
            if (isAlive()) {
                final long startTime = System.nanoTime();
                long delay = millis;
                do {
                    wait(delay);
                } while (isAlive() && (delay = millis -
                          NANOSECONDS.toMillis(System.nanoTime() - startTime)) > 0);
            }
        } else {
            while (isAlive()) {
                wait(0);
            }
        }
    }
}
```

## 3. 生产者-消费者模式

当一个线程不断生成数据，另一个线程负责处理数据时，就属于「生产者-消费者模型」。为了防止资源争用或重复处理，生产和消费需要通过共享的缓冲区协调。

```java
class MessageQueue {
    private final LinkedList<String> queue = new LinkedList<>();
    private final int capacity = 10;

    // 生产者放入数据
    public synchronized void put(String message) {
        while (queue.size() == capacity) {
            try {
                wait(); // 缓冲区满时等待
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        queue.addLast(message); // 添加消息
        notifyAll(); // 通知消费者
    }

    // 消费者取出数据
    public synchronized String take() {
        while (queue.isEmpty()) {
            try {
                wait(); // 缓冲区空时等待
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        String msg = queue.removeFirst(); // 消费消息
        notifyAll(); // 通知生产者
        return msg;
    }
}
```

下面的例子展示了一个简单的生产者-消费者模型:

```java
public class Main {
    public static void main(String[] args) {
        MessageQueue queue = new MessageQueue();

        // 消费者线程
        new Thread(() -> {
            while (true) {
                String msg = queue.take();
                System.out.println("Consumed: " + msg);
            }
        }).start();

        // 生产者线程
        new Thread(() -> {
            for (int i = 0; i < 20; i++) {
                queue.put("msg-" + i);
                System.out.println("Produced: msg-" + i);
            }
        }).start();
    }
}
```
