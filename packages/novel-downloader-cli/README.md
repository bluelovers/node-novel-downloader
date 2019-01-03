# README

    novel-downloader 的 CLI 版本

如要使用完整功能請至 [novel-downloader](https://www.npmjs.com/package/novel-downloader)

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

> 以下是 siteID 列表

```bash
npx novel-downloader-cli list
```

# 結構說明

下載後的資料夾結構為 [node-novel](https://www.npmjs.com/search?q=keywords:node-novel) 結構

可搭配以下腳本使用
- [novel-epub](https://www.npmjs.com/package/novel-epub) - 打包生成 epub
- [novel-txt-merge](https://www.npmjs.com/package/novel-txt-merge) - 打包生成 單一 txt 合集

