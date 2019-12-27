/**
 * Created by user on 2018/3/25/025.
 */

import { isUndef, minifyHTML, trim } from '../../util';
import _NovelSite, { IMdconfMeta, staticImplements, SYMBOL_CACHE } from '../index';
import { IDownloadOptions, INovel } from '../demo/base';
import { IFetchChapter, IOptionsRuntime } from '../demo/base';
import NovelSiteDemo from '../demo/base';
import NovelSiteBase from '../demo/base';
import { URL } from 'jsdom-url';
import { fromURL, IFromUrlOptions, IJSDOM } from 'jsdom-extra';
import { PromiseBluebird, bluebirdDecorator } from '../index';
import { moment } from '../index';
import novelText from 'novel-text';
import { EnumNovelStatus } from 'node-novel-info/lib/const';

@staticImplements<_NovelSite.INovelSiteStatic<NovelSiteWenku8>>()
export class NovelSiteWenku8 extends NovelSiteBase
{
	public static readonly IDKEY = 'wenku8';

	makeUrl<T>(urlobj: _NovelSite.IParseUrl, bool?: boolean | number, optionsRuntime?: T & IOptionsRuntime): URL
	{
		let url: string;

		if (bool < 0)
		{
			url = `http://www.wenku8.com/book/${urlobj.novel_id}.htm`;
		}
		else
		{
			let cid = (!bool && urlobj.chapter_id) ? '&cid=' + urlobj.chapter_id : '';

			url = `http://www.wenku8.com/modules/article/reader.php?aid=${urlobj.novel_id}${cid}`;
		}

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
		};

		if (/^\d+$/.test(String(url)))
		{
			urlobj.novel_id = String(url);

			return urlobj;
		}

		// @ts-ignore
		urlobj.url = new URL(url);
		// @ts-ignore
		url = urlobj.url.href as string;

		let r: RegExp;
		let m: RegExpExecArray;

		r = /modules\/article\/articleinfo\.php\?id=(\d+)/;
		if (m = r.exec(url))
		{
			urlobj.novel_id = m[1];

			return urlobj;
		}

		r = /modules\/article\/reader\.php\?aid=(\d+)(?:&cid=(\d+))?/;
		if (m = r.exec(url))
		{
			urlobj.novel_id = m[1];
			urlobj.chapter_id = m[2];

			return urlobj;
		}

		r = /book\/(\d+)\.htm/;
		if (m = r.exec(url))
		{
			urlobj.novel_id = m[1];

			return urlobj;
		}

		r = /novel\/([\d]+)\/([\d]+)\/(?:([\d]+)\.html?)?/;
		if (m = r.exec(url))
		{
			urlobj.novel_pid = m[1];
			urlobj.novel_id = m[2];
			urlobj.chapter_id = m[3];
		}

		r = /^(\d+)$/;
		if (m = r.exec(url))
		{
			urlobj.novel_id = m[1];

			return urlobj;
		}

		return urlobj;
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

	protected _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache): string
	{
		if (!ret)
		{
			return '';
		}

		{
			let c = ret.dom.$('#content');

			c.find('#contentdp').remove();
			c.find('#contentdp').remove();
			c.find('#contentdp').remove();
		}

		try
		{
			let html = minifyHTML(ret.dom.$('#content').html());

			html = html.replace(/^(&nbsp;){4}/gm, '');

			ret.dom.$('#content').html(html);
		}
		catch (e)
		{

		}

		ret.dom.$('#content img[src]').each(function ()
		{
			// @ts-ignore
			let src = ret.dom.$(this).prop('src').trim();

			if (src)
			{
				cache.chapter.imgs = cache.chapter.imgs || [];

				cache.chapter.imgs.push(src);
				cache.novel.imgs.push(src);
			}
		});

		//console.log(ret.dom.serialize());

		return ret.dom.$('#content').text();
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

				let table = $('body > #info').siblings('table').eq(0);
				table
					.find('td.vcss, td.ccss')
					.each(function (index)
					{
						// @ts-ignore
						let tr = dom.$(this);

						if (tr.is('.vcss'))
						{
							currentVolume = volume_list[volume_list.length] = {
								volume_index: volume_list.length,
								volume_title: trim(tr.text()),
								chapter_list: [],
							};
						}
						else if (tr.is('.ccss'))
						{
							let a = tr.find('a').eq(0);

							if (!a.length)
							{
								return;
							}

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

							let chapter_title = trim(a.text());

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
				console.log(novel);
			})
			;
	}

	protected async _get_meta(inputUrl, optionsRuntime, cache: {
		dom: IJSDOM,
	})
	{
		const self = this;
		let url = this.makeUrl(this.parseUrl(inputUrl), -1);

		return fromURL(url, optionsRuntime.optionsJSDOM)
			.then(function (dom)
			{
				const $ = dom.$;
				let data: IMdconfMeta = {};
				data.novel = {};

				let novel_title = cache.dom.$('body > #title').text().trim();

				let novel_author = cache.dom.$('#info')
					.text()
					.replace(/^.+：/g, '')
					.trim()
				;

				let _content = dom.$('#content > div > table:eq(1)');

				let novel_cover = _content.find('img:eq(0)').prop('src');
				let novel_desc = novelText.trim(_content.find('.hottext + br + span:eq(-1)').text() || '', {
					trim: true,
				});

				let novel_status;
				let novel_date;
				let novel_publisher;

				dom.$('#content > div > table:eq(0) tr:eq(-1) > td').each(function (i, elem)
				{
					let t = trim(dom.$(elem).text());

					if (t.match(/(?:状态|狀態)：\s*(.+)/))
					{
						novel_status = trim(RegExp.$1);
					}
					else if (t.match(/(?:更新)：\s*(.+)/))
					{
						novel_date = trim(RegExp.$1);

						novel_date = moment(novel_date).local();
					}
					else if (t.match(/(?:文库分类)：\s*(.+)/))
					{
						novel_publisher = trim(RegExp.$1);
					}

				});

				let url_data = self.parseUrl(url);

				return {
					url,
					url_data,

					...data,

					novel_title,
					novel_cover,
					novel_author,
					novel_desc,

					novel_date,
					novel_status,
					novel_publisher,
				};
			})
			;
	}

	protected _handleDataForStringify(...argv): IMdconfMeta
	{
		let mdconf = super._handleDataForStringify(...argv);

		if (mdconf.novel)
		{
			mdconf.novel.novel_status = (mdconf.novel.novel_status | 0) | EnumNovelStatus.P_BOOK;

		}

		return mdconf;
	}

}

export default NovelSiteWenku8;
