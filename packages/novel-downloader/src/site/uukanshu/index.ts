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
import { parseUrl, makeUrl, check } from './util';

@staticImplements<_NovelSite.INovelSiteStatic<NovelSiteUukanshu>>()
export class NovelSiteUukanshu extends NovelSiteBase
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

	_stripContent(text: string)
	{
		text = stripContent(text);

		//process.exit();

		return text
			.replace(/^　　/gm, '')
			.replace(/^[ \uFEFF\xA0]+/gm, '')
		;
	}

	protected _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache): string
	{
		if (!ret)
		{
			return '';
		}

		ret.dom.$('.ad_content').remove();

		let body_selector = '#contentbox';

		try
		{
			let html = minifyHTML(ret.dom.$(body_selector).html());

			//html = html.replace(/^(&nbsp;){4}/gm, '');
			html = html.replace(/^\s+|\s+$/g, '');

			ret.dom.$(body_selector).html(html);
		}
		catch (e)
		{

		}

		ret.dom.$(body_selector).html(function (i, old)
		{
			return old
				.replace(/(<br\/?>)/ig, '$1\n')
				.replace(/(<p>)/ig, '\n$1')
				;
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

				// @ts-ignore
				$.fn.eachReverse = function (...argv)
				{
					// @ts-ignore
					return $($(this).get().reverse()).each(...argv);
				};

				let url_data = self.parseUrl(dom.url.href);

				let data_meta = await self._get_meta(url, optionsRuntime, {
					dom,
				});

				let _cache_dates = [];
				let volume_list = [] as _NovelSite.IVolume[];

				let currentVolume: _NovelSite.IVolume;

				let novel_vip = 0;

				let table = $('#chapterList li');
				table
					// @ts-ignore
					.eachReverse(function (index)
					{
						// @ts-ignore
						let tr = dom.$(this);

						if (tr.is('.volume'))
						{
							currentVolume = volume_list[volume_list.length] = {
								volume_index: volume_list.length,
								volume_title: novelText.trim(tr.text()),
								chapter_list: [],
							};
						}
						else if (tr.has('a').length)
						{
							tr.find('a:eq(0)')
								.each(function (index)
								{
									// @ts-ignore
									let a = dom.$(this);

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
										})
									;
								})
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

		//return fromURL(url, optionsRuntime.optionsJSDOM)
		return Promise.resolve(cache.dom)
			.then(function (dom)
			{
				const $ = dom.$;
				let data: IMdconfMeta = {};
				data.novel = {};

				let novel_author = trim($('.jieshao_content h2 a').text());

				$('.jieshao_content h3:eq(0)').html(function (i, old)
				{
					return old.replace(/(<br\/?>)/ig, '$1\n');
				});

				let novel_desc = $('.jieshao_content h3:eq(0)')
					.text()
					.trim()
				;

				novel_desc = self._stripContent(novel_desc);

				let novel_title = trim(
					$('.jieshao-img .bookImg img').attr('alt')
					|| $('.jieshao_content h1 a').text().replace(/最新章节/g, '')
				);

				let url_data = self.parseUrl(url);

				$(`.jieshao-img .bookImg img`)
					.each(function ()
					{
						// @ts-ignore
						let src = $(this).prop('src');

						if (src)
						{
							data.novel.cover = src;
						}
					});

				return {
					url,
					url_data,

					...data,

					novel_title,

					novel_author,
					novel_desc,

				};
			})
			;
	}
}

export default NovelSiteUukanshu;
