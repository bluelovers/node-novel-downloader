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
import { URL } from 'jsdom-url';
import { fromURL, IFromUrlOptions, IJSDOM } from 'jsdom-extra';
import { PromiseBluebird, bluebirdDecorator } from '../index';
import { moment } from '../index';
import novelText from 'novel-text';
import * as path from "path";
import * as StrUtil from 'str-util';
import { zhRegExp } from 'regexp-cjk';
const { Script } = require("vm");

@staticImplements<_NovelSite.INovelSiteStatic<NovelSiteHetubook>>()
export class NovelSiteHetubook extends NovelSiteBase
{
	public static readonly IDKEY = path.basename(__dirname);

	makeUrl(urlobj: _NovelSite.IParseUrl, bool?: boolean | number): URL
	{
		let url: string;

		let cid = (!bool && urlobj.chapter_id) ? `${urlobj.chapter_id}.html` : 'index.html';

		url = `http://www.hetubook.com/book/${urlobj.novel_id}/${cid}`;

		// @ts-ignore
		return new URL(url);
	}

	parseUrl(url: URL | string, options?): _NovelSite.IParseUrl
	{
		let urlobj = {
			url: url,

			novel_pid: null,
			novel_id: null,
			chapter_id: null,

			chapter_vip: null,
		};

		// @ts-ignore
		urlobj.url = new URL(url);
		// @ts-ignore
		url = urlobj.url.href;

		let r = /www\.hetubook\.com\/book\/(\d+)\/(?:(\d+)|index)\.html/;

		// @ts-ignore
		let m = r.exec(url);
		if (m)
		{
			urlobj.novel_id = m[1];
			urlobj.chapter_id = m[2];

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

	_stripContent(text: string)
	{
		text = stripContent(text);

		//process.exit();

		return text
			.replace(/^　　/gm, '')
			.replace(/^[ \uFEFF\xA0]+/gm, '')
		;
	}

	session(optionsRuntime, url)
	{
		super.session(optionsRuntime, url);

		Object.assign(optionsRuntime.optionsJSDOM, {
			minifyHTML: false,
			runScripts: 'dangerously',
			pretendToBeVisual: true,
			resources: "usable",
		} as IOptionsRuntime["optionsJSDOM"]);

		return this;
	}

	protected _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache)
	{
		if (!ret)
		{
			return '';
		}

		let body_selector = '#content';

		ret.dom.$(body_selector).find('h2').remove();

		ret.dom.$(body_selector).html(function (i, old)
		{
			return old
				.replace(/(<\/div>)/ig, '$1\n')
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

				let table = $('#dir').find('dt, dd');
				table
					.each(function (index)
					{
						let tr = dom.$(this);

						if (tr.is('dt'))
						{
							currentVolume = volume_list[volume_list.length] = {
								volume_index: volume_list.length,
								volume_title: novelText.trim(tr.text()),
								chapter_list: [],
							};
						}

						if (tr.is('dd, dt:has(a)'))
						{
							tr.find('a:eq(0)')
								.each(function (index)
								{
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

				let novel_author = trim($('.book_info a[href*="/author/"]').text());

				$('.jieshao_content h3:eq(0)').html(function (i, old)
				{
					return old.replace(/(<br\/?>)/ig, '$1\n');
				});

				let novel_desc = $('.book_info .intro')
					.text()
					.trim()
				;

				if ($('.book_info.finish').length)
				{
					data.novel.status = '已完結';
				}

				let novel_title = trim(
					$('.book_info > img[alt]').attr('alt')
				);

				let url_data = self.parseUrl(url);

				data.novel.cover = $(`.book_info > img`).prop('src');

				data.novel.tags = [];

				data.novel.tags.push($('.title a:eq(1)').text());

				$('.tag dd .button')
					.each(function ()
					{
						data.novel.tags.push($(this).text());
					})
				;

				return {
					url,
					url_data,

					...data,

					novel_title,

					novel_author,
					novel_desc,

				} as INovel;
			})
			;
	}
}

export default NovelSiteHetubook;
