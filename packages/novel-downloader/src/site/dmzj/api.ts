/**
 * Created by user on 2018/3/25/025.
 */

import { retryRequest } from '../../fetch';
import { stripContent } from '../../strip';
import { array_unique, escapeRegexp, isUndef, minifyHTML, trim } from '../../util';
import _NovelSite, { staticImplements, SYMBOL_CACHE, IMdconfMeta } from '../index';
import { IDownloadOptions, INovel } from '../demo/base';
import { IFetchChapter, IOptionsRuntime } from '../demo/base';
import * as NovelSiteDemo from '../demo/base';
import NovelSiteBase from '../demo/base';
//import { URL } from 'jsdom-url';
import { fromURL, IFromUrlOptions, IJSDOM } from 'jsdom-extra';
import { PromiseBluebird, bluebirdDecorator } from '../index';
import { moment } from '../index';
import novelText from 'novel-text';
import * as path from "path";
import * as StrUtil from 'str-util';
import { zhRegExp } from 'regexp-cjk';
import { requestToJSDOM, packJSDOM, createJSDOM } from 'jsdom-extra';
import { _keepImageInContext } from '../../util/html';
import createURL from '../../util/url';
import { parseUrl, makeUrl, check } from './util';

//import escapeStringRegexp = require('escape-string-regexp');

@staticImplements<_NovelSite.INovelSiteStatic<NovelSiteTpl>>()
export class NovelSiteTpl extends NovelSiteBase
{
	public static readonly IDKEY = path.basename(__dirname);

	static check(url: string | URL | _NovelSite.IParseUrl, ...argv): boolean
	{
		return check(url, ...argv);
	}

	static makeUrl(urlobj: _NovelSite.IParseUrl, bool?: boolean | number, ...argv)
	{
		return makeUrl(urlobj, bool, ...argv)
	}

	static parseUrl(url: string | URL | number, ...argv)
	{
		return parseUrl(url, ...argv);
	}

	makeUrl(urlobj: _NovelSite.IParseUrl, bool?: boolean | number, ...argv)
	{
		return makeUrl(urlobj, bool, ...argv)
	}

	parseUrl(url: string | URL | number, ...argv)
	{
		return parseUrl(url, ...argv);
	}

	session<T = IOptionsRuntime>(optionsRuntime: Partial<T & IDownloadOptions>, url: URL)
	{
		super.session(optionsRuntime, url);

		optionsRuntime.optionsJSDOM.requestOptions = optionsRuntime.optionsJSDOM.requestOptions || {};

		// @ts-ignore
		optionsRuntime.optionsJSDOM.requestOptions.contentType = 'json';

		//let url = optionsRuntime[SYMBOL_CACHE].url;

		optionsRuntime.optionsJSDOM.cookieJar
		//.setCookieSync('over18=yes; Domain=.syosetu.com; Path=/', url.href)
		;

		return this;
	}

	createMainUrl<T>(url: string | URL, optionsRuntime: T & IOptionsRuntime)
	{
		let data = this.parseUrl(url);

		if (!data || !data.novel_id)
		{
			console.log(data);

			throw new ReferenceError();
		}

		let ret = this.makeUrl(data, true, optionsRuntime);

		return ret;
	}

	_stripContent(text: string)
	{
		text = stripContent(text);

		//process.exit();

		return text
			//.replace(/^　　/gm, '')
			.replace(/^[\uFEFF\xA0]+/gm, '')
			// 修正每行開頭多出空白的問題
			.replace(/^ +/gm, '')
			.replace(/ +$/gm, '')
			.replace(/\s+$/, '')
		;
	}

	protected _saveReadme(optionsRuntime: IOptionsRuntime, options = {}, ...opts)
	{
		options[this.IDKEY] = {
			novel_id: optionsRuntime[SYMBOL_CACHE].novel.novel_id,
		};

		return super._saveReadme(optionsRuntime, options, {
			//
		}, ...opts);
	}

	protected async _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache)
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

		const $ = ret.dom.$;

		if (ret.dom.$('img').length)
		{
			cache.chapter.imgs = cache.chapter.imgs || [];

			ret.dom.$('img[src]').each(function ()
			{
				// @ts-ignore
				cache.chapter.imgs.push(ret.dom.$(this).prop('src'));
				// @ts-ignore
				cache.novel.imgs.push(ret.dom.$(this).prop('src'));
			});

			if (optionsRuntime.keepImage)
			{
				await _keepImageInContext(ret.dom.$('img[src]'), ret.dom.$);
			}
		}

		text = this._stripContent(text);

		let sp = '[\u00a0 　]*';

		let r = new zhRegExp(`^[\u00a0 　\\s]*${escapeRegexp(cache.volume.volume_title)}${sp}${escapeRegexp(cache.chapter.chapter_title)}${sp}`, 'ig');

		text = text
			.replace(r, '')
		;

		return text;
	}

	async get_volume_list<T = IOptionsRuntime>(inputUrl: string | URL,
		optionsRuntime: Partial<T & IDownloadOptions> = {}
	): Promise<INovel>
	{
		const self = this;
		let url = await this.createMainUrl(inputUrl, optionsRuntime);

		// @ts-ignore
		return retryRequest(url, optionsRuntime.requestOptions)
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

					url,
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

		let url = self.makeUrl(self.parseUrl(inputUrl), -1);
		let url_data = self.parseUrl(url);

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
				//data.novel.tags.push(domJson.status);

				data.novel.status = domJson.status;

				let novel_cover = domJson.cover;
				let novel_desc = domJson.introduction;

				let novel_id = domJson.id;

				let novel_date = moment.unix(domJson.last_update_time).local();

				//console.log(domJson);

				let dmzj_api_json = domJson;

				let novel_url = self.makeUrl(url_data, 2);

				return {
					url: novel_url,
					url_data: self.parseUrl(novel_url),

					url_api: url,
					url_data_api: url_data,

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
