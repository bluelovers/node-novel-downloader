/// <reference types="jquery" />

import { IDownloadOptions, NovelSiteSyosetu } from '../index';
import { NovelSite, moment } from '../../index';
import { INumbers, IUrlOrString } from '../../../types';
import PromiseBluebird from 'bluebird';
import { console, consoleDebug } from '../../../util/log';
import { fromURL, IFromUrlOptions, IJSDOM } from 'jsdom-extra';
import { LazyURL } from 'lazy-url';

export interface IVolumeListCache
{
	url: URL,
	page: number,
	_cache_dates: number[],
	volume_list: NovelSite.IVolume[],
	currentVolume: NovelSite.IVolume,
	dom: IJSDOM,
	novel_syosetu_id: string,

	volume_length: number,
	chapter_length: number,
}

export function _get_volume_list_main<T = NovelSite.IOptionsRuntime>(
	self: NovelSiteSyosetu,
	url: IUrlOrString,
	optionsRuntime: Partial<T & IDownloadOptions>,
	dom: IJSDOM,
	novel_syosetu_id: string,
)
{
	return PromiseBluebird.resolve()
		.then(async () => {

			url = await self.createMainUrl(url as any, optionsRuntime);

			//url = new LazyURL(url);

			consoleDebug.info(`開始檢測小說章節列表`, url.toString());

			const cache: IVolumeListCache = {
				url,
				novel_syosetu_id,
				page: 1,
				_cache_dates: [],
				volume_list: [],
				currentVolume: void 0,
				dom,

				volume_length: 0,
				chapter_length: 0,
			}

			return cache
		})
		.tap(cache => {
			return _get_volume_list_page<T>(self, optionsRuntime, cache)
		})
		.tap(cache => {
			cache.volume_length = cache.volume_list.length;

			cache._cache_dates = cache._cache_dates.sort();
		})
	;
}

export async function _get_volume_list_page<T = NovelSite.IOptionsRuntime>(
	self: NovelSiteSyosetu,
	optionsRuntime: Partial<T & IDownloadOptions>,
	cache: IVolumeListCache,
)
{
	let {
		url,
		dom,

		_cache_dates,
		currentVolume,
		volume_list,

		novel_syosetu_id,
	} = cache;

	cache.page ||= 1;

	url = self._hackURL(url, optionsRuntime, cache.page)

	consoleDebug.info(`開始處理小說章節列表`, cache.page, url.toString(), url.searchParams.get('p'));

	dom ??= await fromURL(url, optionsRuntime.optionsJSDOM)
		.then(async function (dom: IJSDOM)
		{
			return self._novel18<T>(url, dom, optionsRuntime);
		})
	;

	let table = dom.$('.index_box').find('> .chapter_title, .novel_sublist2');

	table
		.each(function (index)
		{
			let tr = dom.$(this);

			if (tr.is('.chapter_title'))
			{
				currentVolume = volume_list[volume_list.length] = {
					volume_index: volume_list.length,
					volume_title: tr.text().replace(/^\s+|\s+$/g, ''),
					chapter_list: [],
				};
			}
			else
			{
				if (!currentVolume)
				{
					currentVolume = volume_list[volume_list.length] = {
						volume_index: volume_list.length,
						volume_title: 'null',
						chapter_list: [],
					};
				}

				let a = tr.find('.subtitle a');

				let chapter_date;
				let dd;
				let da = tr.find('.long_update');

				if (da.find('span[title*="/"]').length)
				{
					dd = da.find('span[title*="/"]').attr('title').replace(/改稿|^\s+|\s+$/g, '');
				}

				if (!dd)
				{
					da.find('*').remove();
					dd = da.text().replace(/^\s+|\s+$/g, '');
				}

				if (dd)
				{
					chapter_date = moment(dd, 'YYYY/MM/DD HH:mm').local();
					_cache_dates.push(chapter_date.unix());
				}

				let href = a.prop('href');

				let data = self.parseUrl(href);

				if (!data.chapter_id)
				{

					if (tr.find('.bookmarker_now').length)
					{
						/**
						 * fix https://ncode.syosetu.com/n7637dj/
						 */
						return;
					}

					console.log(tr.prop("outerHTML"));
					console.log(a.prop("outerHTML"));
					console.log(a);
					console.log(data);
					console.log(href);
					console.log(a.attr('href'));
					// @ts-ignore
					console.log(new URL(href, dom.url));

					console.log(dom._options);

					throw new Error()
				}
				else
				{
					data = {
						url: null,
						novel_pid: novel_syosetu_id as string,
						chapter_id: data.chapter_id as string,
					} as any;

					href = self._hackURL(self.makeUrl(data), optionsRuntime);

					data.url = href;
				}

				currentVolume
					.chapter_list
					.push({
						chapter_index: currentVolume.chapter_list.length,
						chapter_title: a.text().replace(/^\s+|\s+$/g, ''),
						chapter_id: data.chapter_id,
						chapter_url: href,
						chapter_url_data: data,
						chapter_date,
					})
				;

				cache.chapter_length++;
			}
		})
	;

	cache.currentVolume = currentVolume;
	cache.dom = null;

	let _a_next = dom.$('.novelview_pager').find('.novelview_pager-next:eq(0)');

	if (_a_next?.length)
	{
		let _p: number = (_a_next.prop('href') || _a_next.attr('href'))?.toString().match(/(?<=[?=&])p=(\d+)/)?.[1] as any

		if (_p > 1 && _p > cache.page)
		{
			cache.page = parseInt(_p as any);

			return _get_volume_list_page<T>(self, optionsRuntime, cache)
		}
	}

	return cache
}
