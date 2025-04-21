# 简单理解Tomcat的各个组件

学习Tomcat，就要深入了解Tomcat的各个组件，并理解它们之间如何相互协作。

`server.xml` 是Tomcat的核心配置文件。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Server xmlns="<http://tomcat.apache.org/schema/server>"
        xmlns:xsi="<http://www.w3.org/2001/XMLSchema-instance>"
        xsi:schemaLocation="<http://tomcat.apache.org/schema/server> <http://tomcat.apache.org/schema/server/server.xsd>"
        version="9.0">

    <!-- Global Server Information -->
    <Listener className="org.apache.catalina.startup.VersionLoggerListener" />
    <Listener className="org.apache.catalina.core.AprLifecycleListener"
              SSLEngine="on" />
    <Listener className="org.apache.catalina.core.JreMemoryLeakPreventionListener" />
    <Listener className="org.apache.catalina.mbeans.GlobalResourcesLifecycleListener" />
    <Listener className="org.apache.catalina.core.ThreadLocalLeakPreventionListener" />

    <!-- Global Naming Resources (JNDI) -->
    <GlobalNamingResources>
        <!-- UserDatabase resource -->
        <Resource name="UserDatabase" auth="Container"
                  type="org.apache.catalina.UserDatabase"
                  description="User database that can be referenced from web applications"
                  factory="org.apache.catalina.users.MemoryUserDatabaseFactory"
                  pathname="conf/tomcat-users.xml" />

        <!-- Database Connection Pool (HikariCP) -->
        <Resource name="jdbc/MyDB" auth="Container"
                  type="javax.sql.DataSource" driverClassName="com.mysql.cj.jdbc.Driver"
                  url="jdbc:mysql://localhost:3306/mydb"
                  username="root" password="password"
                  maxActive="100" maxIdle="20" maxWait="10000"
                  validationQuery="SELECT 1" validationInterval="30000"
                  timeBetweenEvictionRunsMillis="30000" minEvictableIdleTimeMillis="60000"
                  removeAbandoned="true" removeAbandonedTimeout="60" logAbandoned="true" />

        <!-- Mail Session -->
        <Resource name="mail/Session" auth="Container"
                  type="javax.mail.Session" mail.smtp.host="smtp.example.com"
                  mail.smtp.port="25" />

        <!-- JMS Connection Factory -->
        <Resource name="jms/ConnectionFactory" auth="Container"
                  type="org.apache.activemq.jndi.ActiveMQConnectionFactory"
                  factory="org.apache.activemq.jndi.ActiveMQInitialContextFactory"
                  brokerURL="tcp://localhost:61616" />
    </GlobalNamingResources>

    <!-- Service Configuration -->
    <Service name="Catalina">

        <!-- HTTP Connector -->
        <Connector port="8080" protocol="HTTP/1.1"
                   connectionTimeout="20000"
                   redirectPort="8443" />

        <!-- AJP Connector (Tomcat with Apache HTTPD) -->
        <Connector port="8009" protocol="AJP/1.3"
                   redirectPort="8443" />

        <!-- SSL Connector -->
        <Connector port="8443" protocol="HTTP/1.1"
                   maxThreads="150" scheme="https" secure="true" SSLEnabled="true"
                   keystoreFile="conf/localhost-rsa.jks" keystorePass="changeit"
                   clientAuth="false" sslProtocol="TLS" />

        <!-- HTTP/2 Connector -->
        <Connector port="8081" protocol="org.apache.coyote.http11.Http11Nio2Protocol"
                   connectionTimeout="20000" redirectPort="8443" />

        <!-- Access Logging Valve -->
        <Valve className="org.apache.catalina.valves.AccessLogValve"
               directory="logs" prefix="localhost_access_log" suffix=".log"
               pattern="%h %l %u %t &quot;%r&quot; %s %b" />

        <!-- Tomcat Engine -->
        <Engine name="Catalina" defaultHost="localhost">

            <!-- Realm for Authentication & Authorization -->
            <Realm className="org.apache.catalina.realm.MemoryRealm" />

            <!-- Host Configuration -->
            <Host name="localhost" appBase="webapps"
                  unpackWARs="true" autoDeploy="true"
                  deployOnStartup="true">

                <!-- Context Configuration -->
                <Context path="/" docBase="webapps/ROOT" reloadable="true" />

                <!-- Additional Contexts (Add more if necessary) -->
                <!-- <Context path="/app" docBase="webapps/app" /> -->

                <!-- Security Manager (optional) -->
                <!--<Valve className="org.apache.catalina.valves.RemoteAddrValve" allow="127\\.\\d+\\.\\d+\\.\\d+" />-->

                <!-- Session Manager -->
                <Manager pathname="" />

            </Host>

            <!-- Additional Host (for Virtual Hosting) -->
            <!--<Host name="example.com" appBase="webapps/example" unpackWARs="true" autoDeploy="true">
                <Context path="/" docBase="webapps/example" reloadable="true" />
            </Host>-->

        </Engine>

    </Service>

    <!-- Shutdown hook -->
    <Listener className="org.apache.catalina.core.StandardServer" />
</Server>

```

简单的理解，Tomcat就是一个Servlet容器。Servlet是用来处理请求的，里面通常是我们的业务逻辑，但作为一个服务器，要完成客户端对服务器资源的访问，我们还需要接受请求，响应请求。

接受和响应请求是共性功能，所以Tomcat把它们抽象为Connector组件，处理请求被Tomcat抽象成Container组件。它们两个放在一起，就是一个完整的Service。

> Tomcat就是一个 `Server` ，一个Server内部可以有很多 `Service` ，一个Service是由多个 `Connector` 和 一个 `Container` 组成的。

## 容器组件（Container）

Tomcat容器组件是典型的树形结构，是一种组合关系。

| 组件名  |                                       |
| ------- | ------------------------------------- |
| Engine  | 最顶层的容器                          |
| Host    | Engine的子容器，可以同时存在多个Host  |
| Context | Host的子容器，可以同时存在多个Context |
| Wrapper | Context的子容器，可以同时存在多个     |

上面四种容器相互协作，完成请求的处理。

Engine是最顶层的容器，它是Service的子组件，一个Service中，有且仅有一个Engine。它的任务是将请求委托给适当的虚拟主机（Host）进行处理。一个Host下可以有多个Webapp应用，每个Webapp对应着一个Context，Host会根据url把请求匹配到某个Context上，Context会继续根据url把请求分配到一个具体Wrapper上，而Wrapper里面包装的是一个Servlet。

## 连接器组件（Connector）

Connector组件的主要任务是负责客户端和服务端的通信，同时负责将请求转发给Container组件。

| 组件名    |                    |
| --------- | ------------------ |
| Endpoint  | 网络通信           |
| Processor | 应用层协议解析     |
| Adapter   | 请求转发给容器组件 |

Connector本质上是对套接字数据流的处理。通过上面三种组件，Tomcat完成了对各种应用层协议的抽象，使它们以一种通用的Request/Response的形式在Tomcat内部传递。

一个Service下面，我们可以配置多个Connector，它们可以是协议不同，也可以是端口号不同。
