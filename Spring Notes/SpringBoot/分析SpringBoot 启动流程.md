先看一段简单的Springboot启动代码：

```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

我认为可以分两部分去理解这段代码，一是`@SpringbootApplication`这个注解，二是main函数里面的`SpringApplication.run()`方法了。

## 理解@SpringbootApplication注解

下面是@SpringbootApplication的元注解结构。为了方便理解，我对其做了简化：

```java
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan
public @interface SpringBootApplication{}
```

观察上面的两个元注解：`@SpringBootConfiguration` 和`@EnableAutoConfiguration`，不难发现，他们的本质就是`@Configuration`和`@Import` 。

```java
@Configuration
public @interface SpringBootConfiguration {}

@AutoConfigurationPackage
@Import({AutoConfigurationImportSelector.class})
public @interface EnableAutoConfiguration {}
```

## SpringApplication.run()执行流程

`SpringApplication.run()`是一个静态方法的调用，他最终的调用链会转向一个实例方法的调用：

```java
public static ConfigurableApplicationContext run(Class<?>[] primarySources, String[] args) {
	return new SpringApplication(primarySources).run(args);
}

```

这个实例的构造函数如下：

```java
public SpringApplication(ResourceLoader resourceLoader, Class<?>... primarySources) {
	this.resourceLoader = resourceLoader;
	Assert.notNull(primarySources, "PrimarySources must not be null");
	this.primarySources = new LinkedHashSet<>(Arrays.asList(primarySources));
	// 推断应用程序类型
	this.properties.setWebApplicationType(WebApplicationType.deduceFromClasspath());
	this.bootstrapRegistryInitializers = new ArrayList<>(getSpringFactoriesInstances(BootstrapRegistryInitializer.class));
	// 从Spring内置配置文件中，添加ApplicationContext初始化器
	setInitializers((Collection) getSpringFactoriesInstances(ApplicationContextInitializer.class));
	// 从Spring内置配置文件中，添加ApplicationListener
	setListeners((Collection) getSpringFactoriesInstances(ApplicationListener.class));
	this.mainApplicationClass = deduceMainApplicationClass();
}

```

`run`方法如下

```java
public ConfigurableApplicationContext run(String... args) {
	Startup startup = Startup.create();
	if (this.properties.isRegisterShutdownHook()) {
		SpringApplication.shutdownHook.enableShutdownHookAddition();
	}
	DefaultBootstrapContext bootstrapContext = createBootstrapContext();
	ConfigurableApplicationContext context = null;
	configureHeadlessProperty();
	// 创建各种SpringApplicationRunListener的实例对象
	SpringApplicationRunListeners listeners = getRunListeners(args);
	listeners.starting(bootstrapContext, this.mainApplicationClass);
	try {
		// 包装main函数传过来的启动参数
		ApplicationArguments applicationArguments = new DefaultApplicationArguments(args);
		//
		ConfigurableEnvironment environment = prepareEnvironment(listeners, bootstrapContext, applicationArguments);
		// 打印Banner图
		Banner printedBanner = printBanner(environment);
		// 创建Spring容器
		context = createApplicationContext();
		context.setApplicationStartup(this.applicationStartup);
		prepareContext(bootstrapContext, context, environment, listeners, applicationArguments, printedBanner);
		refreshContext(context);
		afterRefresh(context, applicationArguments);
		startup.started();
		if (this.properties.isLogStartupInfo()) {
			new StartupInfoLogger(this.mainApplicationClass, environment).logStarted(getApplicationLog(), startup);
		}
		listeners.started(context, startup.timeTakenToStarted());
		callRunners(context, applicationArguments);
	}
	catch (Throwable ex) {
		throw handleRunFailure(context, ex, listeners);
	}
	try {
		if (context.isRunning()) {
			listeners.ready(context, startup.ready());
		}
	}
	catch (Throwable ex) {
		throw handleRunFailure(context, ex, null);
	}
	return context;
}

```

这里面执行的步骤比较多，要真正理解这个方法，需要详细的了解每个步骤究竟做了哪些事情。

### SpringApplicationRunListeners

SpringApplicationRunListeners是一个事件发布器的集合，它由很多`SpringApplicationRunListener`组成。他也是从`spring.factories`文件中读取的，目前看来只有一个`EventPublishingRunListener`

```
org.springframework.boot.SpringApplicationRunListener=\\
org.springframework.boot.context.event.EventPublishingRunListener
```

SpringApplicationRunListeners会在Springboot在启动过程中，每完成一个小步骤，都会发布相对应的事件。

SpringApplicationRunListener 中所含的发布的事件大概有以下几类：

```java
public interface SpringApplicationRunListener {

