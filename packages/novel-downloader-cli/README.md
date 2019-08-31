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
- 具有登入後下載功能(需要使用完整版本 [novel-downloader](https://www.npmjs.com/package/novel-downloader))

# 使用範例

使用之前請確認是否已經安裝 [node.js](https://nodejs.org/zh-cn/)

## 安裝

> 此步驟可以省略，但如果進行此步驟則可以加快開啟速度
> 一但使用此指令，日後有新版時需要自行手動升級

```bash
npm install -g novel-downloader-cli
```

## 列出說明

```bash
npx novel-downloader-cli help
```

```
Options:
  --help                Show help                                      [boolean]
  --version             Show version number                            [boolean]
  --outputDir, -o       用來儲存下載的內容的主資料夾
                                                [string] [default: "G:\Users\The
       Project\nodejs-yarn\node-novel-downloader\packages\novel-downloader-cli"]
  --siteID, -s          網站模組名稱                                    [string]
  --disableTxtdownload  此選項目前僅適用於 Syosetu 小說家網站
                                                       [boolean] [default: true]
  --disableDownload     不下載小說內容僅生成檔案結構                   [boolean]
  --noFirePrefix        不生成檔名前綴                                 [boolean]
  --noFilePadend        不生成檔名後綴(例如時間日期那些，可用來保持檔案只有一個
                        版本ˋ)                                         [boolean]
  --filePrefixMode      更改檔名前綴風格 0 | 1 | 2 | 3 | 4 | 5          [number]
  --pathNovelStyle      小說目錄樣式 0 = 預設 , 1 = 小說 ID             [number]
  --crlf                使用 crlf 作為 換行                            [boolean]
  --debug               debugLog                                       [boolean]
  --fetchMetaDataOnly   只抓取小說的 META 資料                         [boolean]
  --disableCheckExists  不檢查章節是否已經下載過                       [boolean]
  --startIndex                                                          [number]
  --keepRuby            保留 Ruby 注音語法                                   [boolean]
  --keepFormat          保留其他格式語法                                   [boolean]
  --keepImage           在內文原始位置上保留圖片                       [boolean]
```

## 下載小說

如果指定了 siteID 則某些網站可以輸入簡短一點的ID

> 以 http://ncode.syosetu.com/n0611em 為例

預設情況下會將下載內容放置於輸入指令時的所在目錄

`NovelSiteSyosetu` 與 `syosetu` 都代表使用小說家網站

```bash
npx novel-downloader-cli "http://ncode.syosetu.com/n0611em"
npx novel-downloader-cli --outputDir ./save "http://ncode.syosetu.com/n0611em"
npx novel-downloader-cli --siteID NovelSiteSyosetu --outputDir ./save "http://ncode.syosetu.com/n0611em"
npx novel-downloader-cli --siteID NovelSiteSyosetu --outputDir ./save "n0611em"
npx novel-downloader-cli --siteID syosetu --outputDir ./save "n0611em"
```

> 以 [誰都能做到的暗中協助魔王討伐](https://kakuyomu.jp/works/1177354054880238351) 為例

`NovelSiteKakuyomu` 與 `kakuyomu` 都代表使用カクヨム網站

```bash
npx novel-downloader-cli --siteID NovelSiteKakuyomu --outputDir ./save "https://kakuyomu.jp/works/1177354054880238351"
npx novel-downloader-cli --siteID NovelSiteKakuyomu --outputDir ./save "1177354054880238351"
npx novel-downloader-cli --siteID kakuyomu --outputDir ./save "1177354054880238351"
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

