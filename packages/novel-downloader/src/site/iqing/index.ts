/**
 * Created by user on 2018/3/25/025.
 */

import { isUndef, minifyHTML, trim } from '../../util';
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

export type ISessionData = {

	// require
	sessionid: string,
	steins_csrf_token: string,
	online?: 1 | '1',

	// no need
	id?: number | string,
	avatar?: string,
	username?: string,

}

@staticImplements<_NovelSite.INovelSiteStatic<NovelSiteIqing>>()
export class NovelSiteIqing extends NovelSiteBase
{
	public static readonly IDKEY = 'iqing';

	checkSessionData<T = ISessionData>(data: T & ISessionData, optionsRuntime: IOptionsRuntime = {}): T
	{
		if (data)
		{
			if (data.sessionid && data.steins_csrf_token)
			{
				data.online = 1;

				return data;
			}
		}

		return data;
	}

	makeUrl(urlobj: _NovelSite.IParseUrl, bool?: boolean | number): URL
	{
		let url: string;

		if (bool || !urlobj.chapter_id)
		{
			url = `https://www.iqing.com/book/${urlobj.novel_id}/`;
		}
		else
		{
			url = `https://poi.iqing.com/content/${urlobj.chapter_id}/chapter/`;
		}

		return new URL(url);
	}

	parseUrl(url: URL | string, options?): _NovelSite.IParseUrl
	{
		let urlobj = {
			url: url,

			novel_pid: null,
			novel_id: null,
			chapter_id: null,
		};

		urlobj.url = new URL(url);
		url = urlobj.url.href;

		let r = /www\.iqing\.com\/read\/(\d+)/;

		let m = r.exec(url);
		if (m)
		{
			urlobj.chapter_id = m[1];

			return urlobj;
		}

		r = /poi\.iqing\.com\/content\/(\d+)\/chapter/;
		if (m = r.exec(url))
		{
			urlobj.chapter_id = m[1];

			return urlobj;
		}

		r = /www\.iqing\.com\/book\/(\d+)/;
		if (m = r.exec(url))
		{
			urlobj.novel_id = m[1];

			return urlobj;
		}

		return urlobj;
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

	protected _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache): string
	{
		if (!ret)
		{
			return '';
		}

		let text: string;

		if (ret.json && ret.json.results && ret.json.results.length)
		{
			text = ret.json.results
				.reduce(function (a, b)
				{
					if (b && b.value)
					{
						a.push(b.value);
					}
					else
					{
						console.log(777, b);

						throw new Error();
					}

					return a;
				}, [])
				.join("\n")
			;

			if (!text)
			{
				console.log(666, ret.json.results);

				throw new Error();
			}

			cache.chapter.chapter_date = moment(ret.json.updated_time).local();

			if (cache.chapter.chapter_vip)
			{
				text = `付費章节\n\n==========================\n\n${text}`;
			}

			return text;
		}

		console.log(ret);

		throw new Error;

		// @ts-ignore
		return text;
	}

	async get_volume_list<T = IOptionsRuntime>(inputUrl: string | URL,
		optionsRuntime: Partial<T & IDownloadOptions> = {}
	): Promise<INovel>
	{
		const self = this;
		let url = await this.createMainUrl(inputUrl);

		return await fromURL(url, optionsRuntime.optionsJSDOM)
			.then(async function (dom: IJSDOM)
			{
				const $ = dom.$;

				let url_data = self.parseUrl(dom.url.href);

				let data_meta = await self._get_meta(url, optionsRuntime, {
					dom,
				});

				let _cache_dates = [];
				let volume_list = [] as _NovelSite.IVolume[];

				let currentVolume: _NovelSite.IVolume;

				let novel_vip = 0;

				let table = $('#book-menu .list-volume li');
				table
					.each(function (index)
					{
						let tr = dom.$(this);

						if (tr.is('.volume'))
						{
							currentVolume = volume_list[volume_list.length] = {
								volume_index: volume_list.length,
								volume_title: trim(tr.find('h3').text()),
								chapter_list: [],
							};
						}
						else if (tr.is('.chapter'))
						{
							let a = tr.find('a');

							let href = a.prop('href');

							let data = self.parseUrl(href);

							if (!data.chapter_id)
							{
								//console.log(href, data);

								throw new Error()
							}
							else
							{
								href = self.makeUrl(data);

								data.url = href;
							}

							let chapter_vip;

							chapter_vip = tr.find('.lock').length;

							if (chapter_vip)
							{
								novel_vip++;
							}

							let chapter_title = trim(a.text());

							if (!chapter_title)
							{
								console.log(href);
								console.log(a);
								throw new Error()
							}

							currentVolume
								.chapter_list
								.push({
									chapter_index: currentVolume.chapter_list.length,
									chapter_title,
									chapter_id: data.chapter_id,
									chapter_url: href,
									chapter_url_data: data,

									chapter_vip,
								})
							;
						}
					})
				;

				let novel_date;

				if (_cache_dates.length)
				{
					_cache_dates.sort();

					novel_date = moment.unix(_cache_dates[_cache_dates.length - 1]).local();
				}

				if (novel_vip)
				{
					data_meta.novel = data_meta.novel || {};
					data_meta.novel.tags = data_meta.novel.tags || [];

					data_meta.novel.tags.push('VIP');
				}

				return {

					url: dom.url,
					url_data,

					...data_meta,

					novel_vip,

					volume_list,

					//novel_date,

					checkdate: moment().local(),

					imgs: [] as string[],
				} as INovel;
			})
			.tap(function (novel)
			{
				console.log(novel);
			})
			;
	}

	protected async _get_meta(inputUrl, optionsRuntime, cache: {
		dom: IJSDOM,
	})
	{
		const self = this;

		let url = inputUrl;

		return Promise.resolve(cache.dom)
			.then(function (dom)
			{
				const $ = dom.$;
				let data: IMdconfMeta = {};
				data.novel = {};

				let novel_author = $('#author-info .name[itemprop="author"] [itemprop="name"]')
					.text()
					.trim()
				;

				$('#book-top .intro').find('.t').remove();

				let novel_desc = $('#book-top .intro')
					.text()
					.trim()
				;

				data.novel.tags = [];

				$('#cat-list .cat, .book-title .book-tag')
					.each(function ()
					{
						let t = trim($(this)
							.text()
							.replace(/\(\d+\)/g, ''))
						;

						if (t)
						{
							data.novel.tags.push(t);

							if (t == '连载' && $(this).is('.book-tag'))
							{
								data.novel.status = t;
							}
						}
					})
				;

				let novel_date;

				{
					let d = $('.update-time [itemprop="datePublished"]')
						.attr('content')
						//.replace(/更新：/, '')
						.trim()
					;

					//console.log(d);

					novel_date = moment(d).local();
				}

				let novel_title = trim($('.book-title .title').text());

				$('#book-top img.cover[src]').each(function ()
				{
					data.novel.cover = $(this)
						.prop('src')
						.replace(/\?imageMogr2.+$/, '')
					;
				});

				let url_data = self.parseUrl(url);

				return {
					url,
					url_data,

					...data,

					novel_title,

					novel_author,
					novel_desc,

					novel_date,

				};
			})
			;
	}
}

export default NovelSiteIqing;
