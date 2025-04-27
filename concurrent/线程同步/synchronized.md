# 理解 synchronized 关键字

在 Java 并发编程中，线程同步是一个不可或缺的主题。`synchronized` 作为 Java 最基础的同步机制，用于保证多个线程访问共享资源时的数据一致性与线程安全。本文将围绕其使用方式、底层实现和性能优化等方面进行深入剖析。

## 1. 同步机制基础

在多线程环境中，多个线程可能同时访问和修改共享资源，从而导致数据不一致或程序异常。为解决这一问题，Java 提供了多种同步手段，其中最经典的就是 `synchronized` 关键字。

`synchronized` 可以确保在同一时间内，最多只有一个线程能够执行被保护的代码段。其本质是通过加锁与释放锁来实现对共享资源的互斥访问。

## 2. 使用方式详解

`synchronized` 可以用于修饰方法和代码块，不同的使用方式决定了加锁的范围和锁定的对象。

### 2.1 方法级别的同步

当 `synchronized` 关键字用于实例方法时，锁定的是该实例对象（this）。

```java
public synchronized void increment() {
    count++;
}
```

当用于静态方法时，锁定的是该类的 `Class` 对象。

```java
public static synchronized void log() {
    // 静态同步方法，锁的是类的 Class 对象
}
```

### 2.2 代码块的同步控制

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

