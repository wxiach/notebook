为了实现在一个Server中，可以同时运行多个Web应用程序的问题，Tomcat实现了一种打破双亲委派规则的类加载器。

## 双亲委派模型

要理解双亲委派模型，需要先了解一下Java中的类加载器。

类加载器，它负责将Java类从文件系统或者其他来源（类的加载器会根据类的全限定名去寻找对应的字节码文件），加载到JVM虚拟机中。

类的加载器会根据类的全限定名去寻找对应的字节码文件。他的整个加载过程可以分为以下几个步骤：

| 加载   | 类加载器查找 `.class` 文件，并将其加载为字节流         |
| ------ | ------------------------------------------------------ |
| 验证   | 确保加载的代码符合Java虚拟机的规范，避免注入恶意代码。 |
| 准备   | 为类分配内存，并设置静态变量的初始值                   |
| 解析   | 将常量池中的符号引用，转换为直接引用                   |
| 初始化 | 执行类的静态初始化代码，如静态块                       |

在Java中，通常有几种标准的类加载器，分别用于加载不同来源的类：

| BooClassLoader 启动类加载器      | 加载JVM核心类库，如rt.jar中的类                                  |
| -------------------------------- | ---------------------------------------------------------------- |
| PlatformClassLoader 平台类加载器 | 替代了ExtClassLoader，加载JDK扩展模块的类（如lib/modules中的类） |
| App ClassLoader 应用类加载器     | 加载应用程序类路径（classpath）下的类                            |

![[Pasted image 20250302182622.png]]

BootClassLoader、PlatformClassLoader、AppClassLoader 都继承自BuiltinClassLoader。值得注意的是，启动类，平台类和应用类加载器之间的父子关系，并不是通过继承来实现的，而是通过组合，即使用parent变量来保存父加载器的引用。

> 为了保持向后兼容，BootClassLoader不可以被引用。

双亲委派机制——当一个类加载器收到了一个类的加载请求的时候，它不会先尝试自己去加载这个类，而是把这个请求转交给父类加载器。直到父类加载器找不到该类时，才会让子类去加载。因为JKD9模块化的原因，PlatformClassLoader会先尝试自己加载。

```java
protected Class<?> loadClass(String name, boolean resolve)
	throws ClassNotFoundException
{
	synchronized (getClassLoadingLock(name)) {
		// First, check if the class has already been loaded
		Class<?> c = findLoadedClass(name);
		if (c == null) {
			long t0 = System.nanoTime();
			try {
				if (parent != null) {
					c = parent.loadClass(name, false);
				} else {
					c = findBootstrapClassOrNull(name);
				}
			} catch (ClassNotFoundException e) {
				// ClassNotFoundException thrown if class not found
				// from the non-null parent class loader
			}

			if (c == null) {
				// If still not found, then invoke findClass in order
				// to find the class.
				long t1 = System.nanoTime();
				c = findClass(name);

				// this is the defining class loader; record the stats
				PerfCounter.getParentDelegationTime().addTime(t1 - t0);
				PerfCounter.getFindClassTime().addElapsedTimeFrom(t1);
				PerfCounter.getFindClasses().increment();
			}
		}
		if (resolve) {
			resolveClass(c);
		}
		return c;
	}
}
```

双亲委派机制存在，其实就是为了系统安全而设立的，它可以保证JVM中的核心类库不会被用户自己定义的类覆盖。同时也避免了类的重复加载。

## Tomcat对双亲委派的破坏

先引出两个问题，简单理解为什么Tomcat要破坏双亲委派机制：

1. Tomcat是怎么做到热部署的？

   在JVM中，是通过类的类加载器实例和全限定名去唯一确定一个类的。所以，当我们完成对一个JSP文件的修改以后，它的全限定名是不会变的，要实现对该文件的重写加载，必须要创建一个新的类加载器。

2. Tomcat怎么做到多应用部署在同一个JVM中的？

   多个程序依赖相同的第三方库，但这些库的版本号不一致——全限定名是一致的，那Tomcat要的是必须为每一个应用加载版本正确的第三方库。

要解决上述两个问题，我们必须打破双亲委派规则，也就是实现自己的类加载器，重写 `loadClass` 和 `findClass` 方法。

Tomcat怎么打破的就不继续细说。它打破的实际上是AppClassLoader这一层，他在查类的过程中，会先去判断是否类已经加载，如果没有则会让BootClassLoader去加载，直到BootClassLoader找不到才会让自己去加载。
