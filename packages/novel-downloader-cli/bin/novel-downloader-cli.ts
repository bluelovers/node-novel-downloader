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
		type: "boolean",
	})
	.option('noFilePadend', {
		type: "boolean",
	})
	.option('filePrefixMode', {
		type: "number",
	})
	.option('pathNovelStyle', {
		desc: `小說目錄樣式 0 = 預設 , 1 = 小說 ID`,
		type: "number",
	})
	.option('startIndex', {
		type: "number",
	})
	.command('list', '顯示出目前的模組名稱', function (args)
	{
		console.log(Object.keys(EnumNovelSiteList).filter(v => /^[a-z]/i.test(v)));

		process.exit();

		return args
	})
	.argv as Arguments<ICliArgv>
;

interface ICliArgv
{
	siteID?: EnumNovelSiteList,
	outputDir?: string,
	disableTxtdownload?: boolean,
	disableDownload?: boolean,

	noFirePrefix?: boolean,
	noFilePadend?: boolean,
	filePrefixMode?: number,
	startIndex?: number,

	pathNovelStyle?: EnumPathNovelStyle,
}

let url: string = cli._[0];

checkUpdateSelf().notify();

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
