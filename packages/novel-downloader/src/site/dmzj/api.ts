/**
 * Created by user on 2018/3/25/025.
 */

import { retryRequest } from '../../fetch';
import { stripContent } from '../../strip';
import { array_unique, escapeRegexp, isUndef, minifyHTML, trim } from '../../util';
import _NovelSite, {staticImplements, SYMBOL_CACHE, IMdconfMeta, IVolume, IChapter} from '../index';
import { IDownloadOptions, INovel } from '../demo/base';
import { IFetchChapter, IOptionsRuntime } from '../demo/base';
import * as NovelSiteDemo from '../demo/base';
import NovelSiteBase from '../demo/base';
//import { URL } from 'jsdom-url';
import { fromURL, IFromUrlOptions, IJSDOM } from 'jsdom-extra';
import { PromiseBluebird, bluebirdDecorator } from '../index';
import { moment } from '../index';
import novelText from '@node-novel/layout';
import path from "path";
import StrUtil from 'str-util';
import { zhRegExp } from 'regexp-cjk';
import { requestToJSDOM, packJSDOM, createJSDOM } from 'jsdom-extra';
import { _keepImageInContext, _saveImageToAttach } from '../../util/html';
import createURL from '../../util/url';
import {parseUrl, makeUrl, check, TxturlCreator} from './util';

//import escapeStringRegexp from 'escape-string-regexp';
import crypto from "crypto";
import * as protobuf from "protobufjs";
const rsa_key = "MIICXgIBAAKBgQCvJzUdZU5yHyHrOqEViTY95gejrLAxsdLhjKYKW1QqX+vlcJ7iNrLZoWTaEHDONeyM+1qpT821JrvUeHRCpixhBKjoTnVWnofV5NiDz46iLuU25C2UcZGN3STNYbW8+e3f66HrCS5GV6rLHxuRCWrjXPkXAAU3y2+CIhY0jJU7JwIDAQABAoGBAIs/6YtoSjiSpb3Ey+I6RyRo5/PpS98GV/i3gB5Fw6E4x2uO4NJJ2GELXgm7/mMDHgBrqQVoi8uUcsoVxaBjSm25737TGCueoR/oqsY7Qy540gylp4XAe9PPbDSmhDPSJYpersVjKzDAR/b9jy3WLKjAR6j7rSrv0ooHhj3oge1RAkEA4s1ZTb+u4KPfUACL9p/4GuHtMC4s1bmjQVxPPAHTp2mdCzk3p4lRKrz7YFJOt8245dD/6c0M8o4rcHuh6AgCKQJBAMWzrZwptbihKeR7DWlxCU8BO1kH+z6yw+PgaRrTSpII2un+heJXeEGdk0Oqr7Aos0hia4zqTXY1Rie24GDHHM8CQQC7yVjy5g4u06BXxkwdBLDR2VShOupGf/Ercfns7npHuEueel6Zajn5UAY2549j4oMATf9Gn0/kGVDgTo1s6AyZAkApc6PqA0DLxlbPRhGo0v99pid4YlkGa1rxM4M2Eakn911XBHuz2l0nfM98t5QAnngArEoakKHPMBpWh1yCTh03AkEAmcOddu2RrPGQ00q6IKx+9ysPx71+ecBgHoqymHL9vHmrr3ghu4shUdDxQfz/xA2Z8m/on78hBZbnD1CNPmPOxQ==";
const key = crypto.createPrivateKey({
	key: Buffer.from(rsa_key, "base64"),
	format: "der",
	type: "pkcs1",
});
const block_size = 1024 / 8;
const root = protobuf.Root.fromJSON(require("./dmzjproto.json"));
function decrypt(key, input: Buffer) {
	const block_count = input.length;
	const blocks = [];
	let i = 0;
	while (i < block_count) {
		blocks.push(input.slice(i, i += block_size))
	}
	return Buffer.concat(blocks.map(p => crypto.privateDecrypt({
		key: key,
		padding: crypto.constants.RSA_PKCS1_PADDING
	}, p)))

}

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
			console.log(data);

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
			text = ret.dom.$(body_selector).text();
		}
		else
		{
			ret.dom = createJSDOM(ret.body.toString());

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

				const buffer = Buffer.from(dom, "base64");
				const decrypted = decrypt(key, buffer);
				const response_type = root.lookupType("NovelChapterResponse");
				const result = <any>response_type.decode(decrypted);
				const apiresult = result.Data.map((v: any) => {
					return <IVolume>{

						id: v.VolumeId,
						chapter_list: v.Chapters.map((c: any) => {
							return <IChapter>{
								chapter_id: c.ChapterId,
								chapter_title: c.ChapterName,
								chapter_index: c.ChapterOrder,
								chapter_url: new TxturlCreator(v.VolumeId,c.ChapterId)
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
				const buffer = Buffer.from(domJson as string, "base64");
				const decrypted = decrypt(
					key, buffer);
				const response_type = root.lookupType("NovelDetailResponse");
				const result = <any>response_type.decode(decrypted)
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


				return <INovel>{

					url,

					url_data:parseUrl(url),
					novel_author: result.Data.Authors,
					novel_cover:result.Data.Cover,
					novel_date: moment(+result.Data.LastUpdateTime),
					novel_desc:result.Data.Introduction,
					novel_title:result.Data.Name,
					volume_list :vol_list


				} as INovel;
			})
			;
	}
}

export default NovelSiteTpl;
