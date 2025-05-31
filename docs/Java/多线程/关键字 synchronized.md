# 关键字 synchronized

`synchronized` 可以确保在同一时间内，最多只有一个线程能够执行被保护的代码段。其本质是通过加锁与释放锁来实现对共享资源的互斥访问。

## 使用方式

`synchronized` 可以用于修饰方法和代码块，不同的使用方式决定了加锁的范围和锁定的对象。

### 修饰方法

当 `synchronized` 关键字用于实例方法时，锁定的是该实例对象（this）。

```java
public synchronized void increment() {
    count++;
}
```

当用于静态方法时，锁定的是该类的 `Class` 对象。

```java
public static synchronized void increment() {
    count++;
}
```

### 修饰代码块

相比于方法级同步，使用代码块可以更精细地控制加锁范围，并能指定任意对象作为锁。

```java
public void increment() {
    synchronized (this) {
        count++;
    }
}
```

此外，也可以使用其他对象作为锁，以实现更细粒度的同步策略：

```java
private final Object lock = new Object();

public void increment() {
    synchronized (lock) {
        count++;
    }
}
```

## 加锁流程

当一个线程执行 `synchronized` 代码块或方法时，JVM 会尝试获取锁。获取锁的过程涉及到对象头中的 Mark Word 和 Monitor 的使用。

### 无锁状态（Unlocked）

对象被创建时默认是无锁状态。

```plain
┌────────────┬────────────────────┬────────┬────┬──────┬────┐
│  unused    │ identity_hashcode  │ unused │age │  0   │ 01 │
│  25 bits   │     31 bits        │ 1 bit  │4bit│ 1bit │2bit│
└────────────┴────────────────────┴────────┴────┴──────┴────┘

# 锁标志位（Lock Flag）: 01
```

### 偏向锁（Biased Lock）

当一个线程第一次访问对象时，JVM 会尝试将对象的 Mark Word 设置为偏向锁状态，以减少后续加锁的开销。并且记录下该线程的 ID。

```plain
┌──────────────────────────┬──────┬──────┬────┬──────┬────┐
│        thread ID         │epoch │unused│age │  1   │ 01 │
│        54 bits           │2bit  │1 bit │4bit│ 1bit │2bit│
└──────────────────────────┴──────┴──────┴────┴──────┴────┘

# 1: 偏向锁标志位（true）
# 01: 锁标志位（仍表示 unlocked 但偏向标志为 1）
```

### 轻量级锁（Lightweight Lock）

当另一个线程尝试访问偏向锁对象时，JVM 会撤销偏向锁，并尝试使用轻量级锁。此时 Mark Word 会被更新为指向一个 Lock Record（锁记录），该记录存储在栈上。

```plain
┌────────────────────────────────────────────┬────┐
│           ptr_to_lock_record               │ 00 │
│                 62 bits                    │2bit│
└────────────────────────────────────────────┴────┘

# 00: 锁标志位，表示轻量级锁
```

轻量级锁使用 `CAS（Compare-And-Swap）`操作来尝试获取锁，如果成功则表示当前线程获得了锁。

### 重量级锁（Heavyweight Lock）

当多个线程竞争轻量级锁时，JVM 会将锁升级为重量级锁，此时 Mark Word 会指向一个 Monitor 对象。

```plain
┌────────────────────────────────────────────┬────┐
│         ptr_to_heavyweight_monitor         │ 10 │
│                 62 bits                    │2bit│
└────────────────────────────────────────────┴────┘

# 10: 重量级锁标志位
```

Monitor 是一个由 JVM 创建的互斥对象，负责管理线程的等待和唤醒，他的结构大致如下：

```java
ObjectMonitor {
    Object* object;         // 被锁定的对象
    Thread* owner;          // 当前持有锁的线程
    EntryList waiters;      // 等待锁的线程队列
    int count;              // 可重入次数
    ...
}
```

## 锁粗化与锁消除

除了锁的升级机制，JVM 还通过锁粗化和锁消除来优化同步性能。

### 锁粗化（Lock Coarsening）

锁粗化是指将多个连续的小同步块合并为一个大同步块，以减少加锁和解锁的次数，提升性能。

```java
// 原始
for (int i = 0; i < 100; i++) {
    synchronized(lock) {
        buffer.append(i);
    }
}

// JVM 自动优化后
synchronized(lock) {
    for (int i = 0; i < 100; i++) {
        buffer.append(i);
    }
}
```

### 锁消除（Lock Elision）

锁消除是指 JVM 通过逃逸分析，在确定对象不会被多个线程访问时，自动移除无必要的同步操作，从而提升性能。

```java
// 如果 str 没有逃逸出当前线程，JVM 会在编译时移除 StringBuilder 内部的 synchronized 修饰
StringBuilder str = new StringBuilder();
```
