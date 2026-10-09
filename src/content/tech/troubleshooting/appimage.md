---
title: "AppImage 管理方式"
description: "整理 Pop!_OS 24.04 AppImageLauncher 問題與改用 Gear Lever 的流程"
tags: ["Linux", "AppImage"]
permalink: "/tech/troubleshooting/appimage/index.html"
---

## 背景

在 Pop!\_OS 24.04 上執行部分 AppImage 時，可能會遇到：

```txt
Failed to register AppImage in system via libappimage
```

這次問題不是 `libfuse2`，而是舊版 AppImageLauncher 會攔截 AppImage 執行，並用過舊的 `libappimage` 嘗試註冊桌面整合。

舊版 AppImageLauncher 只支援部分 SquashFS 壓縮格式，例如 `xz`、`zlib`，但新的 AppImage 可能使用 `zstd`，因此會註冊失敗。

## 解法

移除 AppImageLauncher，改用 Gear Lever 管理 AppImage。

```bash
sudo apt purge appimagelauncher
sudo systemctl restart systemd-binfmt
```

確認舊的 binfmt 設定已移除：

```bash
ls /usr/lib/binfmt.d/appimage.conf
```

如果檔案不存在，代表 AppImage 不會再被 AppImageLauncher 攔截。

## 目前做法

保留：

- `libfuse2t64`
- Gear Lever
- `~/AppImages/`

避免：

- AppImageLauncher
- 手動把 AppImage 分散放在不同資料夾
- 手動維護 `.desktop` 檔

目前 AppImage 統一放在：

```txt
~/AppImages/
```

桌面啟動器由 Gear Lever 產生：

```txt
~/.local/share/applications/
```

## 新增 AppImage 流程

1. 下載 `.AppImage` 到 `~/Downloads/`
2. 打開 Gear Lever
3. 新增 AppImage
4. 確認整合
5. 之後從應用程式選單啟動

CLI 也可以：

```bash
flatpak run it.mijorus.gearlever --integrate ~/Downloads/example.AppImage
```

Gear Lever 會把 AppImage 移到 `~/AppImages/`，並建立對應的 launcher、icon、MIME handler。

## 已整理的 App

目前已改由 Gear Lever 管理：

```txt
~/AppImages/ente_auth.appimage
~/AppImages/obsidian.appimage
```
