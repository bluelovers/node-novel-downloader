/**
 * Created by user on 2018/3/17/017.
 */

import { trim } from '../../util';
import NovelSiteDemo, { IDownloadOptions, INovel, IOptionsRuntime } from '../demo/tree';
import { IRowVolume, TreeNode } from '../../tree/index';

import fs from 'fs-extra';
import { trimFilename } from 'fs-iconv/util';
import path from 'upath2';
import novelInfo, { IMdconfMeta } from 'node-novel-info';
import { fromURL, IFromUrlOptions, IJSDOM } from 'jsdom-extra';

//import { URL } from 'jsdom-url';

import NovelSite, { staticImplements, defaultJSDOMOptions, SYMBOL_CACHE, createOptionsJSDOM } from '../index';
import { PromiseBluebird, bluebirdDecorator } from '../index';
import { moment } from '../index';
import { parseUrl, makeUrl, check } from './util';
import { keepFormatTag } from '../../util/html';
import { _jQueryClassStartWith } from './dom';
import { _get_volume_list } from './dom/get_volume_list';

@staticImplements<NovelSite.INovelSiteStatic<NovelSiteKakuyomu>>()
export class NovelSiteKakuyomu extends NovelSiteDemo
{
	public static readonly IDKEY = 'kakuyomu';

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

		keepFormatTag(ret.dom.$('#contentMain .widget-episodeBody'), {
			$: ret.dom.$,
			optionsRuntime,
		});

		return ret.dom.$('#contentMain .widget-episodeBody').text();
	}

	/**
	 * @todo 需要改良支援三級目錄
	 */
	async get_volume_list<T extends IOptionsRuntime>(url: string | URL,
		optionsRuntime: Partial<T & IDownloadOptions> = {}
	): Promise<INovel>
	{
		const self = this;

		url = await this.createMainUrl(url as any, optionsRuntime);

		return fromURL(url, optionsRuntime.optionsJSDOM)
			.then(async function (dom: IJSDOM)
			{
				const $ = dom.$;

				let {
					data_meta,
					..._data
				} = await _get_volume_list(dom, optionsRuntime)



				let novel_publisher = self.IDKEY;

				let url_data = self.parseUrl(dom.url.href);

				//let novel_date = moment.unix(_cache_dates[_cache_dates.length - 1]).local();

				//let novel_cover = `https://cdn-static.kakuyomu.jp/works/${url_data.novel_id}/ogimage.png`;

				return {

					...data_meta,
					..._data,

					url: dom.url,
					url_data,

					//novel_title,
					//novel_cover,
					//novel_author,

					//novel_desc,
					//novel_date,
					novel_publisher,

					//volume_list,
					//novelTree,

					checkdate: moment().local(),

					imgs: [] as string[],
				} as any as INovel;
			})
			;
	}

}

export default NovelSiteKakuyomu;
