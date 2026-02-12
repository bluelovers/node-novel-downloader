/**
 * Novel Downloader - 網路請求模組
 * Novel Downloader - Network Request Module
 *
 * 提供具有重試機制的HTTP請求功能。
 * Provides HTTP request functionality with retry mechanism.
 *
 * Created by user on 2018/2/9/009.
 */

import request from '@bluelovers/request-promise';
import Bluebird from 'bluebird';
import { console } from './util/log';
import { IRequestPromise } from './util/request/create';

//import fetch from 'lets-fetch';
//fetch.retry((tries) => tries <= 3);

/**
 * 重試請求選項介面
 * Retry Request Options Interface
 *
 * 擴展request.RequestPromiseOptions，添加重試相關配置。
 * Extends request.RequestPromiseOptions with retry-related configuration.
 */
export interface IOptions extends request.RequestPromiseOptions
{
	// 重試次數 / Number of retries
	retry?: number,
	// 重試間隔（毫秒）/ Delay between retries (ms)
	delay?: number,

	// Cookie jar
	jar?,

	/**
	 * 自定義請求函數，用於注入不同的HTTP客戶端
	 * Custom request function, allows injecting different HTTP clients
	 */
	libRequest?: ((url: string, options?: IOptions) => request.RequestPromise) | IRequestPromise,
}

/**
 * 帶重試機制的請求函數
 * Request function with retry mechanism
 *
 * 發起HTTP請求，若失敗則自動重試指定的次數。
 * 每次重試前會等待配置的延遲時間。
 * Initiates HTTP request, automatically retries specified number of times on failure.
 * Waits configured delay before each retry.
 *
 * @param {string | URL} url - 請求目標URL / Target URL
 * @param {IOptions} [options] - 請求選項 / Request options
 * @returns {Bluebird<string>} 請求結果 / Request result
 */
export function retryRequest(url, options: IOptions = {})
{
	// 合併選項，設定預設值
	// Merge options, set defaults
	options = Object.assign({
		retry: 3,
		delay: 1000,
	}, options);

	let retry = options.retry || 3;
	let libRequest = options.libRequest || request;

	let tries = 0;

	// 將URL物件轉換為字串
	// Convert URL object to string
	if (url.href)
	{
		url = url.href;
	}

	/**
	 * 內部遞迴請求函數
	 * Internal recursive request function
	 */
	function fn()
	{
		tries++;

		// @ts-ignore
		return libRequest(url.toString(), options)
			.catch(function (err)
			{
				// 若還有重試次數，則等待後重試
				// If retries remaining, wait and retry
				if (retry-- > 0)
				{
					console.warn(`fetch fail(${tries}), will wait ${options.delay}ms, for try again\n${url}`);

					// 延遲後重新執行請求
					// Re-execute request after delay
					return Bluebird.delay(options.delay).then(fn);
				}

				// 記錄嘗試次數後拒絕Promise
				// Record attempts and reject promise
				err.tries = tries;

				return Bluebird.reject(err);
			})
			;
	}

	// 使用Bluebird確保非同步流程控制
	// Use Bluebird to ensure async flow control
	return Bluebird.resolve().then(function ()
	{
		return fn();
	}).tapCatch(function (err)
	{
		// 記錄最終錯誤
		// Log final error
		console.error(err);
	});
}

/**
 * 批量請求函數
 * Batch request function
 *
 * 依序對多個URL發起請求，每個請求獨立處理。
 * 使用mapSeries確保請求依序執行，避免過度並發。
 * Initiate requests to multiple URLs sequentially.
 * Uses mapSeries to ensure sequential execution, preventing excessive concurrency.
 *
 * @param {any[]} url_arr - URL陣列 / Array of URLs
 * @param {IOptions} [options] - 請求選項 / Request options
 * @returns {Bluebird<string[]>} 所有請求結果陣列 / Array of all request results
 */
export function manyRequest(url_arr: any[], options: IOptions = {})
{
	// 合併選項，設定預設值
	// Merge options, set defaults
	options = Object.assign({
		retry: 3,
		delay: 1000,
	}, options);

	let libRequest = options.libRequest || request;

	return Bluebird
		// mapSeries依序執行請求
		// Execute requests sequentially with mapSeries
		.mapSeries(url_arr, function (url)
		{
			// 將URL物件轉換為字串
			// Convert URL object to string
			if (url.href)
			{
				url = url.href;
			}

			// @ts-ignore
			return libRequest(url.toString(), options);
		})
		// 發生錯誤時記錄
		// Log on error
		.tapCatch(function (err)
		{
			console.error(err);
		})
		;
}
