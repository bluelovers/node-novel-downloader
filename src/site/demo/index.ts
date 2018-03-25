import { retryRequest } from '../../fetch';
import fs, {} from 'fs-iconv';
import * as path from 'path';
import novelInfo, { IMdconfMeta } from 'node-novel-info';
import { fromURL, IFromUrlOptions, IJSDOM, requestToJSDOM } from 'jsdom-extra';
import { URL } from 'jsdom-url';
import { getFilePath } from '../fs';

import NovelSite, { staticImplements, defaultJSDOMOptions, SYMBOL_CACHE } from '../index';
import { PromiseBluebird } from '../index';

export type IOptionsPlus = {}

export type IDownloadOptions = NovelSite.IDownloadOptions & NovelSite.IOptions & IOptionsPlus
export type IOptionsRuntime = NovelSite.IOptionsRuntime & IOptionsPlus

export type INovel = NovelSite.INovel;

@staticImplements<NovelSite.INovelSiteStatic<NovelSiteDemo>>()
export class NovelSiteDemo extends NovelSite
{
	public static readonly IDKEY: string = null;

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
				url = this.createMainUrl(url);

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

						return PromiseBluebird
							.mapSeries(volume.chapter_list, async function (chapter, cid)
							{
								//chapter.chapter_index = (idx++);
								idx++;

								let file = getFilePath(self, {
									chapter, cid,
									ext: '.txt',

									idx,

									dirname,
									volume, vid,
								}, optionsRuntime);

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
									.then(function (dom)
									{
										return self._parseChapter(dom);
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

	protected _parseChapter(dom: IJSDOM): string
	{
		if (!dom)
		{
			return '';
		}

		throw new SyntaxError(`Function not implemented`);
	}

	protected _fetchChapter<T>(url: URL, optionsRuntime: T & IOptionsRuntime): PromiseBluebird<IJSDOM>
	{
		return PromiseBluebird.resolve().then(function ()
		{
			let fn;

			if (optionsRuntime.disableDownload)
			{
				fn = null;
			}
			else if (optionsRuntime.retryDelay > 0)
			{
				fn = retryRequest(url, {
					delay: optionsRuntime.retryDelay,
					jar: optionsRuntime.optionsJSDOM.cookieJar,
					resolveWithFullResponse: true,
				})
					.then(function (res)
					{
						return requestToJSDOM(res, url, optionsRuntime.optionsJSDOM)
					})
				;
			}
			else
			{
				fn = fromURL(url, optionsRuntime.optionsJSDOM);
			}

			return fn;
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

export default NovelSiteDemo;
