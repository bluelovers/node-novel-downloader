/**
 * Created by user on 2018/2/10/010.
 */

import bluebirdDecorator from '../decorator/bluebird';
//import bluebirdDecorator from 'bluebird-decorator';

import PromiseBluebird = require('bluebird');
import { URL } from 'jsdom-url';
import path = require('upath2');

import rootPath from "../../_root";
import { retryRequest } from '../fetch';

import { defaultJSDOMOptions, IFromUrlOptions, IOptionsJSDOM, createOptionsJSDOM, INovelOptionsJSDOM } from '../jsdom';

export { defaultJSDOMOptions, IFromUrlOptions, IOptionsJSDOM, createOptionsJSDOM }
import novelInfo, { IMdconfMeta, _handleDataForStringify } from 'node-novel-info';
export { IMdconfMeta }
import { LazyCookie, LazyCookieJar } from 'jsdom-extra';

import fs = require('fs-extra');
import { trimFilename } from 'fs-iconv/util';

import StrUtil = require('str-util');
import { EnumNovelStatus } from 'node-novel-info/lib/const';

//import * as moment from 'moment';
import moment = require('moment-timezone');
import { isUndef } from '../util';

import EventEmitter = require('events');
import { IDownloadOptions } from './demo/base';

moment.fn.toJSON = function () { return this.format(); };

export { moment };

export { bluebirdDecorator, PromiseBluebird }

export const SYMBOL_CACHE = Symbol.for('cache');

export class NovelSite implements NovelSite.INovelSite
{
	public static readonly IDKEY: string = null;

	public PATH_NOVEL_MAIN: string;
	public optionsInit?: NovelSite.IOptions;

	constructor(options: NovelSite.IOptions, ...argv)
	{
		if (!this.IDKEY)
		{
			throw new ReferenceError(`IDKEY is null`);
		}

		this.optionsInit = options;
		this.optionsInit.cwd = this.optionsInit.cwd || process.cwd();

		[this.PATH_NOVEL_MAIN, this.optionsInit] = this.getOutputDir(this.optionsInit);
	}

	static create(options: NovelSite.IOptions, ...argv)
	{
		return new this(options, ...argv);
	}

	static check(url: string | URL | NovelSite.IParseUrl, options?): boolean
	{
		return false;
	}

	session<T = NovelSite.IOptionsRuntime>(optionsRuntime: T & NovelSite.IOptionsRuntime, url?: URL)
	{
		optionsRuntime.optionsJSDOM = createOptionsJSDOM(optionsRuntime.optionsJSDOM);

		if (url)
		{
			optionsRuntime[SYMBOL_CACHE].url = url;
		}

		return this;
	}

	download(url: string | URL, options?: NovelSite.IDownloadOptions): PromiseBluebird<NovelSite.INovel>
	{
		throw new SyntaxError(`Function not implemented`);
	}

	get_volume_list<T = NovelSite.IOptionsRuntime>(url: string | URL,
		optionsRuntime: Partial<T & NovelSite.IDownloadOptions> = {}
	): Promise<NovelSite.INovel>
	{
		throw new SyntaxError(`Function not implemented`);
	}

	makeUrl(urlobj: NovelSite.IParseUrl, options?): URL
	{
		throw new SyntaxError(`Function not implemented`);
	}

	parseUrl(url: URL | string, options?): NovelSite.IParseUrl
	{
		throw new SyntaxError(`Function not implemented`);
	}

	getStatic<T = typeof NovelSite>(): T
	{
		// @ts-ignore
		return this.__proto__.constructor;
	}

	get IDKEY(): string
	{
		let key = this.getStatic().IDKEY;

		if (typeof key != 'string' || !key)
		{
			throw new SyntaxError(`IDKEY not implemented`);
		}

		return key;
	}

	protected _pathNovelID<N extends NovelSite.INovel, T extends NovelSite.IOptionsRuntime>(novel: N, optionsRuntime: T)
	{
		return novel.url_data.novel_id;
	}

	getPathNovel<N extends NovelSite.INovel, T extends NovelSite.IOptionsRuntime>(PATH_NOVEL_MAIN: string, novel: N, optionsRuntime: T)
	{
		let name: string;

		let novel_id = this._pathNovelID(novel, optionsRuntime);

		if (optionsRuntime.pathNovelStyle)
		{
			if (optionsRuntime.pathNovelStyle == NovelSite.EnumPathNovelStyle.NOVELID)
			{
				name = novel_id;
			}
		}

		if (name == null)
		{
			name = `${this.trimFilenameNovel(novel.novel_title)}_(${novel_id})`
		}

		return path.join(PATH_NOVEL_MAIN, name);
	}

