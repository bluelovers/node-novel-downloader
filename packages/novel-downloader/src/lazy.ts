/**
 * Created by user on 2019/1/7/007.
 */

import { EnumNovelSiteList, requireNovelSiteClass } from './all';
import { NovelSite } from './site/index';
import { URL } from 'jsdom-url';

export function getEnumNovelSiteList(): EnumNovelSiteList[]
{
	// @ts-ignore
	return Object.keys(EnumNovelSiteList).filter(v => /^[a-z]/i.test(v));
}

export function searchSiteID(url: string | URL | NovelSite.IParseUrl)
{
	let uo = new URL(url);
	let href = uo.href;

	let ls = getEnumNovelSiteList();

	for (let siteID of ls)
	{
		let mod = requireNovelSiteClass(siteID);
		let bool = mod.check(href);

		if (bool)
		{
			return siteID;
		}
	}
}
