/**
 * Created by user on 2018/3/25/025.
 */

import { retryRequest } from '../../fetch';
import { stripContent } from '../../strip';
import { array_unique, isUndef, minifyHTML, trim } from '../../util';
import _NovelSite, { staticImplements, SYMBOL_CACHE, IMdconfMeta } from '../index';
import { IDownloadOptions, INovel } from '../demo/base';
import { IFetchChapter, IOptionsRuntime } from '../demo/base';
import * as NovelSiteDemo from '../demo/base';
import NovelSiteBase from '../demo/base';
import { URL } from 'jsdom-url';
import { fromURL, IFromUrlOptions, IJSDOM } from 'jsdom-extra';
import { PromiseBluebird, bluebirdDecorator } from '../index';
import { moment } from '../index';
import novelText from 'novel-text';
import * as path from "path";
import * as StrUtil from 'str-util';
import { zhRegExp } from 'regexp-cjk';
import { requestToJSDOM, packJSDOM, createJSDOM } from 'jsdom-extra';

@staticImplements<_NovelSite.INovelSiteStatic<NovelSiteTpl>>()
export class NovelSiteTpl extends NovelSiteBase
{
	public static readonly IDKEY = path.basename(__dirname);

	makeUrl(urlobj: _NovelSite.IParseUrl, bool?: boolean | number): URL
	{
		let url: string;

		if (!bool && urlobj.volume_id && urlobj.chapter_id)
		{
			url = `http://v2.api.dmzj.com/novel/download/${urlobj.novel_id}_${urlobj.volume_id}_${urlobj.chapter_id}.txt`;
		}
		else if (bool === true && urlobj.novel_id)
		{
			url = `http://v2.api.dmzj.com/novel/chapter/${urlobj.novel_id}.json`;
		}
		else
		{
			url = `http://v2.api.dmzj.com/novel/${urlobj.novel_id}.json`;
		}

		// @ts-ignore
		return new URL(url);
	}

	parseUrl(url: URL | string, options?): _NovelSite.IParseUrl
	{
		let urlobj = {
			url: url,

			novel_id: null,
			chapter_id: null,

			volume_id: null,
		};

		// @ts-ignore
		urlobj.url = new URL(url);
		// @ts-ignore
		url = urlobj.url.href;

		let r = /api\.dmzj\.com\/novel\/(\d+).json/;

		let m = r.exec(url as string);
		if (m)
		{
			urlobj.novel_id = m[1];

			return urlobj;
		}

		r = /api\.dmzj\.com\/novel\/chapter\/(\d+).json/;
		if (m = r.exec(url as string))
		{
			urlobj.novel_id = m[1];

			return urlobj;
		}

		r = /api\.dmzj\.com\/novel\/download\/(\d+)_(\d+)_(\d+).txt/;
		if (m = r.exec(url as string))
		{
			urlobj.novel_id = m[1];
			urlobj.volume_id = m[2];
			urlobj.chapter_id = m[3];

			return urlobj;
		}

		return urlobj;
	}

	session<T = NovelSite.IOptionsRuntime>(optionsRuntime: Partial<T & IDownloadOptions>, url: URL)
	{
		super.session(optionsRuntime, url);

		optionsRuntime.optionsJSDOM.requestOptions = optionsRuntime.optionsJSDOM.requestOptions || {};

		optionsRuntime.optionsJSDOM.requestOptions.contentType = 'json';

		//let url = optionsRuntime[SYMBOL_CACHE].url;

		optionsRuntime.optionsJSDOM.cookieJar
		//.setCookieSync('over18=yes; Domain=.syosetu.com; Path=/', url.href)
		;

		return this;
	}

	createMainUrl(url)
	{
		let data = this.parseUrl(url);

		if (!data || !data.novel_id)
		{
			console.log(data);

			throw new ReferenceError();
		}

		let ret = this.makeUrl(data, true);

		return ret;
	}

	_stripContent(text: string)
	{
		text = stripContent(text);

		//process.exit();

		return text
			//.replace(/^　　/gm, '')
			.replace(/^[\uFEFF\xA0]+/gm, '')
		;
	}

	protected _saveReadme(optionsRuntime: IOptionsRuntime, options = {}, ...opts)
	{
		options[this.IDKEY] = {
			novel_id: optionsRuntime[SYMBOL_CACHE].novel.novel_id,
		};

		return super._saveReadme(optionsRuntime, options, {
			options: {
				textlayout: {
					allow_lf2: true,
				}
			},
		}, ...opts);
	}

