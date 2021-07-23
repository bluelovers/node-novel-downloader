/**
 * Created by user on 2018/3/25/025.
 */

import { retryRequest } from '../../fetch';
import { stripContent } from '../../strip';
import { escapeRegexp } from '../../util';
import _NovelSite, { IChapter, IMdconfMeta, IVolume, moment, staticImplements, SYMBOL_CACHE } from '../index';
import NovelSiteBase, { IDownloadOptions, IFetchChapter, INovel, IOptionsRuntime } from '../demo/base';
//import { URL } from 'jsdom-url';
import { createJSDOM, IJSDOM } from 'jsdom-extra';
import path from "path";
import { zhRegExp } from 'regexp-cjk';
import { _keepImageInContext, _saveImageToAttach, keepFormatTag } from '../../util/html';
import { check, makeUrl, parseUrl } from './util';

//import escapeStringRegexp from 'escape-string-regexp';
import { TxtUrlCreator } from './v4/txtUrlCreator';
import {
	lookupTypeNovelChapterResponse,
	lookupTypeNovelDetailResponse,
	protoLongToMilliseconds, protoLongToNumber,
} from './protobuf/protobuf';
import { decryptBase64V4, key } from './v4/v4';

@staticImplements<_NovelSite.INovelSiteStatic<NovelSiteTpl>>()
export class NovelSiteTpl extends NovelSiteBase
{
	public static readonly IDKEY = path.basename(__dirname);

	static check(url: string | URL | _NovelSite.IParseUrl, ...argv): boolean
	{
		return check(url, ...argv);
	}

	static makeUrl(urlobj: _NovelSite.IParseUrl, bool?: boolean | number, ...argv)
	{
		return makeUrl(urlobj, bool, ...argv)
	}

	static parseUrl(url: string | URL | number, ...argv)
	{
		return parseUrl(url, ...argv);
	}

	makeUrl(urlobj: _NovelSite.IParseUrl, bool?: boolean | number, ...argv)
	{
		return makeUrl(urlobj, bool, ...argv)
	}

	parseUrl(url: string | URL | number, ...argv)
	{
		return parseUrl(url, ...argv);
	}

	session<T = IOptionsRuntime>(optionsRuntime: Partial<T & IDownloadOptions>, url: URL)
	{
		super.session(optionsRuntime, url);

		optionsRuntime.optionsJSDOM.requestOptions = optionsRuntime.optionsJSDOM.requestOptions || {};

		// @ts-ignore
		optionsRuntime.optionsJSDOM.requestOptions.contentType = 'json';

		//let url = optionsRuntime[SYMBOL_CACHE].url;

		optionsRuntime.optionsJSDOM.cookieJar
		//.setCookieSync('over18=yes; Domain=.syosetu.com; Path=/', url.href)
		;

		return this;
	}

	createMainUrl<T>(url: string | URL, optionsRuntime: T & IOptionsRuntime)
	{
		let data = this.parseUrl(url);

		if (!data || !data.novel_id)
		{
			console.dir(data, {
				depth: null,
			});

			throw new ReferenceError();
		}

		let ret = this.makeUrl(data, true, optionsRuntime);

		return ret;
	}

	_stripContent(text: string)
	{
		text = stripContent(text);

		//process.exit();

		return text
			//.replace(/^　　/gm, '')
			.replace(/^[\uFEFF\xA0]+/gm, '')
			// 修正每行開頭多出空白的問題
			.replace(/^ +/gm, '')
			.replace(/ +$/gm, '')
			.replace(/\s+$/, '')
		;
	}

	protected _saveReadme(optionsRuntime: IOptionsRuntime, options = {}, ...opts)
	{
		options[this.IDKEY] = {
			novel_id: optionsRuntime[SYMBOL_CACHE].novel.novel_id,
		};

		return super._saveReadme(optionsRuntime, options, {
			//
		}, ...opts);
	}

