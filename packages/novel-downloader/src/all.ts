import _NovelSite from './site';
import Bluebird = require("bluebird");

export enum EnumNovelSiteList
{
	NovelSiteAlphapolis = './site/alphapolis',
	NovelSiteDemoBase = './site/demo/base',
	NovelSiteDemoDemo = './site/demo/demo',
	NovelSiteDemoTree = './site/demo/tree',
	NovelSiteDmzjApi = './site/dmzj/api',
	NovelSiteDmzj = './site/dmzj',
	NovelSiteEsjzone = './site/esjzone',
	NovelSiteHetubook = './site/hetubook',
	NovelSiteIqing = './site/iqing',
	NovelSiteKakuyomu = './site/kakuyomu',
	NovelSiteMillionbook = './site/millionbook',
	NovelSiteNovelba = './site/novelba',
	NovelSiteNovelup = './site/novelup',
	NovelSiteSfacg = './site/sfacg',
	NovelSiteSyosetu = './site/syosetu',
	NovelSiteUukanshu = './site/uukanshu',
	NovelSiteWebqxs = './site/webqxs',
	NovelSiteWenku8 = './site/wenku8',
	NovelSiteX23qb = './site/x23qb',
	'alphapolis' = './site/alphapolis',
	'demo/base' = './site/demo/base',
	'demo/demo' = './site/demo/demo',
	'demo/tree' = './site/demo/tree',
	'dmzj/api' = './site/dmzj/api',
	'dmzj' = './site/dmzj',
	'esjzone' = './site/esjzone',
	'hetubook' = './site/hetubook',
	'iqing' = './site/iqing',
	'kakuyomu' = './site/kakuyomu',
	'millionbook' = './site/millionbook',
	'novelba' = './site/novelba',
	'novelup' = './site/novelup',
	'sfacg' = './site/sfacg',
	'syosetu' = './site/syosetu',
	'uukanshu' = './site/uukanshu',
	'webqxs' = './site/webqxs',
	'wenku8' = './site/wenku8',
	'x23qb' = './site/x23qb',
	'./site/alphapolis' = './site/alphapolis',
	'./site/demo/base' = './site/demo/base',
	'./site/demo/demo' = './site/demo/demo',
	'./site/demo/tree' = './site/demo/tree',
	'./site/dmzj/api' = './site/dmzj/api',
	'./site/dmzj' = './site/dmzj',
	'./site/esjzone' = './site/esjzone',
	'./site/hetubook' = './site/hetubook',
	'./site/iqing' = './site/iqing',
	'./site/kakuyomu' = './site/kakuyomu',
	'./site/millionbook' = './site/millionbook',
	'./site/novelba' = './site/novelba',
	'./site/novelup' = './site/novelup',
	'./site/sfacg' = './site/sfacg',
	'./site/syosetu' = './site/syosetu',
	'./site/uukanshu' = './site/uukanshu',
	'./site/webqxs' = './site/webqxs',
	'./site/wenku8' = './site/wenku8',
	'./site/x23qb' = './site/x23qb',
}

export interface INovelSiteList
{
	NovelSiteAlphapolis: typeof import('./site/alphapolis').default
	NovelSiteDemoBase: typeof import('./site/demo/base').default
	NovelSiteDemoDemo: typeof import('./site/demo/demo').default
	NovelSiteDemoTree: typeof import('./site/demo/tree').default
	NovelSiteDmzjApi: typeof import('./site/dmzj/api').default
	NovelSiteDmzj: typeof import('./site/dmzj').default
	NovelSiteEsjzone: typeof import('./site/esjzone').default
	NovelSiteHetubook: typeof import('./site/hetubook').default
	NovelSiteIqing: typeof import('./site/iqing').default
	NovelSiteKakuyomu: typeof import('./site/kakuyomu').default
	NovelSiteMillionbook: typeof import('./site/millionbook').default
	NovelSiteNovelba: typeof import('./site/novelba').default
	NovelSiteNovelup: typeof import('./site/novelup').default
	NovelSiteSfacg: typeof import('./site/sfacg').default
	NovelSiteSyosetu: typeof import('./site/syosetu').default
	NovelSiteUukanshu: typeof import('./site/uukanshu').default
	NovelSiteWebqxs: typeof import('./site/webqxs').default
	NovelSiteWenku8: typeof import('./site/wenku8').default
	NovelSiteX23qb: typeof import('./site/x23qb').default
}

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
	return require(EnumNovelSiteList[siteID]).default
}

export default requireNovelSiteClass

