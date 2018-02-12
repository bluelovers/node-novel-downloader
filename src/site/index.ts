/**
 * Created by user on 2018/2/10/010.
 */

import bluebirdDecorator from '../decorator/bluebird';
//import bluebirdDecorator from 'bluebird-decorator';

import * as PromiseBluebird from 'bluebird';
import { URL } from 'jsdom-url';
import * as path from "path";

//import * as moment from 'moment';
import * as moment from 'moment-timezone';
moment.fn.toJSON = function () { return this.format(); };

export { moment };

export { bluebirdDecorator, PromiseBluebird }

export class NovelSite implements NovelSite.INovelSite
{
	public PATH_NOVEL_MAIN: string;
	public options?: NovelSite.IOptions;

	constructor(options: NovelSite.IOptions, ...argv)
	{
		this.options = options;
		this.options.cwd = this.options.cwd || process.cwd();

		if (!this.options.outputDir)
		{
			throw new ReferenceError(`options: outputDir is not set`);
		}

		this.PATH_NOVEL_MAIN = path.join(this.options.outputDir, this.options.disableOutputDirPrefix ? '' : this.IDKEY);

		if (!path.isAbsolute(this.PATH_NOVEL_MAIN))
		{
			this.PATH_NOVEL_MAIN = path.join(this.options.cwd, this.PATH_NOVEL_MAIN);
		}

		if (this.PATH_NOVEL_MAIN.indexOf(__dirname) == 0)
		{
			throw new ReferenceError(`path not allow "${this.PATH_NOVEL_MAIN}"`)
		}
	}

	static create(options: NovelSite.IOptions, ...argv)
	{
		return new this(options, ...argv);
	}

	download(url: string | URL, options?: NovelSite.IDownloadOptions): PromiseBluebird<NovelSite.INovel>
	{
		throw new SyntaxError(`Function not implemented`);
	}

	makeUrl(urlobj: NovelSite.IParseUrl, options?): URL
	{
		throw new SyntaxError(`Function not implemented`);
	}

	parseUrl(url: URL | string): NovelSite.IParseUrl
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

export namespace NovelSite
{
	export interface IOptions
	{
		outputDir?: string,
		cwd?: string,

		disableOutputDirPrefix?: boolean,
	}

	export interface IParseUrl
	{
		url?: URL | string,

		novel_pid?,
		novel_id?,
		chapter_id?,

		novel_r18?,
	}

	export interface IChapter
	{
		chapter_index?: number,
		chapter_title: string,
		chapter_id?
		chapter_url?
		chapter_url_data?
		chapter_date?: moment.Moment,
	}

	export interface IVolume
	{
		volume_index?
		volume_title: string,
		chapter_list: IChapter[],
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
