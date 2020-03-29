import { retryRequest } from '../../fetch';
import fs from 'fs-extra';
import path from 'upath2';
import novelInfo, { IMdconfMeta } from 'node-novel-info';
import { fromURL, IFromUrlOptions, IJSDOM, requestToJSDOM, packJSDOM } from 'jsdom-extra';
//import { URL } from 'jsdom-url';
import { getFilePath } from '../fs';

import { getOptions } from '../../jsdom';
import { normalize_val } from 'node-novel-globby/lib/helper';
import { globbyASync } from 'node-novel-globby/g';
import {
	lazyAnalyzeReportAll,
	lazyAnalyzeAll,
	dummyCache,
	analyzeJa002,
	handleJa002,
} from '@node-novel/layout-reporter';
import { outputBlock002, outputJa002 } from '@node-novel/layout-reporter/lib/md';
import { ITSPartialPick } from 'ts-type';

import _NovelSite, { staticImplements, defaultJSDOMOptions, SYMBOL_CACHE } from '../index';
import { PromiseBluebird } from '../index';

import parseContentType from 'content-type-parser';
import novelText from 'novel-text';

import { LazyCookie, LazyCookieJar } from 'jsdom-extra';

import { toughCookie } from 'jsdom-extra';

import { stringify as mdconf_stringify, parse as mdconf_parse } from 'mdconf2';
import { SYMBOL_NODE } from 'js-tree-list2/src/utils';

export type IOptionsPlus = {}

export type IDownloadOptions = _NovelSite.IDownloadOptions & _NovelSite.IOptions & IOptionsPlus
export type IOptionsRuntime = _NovelSite.IOptionsRuntime & IOptionsPlus

export import INovel = _NovelSite.INovel;

import { ResponseRequest } from 'request';

import { chalkByConsole, console, consoleDebug } from '../../util/log';
import { hashSum } from '../../util/hash';
import { NovelTree, TreeNode, IRowChapter, IRowVolume } from '../../tree';
import { array_unique } from '../../util';
import { array_unique_overwrite } from 'array-hyper-unique';
import outputNovelToAttach from '../../util/outputNovelToAttach';

export type IFetchChapter = {
	body?: any;
	dom?: IJSDOM;
	res?: ResponseRequest;
	json?,

	url?: URL,
	contentTypeParsed?: ReturnType<parseContentType>,
};

export type ISessionData = {
	[key: string]: any,
}

@staticImplements<_NovelSite.INovelSiteStatic<NovelSiteDemo>>()
export class NovelSiteDemo extends _NovelSite
{
	public static readonly IDKEY: string = null;

	constructor(options: IDownloadOptions, ...argv)
	{
		super(options, ...argv);
	}

	/**
	 * @todo 讓此方法有意義
	 *
	 * 用來說明目前站點的所需 session cookies
	 *
	 * @param {T} data
	 * @returns {T}
	 */
	checkSessionData<T = ISessionData>(data: T, optionsRuntime: IOptionsRuntime = {})
	{
		return data;
	}

	session<T = IOptionsRuntime>(optionsRuntime: Partial<T & IDownloadOptions>, url: URL, domain?: string)
	{
		super.session(optionsRuntime, url);

		if (optionsRuntime.sessionData && Object.keys(optionsRuntime.sessionData).length)
		{
			Object.entries(optionsRuntime.sessionData)
				.forEach(function (data)
				{
					let c: LazyCookie.Properties;
					let typec = typeof data[1];

					if (data[1] && typec == 'object')
					{
						c = data[1];
					}
					else if (typec === null || typec != 'object')
					{
						let [key, value] = data;

						c = {
							key,
							value,
						};
					}
					else
					{
						c = data[1];
					}

					if (c)
					{

						if (typeof c == 'object')
						{
							if (!c.path)
							{
								c.path = '/';
							}

							if (c.hostOnly == null)
							{
								c.hostOnly = false;
							}
						}

						if (!(typeof c === 'string' || c instanceof LazyCookie || c instanceof toughCookie.Cookie))
						{
							// @ts-ignore
							c = new toughCookie.Cookie(c)
						}

						optionsRuntime.optionsJSDOM.cookieJar
							.setCookieSync(c, url.href)
						;

						if (typeof c == 'object' && !c.domain)
						{
							if (domain)
							{
								c.domain = domain;
							}
							else if (url && url.host)
							{
								c.domain = url.host;
							}

							try
							{
								optionsRuntime.optionsJSDOM.cookieJar
									.setCookieSync(c, url.href)
								;
							}
							catch (e)
							{

							}
						}
					}
				})
			;

			consoleDebug.debug(`session`, optionsRuntime.optionsJSDOM.cookieJar);
		}

		return this;
	}