	protected _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache): string
	{
		if (!ret)
		{
			return '';
		}

		let body_selector = 'body';

		try
		{
//			let html = minifyHTML(ret.dom.$(body_selector).html());
//
//			//html = html.replace(/^(&nbsp;){4}/gm, '');
//			html = html.replace(/^\s+|\s+$/g, '');
//
//			ret.dom.$(body_selector).html(html);
		}
		catch (e)
		{

		}

		let text: string;

		if (ret.dom)
		{
			text = ret.dom.$(body_selector).text();
		}
		else
		{
			ret.dom = createJSDOM(ret.body.toString());

			text = ret.dom.$(body_selector).text();
		}

		text = this._stripContent(text);

		return text;
	}

	_createChapterUrl<T = IOptionsRuntime>({
		novel,
		volume,
		chapter,
	}, optionsRuntime?)
	{
		// @ts-ignore
		return new URL(chapter.chapter_url);
	}

	async get_volume_list<T = IOptionsRuntime>(inputUrl: string | URL,
		optionsRuntime: Partial<T & IDownloadOptions> = {}
	): Promise<INovel>
	{
		const self = this;
		let url = await this.createMainUrl(inputUrl);

		return await retryRequest(url, optionsRuntime.requestOptions)
			.then(async function (dom)
			{
				const $ = dom.$;

				dom = JSON.parse(dom as string);

				let data_meta = await self._get_meta(url, optionsRuntime, {
					dom,
				});

				url = data_meta.url;
				let url_data = data_meta.url_data;

				let _cache_dates = [];
				let volume_list = [] as _NovelSite.IVolume[];

				let currentVolume: _NovelSite.IVolume;

				let table = dom;

				table.forEach(function (volumeData: {
					volume_id: number,
					id: number,
					volume_name: string,
					volume_order: number,
					chapters: {
						chapter_id: number,
						chapter_name: string,
						chapter_order: number,
					}[],
				})
				{
					currentVolume = volume_list[volume_list.length] = {
						volume_index: volume_list.length,
						volume_title: novelText.trim(volumeData.volume_name),
						volume_is: volumeData.volume_id,
						volume_order: volumeData.volume_order,
						chapter_list: [],
					};

					volumeData.chapters.forEach(function (chapterData)
					{
						let chapter_url = self.makeUrl({
							chapter_id: chapterData.chapter_id,
							novel_id: data_meta.novel_id,
							volume_id: volumeData.volume_id,
						});

						let chapter_url_data = self.parseUrl(chapter_url);

						currentVolume
							.chapter_list
							.push({
								chapter_index: currentVolume.chapter_list.length,
								chapter_title: novelText.trim(chapterData.chapter_name),
								chapter_id: chapterData.chapter_id,
								chapter_order: chapterData.chapter_order,
								chapter_url,
								chapter_url_data,
							})
						;
					});
				});

				let novel_date;

				if (_cache_dates.length)
				{
					_cache_dates.sort();

					novel_date = moment.unix(_cache_dates[_cache_dates.length - 1]).local();
				}

				return {

					url: dom.url,
					url_data,

					...data_meta,

					volume_list,

					//novel_date,

					checkdate: moment().local(),

					imgs: [] as string[],
				} as INovel;
			})
			.tap(function (novel)
			{
				console.dir(novel, {
					colors: true,
					//depth: 3,
				});
			})
			;
	}

	protected async _get_meta(inputUrl, optionsRuntime, cache: {
		dom: IJSDOM,
	})
	{
		const self = this;

		let url = this.makeUrl(this.parseUrl(inputUrl), -1);
		let url_data = this.parseUrl(url);

		return retryRequest(url, optionsRuntime.requestOptions)
		//return fromURL(url, optionsRuntime.optionsJSDOM)
		//return Promise.resolve(cache.dom)
			.then(function (domJson)
			{
				domJson = JSON.parse(domJson as string);

				let data: IMdconfMeta = {};
				data.novel = {};
				data.novel.tags = [];

				let novel_title = domJson.name;
				let novel_author = domJson.authors;

				domJson.types = domJson.types || [];
				domJson.types.forEach(function (s)
				{
					data.novel.tags.push(...s.split('\/'))
				});

				data.novel.tags.push(domJson.zone);
				data.novel.tags.push(domJson.status);

				data.novel.status = domJson.status;

				let novel_cover = domJson.cover;
				let novel_desc = domJson.introduction;

				let novel_id = domJson.id;

				let novel_date = moment.unix(domJson.last_update_time).local();

				//console.log(domJson);

				let dmzj_api_json = domJson;

				let novel_url = `http://q.dmzj.com/${novel_id}/index.shtml`;

				return {
					url,
					url_data,

					...data,

					novel_url,

					novel_id,

					novel_title,

					novel_cover,

					novel_author,
					novel_desc,

					novel_date,

					dmzj_api_json,

				};
			})
			;
	}
}

export default NovelSiteTpl;
