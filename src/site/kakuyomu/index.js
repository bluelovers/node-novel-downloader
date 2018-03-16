"use strict";
/**
 * Created by user on 2018/3/17/017.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
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
let NovelSiteKakuyomu = class NovelSiteKakuyomu extends index_1.default {
    /**
     * https://kakuyomu.jp/works/4852201425154898215/episodes/4852201425154936315
     */
    makeUrl(urlobj, bool) {
        let pad = (!bool && urlobj.chapter_id) ? '/episodes/' + urlobj.chapter_id : '';
        return new jsdom_url_1.URL(`https://kakuyomu.jp/works/${urlobj.novel_id}${pad}`);
    }
    parseUrl(url) {
        let urlobj = {
            url,
            novel_pid: null,
            novel_id: null,
            chapter_id: null,
        };
        //url = url.toString();
        try {
            urlobj.url = new jsdom_url_1.URL(url);
            url = urlobj.url.href;
        }
        catch (e) {
            console.warn(e.toString() + ` "${url}"`);
        }
        if (typeof url != 'string') {
            throw new TypeError(url);
        }
        let r;
        let m;
        r = /^(\d{10,})$/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        r = /kakuyomu\.jp\/works\/(\d+)(?:\/(?:episodes\/(\d+)))?/g;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            urlobj.chapter_id = m[2];
            return urlobj;
        }
        return urlobj;
    }
    session(optionsRuntime) {
        let url = optionsRuntime[index_1.SYMBOL_CACHE].url;
        optionsRuntime.optionsJSDOM.cookieJar = optionsRuntime.optionsJSDOM.cookieJar || new jsdom_extra_2.LazyCookieJar();
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
                if (!data || !data.novel_id) {
                    console.log(data);
                    throw new ReferenceError();
                }
                url = self.makeUrl(data, true);
            }
            optionsRuntime[index_1.SYMBOL_CACHE].url = url;
            self.session(optionsRuntime);
            let novel = await self.get_volume_list(url, optionsRuntime);
            let idx = downloadOptions.startIndex || 0;
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
                    else {
                        let url = self.makeUrl({
                            chapter_id: chapter.chapter_id,
                            novel_id: novel.url_data.novel_id,
                        });
                        //console.log(url);
                        fn = function () {
                            return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
                                .then(async function (dom) {
                                return dom.$('#contentMain .widget-episodeBody').text();
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
                let md = node_novel_info_1.default.stringify({
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
                await fs_iconv_1.default.outputFile(file, md);
            }
            return novel;
        });
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
            let novel_title = dom.$('#workTitle').text();
            let novel_author = dom.$('#workAuthor-activityName').text();
            let novel_desc;
            dom.$('#description').each(function () {
                $('#introduction').addClass('isExpanded');
                $('.ui-truncateText-expandButton').remove();
                $('.test-introduction-rest-text').show();
                let d = [];
                $(this)
                    .find('#catchphrase-body, #catchphrase-authorLabel')
                    .each(function () {
                    d.push($(this).text().replace(/\s+$/g, ''));
                });
                if (d.length) {
                    d.push(' ');
                }
                d.push($('#introduction').text().replace(/\s+$/g, ''));
                novel_desc = d
                    .filter(v => v)
                    .join("\n")
                    .replace(/[ \t　]+$/gm, '');
            });
            let novel_publisher = self.IDKEY;
            let url_data = self.parseUrl(dom.url.href);
            let volume_list = [];
            let currentVolume;
            let table = dom.$('#table-of-contents').find('.widget-toc-chapter, .widget-toc-episode');
            let _cache_dates = [];
            table
                .each(function (index) {
                let tr = dom.$(this);
                if (tr.is('.widget-toc-chapter')) {
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
                    let a = tr.find('a:eq(0)');
                    let chapter_title = a.find('.widget-toc-episode-titleLabel').text();
                    let chapter_date;
                    let dd;
                    let da = a.find('.widget-toc-episode-datePublished');
                    if (!dd) {
                        dd = da.attr('datetime').replace(/^\s+|\s+$/g, '');
                    }
                    if (dd) {
                        chapter_date = index_3.moment(dd).local();
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
                    });
                }
            });
            _cache_dates.sort();
            let novel_date = index_3.moment.unix(_cache_dates[_cache_dates.length - 1]).local();
            let data_meta = {};
            {
                data_meta.novel = {};
                data_meta.novel.tags = [];
                $('#workMeta-flags')
                    .find('#workGenre a, #workMeta-attentionsAndTags [itemprop="keywords"] a')
                    .each(function () {
                    let t = $(this).text().replace(/^\s+|\s+$/g, '');
                    if (t) {
                        data_meta.novel.tags.push(t);
                    }
                });
                $('#table-of-contents .widget-toc-workStatus span:eq(0)')
                    .each(function () {
                    data_meta.novel.status = $(this).text().replace(/^\s+|\s+$/g, '');
                });
            }
            return Object.assign({}, data_meta, { url: dom.url, url_data,
                novel_title,
                novel_author,
                novel_desc,
                novel_date,
                novel_publisher,
                volume_list, checkdate: index_3.moment().local(), imgs: [] });
        });
    }
};
NovelSiteKakuyomu.IDKEY = 'kakuyomu';
NovelSiteKakuyomu = __decorate([
    index_1.staticImplements()
], NovelSiteKakuyomu);
exports.NovelSiteKakuyomu = NovelSiteKakuyomu;
exports.default = NovelSiteKakuyomu;
