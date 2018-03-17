/**
 * Created by user on 2018/2/10/010.
 */

import bluebirdDecorator from '../decorator/bluebird';
//import bluebirdDecorator from 'bluebird-decorator';

import * as PromiseBluebird from 'bluebird';
import { URL } from 'jsdom-url';
import * as path from "path";
import rootPath from "../../_root";

import { defaultJSDOMOptions, IFromUrlOptions, IOptionsJSDOM, createOptionsJSDOM } from '../jsdom';
export { defaultJSDOMOptions, IFromUrlOptions, IOptionsJSDOM, createOptionsJSDOM }

import fs, { trimFilename } from 'fs-iconv';

//import * as moment from 'moment';
import * as moment from 'moment-timezone';
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

		return [p, options];
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

	static check(url: string | URL | NovelSite.IParseUrl, options?): boolean
	{
		return false;
	}

	download(url: string | URL, options?: NovelSite.IDownloadOptions): PromiseBluebird<NovelSite.INovel>
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
}

export module NovelSite
{
	export type IOptionsRuntime = IOptions & IDownloadOptions;

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
