# Rust 安装

> 学习资料：[Rust语言圣经](https://course.rs/about-book.html)

### 安装

```bash
scoop install rust
```

### 检查安装是否成功

```bash
rustc -V

cargo -V
```

### 创建并运行一个新的项目

```bash
# 创建项目
cargo new world_hello

# 运行项目
cargo run
```

如果运行项目失败，windows环境下，则需要下载 [Visual Studio Installer](https://visualstudio.microsoft.com/zh-hans/visual-cpp-build-tools/) 安装下面两个组件，具体组件版本可以根据当时环境选择最新的。

1. Windows 11 SDK
2. MSVC v142 - VS 2019 C++ x64/x86 build tools
