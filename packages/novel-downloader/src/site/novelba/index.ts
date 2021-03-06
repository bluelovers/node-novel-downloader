/**
 * Created by user on 2018/3/17/017.
 */

import { minifyHTML, trim } from '../../util';
import NovelSiteDemo, { IDownloadOptions, INovel, IOptionsRuntime } from '../demo/tree';
import { IRowVolume, TreeNode } from '../../tree/index';

import fs from 'fs-extra';
import { trimFilename } from 'fs-iconv/util';
import path from 'upath2';
import novelInfo, { IMdconfMeta } from 'node-novel-info';
import { fromURL, IFromUrlOptions, IJSDOM } from 'jsdom-extra';

//import { URL } from 'jsdom-url';

import NovelSite, { staticImplements, defaultJSDOMOptions, SYMBOL_CACHE } from '../index';
import { PromiseBluebird, bluebirdDecorator } from '../index';
import { moment } from '../index';
import { parseUrl, makeUrl, check } from './util';

@staticImplements<NovelSite.INovelSiteStatic<NovelSiteNovelba>>()
export class NovelSiteNovelba extends NovelSiteDemo
{
	public static readonly IDKEY = 'novelba';

	static check(url: string | URL | NovelSite.IParseUrl, ...argv): boolean
	{
		return check(url, ...argv);
	}

	static makeUrl(urlobj: NovelSite.IParseUrl, bool?: boolean | number, ...argv)
	{
		return makeUrl(urlobj, bool, ...argv)
	}

	static parseUrl(url: string | URL | number, ...argv)
	{
		return parseUrl(url, ...argv);
	}

	makeUrl(urlobj: NovelSite.IParseUrl, bool?: boolean | number, ...argv)
	{
		return makeUrl(urlobj, bool, ...argv)
	}

	parseUrl(url: string | URL | number, ...argv)
	{
		return parseUrl(url, ...argv);
	}

	protected _parseChapter<T>(ret, optionsRuntime, cache): string
	{
		if (!ret)
		{
			return '';
		}

		try
		{
			let html = minifyHTML(ret.dom.$('.episode_box').html());

			ret.dom.$('.episode_box').html(html);
		}
		catch (e)
		{

		}

		return ret.dom.$('.episode_section .episode_box .detail')
			.html(function (index, old)
			{
				return old.replace(/(?<=\<br\>)\r?\n?/ig, '\n')
			})
			.text()
			.replace(/^\s+|\s+$/g, '')
			;
		;
	}

	async get_volume_list<T extends IOptionsRuntime>(url: string | URL,
		optionsRuntime: Partial<T & IDownloadOptions> = {},
	): Promise<INovel>
	{
		const self = this;

		url = await this.createMainUrl(url as any, optionsRuntime);

		return fromURL(url, optionsRuntime.optionsJSDOM)
			.then(async function (dom: IJSDOM)
			{
				const $ = dom.$;

				$('.work_section .summary_box a.more').click();

				try
				{
					let html = minifyHTML(dom.$('.summary_box .detail').html());

					dom.$('.summary_box .detail').html(html);
				}
				catch (e)
				{

				}

				let novel_title = dom.$('.work_section .info_list .title').text();
				let novel_author = dom.$('.work_section .info_list .author a').text();

				let novel_desc: string;

				novel_desc = $('.work_section .summary_box .detail')
					.text()
					.replace(/^[ \xa0]+/gm, '')
					.replace(/[ \t　\xa0]+$/gm, '')
					.replace(/\s+$/g, '')
				;

				let novel_publisher = self.IDKEY;

				let url_data = self.parseUrl(dom.url.href);

				let volume_list = [] as NovelSite.IVolume[];

				const novelTree = optionsRuntime.novelTree;
				let currentVolume: TreeNode<IRowVolume>;

				let table = dom.$('.episode_box').find('.episode_list > li');

				let _cache_dates = [];

				let total_idx = 0;

				table
					.each(function (index)
					{
						// @ts-ignore
						let tr = dom.$(this);

						if (1)
						{
							if (!currentVolume)
							{
								/*
								currentVolume = volume_list[volume_list.length] = {
									volume_index: volume_list.length,
									volume_title: 'null',
									chapter_list: [],
								};
								*/

								let volume_title = 'null';
								let volume_level = null;

								currentVolume = novelTree.addVolume({
									volume_title,
									volume_level,
									volume_index: novelTree.root().size(),
									total_idx: total_idx++,
								});
							}

							let a = tr.find('a:eq(0)');

							let chapter_date;
							let dd;
							let da = a.find('.update');

							if (da.length)
							{
								dd = da.find('time').text();

								da.remove();
							}

							if (dd)
							{
								chapter_date = moment(dd, ['YYYY/MM/DD']).local();
								_cache_dates.push(chapter_date.unix());
							}

							let chapter_title = trim(a.text(), true);

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

							let chapter = {
								chapter_title,
								chapter_id: data.chapter_id,
								chapter_url: href,
								chapter_url_data: data,
								chapter_date,
								chapter_index: currentVolume.size(),
								total_idx: total_idx++,
							};

							novelTree.addChapter(chapter, currentVolume)
						}
					})
				;

				_cache_dates.sort();

				let novel_date = moment.unix(_cache_dates[_cache_dates.length - 1]).local();

				let data_meta: IMdconfMeta = {};

				{
					data_meta.novel = {};
					data_meta.novel.tags = [];

					$('.work_section .keyword_list a')
						.each(function ()
						{
							// @ts-ignore
							let t = $(this).text().replace(/^\s+|\s+$/g, '');
							if (t)
							{
								data_meta.novel.tags.push(t);
							}
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

					//volume_list,
					novelTree,

					checkdate: moment().local(),

					imgs: [] as string[],
				} as INovel;
			})
			;
	}

}

export default NovelSiteNovelba;
