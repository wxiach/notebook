# 线程池 ThreadPoolExecutor

创建线程池最好使用构造方法 `ThreadPoolExecutor`，方便更好的控制线程池的参数。

```java
public ThreadPoolExecutor(int corePoolSize,
                          int maximumPoolSize,
                          long keepAliveTime,
                          TimeUnit unit,
                          BlockingQueue<Runnable> workQueue,
                          ThreadFactory threadFactory,
                          RejectedExecutionHandler handler)
```

| 参数名称          | 说明                                                     |
| ----------------- | -------------------------------------------------------- |
| `corePoolSize`    | 核心线程数，线程池中始终保持的线程数量                   |
| `maximumPoolSize` | 最大线程数，线程池中允许的最大线程数量                   |
| `keepAliveTime`   | 非核心线程的存活时间，超过这个时间未被使用的线程会被回收 |
| `unit`            | 时间单位，通常使用 `TimeUnit.SECONDS`                    |
| `workQueue`       | 任务队列，用于存放待执行的任务                           |
| `threadFactory`   | 线程工厂，用于创建新线程                                 |
| `handler`         | 拒绝策略，当线程池和队列都满了时，如何处理新提交的任务   |
