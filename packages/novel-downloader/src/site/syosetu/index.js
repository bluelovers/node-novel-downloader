"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const const_1 = require("node-novel-info/lib/const");
const jsdom_extra_1 = require("jsdom-extra");
const jsdom_url_1 = require("jsdom-url");
const index_1 = require("../index");
const index_2 = require("../index");
const NovelSiteDemo = require("../demo/base");
const novel_text_1 = require("novel-text");
let NovelSiteSyosetu = class NovelSiteSyosetu extends NovelSiteDemo.NovelSite {
    constructor(options, ...argv) {
        super(options, ...argv);
        this.optionsInit.retryDelay = this.optionsInit.retryDelay || 25000;
    }
    session(optionsRuntime, url) {
        // @ts-ignore
        optionsRuntime.sessionData = optionsRuntime.sessionData || {};
        optionsRuntime.sessionData.over18 = 'yes';
        super.session(optionsRuntime, url);
        //let url = optionsRuntime[SYMBOL_CACHE].url;
        optionsRuntime.optionsJSDOM.cookieJar;
        return this;
    }
    /*
    download(url: string | URL, downloadOptions: IDownloadOptions = {})
    {
        const self = this;

        const [PATH_NOVEL_MAIN, optionsRuntime] = this.getOutputDir<IOptionsRuntime>(downloadOptions);

        console.log(optionsRuntime);

        return PromiseBluebird
            .bind(self)
            .then(async function ()
            {
                url = this.createMainUrl(url as any);

                //optionsRuntime[SYMBOL_CACHE].url = url;

                self.session(optionsRuntime, url as URL);

                let novel = await self.get_volume_list<IOptionsRuntime & IDownloadOptions>(url, optionsRuntime);

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
                                //chapter.chapter_index = (idx++);
                                idx++;

                                let file = getFilePath(self, {
                                    chapter, cid,
                                    ext: '.txt',

                                    idx,

                                    dirname,
                                    volume, vid,
                                }, optionsRuntime);

                                if (self._checkExists(optionsRuntime, file))
                                {
                                    return file;
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
                                    let url = self._createChapterUrl({
                                        novel,
                                        volume,
                                        chapter,
                                    }, optionsRuntime);

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
    */
    download(url, downloadOptions = {}) {
        return super.download(url, downloadOptions);
    }
    _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        if (!optionsRuntime.disableTxtdownload) {
            return ret.body;
        }
        return [
            ret.dom.$('#novel_p').text(),
            ret.dom.$('#novel_honbun').text(),
            ret.dom.$('#novel_a').text(),
        ].filter(function (v) {
            return v;
        }).join('\n\n==================\n\n');
    }
    _createChapterUrl({ novel, volume, chapter, }, optionsRuntime) {
        if (optionsRuntime.disableTxtdownload) {
            let url = this.makeUrl({
                chapter_id: chapter.chapter_id,
                novel_id: novel.url_data.novel_id,
            });
            return url;
        }
        return super._createChapterUrl({
            novel,
            volume,
            chapter,
        }, optionsRuntime);
    }
    _saveReadme(optionsRuntime, options = {}, ...opts) {
        options[this.IDKEY] = {
            txtdownload_id: optionsRuntime[index_1.SYMBOL_CACHE].novel.novel_syosetu_id || '',
        };
        return super._saveReadme(optionsRuntime, options, {
            options: {
                textlayout: {
                    allow_lf2: true,
                }
            },
        }, ...opts);
    }
    makeUrl(urlobj, bool) {
        let subdomain = urlobj.novel_r18 ? 'novel18' : 'ncode';
        if (urlobj.novel_pid && urlobj.chapter_id) {
            // @ts-ignore
            return new jsdom_url_1.URL(`https://${subdomain}.syosetu.com/txtdownload/dlstart/ncode/${urlobj.novel_pid}/?no=${urlobj.chapter_id}&hankaku=0&code=utf-8&kaigyo=crlf`);
        }
        let pad = (!bool && urlobj.chapter_id) ? urlobj.chapter_id : '';
        // @ts-ignore
        return new jsdom_url_1.URL(`http://${subdomain}.syosetu.com/${urlobj.novel_id}/${pad}`);
    }
    parseUrl(url) {
        let urlobj = {
            url,
            novel_pid: null,
            novel_id: null,
            chapter_id: null,
            novel_r18: null,
        };
        //url = url.toString();
        try {
            // @ts-ignore
            urlobj.url = new jsdom_url_1.URL(url);
            // @ts-ignore
            url = urlobj.url.href;
        }
        catch (e) {
            console.warn(e.toString() + ` "${url}"`);
        }
        if (typeof url != 'string') {
            // @ts-ignore
            throw new TypeError(url);
        }
        let r;
        let m;
        r = /^(n[\w]{5,6})$/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        r = /(novel18)\.syosetu\.com/;
        if (m = r.exec(url)) {
            urlobj.novel_r18 = m[1];
        }
        r = /txtdownload\/dlstart\/ncode\/(\d+)/;
        if (m = r.exec(url)) {
            urlobj.novel_pid = m[1];
            return urlobj;
        }
        r = /\.syosetu\.com\/(n\w+)(?:\/?(\d+))?/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            urlobj.chapter_id = m[2];
            return urlobj;
        }
        return urlobj;
    }
    async get_volume_list(url, optionsRuntime = {}) {
        const self = this;
        url = await this.createMainUrl(url);
        return await jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            if (!$('#novel_contents').length || $('#modal .yes #yes18').length) {
                //console.log(dom.url, dom._options);
                $('#modal .yes #yes18').click();
                dom._options.requestOptions.jar.setCookie('over18=yes; Domain=.syosetu.com; Path=/', url);
                //console.log(dom.serialize());
                return jsdom_extra_1.fromURL(url, Object.assign(optionsRuntime.optionsJSDOM, {
                //cookieJar: dom._options.requestOptions.jar._jar,
                //requestOptions: dom._options.requestOptions,
                }));
            }
            //console.log(dom._options.requestOptions.jar);
            return dom;
        })
            .then(async function (dom) {
            let novel_title = dom.$('.novel_title').text();
            let novel_author = novel_text_1.default.trim(dom
                .$('.novel_writername a, .novel_writername')
                .eq(-1)
                .text())
                .replace(/^.*作者：/, '');
            let novel_desc = dom.$('#novel_ex').text();
            let novel_publisher = self.IDKEY;
            let url_data = self.parseUrl(dom.url.href);
            let volume_list = [];
            let currentVolume;
            let table = dom.$('.index_box').find('> .chapter_title, .novel_sublist2');
            let _cache_dates = [];
            let novel_series_title;
            {
                let a = dom.$('#novel_contents .series_title').text()
                    .replace(/[\r\n\t]+|^\s+|\s+$/g, '');
                if (a) {
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
                if (dt && (m = dt.match(/ncode\/(\d+)/))) {
                    novel_syosetu_id = m[1];
                }
                else if (!optionsRuntime.disableTxtdownload) {
                    throw new Error(`官方 txt 下載功能遭禁用，或請使用 cookies 登入，或將 disableTxtdownload 設為 true`);
                }
            }
            table
                .each(function (index) {
                let tr = dom.$(this);
                if (tr.is('.chapter_title')) {
                    currentVolume = volume_list[volume_list.length] = {
                        volume_index: volume_list.length,
                        volume_title: tr.text().replace(/^\s+|\s+$/g, ''),
                        chapter_list: [],
                    };
                }
                else {
                    if (!currentVolume) {
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
                    if (da.find('span[title*="/"]').length) {
                        dd = da.find('span[title*="/"]').attr('title').replace(/改稿|^\s+|\s+$/g, '');
                    }
                    if (!dd) {
                        da.find('*').remove();
                        dd = da.text().replace(/^\s+|\s+$/g, '');
                    }
                    if (dd) {
                        chapter_date = index_2.moment(dd, 'YYYY/MM/DD HH:mm').local();
                        _cache_dates.push(chapter_date.unix());
                    }
                    let href = a.prop('href');
                    let data = self.parseUrl(href);
                    if (!data.chapter_id) {
                        if (tr.find('.bookmarker_now').length) {
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
                        console.log(new jsdom_url_1.URL(href, dom.url));
                        console.log(dom._options);
                        throw new Error();
                    }
                    else {
                        data = {
                            url: null,
                            novel_pid: novel_syosetu_id,
                            chapter_id: data.chapter_id,
                        };
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
                    });
                }
            });
            _cache_dates.sort();
            let novel_date = index_2.moment.unix(_cache_dates[_cache_dates.length - 1]).local();
            let a = await jsdom_extra_1.fromURL(`https://${url_data.novel_r18
                ? 'narou18'
                : 'narou'}.dip.jp/search.php?text=${url_data.novel_id}&novel=all&genre=all&new_genre=all&length=0&down=0&up=100`, optionsRuntime.optionsJSDOM)
                .then(function (dom) {
                let h2 = dom.$(`div:has(> h2.search:has(> a[href*="${url_data.novel_id}"]))`).eq(0);
                if (!h2.length) {
                    h2 = dom.$(`h2:has(> a[href*="${url_data.novel_id}"])`).eq(0);
                }
                if (!h2.length) {
                    //console.warn(`can not found keyword "${url_data.novel_id}", will try use title search`);
                    return jsdom_extra_1.fromURL(`https://${url_data.novel_r18
                        ? 'narou18'
                        : 'narou'}.dip.jp/search.php?text=${novel_title}&novel=all&genre=all&new_genre=all&length=0&down=0&up=100`, optionsRuntime.optionsJSDOM);
                }
                return dom;
            })
                .then(function (dom) {
                //console.log(dom.url);
                let data = {};
                let h2 = dom.$(`div:has(> h2.search:has(> a[href*="${url_data.novel_id}"]))`).eq(0);
                if (!h2.length) {
                    h2 = dom.$(`h2:has(> a[href*="${url_data.novel_id}"])`).eq(0);
                }
                let search_left = h2.siblings('.search_left').eq(0);
                let search_right = h2.siblings('.search_right').eq(0);
                if (!h2.length) {
                    //console.log(111111111111111111111);
                    console.warn(`can not found keyword for ${url_data.novel_id}`);
                    return data;
                }
                //console.log(search_left);
                //console.log(search_right);
                data.novel = {};
                data.novel.status = search_left.find('.novel_type').text().trim();
                data.novel.tags = [];
                if (data.novel.status === '完結済') {
                    data.novel.novel_status |= const_1.EnumNovelStatus.AUTHOR_DONE;
                }
                search_right.find('.keyword a')
                    .each(function (index, elem) {
                    let k = dom.$(elem)
                        .text()
                        .trim()
                        .split(/[\/\s]/)
                        .map(function (s) {
                        return s.trim();
                    })
                        .filter((v) => v);
                    data.novel.tags = data.novel.tags.concat(k);
                });
                data.link = [];
                data.link.push(`[dip.jp](${dom.url}) - 小説家になろう　更新情報検索`);
                //console.log(data);
                return data;
            })
                .catch(function (e) {
                console.error(e);
                console.error(`can't download novel extra info`);
                return {};
            });
            return Object.assign({}, a, { url: dom.url, url_data,
                novel_title,
                novel_author,
                novel_desc,
                novel_date,
                novel_publisher,
                novel_series_title,
                novel_syosetu_id,
                volume_list, checkdate: index_2.moment().local(), imgs: [] });
        });
    }
};
NovelSiteSyosetu.IDKEY = 'syosetu';
NovelSiteSyosetu = __decorate([
    index_1.staticImplements()
], NovelSiteSyosetu);
exports.NovelSiteSyosetu = NovelSiteSyosetu;
exports.default = NovelSiteSyosetu;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLHFEQUE0RDtBQU01RCw2Q0FBK0Q7QUFHL0QseUNBQWdDO0FBR2hDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFFbEMsOENBQThDO0FBQzlDLDJDQUFtQztBQWlCbkMsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBaUIsU0FBUSxhQUFhLENBQUMsU0FBUztJQUk1RCxZQUFZLE9BQXlCLEVBQUUsR0FBRyxJQUFJO1FBRTdDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUV4QixJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUM7SUFDcEUsQ0FBQztJQUVELE9BQU8sQ0FBZ0MsY0FBNkMsRUFBRSxHQUFRO1FBRTdGLGFBQWE7UUFDYixjQUFjLENBQUMsV0FBVyxHQUFHLGNBQWMsQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDO1FBQzlELGNBQWMsQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUUxQyxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUVuQyw2Q0FBNkM7UUFFN0MsY0FBYyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBRXBDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BOEpFO0lBRUYsUUFBUSxDQUFDLEdBQWlCLEVBQUUsa0JBQW9DLEVBQUU7UUFFakUs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QkFFZixrQkFBa0I7Z0JBRWxCLGdCQUFnQjtnQkFFaEIsV0FBVyxFQUVYLFNBQVMsRUFBRSxjQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFFM0IsSUFBSSxFQUFFLEVBQWMsR0FDVixDQUFDO1FBQ2IsQ0FBQyxDQUFDLENBQ0Q7SUFDSCxDQUFDO0NBRUQsQ0FBQTtBQXhwQnVCLHNCQUFLLEdBQUcsU0FBUyxDQUFDO0FBRjdCLGdCQUFnQjtJQUQ1Qix3QkFBZ0IsRUFBZ0Q7R0FDcEQsZ0JBQWdCLENBMHBCNUI7QUExcEJZLDRDQUFnQjtBQTRwQjdCLGtCQUFlLGdCQUFnQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRW51bU5vdmVsU3RhdHVzIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvL2xpYi9jb25zdCc7XHJcbmltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uLy4uL2ZldGNoJztcclxuXHJcbmltcG9ydCBmcywgeyB0cmltRmlsZW5hbWUgfSBmcm9tICdmcy1pY29udic7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCBub3ZlbEluZm8sIHsgSU1kY29uZk1ldGEgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xyXG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcclxuLy8gQHRzLWlnbm9yZVxyXG5pbXBvcnQgeyBMYXp5Q29va2llLCBMYXp5Q29va2llSmFyIH0gZnJvbSAnanNkb20tZXh0cmEnO1xyXG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xyXG5pbXBvcnQgeyBnZXRGaWxlUGF0aCwgZ2V0Vm9sdW1lUGF0aCB9IGZyb20gJy4uL2ZzJztcclxuXHJcbmltcG9ydCBOb3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgZGVmYXVsdEpTRE9NT3B0aW9ucywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xyXG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xyXG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XHJcblxyXG5pbXBvcnQgKiBhcyBOb3ZlbFNpdGVEZW1vIGZyb20gJy4uL2RlbW8vYmFzZSc7XHJcbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XHJcblxyXG5leHBvcnQgdHlwZSBJTm92ZWwgPSBOb3ZlbFNpdGVEZW1vLklOb3ZlbCAmIHtcclxuXHRub3ZlbF9zeW9zZXR1X2lkOiBzdHJpbmcsXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBJT3B0aW9uc1BsdXMgPSB7XHJcblx0LyoqXHJcblx0ICog5LiN5L2/55So5bCP6Kqq5a625o+Q5L6b55qEIHR4dCDkuIvovInpgKPntZBcclxuXHQgKi9cclxuXHRkaXNhYmxlVHh0ZG93bmxvYWQ/OiBib29sZWFuLFxyXG59XHJcblxyXG5leHBvcnQgdHlwZSBJRG93bmxvYWRPcHRpb25zID0gTm92ZWxTaXRlRGVtby5JRG93bmxvYWRPcHRpb25zICYgSU9wdGlvbnNQbHVzXHJcbmV4cG9ydCB0eXBlIElPcHRpb25zUnVudGltZSA9IE5vdmVsU2l0ZURlbW8uSU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucyAmIElPcHRpb25zUGx1c1xyXG5cclxuQHN0YXRpY0ltcGxlbWVudHM8Tm92ZWxTaXRlLklOb3ZlbFNpdGVTdGF0aWM8Tm92ZWxTaXRlU3lvc2V0dT4+KClcclxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZVN5b3NldHUgZXh0ZW5kcyBOb3ZlbFNpdGVEZW1vLk5vdmVsU2l0ZVxyXG57XHJcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWSA9ICdzeW9zZXR1JztcclxuXHJcblx0Y29uc3RydWN0b3Iob3B0aW9uczogSURvd25sb2FkT3B0aW9ucywgLi4uYXJndilcclxuXHR7XHJcblx0XHRzdXBlcihvcHRpb25zLCAuLi5hcmd2KTtcclxuXHJcblx0XHR0aGlzLm9wdGlvbnNJbml0LnJldHJ5RGVsYXkgPSB0aGlzLm9wdGlvbnNJbml0LnJldHJ5RGVsYXkgfHwgMjUwMDA7XHJcblx0fVxyXG5cclxuXHRzZXNzaW9uPFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4sIHVybDogVVJMKVxyXG5cdHtcclxuXHRcdC8vIEB0cy1pZ25vcmVcclxuXHRcdG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhID0gb3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEgfHwge307XHJcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YS5vdmVyMTggPSAneWVzJztcclxuXHJcblx0XHRzdXBlci5zZXNzaW9uKG9wdGlvbnNSdW50aW1lLCB1cmwpO1xyXG5cclxuXHRcdC8vbGV0IHVybCA9IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0udXJsO1xyXG5cclxuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXJcclxuXHRcdFx0Ly8uc2V0Q29va2llU3luYygnb3ZlcjE4PXllczsgRG9tYWluPS5zeW9zZXR1LmNvbTsgUGF0aD0vJywgdXJsLmhyZWYpXHJcblx0XHQ7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cclxuXHQvKlxyXG5cdGRvd25sb2FkKHVybDogc3RyaW5nIHwgVVJMLCBkb3dubG9hZE9wdGlvbnM6IElEb3dubG9hZE9wdGlvbnMgPSB7fSlcclxuXHR7XHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHJcblx0XHRjb25zdCBbUEFUSF9OT1ZFTF9NQUlOLCBvcHRpb25zUnVudGltZV0gPSB0aGlzLmdldE91dHB1dERpcjxJT3B0aW9uc1J1bnRpbWU+KGRvd25sb2FkT3B0aW9ucyk7XHJcblxyXG5cdFx0Y29uc29sZS5sb2cob3B0aW9uc1J1bnRpbWUpO1xyXG5cclxuXHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcclxuXHRcdFx0LmJpbmQoc2VsZilcclxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHVybCA9IHRoaXMuY3JlYXRlTWFpblVybCh1cmwgYXMgYW55KTtcclxuXHJcblx0XHRcdFx0Ly9vcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnVybCA9IHVybDtcclxuXHJcblx0XHRcdFx0c2VsZi5zZXNzaW9uKG9wdGlvbnNSdW50aW1lLCB1cmwgYXMgVVJMKTtcclxuXHJcblx0XHRcdFx0bGV0IG5vdmVsID0gYXdhaXQgc2VsZi5nZXRfdm9sdW1lX2xpc3Q8SU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4odXJsLCBvcHRpb25zUnVudGltZSk7XHJcblxyXG5cdFx0XHRcdC8vY29uc29sZS5sb2cobm92ZWwpO1xyXG5cclxuXHRcdFx0XHRsZXQgaWR4ID0gZG93bmxvYWRPcHRpb25zLnN0YXJ0SW5kZXggfHwgMDtcclxuXHJcblx0XHRcdFx0bGV0IHBhdGhfbm92ZWwgPSBwYXRoLmpvaW4oc2VsZi5QQVRIX05PVkVMX01BSU4sXHJcblx0XHRcdFx0XHRgJHtzZWxmLnRyaW1GaWxlbmFtZU5vdmVsKG5vdmVsLm5vdmVsX3RpdGxlKX1fKCR7bm92ZWwudXJsX2RhdGEubm92ZWxfaWR9KWBcclxuXHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsID0gbm92ZWw7XHJcblx0XHRcdFx0b3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5wYXRoX25vdmVsID0gcGF0aF9ub3ZlbDtcclxuXHJcblx0XHRcdFx0bGV0IHJldCA9IGF3YWl0IFByb21pc2VCbHVlYmlyZFxyXG5cdFx0XHRcdFx0Lm1hcFNlcmllcyhub3ZlbC52b2x1bWVfbGlzdCwgZnVuY3Rpb24gKHZvbHVtZSwgdmlkKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRsZXQgZGlybmFtZSA9IGdldFZvbHVtZVBhdGgoc2VsZiwge1xyXG5cdFx0XHRcdFx0XHRcdHBhdGhfbm92ZWwsXHJcblx0XHRcdFx0XHRcdFx0dm9sdW1lLCB2aWRcclxuXHRcdFx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xyXG5cclxuXHRcdFx0XHRcdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxyXG5cdFx0XHRcdFx0XHRcdC5tYXBTZXJpZXModm9sdW1lLmNoYXB0ZXJfbGlzdCwgYXN5bmMgZnVuY3Rpb24gKGNoYXB0ZXIsIGNpZClcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHQvL2NoYXB0ZXIuY2hhcHRlcl9pbmRleCA9IChpZHgrKyk7XHJcblx0XHRcdFx0XHRcdFx0XHRpZHgrKztcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRsZXQgZmlsZSA9IGdldEZpbGVQYXRoKHNlbGYsIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlciwgY2lkLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRleHQ6ICcudHh0JyxcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRcdGlkeCxcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRcdGRpcm5hbWUsXHJcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZSwgdmlkLFxyXG5cdFx0XHRcdFx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdGlmIChzZWxmLl9jaGVja0V4aXN0cyhvcHRpb25zUnVudGltZSwgZmlsZSkpXHJcblx0XHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBmaWxlO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRcdGxldCBmbjtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUuZGlzYWJsZURvd25sb2FkKVxyXG5cdFx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRmbiA9IGFzeW5jIGZ1bmN0aW9uICgpXHJcblx0XHRcdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gJyc7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH07XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHRlbHNlIGlmICghb3B0aW9uc1J1bnRpbWUuZGlzYWJsZVR4dGRvd25sb2FkKVxyXG5cdFx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRmbiA9IGZ1bmN0aW9uICgpXHJcblx0XHRcdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcmV0cnlSZXF1ZXN0KGNoYXB0ZXIuY2hhcHRlcl91cmwsIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRlbGF5OiAyNTAwMCxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGphcjogb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphcixcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgdXJsID0gc2VsZi5fY3JlYXRlQ2hhcHRlclVybCh7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bm92ZWwsXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXIsXHJcblx0XHRcdFx0XHRcdFx0XHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2codXJsKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRcdGZuID0gZnVuY3Rpb24gKClcclxuXHRcdFx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbSlcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIFtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkb20uJCgnI25vdmVsX3AnKS50ZXh0KCksXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZG9tLiQoJyNub3ZlbF9ob25idW4nKS50ZXh0KCksXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZG9tLiQoJyNub3ZlbF9hJykudGV4dCgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRdLmZpbHRlcihmdW5jdGlvbiAodilcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiB2O1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9KS5qb2luKCdcXG5cXG49PT09PT09PT09PT09PT09PT1cXG5cXG4nKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH07XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyh1cmwpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IFByb21pc2VCbHVlYmlyZC5yZXNvbHZlKCkudGhlbihmdW5jdGlvbiAoKVxyXG5cdFx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZm4oKVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uICh0ZXh0KVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGF3YWl0IGZzLm91dHB1dEZpbGUoZmlsZSwgdGV4dCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRleHQ7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ7XHJcblx0XHRcdFx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZmlsZTtcclxuXHRcdFx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0XHRcdDtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHQudGFwKGxzID0+XHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdGxldCBmaWxlID0gcGF0aC5qb2luKHBhdGhfbm92ZWwsXHJcblx0XHRcdFx0XHRcdFx0YCR7c2VsZi50cmltRmlsZW5hbWVOb3ZlbChub3ZlbC5ub3ZlbF90aXRsZSl9LiR7bm92ZWwudXJsX2RhdGEubm92ZWxfaWR9Lmpzb25gXHJcblx0XHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0XHQ7XHJcblxyXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGxzKTtcclxuXHJcblx0XHRcdFx0XHRcdHJldHVybiBmcy5vdXRwdXRKU09OKGZpbGUsIG5vdmVsLCB7XHJcblx0XHRcdFx0XHRcdFx0c3BhY2VzOiBcIlxcdFwiLFxyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0O1xyXG5cclxuXHRcdFx0XHRhd2FpdCBzZWxmLl9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lKTtcclxuXHJcblx0XHRcdFx0cmV0dXJuIG5vdmVsO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuZmluYWxseShmdW5jdGlvbiAoKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0aWYgKDApXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0Y29uc29sZS5kaXIoKG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSBhcyBJRnJvbVVybE9wdGlvbnMpLmNvb2tpZUphciwge1xyXG5cdFx0XHRcdFx0XHRkZXB0aDogbnVsbCxcclxuXHRcdFx0XHRcdFx0Y29sb3JzOiB0cnVlLFxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0fSlcclxuXHRcdFx0O1xyXG5cdH1cclxuXHQqL1xyXG5cclxuXHRkb3dubG9hZCh1cmw6IHN0cmluZyB8IFVSTCwgZG93bmxvYWRPcHRpb25zOiBJRG93bmxvYWRPcHRpb25zID0ge30pXHJcblx0e1xyXG5cdFx0cmV0dXJuIHN1cGVyLmRvd25sb2FkKHVybCwgZG93bmxvYWRPcHRpb25zKTtcclxuXHR9XHJcblxyXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldCwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlKTogc3RyaW5nXHJcblx0e1xyXG5cdFx0aWYgKCFyZXQpXHJcblx0XHR7XHJcblx0XHRcdHJldHVybiAnJztcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLmRpc2FibGVUeHRkb3dubG9hZClcclxuXHRcdHtcclxuXHRcdFx0cmV0dXJuIHJldC5ib2R5O1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBbXHJcblx0XHRcdHJldC5kb20uJCgnI25vdmVsX3AnKS50ZXh0KCksXHJcblx0XHRcdHJldC5kb20uJCgnI25vdmVsX2hvbmJ1bicpLnRleHQoKSxcclxuXHRcdFx0cmV0LmRvbS4kKCcjbm92ZWxfYScpLnRleHQoKSxcclxuXHRcdF0uZmlsdGVyKGZ1bmN0aW9uICh2KVxyXG5cdFx0e1xyXG5cdFx0XHRyZXR1cm4gdjtcclxuXHRcdH0pLmpvaW4oJ1xcblxcbj09PT09PT09PT09PT09PT09PVxcblxcbicpO1xyXG5cdH1cclxuXHJcblx0cHJvdGVjdGVkIF9jcmVhdGVDaGFwdGVyVXJsPFQgPSBJT3B0aW9uc1J1bnRpbWUgJiBJRG93bmxvYWRPcHRpb25zPih7XHJcblx0XHRub3ZlbCxcclxuXHRcdHZvbHVtZSxcclxuXHRcdGNoYXB0ZXIsXHJcblx0fToge1xyXG5cdFx0bm92ZWw6IE5vdmVsU2l0ZS5JTm92ZWwsXHJcblx0XHR2b2x1bWU6IE5vdmVsU2l0ZS5JVm9sdW1lLFxyXG5cdFx0Y2hhcHRlcjogTm92ZWxTaXRlLklDaGFwdGVyLFxyXG5cdH0sIG9wdGlvbnNSdW50aW1lPzogVCAmIElPcHRpb25zUnVudGltZSk6IFVSTFxyXG5cdHtcclxuXHRcdGlmIChvcHRpb25zUnVudGltZS5kaXNhYmxlVHh0ZG93bmxvYWQpXHJcblx0XHR7XHJcblx0XHRcdGxldCB1cmwgPSB0aGlzLm1ha2VVcmwoe1xyXG5cdFx0XHRcdGNoYXB0ZXJfaWQ6IGNoYXB0ZXIuY2hhcHRlcl9pZCxcclxuXHRcdFx0XHRub3ZlbF9pZDogbm92ZWwudXJsX2RhdGEubm92ZWxfaWQsXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIHVybDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gc3VwZXIuX2NyZWF0ZUNoYXB0ZXJVcmwoe1xyXG5cdFx0XHRub3ZlbCxcclxuXHRcdFx0dm9sdW1lLFxyXG5cdFx0XHRjaGFwdGVyLFxyXG5cdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xyXG5cdH1cclxuXHJcblx0cHJvdGVjdGVkIF9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMgPSB7fSwgLi4ub3B0cylcclxuXHR7XHJcblx0XHRvcHRpb25zW3RoaXMuSURLRVldID0ge1xyXG5cdFx0XHR0eHRkb3dubG9hZF9pZDogb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbC5ub3ZlbF9zeW9zZXR1X2lkIHx8ICcnLFxyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gc3VwZXIuX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMsIHtcclxuXHRcdFx0b3B0aW9uczoge1xyXG5cdFx0XHRcdHRleHRsYXlvdXQ6IHtcclxuXHRcdFx0XHRcdGFsbG93X2xmMjogdHJ1ZSxcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHR9LCAuLi5vcHRzKTtcclxuXHR9XHJcblxyXG5cdG1ha2VVcmwodXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sID86IGJvb2xlYW4pOiBVUkxcclxuXHR7XHJcblx0XHRsZXQgc3ViZG9tYWluID0gdXJsb2JqLm5vdmVsX3IxOCA/ICdub3ZlbDE4JyA6ICduY29kZSc7XHJcblxyXG5cdFx0aWYgKHVybG9iai5ub3ZlbF9waWQgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpXHJcblx0XHR7XHJcblx0XHRcdC8vIEB0cy1pZ25vcmVcclxuXHRcdFx0cmV0dXJuIG5ldyBVUkwoYGh0dHBzOi8vJHtzdWJkb21haW59LnN5b3NldHUuY29tL3R4dGRvd25sb2FkL2Rsc3RhcnQvbmNvZGUvJHt1cmxvYmoubm92ZWxfcGlkfS8/bm89JHt1cmxvYmouY2hhcHRlcl9pZH0maGFua2FrdT0wJmNvZGU9dXRmLTgma2FpZ3lvPWNybGZgKTtcclxuXHRcdH1cclxuXHJcblx0XHRsZXQgcGFkID0gKCFib29sICYmIHVybG9iai5jaGFwdGVyX2lkKSA/IHVybG9iai5jaGFwdGVyX2lkIDogJyc7XHJcblxyXG5cdFx0Ly8gQHRzLWlnbm9yZVxyXG5cdFx0cmV0dXJuIG5ldyBVUkwoYGh0dHA6Ly8ke3N1YmRvbWFpbn0uc3lvc2V0dS5jb20vJHt1cmxvYmoubm92ZWxfaWR9LyR7cGFkfWApO1xyXG5cdH1cclxuXHJcblx0cGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwpOiBOb3ZlbFNpdGUuSVBhcnNlVXJsXHJcblx0e1xyXG5cdFx0bGV0IHVybG9iaiA9IHtcclxuXHRcdFx0dXJsLFxyXG5cclxuXHRcdFx0bm92ZWxfcGlkOiBudWxsLFxyXG5cdFx0XHRub3ZlbF9pZDogbnVsbCxcclxuXHRcdFx0Y2hhcHRlcl9pZDogbnVsbCxcclxuXHJcblx0XHRcdG5vdmVsX3IxODogbnVsbCxcclxuXHRcdH07XHJcblxyXG5cdFx0Ly91cmwgPSB1cmwudG9TdHJpbmcoKTtcclxuXHJcblx0XHR0cnlcclxuXHRcdHtcclxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxyXG5cdFx0XHR1cmxvYmoudXJsID0gbmV3IFVSTCh1cmwpO1xyXG5cdFx0XHQvLyBAdHMtaWdub3JlXHJcblx0XHRcdHVybCA9IHVybG9iai51cmwuaHJlZjtcclxuXHRcdH1cclxuXHRcdGNhdGNoIChlKVxyXG5cdFx0e1xyXG5cdFx0XHRjb25zb2xlLndhcm4oZS50b1N0cmluZygpICsgYCBcIiR7dXJsfVwiYCk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHR5cGVvZiB1cmwgIT0gJ3N0cmluZycpXHJcblx0XHR7XHJcblx0XHRcdC8vIEB0cy1pZ25vcmVcclxuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcih1cmwpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCByOiBSZWdFeHA7XHJcblx0XHRsZXQgbTtcclxuXHJcblx0XHRyID0gL14obltcXHddezUsNn0pJC87XHJcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxyXG5cdFx0e1xyXG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xyXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xyXG5cdFx0fVxyXG5cclxuXHRcdHIgPSAvKG5vdmVsMTgpXFwuc3lvc2V0dVxcLmNvbS87XHJcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxyXG5cdFx0e1xyXG5cdFx0XHR1cmxvYmoubm92ZWxfcjE4ID0gbVsxXTtcclxuXHRcdH1cclxuXHJcblx0XHRyID0gL3R4dGRvd25sb2FkXFwvZGxzdGFydFxcL25jb2RlXFwvKFxcZCspLztcclxuXHRcdGlmIChtID0gci5leGVjKHVybCkpXHJcblx0XHR7XHJcblx0XHRcdHVybG9iai5ub3ZlbF9waWQgPSBtWzFdO1xyXG5cclxuXHRcdFx0cmV0dXJuIHVybG9iajtcclxuXHRcdH1cclxuXHJcblx0XHRyID0gL1xcLnN5b3NldHVcXC5jb21cXC8oblxcdyspKD86XFwvPyhcXGQrKSk/LztcclxuXHRcdGlmIChtID0gci5leGVjKHVybCkpXHJcblx0XHR7XHJcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XHJcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVsyXTtcclxuXHJcblx0XHRcdHJldHVybiB1cmxvYmo7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHVybG9iajtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4odXJsOiBzdHJpbmcgfCBVUkwsXHJcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fVxyXG5cdCk6IFByb21pc2U8SU5vdmVsPlxyXG5cdHtcclxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cclxuXHRcdHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybCh1cmwgYXMgYW55KTtcclxuXHJcblx0XHRyZXR1cm4gYXdhaXQgZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcclxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xyXG5cclxuXHRcdFx0XHRpZiAoISQoJyNub3ZlbF9jb250ZW50cycpLmxlbmd0aCB8fCAkKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5sZW5ndGgpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb20udXJsLCBkb20uX29wdGlvbnMpO1xyXG5cclxuXHRcdFx0XHRcdCQoJyNtb2RhbCAueWVzICN5ZXMxOCcpLmNsaWNrKCk7XHJcblxyXG5cdFx0XHRcdFx0ZG9tLl9vcHRpb25zLnJlcXVlc3RPcHRpb25zLmphci5zZXRDb29raWUoJ292ZXIxOD15ZXM7IERvbWFpbj0uc3lvc2V0dS5jb207IFBhdGg9LycsIHVybCk7XHJcblxyXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb20uc2VyaWFsaXplKCkpO1xyXG5cclxuXHRcdFx0XHRcdHJldHVybiBmcm9tVVJMKHVybCwgT2JqZWN0LmFzc2lnbihvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00sIHtcclxuXHJcblx0XHRcdFx0XHRcdC8vY29va2llSmFyOiBkb20uX29wdGlvbnMucmVxdWVzdE9wdGlvbnMuamFyLl9qYXIsXHJcblx0XHRcdFx0XHRcdC8vcmVxdWVzdE9wdGlvbnM6IGRvbS5fb3B0aW9ucy5yZXF1ZXN0T3B0aW9ucyxcclxuXHJcblx0XHRcdFx0XHR9IGFzIElGcm9tVXJsT3B0aW9ucykpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb20uX29wdGlvbnMucmVxdWVzdE9wdGlvbnMuamFyKTtcclxuXHJcblx0XHRcdFx0cmV0dXJuIGRvbTtcclxuXHRcdFx0fSlcclxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gZG9tLiQoJy5ub3ZlbF90aXRsZScpLnRleHQoKTtcclxuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yID0gbm92ZWxUZXh0LnRyaW0oZG9tXHJcblx0XHRcdFx0XHQuJCgnLm5vdmVsX3dyaXRlcm5hbWUgYSwgLm5vdmVsX3dyaXRlcm5hbWUnKVxyXG5cdFx0XHRcdFx0LmVxKC0xKVxyXG5cdFx0XHRcdFx0LnRleHQoKSlcclxuXHRcdFx0XHRcdC5yZXBsYWNlKC9eLirkvZzogIXvvJovLCAnJylcclxuXHRcdFx0XHQ7XHJcblxyXG5cdFx0XHRcdGxldCBub3ZlbF9kZXNjID0gZG9tLiQoJyNub3ZlbF9leCcpLnRleHQoKTtcclxuXHJcblx0XHRcdFx0bGV0IG5vdmVsX3B1Ymxpc2hlciA9IHNlbGYuSURLRVk7XHJcblxyXG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwoZG9tLnVybC5ocmVmKTtcclxuXHJcblx0XHRcdFx0bGV0IHZvbHVtZV9saXN0ID0gW10gYXMgTm92ZWxTaXRlLklWb2x1bWVbXTtcclxuXHJcblx0XHRcdFx0bGV0IGN1cnJlbnRWb2x1bWU6IE5vdmVsU2l0ZS5JVm9sdW1lO1xyXG5cclxuXHRcdFx0XHRsZXQgdGFibGUgPSBkb20uJCgnLmluZGV4X2JveCcpLmZpbmQoJz4gLmNoYXB0ZXJfdGl0bGUsIC5ub3ZlbF9zdWJsaXN0MicpO1xyXG5cclxuXHRcdFx0XHRsZXQgX2NhY2hlX2RhdGVzID0gW107XHJcblxyXG5cdFx0XHRcdGxldCBub3ZlbF9zZXJpZXNfdGl0bGU7XHJcblxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGxldCBhID0gZG9tLiQoJyNub3ZlbF9jb250ZW50cyAuc2VyaWVzX3RpdGxlJykudGV4dCgpXHJcblx0XHRcdFx0XHRcdC5yZXBsYWNlKC9bXFxyXFxuXFx0XSt8Xlxccyt8XFxzKyQvZywgJycpXHJcblx0XHRcdFx0XHQ7XHJcblx0XHRcdFx0XHRpZiAoYSlcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0bm92ZWxfc2VyaWVzX3RpdGxlID0gYTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGxldCBub3ZlbF9zeW9zZXR1X2lkO1xyXG5cclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRsZXQgJCA9IGRvbS4kO1xyXG5cclxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coZG9tLnNlcmlhbGl6ZSgpKTtcclxuXHJcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKCQoJyNub3ZlbF9mb290ZXInKSk7XHJcblxyXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygkKCcjbm92ZWxfZm9vdGVyJykuZmluZCgnLnVuZGVybmF2aSBhW2hyZWYqPVwidHh0ZG93bmxvYWRcIl0nKSk7XHJcblxyXG5cdFx0XHRcdFx0bGV0IG07XHJcblx0XHRcdFx0XHRsZXQgZHQgPSBkb20uJCgnI25vdmVsX2Zvb3RlciAudW5kZXJuYXZpIGFbaHJlZio9XCJ0eHRkb3dubG9hZFwiXScpLnByb3AoJ2hyZWYnKTtcclxuXHJcblx0XHRcdFx0XHRpZiAoZHQgJiYgKG0gPSBkdC5tYXRjaCgvbmNvZGVcXC8oXFxkKykvKSkpXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdG5vdmVsX3N5b3NldHVfaWQgPSBtWzFdO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoIW9wdGlvbnNSdW50aW1lLmRpc2FibGVUeHRkb3dubG9hZClcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGDlrpjmlrkgdHh0IOS4i+i8ieWKn+iDvemBreemgeeUqO+8jOaIluiri+S9v+eUqCBjb29raWVzIOeZu+WFpe+8jOaIluWwhyBkaXNhYmxlVHh0ZG93bmxvYWQg6Kit54K6IHRydWVgKVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dGFibGVcclxuXHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleClcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0bGV0IHRyID0gZG9tLiQodGhpcyk7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAodHIuaXMoJy5jaGFwdGVyX3RpdGxlJykpXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcclxuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxyXG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiB0ci50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLFxyXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9saXN0OiBbXSxcclxuXHRcdFx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGlmICghY3VycmVudFZvbHVtZSlcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiB2b2x1bWVfbGlzdC5sZW5ndGgsXHJcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZTogJ251bGwnLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxyXG5cdFx0XHRcdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdGxldCBhID0gdHIuZmluZCgnLnN1YnRpdGxlIGEnKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfZGF0ZTtcclxuXHRcdFx0XHRcdFx0XHRsZXQgZGQ7XHJcblx0XHRcdFx0XHRcdFx0bGV0IGRhID0gdHIuZmluZCgnLmxvbmdfdXBkYXRlJyk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmIChkYS5maW5kKCdzcGFuW3RpdGxlKj1cIi9cIl0nKS5sZW5ndGgpXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGQgPSBkYS5maW5kKCdzcGFuW3RpdGxlKj1cIi9cIl0nKS5hdHRyKCd0aXRsZScpLnJlcGxhY2UoL+aUueeov3xeXFxzK3xcXHMrJC9nLCAnJyk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoIWRkKVxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGRhLmZpbmQoJyonKS5yZW1vdmUoKTtcclxuXHRcdFx0XHRcdFx0XHRcdGRkID0gZGEudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmIChkZClcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2RhdGUgPSBtb21lbnQoZGQsICdZWVlZL01NL0REIEhIOm1tJykubG9jYWwoKTtcclxuXHRcdFx0XHRcdFx0XHRcdF9jYWNoZV9kYXRlcy5wdXNoKGNoYXB0ZXJfZGF0ZS51bml4KCkpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0bGV0IGhyZWYgPSBhLnByb3AoJ2hyZWYnKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0bGV0IGRhdGEgPSBzZWxmLnBhcnNlVXJsKGhyZWYpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoIWRhdGEuY2hhcHRlcl9pZClcclxuXHRcdFx0XHRcdFx0XHR7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHRyLmZpbmQoJy5ib29rbWFya2VyX25vdycpLmxlbmd0aClcclxuXHRcdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0LyoqXHJcblx0XHRcdFx0XHRcdFx0XHRcdCAqIGZpeCBodHRwczovL25jb2RlLnN5b3NldHUuY29tL243NjM3ZGovXHJcblx0XHRcdFx0XHRcdFx0XHRcdCAqL1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2codHIucHJvcChcIm91dGVySFRNTFwiKSk7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhLnByb3AoXCJvdXRlckhUTUxcIikpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYSk7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGhyZWYpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYS5hdHRyKCdocmVmJykpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2cobmV3IFVSTChocmVmLCBkb20udXJsKSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZG9tLl9vcHRpb25zKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YSA9IHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dXJsOiBudWxsLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRub3ZlbF9waWQ6IG5vdmVsX3N5b3NldHVfaWQgYXMgc3RyaW5nLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQgYXMgc3RyaW5nLFxyXG5cdFx0XHRcdFx0XHRcdFx0fSBhcyBhbnk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0aHJlZiA9IHNlbGYubWFrZVVybChkYXRhKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRkYXRhLnVybCA9IGhyZWY7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lXHJcblx0XHRcdFx0XHRcdFx0XHQuY2hhcHRlcl9saXN0XHJcblx0XHRcdFx0XHRcdFx0XHQucHVzaCh7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaW5kZXg6IGN1cnJlbnRWb2x1bWUuY2hhcHRlcl9saXN0Lmxlbmd0aCxcclxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZTogYS50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsOiBocmVmLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhOiBkYXRhLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2RhdGUsXHJcblx0XHRcdFx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0XHRcdDtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHQ7XHJcblxyXG5cdFx0XHRcdF9jYWNoZV9kYXRlcy5zb3J0KCk7XHJcblxyXG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlID0gbW9tZW50LnVuaXgoX2NhY2hlX2RhdGVzW19jYWNoZV9kYXRlcy5sZW5ndGggLSAxXSkubG9jYWwoKTtcclxuXHJcblx0XHRcdFx0bGV0IGEgPSBhd2FpdCBmcm9tVVJMKGBodHRwczovLyR7dXJsX2RhdGEubm92ZWxfcjE4XHJcblx0XHRcdFx0XHQ/ICduYXJvdTE4J1xyXG5cdFx0XHRcdFx0OiAnbmFyb3UnfS5kaXAuanAvc2VhcmNoLnBocD90ZXh0PSR7dXJsX2RhdGEubm92ZWxfaWR9Jm5vdmVsPWFsbCZnZW5yZT1hbGwmbmV3X2dlbnJlPWFsbCZsZW5ndGg9MCZkb3duPTAmdXA9MTAwYCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxyXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKGRvbSlcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0bGV0IGgyID0gZG9tLiQoYGRpdjpoYXMoPiBoMi5zZWFyY2g6aGFzKD4gYVtocmVmKj1cIiR7dXJsX2RhdGEubm92ZWxfaWR9XCJdKSlgKS5lcSgwKTtcclxuXHJcblx0XHRcdFx0XHRcdGlmICghaDIubGVuZ3RoKVxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0aDIgPSBkb20uJChgaDI6aGFzKD4gYVtocmVmKj1cIiR7dXJsX2RhdGEubm92ZWxfaWR9XCJdKWApLmVxKDApO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdC8vY29uc29sZS53YXJuKGBjYW4gbm90IGZvdW5kIGtleXdvcmQgXCIke3VybF9kYXRhLm5vdmVsX2lkfVwiLCB3aWxsIHRyeSB1c2UgdGl0bGUgc2VhcmNoYCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdHJldHVybiBmcm9tVVJMKGBodHRwczovLyR7dXJsX2RhdGEubm92ZWxfcjE4XHJcblx0XHRcdFx0XHRcdFx0XHQ/ICduYXJvdTE4J1xyXG5cdFx0XHRcdFx0XHRcdFx0OiAnbmFyb3UnfS5kaXAuanAvc2VhcmNoLnBocD90ZXh0PSR7bm92ZWxfdGl0bGV9Jm5vdmVsPWFsbCZnZW5yZT1hbGwmbmV3X2dlbnJlPWFsbCZsZW5ndGg9MCZkb3duPTAmdXA9MTAwYCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxyXG5cdFx0XHRcdFx0XHRcdFx0O1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZG9tO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb20pXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coZG9tLnVybCk7XHJcblxyXG5cdFx0XHRcdFx0XHRsZXQgZGF0YTogSU1kY29uZk1ldGEgPSB7fTtcclxuXHJcblx0XHRcdFx0XHRcdGxldCBoMiA9IGRvbS4kKGBkaXY6aGFzKD4gaDIuc2VhcmNoOmhhcyg+IGFbaHJlZio9XCIke3VybF9kYXRhLm5vdmVsX2lkfVwiXSkpYCkuZXEoMCk7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGgyID0gZG9tLiQoYGgyOmhhcyg+IGFbaHJlZio9XCIke3VybF9kYXRhLm5vdmVsX2lkfVwiXSlgKS5lcSgwKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0bGV0IHNlYXJjaF9sZWZ0ID0gaDIuc2libGluZ3MoJy5zZWFyY2hfbGVmdCcpLmVxKDApO1xyXG5cdFx0XHRcdFx0XHRsZXQgc2VhcmNoX3JpZ2h0ID0gaDIuc2libGluZ3MoJy5zZWFyY2hfcmlnaHQnKS5lcSgwKTtcclxuXHJcblx0XHRcdFx0XHRcdGlmICghaDIubGVuZ3RoKVxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygxMTExMTExMTExMTExMTExMTExMTEpO1xyXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUud2FybihgY2FuIG5vdCBmb3VuZCBrZXl3b3JkIGZvciAke3VybF9kYXRhLm5vdmVsX2lkfWApO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZGF0YTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhzZWFyY2hfbGVmdCk7XHJcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coc2VhcmNoX3JpZ2h0KTtcclxuXHJcblx0XHRcdFx0XHRcdGRhdGEubm92ZWwgPSB7fTtcclxuXHJcblx0XHRcdFx0XHRcdGRhdGEubm92ZWwuc3RhdHVzID0gc2VhcmNoX2xlZnQuZmluZCgnLm5vdmVsX3R5cGUnKS50ZXh0KCkudHJpbSgpO1xyXG5cdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MgPSBbXTtcclxuXHJcblx0XHRcdFx0XHRcdGlmIChkYXRhLm5vdmVsLnN0YXR1cyA9PT0gJ+WujOe1kOa4iCcpXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRkYXRhLm5vdmVsLm5vdmVsX3N0YXR1cyB8PSBFbnVtTm92ZWxTdGF0dXMuQVVUSE9SX0RPTkU7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdHNlYXJjaF9yaWdodC5maW5kKCcua2V5d29yZCBhJylcclxuXHRcdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0bGV0IGsgPSBkb20uJChlbGVtKVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQudGV4dCgpXHJcblx0XHRcdFx0XHRcdFx0XHRcdC50cmltKClcclxuXHRcdFx0XHRcdFx0XHRcdFx0LnNwbGl0KC9bXFwvXFxzXS8pXHJcblx0XHRcdFx0XHRcdFx0XHRcdC5tYXAoZnVuY3Rpb24gKHMpXHJcblx0XHRcdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcy50cmltKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHRcdFx0XHRcdC5maWx0ZXIoKHYpID0+IHYpXHJcblx0XHRcdFx0XHRcdFx0XHQ7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzID0gZGF0YS5ub3ZlbC50YWdzLmNvbmNhdChrKTtcclxuXHRcdFx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0XHQ7XHJcblxyXG5cdFx0XHRcdFx0XHRkYXRhLmxpbmsgPSBbXTtcclxuXHJcblx0XHRcdFx0XHRcdGRhdGEubGluay5wdXNoKGBbZGlwLmpwXSgke2RvbS51cmx9KSAtIOWwj+iqrOWutuOBq+OBquOCjeOBhuOAgOabtOaWsOaDheWgseaknOe0omApO1xyXG5cclxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkYXRhKTtcclxuXHJcblx0XHRcdFx0XHRcdHJldHVybiBkYXRhO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZSlcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcihlKTtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcihgY2FuJ3QgZG93bmxvYWQgbm92ZWwgZXh0cmEgaW5mb2ApO1xyXG5cclxuXHRcdFx0XHRcdFx0cmV0dXJuIHt9O1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHQ7XHJcblxyXG5cdFx0XHRcdHJldHVybiB7XHJcblxyXG5cdFx0XHRcdFx0Li4uYSxcclxuXHJcblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXHJcblx0XHRcdFx0XHR1cmxfZGF0YSxcclxuXHJcblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcclxuXHRcdFx0XHRcdG5vdmVsX2F1dGhvcixcclxuXHJcblx0XHRcdFx0XHRub3ZlbF9kZXNjLFxyXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSxcclxuXHRcdFx0XHRcdG5vdmVsX3B1Ymxpc2hlcixcclxuXHJcblx0XHRcdFx0XHRub3ZlbF9zZXJpZXNfdGl0bGUsXHJcblxyXG5cdFx0XHRcdFx0bm92ZWxfc3lvc2V0dV9pZCxcclxuXHJcblx0XHRcdFx0XHR2b2x1bWVfbGlzdCxcclxuXHJcblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXHJcblxyXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXHJcblx0XHRcdFx0fSBhcyBJTm92ZWw7XHJcblx0XHRcdH0pXHJcblx0XHRcdDtcclxuXHR9XHJcblxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVTeW9zZXR1O1xyXG5cclxuIl19