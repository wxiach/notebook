> 一段小经历，让我理解了 **Gradle Wrapper** 的价值。记录下来，给刚入门的同学作参考。


---

## 1 背景

在 IntelliJ IDEA 里新建 Java 项目时，如果选择 **Gradle** 作为构建工具，会出现一个 *Gradle distribution* 选项：

- **Local installation** ：使用系统里预先下载并配置好的 Gradle；
- **Wrapper** ：项目自带 `gradlew` / `gradlew.bat` 脚本及对应的 Gradle 包。 

过去我一直选 *Local*，图的就是省事：本地装一次，所有项目共用。直到在 Linux 笔记本上遇到版本冲突，我才重新认识 Wrapper。

---

## 2 为什么改用 Wrapper

| 场景 | 本地安装 | Wrapper |
| ---- | -------- | ------- |
| 每个项目可指定自己的 Gradle 版本 | ❌ 统一一个版本 | ✅ 版本写进项目中 |
| 团队成员初次拉取代码的上手成本 | 需要先装 Gradle | `./gradlew build` 即可 |
| 在 CI / 服务器等环境运行 | 需预装 | 脚本会自动下载 |

**一句话**：Wrapper 把 Gradle 当成项目内部依赖，避免“我这里能跑，你那里版本不对”的尴尬。

---

## 3 如何切换

1. 打开终端，进入项目根目录；
2. 执行：
   ```bash
   gradle wrapper --gradle-version 8.5
   ```
   该命令会生成（或更新）以下文件：
   - `gradlew`、`gradlew.bat`
   - `gradle/wrapper/gradle-wrapper.jar`
   - `gradle/wrapper/gradle-wrapper.properties`

3. **国内加速**：修改 `gradle-wrapper.properties`，将 `distributionUrl` 指向国内镜像。例如：
   ```properties
   distributionUrl=https\://mirrors.cloud.tencent.com/gradle/gradle-8.5-bin.zip
   ```

之后，任何人只需运行：
```bash
./gradlew build  # Windows 下用 gradlew.bat
```
脚本会自动下载（或复用缓存中的）Gradle 8.5，并完成构建。

---

## 4 小结

- **本地安装** 适合个人快速试验，但所有项目同吃一个版本；
- **Gradle Wrapper** 让项目“自带构建器”，更友好地支持多人协作与 CI；
- 在国内使用 Wrapper，记得把 **`distributionUrl`** 换成国内镜像，下载速度会好很多。

这就是我从依赖本地 Gradle 到全面使用 Wrapper 的小转变。如果你也在纠结版本管理，不妨试一试。
