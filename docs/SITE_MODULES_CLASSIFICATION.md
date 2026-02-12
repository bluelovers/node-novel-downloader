# 站點模組分類說明

本文件說明 `packages/novel-downloader/src/site` 目錄下各站點模組的實作方式分類。

## 核心架構概述

站點模組採用三層繼承架構：

```
NovelSite (基礎抽象類別)
  ↓
demo/base.ts (NovelSiteDemo) - 基本核心實作
  ↓
  ├─ demo/tree.ts (NovelSiteDemo) - 樹狀結構實作
  └─ demo/demo.ts (NovelSiteDemo) - 示範模板（未實際使用）
```

### 核心模組說明

#### 1. `demo/base.ts` - 基本核心
- **類別名稱**: `NovelSiteDemo`
- **功能**: 提供完整的下載流程核心實作
- **主要方法**:
  - `download()` - 下載流程核心
  - `session()` - 設定 session
  - `processNovel()` - 處理小說
  - `_fetchChapter()` - 獲取章節
  - `_parseChapter()` - 解析章節內容
  - `_saveReadme()` - 保存 README.md
- **適用場景**: 使用傳統 `volume_list` 陣列結構的站點

#### 2. `demo/tree.ts` - 樹狀結構核心
- **類別名稱**: `NovelSiteDemo` (繼承自 `demo/base.ts`)
- **功能**: 基於 `NovelTree` 的進階實作，支援樹狀結構的小說目錄
- **主要特性**:
  - 使用 `NovelTree` 替代 `volume_list`
  - 提供 `_processNovelListName()` 處理樹狀目錄
  - 覆寫 `_processNovel()` 以支援樹狀結構
- **適用場景**: 需要複雜目錄結構（如多層分類、章節群組）的站點

#### 3. `demo/demo.ts` - 示範模板
- **類別名稱**: `NovelSiteDemo` (繼承自 `demo/base.ts`)
- **功能**: 提供站點實作的示範模板
- **狀態**: 僅作為參考模板，實際上沒有站點使用此模組
- **特性**: 所有方法都拋出 `Function not implemented` 錯誤

---

## 站點分類

### 📦 基於 Base 核心（基本核心）

這些站點直接繼承 `demo/base.ts`，使用傳統的 `volume_list` 陣列結構。

| 站點名稱 | 類別名稱 | 檔案路徑 | 說明 |
|---------|---------|---------|------|
| **alphapolis** | `NovelSiteClass` | `alphapolis/index.ts` | アルファポリス（日本輕小說網站） |
| **hetubook** | `NovelSiteHetubook` | `hetubook/index.ts` | 和圖書（中文小說網站） |
| **iqing** | `NovelSiteIqing` | `iqing/index.ts` | 愛青小說網（中文小說網站） |
| **millionbook** | `NovelSiteClass` | `millionbook/index.ts` | ミリオンノベル（日本小說網站） |
| **sfacg** | `NovelSiteSfacg` | `sfacg/index.ts` | SF輕小說（中文輕小說網站） |
| **syosetu** | `NovelSiteSyosetu` | `syosetu/index.ts` | 小説家になろう（日本小說網站）<br/>*註: 繼承 `NovelSiteDemo.NovelSite`* |
| **uukanshu** | `NovelSiteUukanshu` | `uukanshu/index.ts` | UU看書（中文小說網站） |
| **webqxs** | `NovelSiteWebqxs` | `webqxs/index.ts` | 網橋小說（中文小說網站） |
| **wenku8** | `NovelSiteWenku8` | `wenku8/index.ts` | 輕小說文庫（中文輕小說網站） |

**共計**: 9 個站點

### 🌲 基於 Tree 核心（樹狀結構）

這些站點繼承 `demo/tree.ts`，使用 `NovelTree` 樹狀結構來處理複雜的目錄層級。

| 站點名稱 | 類別名稱 | 檔案路徑 | 說明 |
|---------|---------|---------|------|
| **esjzone** | `NovelSiteESJZone` | `esjzone/index.ts` | ESJ Zone（中文輕小說網站） |
| **kakuyomu** | `NovelSiteKakuyomu` | `kakuyomu/index.ts` | カクヨム（日本小說網站） |
| **novelba** | `NovelSiteNovelba` | `novelba/index.ts` | Novelba（中文小說網站） |
| **novelup** | `NovelSiteESJZone` | `novelup/index.ts` | ノベルアップ+（日本小說網站） |
| **x23qb** | `NovelSiteX23qb` | `x23qb/index.ts` | 頂點小說（中文小說網站） |

**共計**: 5 個站點

### ⚠️ 特殊實作

| 站點名稱 | 類別名稱 | 檔案路徑 | 說明 |
|---------|---------|---------|------|
| **dmzj** | `NovelSiteDmzj` | `dmzj/index.ts` | 動漫之家（中文輕小說網站）<br/>*註: 直接繼承 `NovelSite`，已標記為 `@deprecated` 和 `disabled = true`* |
| **pixiv** | - | `pixiv/` | 目錄為空，尚未實作 |

---

## 選擇指南

### 何時使用 Base 核心？

適用於以下情況：
- ✅ 站點結構簡單，使用傳統的「卷 → 章節」兩層結構
- ✅ 目錄列表可以直接轉換為陣列
- ✅ 不需要複雜的分類或群組功能

**範例**: 大多數傳統小說網站，如 wenku8、uukanshu 等

### 何時使用 Tree 核心？

適用於以下情況：
- ✅ 站點有複雜的目錄結構（如多層分類、章節群組）
- ✅ 需要保留原始的樹狀層級關係
- ✅ 目錄可能包含非章節節點（如分隔符、說明文字）

**範例**: 
- **kakuyomu**: 支援「部 → 章 → 話」三層結構
- **esjzone**: 支援自訂分類和群組
- **x23qb**: 支援書籍分卷和章節群組

---

## 實作統計

```
總站點數: 16
├─ 基於 Base 核心: 9 (56.25%)
├─ 基於 Tree 核心: 5 (31.25%)
├─ 特殊實作: 1 (6.25%)
└─ 未實作: 1 (6.25%)
```

---

## 附錄：檔案結構

```
site/
├── demo/
│   ├── base.ts          # 基本核心實作
│   ├── tree.ts          # 樹狀結構實作
│   └── demo.ts          # 示範模板（未使用）
├── alphapolis/          # Base 核心
├── dmzj/                # 特殊實作（已棄用）
├── esjzone/             # Tree 核心
├── hetubook/            # Base 核心
├── iqing/               # Base 核心
├── kakuyomu/            # Tree 核心
├── millionbook/         # Base 核心
├── novelba/             # Tree 核心
├── novelup/             # Tree 核心
├── pixiv/               # 未實作（空目錄）
├── sfacg/               # Base 核心
├── syosetu/             # Base 核心
├── uukanshu/            # Base 核心
├── webqxs/              # Base 核心
├── wenku8/              # Base 核心
└── x23qb/               # Tree 核心
```

---

## 更新日誌

- **2026-02-12**: 初始版本，分析並分類所有站點模組
