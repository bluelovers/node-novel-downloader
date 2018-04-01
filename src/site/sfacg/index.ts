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

@staticImplements<_NovelSite.INovelSiteStatic<NovelSiteSfacg>>()
export class NovelSiteSfacg extends NovelSiteBase
{
	public static readonly IDKEY = 'sfacg';

	makeUrl(urlobj: _NovelSite.IParseUrl, bool?: boolean | number): URL
	{
		let url: string;

		if (bool < 0)
		{
			url = `http://book.sfacg.com/Novel/${urlobj.novel_id}/`;
		}
		else if (urlobj.chapter_vip && urlobj.chapter_id)
		{
			url = `http://book.sfacg.com/vip/c/${urlobj.chapter_id}/`;
		}
		else
		{
			let cid = (!bool && urlobj.chapter_id) ? [urlobj.novel_pid, urlobj.chapter_id].join('/') : 'MainIndex';

			url = `http://book.sfacg.com/Novel/${urlobj.novel_id}/${cid}/`;
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

			chapter_vip: null,
		};

		urlobj.url = new URL(url);
		url = urlobj.url.href;

		let r = /book\.sfacg\.com\/Novel\/(\d+)\/(?:(\d+)\/(\d+))/;

		let m = r.exec(url);
		if (m)
		{
			urlobj.novel_pid = m[2];
			urlobj.novel_id = m[1];
			urlobj.chapter_id = m[3];

			return urlobj;
		}

		r = /book\.sfacg\.com\/Novel\/(\d+)\/(?:MainIndex)?/;
		if (m = r.exec(url))
		{
			urlobj.novel_id = m[1];

			return urlobj;
		}

		r = /book\.sfacg\.com\/vip\/c\/(\d+)/;
		if (m = r.exec(url))
		{
			urlobj.chapter_id = m[1];
			urlobj.chapter_vip = true;

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

		try
		{
			let html = minifyHTML(ret.dom.$('#ChapterBody').html());

			//html = html.replace(/^(&nbsp;){4}/gm, '');
			html = html.replace(/^\s+|\s+$/g, '');

			ret.dom.$('#ChapterBody').html(html);
		}
		catch (e)
		{

		}

		ret.dom.$('#ChapterBody').html(function (i, old)
		{
			return old.replace(/(<\/p>)[ \t]*(<p>)/g, '$1\n$2');
		});

		/*
		ret.dom.$('#ChapterBody p').text(function (i, old)
		{
			return old + "\n";
		});
		*/

		ret.dom.$('#ChapterBody img[src]').each(function ()
		{
			let src = ret.dom.$(this).prop('src').trim();

			if (src)
			{
				cache.chapter.imgs = cache.chapter.imgs || [];

				cache.chapter.imgs.push(src);
				cache.novel.imgs.push(src);
			}
		});

		let text = ret.dom.$('#ChapterBody').text();

		if (cache.chapter.chapter_vip)
		{
			text = `付費章节\n\n==========================\n\n${text}`;
		}

		try
		{
			let chapter_date;
			let d = ret.dom.$('#"article .article-desc .text:eq(1)')
				.text()
				.replace(/^.+：/g, '')
				.trim()
			;

			chapter_date = moment(d, 'YYYY/MM/DD HH:mm:ss').local();

			cache.chapter.chapter_date = chapter_date;
		}
		catch (e)
		{}

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

				let data_meta = await self._get_meta(url, optionsRuntime);

				let _cache_dates = [];
				let volume_list = [] as _NovelSite.IVolume[];

				let currentVolume: _NovelSite.IVolume;

				let novel_vip = 0;

				let table = $('.s-list .story-catalog > div');
				table
					.each(function (index)
					{
						let tr = dom.$(this);

						if (tr.is('.catalog-hd'))
						{
							currentVolume = volume_list[volume_list.length] = {
								volume_index: volume_list.length,
								volume_title: novelText.trim(tr.find('.catalog-title').text()),
								chapter_list: [],
							};
						}
						else if (tr.is('.catalog-list'))
						{
							tr.find('ul > li > a')
								.each(function (index)
								{
									let a = dom.$(this);

									let href = a.prop('href');

									let data = self.parseUrl(href);

									if (!data.chapter_id || !data.chapter_vip && !data.novel_pid)
									{
										//console.log(href, data);

										throw new Error()
									}
									else
									{
										href = self.makeUrl(data);

										data.url = href;
									}

									let chapter_vip = a.find('.icn_vip').length;

									if (chapter_vip)
									{
										novel_vip++;
									}

									a
										.find('.icn, .icn_vip')
										.remove()
									;

									let chapter_title = trim(a.text());

									if (chapter_title === '')
									{
										return;
									}

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

	protected async _get_meta(inputUrl, optionsRuntime)
	{
		const self = this;

		let url = this.makeUrl(this.parseUrl(inputUrl), -1);

		return fromURL(url, optionsRuntime.optionsJSDOM)
			.then(function (dom)
			{
				const $ = dom.$;
				let data: IMdconfMeta = {};
				data.novel = {};

				let novel_author = $('.author-info .author-name span')
					.text()
					.trim()
				;

				let novel_desc = $('.summary-content .introduce')
					.text()
					.trim()
				;

				data.novel.status = $('.count-detail .text:eq(1)')
					.text()
					.replace(/^.+\[(.+)\].*$/g, '$1')
				;
				data.novel.tags = [];

				{
					let t = $('.count-detail .text:eq(0)')
						.text()
						.replace(/^.+：/g, '')
						.trim()
					;

					if (t)
					{
						data.novel.tags.push(t);
					}
				}

				$('.main-part .tag-list .tag .text')
					.each(function ()
					{
						let t = trim($(this)
							.text()
							.replace(/\(\d+\)/g, ''))
						;

						if (t)
						{
							data.novel.tags.push(t);
						}
					})
				;

				let novel_date;

				{
					let d = $('.count-detail .text:last')
						.text()
						.replace(/更新：/, '')
						.trim()
						;

					//console.log(d);

					novel_date = moment(d, 'YYYY/MM/DD HH:mm:ss').local();
				}

				let novel_title = trim($('.summary-content .title .text').text());

				let url_data = self.parseUrl(url);

				$(`.d-summary .summary-pic img[src], #hasTicket .left-part a[href*="${url_data.novel_id}"] img[src]`).each(function ()
				{
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

					novel_date,

				};
			})
		;
	}
}

export default NovelSiteSfacg;