	download(inputUrl: string | URL, downloadOptions: IDownloadOptions = {})
	{
		const self = this;
		let url = inputUrl as URL;

		const [PATH_NOVEL_MAIN, optionsRuntime] = this.getOutputDir<IOptionsRuntime & IDownloadOptions>(downloadOptions);

		consoleDebug.enabled = optionsRuntime.debugLog;

		return PromiseBluebird
			.bind(self)
			.then(async () =>
			{
				url = await this.createMainUrl(url, optionsRuntime);

				self.session(optionsRuntime, url);

				consoleDebug.info('分析章節列表', url.toString());

				let novel = await self.get_volume_list<IOptionsRuntime & IDownloadOptions>(url, optionsRuntime);

				let path_novel = self.getPathNovel(PATH_NOVEL_MAIN, novel, optionsRuntime);

				self._loadExistsConf(url, optionsRuntime, novel, path_novel);

				let idx = optionsRuntime.startIndex || 0;

				optionsRuntime[SYMBOL_CACHE].novel = novel;
				optionsRuntime[SYMBOL_CACHE].path_novel = path_novel;

				await PromiseBluebird
					.resolve(self.processNovel(novel, optionsRuntime, {
						url,
						path_novel,
					}))
					.tap(ls =>
					{
						return self._outputAttach(novel, optionsRuntime, {
							url,
							path_novel,
						})
					})
					.tap(ls =>
					{
						let file = path.join(path_novel,
							`${self.trimFilenameNovel(novel.novel_title)}.${novel.url_data.novel_id}.json`,
							)
						;

						return fs.outputJSON(file, novel, {
							spaces: "\t",
						});
					})
				;

				await self._saveReadme(optionsRuntime);

				let _cache = dummyCache();

				await globbyASync([
					'**/*.txt',
				], {
					cwd: path_novel,
				})
					.mapSeries(async (file) =>
					{
						let _p = path.parse(file);
						const _cache_key_ = path.join(_p.dir, _p.name);

						await fs
							.readFile(path.join(path_novel, file))
							.then(buf =>
							{
								analyzeJa002({
									input: buf.toString(),
									_cache_key_,
									_cache,
								});
							})
						;
					})
					.tap(async () =>
					{

						let md = outputJa002({
							inputData: _cache.ja2,
						});

						return fs.outputFile(path.join(path_novel, 'ja2.md'), md)
					})
				;

				return novel;
			})
			;
	}

	protected async _outputAttach<T = any>(novel: INovel, optionsRuntime: IOptionsRuntime, _cache_: {
		url: URL,
		path_novel: string,
	}, ...argv)
	{
		const self = this;
		const { url, path_novel } = _cache_;
		const { keepImage = false } = optionsRuntime;

		if (novel.novelTree)
		{
			let treeList = NovelTree.treeToList(novel.novelTree, true);

			return PromiseBluebird
				.each(treeList.slice(1), async (listRow) =>
				{
					let volume = listRow.content as IRowVolume;

					if (volume.type !== 'volume' || !volume.imgs?.length)
					{
						return;
					}

					const dirname = path.join(path_novel, volume.dirname);

					const imgs = array_unique_overwrite(volume.imgs).filter(v => v) as string[];

					volume.imgs = imgs;

					return outputNovelToAttach({
						imgs,
						dirname,
						keepImage,
						path_novel,
					})
				})

		}
		else if (novel.volume_list)
		{
			consoleDebug.info(`檢查 ATTACH 資料`);

			return PromiseBluebird
				.resolve(novel.volume_list)
				.each((volume, vid) =>
				{

					let dirname: string;

					{
						let _vid = '';

						if (!optionsRuntime.noDirPrefix)
						{
							_vid = vid.toString().padStart(4, '0') + '0';
							_vid += '_';
						}

						dirname = path.join(path_novel,
							`${_vid}${self.trimFilenameVolume(volume.volume_title)}`,
						);
					}

					let imgs: string[] = [];

					return PromiseBluebird
						.resolve(volume.chapter_list)
						.each(async (chapter) =>
						{
							if (chapter.imgs)
							{
								imgs.push(...chapter.imgs);
							}
						})
						.tap(async () =>
						{
							imgs = imgs.filter(v => v);

							consoleDebug.debug(`[ATTACH]`, `${path.relative(path_novel, dirname)}`, imgs.length);

							if (imgs.length)
							{
								return outputNovelToAttach({
									imgs,
									dirname,
									keepImage,
									path_novel,
								})
							}
						})
				})
				;
		}

		return PromiseBluebird.resolve()
	}

