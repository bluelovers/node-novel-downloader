import _NovelSite from './site';
import Bluebird = require("bluebird");

import { EnumNovelSiteList, INovelSiteList } from './all/const';

export { EnumNovelSiteList, INovelSiteList }

export function requireNovelSiteClass(siteID: EnumNovelSiteList.NovelSiteAlphapolis | 'alphapolis'): INovelSiteList["NovelSiteAlphapolis"]
export function requireNovelSiteClass(siteID: EnumNovelSiteList.NovelSiteDemoBase | 'demo/base'): INovelSiteList["NovelSiteDemoBase"]
export function requireNovelSiteClass(siteID: EnumNovelSiteList.NovelSiteDemoDemo | 'demo/demo'): INovelSiteList["NovelSiteDemoDemo"]
export function requireNovelSiteClass(siteID: EnumNovelSiteList.NovelSiteDemoTree | 'demo/tree'): INovelSiteList["NovelSiteDemoTree"]
export function requireNovelSiteClass(siteID: EnumNovelSiteList.NovelSiteDmzjApi | 'dmzj/api'): INovelSiteList["NovelSiteDmzjApi"]
export function requireNovelSiteClass(siteID: EnumNovelSiteList.NovelSiteDmzj | 'dmzj'): INovelSiteList["NovelSiteDmzj"]
export function requireNovelSiteClass(siteID: EnumNovelSiteList.NovelSiteEsjzone | 'esjzone'): INovelSiteList["NovelSiteEsjzone"]
export function requireNovelSiteClass(siteID: EnumNovelSiteList.NovelSiteHetubook | 'hetubook'): INovelSiteList["NovelSiteHetubook"]
export function requireNovelSiteClass(siteID: EnumNovelSiteList.NovelSiteIqing | 'iqing'): INovelSiteList["NovelSiteIqing"]
export function requireNovelSiteClass(siteID: EnumNovelSiteList.NovelSiteKakuyomu | 'kakuyomu'): INovelSiteList["NovelSiteKakuyomu"]
export function requireNovelSiteClass(siteID: EnumNovelSiteList.NovelSiteMillionbook | 'millionbook'): INovelSiteList["NovelSiteMillionbook"]
export function requireNovelSiteClass(siteID: EnumNovelSiteList.NovelSiteNovelba | 'novelba'): INovelSiteList["NovelSiteNovelba"]
export function requireNovelSiteClass(siteID: EnumNovelSiteList.NovelSiteNovelup | 'novelup'): INovelSiteList["NovelSiteNovelup"]
export function requireNovelSiteClass(siteID: EnumNovelSiteList.NovelSiteSfacg | 'sfacg'): INovelSiteList["NovelSiteSfacg"]
export function requireNovelSiteClass(siteID: EnumNovelSiteList.NovelSiteSyosetu | 'syosetu'): INovelSiteList["NovelSiteSyosetu"]
export function requireNovelSiteClass(siteID: EnumNovelSiteList.NovelSiteUukanshu | 'uukanshu'): INovelSiteList["NovelSiteUukanshu"]
export function requireNovelSiteClass(siteID: EnumNovelSiteList.NovelSiteWebqxs | 'webqxs'): INovelSiteList["NovelSiteWebqxs"]
export function requireNovelSiteClass(siteID: EnumNovelSiteList.NovelSiteWenku8 | 'wenku8'): INovelSiteList["NovelSiteWenku8"]
export function requireNovelSiteClass(siteID: EnumNovelSiteList.NovelSiteX23qb | 'x23qb'): INovelSiteList["NovelSiteX23qb"]
export function requireNovelSiteClass<T extends typeof _NovelSite>(siteID: EnumNovelSiteList | string): T
export function requireNovelSiteClass(siteID: EnumNovelSiteList | string)
{
	if (!(siteID in EnumNovelSiteList))
	{
		throw new RangeError(`'${siteID}' not exists`);
	}
	return require(`./site/${EnumNovelSiteList[siteID]}`).default
}

export default requireNovelSiteClass

