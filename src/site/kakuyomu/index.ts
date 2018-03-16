/**
 * Created by user on 2018/3/17/017.
 */

import { retryRequest } from '../../fetch';

import fs, { trimFilename } from 'fs-iconv';
import * as path from 'path';
import novelInfo, { IMdconfMeta } from 'node-novel-info';
import { fromURL, IFromUrlOptions, IJSDOM } from 'jsdom-extra';
// @ts-ignore
import { LazyCookie, LazyCookieJar } from 'jsdom-extra';
import { URL } from 'jsdom-url';

import NovelSite, { staticImplements, defaultJSDOMOptions, SYMBOL_CACHE } from '../index';
import { PromiseBluebird, bluebirdDecorator } from '../index';
import { moment } from '../index';

export type IDownloadOptions = NovelSite.IDownloadOptions & NovelSite.IOptions & {

}

export interface INovel extends NovelSite.INovel
{

}

@staticImplements<NovelSite.INovelSiteStatic<NovelSiteKakuyomu>>()
export class NovelSiteKakuyomu extends NovelSite
{
	static IDKEY = 'kakuyomu';

	/**
	 * https://kakuyomu.jp/works/4852201425154898215/episodes/4852201425154936315
	 */
	makeUrl(urlobj: NovelSite.IParseUrl, bool ?: boolean): URL
	{
		let pad = (!bool && urlobj.chapter_id) ? '/episodes/' + urlobj.chapter_id : '';

		return new URL(`https://kakuyomu.jp/works/${urlobj.novel_id}${pad}`);
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
			urlobj.url = new URL(url);
			url = urlobj.url.href;
		}
		catch (e)
		{
			console.warn(e.toString() + ` "${url}"`);
		}

		if (typeof url != 'string')
		{
			throw new TypeError(url);
		}

		let r: RegExp;
		let m;

		r = /^(\d{10,})$/;
		if (m = r.exec(url))
		{
			urlobj.novel_id = m[1];
			return urlobj;
		}

		r = /kakuyomu\.jp\/works\/(\d+)(?:\/(?:episodes\/(\d+)))?/g;
		if (m = r.exec(url))
		{
			urlobj.novel_id = m[1];
			urlobj.chapter_id = m[2];

			return urlobj;
		}

