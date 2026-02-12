# 開發者文件 (Development Guide)

本文件詳細說明 `novel-downloader` 的核心架構與主要類別設計。

## 核心架構 (Core Architecture)

`novel-downloader` 主要由以下幾個核心部分組成：

1.  **`NovelSite` (`src/site/index.ts`)**:
    *   定義了小說站點的基礎介面 (`INovelSite`) 與靜態屬性。
    *   提供了通用的工具方法，如 `createMainUrl`, `getOutputDir`, `_saveReadme` 等。
    *   它是所有具體站點實作的基類（或介面定義）。

2.  **`NovelSiteDemo` (`src/site/demo/base.ts`)**:
    *   這是大多數站點的基礎實作類別。
    *   實作了完整的下載流程 (`download`)。
    *   提供了 `processNovel` 來處理小說結構，並迭代 `volume_list` (卷) 與 `chapter_list` (章節)。
    *   內建了重試機制 (`_fetchChapterMain`) 與 Session 管理 (`session`)。

3.  **`NovelSiteDemo` (Tree Version) (`src/site/demo/tree.ts`)**:
    *   繼承自 `src/site/demo/base.ts`。
    *   專門處理具有樹狀結構 (`NovelTree`) 的小說。
    *   覆寫了 `processNovel` 與 `_processNovelListName`，將扁平的下載列表轉換為樹狀結構進行處理。

## 主要類別與方法 (Key Classes & Methods)

### `src/site/index.ts` - `NovelSite`

這是整個系統的入口與基石。

*   **`static create(options, ...argv)`**: 靜態工廠方法，用於建立站點實例。
*   **`session(optionsRuntime, url)`**: 初始化 Session，設定 JSDOM 的 CookieJar。
*   **`download(url, options)`**: 下載小說的主要入口（由子類別實作）。
*   **`getOutputDir(options, novelName)`**: 計算並驗證輸出的目錄路徑，確保安全性。
*   **`_fixOptionsRuntime(optionsRuntime)`**: 標準化與補全運行時選項（如 `startIndex`, `keepImage` 等）。

### `src/site/demo/base.ts` - `NovelSiteDemo` (Base)

提供了標準的下載邏輯，適用於大多數結構規律的小說網站。

*   **`download(inputUrl, downloadOptions)`**:
    *   核心下載流程。
    *   步驟：
        1.  解析 URL (`createMainUrl`)。
        2.  初始化 Session (`session`)。
        3.  獲取小說卷/章列表 (`get_volume_list`)。
        4.  載入已存在的 `README.md` 設定 (`_loadExistsConf`)。
        5.  執行 `processNovel` 下載內容。
        6.  輸出 `ATTACH.md` (圖片附件) 與 `README.md`。
*   **`processNovel(novel, optionsRuntime)`**:
    *   處理小說的入口。
    *   根據 `fetchMetaDataOnly` 決定是否只抓取元數據。
*   **`_processNovel(novel, optionsRuntime)`**:
    *   實際的處理邏輯。
    *   迭代 `novel.volume_list`。
    *   處理目錄命名與 `filePrefixMode` (自動補零、序號)。
    *   並行或序列化處理章節下載。
*   **`_fetchChapterMain(argv, optionsRuntime)`**:
    *   獲取單一章節內容。
    *   包含 **重試機制**：若下載失敗，會捕捉錯誤並根據 `doRetry`次數進行延遲重試。
*   **`_saveReadme(optionsRuntime)`**:
    *   生成並保存 `README.md`，包含小說元數據與下載選項。

### `src/site/demo/tree.ts` - `NovelSiteDemo` (Tree)

適用於結構較為複雜、非單純「卷->章」結構的小說。

*   **`_processNovelListName(novel, optionsRuntime)`**:
    *   將 `NovelTree` 轉換為扁平列表 (`treeList`) 以便處理。
    *   處理目錄層級過深時的相容性 (自動調整 `noDirPrefix`)。
    *   對子節點進行排序 (`defaultSortCallback`)。
*   **`_processNovel(novel, optionsRuntime)`**:
    *   覆寫了父類別方法。
    *   遍歷 `treeList`，根據節點類型 (`volume` 或 `chapter`) 進行不同處理。
    *   支援動態計算目錄路徑。

## 重要機制 (Key Mechanisms)

### Session 與 Cookies

*   系統使用 `lazy-cookies` 與 `tough-cookie` 進行 Cookie 管理。
*   `checkSessionData`: 用於定義站點所需的特定 Cookie。
*   在 `download` 流程開始時，會自動呼叫 `session()` 將 `options.sessionData` 中的 Cookie 注入到 JSDOM 環境中。

### 檔案與目錄命名

*   **`trimFilename`**: 清理檔名中的非法字元。
*   **`filePrefixMode`**: 控制是否在檔名前加上序號 (如 `001_第一章.txt`)。
    *   支援智能檢測：若標題已包含數字序號，可自動省略自動生成的序號。
*   **`getPathNovel`**: 決定小說的主目錄名稱，可設定為使用 ID 或標題。

### 重試邏輯 (Retry Logic)

*   在 `_fetchChapterMain` 中實作。
*   捕捉 `_fetchChapter` 拋出的錯誤。
*   若錯誤物件包含 `doRetry` 屬性且小於 5 次，則等待數秒後重試。
*   延遲時間會隨著重試次數與章節索引增加，避免對伺服器造成過大壓力。

## 如何新增站點 (How to add a new site)

1.  繼承 `NovelSiteDemo` (`src/site/demo/base.ts`)。
2.  實作 `makeUrl`, `parseUrl`, `check` 等靜態與實例方法。
3.  實作 `get_volume_list` 來解析小說目錄。
4.  實作 `_fetchChapter` 來解析單一章節內容。
