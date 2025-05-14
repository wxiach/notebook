# Git 速查手册

## 一、 commit 规范

| feat   | chore  | fix  | refactor | style | perf | revert | test | ci  | docs |
| ------ | ------ | ---- | -------- | ----- | ---- | ------ | ---- | --- | ---- |
| 新功能 | 小改动 | 修复 | 重构     | 格式  | 优化 | 撤销   | 测试 | CI  | 文档 |

## 二、创建密钥

```bash
ssh-keygen -t rsa -C "wxiach@gmail.com"
```

## 三、参数配置

```bash
# 查看全局配置
git config --global --list

# 配置用户名
git config --global user.name = "wxiach"

# 配置邮箱
git config --global user.email "wxiach@gmail.om"

# 删除配置
git config [--local | --global | --system] --unset <配置项名称>
```

## 四、stash 暂存代码、保持工作区干净

```bash
# 保存当前未commit的代码
git stash

# 保存当前未commit的代码并添加备注
git stash save "备注的内容"

# 列出stash的所有记录
git stash list

# 删除stash的所有记录
git stash clear

# 应用最近一次的stash
git stash apply

# 应用最近一次的stash，随后删除该记录
git stash pop

# 删除最近的一次stash
git stash drop
```

## 五、本地项目关联远程仓库

```bash
# 初始化本地仓库
git init

# 修改本地仓库分支名
git branch -m main

# 本地仓库链接远程仓库
git remote add origin git@github.com:wxiach/Lonicera.git

# 推送本地代码到远程仓库
git push -u origin main
```

## 六、强制回退到某个 commit 版本

```bash
# 查找到对应的commit版本号
git log

# 本地回滚
git reset --hard '版本号'

# 远端同步
git push -f
```

## 七、修改.gitignore 文件后

```Shell
# 清除暂存区
git rm -r --cached .

#重新添加所有文件和文件夹
git add .

# 再次提交
git commit -m "Apply .gitignore"
```