public void safeIncrement() {
    synchronized (lock) {
        count++;
    }
}
```

## 3. 内部实现原理

`synchronized` 背后依赖的是 JVM 的 Monitor（监视器锁）机制。

### 3.1 对象头与内存布局

在 HotSpot 虚拟机中，每个对象在内存中的布局包括三个部分：

```plain
┌────────────┬────────────────────┬───────────────┐
│ Mark Word  │  Class Pointer     │ Instance Data │
└────────────┴────────────────────┴───────────────┘
```

- Mark Word（标记字段）：用于存储对象的运行时数据，如哈希码、GC分代年龄、锁信息等。
- Class Pointer：指向对象的类元数据（即 class 文件加载后的数据结构）。
- Instance Data：对象的实际字段数据（成员变量等）。

### 3.2 Mark Word 的结构

Mark Word 的二进制结构会根据锁状态动态变化。以 64 位 JVM 为例，其结构如下：

**无锁状态（Unlocked）**

```plain
┌────────────┬────────────────────┬────────┬────┬──────┬────┐
│  unused    │ identity_hashcode  │ unused │age │  0   │ 01 │
│  25 bits   │     31 bits        │ 1 bit  │4bit│ 1bit │2bit│
└────────────┴────────────────────┴────────┴────┴──────┴────┘
```

- 01：锁标志位，表示“未锁定”状态

**偏向锁（Biased Locking）**

```plain
┌──────────────────────────┬──────┬──────┬────┬──────┬────┐
│        thread ID         │epoch │unused│age │  1   │ 01 │
│        54 bits           │2bit  │1 bit │4bit│ 1bit │2bit│
└──────────────────────────┴──────┴──────┴────┴──────┴────┘
```

- 1：偏向锁标志位（true）
- 01：锁标志位（仍表示 unlocked 但偏向标志为 1）

**轻量级锁（Lightweight Lock）**

```plain
┌────────────────────────────────────────────┬────┐
│           ptr_to_lock_record               │ 00 │
│                 62 bits                    │2bit│
└────────────────────────────────────────────┴────┘
```

- 00：锁标志位，表示轻量级锁

**重量级锁（Heavyweight Lock）**

```plain
┌────────────────────────────────────────────┬────┐
│         ptr_to_heavyweight_monitor         │ 10 │
│                 62 bits                    │2bit│
└────────────────────────────────────────────┴────┘
```

- 10: 标志为重量级锁

**GC 标记状态（Marked for GC）**

```plain
┌────────────────────────────────────────────┬────┐
│              GC-specific bits              │ 11 │
│                 62 bits                    │2bit│
└────────────────────────────────────────────┴────┘
```

- 11: GC 或其他特殊阶段标记位

### 3.3 Monitor 的结构

当一个线程进入同步代码块时，JVM 会为其关联一个 Monitor 对象。Monitor 是 JVM 在 native 层实现的一种互斥工具，它的结构大致如下：

```java
ObjectMonitor {
    Object* object;         // 被锁定的对象
    Thread* owner;          // 当前持有锁的线程
    EntryList waiters;      // 等待锁的线程队列
    int count;              // 可重入次数
    ...
}
```

Monitor 不存在于 Java 对象中，而是由 JVM 在 native 堆中维护。一旦线程成功加锁，对象头中的 Mark Word 会指向对应的 Monitor 实例。

### 3.3 加锁与解锁流程

当线程执行 `synchronized(obj)` 时，JVM 的处理流程大致如下：

加锁流程：

1. 线程尝试在 Mark Word 中使用 CAS 操作获取锁。
2. 如果是无锁状态，直接变为偏向锁或轻量级锁。
3. 如果 CAS 失败，说明有竞争，升级为重量级锁。
4. Mark Word 中的内容替换为指向 ObjectMonitor 的指针。
5. Monitor 中记录当前线程为 owner，其它线程阻塞等待。

解锁流程：

1. 线程执行完同步代码块后，重置 Mark Word 为无锁状态。
2. 如果还有其他线程在等待 Monitor，则唤醒一个线程。

这种机制确保了多线程之间的互斥访问。

**CAS简单介绍**

`CAS（Compare-And-Swap）` 是一种由硬件（CPU）原子指令支持的原语操作。

它的作用是：对一个变量进行“乐观尝试性更新” —— 只有当变量当前的值和我们预期的一致时，才会被成功更新，否则什么都不做。

```java
boolean CAS(Variable V, Expected E, NewValue N) {
    if (V == E) {
        V = N;     // 替换成功
        return true;
    } else {
        return false;  // 替换失败，说明被其他线程修改过
    }
}
```

CAS 是一种非阻塞的同步方式：不会阻止其他线程运行，只是如果失败了就自己重试或升级锁。

### 3.4 锁的粒度

`synchronized` 锁定的粒度是 对象级别，即锁定的是对象的 Monitor。这意味着当多个线程同时访问同一个对象的同步方法或代码块时，它们会被串行化执行，避免了并发带来的数据不一致问题。

## 4. JVM 中的锁优化机制

从 Java 5 开始，JVM 对 `synchronized` 的性能做了大量优化。主要通过锁的升级机制与编译器层面的优化，降低同步开销。

### 4.1 锁的升级路径

为了在并发场景中兼顾性能与线程安全性，JVM 设计了分阶段的锁策略，根据竞争程度逐步升级：

```plain
偏向锁（Biased） → 轻量级锁（Lightweight） → 重量级锁（Heavyweight）
```

#### 4.1.1 偏向锁（Biased Locking）

偏向锁是专为单线程访问对象的场景设计的，它通过在 Mark Word 中记录第一个访问该对象的线程 ID，来避免后续加解锁。

只有当另一个线程尝试访问时，JVM 才会撤销偏向状态，并进入下一阶段。

#### 4.1.2 轻量级锁（Lightweight Locking）

当另一个线程尝试竞争偏向锁时，JVM 会撤销偏向锁，并尝试使用轻量级锁。此时不会立即阻塞线程，而是使用CAS机制尝试获取锁。

轻量级锁原理:

1. 线程创建 Lock Record（栈上结构）；
2. 使用 CAS 将对象的 Mark Word 替换为指向 Lock Record 的指针；
3. 若替换成功，表示获得锁；否则自旋等待或升级为重量级锁。

#### 4.1.3 重量级锁（Heavyweight Locking）

当多个线程竞争轻量级锁时，JVM 会将锁升级为重量级锁，此时锁的实现依赖于操作系统的互斥量（mutex）。线程获取锁时会发生上下文切换，这会导致性能下降。

重量级锁虽然确保了多线程之间的安全访问，但性能较差，因为上下文切换和操作系统的资源管理会增加额外的开销。

### 4.2 锁粗化与锁消除

除了锁的升级机制，JVM 还通过锁粗化和锁消除来优化同步性能。

#### 4.2.1 锁粗化（Lock Coarsening）

锁粗化是指将多个短小的同步块合并成一个较大的同步块，从而减少频繁加锁和释放锁的开销。锁粗化适用于连续多次访问共享资源的情况。

原始:

```java
for (int i = 0; i < 100; i++) {
    synchronized(lock) {
        buffer.append(i);
    }
}
```

JVM 自动优化后:

```java
synchronized(lock) {
    for (int i = 0; i < 100; i++) {
        buffer.append(i);
    }
}
```

#### 4.2.2 锁消除（Lock Elision）

锁消除是指在编译阶段，JVM 会根据代码的分析(逃逸分析判断)，发现某些锁操作不涉及共享资源，从而去除这些不必要的锁。例如，JVM 可以自动消除那些在单线程环境下永远不会被竞争的锁。

```java
public String concat(String a, String b) {
    StringBuilder sb = new StringBuilder(); // 其方法内部是同步的
    sb.append(a);
    sb.append(b);
    return sb.toString();
}
```

- sb 没有逃出当前线程；
- JVM 会在编译时移除 `StringBuilder` 内部的 `synchronized` 修饰，提升效率。
