#!/usr/bin/env node

import { download } from '..';
import yargs = require("yargs");
import path = require("path");
import { Arguments } from 'yargs';
import requireNovelSiteClass, { EnumNovelSiteList, NovelSite } from "novel-downloader"
import console from '../lib/log';
import PACKAGE_JSON = require('../package.json');
import updateNotifier = require('update-notifier');
import { EnumPathNovelStyle } from 'novel-downloader/src/site/index';
import { isNpx } from '@yarn-tool/is-npx';
import { ITSPartialPick } from 'ts-type';
import NovelSiteSyosetu, { IOptionsPlus as IOptionsPlusNovelSiteSyosetu } from 'novel-downloader/src/site/syosetu/index';


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
		desc: `不生成檔名後綴(例如時間日期那些，可用來保持檔案只有一個版本ˋ)`,
		type: "boolean",
	})
	.option('filePrefixMode', {
		desc: `更改檔名前綴風格 0 | 1 | 2 | 3 | 4 | 5`,
		type: "number",
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
		desc: `debugLog`,
		type: 'boolean',
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
	})
	.option('keepRuby', {
		desc: `保留 Ruby 注音語法`,
		type: 'boolean',
	})
	.option('keepFormat', {
		desc: `保留其他格式語法`,
		type: 'boolean',
	})
	.option('keepImage', {
		desc: `在內文原始位置上保留圖片`,
		type: 'boolean',
	})
	.command('list', '顯示出目前的模組名稱', function (args)
	{
		console.log(Object.keys(EnumNovelSiteList).filter(v => /^[a-z]/i.test(v)));

		process.exit();

		return args
	})
	.argv as Arguments<ICliArgv>
;

interface ICliArgv extends ITSPartialPick<IOptionsPlusNovelSiteSyosetu, 'disableTxtdownload'>, ITSPartialPick<NovelSite.IDownloadOptions, 'disableDownload' | 'noFirePrefix' | 'noFilePadend' | 'filePrefixMode' | 'startIndex' | 'pathNovelStyle' | 'disableCheckExists' | 'fetchMetaDataOnly' | 'keepRuby' | 'keepFormat' | 'keepImage'>, ITSPartialPick<NovelSite.IOptions, 'outputDir'>
{
	siteID?: EnumNovelSiteList,

	crlf?: boolean,

	debug?: boolean,
}

let url: string = cli._[0];

if (!isNpx({
	__dirname
}))
{
	checkUpdateSelf().notify();
}

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

function fixOptions(cli: Arguments<ICliArgv>, downloadOptions: NovelSite.IDownloadOptions, siteOptions: NovelSite.IOptions)
{
	if (cli.outputDir)
	{
		let s1 = path.normalize(cli.outputDir);

		[
			__dirname as string,
			path.join(__dirname, '..'),
		].some(function (v)
		{
			let s2 = path.normalize(v);
			if (s1 == s2)
			{
				cli.outputDir = path.join(__dirname, '..', 'test/temp');
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

	siteOptions.outputDir = cli.outputDir;

	return { cli, downloadOptions, siteOptions };
}

function checkUpdateSelf()
{
	let data = updateNotifier({
		pkg: PACKAGE_JSON,
	});

	return data;
}