	protected async _processNovel<T = any>(novel: INovel, optionsRuntime: IOptionsRuntime, _cache_: {
		url: URL,
		path_novel: string,
	}, ...argv)
	{
		const self = this;
		let idx = optionsRuntime.startIndex || 0;

		let { url, path_novel } = _cache_;

		return PromiseBluebird
			.mapSeries(novel.volume_list, (volume, vid) =>
			{
				let dirname: string;

				{
					let _vid = '';

					if (!optionsRuntime.noDirPrefix)
					{
						_vid = vid.toString().padStart(4, '0') + '0';
						_vid += '_';
					}

					dirname = path.join(path_novel,
						`${_vid}${self.trimFilenameVolume(volume.volume_title)}`,
					);
				}

				consoleDebug.debug(vid, volume.volume_title);

				if (!optionsRuntime.noFirePrefix && optionsRuntime.filePrefixMode >= 2)
				{
					let i: number;

					let bool = volume.chapter_list.every(function (chapter, j)
					{
						let m = (optionsRuntime.filePrefixMode > 3 ?
								chapter.chapter_title : normalize_val(chapter.chapter_title)
							)
							.replace(/^\D+/, '')
							//.replace(/^(\d+).+$/, '$1')
							.replace(/^(\d+)\D.*$/, '$1')
						;

						//console.log(m, chapter.chapter_title);

						if (/^\d+$/.test(m))
						{
							let m2 = parseInt(m);

							if (j == 0)
							{
								i = m2;

								return true;
							}
							else if (m2 === ++i)
							{
								return true;
							}
						}

						return false;
					});

					//console.log(bool);

					if (bool)
					{
						volume.chapter_list.forEach(function (chapter)
						{
							chapter.chapter_index = '';
						});
					}
				}

				if (optionsRuntime.event)
				{
					self.emit(optionsRuntime.event, 'volume', volume, {
						optionsRuntime,
						dirname,
						vid,
						novel,
						url,
					});
				}

				return PromiseBluebird
					.mapSeries(volume.chapter_list, async (chapter, cid) =>
					{
						//chapter.chapter_index = (idx++);

						const current_idx = idx++;

						let file = getFilePath(self, {
							chapter, cid,
							ext: '.txt',

							idx: current_idx,

							dirname,
							volume, vid,
						}, optionsRuntime);

						if (self._checkExists(optionsRuntime, file))
						{
							consoleDebug.debug(`[SKIP]`, vid, cid, chapter.chapter_title);

							return file;
						}

						let url = self._createChapterUrl({
							novel,
							volume,
							chapter,
						}, optionsRuntime);

						consoleDebug.debug(vid, cid, chapter.chapter_title);
						//consoleDebug.debug(url.toString());

						await self._fetchChapterMain({
								url,
								file,
								volume,
								chapter,
							}, optionsRuntime, {
								novel,
							})

							.then(async (text: string) =>
							{
								await this._saveFile({
									file,
									context: text,
									optionsRuntime,
								});

								return text;
							})
						;

						return file;
					})
					;
			})
			.then(function (ret)
			{
				return ret as any as T;
			})
			;
	}

	processNovel<T>(novel: INovel, optionsRuntime: IOptionsRuntime, _cache_: {
		url: URL,
		path_novel: string,
	}, ...argv)
	{
		// @ts-ignore
		let pr: any;

		consoleDebug.info('開始處理小說');

		pr = optionsRuntime.fetchMetaDataOnly ? [] : this._processNovel<T>(novel, optionsRuntime, _cache_, ...argv);

		return PromiseBluebird
			.resolve(pr)
			.then(function (ret: T)
			{
				return {
					novel,
					optionsRuntime,
					_cache_,
					ret,
				};
			})
			;
	}

	protected _stripContent(text: string)
	{
		return text;
	}

