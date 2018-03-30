import { retryRequest } from '../../fetch';
import fs, {} from 'fs-iconv';
import * as path from 'path';
import novelInfo, { IMdconfMeta } from 'node-novel-info';
import { fromURL, IFromUrlOptions, IJSDOM, requestToJSDOM, packJSDOM } from 'jsdom-extra';
import { URL } from 'jsdom-url';
import { getFilePath } from '../fs';

import _NovelSite, { staticImplements, defaultJSDOMOptions, SYMBOL_CACHE } from '../index';
import { PromiseBluebird } from '../index';

import * as parseContentType from 'content-type-parser';

export type IOptionsPlus = {}

export type IDownloadOptions = _NovelSite.IDownloadOptions & _NovelSite.IOptions & IOptionsPlus
export type IOptionsRuntime = _NovelSite.IOptionsRuntime & IOptionsPlus

export type INovel = _NovelSite.INovel;

import { ResponseRequest } from 'request';
export type IFetchChapter = {
	body?: any;
	dom?: IJSDOM;
	res?: ResponseRequest;
};

@staticImplements<_NovelSite.INovelSiteStatic<NovelSiteDemo>>()
export class NovelSiteDemo extends _NovelSite
{
	public static readonly IDKEY: string = null;

	constructor(options: IDownloadOptions, ...argv)
	{
		super(options, ...argv);
	}

	session<T = IOptionsRuntime>(optionsRuntime: Partial<T & IDownloadOptions>, url: URL)
	{
		super.session(optionsRuntime, url);

		return this;
	}

	download(inputUrl: string | URL, downloadOptions: IDownloadOptions = {})
	{
		const self = this;

		const [PATH_NOVEL_MAIN, optionsRuntime] = this.getOutputDir<IOptionsRuntime & IDownloadOptions>(downloadOptions);

		let url = inputUrl as URL;

		return PromiseBluebird
			.bind(self)
			.then(async function ()
			{
				url = await this.createMainUrl(url);

				self.session(optionsRuntime, url);

				let novel = await self.get_volume_list<IOptionsRuntime & IDownloadOptions>(url, optionsRuntime);

				let idx = downloadOptions.startIndex || 0;

				let path_novel = path.join(self.PATH_NOVEL_MAIN,
					`${self.trimFilenameNovel(novel.novel_title)}_(${novel.url_data.novel_id})`
				);

				optionsRuntime[SYMBOL_CACHE].novel = novel;
				optionsRuntime[SYMBOL_CACHE].path_novel = path_novel;

				let ret = await PromiseBluebird
					.mapSeries(novel.volume_list, function (volume, vid)
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
								`${_vid}${self.trimFilenameVolume(volume.volume_title)}`
							);
						}

						if (!optionsRuntime.noFirePrefix && optionsRuntime.filePrefixMode == 2)
						{
							let i: number;

							let bool = volume.chapter_list.every(function (chapter, j)
							{
								let m = chapter.chapter_title
									.replace(/^\D+/, '')
									.replace(/^(\d+).+$/, '$1')
								;

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
							.mapSeries(volume.chapter_list, async function (chapter, cid)
							{
								//chapter.chapter_index = (idx++);

								let file = getFilePath(self, {
									chapter, cid,
									ext: '.txt',

									idx,

									dirname,
									volume, vid,
								}, optionsRuntime);

								idx++;

								if (self._checkExists(optionsRuntime, file))
								{
									return file;
								}

								let url = self._createChapterUrl({
									novel,
									volume,
									chapter,
								}, optionsRuntime);

								await self._fetchChapter(url, optionsRuntime)
									.then(function (ret)
									{
										return self._parseChapter(ret, optionsRuntime, {
											file,
											novel,
											volume,
											chapter,
										});
									})
									.then(async function (text: string)
									{
										await fs.outputFile(file, text);

										return text;
									})
								;

								return file;
							})
							;
					})
					.tap(ls =>
					{
						let file = path.join(path_novel,
							`${self.trimFilenameNovel(novel.novel_title)}.${novel.url_data.novel_id}.json`
							)
						;

						return fs.outputJSON(file, novel, {
							spaces: "\t",
						});
					})
				;

				await self._saveReadme(optionsRuntime);

				return novel;
			})
			;
	}

	protected _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache: {
		file: string,
		novel: _NovelSite.INovel,
		volume: _NovelSite.IVolume,
		chapter: _NovelSite.IChapter,
	}): string
	{
		if (!ret)
		{
			return '';
		}

		throw new SyntaxError(`Function not implemented`);
	}

	protected _fetchChapter<T>(url: URL, optionsRuntime: T & IOptionsRuntime)
	{
		return PromiseBluebird.resolve().then(async function ()
		{
			let ret = {

			} as IFetchChapter;

			if (optionsRuntime.disableDownload)
			{
				return null;
			}
			else if (optionsRuntime.retryDelay > 0)
			{
				await retryRequest(url, {
					delay: optionsRuntime.retryDelay,
					jar: optionsRuntime.optionsJSDOM.cookieJar.wrapForRequest(),
					resolveWithFullResponse: true,
				})
					.then(function (res)
					{
						const contentTypeParsed = parseContentType(res.headers["content-type"]);

						if (contentTypeParsed.isHTML() || contentTypeParsed.isXML())
						{
							ret.dom = requestToJSDOM(res, url, optionsRuntime.optionsJSDOM);
							ret.dom = packJSDOM(ret.dom);
						}

						ret.res = res;
						ret.body = res.body;
					})
				;
			}
			else
			{
				ret.dom = await fromURL(url, optionsRuntime.optionsJSDOM);

				ret.res = ret.dom._options.Response;
				ret.body = ret.dom._options.body;
			}

			return ret;
		});
	}

	protected _saveReadme(optionsRuntime: IOptionsRuntime, options = {}, ...opts)
	{
		return super._saveReadme(optionsRuntime, options, {
			options: {
				textlayout: {
					allow_lf2: true,
				}
			},
		}, ...opts);
	}

}

export const NovelSite = NovelSiteDemo as typeof NovelSiteDemo;

export default NovelSiteDemo;
