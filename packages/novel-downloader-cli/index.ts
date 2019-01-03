/**
 * Created by user on 2018/10/6/006.
 */

import { console } from './lib/log';
import Bluebird = require("bluebird");
import requireNovelSiteClass, { EnumNovelSiteList, NovelSite } from "novel-downloader"

export function createSite<T extends NovelSite, O extends NovelSite.IOptions>(siteID?: EnumNovelSiteList,
	options?: O & {
		[k: string]: any
	},
): T
{
	let o = requireNovelSiteClass(siteID);

	// @ts-ignore
	return new o(options);
}

export function download<O extends NovelSite.IDownloadOptions, O2 extends NovelSite.IOptions>(url: string,
	downloadOptions?: O & {
		[k: string]: any
	},
	siteID?: EnumNovelSiteList,
	options?: O2 & {
		[k: string]: any
	},
)
{
	if (!siteID)
	{
		siteID = EnumNovelSiteList.NovelSiteSyosetu;
	}

	const Site = createSite(siteID, options || {});

	return Site.download(url, downloadOptions)
}