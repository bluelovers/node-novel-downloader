"use strict";
/**
 * Created by user on 2018/3/25/025.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSiteIqing = void 0;
const util_1 = require("../../util");
const index_1 = require("../index");
const base_1 = __importDefault(require("../demo/base"));
//import { URL } from 'jsdom-url';
const jsdom_extra_1 = require("jsdom-extra");
const index_2 = require("../index");
let NovelSiteIqing = /** @class */ (() => {
    let NovelSiteIqing = class NovelSiteIqing extends base_1.default {
        checkSessionData(data, optionsRuntime = {}) {
            if (data) {
                if (data.sessionid && data.steins_csrf_token) {
                    data.online = 1;
                    return data;
                }
            }
            return data;
        }
        makeUrl(urlobj, bool, optionsRuntime) {
            let url;
            if (bool || !urlobj.chapter_id) {
                url = `https://www.iqing.com/book/${urlobj.novel_id}/`;
            }
            else {
                url = `https://poi.iqing.com/content/${urlobj.chapter_id}/chapter/`;
            }
            // @ts-ignore
            return new URL(url);
        }
        parseUrl(url, options) {
            let urlobj = {
                url: url,
                novel_pid: null,
                novel_id: null,
                chapter_id: null,
            };
            // @ts-ignore
            urlobj.url = new URL(url);
            // @ts-ignore
            url = urlobj.url.href;
            let r = /www\.iqing\.com\/read\/(\d+)/;
            // @ts-ignore
            let m = r.exec(url);
            if (m) {
                urlobj.chapter_id = m[1];
                return urlobj;
            }
            r = /poi\.iqing\.com\/content\/(\d+)\/chapter/;
            // @ts-ignore
            if (m = r.exec(url)) {
                urlobj.chapter_id = m[1];
                return urlobj;
            }
            r = /www\.iqing\.com\/book\/(\d+)/;
            // @ts-ignore
            if (m = r.exec(url)) {
                urlobj.novel_id = m[1];
                return urlobj;
            }
            return urlobj;
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
        _parseChapter(ret, optionsRuntime, cache) {
            if (!ret) {
                return '';
            }
            let text;
            if (ret.json && ret.json.results && ret.json.results.length) {
                text = ret.json.results
                    .reduce(function (a, b) {
                    if (b && b.value) {
                        a.push(b.value);
                    }
                    else {
                        console.log(777, b);
                        throw new Error();
                    }
                    return a;
                }, [])
                    .join("\n");
                if (!text) {
                    console.log(666, ret.json.results);
                    throw new Error();
                }
                cache.chapter.chapter_date = index_2.moment(ret.json.updated_time).local();
                if (cache.chapter.chapter_vip) {
                    text = `付費章节\n\n==========================\n\n${text}`;
                }
                return text;
            }
            console.log(ret);
            throw new Error;
            // @ts-ignore
            return text;
        }
        async get_volume_list(inputUrl, optionsRuntime = {}) {
            const self = this;
            let url = await this.createMainUrl(inputUrl, optionsRuntime);
            return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
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
                let table = $('#book-menu .list-volume li');
                table
                    .each(function (index) {
                    // @ts-ignore
                    let tr = dom.$(this);
                    if (tr.is('.volume')) {
                        currentVolume = volume_list[volume_list.length] = {
                            volume_index: volume_list.length,
                            volume_title: util_1.trim(tr.find('h3').text()),
                            chapter_list: [],
                        };
                    }
                    else if (tr.is('.chapter')) {
                        let a = tr.find('a');
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
                        let chapter_vip;
                        chapter_vip = tr.find('.lock').length;
                        if (chapter_vip) {
                            novel_vip++;
                        }
                        let chapter_title = util_1.trim(a.text());
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
                            chapter_vip,
                        });
                    }
                });
                let novel_date;
                if (_cache_dates.length) {
                    _cache_dates.sort();
                    novel_date = index_2.moment.unix(_cache_dates[_cache_dates.length - 1]).local();
                }
                if (novel_vip) {
                    data_meta.novel = data_meta.novel || {};
                    data_meta.novel.tags = data_meta.novel.tags || [];
                    data_meta.novel.tags.push('VIP');
                }
                return {
                    url: dom.url,
                    url_data,
                    ...data_meta,
                    novel_vip,
                    volume_list,
                    //novel_date,
                    checkdate: index_2.moment().local(),
                    imgs: [],
                };
            })
                .tap(function (novel) {
                console.log(novel);
            });
        }
        async _get_meta(inputUrl, optionsRuntime, cache) {
            const self = this;
            let url = inputUrl;
            return Promise.resolve(cache.dom)
                .then(function (dom) {
                const $ = dom.$;
                let data = {};
                data.novel = {};
                let novel_author = $('#author-info .name[itemprop="author"] [itemprop="name"]')
                    .text()
                    .trim();
                $('#book-top .intro').find('.t').remove();
                let novel_desc = $('#book-top .intro')
                    .text()
                    .trim();
                data.novel.tags = [];
                $('#cat-list .cat, .book-title .book-tag')
                    .each(function () {
                    // @ts-ignore
                    let t = util_1.trim($(this)
                        .text()
                        .replace(/\(\d+\)/g, ''));
                    if (t) {
                        data.novel.tags.push(t);
                        // @ts-ignore
                        if (t == '连载' && $(this).is('.book-tag')) {
                            data.novel.status = t;
                        }
                    }
                });
                let novel_date;
                {
                    let d = $('.update-time [itemprop="datePublished"]')
                        .attr('content')
                        //.replace(/更新：/, '')
                        .trim();
                    //console.log(d);
                    novel_date = index_2.moment(d).local();
                }
                let novel_title = util_1.trim($('.book-title .title').text());
                $('#book-top img.cover[src]').each(function () {
                    // @ts-ignore
                    data.novel.cover = $(this)
                        .prop('src')
                        .replace(/\?imageMogr2.+$/, '');
                });
                let url_data = self.parseUrl(url);
                return {
                    url,
                    url_data,
                    ...data,
                    novel_title,
                    novel_author,
                    novel_desc,
                    novel_date,
                };
            });
        }
    };
    NovelSiteIqing.IDKEY = 'iqing';
    NovelSiteIqing.disabled = true;
    NovelSiteIqing = __decorate([
        index_1.staticImplements()
    ], NovelSiteIqing);
    return NovelSiteIqing;
})();
exports.NovelSiteIqing = NovelSiteIqing;
exports.default = NovelSiteIqing;
//# sourceMappingURL=index.js.map