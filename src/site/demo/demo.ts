/**
 * Created by user on 2018/3/25/025.
 */

import NovelSite, { staticImplements, SYMBOL_CACHE } from '../index';
import { IDownloadOptions, INovel } from './base';
import { IFetchChapter, IOptionsRuntime } from './base';
import * as NovelSiteDemo from './base';
import NovelSiteBase from './base';
import { URL } from 'jsdom-url';
import { fromURL, IFromUrlOptions, IJSDOM } from 'jsdom-extra';
import { PromiseBluebird, bluebirdDecorator } from '../index';
import { moment } from '../index';

@staticImplements<NovelSite.INovelSiteStatic<NovelSiteKakuyomu>>()
export class NovelSiteKakuyomu extends NovelSiteBase
{
	public static readonly IDKEY = '';

	makeUrl(urlobj: NovelSite.IParseUrl, options?): URL
	{
		throw new SyntaxError(`Function not implemented`);
	}

	parseUrl(url: URL | string, options?): NovelSite.IParseUrl
	{
		throw new SyntaxError(`Function not implemented`);
	}

	protected _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime): string
	{
		if (!ret)
		{
			return '';
		}

		throw new SyntaxError(`Function not implemented`);
	}

	async get_volume_list<T = NovelSite.IOptionsRuntime>(url: string | URL,
		optionsRuntime: Partial<T & IDownloadOptions> = {}
	): Promise<INovel>
	{
		throw new SyntaxError(`Function not implemented`);
	}
}
