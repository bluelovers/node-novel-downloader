# node-novel-downloader

本專案是一個 **Monorepo**，主要包含用於下載各類網路小說的工具與核心函式庫。支援多個知名小說網站（如 Syosetu, Wenku8, DMZJ 等）。

## 📦 Packages

此倉庫包含以下核心套件：

### User Interface

-   [**novel-downloader-cli**](packages/novel-downloader-cli)
    -   命令列介面 (CLI) 工具。
    -   提供終端機指令，讓使用者能直接透過指令下載小說。
    -   適合不需要開發整合的一般使用者。

### Core Libraries

-   [**novel-downloader**](packages/novel-downloader)
    -   全功能的核心下載器函式庫。
    -   支援多種小說網站（Syosetu, Wenku8, DMZJ, Kakuyomu 等）。
    -   提供完整的 API，供開發者整合至其他應用程式或腳本中。

-   [**mitemin**](packages/mitemin)
    -   專門用於解析 mitemin 網址的小型輔助工具。

## 🚀 Installation

您可以透過 npm 或 yarn 安裝這些套件。

```bash
# 安裝核心函式庫
yarn add novel-downloader

# 全域安裝 CLI 工具
yarn global add novel-downloader-cli
```

如果您使用 `yarn-tool`：

```bash
yt add novel-downloader
yt add novel-downloader-cli
```

## 📚 Documentation

更多詳細說明文件請參考 `docs/` 目錄：

-   [一般說明文件 (General Documentation)](docs/README.md)
-   [開發者指南 (Development Guide)](docs/DEVELOPMENT.md) - 了解核心架構與如何新增站點。
-   [站點模組分類說明 (Site Modules Classification)](docs/SITE_MODULES_CLASSIFICATION.md) - 各站點實作方式分類與選擇指南。
