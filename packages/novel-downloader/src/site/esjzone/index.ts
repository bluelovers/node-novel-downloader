/**
 * Created by user on 2018/3/17/017.
 */

import { minifyHTML, trim } from '../../util';
import NovelSiteDemo, { IDownloadOptions, INovel, IOptionsRuntime, IFetchChapter } from '../demo/tree';
import { IRowVolume, TreeNode } from '../../tree/index';

import fs = require('fs-extra');
import { trimFilename } from 'fs-iconv/util';
import * as path from 'upath2';
import novelInfo, { IMdconfMeta } from 'node-novel-info';
import { fromURL, IFromUrlOptions, IJSDOM } from 'jsdom-extra';

import { URL } from 'jsdom-url';

import NovelSite, { staticImplements, defaultJSDOMOptions, SYMBOL_CACHE } from '../index';
import { PromiseBluebird, bluebirdDecorator } from '../index';
import { moment } from '../index';
import { retryRequest } from '../../fetch';
import { dotSetValue, dotGetValue } from '../../util/value';

@staticImplements<NovelSite.INovelSiteStatic<NovelSiteESJZone>>()
export class NovelSiteESJZone extends NovelSiteDemo
{
	public static readonly IDKEY = 'esjzone';

	/*
	protected _fixOptionsRuntime(optionsRuntime)
	{
		optionsRuntime.optionsJSDOM = optionsRuntime.optionsJSDOM || {};

		//optionsRuntime.optionsJSDOM.runScripts = 'dangerously';

		return super._fixOptionsRuntime(optionsRuntime)
	}
	 */

	static check(url: string | URL | NovelSite.IParseUrl, options?): boolean
	{
		// @ts-ignore
		return /esjzone\.cc/i.test(new URL(url).hostname || '');
	}

	makeUrl(urlobj: NovelSite.IParseUrl, bool ?: boolean): URL
	{
		let pad: string;

		if (!bool && urlobj.chapter_id)
		{
			pad = `forum/${urlobj.novel_id}/${urlobj.chapter_id}.html`
		}
		else
		{
			pad = `detail/${urlobj.novel_id}.html`
		}

		// @ts-ignore
		return new URL(`https://www.esjzone.cc/${pad}`);
	}

	parseUrl(url: string | URL): NovelSite.IParseUrl
	{
		let urlobj = {
			url,

			novel_pid: null,
			novel_id: null,
			chapter_id: null,

		};

		//url = url.toString();

		try
		{
			// @ts-ignore
			urlobj.url = new URL(url);
			// @ts-ignore
			url = urlobj.url.href;
		}
		catch (e)
		{
			console.warn(e.toString() + ` "${url}"`);
		}

		if (typeof url != 'string')
		{
			// @ts-ignore
			throw new TypeError(url);
		}

		let r: RegExp;
		let m;

		r = /^(\d{6,})$/;
		if (m = r.exec(url))
		{
			urlobj.novel_id = m[1];
			return urlobj;
		}

		r = /esjzone\.cc\/forum\/(\d+)(?:\.html|\/(\d+).html)/g;
		if (m = r.exec(url))
		{
			urlobj.novel_id = m[1];
			urlobj.chapter_id = m[2];

			return urlobj;
		}

		r = /esjzone\.cc\/detail\/(\d+)(?:\.html)?/g;
		if (m = r.exec(url))
		{
			urlobj.novel_id = m[1];

			return urlobj;
		}

		return urlobj;
	}

