/**
 * Novel Downloader - 懶載入模組
 * Novel Downloader - Lazy Loading Module
 *
 * 提供動態載入小說網站類別的功能。
 * Provides dynamic loading functionality for novel website classes.
 *
 * Created by user on 2019/1/7/007.
 */

import { EnumNovelSiteList, EnumIDKEYToSiteID } from './all/const';
import { requireNovelSiteClass } from './all';
import { NovelSite } from './site/index';
//import { URL } from 'jsdom-url';
import createURL from './util/url';

/**
 * 取得所有支援的網站列表
 * Get all supported website list
 *
 * 枚舉所有已註冊的小說網站ID。
 * Enumerate all registered novel website IDs.
 *
 * @returns {EnumNovelSiteList[]} 網站ID陣列 / Array of website IDs
 */
export function getEnumNovelSiteList(): EnumNovelSiteList[]
{
	return Object.values(EnumIDKEYToSiteID) as any;
}

/**
 * 從URL偵測小說網站ID
 * Detect novel website ID from URL
 *
 * 依序嘗試每個支援的網站類別，檢查URL是否符合該網站的格式。
 * 這採用懶載入模式，只在需要時才載入各網站模組。
 * Sequentially try each supported website class to check if the URL matches its format.
 * This uses lazy loading pattern, only loading website modules when needed.
 *
 * @param {string | URL | NovelSite.IParseUrl} url - 小說網址 / Novel URL
 * @returns {EnumNovelSiteList | undefined} 偵測到的網站ID，若無匹配則返回undefined / Detected website ID, undefined if no match
 */
export function searchSiteID(url: string | URL | NovelSite.IParseUrl)
{
	let href: string;
	try
	{
		// 建立URL物件以確保格式一致
		// Create URL object to ensure consistent format
		href = createURL(url as any).href
	}
	catch (e)
	{
		// 若URL解析失敗，直接使用原始字串
		// If URL parsing fails, use raw string directly
		// @ts-ignore
		href = url;
	}

	// 取得所有支援的網站列表
	// Get all supported websites list
	let ls = getEnumNovelSiteList();

	// 依序檢查每個網站
	// Check each website sequentially
	for (let siteID of ls)
	{
		let mod = requireNovelSiteClass(siteID);
		let bool: boolean;

		try
		{
			// 檢查URL是否符合該網站格式
			// Check if URL matches this website's format
			bool = mod.check(href);

			if (bool)
			{
				// 找到匹配的網站，返回其ID
				// Found matching website, return its ID
				return siteID;
			}
		}
		catch (e)
		{
			// 若檢查過程發生錯誤（例如網站格式變更），跳過繼續嘗試
			// If error occurs during check (e.g., website format changed), skip and continue
		}
	}

	// 無法識別網站，返回undefined
	// Unable to identify website, return undefined
}