	protected _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache: {
		file: string,
		novel: _NovelSite.INovel,
		volume: _NovelSite.IVolume,
		chapter: _NovelSite.IChapter,
		doRetry: number,
	}): string | Promise<string>
	{
		if (!ret)
		{
			return '';
		}

		throw new SyntaxError(`Function not implemented`);
	}

	protected _fetchChapterRetryError<T>(message: string, ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache: {
		file: string,
		novel: _NovelSite.INovel,
		volume: _NovelSite.IVolume,
		chapter: _NovelSite.IChapter,
		doRetry: number,
	}): Error & {
		doRetry: number
	}
	{
		let e: Error & {
			doRetry: number
		} = new Error(message) as any;

		e.doRetry = (cache.doRetry | 0) + 1;

		return e
	}

	protected _fetchChapterMain<T>(argv: {
		url: URL,
		file: string,
		volume: _NovelSite.IVolume,
		chapter: _NovelSite.IChapter,
	}, optionsRuntime: T & IOptionsRuntime, _cache_: {
		novel: INovel,
	})
	{
		const self = this;

		let { url, file, volume, chapter } = argv;
		let { novel } = _cache_;

		return PromiseBluebird.resolve()
			.then(async () =>
			{
				let _do = false;
				let doRetry = 0;
				let value: string;
				do
				{
					_do = false;

					value = await self._fetchChapter(url, optionsRuntime, {
							novel,
						})
						.then(async (ret) =>
						{
							return self._parseChapter(ret, optionsRuntime, {
								file,
								novel,
								volume,
								chapter,
								doRetry,
							});
						})
						.catch(async (e: Error & {
							doRetry: number
						}) =>
						{
							if (e.doRetry > 0 && e.doRetry < 5)
							{
								_do = true;
								doRetry = e.doRetry | 0;
								let delay = 5000 + doRetry * 1000 + (argv.volume.volume_index as any | 0 +  argv.chapter.chapter_index as any | 0) * 10;

								console.warn(e.message, doRetry, delay);

								await PromiseBluebird.delay(delay);

								return
							}

							return Promise.reject(e)
						})

				}
				while (_do);

				return value
			})
			.then(function (text)
			{
				if (typeof text == 'string')
				{
					return novelText.toStr(text);
				}

				return text;
			})
			;
	}

	protected _fetchChapter<T>(url: URL, optionsRuntime: T & IOptionsRuntime, _cache_: {
		novel: INovel,
	})
	{
		return PromiseBluebird.resolve().then(async function ()
		{
			consoleDebug.debug(`fetchChapter`, url.toString());

			let ret = {} as IFetchChapter;

			let opts = getOptions(optionsRuntime);

			if (optionsRuntime.disableDownload)
			{
				return null;
			}
			else if (true)
			{
				if (optionsRuntime.retryDelay > 0)
				{
					// @ts-ignore
					opts.requestOptions.delay = optionsRuntime.retryDelay;
				}
				else
				{
					// @ts-ignore
					opts.requestOptions.retry = 1;
				}

				await retryRequest(url, opts.requestOptions)
					.then(function (res)
					{
						const contentTypeParsed = parseContentType(res.headers["content-type"]);

						ret.contentTypeParsed = contentTypeParsed;

						// @ts-ignore
						ret.url = url;

						if (contentTypeParsed.isHTML() || contentTypeParsed.isXML())
						{
							ret.dom = requestToJSDOM(res, url, optionsRuntime.optionsJSDOM);
							ret.dom = packJSDOM(ret.dom);
						}
						else if (contentTypeParsed.subtype == 'json')
						{
							ret.json = JSON.parse(res.body.toString());
						}

						ret.res = res;
						ret.body = res.body;
					})
				;
			}
			else
			{
				// @ts-ignore
				ret.dom = await fromURL(url, optionsRuntime.optionsJSDOM);

				ret.res = ret.dom._options.Response;
				ret.body = ret.dom._options.body;
			}

			return ret;
		});
	}

	protected _exportDownloadOptions<T = IOptionsRuntime>(optionsRuntime?: T & IOptionsRuntime): Partial<T & IOptionsRuntime>
	{
		let opts: Partial<T & IOptionsRuntime> = {};

		if (optionsRuntime)
		{
			let bool: boolean;

			for (let k of [
				'noFirePrefix',
				'noFilePadend',
				'filePrefixMode',
				'startIndex',
				'keepRuby',
				'keepFormat',
				'keepImage',
				'allowEmptyVolumeTitle',
				'disableOutputDirPrefix',
			] as (keyof IOptionsRuntime)[])
			{
				if ((k in optionsRuntime) && typeof optionsRuntime[k] !== 'undefined')
				{
					bool = true;
					// @ts-ignore
					opts[k] = optionsRuntime[k];
				}
			}
		}

		return opts;
	}

	protected _saveReadme(optionsRuntime: IOptionsRuntime, options = {}, ...opts)
	{
		if (this.IDKEY)
		{
			options[this.IDKEY] = options[this.IDKEY] || {};

			try
			{
				options[this.IDKEY].novel_id = options[this.IDKEY].novel_id || optionsRuntime[SYMBOL_CACHE].novel.url_data.novel_id;
			}
			catch (e)
			{
			}
		}

		let downloadOptions = this._exportDownloadOptions(optionsRuntime);

		return super._saveReadme(optionsRuntime, options, {
			options: {
				textlayout: {
					allow_lf2: true,
				},
				downloadOptions: downloadOptions || {},
			},
		}, ...opts);
	}

	protected _get_meta(inputUrl, optionsRuntime, cache?: {
		dom?: IJSDOM,
	})
	{
		throw new SyntaxError();
	}

}

export const NovelSite = NovelSiteDemo as typeof NovelSiteDemo;

export default NovelSiteDemo;