	/**
	 * 如果已經下載過 則試圖從 README.md 內讀取缺漏的下載設定
	 *
	 * @private
	 */
	_loadExistsConf<T, N extends NovelSite.INovel>(inputUrl, optionsRuntime: T, novel: N, path_novel: string)
	{
		let file = path.resolve(path_novel, 'README.md');

		if (fs.pathExistsSync(file))
		{
			let md = fs.readFileSync(file).toString();

			let conf = novelInfo.parse(md, {
				lowCheckLevel: true,
				throw: false,
			});

			if (conf && conf.options)
			{
				if (conf.options.downloadOptions || conf.options.downloadoptions)
				{
					//console.log('載入已存在的設定', conf.options.downloadOptions);

					Object.entries(conf.options.downloadOptions || conf.options.downloadoptions)
						.forEach(function ([k, v])
						{
							if (optionsRuntime[k] == null)
							{
								optionsRuntime[k] = v;
							}
						})
					;
				}
			}
		}
	}

	getOutputDir<T>(options?: T & NovelSite.IOptions, novelName?: string): [string, T & NovelSite.IOptions]
	{
		options = Object.assign({}, this.optionsInit, options);

		if (!options.outputDir)
		{
			throw new ReferenceError(`options: outputDir is not set`);
		}

		let p = path.join(options.outputDir, options.disableOutputDirPrefix ? '' : this.IDKEY);

		if (!path.isAbsolute(p))
		{
			p = path.join(options.cwd, p);
		}

		rootPath.disablePaths.concat(__dirname).forEach(function (dir)
		{
			if (p.indexOf(__dirname) == 0)
			{
				throw new ReferenceError(`path not allow "${p}"`)
			}
		});

		if (typeof novelName == 'string' || novelName)
		{
			if (!novelName)
			{
				throw new ReferenceError();
			}

			p = path.join(p, novelName);
		}

		options = this._fixOptionsRuntime(options);

		return [p, options];
	}

	protected _fixOptionsRuntime<T = NovelSite.IOptionsRuntime>(optionsRuntime: T & NovelSite.IOptionsRuntime): T & NovelSite.IOptionsRuntime
	{
		optionsRuntime[SYMBOL_CACHE] = (optionsRuntime[SYMBOL_CACHE] || {}) as {
			url?: URL,
			path_novel?: string,
			novel?: NovelSite.INovel,
		};

		optionsRuntime.startIndex = optionsRuntime.startIndex || 0;

		// @ts-ignore
		optionsRuntime.optionsJSDOM = createOptionsJSDOM(optionsRuntime.optionsJSDOM);

		return optionsRuntime;
	}

	trimFilenameChapter(name): string
	{
		return this.trimFilename(name);
	}

	trimFilenameVolume(name): string
	{
		return this.trimFilename(name);
	}

	trimFilenameNovel(name): string
	{
		return this.trimFilename(name);
	}

	trimFilename(name): string
	{
		name = name
			.replace(/[\*\?]+/g, (v) => StrUtil.toFullWidth(v))
		;

		return trimFilename(name);
	}

	protected _exportDownloadOptions(optionsRuntime?: IOptionsRuntime): unknown
	{
		return void(0);
	}

	protected _handleDataForStringify(...argv): IMdconfMeta
	{
		// @ts-ignore
		let mdconf: IMdconfMeta = _handleDataForStringify(...argv);

		if (mdconf.novel)
		{
			if (mdconf.novel.tags && Array.isArray(mdconf.novel.tags))
			{
				let bool: boolean;

				bool = [
					'書籍化',
					'书籍化',
					'文庫化',
					'文库化',
				].some(v => {
					return mdconf.novel.tags.includes(v)
				});

				if (bool)
				{
					mdconf.novel.novel_status = (mdconf.novel.novel_status | 0) | EnumNovelStatus.P_BOOK;
				}
			}
		}

		return mdconf;
	}

	protected _saveReadme(optionsRuntime?: IOptionsRuntime, options = {}, ...opts)
	{
		const self = this;

		if (isUndef(optionsRuntime)
			|| isUndef(optionsRuntime[SYMBOL_CACHE], {})

			|| isUndef(optionsRuntime[SYMBOL_CACHE].novel, {})
			|| isUndef(optionsRuntime[SYMBOL_CACHE].path_novel, '')
		)
		{
			throw new ReferenceError(`saveReadme`);
		}

		const novel = optionsRuntime[SYMBOL_CACHE].novel;
		const path_novel = optionsRuntime[SYMBOL_CACHE].path_novel;

		let mdconfig = this._handleDataForStringify({
			novel: {
				illust: '',
				title_zh1: '',
				illusts: [],
				publishers: [
					self.IDKEY,
				],
				tags: [
					self.IDKEY,
				],
				series: {
					name: novel.novel_series_title || novel.novel_title || '',
				},
				novel_status: 0,
			},
			options,

			link: novel.link || [],
		}, novel, ...opts);

		let md = novelInfo.stringify(mdconfig);

		let file = path.join(path_novel, `README.md`);

		return fs.outputFile(file, md)
			.then(function ()
			{
				return {
					file,
					md,
				};
			})
			;
	}

	createMainUrl(url: string): URL
	createMainUrl(url: URL): URL
	createMainUrl(url)
	{
		let data = this.parseUrl(url);

		if (!data || !data.novel_id)
		{
			//console.log(data);

			throw new ReferenceError();
		}

		return this.makeUrl(data, true);
	}

