"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fetch_1 = require("../../fetch");
const fs_iconv_1 = require("fs-iconv");
const path = require("path");
const node_novel_info_1 = require("node-novel-info");
const jsdom_extra_1 = require("jsdom-extra");
// @ts-ignore
const jsdom_extra_2 = require("jsdom-extra");
const jsdom_url_1 = require("jsdom-url");
const index_1 = require("../index");
const index_2 = require("../index");
const index_3 = require("../index");
let NovelSiteSyosetu = class NovelSiteSyosetu extends index_1.default {
    constructor(options, ...argv) {
        super(options, ...argv);
    }
    session(optionsRuntime) {
        let url = optionsRuntime[index_1.SYMBOL_CACHE].url;
        optionsRuntime.optionsJSDOM.cookieJar = optionsRuntime.optionsJSDOM.cookieJar || new jsdom_extra_2.LazyCookieJar();
        optionsRuntime.optionsJSDOM.cookieJar
            .setCookieSync('over18=yes; Domain=.syosetu.com; Path=/', url.href);
    }
    download(url, downloadOptions = {}) {
        const self = this;
        const [PATH_NOVEL_MAIN, optionsRuntime] = this.getOutputDir(downloadOptions);
        optionsRuntime[index_1.SYMBOL_CACHE] = {};
        optionsRuntime.optionsJSDOM = Object.assign({}, index_1.defaultJSDOMOptions, optionsRuntime.optionsJSDOM);
        optionsRuntime.optionsJSDOM.cookieJar = optionsRuntime.optionsJSDOM.cookieJar || new jsdom_extra_2.LazyCookieJar();
        return index_2.PromiseBluebird
            .bind(self)
            .then(async function () {
            {
                let data = self.parseUrl(url);
                if (!data.novel_id) {
                    console.log(data);
                    throw new ReferenceError();
                }
                url = self.makeUrl(data, true);
            }
            optionsRuntime[index_1.SYMBOL_CACHE].url = url;
            self.session(optionsRuntime);
            let novel = await self.get_volume_list(url, optionsRuntime);
            //console.log(novel);
            let idx = 0;
            let path_novel = path.join(self.PATH_NOVEL_MAIN, `${self.trimFilenameNovel(novel.novel_title)}_(${novel.url_data.novel_id})`);
            let ret = await index_2.PromiseBluebird
                .mapSeries(novel.volume_list, function (volume, vid) {
                let dirname;
                {
                    let _vid = '';
                    if (!optionsRuntime.noDirPrefix) {
                        _vid = vid.toString().padStart(4, '0') + '0';
                        _vid += '_';
                    }
                    dirname = path.join(path_novel, `${_vid}${self.trimFilenameVolume(volume.volume_title)}`);
                }
                return index_2.PromiseBluebird
                    .mapSeries(volume.chapter_list, async function (chapter) {
                    chapter.chapter_index = (idx++);
                    let ext = '.txt';
                    let file;
                    {
                        let prefix = '';
                        if (!optionsRuntime.noFirePrefix) {
                            prefix = chapter.chapter_index.toString()
                                .padStart(4, '0') + '0';
                            prefix += '_';
                        }
                        let pad = '';
                        if (!optionsRuntime.noFilePadend) {
                            pad = '.' + chapter.chapter_date.format('YYYYMMDDHHmm');
                        }
                        file = path.join(dirname, `${prefix}${self.trimFilenameChapter(chapter.chapter_title)}${pad}${ext}`);
                    }
                    if (!optionsRuntime.disableCheckExists && fs_iconv_1.default.existsSync(file)) {
                        let txt = await fs_iconv_1.default.readFile(file);
                        if (txt.toString()) {
                            //console.log(`skip\n${volume.volume_title}\n${chapter.chapter_title}`);
                            return file;
                        }
                    }
                    else {
                        //console.log(`${chapter.chapter_title} ${pad}`);
                    }
                    let fn;
                    if (optionsRuntime.disableDownload) {
                        fn = async function () {
                            return '';
                        };
                    }
                    else if (!optionsRuntime.disableTxtdownload) {
                        fn = function () {
                            return fetch_1.retryRequest(chapter.chapter_url, {
                                delay: 25000,
                                jar: optionsRuntime.optionsJSDOM.cookieJar,
                            });
                        };
                    }
                    else {
                        let url = self.makeUrl({
                            chapter_id: chapter.chapter_id,
                            novel_id: novel.url_data.novel_id,
                        });
                        //console.log(url);
                        fn = function () {
                            return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
                                .then(async function (dom) {
                                return [
                                    dom.$('#novel_p').text(),
                                    dom.$('#novel_honbun').text(),
                                    dom.$('#novel_a').text(),
                                ].filter(function (v) {
                                    return v;
                                }).join('\n\n==================\n\n');
                            });
                        };
                    }
                    //console.log(url);
                    await index_2.PromiseBluebird.resolve().then(function () {
                        return fn()
                            .then(async function (text) {
                            await fs_iconv_1.default.outputFile(file, text);
                            return text;
                        });
                    });
                    return file;
                });
            })
                .tap(ls => {
                let file = path.join(path_novel, `${self.trimFilenameNovel(novel.novel_title)}.${novel.url_data.novel_id}.json`);
                //console.log(ls);
                return fs_iconv_1.default.outputJSON(file, novel, {
                    spaces: "\t",
                });
            });
            {
                let options = {};
                options[self.IDKEY] = {
                    txtdownload_id: novel.novel_syosetu_id,
                };
                let md = node_novel_info_1.default.stringify({
                    novel: {
                        tags: [
                            self.IDKEY,
                        ],
                        series: {
                            name: novel.novel_series_title || '',
                        },
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
                await fs_iconv_1.default.outputFile(file, md);
            }
            return novel;
        })
            .finally(function () {
            if (0) {
                console.dir(optionsRuntime.optionsJSDOM.cookieJar, {
                    depth: null,
                    colors: true,
                });
            }
        });
    }
    makeUrl(urlobj, bool) {
        let subdomain = urlobj.novel_r18 ? 'novel18' : 'ncode';
        if (urlobj.novel_pid && urlobj.chapter_id) {
            return new jsdom_url_1.URL(`https://${subdomain}.syosetu.com/txtdownload/dlstart/ncode/${urlobj.novel_pid}/?no=${urlobj.chapter_id}&hankaku=0&code=utf-8&kaigyo=crlf`);
        }
        let pad = (!bool && urlobj.chapter_id) ? urlobj.chapter_id : '';
        return new jsdom_url_1.URL(`http://${subdomain}.syosetu.com/${urlobj.novel_id}/${pad}`);
    }
    parseUrl(url) {
        let urlobj = {
            url: new jsdom_url_1.URL(url),
            novel_pid: null,
            novel_id: null,
            chapter_id: null,
            novel_r18: null,
        };
        //url = url.toString();
        url = urlobj.url.href;
        let r;
        let m;
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
        {
            let data = self.parseUrl(url);
            if (!data.novel_id) {
                throw new ReferenceError();
            }
            url = self.makeUrl(data, true);
        }
        return await jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            if (!$('#novel_contents').length || $('#modal .yes #yes18').length) {
                //console.log(dom.url, dom._options);
                $('#modal .yes #yes18').click();
                dom._options.requestOptions.jar.setCookie('over18=yes; Domain=.syosetu.com; Path=/', url);
                //console.log(dom.serialize());
                return jsdom_extra_1.fromURL(url, Object.assign(optionsRuntime.optionsJSDOM, {}));
            }
            //console.log(dom._options.requestOptions.jar);
            return dom;
        })
            .then(async function (dom) {
            let novel_title = dom.$('.novel_title').text();
            let novel_author = dom.$('.novel_writername a').text();
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
                    .replace(/[\r\n\t]+|^\s+|\s+$/g);
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
                if (m = dt.match(/ncode\/(\d+)/)) {
                    novel_syosetu_id = m[1];
                }
                else {
                    throw new Error();
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
                        chapter_date = index_3.moment(dd, 'YYYY/MM/DD HH:mm').local();
                        _cache_dates.push(chapter_date.unix());
                    }
                    let href = a.prop('href');
                    let data = self.parseUrl(href);
                    if (!data.chapter_id) {
                        /*
                        console.log(a);
                        console.log(data);
                        console.log(href);
                        console.log(a.attr('href'));
                        console.log(new URL(href, dom.url));

                        console.log(dom._options);
                        */
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
            let novel_date = index_3.moment.unix(_cache_dates[_cache_dates.length - 1]).local();
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
                volume_list, checkdate: index_3.moment().local(), imgs: [] });
        });
    }
};
NovelSiteSyosetu.IDKEY = 'syosetu';
NovelSiteSyosetu = __decorate([
    index_1.staticImplements()
], NovelSiteSyosetu);
exports.NovelSiteSyosetu = NovelSiteSyosetu;
exports.default = NovelSiteSyosetu;
