"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
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
                data.novel.status = search_left.find('.novel_type').text();
                data.novel.tags = [];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUtBLDZDQUErRDtBQUcvRCx5Q0FBZ0M7QUFHaEMsb0NBQTBGO0FBRTFGLG9DQUFrQztBQUVsQyw4Q0FBOEM7QUFDOUMsMkNBQW1DO0FBaUJuQyxJQUFhLGdCQUFnQixHQUE3QixNQUFhLGdCQUFpQixTQUFRLGFBQWEsQ0FBQyxTQUFTO0lBSTVELFlBQVksT0FBeUIsRUFBRSxHQUFHLElBQUk7UUFFN0MsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBRXhCLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQztJQUNwRSxDQUFDO0lBRUQsT0FBTyxDQUFnQyxjQUE2QyxFQUFFLEdBQVE7UUFFN0YsYUFBYTtRQUNiLGNBQWMsQ0FBQyxXQUFXLEdBQUcsY0FBYyxDQUFDLFdBQVcsSUFBSSxFQUFFLENBQUM7UUFDOUQsY0FBYyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBRTFDLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRW5DLDZDQUE2QztRQUU3QyxjQUFjLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FFcEM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUE4SkU7SUFFRixRQUFRLENBQUMsR0FBaUIsRUFBRSxrQkFBb0MsRUFBRTtRQUVqRSxPQUFPLEtBQUssQ0FB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dUIsc0JBQUssR0FBRyxTQUFTLENBQUM7QUFGN0IsZ0JBQWdCO0lBRDVCLHdCQUFnQixFQUFnRDtHQUNwRCxnQkFBZ0IsQ0FxcEI1QjtBQXJwQlksNENBQWdCO0FBdXBCN0Isa0JBQWUsZ0JBQWdCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByZXRyeVJlcXVlc3QgfSBmcm9tICcuLi8uLi9mZXRjaCc7XHJcblxyXG5pbXBvcnQgZnMsIHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYnO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgbm92ZWxJbmZvLCB7IElNZGNvbmZNZXRhIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcclxuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XHJcbi8vIEB0cy1pZ25vcmVcclxuaW1wb3J0IHsgTGF6eUNvb2tpZSwgTGF6eUNvb2tpZUphciB9IGZyb20gJ2pzZG9tLWV4dHJhJztcclxuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcclxuaW1wb3J0IHsgZ2V0RmlsZVBhdGgsIGdldFZvbHVtZVBhdGggfSBmcm9tICcuLi9mcyc7XHJcblxyXG5pbXBvcnQgTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIGRlZmF1bHRKU0RPTU9wdGlvbnMsIFNZTUJPTF9DQUNIRSB9IGZyb20gJy4uL2luZGV4JztcclxuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkLCBibHVlYmlyZERlY29yYXRvciB9IGZyb20gJy4uL2luZGV4JztcclxuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xyXG5cclxuaW1wb3J0ICogYXMgTm92ZWxTaXRlRGVtbyBmcm9tICcuLi9kZW1vL2Jhc2UnO1xyXG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xyXG5cclxuZXhwb3J0IHR5cGUgSU5vdmVsID0gTm92ZWxTaXRlRGVtby5JTm92ZWwgJiB7XHJcblx0bm92ZWxfc3lvc2V0dV9pZDogc3RyaW5nLFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgSU9wdGlvbnNQbHVzID0ge1xyXG5cdC8qKlxyXG5cdCAqIOS4jeS9v+eUqOWwj+iqquWutuaPkOS+m+eahCB0eHQg5LiL6LyJ6YCj57WQXHJcblx0ICovXHJcblx0ZGlzYWJsZVR4dGRvd25sb2FkPzogYm9vbGVhbixcclxufVxyXG5cclxuZXhwb3J0IHR5cGUgSURvd25sb2FkT3B0aW9ucyA9IE5vdmVsU2l0ZURlbW8uSURvd25sb2FkT3B0aW9ucyAmIElPcHRpb25zUGx1c1xyXG5leHBvcnQgdHlwZSBJT3B0aW9uc1J1bnRpbWUgPSBOb3ZlbFNpdGVEZW1vLklPcHRpb25zUnVudGltZSAmIElEb3dubG9hZE9wdGlvbnMgJiBJT3B0aW9uc1BsdXNcclxuXHJcbkBzdGF0aWNJbXBsZW1lbnRzPE5vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZVN5b3NldHU+PigpXHJcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVTeW9zZXR1IGV4dGVuZHMgTm92ZWxTaXRlRGVtby5Ob3ZlbFNpdGVcclxue1xyXG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVkgPSAnc3lvc2V0dSc7XHJcblxyXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM6IElEb3dubG9hZE9wdGlvbnMsIC4uLmFyZ3YpXHJcblx0e1xyXG5cdFx0c3VwZXIob3B0aW9ucywgLi4uYXJndik7XHJcblxyXG5cdFx0dGhpcy5vcHRpb25zSW5pdC5yZXRyeURlbGF5ID0gdGhpcy5vcHRpb25zSW5pdC5yZXRyeURlbGF5IHx8IDI1MDAwO1xyXG5cdH1cclxuXHJcblx0c2Vzc2lvbjxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+LCB1cmw6IFVSTClcclxuXHR7XHJcblx0XHQvLyBAdHMtaWdub3JlXHJcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSA9IG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhIHx8IHt9O1xyXG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEub3ZlcjE4ID0gJ3llcyc7XHJcblxyXG5cdFx0c3VwZXIuc2Vzc2lvbihvcHRpb25zUnVudGltZSwgdXJsKTtcclxuXHJcblx0XHQvL2xldCB1cmwgPSBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnVybDtcclxuXHJcblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyXHJcblx0XHRcdC8vLnNldENvb2tpZVN5bmMoJ292ZXIxOD15ZXM7IERvbWFpbj0uc3lvc2V0dS5jb207IFBhdGg9LycsIHVybC5ocmVmKVxyXG5cdFx0O1xyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH1cclxuXHJcblx0LypcclxuXHRkb3dubG9hZCh1cmw6IHN0cmluZyB8IFVSTCwgZG93bmxvYWRPcHRpb25zOiBJRG93bmxvYWRPcHRpb25zID0ge30pXHJcblx0e1xyXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XHJcblxyXG5cdFx0Y29uc3QgW1BBVEhfTk9WRUxfTUFJTiwgb3B0aW9uc1J1bnRpbWVdID0gdGhpcy5nZXRPdXRwdXREaXI8SU9wdGlvbnNSdW50aW1lPihkb3dubG9hZE9wdGlvbnMpO1xyXG5cclxuXHRcdGNvbnNvbGUubG9nKG9wdGlvbnNSdW50aW1lKTtcclxuXHJcblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXHJcblx0XHRcdC5iaW5kKHNlbGYpXHJcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uICgpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR1cmwgPSB0aGlzLmNyZWF0ZU1haW5VcmwodXJsIGFzIGFueSk7XHJcblxyXG5cdFx0XHRcdC8vb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS51cmwgPSB1cmw7XHJcblxyXG5cdFx0XHRcdHNlbGYuc2Vzc2lvbihvcHRpb25zUnVudGltZSwgdXJsIGFzIFVSTCk7XHJcblxyXG5cdFx0XHRcdGxldCBub3ZlbCA9IGF3YWl0IHNlbGYuZ2V0X3ZvbHVtZV9saXN0PElPcHRpb25zUnVudGltZSAmIElEb3dubG9hZE9wdGlvbnM+KHVybCwgb3B0aW9uc1J1bnRpbWUpO1xyXG5cclxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKG5vdmVsKTtcclxuXHJcblx0XHRcdFx0bGV0IGlkeCA9IGRvd25sb2FkT3B0aW9ucy5zdGFydEluZGV4IHx8IDA7XHJcblxyXG5cdFx0XHRcdGxldCBwYXRoX25vdmVsID0gcGF0aC5qb2luKHNlbGYuUEFUSF9OT1ZFTF9NQUlOLFxyXG5cdFx0XHRcdFx0YCR7c2VsZi50cmltRmlsZW5hbWVOb3ZlbChub3ZlbC5ub3ZlbF90aXRsZSl9Xygke25vdmVsLnVybF9kYXRhLm5vdmVsX2lkfSlgXHJcblx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0b3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbCA9IG5vdmVsO1xyXG5cdFx0XHRcdG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ucGF0aF9ub3ZlbCA9IHBhdGhfbm92ZWw7XHJcblxyXG5cdFx0XHRcdGxldCByZXQgPSBhd2FpdCBQcm9taXNlQmx1ZWJpcmRcclxuXHRcdFx0XHRcdC5tYXBTZXJpZXMobm92ZWwudm9sdW1lX2xpc3QsIGZ1bmN0aW9uICh2b2x1bWUsIHZpZClcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0bGV0IGRpcm5hbWUgPSBnZXRWb2x1bWVQYXRoKHNlbGYsIHtcclxuXHRcdFx0XHRcdFx0XHRwYXRoX25vdmVsLFxyXG5cdFx0XHRcdFx0XHRcdHZvbHVtZSwgdmlkXHJcblx0XHRcdFx0XHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcclxuXHJcblx0XHRcdFx0XHRcdHJldHVybiBQcm9taXNlQmx1ZWJpcmRcclxuXHRcdFx0XHRcdFx0XHQubWFwU2VyaWVzKHZvbHVtZS5jaGFwdGVyX2xpc3QsIGFzeW5jIGZ1bmN0aW9uIChjaGFwdGVyLCBjaWQpXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0Ly9jaGFwdGVyLmNoYXB0ZXJfaW5kZXggPSAoaWR4KyspO1xyXG5cdFx0XHRcdFx0XHRcdFx0aWR4Kys7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0bGV0IGZpbGUgPSBnZXRGaWxlUGF0aChzZWxmLCB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXIsIGNpZCxcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZXh0OiAnLnR4dCcsXHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZHgsXHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0XHRkaXJuYW1lLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWUsIHZpZCxcclxuXHRcdFx0XHRcdFx0XHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoc2VsZi5fY2hlY2tFeGlzdHMob3B0aW9uc1J1bnRpbWUsIGZpbGUpKVxyXG5cdFx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZmlsZTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0XHRsZXQgZm47XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLmRpc2FibGVEb3dubG9hZClcclxuXHRcdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Zm4gPSBhc3luYyBmdW5jdGlvbiAoKVxyXG5cdFx0XHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuICcnO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAoIW9wdGlvbnNSdW50aW1lLmRpc2FibGVUeHRkb3dubG9hZClcclxuXHRcdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Zm4gPSBmdW5jdGlvbiAoKVxyXG5cdFx0XHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHJldHJ5UmVxdWVzdChjaGFwdGVyLmNoYXB0ZXJfdXJsLCB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZWxheTogMjUwMDAsXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRqYXI6IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIsXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IHVybCA9IHNlbGYuX2NyZWF0ZUNoYXB0ZXJVcmwoe1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG5vdmVsLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHR9LCBvcHRpb25zUnVudGltZSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKHVybCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0XHRmbiA9IGZ1bmN0aW9uICgpXHJcblx0XHRcdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb20pXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBbXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZG9tLiQoJyNub3ZlbF9wJykudGV4dCgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRvbS4kKCcjbm92ZWxfaG9uYnVuJykudGV4dCgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRvbS4kKCcjbm92ZWxfYScpLnRleHQoKSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XS5maWx0ZXIoZnVuY3Rpb24gKHYpXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdjtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSkuam9pbignXFxuXFxuPT09PT09PT09PT09PT09PT09XFxuXFxuJyk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0O1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2codXJsKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRhd2FpdCBQcm9taXNlQmx1ZWJpcmQucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKClcclxuXHRcdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZuKClcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAodGV4dClcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhd2FpdCBmcy5vdXRwdXRGaWxlKGZpbGUsIHRleHQpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiB0ZXh0O1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0O1xyXG5cdFx0XHRcdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZpbGU7XHJcblx0XHRcdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdFx0XHQ7XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0LnRhcChscyA9PlxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRsZXQgZmlsZSA9IHBhdGguam9pbihwYXRoX25vdmVsLFxyXG5cdFx0XHRcdFx0XHRcdGAke3NlbGYudHJpbUZpbGVuYW1lTm92ZWwobm92ZWwubm92ZWxfdGl0bGUpfS4ke25vdmVsLnVybF9kYXRhLm5vdmVsX2lkfS5qc29uYFxyXG5cdFx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdFx0O1xyXG5cclxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhscyk7XHJcblxyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZnMub3V0cHV0SlNPTihmaWxlLCBub3ZlbCwge1xyXG5cdFx0XHRcdFx0XHRcdHNwYWNlczogXCJcXHRcIixcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdDtcclxuXHJcblx0XHRcdFx0YXdhaXQgc2VsZi5fc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZSk7XHJcblxyXG5cdFx0XHRcdHJldHVybiBub3ZlbDtcclxuXHRcdFx0fSlcclxuXHRcdFx0LmZpbmFsbHkoZnVuY3Rpb24gKClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGlmICgwKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZGlyKChvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00gYXMgSUZyb21VcmxPcHRpb25zKS5jb29raWVKYXIsIHtcclxuXHRcdFx0XHRcdFx0ZGVwdGg6IG51bGwsXHJcblx0XHRcdFx0XHRcdGNvbG9yczogdHJ1ZSxcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdH0pXHJcblx0XHRcdDtcclxuXHR9XHJcblx0Ki9cclxuXHJcblx0ZG93bmxvYWQodXJsOiBzdHJpbmcgfCBVUkwsIGRvd25sb2FkT3B0aW9uczogSURvd25sb2FkT3B0aW9ucyA9IHt9KVxyXG5cdHtcclxuXHRcdHJldHVybiBzdXBlci5kb3dubG9hZCh1cmwsIGRvd25sb2FkT3B0aW9ucyk7XHJcblx0fVxyXG5cclxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihyZXQsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZSk6IHN0cmluZ1xyXG5cdHtcclxuXHRcdGlmICghcmV0KVxyXG5cdFx0e1xyXG5cdFx0XHRyZXR1cm4gJyc7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCFvcHRpb25zUnVudGltZS5kaXNhYmxlVHh0ZG93bmxvYWQpXHJcblx0XHR7XHJcblx0XHRcdHJldHVybiByZXQuYm9keTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHRyZXQuZG9tLiQoJyNub3ZlbF9wJykudGV4dCgpLFxyXG5cdFx0XHRyZXQuZG9tLiQoJyNub3ZlbF9ob25idW4nKS50ZXh0KCksXHJcblx0XHRcdHJldC5kb20uJCgnI25vdmVsX2EnKS50ZXh0KCksXHJcblx0XHRdLmZpbHRlcihmdW5jdGlvbiAodilcclxuXHRcdHtcclxuXHRcdFx0cmV0dXJuIHY7XHJcblx0XHR9KS5qb2luKCdcXG5cXG49PT09PT09PT09PT09PT09PT1cXG5cXG4nKTtcclxuXHR9XHJcblxyXG5cdHByb3RlY3RlZCBfY3JlYXRlQ2hhcHRlclVybDxUID0gSU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4oe1xyXG5cdFx0bm92ZWwsXHJcblx0XHR2b2x1bWUsXHJcblx0XHRjaGFwdGVyLFxyXG5cdH06IHtcclxuXHRcdG5vdmVsOiBOb3ZlbFNpdGUuSU5vdmVsLFxyXG5cdFx0dm9sdW1lOiBOb3ZlbFNpdGUuSVZvbHVtZSxcclxuXHRcdGNoYXB0ZXI6IE5vdmVsU2l0ZS5JQ2hhcHRlcixcclxuXHR9LCBvcHRpb25zUnVudGltZT86IFQgJiBJT3B0aW9uc1J1bnRpbWUpOiBVUkxcclxuXHR7XHJcblx0XHRpZiAob3B0aW9uc1J1bnRpbWUuZGlzYWJsZVR4dGRvd25sb2FkKVxyXG5cdFx0e1xyXG5cdFx0XHRsZXQgdXJsID0gdGhpcy5tYWtlVXJsKHtcclxuXHRcdFx0XHRjaGFwdGVyX2lkOiBjaGFwdGVyLmNoYXB0ZXJfaWQsXHJcblx0XHRcdFx0bm92ZWxfaWQ6IG5vdmVsLnVybF9kYXRhLm5vdmVsX2lkLFxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJldHVybiB1cmw7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHN1cGVyLl9jcmVhdGVDaGFwdGVyVXJsKHtcclxuXHRcdFx0bm92ZWwsXHJcblx0XHRcdHZvbHVtZSxcclxuXHRcdFx0Y2hhcHRlcixcclxuXHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcclxuXHR9XHJcblxyXG5cdHByb3RlY3RlZCBfc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBvcHRpb25zID0ge30sIC4uLm9wdHMpXHJcblx0e1xyXG5cdFx0b3B0aW9uc1t0aGlzLklES0VZXSA9IHtcclxuXHRcdFx0dHh0ZG93bmxvYWRfaWQ6IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwubm92ZWxfc3lvc2V0dV9pZCxcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIHN1cGVyLl9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lLCBvcHRpb25zLCB7XHJcblx0XHRcdG9wdGlvbnM6IHtcclxuXHRcdFx0XHR0ZXh0bGF5b3V0OiB7XHJcblx0XHRcdFx0XHRhbGxvd19sZjI6IHRydWUsXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0fSwgLi4ub3B0cyk7XHJcblx0fVxyXG5cclxuXHRtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbCA/OiBib29sZWFuKTogVVJMXHJcblx0e1xyXG5cdFx0bGV0IHN1YmRvbWFpbiA9IHVybG9iai5ub3ZlbF9yMTggPyAnbm92ZWwxOCcgOiAnbmNvZGUnO1xyXG5cclxuXHRcdGlmICh1cmxvYmoubm92ZWxfcGlkICYmIHVybG9iai5jaGFwdGVyX2lkKVxyXG5cdFx0e1xyXG5cdFx0XHQvLyBAdHMtaWdub3JlXHJcblx0XHRcdHJldHVybiBuZXcgVVJMKGBodHRwczovLyR7c3ViZG9tYWlufS5zeW9zZXR1LmNvbS90eHRkb3dubG9hZC9kbHN0YXJ0L25jb2RlLyR7dXJsb2JqLm5vdmVsX3BpZH0vP25vPSR7dXJsb2JqLmNoYXB0ZXJfaWR9Jmhhbmtha3U9MCZjb2RlPXV0Zi04JmthaWd5bz1jcmxmYCk7XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IHBhZCA9ICghYm9vbCAmJiB1cmxvYmouY2hhcHRlcl9pZCkgPyB1cmxvYmouY2hhcHRlcl9pZCA6ICcnO1xyXG5cclxuXHRcdC8vIEB0cy1pZ25vcmVcclxuXHRcdHJldHVybiBuZXcgVVJMKGBodHRwOi8vJHtzdWJkb21haW59LnN5b3NldHUuY29tLyR7dXJsb2JqLm5vdmVsX2lkfS8ke3BhZH1gKTtcclxuXHR9XHJcblxyXG5cdHBhcnNlVXJsKHVybDogc3RyaW5nIHwgVVJMKTogTm92ZWxTaXRlLklQYXJzZVVybFxyXG5cdHtcclxuXHRcdGxldCB1cmxvYmogPSB7XHJcblx0XHRcdHVybCxcclxuXHJcblx0XHRcdG5vdmVsX3BpZDogbnVsbCxcclxuXHRcdFx0bm92ZWxfaWQ6IG51bGwsXHJcblx0XHRcdGNoYXB0ZXJfaWQ6IG51bGwsXHJcblxyXG5cdFx0XHRub3ZlbF9yMTg6IG51bGwsXHJcblx0XHR9O1xyXG5cclxuXHRcdC8vdXJsID0gdXJsLnRvU3RyaW5nKCk7XHJcblxyXG5cdFx0dHJ5XHJcblx0XHR7XHJcblx0XHRcdC8vIEB0cy1pZ25vcmVcclxuXHRcdFx0dXJsb2JqLnVybCA9IG5ldyBVUkwodXJsKTtcclxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxyXG5cdFx0XHR1cmwgPSB1cmxvYmoudXJsLmhyZWY7XHJcblx0XHR9XHJcblx0XHRjYXRjaCAoZSlcclxuXHRcdHtcclxuXHRcdFx0Y29uc29sZS53YXJuKGUudG9TdHJpbmcoKSArIGAgXCIke3VybH1cImApO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0eXBlb2YgdXJsICE9ICdzdHJpbmcnKVxyXG5cdFx0e1xyXG5cdFx0XHQvLyBAdHMtaWdub3JlXHJcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IodXJsKTtcclxuXHRcdH1cclxuXHJcblx0XHRsZXQgcjogUmVnRXhwO1xyXG5cdFx0bGV0IG07XHJcblxyXG5cdFx0ciA9IC9eKG5bXFx3XXs1LDZ9KSQvO1xyXG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcclxuXHRcdHtcclxuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcclxuXHRcdFx0cmV0dXJuIHVybG9iajtcclxuXHRcdH1cclxuXHJcblx0XHRyID0gLyhub3ZlbDE4KVxcLnN5b3NldHVcXC5jb20vO1xyXG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcclxuXHRcdHtcclxuXHRcdFx0dXJsb2JqLm5vdmVsX3IxOCA9IG1bMV07XHJcblx0XHR9XHJcblxyXG5cdFx0ciA9IC90eHRkb3dubG9hZFxcL2Rsc3RhcnRcXC9uY29kZVxcLyhcXGQrKS87XHJcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxyXG5cdFx0e1xyXG5cdFx0XHR1cmxvYmoubm92ZWxfcGlkID0gbVsxXTtcclxuXHJcblx0XHRcdHJldHVybiB1cmxvYmo7XHJcblx0XHR9XHJcblxyXG5cdFx0ciA9IC9cXC5zeW9zZXR1XFwuY29tXFwvKG5cXHcrKSg/OlxcLz8oXFxkKykpPy87XHJcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxyXG5cdFx0e1xyXG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xyXG5cdFx0XHR1cmxvYmouY2hhcHRlcl9pZCA9IG1bMl07XHJcblxyXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB1cmxvYmo7XHJcblx0fVxyXG5cclxuXHRhc3luYyBnZXRfdm9sdW1lX2xpc3Q8VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KHVybDogc3RyaW5nIHwgVVJMLFxyXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge31cclxuXHQpOiBQcm9taXNlPElOb3ZlbD5cclxuXHR7XHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHJcblx0XHR1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwodXJsIGFzIGFueSk7XHJcblxyXG5cdFx0cmV0dXJuIGF3YWl0IGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXHJcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb206IElKU0RPTSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcclxuXHJcblx0XHRcdFx0aWYgKCEkKCcjbm92ZWxfY29udGVudHMnKS5sZW5ndGggfHwgJCgnI21vZGFsIC55ZXMgI3llczE4JykubGVuZ3RoKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coZG9tLnVybCwgZG9tLl9vcHRpb25zKTtcclxuXHJcblx0XHRcdFx0XHQkKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5jbGljaygpO1xyXG5cclxuXHRcdFx0XHRcdGRvbS5fb3B0aW9ucy5yZXF1ZXN0T3B0aW9ucy5qYXIuc2V0Q29va2llKCdvdmVyMTg9eWVzOyBEb21haW49LnN5b3NldHUuY29tOyBQYXRoPS8nLCB1cmwpO1xyXG5cclxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coZG9tLnNlcmlhbGl6ZSgpKTtcclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gZnJvbVVSTCh1cmwsIE9iamVjdC5hc3NpZ24ob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLCB7XHJcblxyXG5cdFx0XHRcdFx0XHQvL2Nvb2tpZUphcjogZG9tLl9vcHRpb25zLnJlcXVlc3RPcHRpb25zLmphci5famFyLFxyXG5cdFx0XHRcdFx0XHQvL3JlcXVlc3RPcHRpb25zOiBkb20uX29wdGlvbnMucmVxdWVzdE9wdGlvbnMsXHJcblxyXG5cdFx0XHRcdFx0fSBhcyBJRnJvbVVybE9wdGlvbnMpKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdC8vY29uc29sZS5sb2coZG9tLl9vcHRpb25zLnJlcXVlc3RPcHRpb25zLmphcik7XHJcblxyXG5cdFx0XHRcdHJldHVybiBkb207XHJcblx0XHRcdH0pXHJcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb206IElKU0RPTSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGxldCBub3ZlbF90aXRsZSA9IGRvbS4kKCcubm92ZWxfdGl0bGUnKS50ZXh0KCk7XHJcblx0XHRcdFx0bGV0IG5vdmVsX2F1dGhvciA9IG5vdmVsVGV4dC50cmltKGRvbVxyXG5cdFx0XHRcdFx0LiQoJy5ub3ZlbF93cml0ZXJuYW1lIGEsIC5ub3ZlbF93cml0ZXJuYW1lJylcclxuXHRcdFx0XHRcdC5lcSgtMSlcclxuXHRcdFx0XHRcdC50ZXh0KCkpXHJcblx0XHRcdFx0XHQucmVwbGFjZSgvXi4q5L2c6ICF77yaLywgJycpXHJcblx0XHRcdFx0O1xyXG5cclxuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYyA9IGRvbS4kKCcjbm92ZWxfZXgnKS50ZXh0KCk7XHJcblxyXG5cdFx0XHRcdGxldCBub3ZlbF9wdWJsaXNoZXIgPSBzZWxmLklES0VZO1xyXG5cclxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKGRvbS51cmwuaHJlZik7XHJcblxyXG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIE5vdmVsU2l0ZS5JVm9sdW1lW107XHJcblxyXG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBOb3ZlbFNpdGUuSVZvbHVtZTtcclxuXHJcblx0XHRcdFx0bGV0IHRhYmxlID0gZG9tLiQoJy5pbmRleF9ib3gnKS5maW5kKCc+IC5jaGFwdGVyX3RpdGxlLCAubm92ZWxfc3VibGlzdDInKTtcclxuXHJcblx0XHRcdFx0bGV0IF9jYWNoZV9kYXRlcyA9IFtdO1xyXG5cclxuXHRcdFx0XHRsZXQgbm92ZWxfc2VyaWVzX3RpdGxlO1xyXG5cclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRsZXQgYSA9IGRvbS4kKCcjbm92ZWxfY29udGVudHMgLnNlcmllc190aXRsZScpLnRleHQoKVxyXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvW1xcclxcblxcdF0rfF5cXHMrfFxccyskL2csICcnKVxyXG5cdFx0XHRcdFx0O1xyXG5cdFx0XHRcdFx0aWYgKGEpXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdG5vdmVsX3Nlcmllc190aXRsZSA9IGE7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRsZXQgbm92ZWxfc3lvc2V0dV9pZDtcclxuXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0bGV0ICQgPSBkb20uJDtcclxuXHJcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRvbS5zZXJpYWxpemUoKSk7XHJcblxyXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygkKCcjbm92ZWxfZm9vdGVyJykpO1xyXG5cclxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coJCgnI25vdmVsX2Zvb3RlcicpLmZpbmQoJy51bmRlcm5hdmkgYVtocmVmKj1cInR4dGRvd25sb2FkXCJdJykpO1xyXG5cclxuXHRcdFx0XHRcdGxldCBtO1xyXG5cdFx0XHRcdFx0bGV0IGR0ID0gZG9tLiQoJyNub3ZlbF9mb290ZXIgLnVuZGVybmF2aSBhW2hyZWYqPVwidHh0ZG93bmxvYWRcIl0nKS5wcm9wKCdocmVmJyk7XHJcblxyXG5cdFx0XHRcdFx0aWYgKGR0ICYmIChtID0gZHQubWF0Y2goL25jb2RlXFwvKFxcZCspLykpKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRub3ZlbF9zeW9zZXR1X2lkID0gbVsxXTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2UgaWYgKCFvcHRpb25zUnVudGltZS5kaXNhYmxlVHh0ZG93bmxvYWQpXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihg5a6Y5pa5IHR4dCDkuIvovInlip/og73pga3npoHnlKjvvIzmiJboq4vkvb/nlKggY29va2llcyDnmbvlhaXvvIzmiJblsIcgZGlzYWJsZVR4dGRvd25sb2FkIOioreeCuiB0cnVlYClcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHRhYmxlXHJcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgpXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdGxldCB0ciA9IGRvbS4kKHRoaXMpO1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKHRyLmlzKCcuY2hhcHRlcl90aXRsZScpKVxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IHZvbHVtZV9saXN0W3ZvbHVtZV9saXN0Lmxlbmd0aF0gPSB7XHJcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IHZvbHVtZV9saXN0Lmxlbmd0aCxcclxuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZTogdHIudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKSxcclxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogW10sXHJcblx0XHRcdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIWN1cnJlbnRWb2x1bWUpXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IHZvbHVtZV9saXN0W3ZvbHVtZV9saXN0Lmxlbmd0aF0gPSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGU6ICdudWxsJyxcclxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9saXN0OiBbXSxcclxuXHRcdFx0XHRcdFx0XHRcdH07XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRsZXQgYSA9IHRyLmZpbmQoJy5zdWJ0aXRsZSBhJyk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX2RhdGU7XHJcblx0XHRcdFx0XHRcdFx0bGV0IGRkO1xyXG5cdFx0XHRcdFx0XHRcdGxldCBkYSA9IHRyLmZpbmQoJy5sb25nX3VwZGF0ZScpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoZGEuZmluZCgnc3Bhblt0aXRsZSo9XCIvXCJdJykubGVuZ3RoKVxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGRkID0gZGEuZmluZCgnc3Bhblt0aXRsZSo9XCIvXCJdJykuYXR0cigndGl0bGUnKS5yZXBsYWNlKC/mlLnnqL98Xlxccyt8XFxzKyQvZywgJycpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0aWYgKCFkZClcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRkYS5maW5kKCcqJykucmVtb3ZlKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRkZCA9IGRhLnRleHQoKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoZGQpXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9kYXRlID0gbW9tZW50KGRkLCAnWVlZWS9NTS9ERCBISDptbScpLmxvY2FsKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRfY2FjaGVfZGF0ZXMucHVzaChjaGFwdGVyX2RhdGUudW5peCgpKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdGxldCBocmVmID0gYS5wcm9wKCdocmVmJyk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdGxldCBkYXRhID0gc2VsZi5wYXJzZVVybChocmVmKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0aWYgKCFkYXRhLmNoYXB0ZXJfaWQpXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdGlmICh0ci5maW5kKCcuYm9va21hcmtlcl9ub3cnKS5sZW5ndGgpXHJcblx0XHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8qKlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQgKiBmaXggaHR0cHM6Ly9uY29kZS5zeW9zZXR1LmNvbS9uNzYzN2RqL1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQgKi9cclxuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKHRyLnByb3AoXCJvdXRlckhUTUxcIikpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYS5wcm9wKFwib3V0ZXJIVE1MXCIpKTtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGEpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZGF0YSk7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhocmVmKTtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGEuYXR0cignaHJlZicpKTtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKG5ldyBVUkwoaHJlZiwgZG9tLnVybCkpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGRvbS5fb3B0aW9ucyk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGRhdGEgPSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHVybDogbnVsbCxcclxuXHRcdFx0XHRcdFx0XHRcdFx0bm92ZWxfcGlkOiBub3ZlbF9zeW9zZXR1X2lkIGFzIHN0cmluZyxcclxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkIGFzIHN0cmluZyxcclxuXHRcdFx0XHRcdFx0XHRcdH0gYXMgYW55O1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdGhyZWYgPSBzZWxmLm1ha2VVcmwoZGF0YSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS51cmwgPSBocmVmO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZVxyXG5cdFx0XHRcdFx0XHRcdFx0LmNoYXB0ZXJfbGlzdFxyXG5cdFx0XHRcdFx0XHRcdFx0LnB1c2goe1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLmNoYXB0ZXJfbGlzdC5sZW5ndGgsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGU6IGEudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybDogaHJlZixcclxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmxfZGF0YTogZGF0YSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9kYXRlLFxyXG5cdFx0XHRcdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdFx0XHQ7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0O1xyXG5cclxuXHRcdFx0XHRfY2FjaGVfZGF0ZXMuc29ydCgpO1xyXG5cclxuXHRcdFx0XHRsZXQgbm92ZWxfZGF0ZSA9IG1vbWVudC51bml4KF9jYWNoZV9kYXRlc1tfY2FjaGVfZGF0ZXMubGVuZ3RoIC0gMV0pLmxvY2FsKCk7XHJcblxyXG5cdFx0XHRcdGxldCBhID0gYXdhaXQgZnJvbVVSTChgaHR0cHM6Ly8ke3VybF9kYXRhLm5vdmVsX3IxOFxyXG5cdFx0XHRcdFx0PyAnbmFyb3UxOCdcclxuXHRcdFx0XHRcdDogJ25hcm91J30uZGlwLmpwL3NlYXJjaC5waHA/dGV4dD0ke3VybF9kYXRhLm5vdmVsX2lkfSZub3ZlbD1hbGwmZ2VucmU9YWxsJm5ld19nZW5yZT1hbGwmbGVuZ3RoPTAmZG93bj0wJnVwPTEwMGAsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcclxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb20pXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdGxldCBoMiA9IGRvbS4kKGBkaXY6aGFzKD4gaDIuc2VhcmNoOmhhcyg+IGFbaHJlZio9XCIke3VybF9kYXRhLm5vdmVsX2lkfVwiXSkpYCkuZXEoMCk7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGgyID0gZG9tLiQoYGgyOmhhcyg+IGFbaHJlZio9XCIke3VybF9kYXRhLm5vdmVsX2lkfVwiXSlgKS5lcSgwKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0aWYgKCFoMi5sZW5ndGgpXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUud2FybihgY2FuIG5vdCBmb3VuZCBrZXl3b3JkIFwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIiwgd2lsbCB0cnkgdXNlIHRpdGxlIHNlYXJjaGApO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZnJvbVVSTChgaHR0cHM6Ly8ke3VybF9kYXRhLm5vdmVsX3IxOFxyXG5cdFx0XHRcdFx0XHRcdFx0PyAnbmFyb3UxOCdcclxuXHRcdFx0XHRcdFx0XHRcdDogJ25hcm91J30uZGlwLmpwL3NlYXJjaC5waHA/dGV4dD0ke25vdmVsX3RpdGxlfSZub3ZlbD1hbGwmZ2VucmU9YWxsJm5ld19nZW5yZT1hbGwmbGVuZ3RoPTAmZG93bj0wJnVwPTEwMGAsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcclxuXHRcdFx0XHRcdFx0XHRcdDtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0cmV0dXJuIGRvbTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRvbS51cmwpO1xyXG5cclxuXHRcdFx0XHRcdFx0bGV0IGRhdGE6IElNZGNvbmZNZXRhID0ge307XHJcblxyXG5cdFx0XHRcdFx0XHRsZXQgaDIgPSBkb20uJChgZGl2Omhhcyg+IGgyLnNlYXJjaDpoYXMoPiBhW2hyZWYqPVwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIl0pKWApLmVxKDApO1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKCFoMi5sZW5ndGgpXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRoMiA9IGRvbS4kKGBoMjpoYXMoPiBhW2hyZWYqPVwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIl0pYCkuZXEoMCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGxldCBzZWFyY2hfbGVmdCA9IGgyLnNpYmxpbmdzKCcuc2VhcmNoX2xlZnQnKS5lcSgwKTtcclxuXHRcdFx0XHRcdFx0bGV0IHNlYXJjaF9yaWdodCA9IGgyLnNpYmxpbmdzKCcuc2VhcmNoX3JpZ2h0JykuZXEoMCk7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coMTExMTExMTExMTExMTExMTExMTExKTtcclxuXHRcdFx0XHRcdFx0XHRjb25zb2xlLndhcm4oYGNhbiBub3QgZm91bmQga2V5d29yZCBmb3IgJHt1cmxfZGF0YS5ub3ZlbF9pZH1gKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGRhdGE7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coc2VhcmNoX2xlZnQpO1xyXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKHNlYXJjaF9yaWdodCk7XHJcblxyXG5cdFx0XHRcdFx0XHRkYXRhLm5vdmVsID0ge307XHJcblxyXG5cdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnN0YXR1cyA9IHNlYXJjaF9sZWZ0LmZpbmQoJy5ub3ZlbF90eXBlJykudGV4dCgpO1xyXG5cdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MgPSBbXTtcclxuXHJcblx0XHRcdFx0XHRcdHNlYXJjaF9yaWdodC5maW5kKCcua2V5d29yZCBhJylcclxuXHRcdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0bGV0IGsgPSBkb20uJChlbGVtKVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQudGV4dCgpXHJcblx0XHRcdFx0XHRcdFx0XHRcdC50cmltKClcclxuXHRcdFx0XHRcdFx0XHRcdFx0LnNwbGl0KC9bXFwvXFxzXS8pXHJcblx0XHRcdFx0XHRcdFx0XHRcdC5tYXAoZnVuY3Rpb24gKHMpXHJcblx0XHRcdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcy50cmltKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHRcdFx0XHRcdC5maWx0ZXIoKHYpID0+IHYpXHJcblx0XHRcdFx0XHRcdFx0XHQ7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzID0gZGF0YS5ub3ZlbC50YWdzLmNvbmNhdChrKTtcclxuXHRcdFx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0XHQ7XHJcblxyXG5cdFx0XHRcdFx0XHRkYXRhLmxpbmsgPSBbXTtcclxuXHJcblx0XHRcdFx0XHRcdGRhdGEubGluay5wdXNoKGBbZGlwLmpwXSgke2RvbS51cmx9KSAtIOWwj+iqrOWutuOBq+OBquOCjeOBhuOAgOabtOaWsOaDheWgseaknOe0omApO1xyXG5cclxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkYXRhKTtcclxuXHJcblx0XHRcdFx0XHRcdHJldHVybiBkYXRhO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZSlcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcihlKTtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcihgY2FuJ3QgZG93bmxvYWQgbm92ZWwgZXh0cmEgaW5mb2ApO1xyXG5cclxuXHRcdFx0XHRcdFx0cmV0dXJuIHt9O1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHQ7XHJcblxyXG5cdFx0XHRcdHJldHVybiB7XHJcblxyXG5cdFx0XHRcdFx0Li4uYSxcclxuXHJcblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXHJcblx0XHRcdFx0XHR1cmxfZGF0YSxcclxuXHJcblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcclxuXHRcdFx0XHRcdG5vdmVsX2F1dGhvcixcclxuXHJcblx0XHRcdFx0XHRub3ZlbF9kZXNjLFxyXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSxcclxuXHRcdFx0XHRcdG5vdmVsX3B1Ymxpc2hlcixcclxuXHJcblx0XHRcdFx0XHRub3ZlbF9zZXJpZXNfdGl0bGUsXHJcblxyXG5cdFx0XHRcdFx0bm92ZWxfc3lvc2V0dV9pZCxcclxuXHJcblx0XHRcdFx0XHR2b2x1bWVfbGlzdCxcclxuXHJcblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXHJcblxyXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXHJcblx0XHRcdFx0fSBhcyBJTm92ZWw7XHJcblx0XHRcdH0pXHJcblx0XHRcdDtcclxuXHR9XHJcblxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVTeW9zZXR1O1xyXG5cclxuIl19