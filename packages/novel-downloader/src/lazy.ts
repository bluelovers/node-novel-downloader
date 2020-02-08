/**
 * Created by user on 2019/1/7/007.
 */

import { EnumNovelSiteList, EnumIDKEYToSiteID } from './all/const';
import { requireNovelSiteClass } from './all';
import { NovelSite } from './site/index';
//import { URL } from 'jsdom-url';
import createURL from './util/url';

export function getEnumNovelSiteList(): EnumNovelSiteList[]
{
	return Object.values(EnumIDKEYToSiteID) as any;
}

export function searchSiteID(url: string | URL | NovelSite.IParseUrl)
{
	let href: string;
	try
	{
		href = createURL(url as any).href
	}
	catch (e)
	{
		// @ts-ignore
		href = url;
	}

	let ls = getEnumNovelSiteList();

	for (let siteID of ls)
	{
		let mod = requireNovelSiteClass(siteID);
		let bool: boolean;

		try
		{
			bool = mod.check(href);

			if (bool)
			{
				return siteID;
			}
		}
		catch (e)
		{

		}
	}
}
