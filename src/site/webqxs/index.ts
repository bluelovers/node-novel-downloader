/**
 * Created by user on 2018/3/25/025.
 */

import { isUndef, minifyHTML } from '../../util';
import _NovelSite, { staticImplements, SYMBOL_CACHE } from '../index';
import { IDownloadOptions, INovel } from '../demo/base';
import { IFetchChapter, IOptionsRuntime } from '../demo/base';
import * as NovelSiteDemo from '../demo/base';
import NovelSiteBase from '../demo/base';
import { URL } from 'jsdom-url';
import { fromURL, IFromUrlOptions, IJSDOM } from 'jsdom-extra';
import { PromiseBluebird, bluebirdDecorator } from '../index';
import { moment } from '../index';
import novelText from 'novel-text';

@staticImplements<_NovelSite.INovelSiteStatic<NovelSiteWebqxs>>()
export class NovelSiteWebqxs extends NovelSiteBase
{
	public static readonly IDKEY = 'webqxs';

	makeUrl(urlobj: _NovelSite.IParseUrl, bool?: boolean | number): URL
	{
		let url: string;

		if (isUndef(urlobj.novel_pid) || bool < 0)
		{
			url = `http://www.webqxs.com/lightnovel/${urlobj.novel_id}.html`;
		}
		else
		{
			let cid = (!bool && urlobj.chapter_id) ? urlobj.chapter_id + '.html' : '';

			url = `http://www.webqxs.com/${urlobj.novel_pid}/${urlobj.novel_id}/${cid}`;
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

		let r = /www\.webqxs\.com\/([\d]+)\/([\d]+)\/(?:([\d]+)\.html?)?/;

		let m = r.exec(url);
		if (m)
		{
			urlobj.novel_pid = m[1];
			urlobj.novel_id = m[2];
			urlobj.chapter_id = m[3];

			return urlobj;
		}

		r = /www\.webqxs\.com\/lightnovel\/(\d+).html/;
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

		if (!data || isUndef(data.novel_pid) || !data.novel_id)
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

		try
		{
			let html = minifyHTML(ret.dom.$('#articlecontent').html());

			html = html.replace(/^(&nbsp;){4}/gm, '');

			ret.dom.$('#articlecontent').html(html);
		}
		catch (e)
		{}

		return ret.dom.$('#articlecontent').text();
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
				let novel_title = dom.$('.story-head .story-title').text();

				let data_meta = await self._get_meta(url, optionsRuntime);

				let _cache_dates = [];
				let volume_list = [] as _NovelSite.IVolume[];

				let currentVolume: _NovelSite.IVolume;

				let table = $('.ml_content .ml_list ul').eq(0);
				table.children()
					.each(function (index)
					{
						let tr = dom.$(this);

						if (tr.is('div.volume-z'))
						{
							currentVolume = volume_list[volume_list.length] = {
								volume_index: volume_list.length,
								volume_title: novelText.trim(tr.text()),
								chapter_list: [],
							};
						}
						else if (tr.is('li'))
						{
							tr.find('a')
								.each(function (index)
								{
									let a = dom.$(this);

									let href = a.prop('href');

									let data = self.parseUrl(href);

									if (!data.chapter_id)
									{
										throw new Error()
									}
									else
									{
										href = self.makeUrl(data);

										data.url = href;
									}

									let chapter_title = a.text().trim();

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

					...data_meta,

					url: dom.url,
					url_data,

					novel_title,

					volume_list,

					novel_date,

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

	protected async _get_meta(inputUrl, optionsRuntime)
	{
		let url = this.makeUrl(this.parseUrl(inputUrl), -1);

		return fromURL(url, optionsRuntime.optionsJSDOM)
			.then(function (dom)
			{
				const $ = dom.$;

				let novel_author = $('.z-author .f-text-overflow')
					.text()
					.trim()
				;

				$('.u-bookDetail-synopsis .u-synopsis-text > strong:eq(0)').remove();

				let novel_desc = $('.u-bookDetail-synopsis .u-synopsis-text')
					.text()
					.trim()
				;

				return {
					url,

					novel_author,
					novel_desc,
				};
			})
		;
	}
}

export default NovelSiteWebqxs;