		return urlobj;
	}

	session<T = NovelSite.IOptionsRuntime>(optionsRuntime: Partial<T & IDownloadOptions>)
	{
		let url = optionsRuntime[SYMBOL_CACHE].url;

		optionsRuntime.optionsJSDOM.cookieJar = optionsRuntime.optionsJSDOM.cookieJar || new LazyCookieJar();
	}

	download(url: string | URL, downloadOptions: IDownloadOptions = {})
	{
		const self = this;

		const [PATH_NOVEL_MAIN, optionsRuntime] = this.getOutputDir<NovelSite.IOptionsRuntime & IDownloadOptions>(downloadOptions);

		optionsRuntime[SYMBOL_CACHE] = {} as {
			jar?,
		};

		optionsRuntime.optionsJSDOM = Object.assign({}, defaultJSDOMOptions, optionsRuntime.optionsJSDOM);

		optionsRuntime.optionsJSDOM.cookieJar = optionsRuntime.optionsJSDOM.cookieJar || new LazyCookieJar();

		return PromiseBluebird
			.bind(self)
			.then(async function ()
			{
				{
					let data = self.parseUrl(url);

					if (!data || !data.novel_id)
					{
						console.log(data);

						throw new ReferenceError();
					}

					url = self.makeUrl(data, true);
				}

				optionsRuntime[SYMBOL_CACHE].url = url;

				self.session(optionsRuntime);

				let novel = await self.get_volume_list<NovelSite.IOptionsRuntime & IDownloadOptions>(url, optionsRuntime);

				let idx = downloadOptions.startIndex || 0;

				let path_novel = path.join(self.PATH_NOVEL_MAIN,
					`${self.trimFilenameNovel(novel.novel_title)}_(${novel.url_data.novel_id})`
				);

				let ret = await PromiseBluebird
					.mapSeries(novel.volume_list, function (volume, vid)
					{
						let dirname: string;

						{
							let _vid = '';

							if (!optionsRuntime.noDirPrefix)
							{
								_vid = vid.toString().padStart(4, '0') + '0';
								_vid += '_';
							}

							dirname = path.join(path_novel,
								`${_vid}${self.trimFilenameVolume(volume.volume_title)}`
							);
						}

						return PromiseBluebird
							.mapSeries(volume.chapter_list, async function (chapter)
							{
								chapter.chapter_index = (idx++);

								let ext = '.txt';

								let file: string;

								{
									let prefix = '';

									if (!optionsRuntime.noFirePrefix)
									{
										prefix = chapter.chapter_index.toString()
											.padStart(4, '0') + '0'
										;
										prefix += '_';
									}

									let pad = '';

									if (!optionsRuntime.noFilePadend)
									{
										pad = '.' + chapter.chapter_date.format('YYYYMMDDHHmm');
									}

									file = path.join(dirname,
										`${prefix}${self.trimFilenameChapter(chapter.chapter_title)}${pad}${ext}`
									);
								}

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
												return dom.$('#contentMain .widget-episodeBody').text();
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

				{
					let options = {};

					let md = novelInfo.stringify({
						novel: {
							tags: [
								self.IDKEY,
							],
						},
						options,
						// @ts-ignore
						link: novel.link || [],
					}, novel, {
						options: {
							textlayout: {
								allow_lf2: true,
							}
						},
					});

					let file = path.join(path_novel, `README.md`);
					await fs.outputFile(file, md);
				}

				return novel;
			})
		;
	}

	async get_volume_list<T = NovelSite.IOptionsRuntime>(url: URL,
		optionsRuntime: Partial<T & IDownloadOptions> = {}
	): Promise<INovel>
	{
		const self = this;

		{
			let data = self.parseUrl(url);

			if (!data.novel_id)
			{
				throw new ReferenceError();
			}

			url = self.makeUrl(data, true);
		}

		return await fromURL(url, optionsRuntime.optionsJSDOM)
			.then(async function (dom: IJSDOM)
			{
				const $ = dom.$;

				let novel_title = dom.$('#workTitle').text();
				let novel_author = dom.$('#workAuthor-activityName').text();

				let novel_desc: string;

				dom.$('#description').each(function ()
				{
					$('#introduction').addClass('isExpanded');
					$('.ui-truncateText-expandButton').remove();
					$('.test-introduction-rest-text').show();

					let d = [];

					$(this)
						.find('#catchphrase-body, #catchphrase-authorLabel')
						.each(function ()
						{
							d.push($(this).text().replace(/\s+$/g, ''));
						})
					;

					if (d.length)
					{
						d.push(' ');
					}

					d.push($('#introduction').text().replace(/\s+$/g, ''));

					novel_desc = d
						.filter(v => v)
						.join("\n")
						.replace(/[ \t　]+$/gm, '')
					;

				});

				let novel_publisher = self.IDKEY;

				let url_data = self.parseUrl(dom.url.href);

				let volume_list = [] as NovelSite.IVolume[];

				let currentVolume: NovelSite.IVolume;

				let table = dom.$('#table-of-contents').find('.widget-toc-chapter, .widget-toc-episode');

				let _cache_dates = [];

				table
					.each(function (index)
					{
						let tr = dom.$(this);

						if (tr.is('.widget-toc-chapter'))
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

							let a = tr.find('a:eq(0)');

							let chapter_title = a.find('.widget-toc-episode-titleLabel').text();

							let chapter_date;
							let dd;
							let da = a.find('.widget-toc-episode-datePublished');

							if (!dd)
							{
								dd = da.attr('datetime').replace(/^\s+|\s+$/g, '');
							}

							if (dd)
							{
								chapter_date = moment(dd).local();
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
								href = self.makeUrl(data);

								data.url = href;
							}

							currentVolume
								.chapter_list
								.push({
									chapter_index: currentVolume.chapter_list.length,
									chapter_title: chapter_title.replace(/^\s+|\s+$/g, ''),
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

				let data_meta: IMdconfMeta = {};

				{
					data_meta.novel = {};
					data_meta.novel.tags = [];

					$('#workMeta-flags')
						.find('#workGenre a, #workMeta-attentionsAndTags [itemprop="keywords"] a')
						.each(function ()
						{
							let t = $(this).text().replace(/^\s+|\s+$/g, '');
							if (t)
							{
								data_meta.novel.tags.push(t);
							}
						})
					;

					$('#table-of-contents .widget-toc-workStatus span:eq(0)')
						.each(function ()
						{
							data_meta.novel.status = $(this).text().replace(/^\s+|\s+$/g, '');
						})
					;
				}

				return {

					...data_meta,

					url: dom.url,
					url_data,

					novel_title,
					novel_author,

					novel_desc,
					novel_date,
					novel_publisher,

					volume_list,

					checkdate: moment().local(),

					imgs: [] as string[],
				} as INovel;
			})
		;
	}

}

export default NovelSiteKakuyomu;
