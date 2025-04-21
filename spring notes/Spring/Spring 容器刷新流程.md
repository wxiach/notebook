# Spring 容器刷新流程

这篇文章主要讲解Spring容器的刷新过程，也就是AbstractApplicationContext中的`refresh()`方法。

> 在我简单读完Spring的源码以后，我发现这个方法在整个框架中是非常核心的存在。Spring源码的层次感特别鲜明，好像一棵大树，每一个功能从树干开始生长，经过树枝，直至延申到树叶，这样每一个功能的细节，都可以通过不同的树叶的上的纹理来了解。

而我们今天要阅读的代码，就是树干。我们不去关心实现细节，只关心整个Spring是如何被一步一步创建起来的。

话不多说，我们直接上源码。这个方法的每一行代码，Spring都为其写下了注释，我就不再做重复的工作了。只要有一点Spring源码阅读基础，是可以看懂下面的注释的。

```java
	@Override
	public void refresh() throws BeansException, IllegalStateException {
		this.startupShutdownLock.lock();
		try {
			this.startupShutdownThread = Thread.currentThread();

			StartupStep contextRefresh = this.applicationStartup.start("spring.context.refresh");

			// Prepare this context for refreshing.
			prepareRefresh();

			// Tell the subclass to refresh the internal bean factory.
			ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();

			// Prepare the bean factory for use in this context.
			prepareBeanFactory(beanFactory);

			try {
				// Allows post-processing of the bean factory in context subclasses.
				postProcessBeanFactory(beanFactory);

				StartupStep beanPostProcess = this.applicationStartup.start("spring.context.beans.post-process");
				// Invoke factory processors registered as beans in the context.
				invokeBeanFactoryPostProcessors(beanFactory);
				// Register bean processors that intercept bean creation.
				registerBeanPostProcessors(beanFactory);
				beanPostProcess.end();

				// Initialize message source for this context.
				initMessageSource();

				// Initialize event multicaster for this context.
				initApplicationEventMulticaster();

				// Initialize other special beans in specific context subclasses.
				onRefresh();

				// Check for listener beans and register them.
				registerListeners();

				// Instantiate all remaining (non-lazy-init) singletons.
				finishBeanFactoryInitialization(beanFactory);

				// Last step: publish corresponding event.
				finishRefresh();
			}

			catch (RuntimeException | Error ex ) {
				if (logger.isWarnEnabled()) {
					logger.warn("Exception encountered during context initialization - " +
							"cancelling refresh attempt: " + ex);
				}

				// Destroy already created singletons to avoid dangling resources.
				destroyBeans();

				// Reset 'active' flag.
				cancelRefresh(ex);

				// Propagate exception to caller.
				throw ex;
			}

			finally {
				contextRefresh.end();
			}
		}
		finally {
			this.startupShutdownThread = null;
			this.startupShutdownLock.unlock();
		}
	}

```

看完上面的代码，让我来结合自己的理解，对这个方法的功能做一个简单的总结。

## 第一步，创建BeanFactory

Spring中的所有Bean对象，都是通过BeanFactory存储和管理的，而ApplicationContext只是其门面模式 （Facade Pattern），并在其基础上提供了更多的企业级特性。

所以，需要先创建一个BeanFactory，这是一个Container的核心。

## 第二步，执行BeanFactoryPostProcessor

所谓的BeanFactoryPostProceesor，是一个函数式接口。可以通过这个接口，编写一些修改BeanFactory的代码。

```java
@FunctionalInterface
public interface BeanFactoryPostProcessor {

	/**
	 * Modify the application context's internal bean factory after its standard
	 * initialization. All bean definitions will have been loaded, but no beans
	 * will have been instantiated yet. This allows for overriding or adding
	 * properties even to eager-initializing beans.
	 * @param beanFactory the bean factory used by the application context
	 * @throws org.springframework.beans.BeansException in case of errors
	 */
	void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException;

}
```

比如最典型的ConfigurationClassPostProcessor，就是一个BeanFactoryPostProcessor。通过这个类，我们可以实现对配置类的解析，并加载配置类中定义的Bean对象。

> 添加BeanFactoryPostProcessor到容器里面的方法，最常用的就是通过Java Configuation的方式，或者直接调用AbstractApplicationContext 提供的方法addBeanFactoryPostProcessor()

```java
@Override
	public void addBeanFactoryPostProcessor(BeanFactoryPostProcessor postProcessor) {
		Assert.notNull(postProcessor, "BeanFactoryPostProcessor must not be null");
		this.beanFactoryPostProcessors.add(postProcessor);
	}
```

