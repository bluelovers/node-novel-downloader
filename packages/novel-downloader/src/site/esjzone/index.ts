/**
 * Created by user on 2018/3/17/017.
 */

import { minifyHTML, trim } from '../../util';
import NovelSiteDemo, { IDownloadOptions, INovel, IOptionsRuntime, IFetchChapter } from '../demo/tree';
import { IRowVolume, TreeNode, IRowChapter } from '../../tree/index';
import { IMdconfMeta } from 'node-novel-info';
import { fromURL, IJSDOM } from 'jsdom-extra';
import NovelSite, { staticImplements, moment } from '../index';
import { retryRequest } from '../../fetch';
import { dotSetValue, dotGetValue } from '../../util/value';
import { zhRegExp } from '../../util/regex';
import { _keepImageInContext } from '../../util/html';
import { parseUrl, makeUrl, check, _p_2_br } from './util';

//import { URL } from 'jsdom-url';

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

	protected _reContext: RegExp;

	_constructor(...argv)
	{
		// @ts-ignore
		super._constructor(...argv);

		this._reContext = new zhRegExp(/^(?:由於百度\s*\d+\s*年以前的貼文都刪了|所以不清楚是由哪位大佬翻譯|若轉載的動作冒犯了您，先跟您說聲抱歉！|也麻煩留言告知，我們會將此文下架|已?由?譯者授權轉載！?|原文網址：[^\n]+|轉載自貼吧|ESJ輕小說(\s*(?:https:\/\/)?www\.esjzone\.cc\/?)?|僅供個人學習交流使用，禁作商業用途|下載后請在24小時內刪除，[^\n]*不負擔任何責任|請尊重翻譯、掃圖、錄入、校對的辛勤勞動，轉載請保留信息|轉載自真白)$/uigm);

	}

	static check(url: string | URL | NovelSite.IParseUrl, ...argv): boolean
	{
		return check(url, ...argv);
	}

	static makeUrl(urlobj: NovelSite.IParseUrl, bool?: boolean | number, ...argv)
	{
		return makeUrl(urlobj, bool, ...argv)
	}

	static parseUrl(url: string | URL | number, ...argv)
	{
		return parseUrl(url, ...argv);
	}

	makeUrl(urlobj: NovelSite.IParseUrl, bool?: boolean | number, ...argv)
	{
		return makeUrl(urlobj, bool, ...argv)
	}

	parseUrl(url: string | URL | number, ...argv)
	{
		return parseUrl(url, ...argv);
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

		const $ = ret.dom.$;

		try
		{
			let html = minifyHTML(ret.dom.$('.container .row:has(.forum-content)').html());

			ret.dom.$('.container .row:has(.forum-content)').html(html);
		}
		catch (e)
		{

		}

		if (!ret.dom.$('.container .row:has(.forum-content)').html())
		{
			throw this._fetchChapterRetryError(`發現防爬蟲機制，將稍後再試圖下載`, ret, optionsRuntime, cache);
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

		if (optionsRuntime.keepImage)
		{
			await _keepImageInContext(elem.find('img[src]'), $);
		}

		let txt: string = elem
			.text()
			.replace(this._reContext, '')
			.replace(/^\s+|\s+$/g, '')
		;

		if (txt.indexOf(title + '\n') === 0)
		{
			txt = txt.slice(title.length + 1)
				.replace(/^\n+/g, '')
			;
		}

		let contribute: string[] = dotGetValue(cache, 'novel.contribute', { default: [] });

		txt = txt.replace(new zhRegExp(/^翻譯：([^\n]+)\n/), (s, v) => {

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

		txt = txt
			.replace(/^\n{2,}/g, '\n')
		;

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

				let _content = $('.product-detail:eq(0)');
				let table = _content.find('#tab1 a[href], #tab1  .non');

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

				//console.dir(table.length)

				table
					.each(function (index, elem)
					{
						let tr = $(elem);
						let _this = tr;

						if (_this.is('.non'))
						{
							let volume_title = trim(_this.text());

							if (volume_title)
							{
								currentVolume = novelTree.addVolume({
									volume_title,
									volume_index: novelTree.root().size(),
									total_idx: total_idx++,
								});

								return;
							}
						}

						if (tr.is('a'))
						{
							let a = tr;
							let chapter_title = trim(a.text(), true);

							//console.log(chapter_title)

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

							let chapter: IRowChapter = {
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

				dom.$('p[class]:has(> script[src*=google]), div[class]:has(> script[src*=google]), .adsbygoogle').remove();

				let data_meta: IMdconfMeta = {
					novel: {

					},
				};

				$('.product-detail .well ')
					.find('.row a[href]')
					.not('.btn, .form-group *')
					.each((i, elem) =>
					{

						let _this = $(elem);

						let name = trim(_this.text());
						let href = _this.prop('href') as string;

						if (name === href)
						{
							name = undefined;
						}

						data_meta.link = data_meta.link || [];
						data_meta.link.push(href);

					})
				;

				$('.show-tag a[href*="tag"]')
					.each((i, elem) =>
					{
						let _this = $(elem);
						let name = trim(_this.text());

						if (name)
						{
							data_meta.novel.tags = data_meta.novel.tags || [];
							data_meta.novel.tags.push(name);
						}
					})
				;

				data_meta.novel.cover = $('.product-detail:eq(0)').find('img.product-image:not([src*="empty.jpg"])').prop('src');

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

