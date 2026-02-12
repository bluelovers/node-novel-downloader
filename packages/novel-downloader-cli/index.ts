/**
 * Novel Downloader CLI - 小說下載器命令列介面
 * Novel Downloader CLI - A command-line tool for downloading novels
 *
 * Created by user on 2018/10/6/006.
 */

import { searchSiteID } from 'novel-downloader/src/lazy';
import { console } from './lib/log';
import Bluebird from "bluebird";
import { requireNovelSiteClass, EnumNovelSiteList, NovelSite } from "novel-downloader"

/**
 * 建立小說網站實例
 * Create a novel website instance
 *
 * 根據網站ID動態載入對應的網站類別並實例化。
 * Dynamically load and instantiate the corresponding website class based on site ID.
 *
 * @template T - 網站類別型別 / Website class type
 * @template O - 選項型別 / Options type
 * @param {EnumNovelSiteList} [siteID] - 網站ID，若未提供則由URL自動偵測 / Site ID, auto-detected from URL if not provided
 * @param {O & { [k: string]: unknown }} [options] - 網站特定選項 / Website-specific options
 * @returns {T} 網站實例 / Website instance
 */
export function createSite<T extends NovelSite, O extends NovelSite.IOptions>(siteID?: EnumNovelSiteList,
	options?: O & {
		[k: string]: unknown
	},
): T
{
	let o = requireNovelSiteClass(siteID);

	// @ts-ignore
	return new o(options);
}

/**
 * 下載小說
 * Download novel
 *
 * 主功能函數：根據URL下載小說內容。
 * Main function: download novel content from URL.
 *
 * 若未提供siteID，會自動從URL偵測支援的網站；若偵測失敗，預設使用syosetu (小說家內部)。
 * If siteID is not provided, automatically detect supported websites from URL; default to syosetu if detection fails.
 *
 * @template O - 下載選項型別 / Download options type
 * @template O2 - 網站選項型別 / Website options type
 * @param {string} url - 小說所在網址 / Novel URL
 * @param {O & { [k: string]: any }} [downloadOptions] - 下載相關選項（輸出格式、路徑等）/ Download options (output format, path, etc.)
 * @param {EnumNovelSiteList} [siteID] - 網站ID，可選 / Website ID, optional
 * @param {O2 & { [k: string]: any }} [options] - 網站特定選項 / Website-specific options
 * @returns {Promise<Bluebird<NovelSite.INovel>>} 下載結果Promise / Download result promise
 */
export function download<O extends NovelSite.IDownloadOptions = NovelSite.IDownloadOptions, O2 extends NovelSite.IOptions = NovelSite.IOptions>(url: string,
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
		// 從URL自動偵測網站ID，若無法識別則使用syosetu作為預設值
		// Auto-detect site ID from URL, fallback to syosetu if unrecognized
		siteID = searchSiteID(url) || EnumNovelSiteList.NovelSiteSyosetu;
	}

	// 處理並合併下載選項與網站選項
	// Process and merge download options with site options
	({ downloadOptions, options } = handleOptions(downloadOptions, siteID, options));

	// 建立網站實例
	// Create site instance
	const Site = createSite(siteID, options || {});

	// 執行下載並返回結果
	// Execute download and return result
	return Site.download(url, downloadOptions)
}

/**
 * 處理下載選項
 * Handle download options
 *
 * 整合下載選項與網站選項，進行必要的預處理。
 * Integrate download options and site options, perform necessary preprocessing.
 *
 * @template O - 下載選項型別 / Download options type
 * @template O2 - 網站選項型別 / Website options type
 * @param {O & { [k: string]: any }} downloadOptions - 下載選項 / Download options
 * @param {EnumNovelSiteList} siteID - 網站ID / Website ID
 * @param {O2 & { [k: string]: any }} options - 網站選項 / Website options
 * @returns {{ downloadOptions: O, options: O2 }} 處理後的選項組合 / Processed options object
 */
export function handleOptions<O extends NovelSite.IDownloadOptions, O2 extends NovelSite.IOptions>(downloadOptions: O & {
		[k: string]: any
	},
	siteID: EnumNovelSiteList,
	options: O2 & {
		[k: string]: any
	},
)
{
	return {
		downloadOptions,
		options,
	}
}
