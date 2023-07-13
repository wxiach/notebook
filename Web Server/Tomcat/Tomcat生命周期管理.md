通过组件化的方式，Tomcat把一个庞大的系统拆解成多个独立的组件，每一个组件各司其职。

因为有很多组件，每一个组件在不同的阶段需要执行不同的操作，如初始化，运行，销毁等。所以，Tomcat为它们设计了一个 `Lifecycle` （生命周期）接口。通过该接口可以规范化和统一管理各个组件的生命周期。

实现了Lifecycle接口的组件有：Server、Service、Container、Executor、Connector

```java
public interface Lifecycle {

    void addLifecycleListener(LifecycleListener listener);

    LifecycleListener[] findLifecycleListeners();

    void removeLifecycleListener(LifecycleListener listener);

    void init() throws LifecycleException;

    void start() throws LifecycleException;

    void stop() throws LifecycleException;

    void destroy() throws LifecycleException;

    LifecycleState getState();

    String getStateName();
}
```

可以从三个方面去理解上面的Lifecycle接口：监听器处理、生命周期方法、生命周期状态。

每个组件都有生命周期状态，在执行生命周期方法后会发生状态变化，在一个组件状态变化时，可以通过被注册在其上的监听器触发一些处理操作。

在 `LifecycleState` 这个枚举类里面，详细定义所有的生命周期状态。

```java
public enum LifecycleState {
    NEW(false, null),
    INITIALIZING(false, Lifecycle.BEFORE_INIT_EVENT),
    INITIALIZED(false, Lifecycle.AFTER_INIT_EVENT),
    STARTING_PREP(false, Lifecycle.BEFORE_START_EVENT),
    STARTING(true, Lifecycle.START_EVENT),
    STARTED(true, Lifecycle.AFTER_START_EVENT),
    STOPPING_PREP(true, Lifecycle.BEFORE_STOP_EVENT),
    STOPPING(false, Lifecycle.STOP_EVENT),
    STOPPED(false, Lifecycle.AFTER_STOP_EVENT),
    DESTROYING(false, Lifecycle.BEFORE_DESTROY_EVENT),
    DESTROYED(false, Lifecycle.AFTER_DESTROY_EVENT),
    FAILED(false, null);

    private final boolean available;
    private final String lifecycleEvent;

    LifecycleState(boolean available, String lifecycleEvent) {
        this.available = available;
        this.lifecycleEvent = lifecycleEvent;
    }

    /**
     * May the public methods other than property getters/setters and lifecycle methods be called for a component in
     * this state? It returns <code>true</code> for any component in any of the following states:
     * <ul>
     * <li>{@link #STARTING}</li>
     * <li>{@link #STARTED}</li>
     * <li>{@link #STOPPING_PREP}</li>
     * </ul>
     *
     * @return <code>true</code> if the component is available for use, otherwise <code>false</code>
     */
    public boolean isAvailable() {
        return available;
    }

    public String getLifecycleEvent() {
        return lifecycleEvent;
    }
}
```

`LifecycleBase` 是Lifecycle是最直接的实现类，也是生命周期管理的基类。在这个类里面，定义了生命周期状态的流转规则。

我们一步步的来拆解。

## 生命周期监听器

通过组件化使得我们系统完成功能上的解耦，而监听器存在的目的，就是完成组件间的通信。

生命周期监听器保存在一个线程安全的CopyOnWriteArrayList中。

```java
public abstract class LifecycleBase implements Lifecycle {

    private final List<LifecycleListener> lifecycleListeners = new CopyOnWriteArrayList<>();

    @Override
    public void addLifecycleListener(LifecycleListener listener) {
        lifecycleListeners.add(listener);
    }

    @Override
    public LifecycleListener[] findLifecycleListeners() {
        return lifecycleListeners.toArray(new LifecycleListener[0]);
    }

    @Override
    public void removeLifecycleListener(LifecycleListener listener) {
        lifecycleListeners.remove(listener);
    }

    /**
     * Allow sub classes to fire {@link Lifecycle} events.
     *
     * @param type Event type
     * @param data Data associated with event.
     */
    protected void fireLifecycleEvent(String type, Object data) {
        LifecycleEvent event = new LifecycleEvent(this, type, data);
        for (LifecycleListener listener : lifecycleListeners) {
            listener.lifecycleEvent(event);
        }
    }
}

```

