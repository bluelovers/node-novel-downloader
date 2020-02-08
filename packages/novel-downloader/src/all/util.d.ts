/**
 * Created by user on 2020/2/3.
 */
import { EnumNovelSiteList, EnumIDKEYList } from './const';
export declare function siteID2IDKEY(siteID: EnumNovelSiteList | string | EnumIDKEYList): EnumIDKEYList;
export declare function IDKEY2siteID(input: EnumNovelSiteList | string | EnumIDKEYList): EnumNovelSiteList;
export declare function isSiteID(siteID: EnumNovelSiteList | string): siteID is EnumNovelSiteList;
export declare function isIDKEY(IDKEY: EnumIDKEYList | string): IDKEY is EnumIDKEYList;
