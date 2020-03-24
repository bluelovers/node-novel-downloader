#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const yargs_1 = __importDefault(require("yargs"));
const path_1 = __importDefault(require("path"));
const novel_downloader_1 = require("novel-downloader");
const log_1 = __importDefault(require("../lib/log"));
const update_notifier_1 = require("@yarn-tool/update-notifier");
let cli = yargs_1.default
    .option('outputDir', {
    alias: ['o'],
    requiresArg: true,
    normalize: true,
    desc: `用來儲存下載的內容的主資料夾`,
    type: "string",
    default: process.cwd(),
})
    .option('siteID', {
    desc: `網站模組名稱`,
    alias: ['s'],
    requiresArg: true,
    type: "string",
})
    .option('disableTxtdownload', {
    desc: `此選項目前僅適用於 Syosetu 小說家網站`,
    type: "boolean",
    default: true,
})
    .option('disableDownload', {
    desc: `不下載小說內容僅生成檔案結構`,
    type: "boolean",
})
    .option('noFirePrefix', {
    desc: `不生成檔名前綴`,
    type: "boolean",
})
    .option('noFilePadend', {
    desc: `不生成檔名後綴(例如時間日期那些，可用來保持檔案只有一個版本)，當使用此選項後，即使網站上有編輯過的新版依然不會去下載，如果要強制下載則請額外加上 --disableCheckExists`,
    type: "boolean",
    default: true,
})
    .option('filePrefixMode', {
    desc: `更改檔名前綴風格 0 | 1 | 2 | 3 | 4 | 5`,
    type: "number",
    default: 1,
})
    .option('pathNovelStyle', {
    desc: `小說目錄樣式 0 = 預設 , 1 = 小說 ID`,
    type: "number",
})
    .option('crlf', {
    desc: `使用 crlf 作為 換行`,
    type: 'boolean',
})
    .option('debug', {
    desc: `debug 模式用來顯示額外訊息 或者 提示目前執行的進度`,
    type: 'boolean',
    default: true,
})
    .option('fetchMetaDataOnly', {
    desc: `只抓取小說的 META 資料`,
    type: 'boolean',
})
    .option('disableCheckExists', {
    desc: `不檢查章節是否已經下載過`,
    type: 'boolean',
})
    .option('startIndex', {
    type: "number",
    default: 1,
})
    .option('keepRuby', {
    desc: `保留 Ruby 注音語法`,
    type: 'boolean',
    default: true,
})
    .option('keepFormat', {
    desc: `保留其他格式語法`,
    type: 'boolean',
})
    .option('keepImage', {
    desc: `在內文原始位置上保留圖片`,
    type: 'boolean',
    default: true,
})
    .option('protocolMode', {
    desc: `強制使用 http = 2 / https = 1 (僅限支援的模組)`,
})
    .command('list', '顯示出目前的模組名稱', function (args) {
    log_1.default.log(Object.keys(novel_downloader_1.EnumNovelSiteList).filter(v => /^[a-z]/i.test(v)));
    process.exit();
    return args;
})
    .argv;
let url = cli._[0];
update_notifier_1.updateNotifier([__dirname, '..']);
if (!url) {
    yargs_1.default.showHelp();
}
else {
    let downloadOptions = {};
    let siteOptions = {};
    ({ downloadOptions, siteOptions } = fixOptions(cli, downloadOptions, siteOptions));
    log_1.default.dir({
        cli,
        downloadOptions,
        siteOptions,
    });
    __1.download(url, downloadOptions, cli.siteID, siteOptions)
        .tap(function (novel) {
        log_1.default.success(novel.novel_title);
    })
        .tapCatch(function () {
        yargs_1.default.showHelp();
    });
}
function fixOptions(cli, downloadOptions, siteOptions) {
    if (cli.outputDir) {
        let s1 = path_1.default.normalize(cli.outputDir);
        [
            __dirname,
            path_1.default.join(__dirname, '..'),
        ].some(function (v) {
            let s2 = path_1.default.normalize(v);
            if (s1 == s2) {
                cli.outputDir = path_1.default.join(__dirname, '..', 'test/temp');
                return true;
            }
        });
    }
    // @ts-ignore
    downloadOptions.disableTxtdownload = cli.disableTxtdownload;
    downloadOptions.disableDownload = cli.disableDownload;
    downloadOptions.noFilePadend = cli.noFilePadend;
    downloadOptions.noFirePrefix = cli.noFirePrefix;
    downloadOptions.filePrefixMode = cli.filePrefixMode;
    downloadOptions.startIndex = cli.startIndex;
    downloadOptions.pathNovelStyle = cli.pathNovelStyle;
    downloadOptions.disableCheckExists = cli.disableCheckExists;
    downloadOptions.fetchMetaDataOnly = cli.fetchMetaDataOnly;
    downloadOptions.lineBreakCrlf = cli.crlf;
    downloadOptions.debugLog = cli.debug;
    downloadOptions.keepFormat = cli.keepFormat;
    downloadOptions.keepRuby = cli.keepRuby;
    downloadOptions.keepImage = cli.keepImage;
    // @ts-ignore
    downloadOptions.protocolMode = cli.protocolMode;
    siteOptions.outputDir = cli.outputDir;
    return { cli, downloadOptions, siteOptions };
}
//# sourceMappingURL=novel-downloader-cli.js.map