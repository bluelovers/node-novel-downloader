/**
 * Created by user on 2019/1/7/007.
 */
import { EnumNovelSiteList } from './all';
import { NovelSite } from './site/index';
export declare function getEnumNovelSiteList(): EnumNovelSiteList[];
export declare function searchSiteID(url: string | URL | NovelSite.IParseUrl): EnumNovelSiteList;