## 生命周期状态流转

Tomcat在这里采用了模板方法，所有子组件在各个生命周期真正需要做的事情放在了 `xxxInternal()` 方法里面，这是由子类去实现的。

生命周期状态存放在一个被volatile修饰的变量里面。

```java
/**
 * The current state of the source component.
 */
private volatile LifecycleState state = LifecycleState.NEW;
```

它真正的修改逻辑放在了setStateInternal里面，里面对状态转换和合法性做了校验。

```java

private synchronized void setStateInternal(LifecycleState state, Object data, boolean check)
        throws LifecycleException {

    if (log.isDebugEnabled()) {
        log.debug(sm.getString("lifecycleBase.setState", this, state));
    }

    if (check) {
        // Must have been triggered by one of the abstract methods (assume
        // code in this class is correct)
        // null is never a valid state
        if (state == null) {
            invalidTransition("null");
            // Unreachable code - here to stop eclipse complaining about
            // a possible NPE further down the method
            return;
        }

        // Any method can transition to failed
        // startInternal() permits STARTING_PREP to STARTING
        // stopInternal() permits STOPPING_PREP to STOPPING and FAILED to
        // STOPPING
        if (!(state == LifecycleState.FAILED ||
                (this.state == LifecycleState.STARTING_PREP && state == LifecycleState.STARTING) ||
                (this.state == LifecycleState.STOPPING_PREP && state == LifecycleState.STOPPING) ||
                (this.state == LifecycleState.FAILED && state == LifecycleState.STOPPING))) {
            // No other transition permitted
            invalidTransition(state.name());
        }
    }

    this.state = state;
    String lifecycleEvent = state.getLifecycleEvent();
    if (lifecycleEvent != null) {
        fireLifecycleEvent(lifecycleEvent, data);
    }
}

```

如果，发生了状态切换失败，组件生命周期状态会被直接设置为 `LifecycleState.FAILED`

```java
    private void invalidTransition(String type) throws LifecycleException {
        String msg = sm.getString("lifecycleBase.invalidTransition", type, toString(), state);
        throw new LifecycleException(msg);
    }

    private void handleSubClassException(Throwable t, String key, Object... args) throws LifecycleException {
        setStateInternal(LifecycleState.FAILED, null, false);
        ExceptionUtils.handleThrowable(t);
        String msg = sm.getString(key, args);
        if (getThrowOnFailure()) {
            if (!(t instanceof LifecycleException)) {
                t = new LifecycleException(msg, t);
            }
            throw (LifecycleException) t;
        } else {
            log.error(msg, t);
        }
    }
```

下面，简单看一下各个生命周期方法，在LifecycleBase中的实现。

首先是初始化

```java
@Override
public final synchronized void init() throws LifecycleException {
    if (!state.equals(LifecycleState.NEW)) {
        invalidTransition(BEFORE_INIT_EVENT);
    }

    try {
        setStateInternal(LifecycleState.INITIALIZING, null, false);
        initInternal();
        setStateInternal(LifecycleState.INITIALIZED, null, false);
    } catch (Throwable t) {
        handleSubClassException(t, "lifecycleBase.initFail", toString());
    }
}
```

其次是组件的启动

```java
@Override
public final synchronized void start() throws LifecycleException {

    if (LifecycleState.STARTING_PREP.equals(state) || LifecycleState.STARTING.equals(state) ||
            LifecycleState.STARTED.equals(state)) {

        if (log.isDebugEnabled()) {
            Exception e = new LifecycleException();
            log.debug(sm.getString("lifecycleBase.alreadyStarted", toString()), e);
        } else if (log.isInfoEnabled()) {
            log.info(sm.getString("lifecycleBase.alreadyStarted", toString()));
        }

        return;
    }

    if (state.equals(LifecycleState.NEW)) {
        init();
    } else if (state.equals(LifecycleState.FAILED)) {
        stop();
    } else if (!state.equals(LifecycleState.INITIALIZED) && !state.equals(LifecycleState.STOPPED)) {
        invalidTransition(BEFORE_START_EVENT);
    }

    try {
        setStateInternal(LifecycleState.STARTING_PREP, null, false);
        startInternal();
        if (state.equals(LifecycleState.FAILED)) {
            // This is a 'controlled' failure. The component put itself into the
            // FAILED state so call stop() to complete the clean-up.
            stop();
        } else if (!state.equals(LifecycleState.STARTING)) {
            // Shouldn't be necessary but acts as a check that sub-classes are
            // doing what they are supposed to.
            invalidTransition(AFTER_START_EVENT);
        } else {
            setStateInternal(LifecycleState.STARTED, null, false);
        }
    } catch (Throwable t) {
        // This is an 'uncontrolled' failure so put the component into the
        // FAILED state and throw an exception.
        handleSubClassException(t, "lifecycleBase.startFail", toString());
    }
}

```

