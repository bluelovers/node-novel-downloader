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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSiteX23qb = void 0;
const util_1 = require("../../util");
const tree_1 = __importDefault(require("../demo/tree"));
const jsdom_extra_1 = require("jsdom-extra");
//import { URL } from 'jsdom-url';
const index_1 = require("../index");
const index_2 = require("../index");
const fetch_1 = require("../../fetch");
const regexp_cjk_1 = require("regexp-cjk");
const util_2 = require("./util");
const util_3 = require("../esjzone/util");
/**
 * 铅笔小说
 * @example https://www.x23qb.com/book/284/
 */
let NovelSiteX23qb = class NovelSiteX23qb extends tree_1.default {
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
    async _decodeChapter(ret, optionsRuntime, cache) {
        const { dom } = ret;
        const { $ } = dom;
        let html = dom.serialize();
        let m = html
            .match(/getTranslation\(['"]([^\'"]+)['"]/i);
        if (m) {
            let code = m[1];
            await fetch_1.retryRequest(ret.url, {
                // @ts-ignore
                ...optionsRuntime.requestOptions,
                method: 'POST',
                form: {
                    plxf: 'getTranslation',
                    plxa: [code],
                },
            })
                .then((v) => {
                v = v
                    .replace(/\<JinJing\>/, '')
                    .replace(/\<\/JinJing\>/, '');
                return JSON.parse(v);
            })
                /*
                .tap(v => {
                    console.dir('-----------------------')
                    console.dir(v)
                    console.dir('-----------------------')
                })
                 */
                .tap((a) => {
                let elems = $('.trans');
                a.forEach((v, i) => {
                    elems.eq(i).html(v);
                });
            });
        }
        //console.dir(m);
        //process.exit();
    }
    async _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        try {
            let html = util_1.minifyHTML($('#mlfy_main_text').html());
            $('#mlfy_main_text').html(html);
        }
        catch (e) {
        }
        let elem = ret.dom.$('#TextContent');
        elem
            .find('> .tp, > .ke, > .rd, > .bd, script')
            .remove();
        util_3._p_2_br(elem.find('p'), ret.dom.$);
        elem.html(function (i, old) {
            return old
                .replace(/(\<br\>){3,4}/g, '$1')
                .replace(/(?<=\<br\>)(?=[^\n])/g, '\n');
        });
        let title = util_1.trim(ret.dom.$('mlfy_main_text > h1:eq(0)').text());
        if (!this._cache_re) {
            this._cache_re = new regexp_cjk_1.zhRegExp(/^(?:鉛\s*筆\s*小\s*說\(w\s*w\s*w\s*\.\s*x\s*2\s*3\s*q\s*b\s*\.\s*c\s*o\s*m\))$/uigm);
        }
        let txt = elem
            .text()
            .replace(this._cache_re, '')
            .replace(/^\s+|\s+$/g, '')
            .replace(/^[ \xA0]+|[ \xA0]+$/gm, '');
        return txt;
    }
    async get_volume_list(url, optionsRuntime = {}) {
        const self = this;
        url = await this.createMainUrl(url, optionsRuntime);
        return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            let novel_title = dom.$('.d_title h1').text();
            let novel_publisher = self.IDKEY;
            let url_data = self.parseUrl(dom.url.href);
            let novel_desc = $('#bookintro > p:eq(0)').text();
            let volume_list = [];
            const novelTree = optionsRuntime.novelTree;
            let currentVolume;
            let table = $('#chapterList li')
                .find('a');
            let _cache_dates = [];
            let total_idx = 0;
            {
                let volume_title = 'null';
                let volume_level = null;
                currentVolume = novelTree.addVolume({
                    volume_title,
                    volume_level,
                    volume_index: novelTree.root().size(),
                    total_idx: total_idx++,
                });
            }
            table
                .each(function (index, elem) {
                let tr = dom.$(elem);
                if (1) {
                    let a = tr;
                    let chapter_title = util_1.trim(a.text(), true);
                    let href = a.prop('href');
                    let data = self.parseUrl(href);
                    if (!data.chapter_id) {
                        return;
                    }
                    else {
                        href = self.makeUrl(data);
                        data.url = href;
                    }
                    let chapter = {
                        chapter_title,
                        chapter_id: data.chapter_id,
                        chapter_url: href,
                        chapter_url_data: data,
                        chapter_index: currentVolume.size(),
                        total_idx: total_idx++,
                    };
                    novelTree.addChapter(chapter, currentVolume);
                }
            });
            let data_meta = {
                novel: {
                    tags: [],
                },
            };
            let novel_date = index_2.moment($('#uptime > span').text());
            let tag = $('.bookright #count li:eq(0) span:eq(0)').text().trim();
            if (tag) {
                data_meta.novel.tags.push(tag);
            }
            let novel_author = $('.p_author a:eq(0)').text().trim();
            data_meta.link = data_meta.link || [];
            data_meta.link.push($('.p_author a:eq(0)').prop('href'));
            $('.bookright #count li span')
                .each((i, elem) => {
                let txt = $(elem).text().trim();
                let bool = [
                    '完結済',
                    '完結',
                    '已完結',
                    '已完成',
                    '完结済',
                    '完结',
                    '已完结',
                    '已完成',
                ].includes(txt);
                if (bool) {
                    data_meta.novel.status = txt;
                }
            });
            return {
                ...data_meta,
                url: dom.url,
                url_data,
                novel_title,
                novel_publisher,
                novel_author,
                novel_date,
                novel_desc,
                //volume_list,
                novelTree,
                checkdate: index_2.moment().local(),
                imgs: [],
            };
        });
    }
};
NovelSiteX23qb.IDKEY = 'x23qb';
NovelSiteX23qb = __decorate([
    index_1.staticImplements()
], NovelSiteX23qb);
exports.NovelSiteX23qb = NovelSiteX23qb;
exports.default = NovelSiteX23qb;
//# sourceMappingURL=index.js.map