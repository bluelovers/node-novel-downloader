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
            txtdownload_id: optionsRuntime[index_1.SYMBOL_CACHE].novel.novel_syosetu_id,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLHFEQUE0RDtBQU01RCw2Q0FBK0Q7QUFHL0QseUNBQWdDO0FBR2hDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFFbEMsOENBQThDO0FBQzlDLDJDQUFtQztBQWlCbkMsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBaUIsU0FBUSxhQUFhLENBQUMsU0FBUztJQUk1RCxZQUFZLE9BQXlCLEVBQUUsR0FBRyxJQUFJO1FBRTdDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUV4QixJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUM7SUFDcEUsQ0FBQztJQUVELE9BQU8sQ0FBZ0MsY0FBNkMsRUFBRSxHQUFRO1FBRTdGLGFBQWE7UUFDYixjQUFjLENBQUMsV0FBVyxHQUFHLGNBQWMsQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDO1FBQzlELGNBQWMsQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUUxQyxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUVuQyw2Q0FBNkM7UUFFN0MsY0FBYyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBRXBDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BOEpFO0lBRUYsUUFBUSxDQUFDLEdBQWlCLEVBQUUsa0JBQW9DLEVBQUU7UUFFakUs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QjtnQkFFbEIsZ0JBQWdCO2dCQUVoQixXQUFXLEVBRVgsU0FBUyxFQUFFLGNBQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxFQUUzQixJQUFJLEVBQUUsRUFBYyxHQUNWLENBQUM7UUFDYixDQUFDLENBQUMsQ0FDRDtJQUNILENBQUM7Q0FFRCxDQUFBO0FBeHBCdUIsc0JBQUssR0FBRyxTQUFTLENBQUM7QUFGN0IsZ0JBQWdCO0lBRDVCLHdCQUFnQixFQUFnRDtHQUNwRCxnQkFBZ0IsQ0EwcEI1QjtBQTFwQlksNENBQWdCO0FBNHBCN0Isa0JBQWUsZ0JBQWdCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFbnVtTm92ZWxTdGF0dXMgfSBmcm9tICdub2RlLW5vdmVsLWluZm8vbGliL2NvbnN0JztcclxuaW1wb3J0IHsgcmV0cnlSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vZmV0Y2gnO1xyXG5cclxuaW1wb3J0IGZzLCB7IHRyaW1GaWxlbmFtZSB9IGZyb20gJ2ZzLWljb252JztcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XHJcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xyXG4vLyBAdHMtaWdub3JlXHJcbmltcG9ydCB7IExhenlDb29raWUsIExhenlDb29raWVKYXIgfSBmcm9tICdqc2RvbS1leHRyYSc7XHJcbmltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XHJcbmltcG9ydCB7IGdldEZpbGVQYXRoLCBnZXRWb2x1bWVQYXRoIH0gZnJvbSAnLi4vZnMnO1xyXG5cclxuaW1wb3J0IE5vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBkZWZhdWx0SlNET01PcHRpb25zLCBTWU1CT0xfQ0FDSEUgfSBmcm9tICcuLi9pbmRleCc7XHJcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XHJcbmltcG9ydCB7IG1vbWVudCB9IGZyb20gJy4uL2luZGV4JztcclxuXHJcbmltcG9ydCAqIGFzIE5vdmVsU2l0ZURlbW8gZnJvbSAnLi4vZGVtby9iYXNlJztcclxuaW1wb3J0IG5vdmVsVGV4dCBmcm9tICdub3ZlbC10ZXh0JztcclxuXHJcbmV4cG9ydCB0eXBlIElOb3ZlbCA9IE5vdmVsU2l0ZURlbW8uSU5vdmVsICYge1xyXG5cdG5vdmVsX3N5b3NldHVfaWQ6IHN0cmluZyxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIElPcHRpb25zUGx1cyA9IHtcclxuXHQvKipcclxuXHQgKiDkuI3kvb/nlKjlsI/oqqrlrrbmj5DkvpvnmoQgdHh0IOS4i+i8iemAo+e1kFxyXG5cdCAqL1xyXG5cdGRpc2FibGVUeHRkb3dubG9hZD86IGJvb2xlYW4sXHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIElEb3dubG9hZE9wdGlvbnMgPSBOb3ZlbFNpdGVEZW1vLklEb3dubG9hZE9wdGlvbnMgJiBJT3B0aW9uc1BsdXNcclxuZXhwb3J0IHR5cGUgSU9wdGlvbnNSdW50aW1lID0gTm92ZWxTaXRlRGVtby5JT3B0aW9uc1J1bnRpbWUgJiBJRG93bmxvYWRPcHRpb25zICYgSU9wdGlvbnNQbHVzXHJcblxyXG5Ac3RhdGljSW1wbGVtZW50czxOb3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVTeW9zZXR1Pj4oKVxyXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlU3lvc2V0dSBleHRlbmRzIE5vdmVsU2l0ZURlbW8uTm92ZWxTaXRlXHJcbntcclxuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gJ3N5b3NldHUnO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihvcHRpb25zOiBJRG93bmxvYWRPcHRpb25zLCAuLi5hcmd2KVxyXG5cdHtcclxuXHRcdHN1cGVyKG9wdGlvbnMsIC4uLmFyZ3YpO1xyXG5cclxuXHRcdHRoaXMub3B0aW9uc0luaXQucmV0cnlEZWxheSA9IHRoaXMub3B0aW9uc0luaXQucmV0cnlEZWxheSB8fCAyNTAwMDtcclxuXHR9XHJcblxyXG5cdHNlc3Npb248VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiwgdXJsOiBVUkwpXHJcblx0e1xyXG5cdFx0Ly8gQHRzLWlnbm9yZVxyXG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEgPSBvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSB8fCB7fTtcclxuXHRcdG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhLm92ZXIxOCA9ICd5ZXMnO1xyXG5cclxuXHRcdHN1cGVyLnNlc3Npb24ob3B0aW9uc1J1bnRpbWUsIHVybCk7XHJcblxyXG5cdFx0Ly9sZXQgdXJsID0gb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS51cmw7XHJcblxyXG5cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphclxyXG5cdFx0XHQvLy5zZXRDb29raWVTeW5jKCdvdmVyMTg9eWVzOyBEb21haW49LnN5b3NldHUuY29tOyBQYXRoPS8nLCB1cmwuaHJlZilcclxuXHRcdDtcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblxyXG5cdC8qXHJcblx0ZG93bmxvYWQodXJsOiBzdHJpbmcgfCBVUkwsIGRvd25sb2FkT3B0aW9uczogSURvd25sb2FkT3B0aW9ucyA9IHt9KVxyXG5cdHtcclxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cclxuXHRcdGNvbnN0IFtQQVRIX05PVkVMX01BSU4sIG9wdGlvbnNSdW50aW1lXSA9IHRoaXMuZ2V0T3V0cHV0RGlyPElPcHRpb25zUnVudGltZT4oZG93bmxvYWRPcHRpb25zKTtcclxuXHJcblx0XHRjb25zb2xlLmxvZyhvcHRpb25zUnVudGltZSk7XHJcblxyXG5cdFx0cmV0dXJuIFByb21pc2VCbHVlYmlyZFxyXG5cdFx0XHQuYmluZChzZWxmKVxyXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dXJsID0gdGhpcy5jcmVhdGVNYWluVXJsKHVybCBhcyBhbnkpO1xyXG5cclxuXHRcdFx0XHQvL29wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0udXJsID0gdXJsO1xyXG5cclxuXHRcdFx0XHRzZWxmLnNlc3Npb24ob3B0aW9uc1J1bnRpbWUsIHVybCBhcyBVUkwpO1xyXG5cclxuXHRcdFx0XHRsZXQgbm92ZWwgPSBhd2FpdCBzZWxmLmdldF92b2x1bWVfbGlzdDxJT3B0aW9uc1J1bnRpbWUgJiBJRG93bmxvYWRPcHRpb25zPih1cmwsIG9wdGlvbnNSdW50aW1lKTtcclxuXHJcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhub3ZlbCk7XHJcblxyXG5cdFx0XHRcdGxldCBpZHggPSBkb3dubG9hZE9wdGlvbnMuc3RhcnRJbmRleCB8fCAwO1xyXG5cclxuXHRcdFx0XHRsZXQgcGF0aF9ub3ZlbCA9IHBhdGguam9pbihzZWxmLlBBVEhfTk9WRUxfTUFJTixcclxuXHRcdFx0XHRcdGAke3NlbGYudHJpbUZpbGVuYW1lTm92ZWwobm92ZWwubm92ZWxfdGl0bGUpfV8oJHtub3ZlbC51cmxfZGF0YS5ub3ZlbF9pZH0pYFxyXG5cdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwgPSBub3ZlbDtcclxuXHRcdFx0XHRvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnBhdGhfbm92ZWwgPSBwYXRoX25vdmVsO1xyXG5cclxuXHRcdFx0XHRsZXQgcmV0ID0gYXdhaXQgUHJvbWlzZUJsdWViaXJkXHJcblx0XHRcdFx0XHQubWFwU2VyaWVzKG5vdmVsLnZvbHVtZV9saXN0LCBmdW5jdGlvbiAodm9sdW1lLCB2aWQpXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdGxldCBkaXJuYW1lID0gZ2V0Vm9sdW1lUGF0aChzZWxmLCB7XHJcblx0XHRcdFx0XHRcdFx0cGF0aF9ub3ZlbCxcclxuXHRcdFx0XHRcdFx0XHR2b2x1bWUsIHZpZFxyXG5cdFx0XHRcdFx0XHR9LCBvcHRpb25zUnVudGltZSk7XHJcblxyXG5cdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXHJcblx0XHRcdFx0XHRcdFx0Lm1hcFNlcmllcyh2b2x1bWUuY2hhcHRlcl9saXN0LCBhc3luYyBmdW5jdGlvbiAoY2hhcHRlciwgY2lkKVxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vY2hhcHRlci5jaGFwdGVyX2luZGV4ID0gKGlkeCsrKTtcclxuXHRcdFx0XHRcdFx0XHRcdGlkeCsrO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdGxldCBmaWxlID0gZ2V0RmlsZVBhdGgoc2VsZiwge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyLCBjaWQsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGV4dDogJy50eHQnLFxyXG5cclxuXHRcdFx0XHRcdFx0XHRcdFx0aWR4LFxyXG5cclxuXHRcdFx0XHRcdFx0XHRcdFx0ZGlybmFtZSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lLCB2aWQsXHJcblx0XHRcdFx0XHRcdFx0XHR9LCBvcHRpb25zUnVudGltZSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHNlbGYuX2NoZWNrRXhpc3RzKG9wdGlvbnNSdW50aW1lLCBmaWxlKSlcclxuXHRcdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZpbGU7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0bGV0IGZuO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdGlmIChvcHRpb25zUnVudGltZS5kaXNhYmxlRG93bmxvYWQpXHJcblx0XHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGZuID0gYXN5bmMgZnVuY3Rpb24gKClcclxuXHRcdFx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiAnJztcclxuXHRcdFx0XHRcdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdGVsc2UgaWYgKCFvcHRpb25zUnVudGltZS5kaXNhYmxlVHh0ZG93bmxvYWQpXHJcblx0XHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGZuID0gZnVuY3Rpb24gKClcclxuXHRcdFx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiByZXRyeVJlcXVlc3QoY2hhcHRlci5jaGFwdGVyX3VybCwge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVsYXk6IDI1MDAwLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0amFyOiBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGxldCB1cmwgPSBzZWxmLl9jcmVhdGVDaGFwdGVyVXJsKHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRub3ZlbCxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWUsXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcixcclxuXHRcdFx0XHRcdFx0XHRcdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyh1cmwpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdFx0Zm4gPSBmdW5jdGlvbiAoKVxyXG5cdFx0XHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tKVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gW1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRvbS4kKCcjbm92ZWxfcCcpLnRleHQoKSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkb20uJCgnI25vdmVsX2hvbmJ1bicpLnRleHQoKSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkb20uJCgnI25vdmVsX2EnKS50ZXh0KCksXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF0uZmlsdGVyKGZ1bmN0aW9uICh2KVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHY7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0pLmpvaW4oJ1xcblxcbj09PT09PT09PT09PT09PT09PVxcblxcbicpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKHVybCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0YXdhaXQgUHJvbWlzZUJsdWViaXJkLnJlc29sdmUoKS50aGVuKGZ1bmN0aW9uICgpXHJcblx0XHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBmbigpXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKHRleHQpXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YXdhaXQgZnMub3V0cHV0RmlsZShmaWxlLCB0ZXh0KTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdGV4dDtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdDtcclxuXHRcdFx0XHRcdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBmaWxlO1xyXG5cdFx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHRcdFx0O1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdC50YXAobHMgPT5cclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0bGV0IGZpbGUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcclxuXHRcdFx0XHRcdFx0XHRgJHtzZWxmLnRyaW1GaWxlbmFtZU5vdmVsKG5vdmVsLm5vdmVsX3RpdGxlKX0uJHtub3ZlbC51cmxfZGF0YS5ub3ZlbF9pZH0uanNvbmBcclxuXHRcdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHRcdDtcclxuXHJcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2cobHMpO1xyXG5cclxuXHRcdFx0XHRcdFx0cmV0dXJuIGZzLm91dHB1dEpTT04oZmlsZSwgbm92ZWwsIHtcclxuXHRcdFx0XHRcdFx0XHRzcGFjZXM6IFwiXFx0XCIsXHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHQ7XHJcblxyXG5cdFx0XHRcdGF3YWl0IHNlbGYuX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWUpO1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gbm92ZWw7XHJcblx0XHRcdH0pXHJcblx0XHRcdC5maW5hbGx5KGZ1bmN0aW9uICgpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRpZiAoMClcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRjb25zb2xlLmRpcigob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NIGFzIElGcm9tVXJsT3B0aW9ucykuY29va2llSmFyLCB7XHJcblx0XHRcdFx0XHRcdGRlcHRoOiBudWxsLFxyXG5cdFx0XHRcdFx0XHRjb2xvcnM6IHRydWUsXHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHR9KVxyXG5cdFx0XHQ7XHJcblx0fVxyXG5cdCovXHJcblxyXG5cdGRvd25sb2FkKHVybDogc3RyaW5nIHwgVVJMLCBkb3dubG9hZE9wdGlvbnM6IElEb3dubG9hZE9wdGlvbnMgPSB7fSlcclxuXHR7XHJcblx0XHRyZXR1cm4gc3VwZXIuZG93bmxvYWQodXJsLCBkb3dubG9hZE9wdGlvbnMpO1xyXG5cdH1cclxuXHJcblx0cHJvdGVjdGVkIF9wYXJzZUNoYXB0ZXI8VD4ocmV0LCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGUpOiBzdHJpbmdcclxuXHR7XHJcblx0XHRpZiAoIXJldClcclxuXHRcdHtcclxuXHRcdFx0cmV0dXJuICcnO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICghb3B0aW9uc1J1bnRpbWUuZGlzYWJsZVR4dGRvd25sb2FkKVxyXG5cdFx0e1xyXG5cdFx0XHRyZXR1cm4gcmV0LmJvZHk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0cmV0LmRvbS4kKCcjbm92ZWxfcCcpLnRleHQoKSxcclxuXHRcdFx0cmV0LmRvbS4kKCcjbm92ZWxfaG9uYnVuJykudGV4dCgpLFxyXG5cdFx0XHRyZXQuZG9tLiQoJyNub3ZlbF9hJykudGV4dCgpLFxyXG5cdFx0XS5maWx0ZXIoZnVuY3Rpb24gKHYpXHJcblx0XHR7XHJcblx0XHRcdHJldHVybiB2O1xyXG5cdFx0fSkuam9pbignXFxuXFxuPT09PT09PT09PT09PT09PT09XFxuXFxuJyk7XHJcblx0fVxyXG5cclxuXHRwcm90ZWN0ZWQgX2NyZWF0ZUNoYXB0ZXJVcmw8VCA9IElPcHRpb25zUnVudGltZSAmIElEb3dubG9hZE9wdGlvbnM+KHtcclxuXHRcdG5vdmVsLFxyXG5cdFx0dm9sdW1lLFxyXG5cdFx0Y2hhcHRlcixcclxuXHR9OiB7XHJcblx0XHRub3ZlbDogTm92ZWxTaXRlLklOb3ZlbCxcclxuXHRcdHZvbHVtZTogTm92ZWxTaXRlLklWb2x1bWUsXHJcblx0XHRjaGFwdGVyOiBOb3ZlbFNpdGUuSUNoYXB0ZXIsXHJcblx0fSwgb3B0aW9uc1J1bnRpbWU/OiBUICYgSU9wdGlvbnNSdW50aW1lKTogVVJMXHJcblx0e1xyXG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lLmRpc2FibGVUeHRkb3dubG9hZClcclxuXHRcdHtcclxuXHRcdFx0bGV0IHVybCA9IHRoaXMubWFrZVVybCh7XHJcblx0XHRcdFx0Y2hhcHRlcl9pZDogY2hhcHRlci5jaGFwdGVyX2lkLFxyXG5cdFx0XHRcdG5vdmVsX2lkOiBub3ZlbC51cmxfZGF0YS5ub3ZlbF9pZCxcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gdXJsO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBzdXBlci5fY3JlYXRlQ2hhcHRlclVybCh7XHJcblx0XHRcdG5vdmVsLFxyXG5cdFx0XHR2b2x1bWUsXHJcblx0XHRcdGNoYXB0ZXIsXHJcblx0XHR9LCBvcHRpb25zUnVudGltZSk7XHJcblx0fVxyXG5cclxuXHRwcm90ZWN0ZWQgX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgb3B0aW9ucyA9IHt9LCAuLi5vcHRzKVxyXG5cdHtcclxuXHRcdG9wdGlvbnNbdGhpcy5JREtFWV0gPSB7XHJcblx0XHRcdHR4dGRvd25sb2FkX2lkOiBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsLm5vdmVsX3N5b3NldHVfaWQsXHJcblx0XHR9O1xyXG5cclxuXHRcdHJldHVybiBzdXBlci5fc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZSwgb3B0aW9ucywge1xyXG5cdFx0XHRvcHRpb25zOiB7XHJcblx0XHRcdFx0dGV4dGxheW91dDoge1xyXG5cdFx0XHRcdFx0YWxsb3dfbGYyOiB0cnVlLFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdH0sIC4uLm9wdHMpO1xyXG5cdH1cclxuXHJcblx0bWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2wgPzogYm9vbGVhbik6IFVSTFxyXG5cdHtcclxuXHRcdGxldCBzdWJkb21haW4gPSB1cmxvYmoubm92ZWxfcjE4ID8gJ25vdmVsMTgnIDogJ25jb2RlJztcclxuXHJcblx0XHRpZiAodXJsb2JqLm5vdmVsX3BpZCAmJiB1cmxvYmouY2hhcHRlcl9pZClcclxuXHRcdHtcclxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxyXG5cdFx0XHRyZXR1cm4gbmV3IFVSTChgaHR0cHM6Ly8ke3N1YmRvbWFpbn0uc3lvc2V0dS5jb20vdHh0ZG93bmxvYWQvZGxzdGFydC9uY29kZS8ke3VybG9iai5ub3ZlbF9waWR9Lz9ubz0ke3VybG9iai5jaGFwdGVyX2lkfSZoYW5rYWt1PTAmY29kZT11dGYtOCZrYWlneW89Y3JsZmApO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBwYWQgPSAoIWJvb2wgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpID8gdXJsb2JqLmNoYXB0ZXJfaWQgOiAnJztcclxuXHJcblx0XHQvLyBAdHMtaWdub3JlXHJcblx0XHRyZXR1cm4gbmV3IFVSTChgaHR0cDovLyR7c3ViZG9tYWlufS5zeW9zZXR1LmNvbS8ke3VybG9iai5ub3ZlbF9pZH0vJHtwYWR9YCk7XHJcblx0fVxyXG5cclxuXHRwYXJzZVVybCh1cmw6IHN0cmluZyB8IFVSTCk6IE5vdmVsU2l0ZS5JUGFyc2VVcmxcclxuXHR7XHJcblx0XHRsZXQgdXJsb2JqID0ge1xyXG5cdFx0XHR1cmwsXHJcblxyXG5cdFx0XHRub3ZlbF9waWQ6IG51bGwsXHJcblx0XHRcdG5vdmVsX2lkOiBudWxsLFxyXG5cdFx0XHRjaGFwdGVyX2lkOiBudWxsLFxyXG5cclxuXHRcdFx0bm92ZWxfcjE4OiBudWxsLFxyXG5cdFx0fTtcclxuXHJcblx0XHQvL3VybCA9IHVybC50b1N0cmluZygpO1xyXG5cclxuXHRcdHRyeVxyXG5cdFx0e1xyXG5cdFx0XHQvLyBAdHMtaWdub3JlXHJcblx0XHRcdHVybG9iai51cmwgPSBuZXcgVVJMKHVybCk7XHJcblx0XHRcdC8vIEB0cy1pZ25vcmVcclxuXHRcdFx0dXJsID0gdXJsb2JqLnVybC5ocmVmO1xyXG5cdFx0fVxyXG5cdFx0Y2F0Y2ggKGUpXHJcblx0XHR7XHJcblx0XHRcdGNvbnNvbGUud2FybihlLnRvU3RyaW5nKCkgKyBgIFwiJHt1cmx9XCJgKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAodHlwZW9mIHVybCAhPSAnc3RyaW5nJylcclxuXHRcdHtcclxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxyXG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKHVybCk7XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IHI6IFJlZ0V4cDtcclxuXHRcdGxldCBtO1xyXG5cclxuXHRcdHIgPSAvXihuW1xcd117NSw2fSkkLztcclxuXHRcdGlmIChtID0gci5leGVjKHVybCkpXHJcblx0XHR7XHJcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XHJcblx0XHRcdHJldHVybiB1cmxvYmo7XHJcblx0XHR9XHJcblxyXG5cdFx0ciA9IC8obm92ZWwxOClcXC5zeW9zZXR1XFwuY29tLztcclxuXHRcdGlmIChtID0gci5leGVjKHVybCkpXHJcblx0XHR7XHJcblx0XHRcdHVybG9iai5ub3ZlbF9yMTggPSBtWzFdO1xyXG5cdFx0fVxyXG5cclxuXHRcdHIgPSAvdHh0ZG93bmxvYWRcXC9kbHN0YXJ0XFwvbmNvZGVcXC8oXFxkKykvO1xyXG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcclxuXHRcdHtcclxuXHRcdFx0dXJsb2JqLm5vdmVsX3BpZCA9IG1bMV07XHJcblxyXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xyXG5cdFx0fVxyXG5cclxuXHRcdHIgPSAvXFwuc3lvc2V0dVxcLmNvbVxcLyhuXFx3KykoPzpcXC8/KFxcZCspKT8vO1xyXG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcclxuXHRcdHtcclxuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcclxuXHRcdFx0dXJsb2JqLmNoYXB0ZXJfaWQgPSBtWzJdO1xyXG5cclxuXHRcdFx0cmV0dXJuIHVybG9iajtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdXJsb2JqO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZ2V0X3ZvbHVtZV9saXN0PFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPih1cmw6IHN0cmluZyB8IFVSTCxcclxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9XHJcblx0KTogUHJvbWlzZTxJTm92ZWw+XHJcblx0e1xyXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XHJcblxyXG5cdFx0dXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKHVybCBhcyBhbnkpO1xyXG5cclxuXHRcdHJldHVybiBhd2FpdCBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxyXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXHJcblx0XHRcdHtcclxuXHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XHJcblxyXG5cdFx0XHRcdGlmICghJCgnI25vdmVsX2NvbnRlbnRzJykubGVuZ3RoIHx8ICQoJyNtb2RhbCAueWVzICN5ZXMxOCcpLmxlbmd0aClcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRvbS51cmwsIGRvbS5fb3B0aW9ucyk7XHJcblxyXG5cdFx0XHRcdFx0JCgnI21vZGFsIC55ZXMgI3llczE4JykuY2xpY2soKTtcclxuXHJcblx0XHRcdFx0XHRkb20uX29wdGlvbnMucmVxdWVzdE9wdGlvbnMuamFyLnNldENvb2tpZSgnb3ZlcjE4PXllczsgRG9tYWluPS5zeW9zZXR1LmNvbTsgUGF0aD0vJywgdXJsKTtcclxuXHJcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRvbS5zZXJpYWxpemUoKSk7XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIGZyb21VUkwodXJsLCBPYmplY3QuYXNzaWduKG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSwge1xyXG5cclxuXHRcdFx0XHRcdFx0Ly9jb29raWVKYXI6IGRvbS5fb3B0aW9ucy5yZXF1ZXN0T3B0aW9ucy5qYXIuX2phcixcclxuXHRcdFx0XHRcdFx0Ly9yZXF1ZXN0T3B0aW9uczogZG9tLl9vcHRpb25zLnJlcXVlc3RPcHRpb25zLFxyXG5cclxuXHRcdFx0XHRcdH0gYXMgSUZyb21VcmxPcHRpb25zKSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKGRvbS5fb3B0aW9ucy5yZXF1ZXN0T3B0aW9ucy5qYXIpO1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gZG9tO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXHJcblx0XHRcdHtcclxuXHRcdFx0XHRsZXQgbm92ZWxfdGl0bGUgPSBkb20uJCgnLm5vdmVsX3RpdGxlJykudGV4dCgpO1xyXG5cdFx0XHRcdGxldCBub3ZlbF9hdXRob3IgPSBub3ZlbFRleHQudHJpbShkb21cclxuXHRcdFx0XHRcdC4kKCcubm92ZWxfd3JpdGVybmFtZSBhLCAubm92ZWxfd3JpdGVybmFtZScpXHJcblx0XHRcdFx0XHQuZXEoLTEpXHJcblx0XHRcdFx0XHQudGV4dCgpKVxyXG5cdFx0XHRcdFx0LnJlcGxhY2UoL14uKuS9nOiAhe+8mi8sICcnKVxyXG5cdFx0XHRcdDtcclxuXHJcblx0XHRcdFx0bGV0IG5vdmVsX2Rlc2MgPSBkb20uJCgnI25vdmVsX2V4JykudGV4dCgpO1xyXG5cclxuXHRcdFx0XHRsZXQgbm92ZWxfcHVibGlzaGVyID0gc2VsZi5JREtFWTtcclxuXHJcblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybChkb20udXJsLmhyZWYpO1xyXG5cclxuXHRcdFx0XHRsZXQgdm9sdW1lX2xpc3QgPSBbXSBhcyBOb3ZlbFNpdGUuSVZvbHVtZVtdO1xyXG5cclxuXHRcdFx0XHRsZXQgY3VycmVudFZvbHVtZTogTm92ZWxTaXRlLklWb2x1bWU7XHJcblxyXG5cdFx0XHRcdGxldCB0YWJsZSA9IGRvbS4kKCcuaW5kZXhfYm94JykuZmluZCgnPiAuY2hhcHRlcl90aXRsZSwgLm5vdmVsX3N1Ymxpc3QyJyk7XHJcblxyXG5cdFx0XHRcdGxldCBfY2FjaGVfZGF0ZXMgPSBbXTtcclxuXHJcblx0XHRcdFx0bGV0IG5vdmVsX3Nlcmllc190aXRsZTtcclxuXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0bGV0IGEgPSBkb20uJCgnI25vdmVsX2NvbnRlbnRzIC5zZXJpZXNfdGl0bGUnKS50ZXh0KClcclxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoL1tcXHJcXG5cXHRdK3xeXFxzK3xcXHMrJC9nLCAnJylcclxuXHRcdFx0XHRcdDtcclxuXHRcdFx0XHRcdGlmIChhKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRub3ZlbF9zZXJpZXNfdGl0bGUgPSBhO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0bGV0IG5vdmVsX3N5b3NldHVfaWQ7XHJcblxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGxldCAkID0gZG9tLiQ7XHJcblxyXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb20uc2VyaWFsaXplKCkpO1xyXG5cclxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coJCgnI25vdmVsX2Zvb3RlcicpKTtcclxuXHJcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKCQoJyNub3ZlbF9mb290ZXInKS5maW5kKCcudW5kZXJuYXZpIGFbaHJlZio9XCJ0eHRkb3dubG9hZFwiXScpKTtcclxuXHJcblx0XHRcdFx0XHRsZXQgbTtcclxuXHRcdFx0XHRcdGxldCBkdCA9IGRvbS4kKCcjbm92ZWxfZm9vdGVyIC51bmRlcm5hdmkgYVtocmVmKj1cInR4dGRvd25sb2FkXCJdJykucHJvcCgnaHJlZicpO1xyXG5cclxuXHRcdFx0XHRcdGlmIChkdCAmJiAobSA9IGR0Lm1hdGNoKC9uY29kZVxcLyhcXGQrKS8pKSlcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0bm92ZWxfc3lvc2V0dV9pZCA9IG1bMV07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIGlmICghb3B0aW9uc1J1bnRpbWUuZGlzYWJsZVR4dGRvd25sb2FkKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYOWumOaWuSB0eHQg5LiL6LyJ5Yqf6IO96YGt56aB55So77yM5oiW6KuL5L2/55SoIGNvb2tpZXMg55m75YWl77yM5oiW5bCHIGRpc2FibGVUeHRkb3dubG9hZCDoqK3ngrogdHJ1ZWApXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR0YWJsZVxyXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4KVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRsZXQgdHIgPSBkb20uJCh0aGlzKTtcclxuXHJcblx0XHRcdFx0XHRcdGlmICh0ci5pcygnLmNoYXB0ZXJfdGl0bGUnKSlcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xyXG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiB2b2x1bWVfbGlzdC5sZW5ndGgsXHJcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGU6IHRyLnRleHQoKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyksXHJcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxyXG5cdFx0XHRcdFx0XHRcdH07XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCFjdXJyZW50Vm9sdW1lKVxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IHZvbHVtZV9saXN0Lmxlbmd0aCxcclxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiAnbnVsbCcsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogW10sXHJcblx0XHRcdFx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0bGV0IGEgPSB0ci5maW5kKCcuc3VidGl0bGUgYScpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl9kYXRlO1xyXG5cdFx0XHRcdFx0XHRcdGxldCBkZDtcclxuXHRcdFx0XHRcdFx0XHRsZXQgZGEgPSB0ci5maW5kKCcubG9uZ191cGRhdGUnKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0aWYgKGRhLmZpbmQoJ3NwYW5bdGl0bGUqPVwiL1wiXScpLmxlbmd0aClcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRkZCA9IGRhLmZpbmQoJ3NwYW5bdGl0bGUqPVwiL1wiXScpLmF0dHIoJ3RpdGxlJykucmVwbGFjZSgv5pS556i/fF5cXHMrfFxccyskL2csICcnKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmICghZGQpXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGEuZmluZCgnKicpLnJlbW92ZSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGQgPSBkYS50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0aWYgKGRkKVxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfZGF0ZSA9IG1vbWVudChkZCwgJ1lZWVkvTU0vREQgSEg6bW0nKS5sb2NhbCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0X2NhY2hlX2RhdGVzLnB1c2goY2hhcHRlcl9kYXRlLnVuaXgoKSk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRsZXQgaHJlZiA9IGEucHJvcCgnaHJlZicpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRsZXQgZGF0YSA9IHNlbGYucGFyc2VVcmwoaHJlZik7XHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmICghZGF0YS5jaGFwdGVyX2lkKVxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRpZiAodHIuZmluZCgnLmJvb2ttYXJrZXJfbm93JykubGVuZ3RoKVxyXG5cdFx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvKipcclxuXHRcdFx0XHRcdFx0XHRcdFx0ICogZml4IGh0dHBzOi8vbmNvZGUuc3lvc2V0dS5jb20vbjc2Mzdkai9cclxuXHRcdFx0XHRcdFx0XHRcdFx0ICovXHJcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyh0ci5wcm9wKFwib3V0ZXJIVE1MXCIpKTtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGEucHJvcChcIm91dGVySFRNTFwiKSk7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhKTtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coaHJlZik7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhLmF0dHIoJ2hyZWYnKSk7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhuZXcgVVJMKGhyZWYsIGRvbS51cmwpKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhkb20uX29wdGlvbnMpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRkYXRhID0ge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR1cmw6IG51bGwsXHJcblx0XHRcdFx0XHRcdFx0XHRcdG5vdmVsX3BpZDogbm92ZWxfc3lvc2V0dV9pZCBhcyBzdHJpbmcsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCBhcyBzdHJpbmcsXHJcblx0XHRcdFx0XHRcdFx0XHR9IGFzIGFueTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRocmVmID0gc2VsZi5tYWtlVXJsKGRhdGEpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdGRhdGEudXJsID0gaHJlZjtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWVcclxuXHRcdFx0XHRcdFx0XHRcdC5jaGFwdGVyX2xpc3RcclxuXHRcdFx0XHRcdFx0XHRcdC5wdXNoKHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogY3VycmVudFZvbHVtZS5jaGFwdGVyX2xpc3QubGVuZ3RoLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlOiBhLnRleHQoKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyksXHJcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCxcclxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmw6IGhyZWYsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGE6IGRhdGEsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfZGF0ZSxcclxuXHRcdFx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHRcdFx0O1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdDtcclxuXHJcblx0XHRcdFx0X2NhY2hlX2RhdGVzLnNvcnQoKTtcclxuXHJcblx0XHRcdFx0bGV0IG5vdmVsX2RhdGUgPSBtb21lbnQudW5peChfY2FjaGVfZGF0ZXNbX2NhY2hlX2RhdGVzLmxlbmd0aCAtIDFdKS5sb2NhbCgpO1xyXG5cclxuXHRcdFx0XHRsZXQgYSA9IGF3YWl0IGZyb21VUkwoYGh0dHBzOi8vJHt1cmxfZGF0YS5ub3ZlbF9yMThcclxuXHRcdFx0XHRcdD8gJ25hcm91MTgnXHJcblx0XHRcdFx0XHQ6ICduYXJvdSd9LmRpcC5qcC9zZWFyY2gucGhwP3RleHQ9JHt1cmxfZGF0YS5ub3ZlbF9pZH0mbm92ZWw9YWxsJmdlbnJlPWFsbCZuZXdfZ2VucmU9YWxsJmxlbmd0aD0wJmRvd249MCZ1cD0xMDBgLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXHJcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRsZXQgaDIgPSBkb20uJChgZGl2Omhhcyg+IGgyLnNlYXJjaDpoYXMoPiBhW2hyZWYqPVwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIl0pKWApLmVxKDApO1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKCFoMi5sZW5ndGgpXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRoMiA9IGRvbS4kKGBoMjpoYXMoPiBhW2hyZWYqPVwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIl0pYCkuZXEoMCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGlmICghaDIubGVuZ3RoKVxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLndhcm4oYGNhbiBub3QgZm91bmQga2V5d29yZCBcIiR7dXJsX2RhdGEubm92ZWxfaWR9XCIsIHdpbGwgdHJ5IHVzZSB0aXRsZSBzZWFyY2hgKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGZyb21VUkwoYGh0dHBzOi8vJHt1cmxfZGF0YS5ub3ZlbF9yMThcclxuXHRcdFx0XHRcdFx0XHRcdD8gJ25hcm91MTgnXHJcblx0XHRcdFx0XHRcdFx0XHQ6ICduYXJvdSd9LmRpcC5qcC9zZWFyY2gucGhwP3RleHQ9JHtub3ZlbF90aXRsZX0mbm92ZWw9YWxsJmdlbnJlPWFsbCZuZXdfZ2VucmU9YWxsJmxlbmd0aD0wJmRvd249MCZ1cD0xMDBgLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXHJcblx0XHRcdFx0XHRcdFx0XHQ7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdHJldHVybiBkb207XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKGRvbSlcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb20udXJsKTtcclxuXHJcblx0XHRcdFx0XHRcdGxldCBkYXRhOiBJTWRjb25mTWV0YSA9IHt9O1xyXG5cclxuXHRcdFx0XHRcdFx0bGV0IGgyID0gZG9tLiQoYGRpdjpoYXMoPiBoMi5zZWFyY2g6aGFzKD4gYVtocmVmKj1cIiR7dXJsX2RhdGEubm92ZWxfaWR9XCJdKSlgKS5lcSgwKTtcclxuXHJcblx0XHRcdFx0XHRcdGlmICghaDIubGVuZ3RoKVxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0aDIgPSBkb20uJChgaDI6aGFzKD4gYVtocmVmKj1cIiR7dXJsX2RhdGEubm92ZWxfaWR9XCJdKWApLmVxKDApO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRsZXQgc2VhcmNoX2xlZnQgPSBoMi5zaWJsaW5ncygnLnNlYXJjaF9sZWZ0JykuZXEoMCk7XHJcblx0XHRcdFx0XHRcdGxldCBzZWFyY2hfcmlnaHQgPSBoMi5zaWJsaW5ncygnLnNlYXJjaF9yaWdodCcpLmVxKDApO1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKCFoMi5sZW5ndGgpXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKDExMTExMTExMTExMTExMTExMTExMSk7XHJcblx0XHRcdFx0XHRcdFx0Y29uc29sZS53YXJuKGBjYW4gbm90IGZvdW5kIGtleXdvcmQgZm9yICR7dXJsX2RhdGEubm92ZWxfaWR9YCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdHJldHVybiBkYXRhO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKHNlYXJjaF9sZWZ0KTtcclxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhzZWFyY2hfcmlnaHQpO1xyXG5cclxuXHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbCA9IHt9O1xyXG5cclxuXHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC5zdGF0dXMgPSBzZWFyY2hfbGVmdC5maW5kKCcubm92ZWxfdHlwZScpLnRleHQoKS50cmltKCk7XHJcblx0XHRcdFx0XHRcdGRhdGEubm92ZWwudGFncyA9IFtdO1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKGRhdGEubm92ZWwuc3RhdHVzID09PSAn5a6M57WQ5riIJylcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGRhdGEubm92ZWwubm92ZWxfc3RhdHVzIHw9IEVudW1Ob3ZlbFN0YXR1cy5BVVRIT1JfRE9ORTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0c2VhcmNoX3JpZ2h0LmZpbmQoJy5rZXl3b3JkIGEnKVxyXG5cdFx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbSlcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRsZXQgayA9IGRvbS4kKGVsZW0pXHJcblx0XHRcdFx0XHRcdFx0XHRcdC50ZXh0KClcclxuXHRcdFx0XHRcdFx0XHRcdFx0LnRyaW0oKVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQuc3BsaXQoL1tcXC9cXHNdLylcclxuXHRcdFx0XHRcdFx0XHRcdFx0Lm1hcChmdW5jdGlvbiAocylcclxuXHRcdFx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBzLnRyaW0oKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdFx0XHRcdFx0LmZpbHRlcigodikgPT4gdilcclxuXHRcdFx0XHRcdFx0XHRcdDtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MgPSBkYXRhLm5vdmVsLnRhZ3MuY29uY2F0KGspO1xyXG5cdFx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHRcdDtcclxuXHJcblx0XHRcdFx0XHRcdGRhdGEubGluayA9IFtdO1xyXG5cclxuXHRcdFx0XHRcdFx0ZGF0YS5saW5rLnB1c2goYFtkaXAuanBdKCR7ZG9tLnVybH0pIC0g5bCP6Kqs5a6244Gr44Gq44KN44GG44CA5pu05paw5oOF5aCx5qSc57SiYCk7XHJcblxyXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRhdGEpO1xyXG5cclxuXHRcdFx0XHRcdFx0cmV0dXJuIGRhdGE7XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGUpO1xyXG5cdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGBjYW4ndCBkb3dubG9hZCBub3ZlbCBleHRyYSBpbmZvYCk7XHJcblxyXG5cdFx0XHRcdFx0XHRyZXR1cm4ge307XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdDtcclxuXHJcblx0XHRcdFx0cmV0dXJuIHtcclxuXHJcblx0XHRcdFx0XHQuLi5hLFxyXG5cclxuXHRcdFx0XHRcdHVybDogZG9tLnVybCxcclxuXHRcdFx0XHRcdHVybF9kYXRhLFxyXG5cclxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxyXG5cdFx0XHRcdFx0bm92ZWxfYXV0aG9yLFxyXG5cclxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXHJcblx0XHRcdFx0XHRub3ZlbF9kYXRlLFxyXG5cdFx0XHRcdFx0bm92ZWxfcHVibGlzaGVyLFxyXG5cclxuXHRcdFx0XHRcdG5vdmVsX3Nlcmllc190aXRsZSxcclxuXHJcblx0XHRcdFx0XHRub3ZlbF9zeW9zZXR1X2lkLFxyXG5cclxuXHRcdFx0XHRcdHZvbHVtZV9saXN0LFxyXG5cclxuXHRcdFx0XHRcdGNoZWNrZGF0ZTogbW9tZW50KCkubG9jYWwoKSxcclxuXHJcblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcclxuXHRcdFx0XHR9IGFzIElOb3ZlbDtcclxuXHRcdFx0fSlcclxuXHRcdFx0O1xyXG5cdH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZVN5b3NldHU7XHJcblxyXG4iXX0=