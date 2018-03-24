import { retryRequest } from '../../fetch';

import fs, { trimFilename } from 'fs-iconv';
import * as path from 'path';
import novelInfo, { IMdconfMeta } from 'node-novel-info';
import { fromURL, IFromUrlOptions, IJSDOM } from 'jsdom-extra';
// @ts-ignore
import { LazyCookie, LazyCookieJar } from 'jsdom-extra';
import { URL } from 'jsdom-url';
import { getFilePath, getVolumePath } from '../fs';

import NovelSite, { staticImplements, defaultJSDOMOptions, SYMBOL_CACHE, IOptionsRuntime } from '../index';
import { PromiseBluebird, bluebirdDecorator } from '../index';
import { moment } from '../index';
import { createOptionsJSDOM } from '../../jsdom';

export interface INovel extends NovelSite.INovel
{
	novel_syosetu_id: string,
}

export type IDownloadOptions = NovelSite.IDownloadOptions & NovelSite.IOptions & {
	/**
	 * 不使用小說家提供的 txt 下載連結
	 */
	disableTxtdownload?: boolean,
}

@staticImplements<NovelSite.INovelSiteStatic<NovelSiteSyosetu>>()
export class NovelSiteSyosetu extends NovelSite
{
	static IDKEY = 'syosetu';

	constructor(options: IDownloadOptions, ...argv)
	{
		super(options, ...argv);
	}

	session<T = NovelSite.IOptionsRuntime>(optionsRuntime: Partial<T & IDownloadOptions>)
	{
		super.session(optionsRuntime);

		let url = optionsRuntime[SYMBOL_CACHE].url;

		(optionsRuntime.optionsJSDOM.cookieJar as LazyCookieJar)
			.setCookieSync('over18=yes; Domain=.syosetu.com; Path=/', url.href)
		;

		return this;
	}

	download(url: string | URL, downloadOptions: IDownloadOptions = {})
	{
		const self = this;

		const [PATH_NOVEL_MAIN, optionsRuntime] = this.getOutputDir<NovelSite.IOptionsRuntime & IDownloadOptions>(downloadOptions);

		optionsRuntime.optionsJSDOM = createOptionsJSDOM(optionsRuntime.optionsJSDOM);

		console.log(optionsRuntime);

		return PromiseBluebird
			.bind(self)
			.then(async function ()
			{
				url = this.createMainUrl(url as any);

				optionsRuntime[SYMBOL_CACHE].url = url;

				self.session(optionsRuntime);

				let novel = await self.get_volume_list<NovelSite.IOptionsRuntime & IDownloadOptions>(url, optionsRuntime);

				//console.log(novel);

				let idx = downloadOptions.startIndex || 0;

				let path_novel = path.join(self.PATH_NOVEL_MAIN,
					`${self.trimFilenameNovel(novel.novel_title)}_(${novel.url_data.novel_id})`
				);

				optionsRuntime[SYMBOL_CACHE].novel = novel;
				optionsRuntime[SYMBOL_CACHE].path_novel = path_novel;

				let ret = await PromiseBluebird
					.mapSeries(novel.volume_list, function (volume, vid)
					{
						let dirname = getVolumePath(self, {
							path_novel,
							volume, vid
						}, optionsRuntime);

						return PromiseBluebird
							.mapSeries(volume.chapter_list, async function (chapter, cid)
							{
								chapter.chapter_index = (idx++);

								let file = getFilePath(self, {
									chapter, cid,
									ext: '.txt',
									dirname,
									volume, vid,
								}, optionsRuntime);

								if (!optionsRuntime.disableCheckExists && fs.existsSync(file))
								{
									let txt = await fs.readFile(file);

									if (txt.toString())
									{
										//console.log(`skip\n${volume.volume_title}\n${chapter.chapter_title}`);

										return file;
									}
								}
								else
								{
									//console.log(`${chapter.chapter_title} ${pad}`);
								}

								let fn;

								if (optionsRuntime.disableDownload)
								{
									fn = async function ()
									{
										return '';
									};
								}
								else if (!optionsRuntime.disableTxtdownload)
								{
									fn = function ()
									{
										return retryRequest(chapter.chapter_url, {
											delay: 25000,
											jar: optionsRuntime.optionsJSDOM.cookieJar,
										});
									}
								}
								else
								{
									let url = self.makeUrl({
										chapter_id: chapter.chapter_id,
										novel_id: novel.url_data.novel_id,
									});

									//console.log(url);

									fn = function ()
									{
										return fromURL(url, optionsRuntime.optionsJSDOM)
											.then(async function (dom)
											{
												return [
													dom.$('#novel_p').text(),
													dom.$('#novel_honbun').text(),
													dom.$('#novel_a').text(),
												].filter(function (v)
												{
													return v;
												}).join('\n\n==================\n\n');
											})
											;
									};
								}

								//console.log(url);

								await PromiseBluebird.resolve().then(function ()
								{
									return fn()
										.then(async function (text)
										{
											await fs.outputFile(file, text);

											return text;
										})
										;
								});

								return file;
							})
							;
					})
					.tap(ls =>
					{
						let file = path.join(path_novel,
							`${self.trimFilenameNovel(novel.novel_title)}.${novel.url_data.novel_id}.json`
							)
						;

						//console.log(ls);

						return fs.outputJSON(file, novel, {
							spaces: "\t",
						});
					})
				;

				await self._saveReadme(optionsRuntime);

				return novel;
			})
			.finally(function ()
			{
				if (0)
				{
					console.dir((optionsRuntime.optionsJSDOM as IFromUrlOptions).cookieJar, {
						depth: null,
						colors: true,
					});
				}

			})
			;
	}

