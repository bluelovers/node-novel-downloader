/**
 * Created by user on 2018/3/25/025.
 */

import { stripContent } from '../../strip';
import { array_unique, isUndef, minifyHTML, trim } from '../../util';
import _NovelSite, { staticImplements, SYMBOL_CACHE, IMdconfMeta } from '../index';
import { IDownloadOptions, INovel } from '../demo/base';
import { IFetchChapter, IOptionsRuntime } from '../demo/base';
import * as NovelSiteDemo from '../demo/base';
import NovelSiteBase from '../demo/base';
//import { URL } from 'jsdom-url';
import { fromURL, IFromUrlOptions, IJSDOM } from 'jsdom-extra';
import { PromiseBluebird, bluebirdDecorator } from '../index';
import { moment } from '../index';
import novelText from '@node-novel/layout';
import path from "path";
import StrUtil from 'str-util';
import { zhRegExp } from 'regexp-cjk';
import { parseUrl, makeUrl, check } from './util';
import { keepFormatTag } from '../../util/html';

@staticImplements<_NovelSite.INovelSiteStatic<NovelSiteClass>>()
export class NovelSiteClass extends NovelSiteBase
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

	protected _stripContent(text: string)
	{
		return text
			.replace(/^[\t\n]+|\s+$/g, '')
			.replace(/^\t+/gm, '')
			;
	}

	protected _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache): string
	{
		if (!ret)
		{
			return '';
		}

		let body_selector = '#novelBoby';

		keepFormatTag(ret.dom.$(body_selector), {
			$,
			optionsRuntime,
		});

		let text = ret.dom.$(body_selector).text();

		text = this._stripContent(text);

		return text;
	}

	async get_volume_list<T = IOptionsRuntime>(inputUrl: string | URL,
		optionsRuntime: Partial<T & IDownloadOptions> = {}
	): Promise<INovel>
	{
		const self = this;
		let url = await this.createMainUrl(inputUrl, optionsRuntime);

		return fromURL(url, optionsRuntime.optionsJSDOM)
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

				let table = $('.episodes > *');
				table
					.each(function (index)
					{
						// @ts-ignore
						let tr = dom.$(this);

						if (tr.is('h3'))
						{
							let title = novelText.trim(trim(tr.text())) || 'null';

							currentVolume = volume_list[volume_list.length] = {
								volume_index: volume_list.length,
								volume_title: title,
								chapter_list: [],
							};
						}
						else if (tr.is('.chapter-rental'))
						{
							let title = novelText.trim(trim(tr.find('h3').text())) || 'null';

							currentVolume = volume_list[volume_list.length] = {
								volume_index: volume_list.length,
								volume_title: title,
								chapter_list: [],
							};
						}
						else if (tr.is('.rental'))
						{
							if (!currentVolume)
							{
								currentVolume = volume_list[volume_list.length] = {
									volume_index: volume_list.length,
									volume_title: 'null',
									chapter_list: [],
								};
							}

							tr.find('.rental-episode')
								.each(function ()
								{
									// @ts-ignore
									let item = dom.$(this);

									let a = item.find('a:has(> h3)');

									let href = a.prop('href') || a.attr('data-href') || a.attr('href');

									let data = self.parseUrl(href);

									if (!data.chapter_id)
									{
										//console.log(href, data);
										//console.log(item.html());
										//console.log(a.html());

										throw new Error(`發生錯誤 無法解析章節網址`)
									}
									else
									{
										href = self.makeUrl(data);

										data.url = href;
									}

									let chapter_title = trim(a.find('> h3').text());

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
										})
									;
								})
						}
						else if (tr.is('.episode'))
						{
							if (!currentVolume)
							{
								currentVolume = volume_list[volume_list.length] = {
									volume_index: volume_list.length,
									volume_title: 'null',
									chapter_list: [],
								};
							}

							let a = tr.find('a:has(.title)');

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

							let chapter_title = trim(a.find('.title').text());

							if (!chapter_title)
							{
								console.log(href);
								console.log(a);
								throw new Error()
							}

							let chapter_date;
							let dd;
							let da = a.find('.open-date');

							dd = trim(da.text());

							if (dd)
							{
								chapter_date = moment(dd, 'YYYY/MM/DD HH:mm').local();
								_cache_dates.push(chapter_date.unix());
							}

							currentVolume
								.chapter_list
								.push({
									chapter_index: currentVolume.chapter_list.length,
									chapter_title,
									chapter_id: data.chapter_id,
									chapter_url: href,
									chapter_url_data: data,
									chapter_date,
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

				return {

					url: dom.url,
					url_data,

					...data_meta,

					volume_list,

					novel_date,

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

		//return fromURL(url, optionsRuntime.optionsJSDOM)
		return Promise.resolve(cache.dom)
			.then(function (dom)
			{
				const $ = dom.$;
				let data: IMdconfMeta = {};
				data.novel = {};

				let novel_author = trim($('#main .content-main .author a:eq(0)').text());

				let novel_title = trim($('.content-info .title a').text());

				let novel_cover;
				let novel_cover2: string = $('.content-info .cover img').prop('src') || '';

				if (novel_cover2 && !novel_cover2.match(/no_image\.png/))
				{
					novel_cover = novel_cover2
				}

				let novel_desc = trim($('.content-info .abstract').text());

				let url_data = self.parseUrl(url);

				data.novel.tags = [];

				$('#main .content-tags .tag > a')
					.each(function ()
					{
						// @ts-ignore
						data.novel.tags.push(trim($(this).text()))
					})
				;

				data.novel.status = trim($('.content-info .content-statuses .content-status.complete').text());

				{
					let a = $('.content-info .content-statuses .content-status.novels');

					if (a.length)
					{
						data.novel.tags.push(trim(a.text()));
					}
				}
				{
					let a = $('.content-info .content-statuses .content-status.volume');

					if (a.length)
					{
						data.novel.tags.push(trim(a.text()));
					}
				}

				let novel_publisher = self.IDKEY;

				return {
					url,
					url_data,

					...data,

					novel_title,
					novel_cover,
					novel_desc,

					novel_publisher,

					novel_author,

				};
			})
			;
	}
}

export default NovelSiteClass;
