/**
 * Created by user on 2020/2/3.
 */
import { EnumNovelSiteList, EnumIDKEYList } from './const';

export function siteID2IDKEY(siteID: EnumNovelSiteList | string | EnumIDKEYList): EnumIDKEYList
{
	if (isIDKEY(siteID))
	{
		return EnumIDKEYList[siteID]
	}
}

export function isSiteID(siteID: EnumNovelSiteList | string): siteID is EnumNovelSiteList
{
	return (siteID in EnumNovelSiteList) && typeof EnumNovelSiteList[siteID] === 'string'
}

export function isIDKEY(IDKEY: EnumIDKEYList | string): IDKEY is EnumIDKEYList
{
	return (IDKEY in EnumIDKEYList) && typeof EnumIDKEYList[IDKEY] === 'string'
}
