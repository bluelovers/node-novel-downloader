/**
 * Created by user on 2018/2/10/010.
 */

import bluebirdDecorator from '../decorator/bluebird';
//import bluebirdDecorator from 'bluebird-decorator';

import * as PromiseBluebird from 'bluebird';
import { URL } from 'jsdom-url';
import * as path from "path";
import rootPath from "../../_root";

import { defaultJSDOMOptions, IFromUrlOptions, IOptionsJSDOM, createOptionsJSDOM, INovelOptionsJSDOM } from '../jsdom';

export { defaultJSDOMOptions, IFromUrlOptions, IOptionsJSDOM, createOptionsJSDOM }
import novelInfo, { IMdconfMeta } from 'node-novel-info';
import { LazyCookie, LazyCookieJar } from 'jsdom-extra';

import fs, { trimFilename } from 'fs-iconv';

//import * as moment from 'moment';
import * as moment from 'moment-timezone';
import { isUndef } from '../util';

moment.fn.toJSON = function () { return this.format(); };

export { moment };

export { bluebirdDecorator, PromiseBluebird }

export const SYMBOL_CACHE = Symbol.for('cache');

export class NovelSite implements NovelSite.INovelSite
{
	public PATH_NOVEL_MAIN: string;
	public optionsInit?: NovelSite.IOptions;

	constructor(options: NovelSite.IOptions, ...argv)
	{
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

	session<T = NovelSite.IOptionsRuntime>(optionsRuntime: T & NovelSite.IOptionsRuntime)
	{
		optionsRuntime.optionsJSDOM = createOptionsJSDOM(optionsRuntime.optionsJSDOM);

		let url = optionsRuntime[SYMBOL_CACHE].url;

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

	getStatic<T>(): typeof NovelSite
	{
		// @ts-ignore
		return this.__proto__.constructor;
	}

	get IDKEY(): string
	{
		// @ts-ignore
		let key = this.getStatic().IDKEY;

		if (typeof key != 'string' || !key)
		{
			throw new SyntaxError(`IDKEY not implemented`);
		}

		return key;
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
		return trimFilename(name);
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

		let md = novelInfo.stringify({
			novel: {
				tags: [
					self.IDKEY,
				],
				series: {
					name: novel.novel_series_title || novel.novel_title || '',
				},
			},
			options,

			link: novel.link || [],
		}, novel, ...opts);

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
			console.log(data);

			throw new ReferenceError();
		}

		return this.makeUrl(data, true);
	}
}

export type IOptionsRuntime = NovelSite.IOptionsRuntime;

export module NovelSite
{
	export type IOptionsRuntime = IOptions & IDownloadOptions & {};

	export interface IOptions
	{
		outputDir?: string,
		cwd?: string,

		disableOutputDirPrefix?: boolean,

		noDirPrefix?: boolean,
		noDirPadend?: boolean,

		noFirePrefix?: boolean,
		noFilePadend?: boolean,

		startIndex?: number,

		allowEmptyVolumeTitle?: boolean,

		filePrefixMode?: number,
	}

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
		chapter_index?: number,
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
		chapter_list: IChapter[],

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

	export interface IDownloadOptions
	{
		/**
		 * 只產生目錄結構 不下載內容
		 */
		disableDownload?: boolean,

		disableCheckExists?: boolean,

		optionsJSDOM?: IFromUrlOptions & IOptionsJSDOM,

		startIndex?: number,
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