	protected _saveReadme(optionsRuntime: IOptionsRuntime, options = {}, ...opts)
	{
		options[this.IDKEY] = {
			txtdownload_id: optionsRuntime[SYMBOL_CACHE].novel.novel_syosetu_id,
		};

		return super._saveReadme(optionsRuntime, options, {
			options: {
				textlayout: {
					allow_lf2: true,
				}
			},
		}, ...opts);
	}

	makeUrl(urlobj: NovelSite.IParseUrl, bool ?: boolean): URL
	{
		let subdomain = urlobj.novel_r18 ? 'novel18' : 'ncode';

		if (urlobj.novel_pid && urlobj.chapter_id)
		{
			return new URL(`https://${subdomain}.syosetu.com/txtdownload/dlstart/ncode/${urlobj.novel_pid}/?no=${urlobj.chapter_id}&hankaku=0&code=utf-8&kaigyo=crlf`);
		}

		let pad = (!bool && urlobj.chapter_id) ? urlobj.chapter_id : '';

		return new URL(`http://${subdomain}.syosetu.com/${urlobj.novel_id}/${pad}`);
	}

	parseUrl(url: string | URL): NovelSite.IParseUrl
	{
		let urlobj = {
			url,

			novel_pid: null,
			novel_id: null,
			chapter_id: null,

			novel_r18: null,
		};

		//url = url.toString();

		try
		{
			urlobj.url = new URL(url);
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

		r = /^(n[\w]{6})$/;
		if (m = r.exec(url))
		{
			urlobj.novel_id = m[1];
			return urlobj;
		}

		r = /(novel18)\.syosetu\.com/;
		if (m = r.exec(url))
		{
			urlobj.novel_r18 = m[1];
		}

		r = /txtdownload\/dlstart\/ncode\/(\d+)/;
		if (m = r.exec(url))
		{
			urlobj.novel_pid = m[1];

			return urlobj;
		}

		r = /\.syosetu\.com\/(n\w+)(?:\/?(\d+))?/;
		if (m = r.exec(url))
		{
			urlobj.novel_id = m[1];
			urlobj.chapter_id = m[2];

			return urlobj;
		}

		return urlobj;
	}

	async get_volume_list<T = NovelSite.IOptionsRuntime>(url: string | URL,
		optionsRuntime: Partial<T & IDownloadOptions> = {}
	): Promise<INovel>
	{
		const self = this;

		url = this.createMainUrl(url as any);

		return await fromURL(url, optionsRuntime.optionsJSDOM)
			.then(async function (dom: IJSDOM)
			{
				const $ = dom.$;

				if (!$('#novel_contents').length || $('#modal .yes #yes18').length)
				{
					//console.log(dom.url, dom._options);

					$('#modal .yes #yes18').click();

					dom._options.requestOptions.jar.setCookie('over18=yes; Domain=.syosetu.com; Path=/', url);

					//console.log(dom.serialize());

					return fromURL(url, Object.assign(optionsRuntime.optionsJSDOM, {

						//cookieJar: dom._options.requestOptions.jar._jar,
						//requestOptions: dom._options.requestOptions,

					} as IFromUrlOptions));
				}

				//console.log(dom._options.requestOptions.jar);

				return dom;
			})
			.then(async function (dom: IJSDOM)
			{
				let novel_title = dom.$('.novel_title').text();
				let novel_author = dom.$('.novel_writername a').text();

				let novel_desc = dom.$('#novel_ex').text();

				let novel_publisher = self.IDKEY;

				let url_data = self.parseUrl(dom.url.href);

				let volume_list = [] as NovelSite.IVolume[];

				let currentVolume: NovelSite.IVolume;

				let table = dom.$('.index_box').find('> .chapter_title, .novel_sublist2');

				let _cache_dates = [];

				let novel_series_title;

				{
					let a = dom.$('#novel_contents .series_title').text()
						.replace(/[\r\n\t]+|^\s+|\s+$/g, '')
					;
					if (a)
					{
						novel_series_title = a;
					}
				}

				let novel_syosetu_id;

				{
					let $ = dom.$;

					//console.log(dom.serialize());

					//console.log($('#novel_footer'));

					//console.log($('#novel_footer').find('.undernavi a[href*="txtdownload"]'));

					let m;
					let dt = dom.$('#novel_footer .undernavi a[href*="txtdownload"]').prop('href');
					if (m = dt.match(/ncode\/(\d+)/))
					{
						novel_syosetu_id = m[1];
					}
					else
					{
						throw new Error()
					}
				}

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
								/*
								console.log(a);
								console.log(data);
								console.log(href);
								console.log(a.attr('href'));
								console.log(new URL(href, dom.url));

								console.log(dom._options);
								*/

								throw new Error()
							}
							else
							{
								data = {
									url: null,
									novel_pid: novel_syosetu_id as string,
									chapter_id: data.chapter_id as string,
								} as any;

								href = self.makeUrl(data);

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
						}
					})
				;

				_cache_dates.sort();

				let novel_date = moment.unix(_cache_dates[_cache_dates.length - 1]).local();

				let a = await fromURL(`https://${url_data.novel_r18
					? 'narou18'
					: 'narou'}.dip.jp/search.php?text=${url_data.novel_id}&novel=all&genre=all&new_genre=all&length=0&down=0&up=100`, optionsRuntime.optionsJSDOM)
					.then(function (dom)
					{
						let h2 = dom.$(`div:has(> h2.search:has(> a[href*="${url_data.novel_id}"]))`).eq(0);

						if (!h2.length)
						{
							h2 = dom.$(`h2:has(> a[href*="${url_data.novel_id}"])`).eq(0);
						}

						if (!h2.length)
						{
							//console.warn(`can not found keyword "${url_data.novel_id}", will try use title search`);

							return fromURL(`https://${url_data.novel_r18
								? 'narou18'
								: 'narou'}.dip.jp/search.php?text=${novel_title}&novel=all&genre=all&new_genre=all&length=0&down=0&up=100`, optionsRuntime.optionsJSDOM)
								;
						}

						return dom;
					})
					.then(function (dom)
					{
						//console.log(dom.url);

						let data: IMdconfMeta = {};

						let h2 = dom.$(`div:has(> h2.search:has(> a[href*="${url_data.novel_id}"]))`).eq(0);

						if (!h2.length)
						{
							h2 = dom.$(`h2:has(> a[href*="${url_data.novel_id}"])`).eq(0);
						}

						let search_left = h2.siblings('.search_left').eq(0);
						let search_right = h2.siblings('.search_right').eq(0);

						if (!h2.length)
						{
							//console.log(111111111111111111111);
							console.warn(`can not found keyword for ${url_data.novel_id}`);

							return data;
						}

						//console.log(search_left);
						//console.log(search_right);

						data.novel = {};

						data.novel.status = search_left.find('.novel_type').text();
						data.novel.tags = [];

						search_right.find('.keyword a')
							.each(function (index, elem)
							{
								let k = dom.$(elem)
									.text()
									.trim()
									.split(/[\/\s]/)
									.map(function (s)
									{
										return s.trim();
									})
									.filter((v) => v)
								;

								data.novel.tags = data.novel.tags.concat(k);
							})
						;

						data.link = [];

						data.link.push(`[dip.jp](${dom.url}) - 小説家になろう　更新情報検索`);

						//console.log(data);

						return data;
					})
					.catch(function (e)
					{
						console.error(e);
						console.error(`can't download novel extra info`);

						return {};
					})
				;

				return {

					...a,

					url: dom.url,
					url_data,

					novel_title,
					novel_author,

					novel_desc,
					novel_date,
					novel_publisher,

					novel_series_title,

					novel_syosetu_id,

					volume_list,

					checkdate: moment().local(),

					imgs: [] as string[],
				} as INovel;
			})
			;
	}

}

export default NovelSiteSyosetu;