	protected _createChapterUrl<T = IOptionsRuntime>({
		novel,
		volume,
		chapter,
	}: {
		novel: NovelSite.INovel,
		volume: NovelSite.IVolume,
		chapter: NovelSite.IChapter,
	}, optionsRuntime?: T & IOptionsRuntime): URL
	{
		// @ts-ignore
		return new URL(chapter.chapter_url);
	}

	protected _fetchChapter<T>(url: URL, optionsRuntime: T & IOptionsRuntime)
	{
		throw new SyntaxError(`Function not implemented`);
	}

	protected _parseChapter<T>(dom, optionsRuntime: T & IOptionsRuntime, cache: {
		file: string,
		novel: NovelSite.INovel,
		volume: NovelSite.IVolume,
		chapter: NovelSite.IChapter,
	})
	{
		throw new SyntaxError(`Function not implemented`);
	}

	getExtraInfo<T, M extends Partial<INovel & IMdconfMeta>, C extends unknown>(urlobj: NovelSite.IParseUrl, optionsRuntime: T & IOptionsRuntime, data_meta?: M, cache?: C): PromiseBluebird<M>
	{
		throw new SyntaxError(`Function not implemented`);
	}

	protected _checkExists(optionsRuntime: IOptionsRuntime, file: string): boolean
	{
		if (!optionsRuntime.disableCheckExists && fs.existsSync(file))
		{
			let txt = fs.readFileSync(file);

			if (txt.toString().replace(/^\s+|\s+$/g, ''))
			{
				return true;
			}
		}

		return false
	}

	protected emit(event: EventEmitter, eventName: string, ...argv)
	{
		let bool = event.emit(eventName, this, ...argv);
		return [event, bool];
	}
}

export import IOptionsRuntime = NovelSite.IOptionsRuntime;
export import IVolume = NovelSite.IVolume;
export import IChapter = NovelSite.IChapter;
export import EnumPathNovelStyle = NovelSite.EnumPathNovelStyle;
import { INovel } from './syosetu';

export namespace NovelSite
{
	export type IOptionsPlus = {

		disableOutputDirPrefix?: boolean,

		noDirPrefix?: boolean,
		noDirPadend?: boolean,

		noFirePrefix?: boolean,
		noFilePadend?: boolean,

		retryDelay?: number,
		startIndex?: number,

		filePrefixMode?: number,

		allowEmptyVolumeTitle?: boolean,

		event?: EventEmitter,

		/**
		 * 用來登入站點的 cookies session
		 */
		sessionData?: {
			[key: string]: any,
		},

		/**
		 * 只抓取小說的 META 資料
		 */
		fetchMetaDataOnly?: boolean,
	}

	export type IOptions = {

		outputDir?: string,
		cwd?: string,

	} & IOptionsPlus;

	export const enum EnumPathNovelStyle
	{
		DEFAULT = 0,
		NOVELID = 1,
	}

	export type IDownloadOptions = {

		/**
		 * 只產生目錄結構 不下載內容
		 */
		disableDownload?: boolean,
		disableCheckExists?: boolean,

		optionsJSDOM?: IFromUrlOptions & IOptionsJSDOM & {
			cookieJar?: Partial<LazyCookieJar>,
		},

		/**
		 * 設定小說資料夾樣式
		 */
		pathNovelStyle?: EnumPathNovelStyle,

	} & IOptionsPlus;

	export type IOptionsRuntime = IOptions & IDownloadOptions & IOptionsPlus;

	export interface IParseUrl
	{
		url?: URL | string,

		novel_pid?,
		novel_id?,
		chapter_id?,

		novel_r18?,

		[key: string]: any,
	}

	export interface IChapter
	{
		chapter_index?: number | string,
		chapter_title: string,
		chapter_id?
		chapter_url?
		chapter_url_data?
		chapter_date?: moment.Moment,

		[key: string]: any,
	}

	export interface IVolume
	{
		volume_index?
		volume_title: string,
		chapter_list?: IChapter[],

		[key: string]: any,
	}

	export interface INovel
	{
		url: URL | string,
		url_data: IParseUrl,

		novel_title: string,
		novel_author?: string,

		novel_desc?: string,
		novel_date?: moment.Moment,
		novel_publisher?: string,

		novel_series_title?: string,

		volume_list: IVolume[],

		checkdate?: moment.Moment,

		imgs?: string[],

		[key: string]: any,
	}

	export interface INovelSiteStatic<T> extends Type<T & NovelSite.INovelSite>
	{
		IDKEY: string,
	}

	export interface INovelSite
	{
		download(url: string | URL, options?: IDownloadOptions): PromiseBluebird<NovelSite.INovel>;

		makeUrl(urlobj: NovelSite.IParseUrl, options?): URL;

		parseUrl(url: URL | string): NovelSite.IParseUrl;
	}
}

export interface Type<T>
{
	new (options: NovelSite.IOptions, ...args: any[]): T;
}

export function staticImplements<T>()
{
	return (constructor: T) => {}
}

export default NovelSite;
