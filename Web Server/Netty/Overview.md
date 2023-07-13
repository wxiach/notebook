Official Docs: https://netty.io/wiki/user-guide-for-4.x.html

> The Netty project is an effort to provide an asynchronous event-driven network application framework and tooling for the rapid development of maintainable high-performance and high-scalability protocol servers and clients.

从Netty的定义，主要关注三个点：

1. asynchronous event-driven - 异步事件驱动
2. high-performance - 高性能
3. high-scalability - 高可扩展性

## 基础概念

**Channel**
代表一个到实体（如硬件设备、文件、网络套接字等）的开放连接

**EventLoop**
处理I/O操作的循环，在Netty中，每个Channel都有一个与之关联的EventLoop

**Pipeline**
一个处理I/O事件的处理器链，每个Channel都有一个与之关联的Pipeline
