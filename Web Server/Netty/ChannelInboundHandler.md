> Netty中处理入站I/O事件的Handler

`ChannelInboundHandlerAdapter`是ChannelInboundHandler的一个实现，它提供了此接口中方法的默认实现。这使得您可以只重写您感兴趣的方法，而不是所有方法。

`SimpleChannelInboundHandler`是 ChannelInboundHandlerAdapter的一个特化版本，旨在简化特定类型的入站消息处理。并且可以自动管理资源的释放。

## channelRegistered

当Channel已经注册到其EventLoop，并且可以处理I/O时被调用

## channelUnregistered

当Channel已经从其EventLoop中注销，并且不可以处理I/O时被调用

## channelActive

当Channel已经连接并且已经就绪时被调用。

## channelInactive

当Channel已经断开连接时被调用。

## channelRead

当从Channel读取数据时被调用。

## exceptionCaught

当处理I/O时出现异常时被调用。
