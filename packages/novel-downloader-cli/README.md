# README

    novel-downloader 的 CLI 版本

如要使用完整功能請至 [novel-downloader](https://www.npmjs.com/package/novel-downloader)

# 前言

Ｑ：小說家本身已經有 txt 下載功能為什麼還需要這個？  
Ａ：這各腳本可以只下載上次沒下載或者作者編修後的新版本，
而不會去下載已經下載過的內容，
相對上對於小說家網站比較不會造成負擔

- 下載後的內容可以直接用來生成 epub txt
- 對於翻譯君也可以做為預先生成章節目錄結構的工具
- 某些人就是用不了小說家內建的下載功能

# 使用範例

使用之前請確認是否已經安裝 [node.js](https://nodejs.org/zh-cn/)

## 安裝

> 此步驟可以省略，但如果進行此步驟則可以加快開啟速度

```bash
npm install -g novel-downloader-cli
```

## 列出說明

```bash
npx novel-downloader-cli help
```

## 下載小說

> 以 http://ncode.syosetu.com/n0611em 為例

預設情況下會將下載內容放置於輸入指令時的所在目錄

```bash
npx novel-downloader-cli "http://ncode.syosetu.com/n0611em"
npx novel-downloader-cli --outputDir ./save "http://ncode.syosetu.com/n0611em"
npx novel-downloader-cli --siteID NovelSiteSyosetu --outputDir ./save "http://ncode.syosetu.com/n0611em"
```

## 不下載內容僅生成目錄結構

```bash
npx novel-downloader-cli --disableDownload "http://ncode.syosetu.com/n0611em"
```

## 列出所有支援的網站模組

> 會列出 siteID 列表

```bash
npx novel-downloader-cli list
```

# 結構說明

下載後的資料夾結構為 [node-novel](https://www.npmjs.com/search?q=keywords:node-novel) 結構

可搭配以下腳本使用
- [novel-epub](https://www.npmjs.com/package/novel-epub) - 打包生成 epub
- [novel-txt-merge](https://www.npmjs.com/package/novel-txt-merge) - 打包生成 單一 txt 合集

