/**
 * Created by user on 2018/3/17/017.
 */

import NovelSiteDemo, { IDownloadOptions, INovel, IOptionsRuntime } from '../demo/base';

import fs, { trimFilename } from 'fs-iconv';
import * as path from 'path';
import novelInfo, { IMdconfMeta } from 'node-novel-info';
import { fromURL, IFromUrlOptions, IJSDOM } from 'jsdom-extra';

import { URL } from 'jsdom-url';

import NovelSite, { staticImplements, defaultJSDOMOptions, SYMBOL_CACHE } from '../index';
import { PromiseBluebird, bluebirdDecorator } from '../index';
import { moment } from '../index';

@staticImplements<NovelSite.INovelSiteStatic<NovelSiteKakuyomu>>()
export class NovelSiteKakuyomu extends NovelSiteDemo
{
	public static readonly IDKEY = 'kakuyomu';

	/**
	 * https://kakuyomu.jp/works/4852201425154898215/episodes/4852201425154936315
	 */
	makeUrl(urlobj: NovelSite.IParseUrl, bool ?: boolean): URL
	{
		let pad = (!bool && urlobj.chapter_id) ? '/episodes/' + urlobj.chapter_id : '';

		return new URL(`https://kakuyomu.jp/works/${urlobj.novel_id}${pad}`);
	}

	parseUrl(url: string | URL): NovelSite.IParseUrl
	{
		let urlobj = {
			url,

			novel_pid: null,
			novel_id: null,
			chapter_id: null,

		};

		//url = url.toString();

		try
		{
			urlobj.url = new URL(url);
			url = urlobj.url.href;
		}
		catch (e)
		{
			console.warn(e.toString() + ` "${url}"`);
		}

		if (typeof url != 'string')
		{
			// @ts-ignore
			throw new TypeError(url);
		}

		let r: RegExp;
		let m;

		r = /^(\d{10,})$/;
		if (m = r.exec(url))
		{
			urlobj.novel_id = m[1];
			return urlobj;
		}

		r = /kakuyomu\.jp\/works\/(\d+)(?:\/(?:episodes\/(\d+)))?/g;
		if (m = r.exec(url))
		{
			urlobj.novel_id = m[1];
			urlobj.chapter_id = m[2];

			return urlobj;
		}

		return urlobj;
	}

	protected _parseChapter<T>(ret, optionsRuntime, cache): string
	{
		if (!ret)
		{
			return '';
		}

		return ret.dom.$('#contentMain .widget-episodeBody').text();
	}

	async get_volume_list<T = NovelSite.IOptionsRuntime>(url: string | URL,
		optionsRuntime: Partial<T & IDownloadOptions> = {}
	): Promise<INovel>
	{
		const self = this;

		url = await this.createMainUrl(url as any);

		return await fromURL(url, optionsRuntime.optionsJSDOM)
			.then(async function (dom: IJSDOM)
			{
				const $ = dom.$;

				let novel_title = dom.$('#workTitle').text();
				let novel_author = dom.$('#workAuthor-activityName').text();

				let novel_desc: string;

				dom.$('#description').each(function ()
				{
					$('#introduction').addClass('isExpanded');
					$('.ui-truncateText-expandButton').remove();
					$('.test-introduction-rest-text').show();

					let d = [];

					$(this)
						.find('#catchphrase-body, #catchphrase-authorLabel')
						.each(function ()
						{
							d.push($(this).text().replace(/\s+$/g, ''));
						})
					;

					if (d.length)
					{
						d.push(' ');
					}

					d.push($('#introduction').text().replace(/\s+$/g, ''));

					novel_desc = d
						.filter(v => v)
						.join("\n")
						.replace(/[ \t　]+$/gm, '')
					;

				});

				let novel_publisher = self.IDKEY;

				let url_data = self.parseUrl(dom.url.href);

				let volume_list = [] as NovelSite.IVolume[];

				let currentVolume: NovelSite.IVolume;

				let table = dom.$('#table-of-contents').find('.widget-toc-chapter, .widget-toc-episode');

				let _cache_dates = [];

				table
					.each(function (index)
					{
						let tr = dom.$(this);

						if (tr.is('.widget-toc-chapter'))
						{
							currentVolume = volume_list[volume_list.length] = {
								volume_index: volume_list.length,
								volume_title: tr.text().replace(/^\s+|\s+$/g, ''),
								chapter_list: [],
							};
						}
						else
						{
							if (!currentVolume)
							{
								currentVolume = volume_list[volume_list.length] = {
									volume_index: volume_list.length,
									volume_title: 'null',
									chapter_list: [],
								};
							}

							let a = tr.find('a:eq(0)');

							let chapter_title = a.find('.widget-toc-episode-titleLabel').text();

							let chapter_date;
							let dd;
							let da = a.find('.widget-toc-episode-datePublished');

							if (!dd)
							{
								dd = da.attr('datetime').replace(/^\s+|\s+$/g, '');
							}

							if (dd)
							{
								chapter_date = moment(dd).local();
								_cache_dates.push(chapter_date.unix());
							}

							let href = a.prop('href');

							let data = self.parseUrl(href);

							if (!data.chapter_id)
							{
								/*
								console.log(a);
								console.log(data);
								console.log(href);
								console.log(a.attr('href'));
								console.log(new URL(href, dom.url));

								console.log(dom._options);
								*/

								throw new Error()
							}
							else
							{
								href = self.makeUrl(data);

								data.url = href;
							}

							currentVolume
								.chapter_list
								.push({
									chapter_index: currentVolume.chapter_list.length,
									chapter_title: chapter_title.replace(/^\s+|\s+$/g, ''),
									chapter_id: data.chapter_id,
									chapter_url: href,
									chapter_url_data: data,
									chapter_date,
								})
							;
						}
					})
				;

				_cache_dates.sort();

				let novel_date = moment.unix(_cache_dates[_cache_dates.length - 1]).local();

				let data_meta: IMdconfMeta = {};

				{
					data_meta.novel = {};
					data_meta.novel.tags = [];

					$('#workMeta-flags')
						.find('#workGenre a, #workMeta-attentionsAndTags [itemprop="keywords"] a')
						.each(function ()
						{
							let t = $(this).text().replace(/^\s+|\s+$/g, '');
							if (t)
							{
								data_meta.novel.tags.push(t);
							}
						})
					;

					$('#table-of-contents .widget-toc-workStatus span:eq(0)')
						.each(function ()
						{
							data_meta.novel.status = $(this).text().replace(/^\s+|\s+$/g, '');
						})
					;
				}

				return {

					...data_meta,

					url: dom.url,
					url_data,

					novel_title,
					novel_author,

					novel_desc,
					novel_date,
					novel_publisher,

					volume_list,

					checkdate: moment().local(),

					imgs: [] as string[],
				} as INovel;
			})
		;
	}

}

export default NovelSiteKakuyomu;
