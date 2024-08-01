#!/usr/bin/env node

import { download } from '..';
import yargs, { Arguments } from "yargs";
import { join, normalize } from "path";
import { EnumNovelSiteList, NovelSite } from "novel-downloader"
import { console } from '../lib/log';
import { updateNotifier } from '@yarn-tool/update-notifier';
import { ITSPartialPick } from 'ts-type/lib/type/record';
import { IOptionsPlus as IOptionsPlusNovelSiteSyosetu } from 'novel-downloader/src/site/syosetu/index';
import { CookieJar as CookiesParser } from 'netscape-cookies-parser2';

let cli = yargs
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
	.option('cookiesFile', {
		desc: `加載 cookies.txt 檔案`,
	})
	.command('list', '顯示出目前的模組名稱', function (args)
	{
		console.log(Object.keys(EnumNovelSiteList).filter(v => /^[a-z]/i.test(v)));

		process.exit();

		return args
	})
	.argv as Arguments<ICliArgv>
;

interface ICliArgv extends ITSPartialPick<IOptionsPlusNovelSiteSyosetu, 'disableTxtdownload' | 'protocolMode'>, ITSPartialPick<NovelSite.IDownloadOptions, 'disableDownload' | 'noFirePrefix' | 'noFilePadend' | 'filePrefixMode' | 'startIndex' | 'pathNovelStyle' | 'disableCheckExists' | 'fetchMetaDataOnly' | 'keepRuby' | 'keepFormat' | 'keepImage'>, ITSPartialPick<NovelSite.IOptions, 'outputDir'>
{
	siteID?: EnumNovelSiteList,

	crlf?: boolean,

	debug?: boolean,
}

// @ts-ignore
let url: string = cli._[0];

updateNotifier([__dirname, '..']);

if (!url)
{
	yargs.showHelp();
}
else
{
	let downloadOptions: NovelSite.IDownloadOptions = {};
	let siteOptions: NovelSite.IOptions = {};

	({ downloadOptions, siteOptions } = fixOptions(cli, downloadOptions, siteOptions));

	console.dir({
		cli,
		downloadOptions,
		siteOptions,
	});

	download(url, downloadOptions, cli.siteID, siteOptions)
		.tap(function (novel)
		{
			console.success(novel.novel_title);
		})
		.tapCatch(function ()
		{
			yargs.showHelp();
		})
	;
}

function fixOptions(cli: Arguments<ICliArgv>,
	downloadOptions: NovelSite.IDownloadOptions,
	siteOptions: NovelSite.IOptions,
)
{
	if (cli.outputDir)
	{
		let s1 = normalize(cli.outputDir);

		[
			__dirname as string,
			join(__dirname, '..'),
		].some(function (v)
		{
			let s2 = normalize(v);
			if (s1 == s2)
			{
				cli.outputDir = join(__dirname, '..', 'test/temp');
				return true;
			}
		})
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

	if (cli.cookiesFile)
	{
		try
		{
			const parser = new CookiesParser();
			parser.load(<string>cli.cookiesFile)
			let cookies = parser.parse();

			siteOptions.sessionData ??= {};

			for (let cookie of cookies)
			{
				siteOptions.sessionData[cookie.name] = {
					key: cookie.name,
					value: cookie.value,
					domain: cookie.domain.replace(/^./, ""), // BUG: 不知為何不能喂入前面有點的 domain
					path: cookie.path,
					secure: cookie.secure,
					expires: new Date(cookie.expires * 1000),
				}
			}

		}
		catch
		{
			console.error(`加載 cookies 檔案 ${cli.cookiesFile} 失敗`);
		}

	}

	return { cli, downloadOptions, siteOptions };
}