	protected async _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache)
	{
		if (!ret)
		{
			return '';
		}

		let body_selector = 'body';

		try
		{
//			let html = minifyHTML(ret.dom.$(body_selector).html());
//
//			//html = html.replace(/^(&nbsp;){4}/gm, '');
//			html = html.replace(/^\s+|\s+$/g, '');
//
//			ret.dom.$(body_selector).html(html);
		}
		catch (e)
		{

		}

		let text: string;

		if (ret.dom)
		{
			keepFormatTag(ret.dom.$(body_selector), {
				$: ret.dom.$,
				optionsRuntime,
			});

			text = ret.dom.$(body_selector).text();
		}
		else
		{
			ret.dom = createJSDOM(ret.body.toString());

			keepFormatTag(ret.dom.$(body_selector), {
				$: ret.dom.$,
				optionsRuntime,
			});

			text = ret.dom.$(body_selector).text();
		}

		const $ = ret.dom.$;

		if (ret.dom.$('img').length)
		{
			/*
			cache.chapter.imgs = cache.chapter.imgs || [];

			ret.dom.$('img[src]').each(function ()
			{
				// @ts-ignore
				cache.chapter.imgs.push(ret.dom.$(this).prop('src'));
				// @ts-ignore
				cache.novel.imgs.push(ret.dom.$(this).prop('src'));
			});
			 */

			_saveImageToAttach(ret.dom.$, ret.dom.$('img[src]'), cache);

			if (optionsRuntime.keepImage)
			{
				await _keepImageInContext(ret.dom.$('img[src]'), ret.dom.$);
			}
		}

		text = this._stripContent(text);

		let sp = '[\u00a0 　]*';

		let r = new zhRegExp(`^[\u00a0 　\\s]*${escapeRegexp(cache.volume.volume_title)}${sp}${escapeRegexp(cache.chapter.chapter_title)}${sp}`, 'ig');

		text = text
			.replace(r, '')
		;

		return text;
	}

	async get_volume_list<T = IOptionsRuntime>(inputUrl: string | URL,
		optionsRuntime: Partial<T & IDownloadOptions> = {}
	): Promise<INovel>
	{
		const self = this;
		let url = await this.createMainUrl(inputUrl, optionsRuntime);

		// @ts-ignore
		return retryRequest(url, optionsRuntime.requestOptions)
			.then(async function (dom)
			{
				const novel_meta=await self._get_meta(url, optionsRuntime, {
					dom,
				});

				const decrypted = decryptBase64V4(dom);
				const result = lookupTypeNovelChapterResponse().decode(decrypted);

				const apiresult = result.Data.map((v) => {
					return <IVolume>{

						id: v.VolumeId,
						chapter_list: v.Chapters.map((c) => {
							return <IChapter>{
								chapter_id: c.ChapterId,
								chapter_title: c.ChapterName,
								chapter_index: c.ChapterOrder,
								chapter_url: new TxtUrlCreator(v.VolumeId,c.ChapterId)
							}
						}),
						volume_id: v.VolumeId,
						volume_title: v.VolumeName,
						volume_index: v.VolumeOrder
					}
				})
				novel_meta.volume_list = apiresult;
				return novel_meta;

			})
			.tap(function (novel)
			{
				console.dir(novel, {
					colors: true,
					//depth: 3,
				});
			})
			;
	}



	protected async _get_meta(inputUrl, optionsRuntime, cache: {
		dom: IJSDOM,
	}): Promise<INovel>
	{
		const self = this;

		let url = self.makeUrl(self.parseUrl(inputUrl), -1);
		let url_data = self.parseUrl(url);

		return retryRequest(url, optionsRuntime.requestOptions)
		//return fromURL(url, optionsRuntime.optionsJSDOM)
		//return Promise.resolve(cache.dom)
			.then(function (domJson)
			{
				const decrypted = decryptBase64V4(domJson);

				const result = lookupTypeNovelDetailResponse().decode(decrypted)

				let data: IMdconfMeta = {};
				data.novel = {};
				data.novel.tags = [];

				/*
				console.dir(result, {
					depth: null
				})
				 */

				data.novel.status = result.Data.Status;

				result.Data.Types = result.Data.Types || [];
				result.Data.Types.forEach(function (s)
				{
					data.novel.tags.push(...s.split('\/'))
				});

				data.novel.tags.push(result.Data.Zone);

				const vol_list= [] ;
				// (<Array<any>>result.Data.Volume).map(v=>{
				// 	return <IVolume>{
				// 		chapter_list:[],
				// 		imgs:[],
				// 		volume_index:v.VolumeOrder,
				// 		volume_title:v.VolumeName,
				// 		id: v.VolumeId,
				// 		volume_id: v.VolumeId,
				// 	}
				// })

				let novel_date = moment.unix(protoLongToNumber(result.Data.LastUpdateTime)).local();

				return <INovel>{

					...data,

					url,

					url_data:parseUrl(url),
					novel_author: result.Data.Authors,
					novel_cover:result.Data.Cover,
					novel_date,
					novel_desc:result.Data.Introduction,
					novel_title:result.Data.Name,
					volume_list :vol_list


				} as INovel;
			})
			;
	}
}

export default NovelSiteTpl;
