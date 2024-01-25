"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSiteSyosetu = exports.EnumProtocolMode = void 0;
const tslib_1 = require("tslib");
/// <reference types="jquery" />
const const_1 = require("node-novel-info/lib/const");
const jsdom_extra_1 = require("jsdom-extra");
const index_1 = require("../index");
const index_2 = require("../index");
const index_3 = require("../index");
const NovelSiteDemo = tslib_1.__importStar(require("../demo/base"));
const layout_1 = tslib_1.__importDefault(require("@node-novel/layout"));
const log_1 = require("../../util/log");
const html_1 = require("../../util/html");
const mitemin_1 = require("mitemin");
const util_1 = require("./util");
const url_1 = tslib_1.__importDefault(require("../../util/url"));
const get_volume_list_1 = require("./util/get_volume_list");
var EnumProtocolMode;
(function (EnumProtocolMode) {
    EnumProtocolMode[EnumProtocolMode["NONE"] = 0] = "NONE";
    EnumProtocolMode[EnumProtocolMode["HTTPS"] = 1] = "HTTPS";
    EnumProtocolMode[EnumProtocolMode["HTTP"] = 2] = "HTTP";
})(EnumProtocolMode || (exports.EnumProtocolMode = EnumProtocolMode = {}));
let NovelSiteSyosetu = class NovelSiteSyosetu extends NovelSiteDemo.NovelSite {
    constructor(options, ...argv) {
        super(options, ...argv);
        this.optionsInit.retryDelay = this.optionsInit.retryDelay || 25000;
    }
    static check(url, ...argv) {
        return (0, util_1.check)(url, ...argv);
    }
    static makeUrl(urlobj, bool, ...argv) {
        return (0, util_1.makeUrl)(urlobj, bool, ...argv);
    }
    static parseUrl(url, ...argv) {
        return (0, util_1.parseUrl)(url, ...argv);
    }
    makeUrl(urlobj, bool, ...argv) {
        return (0, util_1.makeUrl)(urlobj, bool, ...argv);
    }
    parseUrl(url, ...argv) {
        return (0, util_1.parseUrl)(url, ...argv);
    }
    session(optionsRuntime, url) {
        // @ts-ignore
        optionsRuntime.sessionData = optionsRuntime.sessionData || {};
        // @ts-ignore
        optionsRuntime.sessionData.over18 = 'yes';
        /*
        optionsRuntime.sessionData.sasieno = 0;
        optionsRuntime.sessionData.lineheight = 0;
        optionsRuntime.sessionData.fontsize = 0;
        optionsRuntime.sessionData.novellayout = 0;
        optionsRuntime.sessionData.fix_menu_bar = 0;
        */
        super.session(optionsRuntime, url);
        //let url = optionsRuntime[SYMBOL_CACHE].url;
        optionsRuntime.optionsJSDOM.cookieJar;
        //		optionsRuntime.optionsJSDOM.runScripts = 'dangerously';
        //		optionsRuntime.optionsJSDOM.virtualConsole = false;
        //optionsRuntime.optionsJSDOM.requestOptions = optionsRuntime.optionsJSDOM.requestOptions || {};
        //		if (!optionsRuntime.optionsJSDOM.requestOptions.jar)
        //		{
        //optionsRuntime.optionsJSDOM.requestOptions.jar = optionsRuntime.optionsJSDOM.cookieJar.wrapForRequest();
        //		}
        //optionsRuntime.optionsJSDOM.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36';
        return this;
    }
    download(url, downloadOptions = {}) {
        return super.download(url, downloadOptions);
    }
    async _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        if (!optionsRuntime.disableTxtdownload) {
            return ret.body;
        }
        const $ = ret.dom.$;
        let _imgs = $('#novel_p, #novel_honbun, #novel_a')
            .find('img[src]');
        await index_2.PromiseBluebird
            .resolve(_imgs.toArray())
            .each(async (elem, i) => {
            let img = $(elem);
            let src = img.prop('src');
            cache.chapter.imgs = cache.chapter.imgs || [];
            await (0, mitemin_1.parseAsync)(src)
                .then(data => {
                if (data.fullsize) {
                    src = data.fullsize;
                    img.prop('src', src);
                }
            })
                .catch(e => log_1.console.error(e));
            // @ts-ignore
            cache.chapter.imgs.push(src);
            // @ts-ignore
            cache.novel.imgs.push(src);
        });
        if (optionsRuntime.keepImage) {
            await (0, html_1._keepImageInContext)(_imgs, $, {
                prefix: '挿絵',
            });
        }
        let bodys = [
            $('#novel_p'),
            $('#novel_honbun'),
            $('#novel_a'),
        ];
        bodys.forEach(t => (0, html_1.keepFormatTag)(t, {
            $,
            optionsRuntime,
        }));
        return bodys.map(v => v.text()).filter(function (v) {
            return v;
        }).join('\n\n==================\n\n');
    }
    _createChapterUrl({ novel, volume, chapter, }, optionsRuntime) {
        if (optionsRuntime.disableTxtdownload) {
            let url = this.makeUrl({
                chapter_id: chapter.chapter_id,
                novel_id: novel.url_data.novel_id,
            });
            return this._hackURL(url, optionsRuntime);
        }
        return super._createChapterUrl({
            novel,
            volume,
            chapter,
        }, optionsRuntime);
    }
    _saveReadme(optionsRuntime, options = {}, ...opts) {
        options[this.IDKEY] = {
            txtdownload_id: optionsRuntime[index_1.SYMBOL_CACHE].novel.novel_syosetu_id || '',
            series_id: optionsRuntime[index_1.SYMBOL_CACHE].novel.novel_syosetu_series_id || '',
        };
        return super._saveReadme(optionsRuntime, options, {
            options: {
                textlayout: {
                    allow_lf2: true,
                },
            },
        }, ...opts);
    }
    _hackURL(obj, optionsRuntime, page) {
        if (typeof obj === 'string') {
            obj = (0, url_1.default)(obj);
        }
        if (obj.hostname === 'ncode.syosetu.com' || obj.hostname === 'novel18.syosetu.com') {
            switch (optionsRuntime.protocolMode) {
                case 2 /* EnumProtocolMode.HTTP */:
                    obj.protocol = 'http:';
                    break;
                case true:
                case 1 /* EnumProtocolMode.HTTPS */:
                    obj.protocol = 'https:';
                    break;
            }
        }
        if (page > 1) {
            obj.searchParams.set('p', page);
        }
        else if (page) {
            obj.searchParams.delete('p');
        }
        return obj;
    }
    _fetchChapter(url, optionsRuntime, _cache_) {
        let tryed;
        const self = this;
        let _fetchChapter = super._fetchChapter;
        return super._fetchChapter(url, optionsRuntime, _cache_)
            .then(async function (ret) {
            if (ret == null)
                return ret;
            const dom = ret.dom;
            if (!tryed && dom && dom.$('#modal .yes #yes18').length) {
                const $ = dom.$;
                //console.error(`無法成功讀取 R18 頁面`, url.href);
                tryed = true;
                try {
                    $('#modal .yes #yes18').click();
                    $('#modal .yes #yes18')[0].click();
                }
                catch (e) {
                }
                optionsRuntime.optionsJSDOM.cookieJar.setCookieSync('over18=yes; Domain=.syosetu.com; Path=/; hostOnly=false', url);
                optionsRuntime.optionsJSDOM.cookieJar.setCookieSync(`over18=yes; Domain=${dom.url.host}; Path=/; hostOnly=false`, dom.url);
                //console.debug(optionsRuntime.optionsJSDOM.cookieJar.getAllCookies());
                optionsRuntime.optionsJSDOM.referrer = dom.url;
                optionsRuntime.optionsJSDOM.requestOptions = optionsRuntime.optionsJSDOM.requestOptions || {};
                optionsRuntime.optionsJSDOM.requestOptions.form = dom.url;
                return _fetchChapter.call(self, url, optionsRuntime, _cache_)
                    .then(function (ret) {
                    const dom = ret.dom;
                    const $ = dom.$;
                    if ($('#modal .yes #yes18').length) {
                        log_1.console.error(`無法成功讀取 R18 頁面`, url.href);
                        //process.exit();
                    }
                    return ret;
                });
            }
            return ret;
        });
    }
    async _novel18(url, dom, optionsRuntime = {}) {
        const $ = dom.$;
        if (!$('#novel_contents').length || $('#modal .yes #yes18').length) {
            //console.log(dom.url, dom._options);
            $('#modal .yes #yes18').click();
            let jar = dom._options.requestOptions.jar;
            try {
                // @ts-ignore
                jar.setCookieSync('over18=yes; Domain=.syosetu.com; Path=/; hostOnly=false', url);
            }
            catch (e) {
                try {
                    jar.setCookie('over18=yes; Domain=.syosetu.com; Path=/; hostOnly=false', url);
                }
                catch (e) {
                    log_1.console.error(`setCookie 失敗`, e);
                }
            }
            //console.log(dom.serialize());
            return (0, jsdom_extra_1.fromURL)(url, Object.assign(optionsRuntime.optionsJSDOM, {
            //cookieJar: dom._options.requestOptions.jar._jar,
            //requestOptions: dom._options.requestOptions,
            }));
        }
        //console.log(dom._options.requestOptions.jar);
        return dom;
    }
    _getExtraInfoURL(search, url_data, optionsRuntime) {
        let optionsJSDOM = {
            ...optionsRuntime.optionsJSDOM,
            requestOptions: {
                ...optionsRuntime.optionsJSDOM.requestOptions,
            },
        };
        optionsJSDOM.requestOptions = optionsJSDOM.requestOptions || {};
        // @ts-ignore
        optionsJSDOM.requestOptions.followRedirect = true;
        let _domain = 1 ? 'nar.jp' : 'dip.jp';
        let _url = `https://${url_data.novel_r18
            ? 'narou18'
            : 'narou'}.${_domain}/search.php?text=${search}&novel=all&genre=all&new_genre=all&length=0&down=0&up=100`;
        log_1.consoleDebug.debug(`試圖取得小說相關資訊 (1)`, _url);
        return (0, jsdom_extra_1.fromURL)(_url, optionsJSDOM);
    }
    _getExtraInfoURL2(url_data, optionsRuntime, data_meta) {
        let subdomain = url_data.novel_r18 ? 'novel18' : 'ncode';
        let info_url = `https://${subdomain}.syosetu.com/novelview/infotop/ncode/${url_data.novel_id}/`;
        data_meta = data_meta || {};
        log_1.consoleDebug.debug(`試圖取得小說相關資訊 (2)`, info_url);
        return (0, jsdom_extra_1.fromURL)(info_url, optionsRuntime.optionsJSDOM)
            .then(function (dom) {
            let $ = dom.$;
            $('#noveltable1 tr')
                .each(function () {
                // @ts-ignore
                let _tr = $(this);
                let _th_text = String($('th', _tr).text());
                if (_th_text.indexOf('キーワード') != -1) {
                    data_meta.novel = data_meta.novel || {};
                    data_meta.novel.tags = data_meta.novel.tags || [];
                    let _td_text = String($('td', _tr).text())
                        .replace(/\s+/g, ' ')
                        .trim();
                    _td_text
                        .split(/\s+/)
                        .forEach(function (tag) {
                        if (tag) {
                            let _t = tag.split('/').map(s => s.trim());
                            data_meta.novel.tags.push(..._t);
                        }
                    });
                }
                else if (_th_text.indexOf('ジャンル') != -1 || _th_text.indexOf('掲載サイト') != -1) {
                    data_meta.novel = data_meta.novel || {};
                    data_meta.novel.tags = data_meta.novel.tags || [];
                    let _td_text = String($('td', _tr).text())
                        .replace(/\s+/g, ' ')
                        .trim();
                    if (_td_text) {
                        data_meta.novel.tags.push(_td_text);
                    }
                }
            });
            let age_limit = $('#age_limit');
            if (age_limit.length) {
                let _t = age_limit.text().trim();
                if (_t) {
                    data_meta.novel = data_meta.novel || {};
                    data_meta.novel.tags = data_meta.novel.tags || [];
                    data_meta.novel.tags.push(_t);
                    if (_t.match(/r18/i)) {
                        data_meta.novel.tags.push(`novel18`);
                    }
                }
            }
            data_meta.link = data_meta.link || [];
            data_meta.link.push(`[小説情報](${dom.url})`);
            return data_meta;
        })
            .catch(e => {
            log_1.consoleDebug.gray.error(e.toString());
            log_1.console.warn(`下載小說資訊時發生錯誤 (2)，此提醒訊息可以無視`);
            return data_meta;
        });
    }
    createMainUrl(url, optionsRuntime, page) {
        return this._hackURL(super.createMainUrl(url, optionsRuntime), optionsRuntime, page);
    }
    async get_volume_list(url, optionsRuntime = {}) {
        const self = this;
        url = await this.createMainUrl(url, optionsRuntime);
        log_1.consoleDebug.debug(`get_volume_list`, url.toString());
        return (0, jsdom_extra_1.fromURL)(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            return self._novel18(url, dom, optionsRuntime);
        })
            .then(async function (dom) {
            log_1.consoleDebug.info(`開始處理小說資訊以及章節列表`);
            let novel_title = dom.$('.novel_title').text();
            let novel_author = layout_1.default.trim(dom
                .$('.novel_writername a, .novel_writername')
                .eq(-1)
                .text())
                .replace(/^.*作者：/, '');
            let novel_desc = dom.$('#novel_ex').text();
            let novel_publisher = self.IDKEY;
            let url_data = self.parseUrl(dom.url.href);
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
            let { page, volume_list, _cache_dates, volume_length, chapter_length, } = await (0, get_volume_list_1._get_volume_list_main)(self, url, optionsRuntime, dom, novel_syosetu_id);
            let novel_date = index_3.moment.unix(_cache_dates[_cache_dates.length - 1]).local();
            let a = await self._getExtraInfoURL(url_data.novel_id, url_data, optionsRuntime)
                .then(function (dom) {
                let h2 = dom.$(`div:has(> h2.search:has(> a[href*="${url_data.novel_id}"]))`).eq(0);
                if (!h2.length) {
                    h2 = dom.$(`h2:has(> a[href*="${url_data.novel_id}"])`).eq(0);
                }
                if (!h2.length) {
                    log_1.console.warn(`can not found keyword "${url_data.novel_id}", will try use title search`);
                    /**
                     * https://narou18.nar.jp/search.php?text=%E3%83%A9%E3%83%B3%E3%82%AF%E5%86%92%E9%99%BA%E8%80%85%E3%81%AE%E3%82%B9%E3%83%AD%E3%83%BC%E3%83%A9%E3%82%A4%E3%83%95&novel=all&genre=all&new_genre=all&length=0&down=0&up=100
                     */
                    let title = novel_title
                        .replace(/[\wａ-ｚ]+/ig, ' ')
                        .trim();
                    return self._getExtraInfoURL(title, url_data, optionsRuntime);
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
                let search_left = h2.nextAll('.search_left:eq(0)').eq(0);
                let search_right = h2.nextAll('.search_right:eq(0)').eq(0);
                if (!search_left.length) {
                    search_left = h2.siblings('.search_left:eq(0)').eq(0);
                }
                if (!search_right.length) {
                    search_right = h2.siblings('.search_right:eq(0)').eq(0);
                }
                if (!h2.length) {
                    //console.log(111111111111111111111);
                    log_1.console.warn(`can not found keyword for ${url_data.novel_id}`, dom.url);
                    return data;
                }
                //console.log(search_left);
                //console.log(search_right);
                data.novel = {};
                data.novel.status = search_left.find('.novel_type').text().trim();
                data.novel.tags = [];
                if (data.novel.status === '完結済') {
                    data.novel.novel_status |= const_1.EnumNovelStatus.AUTHOR_DONE;
                    data.novel.tags.push(data.novel.status);
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
                search_left
                    .find('[class*="new_genre"], .nocgenre')
                    .each(function (index, elem) {
                    let k = dom.$(elem)
                        .text()
                        .trim()
                        .replace(/^\s+|\s+$/g, '');
                    if (k) {
                        data.novel.tags.push(k);
                    }
                });
                data.link = data.link || [];
                data.link.push(`[${dom.url.hostname}](${dom.url}) - 小説家になろう　更新情報検索`);
                //console.log(data);
                return data;
            })
                .catch(function (e) {
                log_1.consoleDebug.gray.error(e.toString());
                log_1.console.warn(`下載小說資訊時發生錯誤 (1)，此提醒訊息可以無視`);
                return {};
            });
            a = await self._getExtraInfoURL2(url_data, optionsRuntime, a);
            let novel_series_title;
            let novel_syosetu_series_id;
            {
                let _a = dom.$('#novel_contents .series_title');
                let t = _a.text()
                    .replace(/[\r\n\t]+|^\s+|\s+$/g, '');
                if (t) {
                    novel_series_title = t;
                    _a = _a.find('a');
                    let _t = _a.attr('href') || '';
                    if (/\/(\w{6,})\//i.exec(_t)) {
                        novel_syosetu_series_id = RegExp.$1;
                        // @ts-ignore
                        a.link = a.link || [];
                        let title = novel_series_title
                            .replace(/[\[\]\~\`]/g, '\\$0')
                            .replace(/["']/g, '');
                        // @ts-ignore
                        a.link.push(`[${title}](${_a.prop('href')})`);
                    }
                }
            }
            log_1.consoleDebug.debug(`結束處理小說資訊以及章節列表`);
            return {
                ...a,
                url: dom.url,
                url_data,
                page,
                novel_title,
                novel_author,
                novel_desc,
                novel_date,
                novel_publisher,
                novel_series_title,
                novel_syosetu_series_id,
                novel_syosetu_id,
                volume_list,
                checkdate: (0, index_3.moment)().local(),
                volume_length,
                chapter_length,
                imgs: [],
            };
        });
    }
};
exports.NovelSiteSyosetu = NovelSiteSyosetu;
NovelSiteSyosetu.IDKEY = 'syosetu';
exports.NovelSiteSyosetu = NovelSiteSyosetu = tslib_1.__decorate([
    (0, index_1.staticImplements)(),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], NovelSiteSyosetu);
exports.default = NovelSiteSyosetu;
//# sourceMappingURL=index.js.map