/**
 * Created by user on 2018/3/17/017.
 */

import { minifyHTML, trim } from '../../util';
import NovelSiteDemo, { IDownloadOptions, INovel, IOptionsRuntime, IFetchChapter } from '../demo/tree';
import { IRowVolume, TreeNode } from '../../tree/index';

import fs from 'fs-extra';
import { trimFilename } from 'fs-iconv/util';
import path from 'upath2';
import novelInfo, { IMdconfMeta } from 'node-novel-info';
import { fromURL, IFromUrlOptions, IJSDOM } from 'jsdom-extra';

//import { URL } from 'jsdom-url';

import NovelSite, { staticImplements, defaultJSDOMOptions, SYMBOL_CACHE } from '../index';
import { PromiseBluebird, bluebirdDecorator } from '../index';
import { moment } from '../index';
import { retryRequest } from '../../fetch';
import { zhRegExp } from 'regexp-cjk';
import { parseUrl, makeUrl, check } from './util';
import { _p_2_br } from '../esjzone/util';
import zhRegExpWithPluginEnabled from 'regexp-cjk-with-plugin-enabled';

/**
 * 铅笔小说
 * @example https://www.x23qb.com/book/284/
 */
@staticImplements<NovelSite.INovelSiteStatic<NovelSiteX23qb>>()
export class NovelSiteX23qb extends NovelSiteDemo
{
	public static readonly IDKEY = 'x23qb';

	/*
	protected _fixOptionsRuntime(optionsRuntime)
	{
		optionsRuntime.optionsJSDOM = optionsRuntime.optionsJSDOM || {};

		//optionsRuntime.optionsJSDOM.runScripts = 'dangerously';

		return super._fixOptionsRuntime(optionsRuntime)
	}
	 */

	protected _cache_re: RegExp;

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

					let elems = $('.trans');

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
			let html = minifyHTML($('#mlfy_main_text').html());

			$('#mlfy_main_text').html(html);
		}
		catch (e)
		{

		}

		let elem = ret.dom.$('#TextContent');

		elem
			.find('> .tp, > .ke, > .rd, > .bd, script')
			.remove()
		;

		_p_2_br(elem.find('p'), ret.dom.$);

		elem.html(function (i, old: string)
		{
			return old
				.replace(/(\<br\>){3,4}/g, '$1')
				.replace(/(?<=\<br\>)(?=[^\n])/g, '\n')
		});

		let title = trim(ret.dom.$('mlfy_main_text > h1:eq(0)').text());


		if (!this._cache_re)
		{
			this._cache_re = new zhRegExpWithPluginEnabled(/^(?:鉛\s*筆\s*小\s*說\(w\s*w\s*w\s*\.\s*x\s*2\s*3\s*q\s*b\s*\.\s*c\s*o\s*m\))$/uigm)
		}

		let txt: string = elem
			.text()
			.replace(this._cache_re, '')
			.replace(/^\s+|\s+$/g, '')
			.replace(/^[ \xA0]+|[ \xA0]+$/gm, '')
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

				let novel_title = dom.$('.d_title h1').text();

				let novel_publisher = self.IDKEY;

				let url_data = self.parseUrl(dom.url.href);

				let novel_desc = $('#bookintro > p:eq(0)').text();

				let volume_list = [] as NovelSite.IVolume[];

				const novelTree = optionsRuntime.novelTree;
				let currentVolume: TreeNode<IRowVolume>;

				let table = $('#chapterList li')
					.find('a')
				;

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
						tags: [],
					},
				};

				let novel_date = moment($('#uptime > span').text());

				let tag = $('.bookright #count li:eq(0) span:eq(0)').text().trim();

				if (tag)
				{
					data_meta.novel.tags.push(tag)
				}

				let novel_author = $('.p_author a:eq(0)').text().trim();

				data_meta.link = data_meta.link || [];
				data_meta.link.push($('.p_author a:eq(0)').prop('href'));

				$('.bookright #count li span')
					.each((i, elem) => {

						let txt = $(elem).text().trim();

						let bool = [
							'完結済',
							'完結',
							'已完結',
							'已完成',
							'完结済',
							'完结',
							'已完结',
							'已完成',
						].includes(txt)
						;

						if (bool)
						{
							data_meta.novel.status = txt;
						}

					})
				;

				return {

					...data_meta,

					url: dom.url,
					url_data,

					novel_title,
					novel_publisher,

					novel_author,

					novel_date,

					novel_desc,

					//volume_list,
					novelTree,

					checkdate: moment().local(),

					imgs: [] as string[],
				} as INovel;
			})
			;
	}

}

export default NovelSiteX23qb;
