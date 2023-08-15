"use strict";
/**
 * Created by user on 2018/3/25/025.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSiteClass = void 0;
const tslib_1 = require("tslib");
const util_1 = require("../../util");
const index_1 = require("../index");
const base_1 = tslib_1.__importDefault(require("../demo/base"));
//import { URL } from 'jsdom-url';
const jsdom_extra_1 = require("jsdom-extra");
const index_2 = require("../index");
const layout_1 = tslib_1.__importDefault(require("@node-novel/layout"));
const path_1 = tslib_1.__importDefault(require("path"));
const util_2 = require("./util");
const html_1 = require("../../util/html");
let NovelSiteClass = class NovelSiteClass extends base_1.default {
    static check(url, ...argv) {
        return (0, util_2.check)(url, ...argv);
    }
    static makeUrl(urlobj, bool, ...argv) {
        return (0, util_2.makeUrl)(urlobj, bool, ...argv);
    }
    static parseUrl(url, ...argv) {
        return (0, util_2.parseUrl)(url, ...argv);
    }
    makeUrl(urlobj, bool, ...argv) {
        return (0, util_2.makeUrl)(urlobj, bool, ...argv);
    }
    parseUrl(url, ...argv) {
        return (0, util_2.parseUrl)(url, ...argv);
    }
    createMainUrl(url, optionsRuntime) {
        let data = this.parseUrl(url);
        if (!data || !data.novel_id) {
            console.log(data);
            throw new ReferenceError();
        }
        let ret = this.makeUrl(data, true, optionsRuntime);
        return ret;
    }
    _stripContent(text) {
        return text
            .replace(/^[\t\n]+|\s+$/g, '')
            .replace(/^\t+/gm, '');
    }
    _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        let body_selector = '#novelBoby';
        (0, html_1.keepFormatTag)(ret.dom.$(body_selector), {
            $,
            optionsRuntime,
        });
        let text = ret.dom.$(body_selector).text();
        text = this._stripContent(text);
        return text;
    }
    async get_volume_list(inputUrl, optionsRuntime = {}) {
        const self = this;
        let url = await this.createMainUrl(inputUrl, optionsRuntime);
        return (0, jsdom_extra_1.fromURL)(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            let url_data = self.parseUrl(dom.url.href);
            let data_meta = await self._get_meta(url, optionsRuntime, {
                dom,
            });
            let _cache_dates = [];
            let volume_list = [];
            let currentVolume;
            let novel_vip = 0;
            let table = $('.episodes > *');
            table
                .each(function (index) {
                // @ts-ignore
                let tr = dom.$(this);
                if (tr.is('h3')) {
                    let title = layout_1.default.trim((0, util_1.trim)(tr.text())) || 'null';
                    currentVolume = volume_list[volume_list.length] = {
                        volume_index: volume_list.length,
                        volume_title: title,
                        chapter_list: [],
                    };
                }
                else if (tr.is('.chapter-rental')) {
                    let title = layout_1.default.trim((0, util_1.trim)(tr.find('h3').text())) || 'null';
                    currentVolume = volume_list[volume_list.length] = {
                        volume_index: volume_list.length,
                        volume_title: title,
                        chapter_list: [],
                    };
                }
                else if (tr.is('.rental')) {
                    if (!currentVolume) {
                        currentVolume = volume_list[volume_list.length] = {
                            volume_index: volume_list.length,
                            volume_title: 'null',
                            chapter_list: [],
                        };
                    }
                    tr.find('.rental-episode')
                        .each(function () {
                        // @ts-ignore
                        let item = dom.$(this);
                        let a = item.find('a:has(> h3)');
                        let href = a.prop('href') || a.attr('data-href') || a.attr('href');
                        let data = self.parseUrl(href);
                        if (!data.chapter_id) {
                            //console.log(href, data);
                            //console.log(item.html());
                            //console.log(a.html());
                            throw new Error(`發生錯誤 無法解析章節網址`);
                        }
                        else {
                            href = self.makeUrl(data);
                            data.url = href;
                        }
                        let chapter_title = (0, util_1.trim)(a.find('> h3').text());
                        if (!chapter_title) {
                            console.log(href);
                            console.log(a);
                            throw new Error();
                        }
                        currentVolume
                            .chapter_list
                            .push({
                            chapter_index: currentVolume.chapter_list.length,
                            chapter_title,
                            chapter_id: data.chapter_id,
                            chapter_url: href,
                            chapter_url_data: data,
                        });
                    });
                }
                else if (tr.is('.episode')) {
                    if (!currentVolume) {
                        currentVolume = volume_list[volume_list.length] = {
                            volume_index: volume_list.length,
                            volume_title: 'null',
                            chapter_list: [],
                        };
                    }
                    let a = tr.find('a:has(.title)');
                    let href = a.prop('href');
                    let data = self.parseUrl(href);
                    if (!data.chapter_id) {
                        //console.log(href, data);
                        throw new Error();
                    }
                    else {
                        href = self.makeUrl(data);
                        data.url = href;
                    }
                    let chapter_title = (0, util_1.trim)(a.find('.title').text());
                    if (!chapter_title) {
                        console.log(href);
                        console.log(a);
                        throw new Error();
                    }
                    let chapter_date;
                    let dd;
                    let da = a.find('.open-date');
                    dd = (0, util_1.trim)(da.text());
                    if (dd) {
                        chapter_date = (0, index_2.moment)(dd, 'YYYY/MM/DD HH:mm').local();
                        _cache_dates.push(chapter_date.unix());
                    }
                    currentVolume
                        .chapter_list
                        .push({
                        chapter_index: currentVolume.chapter_list.length,
                        chapter_title,
                        chapter_id: data.chapter_id,
                        chapter_url: href,
                        chapter_url_data: data,
                        chapter_date,
                    });
                }
            });
            let novel_date;
            if (_cache_dates.length) {
                _cache_dates.sort();
                novel_date = index_2.moment.unix(_cache_dates[_cache_dates.length - 1]).local();
            }
            return {
                url: dom.url,
                url_data,
                ...data_meta,
                volume_list,
                novel_date,
                checkdate: (0, index_2.moment)().local(),
                imgs: [],
            };
        })
            .tap(function (novel) {
            console.dir(novel, {
                colors: true,
                //depth: 3,
            });
        });
    }
    async _get_meta(inputUrl, optionsRuntime, cache) {
        const self = this;
        let url = this.makeUrl(this.parseUrl(inputUrl), -1);
        //return fromURL(url, optionsRuntime.optionsJSDOM)
        return Promise.resolve(cache.dom)
            .then(function (dom) {
            const $ = dom.$;
            let data = {};
            data.novel = {};
            let novel_author = (0, util_1.trim)($('#main .content-main .author a:eq(0)').text());
            let novel_title = (0, util_1.trim)($('.content-info .title a').text());
            let novel_cover;
            let novel_cover2 = $('.content-info .cover img').prop('src') || '';
            if (novel_cover2 && !novel_cover2.match(/no_image\.png/)) {
                novel_cover = novel_cover2;
            }
            let novel_desc = (0, util_1.trim)($('.content-info .abstract').text());
            let url_data = self.parseUrl(url);
            data.novel.tags = [];
            $('#main .content-tags .tag > a')
                .each(function () {
                // @ts-ignore
                data.novel.tags.push((0, util_1.trim)($(this).text()));
            });
            data.novel.status = (0, util_1.trim)($('.content-info .content-statuses .content-status.complete').text());
            {
                let a = $('.content-info .content-statuses .content-status.novels');
                if (a.length) {
                    data.novel.tags.push((0, util_1.trim)(a.text()));
                }
            }
            {
                let a = $('.content-info .content-statuses .content-status.volume');
                if (a.length) {
                    data.novel.tags.push((0, util_1.trim)(a.text()));
                }
            }
            let novel_publisher = self.IDKEY;
            return {
                url,
                url_data,
                ...data,
                novel_title,
                novel_cover,
                novel_desc,
                novel_publisher,
                novel_author,
            };
        });
    }
};
exports.NovelSiteClass = NovelSiteClass;
NovelSiteClass.IDKEY = path_1.default.basename(__dirname);
exports.NovelSiteClass = NovelSiteClass = tslib_1.__decorate([
    (0, index_1.staticImplements)()
], NovelSiteClass);
exports.default = NovelSiteClass;
//# sourceMappingURL=index.js.map