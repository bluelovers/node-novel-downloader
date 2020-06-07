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
exports.NovelSiteWebqxs = void 0;
const util_1 = require("../../util");
const index_1 = require("../index");
const base_1 = __importDefault(require("../demo/base"));
//import { URL } from 'jsdom-url';
const jsdom_extra_1 = require("jsdom-extra");
const index_2 = require("../index");
const novel_text_1 = __importDefault(require("novel-text"));
let NovelSiteWebqxs = class NovelSiteWebqxs extends base_1.default {
    makeUrl(urlobj, bool, optionsRuntime) {
        let url;
        if (util_1.isUndef(urlobj.novel_pid) || bool < 0) {
            url = `http://www.webqxs.com/lightnovel/${urlobj.novel_id}.html`;
        }
        else {
            let cid = (!bool && urlobj.chapter_id) ? urlobj.chapter_id + '.html' : '';
            url = `http://www.webqxs.com/${urlobj.novel_pid}/${urlobj.novel_id}/${cid}`;
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
        url = urlobj.url.href;
        let r = /www\.webqxs\.com\/([\d]+)\/([\d]+)\/(?:([\d]+)\.html?)?/;
        let m = r.exec(url);
        if (m) {
            urlobj.novel_pid = m[1];
            urlobj.novel_id = m[2];
            urlobj.chapter_id = m[3];
            return urlobj;
        }
        r = /www\.webqxs\.com\/lightnovel\/(\d+).html/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        return urlobj;
    }
    createMainUrl(url, optionsRuntime) {
        let data = this.parseUrl(url);
        if (!data || util_1.isUndef(data.novel_pid) || !data.novel_id) {
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
        try {
            let html = util_1.minifyHTML(ret.dom.$('#articlecontent').html());
            html = html.replace(/^(&nbsp;){4}/gm, '');
            ret.dom.$('#articlecontent').html(html);
        }
        catch (e) {
        }
        //console.log(ret.dom.serialize());
        return ret.dom.$('#articlecontent').text();
    }
    async get_volume_list(inputUrl, optionsRuntime = {}) {
        const self = this;
        let url = await this.createMainUrl(inputUrl, optionsRuntime);
        return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            let url_data = self.parseUrl(dom.url.href);
            let novel_title = dom.$('.story-head .story-title').text();
            let data_meta = await self._get_meta(url, optionsRuntime);
            let _cache_dates = [];
            let volume_list = [];
            let currentVolume;
            let table = $('.ml_content .ml_list ul').eq(0);
            table.children()
                .each(function (index) {
                // @ts-ignore
                let tr = dom.$(this);
                if (tr.is('div.volume-z')) {
                    currentVolume = volume_list[volume_list.length] = {
                        volume_index: volume_list.length,
                        volume_title: novel_text_1.default.trim(tr.text()),
                        chapter_list: [],
                    };
                }
                else if (tr.is('li')) {
                    tr.find('a')
                        .each(function (index) {
                        // @ts-ignore
                        let a = dom.$(this);
                        let href = a.prop('href');
                        let data = self.parseUrl(href);
                        if (!data.chapter_id) {
                            throw new Error();
                        }
                        else {
                            href = self.makeUrl(data);
                            data.url = href;
                        }
                        let chapter_title = a.text().trim();
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
                ...data_meta,
                url: dom.url,
                url_data,
                novel_title,
                volume_list,
                novel_date,
                checkdate: index_2.moment().local(),
                imgs: [],
            };
        })
            .tap(function (novel) {
            console.log(novel);
        });
    }
    async _get_meta(inputUrl, optionsRuntime) {
        let url = this.makeUrl(this.parseUrl(inputUrl), -1);
        return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(function (dom) {
            const $ = dom.$;
            let novel_author = $('.z-author .f-text-overflow')
                .text()
                .trim();
            $('.u-bookDetail-synopsis .u-synopsis-text > strong:eq(0)').remove();
            let novel_desc = $('.u-bookDetail-synopsis .u-synopsis-text')
                .text()
                .trim();
            return {
                url,
                novel_author,
                novel_desc,
            };
        });
    }
};
NovelSiteWebqxs.IDKEY = 'webqxs';
NovelSiteWebqxs.disabled = true;
NovelSiteWebqxs = __decorate([
    index_1.staticImplements()
], NovelSiteWebqxs);
exports.NovelSiteWebqxs = NovelSiteWebqxs;
exports.default = NovelSiteWebqxs;
//# sourceMappingURL=index.js.map