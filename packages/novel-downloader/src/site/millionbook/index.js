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
exports.NovelSiteClass = void 0;
const strip_1 = require("../../strip");
const util_1 = require("../../util");
const index_1 = require("../index");
const base_1 = __importDefault(require("../demo/base"));
//import { URL } from 'jsdom-url';
const jsdom_extra_1 = require("jsdom-extra");
const index_2 = require("../index");
const novel_text_1 = __importDefault(require("novel-text"));
const path_1 = __importDefault(require("path"));
const util_2 = require("./util");
let NovelSiteClass = class NovelSiteClass extends base_1.default {
    static check(url, ...argv) {
        return util_2.check(url, ...argv);
    }
    static makeUrl(urlobj, bool, ...argv) {
        return util_2.makeUrl(urlobj, bool, ...argv);
    }
    static parseUrl(url, ...argv) {
        return util_2.parseUrl(url, ...argv);
    }
    makeUrl(urlobj, bool, ...argv) {
        return util_2.makeUrl(urlobj, bool, ...argv);
    }
    parseUrl(url, ...argv) {
        return util_2.parseUrl(url, ...argv);
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
        text = strip_1.stripContent(text);
        //process.exit();
        return text
            .replace(/^　　/gm, '')
            .replace(/^[ \uFEFF\xA0]+/gm, '')
            .replace(/^\n+/, '')
            .replace(/\s+$/, '');
    }
    _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        ret.dom.$('.tt2 center').remove();
        let body_selector = '.tt2';
        try {
            let html = util_1.minifyHTML(ret.dom.$(body_selector).html());
            //html = html.replace(/^(&nbsp;){4}/gm, '');
            html = html.replace(/^\s+|\s+$/g, '');
            ret.dom.$(body_selector).html(html);
        }
        catch (e) {
        }
        ret.dom.$(body_selector).html(function (i, old) {
            return old;
        });
        let text = ret.dom.$(body_selector).text();
        text = this._stripContent(text);
        return text;
    }
    async get_volume_list(inputUrl, optionsRuntime = {}) {
        const self = this;
        let url = await this.createMainUrl(inputUrl, optionsRuntime);
        return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            // @ts-ignore
            $.fn.eachReverse = function (...argv) {
                // @ts-ignore
                return $($(this).get().reverse()).each(...argv);
            };
            let url_data = self.parseUrl(dom.url.href);
            let data_meta = await self._get_meta(url, optionsRuntime, {
                dom,
            });
            let _cache_dates = [];
            let volume_list = [];
            let currentVolume;
            let novel_vip = 0;
            let table = $('body > center > table center:has(font[color="#FF0000"]) > center > table td');
            table
                .each(function (index) {
                // @ts-ignore
                let tr = dom.$(this);
                let title = novel_text_1.default.trim(util_1.trim(tr.text())).replace(/^◎/, '');
                if (title && tr.find('a').length == 0) {
                    currentVolume = volume_list[volume_list.length] = {
                        volume_index: volume_list.length,
                        volume_title: title,
                        chapter_list: [],
                    };
                }
                else if (title && tr.has('a').length) {
                    tr.find('a:eq(0)')
                        .each(function (index) {
                        // @ts-ignore
                        let a = dom.$(this);
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
                        });
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
                //novel_date,
                checkdate: index_2.moment().local(),
                imgs: [],
            };
        })
            .tap(function (novel) {
            console.dir(novel, {
                colors: true,
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
            let novel_author = util_1.trim($('title').text().match(/\(([^()]+)\)\s*$/)[1]);
            let novel_title = util_1.trim($('body > center > table center font[color="#FF0000"]').text());
            let url_data = self.parseUrl(url);
            return {
                url,
                url_data,
                ...data,
                novel_title,
                novel_author,
            };
        });
    }
};
NovelSiteClass.IDKEY = path_1.default.basename(__dirname);
NovelSiteClass = __decorate([
    index_1.staticImplements()
], NovelSiteClass);
exports.NovelSiteClass = NovelSiteClass;
exports.default = NovelSiteClass;
//# sourceMappingURL=index.js.map