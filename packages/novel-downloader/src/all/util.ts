/**
 * Created by user on 2020/2/3.
 */
import { EnumNovelSiteList, EnumIDKEYList, EnumIDKEYToSiteID } from './const';

export function siteID2IDKEY(siteID: EnumNovelSiteList | string | EnumIDKEYList): EnumIDKEYList
{
	if (isIDKEY(siteID))
	{
		return EnumIDKEYList[siteID]
	}
}

export function IDKEY2siteID(input: EnumNovelSiteList | string | EnumIDKEYList): EnumNovelSiteList
{
	if (!isIDKEY(input))
	{
		input = siteID2IDKEY(input);
	}

	if (isIDKEY(input))
	{
		return EnumIDKEYToSiteID[input as any]
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
