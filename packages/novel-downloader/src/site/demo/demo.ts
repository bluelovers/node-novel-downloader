/**
 * Created by user on 2018/3/25/025.
 */

import _NovelSite, { staticImplements, SYMBOL_CACHE } from '../index';
import { IDownloadOptions, INovel } from './base';
import { IFetchChapter, IOptionsRuntime } from './base';
import * as _NovelSiteBase from './base';
import NovelSiteBase from './base';
//import { URL } from 'jsdom-url';
import { fromURL, IFromUrlOptions, IJSDOM } from 'jsdom-extra';
import { PromiseBluebird, bluebirdDecorator } from '../index';
import { moment } from '../index';

@staticImplements<_NovelSite.INovelSiteStatic<NovelSiteDemo>>()
export class NovelSiteDemo extends NovelSiteBase 
{
	public static readonly IDKEY = '';

	/**
	 * 生成 URL
	 * Make URL
	 */
	makeUrl(urlobj: _NovelSite.IParseUrl, ...argv): URL 
	{
		throw new SyntaxError(`Function not implemented`);
	}

	/**
	 * 解析 URL
	 * Parse URL
	 */
	parseUrl(url: URL | string | number, ...argv): _NovelSite.IParseUrl 
	{
		throw new SyntaxError(`Function not implemented`);
	}

	protected _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, _cache_: {
		novel: INovel,
	}): string 
	{
		if (!ret)
		{
			return '';
		}

		throw new SyntaxError(`Function not implemented`);
	}

	/**
	 * 取得卷列表
	 * Get volume list
	 */
	async get_volume_list<T = IOptionsRuntime>(url: string | URL,
		optionsRuntime: Partial<T & IOptionsRuntime> = {}
	): Promise<INovel> 
	{
		throw new SyntaxError(`Function not implemented`);
	}
}

export default NovelSiteDemo;