	/**
	 * Called immediately when the run method has first started. Can be used for very
	 * early initialization.
	 * @param bootstrapContext the bootstrap context
	 */
	default void starting(ConfigurableBootstrapContext bootstrapContext) {
	}

	/**
	 * Called once the environment has been prepared, but before the
	 * {@link ApplicationContext} has been created.
	 * @param bootstrapContext the bootstrap context
	 * @param environment the environment
	 */
	default void environmentPrepared(ConfigurableBootstrapContext bootstrapContext,
			ConfigurableEnvironment environment) {
	}

	/**
	 * Called once the {@link ApplicationContext} has been created and prepared, but
	 * before sources have been loaded.
	 * @param context the application context
	 */
	default void contextPrepared(ConfigurableApplicationContext context) {
	}

	/**
	 * Called once the application context has been loaded but before it has been
	 * refreshed.
	 * @param context the application context
	 */
	default void contextLoaded(ConfigurableApplicationContext context) {
	}

	/**
	 * The context has been refreshed and the application has started but
	 * {@link CommandLineRunner CommandLineRunners} and {@link ApplicationRunner
	 * ApplicationRunners} have not been called.
	 * @param context the application context.
	 * @param timeTaken the time taken to start the application or {@code null} if unknown
	 * @since 2.6.0
	 */
	default void started(ConfigurableApplicationContext context, Duration timeTaken) {
	}

	/**
	 * Called immediately before the run method finishes, when the application context has
	 * been refreshed and all {@link CommandLineRunner CommandLineRunners} and
	 * {@link ApplicationRunner ApplicationRunners} have been called.
	 * @param context the application context.
	 * @param timeTaken the time taken for the application to be ready or {@code null} if
	 * unknown
	 * @since 2.6.0
	 */
	default void ready(ConfigurableApplicationContext context, Duration timeTaken) {
	}

	/**
	 * Called when a failure occurs when running the application.
	 * @param context the application context or {@code null} if a failure occurred before
	 * the context was created
	 * @param exception the failure
	 * @since 2.0.0
	 */
	default void failed(ConfigurableApplicationContext context, Throwable exception) {
	}

}
```

## PrepareEnvironment

### PrepareContext

```java
	private void prepareContext(DefaultBootstrapContext bootstrapContext, ConfigurableApplicationContext context,
			ConfigurableEnvironment environment, SpringApplicationRunListeners listeners,
			ApplicationArguments applicationArguments, Banner printedBanner) {
		context.setEnvironment(environment);
		postProcessApplicationContext(context);
		addAotGeneratedInitializerIfNecessary(this.initializers);
		applyInitializers(context);
		listeners.contextPrepared(context);
		bootstrapContext.close(context);
		if (this.properties.isLogStartupInfo()) {
			logStartupInfo(context.getParent() == null);
			logStartupInfo(context);
			logStartupProfileInfo(context);
		}
		// Add boot specific singleton beans
		ConfigurableListableBeanFactory beanFactory = context.getBeanFactory();
		beanFactory.registerSingleton("springApplicationArguments", applicationArguments);
		if (printedBanner != null) {
			beanFactory.registerSingleton("springBootBanner", printedBanner);
		}
		if (beanFactory instanceof AbstractAutowireCapableBeanFactory autowireCapableBeanFactory) {
			autowireCapableBeanFactory.setAllowCircularReferences(this.properties.isAllowCircularReferences());
			if (beanFactory instanceof DefaultListableBeanFactory listableBeanFactory) {
				listableBeanFactory.setAllowBeanDefinitionOverriding(this.properties.isAllowBeanDefinitionOverriding());
			}
		}
		if (this.properties.isLazyInitialization()) {
			context.addBeanFactoryPostProcessor(new LazyInitializationBeanFactoryPostProcessor());
		}
		if (this.properties.isKeepAlive()) {
			context.addApplicationListener(new KeepAlive());
		}
		context.addBeanFactoryPostProcessor(new PropertySourceOrderingBeanFactoryPostProcessor(context));
		if (!AotDetector.useGeneratedArtifacts()) {
			// Load the sources
			Set<Object> sources = getAllSources();
			Assert.notEmpty(sources, "Sources must not be empty");
			load(context, sources.toArray(new Object[0]));
		}
		listeners.contextLoaded(context);
	}
```