如果我们观察得仔细，就可以发现postProcessBeanFactory这个方法，在refresh()中也出现了。这是一个模板方法，为Spring内部提供了一个扩展点，需要注意的是这个方法的执行时机先于invokeBeanFactoryPostProcessors()。

总的来说，在这一步我们会实例化并执行所有的BeanFactoryPostProcessor

## 第三步，注册BeanPostProcessor

BeanPostProcessor也是一个接口，这个接口有两个方法。通过方法名及注释可以理解到，方法分别在bean对象初始化前后调用，也就是依赖注入后。所以他的功能，就是实现了对bean实例的修改。

```java
public interface BeanPostProcessor {

	/**
	 * Apply this {@code BeanPostProcessor} to the given new bean instance <i>before</i> any bean
	 * initialization callbacks (like InitializingBean's {@code afterPropertiesSet}
	 * or a custom init-method). The bean will already be populated with property values.
	 * The returned bean instance may be a wrapper around the original.
	 * <p>The default implementation returns the given {@code bean} as-is.
	 * @param bean the new bean instance
	 * @param beanName the name of the bean
	 * @return the bean instance to use, either the original or a wrapped one;
	 * if {@code null}, no subsequent BeanPostProcessors will be invoked
	 * @throws org.springframework.beans.BeansException in case of errors
	 * @see org.springframework.beans.factory.InitializingBean#afterPropertiesSet
	 */
	default @Nullable Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
		return bean;
	}

	/**
	 * Apply this {@code BeanPostProcessor} to the given new bean instance <i>after</i> any bean
	 * initialization callbacks (like InitializingBean's {@code afterPropertiesSet}
	 * or a custom init-method). The bean will already be populated with property values.
	 * The returned bean instance may be a wrapper around the original.
	 * <p>In case of a FactoryBean, this callback will be invoked for both the FactoryBean
	 * instance and the objects created by the FactoryBean (as of Spring 2.0). The
	 * post-processor can decide whether to apply to either the FactoryBean or created
	 * objects or both through corresponding {@code bean instanceof FactoryBean} checks.
	 * <p>This callback will also be invoked after a short-circuiting triggered by a
	 * {@link InstantiationAwareBeanPostProcessor#postProcessBeforeInstantiation} method,
	 * in contrast to all other {@code BeanPostProcessor} callbacks.
	 * <p>The default implementation returns the given {@code bean} as-is.
	 * @param bean the new bean instance
	 * @param beanName the name of the bean
	 * @return the bean instance to use, either the original or a wrapped one;
	 * if {@code null}, no subsequent BeanPostProcessors will be invoked
	 * @throws org.springframework.beans.BeansException in case of errors
	 * @see org.springframework.beans.factory.InitializingBean#afterPropertiesSet
	 * @see org.springframework.beans.factory.FactoryBean
	 */
	default @Nullable Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
		return bean;
	}

}
```

比如，我们Spring的AOP功能，创建代理类的过程，就发生在postProcessAfterInitialization方法里面。

但是我们这里，肯定还没有快进到bean对象的实例化，所以这里我们仅仅实例化所有注册的BeanPostProcessor。

## 第四步，初始化MessageSource

这一步的方法，主要是国际化相关的，但我目前为止还没有用到过这个组件，后面有用到再来补充。

## 第五步，初始化**ApplicationEventMulticaster**

这一步主要用来初始化事件广播器，用于处理事件的发布与处理

## 第六步，执行onRefresh方法

这一步执行的同样是一个模板方法，提供给子类的扩展方法。

```java
	/**
	 * Template method which can be overridden to add context-specific refresh work.
	 * Called on initialization of special beans, before instantiation of singletons.
	 * <p>This implementation is empty.
	 * @throws BeansException in case of errors
	 * @see #refresh()
	 */
	protected void onRefresh() throws BeansException {
		// For subclasses: do nothing by default.
	}
```

比如SpringMVC创建Tomcat对象就是在这里完成的

## 第七步，注册事件监听器

这一步，主要是用来注册各种各样的事件监听器。而广播器我们在前面就已经创建了，那为什么要把广播器和监听器的创建分开呢？不可以放在一起吗？其实是因为onRefresh()方法，可以让子类可以在onRefresh()方法里面注册一些自己的监听器。

## 第八步，初始化所有单例Bean

这一步没什么好说的，简单来看，就是提前创建好单例bean对象到容器里面。它里面一些其他的复杂逻辑暂时不深究。

## 第九步，发布ContextRefreshedEvent事件

这里面的方法我还没点进去看，但只知道他发布了这么一个事件，后面再详细了解。