	protected async _decodeChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache)
	{
		const { dom } = ret;
		const { $ } = dom;

		let html = dom.serialize();

		let m = html
			.match(/getTranslation\(['"]([^\'"]+)['"]/i)
		;

		if (m)
		{
			let code = m[1];

			await retryRequest(ret.url, {
				// @ts-ignore
				...optionsRuntime.requestOptions,
				method: 'POST',
				form: {
					plxf: 'getTranslation',
					plxa: [code],
				},
			})
				.then((v: string) => {
					v = v
						.replace(/\<JinJing\>/, '')
						.replace(/\<\/JinJing\>/, '')
					;

					return JSON.parse(v)
				})
				/*
				.tap(v => {
					console.dir('-----------------------')
					console.dir(v)
					console.dir('-----------------------')
				})
				 */
				.tap((a: string[]) => {

					let elems = $('.trans, .t');

					a.forEach((v, i) => {
						elems.eq(i).html(v);
					})

				})
			;

		}

		//console.dir(m);
		//process.exit();
	}

	protected async _parseChapter<T>(ret, optionsRuntime, cache)
	{
		if (!ret)
		{
			return '';
		}

		try
		{
			let html = minifyHTML(ret.dom.$('.container .row:has(.forum-content)').html());

			ret.dom.$('.container .row:has(.forum-content)').html(html);
		}
		catch (e)
		{

		}

		ret.dom.$('p[class]:has(> script), .adsbygoogle').remove();

		await this._decodeChapter(ret, optionsRuntime, cache);

		_p_2_br('.forum-content > p', ret.dom.$);

		let elem = ret.dom.$('.container .forum-content');

		elem.html(function (i, old: string)
		{
			return old
				.replace(/(\<br\>){3,4}/g, '$1')
				.replace(/(?<=\<br\>)(?=[^\n])/g, '\n')
		});

		let title = trim(ret.dom.$('.container .row > div > h3').text());

		let txt: string = elem
			.text()
			.replace(/^(?:由於百度\s*\d+\s*年以前的貼文都刪了|所以不清楚是由哪位大佬翻譯|若轉載的動作冒犯了您，先跟您說聲抱歉！|也麻煩留言告知，我們會將此文下架|已?由?譯者授權轉載！?|原文網址：[^\n]+|轉載自貼吧)$/uigm, '')
			.replace(/^\s+|\s+$/g, '')
		;

		if (txt.indexOf(title + '\n') === 0)
		{
			txt = txt.slice(title.length + 1)
				.replace(/^\n+/g, '')
			;
		}

		let contribute: string[] = dotGetValue(cache, 'novel.contribute', { default: [] });

		txt = txt.replace(/^翻譯：([^\n]+)\n/, (s, v) => {

			v = v.replace(/^[\s　\xA0]+|[\s　\xA0]+$/g, '');

			if (v && !contribute.includes(v))
			{
				contribute.push(v);
			}

			return ''
		});

		if (contribute.length)
		{
			dotSetValue(cache, 'novel.contribute', contribute);
		}

		/*
		let html = elem.html();

		throw console.dir({
			html,
			txt,
		});
		 */

//		console.dir(txt);

//		process.exit();

		return txt as string
	}

	async get_volume_list<T extends IOptionsRuntime>(url: string | URL,
		optionsRuntime: Partial<T & IDownloadOptions> = {},
	): Promise<INovel>
	{
		const self = this;

		url = await this.createMainUrl(url as any, optionsRuntime);

		return fromURL(url, optionsRuntime.optionsJSDOM)
			.then(async function (dom: IJSDOM)
			{
				const $ = dom.$;

				try
				{
					let html = minifyHTML(dom.$('.product-detail').html());

					dom.$('.product-detail').html(html);
				}
				catch (e)
				{

				}

				let novel_title = dom.$('.container .row > div > h3').text();

				let novel_publisher = self.IDKEY;

				let url_data = self.parseUrl(dom.url.href);

				let novel_author: string;
				let novel_date;

				$('.product-detail .well .nav-list > li')
					.each(function (i, elem)
					{
						let _this = $(this);

						let _text = trim(_this.text());

						let _m: RegExpMatchArray;

						if (_m = _text.match(/作者\s*[：:]\s*([^\n]+)/))
						{
							novel_author = trim(_m[1])
						}
						else if (_m = _text.match(/\b(\d{4}\-\d{1,2}\-\d{1,2})\b/))
						{
							try
							{
								let last_update_time = moment(_m[1]);
								novel_date = last_update_time;
							}
							catch (e)
							{

							}
						}

					})
				;

				let volume_list = [] as NovelSite.IVolume[];

				const novelTree = optionsRuntime.novelTree;
				let currentVolume: TreeNode<IRowVolume>;

				let table = dom.$('.product-detail .tabbable .tab-content.show-desc').find('a');

				let _cache_dates = [];

				let total_idx = 0;

				{
					let volume_title = 'null';
					let volume_level = null;

					currentVolume = novelTree.addVolume({
						volume_title,
						volume_level,
						volume_index: novelTree.root().size(),
						total_idx: total_idx++,
					});
				}

				dom.$('p[class]:has(> script[src*=google]), div[class]:has(> script[src*=google]), .adsbygoogle').remove();

				table
					.each(function (index, elem)
					{
						let tr = dom.$(elem);

						if (1)
						{
							let a = tr;
							let chapter_title = trim(a.text(), true);

							let href = a.prop('href');

							let data = self.parseUrl(href);

							if (!data.chapter_id)
							{
								return;
							}
							else
							{
								href = self.makeUrl(data);

								data.url = href;
							}

							let chapter = {
								chapter_title,
								chapter_id: data.chapter_id,
								chapter_url: href,
								chapter_url_data: data,
								chapter_index: currentVolume.size(),
								total_idx: total_idx++,
							};

							novelTree.addChapter(chapter, currentVolume)
						}
					})
				;

				let data_meta: IMdconfMeta = {
					novel: {

					},
				};

				data_meta.novel.cover = $('.product-detail:eq(0)').find('img.product-image').prop('src');

				let novel_desc = trim($('.product-detail:eq(0)').find('.book_description').text() || '');

				return {

					...data_meta,

					url: dom.url,
					url_data,

					novel_author,
					novel_date,

					novel_desc,

					novel_title,
					novel_publisher,

					//volume_list,
					novelTree,

					checkdate: moment().local(),

					imgs: [] as string[],
				} as INovel;
			})
			;
	}

}

export default NovelSiteESJZone;

function _p_2_br(target, $)
{
	return $(target)
		.each(function (i, elem)
		{
			let _this = $(elem);

			let _html = _this
				.html()
				.replace(/(?:&nbsp;?)/g, ' ')
				.replace(/[\xA0\s]+$/g, '')
			;

			if (_html == '<br/>' || _html == '<br>')
			{
				_html = '';
			}

			_this.after(`${_html}<br/>`);
			_this.remove()
		})
		;
}