然后是组件停止

```java
@Override
public final synchronized void stop() throws LifecycleException {

    if (LifecycleState.STOPPING_PREP.equals(state) || LifecycleState.STOPPING.equals(state) ||
            LifecycleState.STOPPED.equals(state)) {

        if (log.isDebugEnabled()) {
            Exception e = new LifecycleException();
            log.debug(sm.getString("lifecycleBase.alreadyStopped", toString()), e);
        } else if (log.isInfoEnabled()) {
            log.info(sm.getString("lifecycleBase.alreadyStopped", toString()));
        }

        return;
    }

    if (state.equals(LifecycleState.INITIALIZED)) {
        return;
    }

    if (state.equals(LifecycleState.NEW)) {
        state = LifecycleState.STOPPED;
        return;
    }

    if (!state.equals(LifecycleState.STARTED) && !state.equals(LifecycleState.FAILED)) {
        invalidTransition(BEFORE_STOP_EVENT);
    }

    try {
        if (state.equals(LifecycleState.FAILED)) {
            // Don't transition to STOPPING_PREP as that would briefly mark the
            // component as available but do ensure the BEFORE_STOP_EVENT is
            // fired
            fireLifecycleEvent(BEFORE_STOP_EVENT, null);
        } else {
            setStateInternal(LifecycleState.STOPPING_PREP, null, false);
        }

        stopInternal();

        // Shouldn't be necessary but acts as a check that sub-classes are
        // doing what they are supposed to.
        if (!state.equals(LifecycleState.STOPPING) && !state.equals(LifecycleState.FAILED)) {
            invalidTransition(AFTER_STOP_EVENT);
        }

        setStateInternal(LifecycleState.STOPPED, null, false);
    } catch (Throwable t) {
        handleSubClassException(t, "lifecycleBase.stopFail", toString());
    } finally {
        if (this instanceof Lifecycle.SingleUse) {
            // Complete stop process first
            setStateInternal(LifecycleState.STOPPED, null, false);
            destroy();
        }
    }
}

```

最后是组件销毁

```java
@Override
public final synchronized void destroy() throws LifecycleException {
    if (LifecycleState.FAILED.equals(state)) {
        try {
            // Triggers clean-up
            stop();
        } catch (LifecycleException e) {
            // Just log. Still want to destroy.
            log.error(sm.getString("lifecycleBase.destroyStopFail", toString()), e);
        }
    }

    if (LifecycleState.DESTROYING.equals(state) || LifecycleState.DESTROYED.equals(state)) {
        if (log.isDebugEnabled()) {
            Exception e = new LifecycleException();
            log.debug(sm.getString("lifecycleBase.alreadyDestroyed", toString()), e);
        } else if (log.isInfoEnabled() && !(this instanceof Lifecycle.SingleUse)) {
            // Rather than have every component that might need to call
            // destroy() check for SingleUse, don't log an info message if
            // multiple calls are made to destroy()
            log.info(sm.getString("lifecycleBase.alreadyDestroyed", toString()));
        }

        return;
    }

    if (!state.equals(LifecycleState.STOPPED) && !state.equals(LifecycleState.FAILED) &&
            !state.equals(LifecycleState.NEW) && !state.equals(LifecycleState.INITIALIZED)) {
        invalidTransition(BEFORE_DESTROY_EVENT);
    }

    try {
        setStateInternal(LifecycleState.DESTROYING, null, false);
        destroyInternal();
        setStateInternal(LifecycleState.DESTROYED, null, false);
    } catch (Throwable t) {
        handleSubClassException(t, "lifecycleBase.destroyFail", toString());
    }
}

```

通过这四个生命周期方法，我们可以了解到组件真正的生命周期其实就是这四个，那为什么会有那么多的生命周期状态呢？——为了使组件生命周期状态的流转更加规范、安全、方便控制。
