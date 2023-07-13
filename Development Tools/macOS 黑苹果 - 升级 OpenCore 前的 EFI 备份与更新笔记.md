# macOS 黑苹果 - 升级 OpenCore 前的 EFI 备份与更新笔记

> 记录一次在 macOS 黑苹果环境中升级 **OpenCore (OC)** 的流程，包含备份 EFI、替换文件、清理 NVRAM 与系统更新等步骤，方便日后查阅。

---

## 1 备份现有 EFI

1. **列出磁盘**
   ```bash
   diskutil list
   ```
2. **挂载 EFI 分区**（通常是 `disk0s1`）
   ```bash
   sudo diskutil mount disk0s1
   ```
3. 打开 Finder，即可看到 **EFI** 分区。将里面完整的 **EFI** 文件夹复制到安全位置（U 盘或其他磁盘）做备份。

> **提示**：备份后的文件夹命名为 `EFI_backup_yyyyMMdd`，方便以后回滚。

---

## 2 替换 OC 文件

1. **删除旧文件**：在 EFI 分区中，删除原有的 `BOOT/` 与 `OC/` 文件夹。
2. **复制新文件**：把新版 EFI 包中的 `BOOT/` 和 `OC/` 复制到 EFI 分区。
3. **迁移三码**：升级前须把旧版 `config.plist` 中以下三项复制到新版 `config.plist`，保持机器信息一致。
   - `PlatformInfo.Generic.MLB`
   - `PlatformInfo.Generic.SystemSerialNumber`
   - `PlatformInfo.Generic.SystemUUID`

> 完成后可用 **Hackintool → 工具 → OC** 查看 OpenCore 版本，确认已更新。

---

## 3 重启并清空 NVRAM

1. 重启电脑；
2. 在启动阶段 **连续按 `ESC`** 进入 OC 引导菜单；
3. 按 **空格** 显示隐藏选项；
4. 选择最后一项 **“Reset NVRAM”** 并回车；
5. 机器自动重启后进入系统。

---

## 4 更新 macOS 系统

完成 OC 升级且系统启动正常后，可通过 **系统设置 → 通用 → 软件更新** 或 App Store 直接在线升级 macOS。

---

## 5 小结

- 升级前一定先 **备份原 EFI**，遇到问题可随时回滚。
- 复制新 EFI 时，不要忘记迁移 **三码**（MLB、SerialNumber、UUID）。
- 升级后 **清空 NVRAM**，避免旧缓存影响启动。

以上步骤保持了朴素、可操作的记录风格，希望对同样需要升级 OpenCore 的朋友有所帮助。

