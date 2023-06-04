"use strict";
/**
 * Created by user on 2018/3/17/017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSiteESJZone = void 0;
const tslib_1 = require("tslib");
const util_1 = require("../../util");
const tree_1 = tslib_1.__importDefault(require("../demo/tree"));
const jsdom_extra_1 = require("jsdom-extra");
const index_1 = require("../index");
const fetch_1 = require("../../fetch");
const value_1 = require("../../util/value");
const html_1 = require("../../util/html");
const util_2 = require("./util");
const site_1 = require("esjzone-api/lib/util/site");
const volNovelTree_1 = tslib_1.__importDefault(require("./util/volNovelTree"));
const html_2 = require("restful-decorator-plugin-jsdom/lib/html");
const regexp_cjk_with_plugin_enabled_1 = tslib_1.__importDefault(require("regexp-cjk-with-plugin-enabled"));
//import { URL } from 'jsdom-url';
let NovelSiteESJZone = exports.NovelSiteESJZone = class NovelSiteESJZone extends tree_1.default {
    _constructor(...argv) {
        // @ts-ignore
        super._constructor(...argv);
        this._reContext = new regexp_cjk_with_plugin_enabled_1.default(/^(?:由於百度\s*\d+\s*年以前的貼文都刪了|所以不清楚是由哪位大佬翻譯|若轉載的動作冒犯了您，先跟您說聲抱歉！|也麻煩留言告知，我們會將此文下架|已?由?譯者授權轉載！?|原文網址：[^\n]+|轉載自貼吧|ESJ輕小說(\s*(?:https:\/\/)?www\.esjzone\.cc\/?)?|僅供個人學習交流使用，禁作商業用途|下載后請在24小時內刪除，[^\n]*不負擔任何責任|請尊重翻譯、掃圖、錄入、校對的辛勤勞動，轉載請保留信息|轉載自真白|由於百度\s*\d+\s*以前的貼文全刪了|來源：百度貼吧|請尊重翻譯、掃圖、錄入、校對的辛勤勞動，轉載請保留資訊)$/uigm);
    }
    /*
    session<T = NovelSite.IOptionsRuntime>(optionsRuntime: Partial<T & IDownloadOptions>, url: URL)
    {
        optionsRuntime.optionsJSDOM.minifyHTML = false;

        return this;
    }
     */
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
    async _decodeChapter(ret, optionsRuntime, cache) {
        const { dom } = ret;
        const { $ } = dom;
        let html = dom.serialize();
        let m = html
            .match(/getTranslation\(['"]([^\'"]+)['"]/i);
        if (m) {
            let code = m[1];
            await (0, fetch_1.retryRequest)(ret.url, {
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
                let elems = $('.trans, .t');
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
        const $ = ret.dom.$;
        try {
            let target = ret.dom.$('.container .row:has(.forum-content)');
            let html = (0, util_1.minifyHTML)(target.html());
            target.html(html);
        }
        catch (e) {
        }
        const $content = (0, site_1._getChapterDomContent)($);
        if (!$content.html()) {
            throw this._fetchChapterRetryError(`發現防爬蟲機制，將稍後再試圖下載`, ret, optionsRuntime, cache);
        }
        (0, util_2._remove_ad)($);
        //await this._decodeChapter(ret, optionsRuntime, cache);
        (0, util_2._p_2_br)($content.find('> p'), ret.dom.$);
        /*
        let elem = ret.dom.$('.container .forum-content');

        elem.html(function (i, old: string)
        {
            return old
                .replace(/(\<br\>){3,4}/g, '$1')
                .replace(/(?<=\<br\>)(?=[^\n])/g, '\n')
        });
         */
        let title = (0, util_1.trim)($('.container .row .single-post-meta + h2').text());
        (0, html_1._saveImageToAttach)(ret.dom.$, $content.find('img[src]'), cache);
        if (optionsRuntime.keepImage) {
            await (0, html_1._keepImageInContext)($content.find('img[src]'), $);
        }
        (0, html_1.keepFormatTag)($content, {
            $,
            optionsRuntime,
        });
        let txt = $content
            .text()
            .replace(this._reContext, '')
            .replace(/^\s+|\s+$/g, '');
        if (txt.indexOf(title + '\n') === 0) {
            txt = txt.slice(title.length + 1)
                .replace(/^\n+/g, '');
        }
        let contribute = (0, value_1.dotGetValue)(cache, 'novel.contribute', { default: [] });
        txt = txt.replace(new regexp_cjk_with_plugin_enabled_1.default(/^翻譯：([^\n]+)\n/), (s, v) => {
            v = v.replace(/^[\s　\xA0]+|[\s　\xA0]+$/g, '');
            if (v && !contribute.includes(v)) {
                contribute.push(v);
            }
            return '';
        });
        let v = (0, site_1._getChapterData)($).author;
        if (v && !contribute.includes(v)) {
            contribute.push(v);
        }
        if (contribute.length) {
            (0, value_1.dotSetValue)(cache, 'novel.contribute', contribute);
        }
        /*
        let html = elem.html();

        throw console.dir({
            html,
            txt,
        });
         */
        //		console.dir(txt);
        //		process.exit();
        txt = txt
            .replace(/^\n{2,}/g, '\n');
        return txt;
    }
    async get_volume_list(url, optionsRuntime = {}) {
        const self = this;
        url = await this.createMainUrl(url, optionsRuntime);
        //console.dir(optionsRuntime.optionsJSDOM)
        return (0, jsdom_extra_1.fromURL)(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            let _data = {};
            let { name: novel_title, authors: novel_author } = (0, site_1._getBookInfo)($, _data);
            let novel_date;
            if (_data.last_update_time) {
                novel_date = index_1.moment.unix(_data.last_update_time);
            }
            let novel_publisher = self.IDKEY;
            let url_data = self.parseUrl(dom.url.href);
            let volume_list = [];
            //const novelTree = optionsRuntime.novelTree;
            const novelTree = (0, volNovelTree_1.default)($, {
                novelTree: optionsRuntime.novelTree,
            }, self).novelTree;
            /*
            let currentVolume: TreeNode<IRowVolume>;

            let _content = $('.product-detail:eq(0)');
            let table = _content.find('#tab1 a[href], #tab1  .non');

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

            //console.dir(table.length)

            table
                .each(function (index, elem)
                {
                    let tr = $(elem);
                    let _this = tr;

                    if (_this.is('.non'))
                    {
                        let volume_title = trim(_this.text());

                        if (volume_title)
                        {
                            currentVolume = novelTree.addVolume({
                                volume_title,
                                volume_index: novelTree.root().size(),
                                total_idx: total_idx++,
                            });

                            return;
                        }
                    }

                    if (tr.is('a'))
                    {
                        let a = tr;
                        let chapter_title = trim(a.text(), true);

                        //console.log(chapter_title)

                        let href = a.prop('href');

                        let data = self.parseUrl(href);

                        if (!data.chapter_id)
                        {
                            return;
                        }
                        else
                        {
                            href = self.makeUrl(data);

                            data.url = href;
                        }

                        let chapter: IRowChapter = {
                            chapter_title,
                            chapter_id: data.chapter_id,
                            chapter_url: href,
                            chapter_url_data: data,
                            chapter_index: currentVolume.size(),
                            total_idx: total_idx++,
                        };

                        novelTree.addChapter(chapter, currentVolume)
                    }
                })
            ;

             */
            //_remove_ad(dom.$);
            let data_meta = {
                novel: {},
            };
            (0, site_1._getBookLinks)($)
                .forEach(item => {
                data_meta.link = data_meta.link || [];
                data_meta.link.push(item.href);
            });
            (0, site_1._getBookTags)($)
                .forEach(name => {
                data_meta.novel.tags = data_meta.novel.tags || [];
                data_meta.novel.tags.push(name);
            });
            data_meta.novel.cover = (0, site_1._getBookCover)($);
            let $desc = (0, html_2.tryMinifyHTMLOfElem)((0, site_1._getBookElemDesc)($));
            (0, util_2._p_2_br)($desc.find('p'), $, true);
            let novel_desc = (0, util_1.trim)($desc.text());
            /*
            console.dir({
                html: $desc.html(),
                novel_desc,
            })

            process.exit();
             */
            //console.dir(dom.serialize())
            return {
                ...data_meta,
                url: dom.url,
                url_data,
                novel_author,
                novel_date,
                novel_desc,
                novel_title,
                novel_publisher,
                //volume_list,
                novelTree,
                checkdate: (0, index_1.moment)().local(),
                imgs: [],
            };
        });
    }
};
NovelSiteESJZone.IDKEY = 'esjzone';
exports.NovelSiteESJZone = NovelSiteESJZone = tslib_1.__decorate([
    (0, index_1.staticImplements)()
], NovelSiteESJZone);
exports.default = NovelSiteESJZone;
//# sourceMappingURL=index.js.map