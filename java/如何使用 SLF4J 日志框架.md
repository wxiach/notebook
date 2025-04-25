# 如何使用 SLF4J 日志框架

SLF4J（Simple Logging Facade for Java）是一个日志抽象层，它允许我在项目中选择多种日志实现方案。Logback 和 slf4j-simple 是两种常见的实现。接下来，我将分别介绍这两种方式的配置和使用方法。

## 方式一：使用 Logback 作为 SLF4J 的实现

首先，我需要在 `pom.xml` 中引入 Logback 依赖，作为 SLF4J 的实现：

```xml
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-core</artifactId>
    <version>1.2.6</version>
</dependency>

<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.2.6</version>
</dependency>
```

对于使用 Gradle 构建工具的项目，我只需要在 `build.gradle` 文件中添加以下依赖：

```groovy
dependencies {
    implementation 'ch.qos.logback:logback-core:1.2.6'
    implementation 'ch.qos.logback:logback-classic:1.2.6'
}
```

接下来，我需要在 `resources` 文件夹下添加一个 `logback.xml` 配置文件，来设置日志的输出格式。这个配置文件决定了日志的显示方式，包括时间戳、日志级别、线程名称等信息：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration debug="false">
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <!-- 设置日志输出格式 -->
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS}  %highlight(%-5level) --- [%+15thread] %cyan(%-36logger{36}) : %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 设置日志的根级别为DEBUG，并将日志输出到控制台 -->
    <root level="DEBUG">
        <appender-ref ref="STDOUT"/>
    </root>
</configuration>
```

这段配置的关键点是 `pattern` 元素，它定义了日志输出的具体格式。我可以根据需要修改它，比如在日志中加入类名、行号等信息。

最后，在 Java 代码中，我可以这样使用 Logback 记录日志：

```java
public class Bootstrap {

    // 创建 Logger 实例，使用 LoggerFactory 获取该类的日志记录器
    final static Logger logger = LoggerFactory.getLogger(Bootstrap.class);

    public static void main(String[] args) {
        // 输出一条信息日志
        logger.info("Log started!");
    }
}
```

这段代码会在控制台输出如下内容：

```yaml
2025-04-20 12:34:56.789  INFO   --- [           main] com.example.Bootstrap: Log started!
```

## 方式二：使用 slf4j-simple 作为 SLF4J 的实现

如果项目对日志需求较为简单，并且不想做过多的配置，我可以选择使用 `slf4j-simple`，它是 SLF4J 提供的一个轻量级实现，适合简单的日志记录。

首先，我需要在 `pom.xml` 中引入 `slf4j-simple` 依赖：

```xml
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-simple</artifactId>
    <version>2.0.7</version>
</dependency>
```

对于 Gradle 项目，依赖配置如下：

```groovy
dependencies {
    implementation 'org.slf4j:slf4j-simple:2.0.7'
}
```

这样，在项目中我就能直接使用 `SLF4J` 记录日志了，配置简单，适合没有太多日志需求的场景。
