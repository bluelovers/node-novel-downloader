"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="jquery" />
const const_1 = require("node-novel-info/lib/const");
const jsdom_extra_1 = require("jsdom-extra");
const index_1 = require("../index");
const index_2 = require("../index");
const index_3 = require("../index");
const NovelSiteDemo = require("../demo/base");
const novel_text_1 = require("novel-text");
const log_1 = require("../../util/log");
const html_1 = require("../../util/html");
const mitemin_1 = require("mitemin");
const util_1 = require("./util");
const url_1 = require("../../util/url");
var EnumProtocolMode;
(function (EnumProtocolMode) {
    EnumProtocolMode[EnumProtocolMode["NONE"] = 0] = "NONE";
    EnumProtocolMode[EnumProtocolMode["HTTPS"] = 1] = "HTTPS";
    EnumProtocolMode[EnumProtocolMode["HTTP"] = 2] = "HTTP";
})(EnumProtocolMode = exports.EnumProtocolMode || (exports.EnumProtocolMode = {}));
let NovelSiteSyosetu = /** @class */ (() => {
    let NovelSiteSyosetu = class NovelSiteSyosetu extends NovelSiteDemo.NovelSite {
        constructor(options, ...argv) {
            super(options, ...argv);
            this.optionsInit.retryDelay = this.optionsInit.retryDelay || 25000;
        }
        static check(url, ...argv) {
            return util_1.check(url, ...argv);
        }
        static makeUrl(urlobj, bool, ...argv) {
            return util_1.makeUrl(urlobj, bool, ...argv);
        }
        static parseUrl(url, ...argv) {
            return util_1.parseUrl(url, ...argv);
        }
        makeUrl(urlobj, bool, ...argv) {
            return util_1.makeUrl(urlobj, bool, ...argv);
        }
        parseUrl(url, ...argv) {
            return util_1.parseUrl(url, ...argv);
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
                await mitemin_1.parseAsync(src)
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
                await html_1._keepImageInContext(_imgs, $, {
                    prefix: '挿絵',
                });
            }
            let bodys = [
                $('#novel_p'),
                $('#novel_honbun'),
                $('#novel_a'),
            ];
            bodys.forEach(t => html_1.keepFormatTag(t, {
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
        _hackURL(obj, optionsRuntime) {
            if (typeof obj === 'string') {
                obj = url_1.default(obj);
            }
            if (obj.hostname === 'ncode.syosetu.com' || obj.hostname === 'novel18.syosetu.com') {
                switch (optionsRuntime.protocolMode) {
                    case 2 /* HTTP */:
                        obj.protocol = 'http';
                        break;
                    case true:
                    case 1 /* HTTPS */:
                        obj.protocol = 'https';
                        break;
                }
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
                dom._options.requestOptions.jar.setCookie('over18=yes; Domain=.syosetu.com; Path=/; hostOnly=false', url);
                //console.log(dom.serialize());
                return jsdom_extra_1.fromURL(url, Object.assign(optionsRuntime.optionsJSDOM, {
                //cookieJar: dom._options.requestOptions.jar._jar,
                //requestOptions: dom._options.requestOptions,
                }));
            }
            //console.log(dom._options.requestOptions.jar);
            return dom;
        }
        _getExtraInfoURL(search, url_data, optionsRuntime) {
            let optionsJSDOM = Object.assign(Object.assign({}, optionsRuntime.optionsJSDOM), { requestOptions: Object.assign({}, optionsRuntime.optionsJSDOM.requestOptions) });
            optionsJSDOM.requestOptions = optionsJSDOM.requestOptions || {};
            optionsJSDOM.requestOptions.followRedirect = true;
            let _domain = 1 ? 'nar.jp' : 'dip.jp';
            let _url = `https://${url_data.novel_r18
                ? 'narou18'
                : 'narou'}.${_domain}/search.php?text=${search}&novel=all&genre=all&new_genre=all&length=0&down=0&up=100`;
            log_1.consoleDebug.debug(`試圖取得小說相關資訊 (1)`, _url);
            return jsdom_extra_1.fromURL(_url, optionsJSDOM);
        }
        _getExtraInfoURL2(url_data, optionsRuntime, data_meta) {
            let subdomain = url_data.novel_r18 ? 'novel18' : 'ncode';
            let info_url = `https://${subdomain}.syosetu.com/novelview/infotop/ncode/${url_data.novel_id}/`;
            data_meta = data_meta || {};
            log_1.consoleDebug.debug(`試圖取得小說相關資訊 (2)`, info_url);
            return jsdom_extra_1.fromURL(info_url, optionsRuntime.optionsJSDOM)
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
        createMainUrl(url, optionsRuntime) {
            return this._hackURL(super.createMainUrl(url, optionsRuntime), optionsRuntime);
        }
        async get_volume_list(url, optionsRuntime = {}) {
            const self = this;
            url = await this.createMainUrl(url, optionsRuntime);
            log_1.consoleDebug.debug(`get_volume_list`, url.toString());
            return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
                .then(async function (dom) {
                return self._novel18(url, dom, optionsRuntime);
            })
                .then(async function (dom) {
                log_1.consoleDebug.info(`開始處理小說資訊以及章節列表`);
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
                    // @ts-ignore
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
                            if (tr.find('.bookmarker_now').length) {
                                /**
                                 * fix https://ncode.syosetu.com/n7637dj/
                                 */
                                return;
                            }
                            log_1.console.log(tr.prop("outerHTML"));
                            log_1.console.log(a.prop("outerHTML"));
                            log_1.console.log(a);
                            log_1.console.log(data);
                            log_1.console.log(href);
                            log_1.console.log(a.attr('href'));
                            // @ts-ignore
                            log_1.console.log(new URL(href, dom.url));
                            log_1.console.log(dom._options);
                            throw new Error();
                        }
                        else {
                            data = {
                                url: null,
                                novel_pid: novel_syosetu_id,
                                chapter_id: data.chapter_id,
                            };
                            href = self._hackURL(self.makeUrl(data), optionsRuntime);
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
                return Object.assign(Object.assign({}, a), { url: dom.url, url_data,
                    novel_title,
                    novel_author,
                    novel_desc,
                    novel_date,
                    novel_publisher,
                    novel_series_title,
                    novel_syosetu_series_id,
                    novel_syosetu_id,
                    volume_list, checkdate: index_3.moment().local(), imgs: [] });
            });
        }
    };
    NovelSiteSyosetu.IDKEY = 'syosetu';
    NovelSiteSyosetu = __decorate([
        index_1.staticImplements(),
        __metadata("design:paramtypes", [Object, Object])
    ], NovelSiteSyosetu);
    return NovelSiteSyosetu;
})();
exports.NovelSiteSyosetu = NovelSiteSyosetu;
exports.default = NovelSiteSyosetu;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLGdDQUFnQztBQUNoQyxxREFBNEQ7QUFPNUQsNkNBQStEO0FBTS9ELG9DQUEwRjtBQUMxRixvQ0FBOEQ7QUFDOUQsb0NBQWtDO0FBRWxDLDhDQUErQztBQUMvQywyQ0FBbUM7QUFFbkMsd0NBQXVEO0FBQ3ZELDBDQUFxRTtBQUVyRSxxQ0FBcUM7QUFDckMsaUNBQWtEO0FBQ2xELHdDQUF1QztBQU12QyxJQUFrQixnQkFLakI7QUFMRCxXQUFrQixnQkFBZ0I7SUFFakMsdURBQUksQ0FBQTtJQUNKLHlEQUFLLENBQUE7SUFDTCx1REFBSSxDQUFBO0FBQ0wsQ0FBQyxFQUxpQixnQkFBZ0IsR0FBaEIsd0JBQWdCLEtBQWhCLHdCQUFnQixRQUtqQztBQWVEO0lBQUEsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBaUIsU0FBUSxhQUFhLENBQUMsU0FBUztRQUk1RCxZQUFZLE9BQXlCLEVBQUUsR0FBRyxJQUFJO1lBRTdDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUV4QixJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUM7UUFDcEUsQ0FBQztRQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBdUMsRUFBRSxHQUFHLElBQUk7WUFFNUQsT0FBTyxZQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBMkIsRUFBRSxJQUF1QixFQUFFLEdBQUcsSUFBSTtZQUUzRSxPQUFPLGNBQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDdEMsQ0FBQztRQUVELE1BQU0sQ0FBQyxRQUFRLENBQUMs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QixJQUFJLEVBQUUsRUFBYyxHQUNWLENBQUM7WUFDYixDQUFDLENBQUMsQ0FDRDtRQUNILENBQUM7S0FFRCxDQUFBO0lBM3lCdUIsc0JBQUssR0FBRyxTQUFTLENBQUM7SUFGN0IsZ0JBQWdCO1FBRDVCLHdCQUFnQixFQUFnRDs7T0FDcEQsZ0JBQWdCLENBNnlCNUI7SUFBRCx1QkFBQztLQUFBO0FBN3lCWSw0Q0FBZ0I7QUEreUI3QixrQkFBZSxnQkFBZ0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwianF1ZXJ5XCIgLz5cbmltcG9ydCB7IEVudW1Ob3ZlbFN0YXR1cyB9IGZyb20gJ25vZGUtbm92ZWwtaW5mby9saWIvY29uc3QnO1xuaW1wb3J0IHsgcmV0cnlSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vZmV0Y2gnO1xuXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYvdXRpbCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3VwYXRoMic7XG5pbXBvcnQgbm92ZWxJbmZvLCB7IElNZGNvbmZNZXRhIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHsgTGF6eUNvb2tpZSwgTGF6eUNvb2tpZUphciB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbi8vaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcbmltcG9ydCB7IGdldEZpbGVQYXRoLCBnZXRWb2x1bWVQYXRoIH0gZnJvbSAnLi4vZnMnO1xuXG5pbXBvcnQgTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIGRlZmF1bHRKU0RPTU9wdGlvbnMsIFNZTUJPTF9DQUNIRSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5cbmltcG9ydCBOb3ZlbFNpdGVEZW1vID0gcmVxdWlyZSgnLi4vZGVtby9iYXNlJyk7XG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xuXG5pbXBvcnQgeyBjb25zb2xlLCBjb25zb2xlRGVidWcgfSBmcm9tICcuLi8uLi91dGlsL2xvZyc7XG5pbXBvcnQgeyBfa2VlcEltYWdlSW5Db250ZXh0LCBrZWVwRm9ybWF0VGFnIH0gZnJvbSAnLi4vLi4vdXRpbC9odG1sJztcbmltcG9ydCB7IGhhc2hTdW0gfSBmcm9tICcuLi8uLi91dGlsL2hhc2gnO1xuaW1wb3J0IHsgcGFyc2VBc3luYyB9IGZyb20gJ21pdGVtaW4nO1xuaW1wb3J0IHsgcGFyc2VVcmwsIG1ha2VVcmwsIGNoZWNrIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCBjcmVhdGVVUkwgZnJvbSAnLi4vLi4vdXRpbC91cmwnO1xuXG5leHBvcnQgdHlwZSBJTm92ZWwgPSBOb3ZlbFNpdGVEZW1vLklOb3ZlbCAmIHtcblx0bm92ZWxfc3lvc2V0dV9pZDogc3RyaW5nLFxufTtcblxuZXhwb3J0IGNvbnN0IGVudW0gRW51bVByb3RvY29sTW9kZVxue1xuXHROT05FLFxuXHRIVFRQUyxcblx0SFRUUCxcbn1cblxuZXhwb3J0IHR5cGUgSU9wdGlvbnNQbHVzID0ge1xuXHQvKipcblx0ICog5LiN5L2/55So5bCP6Kqq5a625o+Q5L6b55qEIHR4dCDkuIvovInpgKPntZBcblx0ICovXG5cdGRpc2FibGVUeHRkb3dubG9hZD86IGJvb2xlYW4sXG5cblx0cHJvdG9jb2xNb2RlPzogRW51bVByb3RvY29sTW9kZSB8IGJvb2xlYW4sXG59XG5cbmV4cG9ydCB0eXBlIElEb3dubG9hZE9wdGlvbnMgPSBOb3ZlbFNpdGVEZW1vLklEb3dubG9hZE9wdGlvbnMgJiBJT3B0aW9uc1BsdXNcbmV4cG9ydCB0eXBlIElPcHRpb25zUnVudGltZSA9IE5vdmVsU2l0ZURlbW8uSU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucyAmIElPcHRpb25zUGx1c1xuXG5Ac3RhdGljSW1wbGVtZW50czxOb3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVTeW9zZXR1Pj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZVN5b3NldHUgZXh0ZW5kcyBOb3ZlbFNpdGVEZW1vLk5vdmVsU2l0ZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gJ3N5b3NldHUnO1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM6IElEb3dubG9hZE9wdGlvbnMsIC4uLmFyZ3YpXG5cdHtcblx0XHRzdXBlcihvcHRpb25zLCAuLi5hcmd2KTtcblxuXHRcdHRoaXMub3B0aW9uc0luaXQucmV0cnlEZWxheSA9IHRoaXMub3B0aW9uc0luaXQucmV0cnlEZWxheSB8fCAyNTAwMDtcblx0fVxuXG5cdHN0YXRpYyBjaGVjayh1cmw6IHN0cmluZyB8IFVSTCB8IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIC4uLmFyZ3YpOiBib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gY2hlY2sodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdHN0YXRpYyBtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbD86IGJvb2xlYW4gfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gbWFrZVVybCh1cmxvYmosIGJvb2wsIC4uLmFyZ3YpXG5cdH1cblxuXHRzdGF0aWMgcGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwgfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gcGFyc2VVcmwodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdG1ha2VVcmwodXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sPzogYm9vbGVhbiB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBtYWtlVXJsKHVybG9iaiwgYm9vbCwgLi4uYXJndilcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogc3RyaW5nIHwgVVJMIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIHBhcnNlVXJsKHVybCwgLi4uYXJndik7XG5cdH1cblxuXHRzZXNzaW9uPFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4sIHVybDogVVJMKVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhID0gb3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEgfHwge307XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhLm92ZXIxOCA9ICd5ZXMnO1xuXG5cdFx0Lypcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YS5zYXNpZW5vID0gMDtcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YS5saW5laGVpZ2h0ID0gMDtcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YS5mb250c2l6ZSA9IDA7XG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEubm92ZWxsYXlvdXQgPSAwO1xuXHRcdG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhLmZpeF9tZW51X2JhciA9IDA7XG5cdFx0Ki9cblxuXHRcdHN1cGVyLnNlc3Npb24ob3B0aW9uc1J1bnRpbWUsIHVybCk7XG5cblx0XHQvL2xldCB1cmwgPSBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnVybDtcblxuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXJcblx0XHQvLy5zZXRDb29raWVTeW5jKCdvdmVyMTg9eWVzOyBEb21haW49LnN5b3NldHUuY29tOyBQYXRoPS87IGhvc3RPbmx5PWZhbHNlJywgdXJsLmhyZWYpXG5cdFx0O1xuXG4vL1x0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucnVuU2NyaXB0cyA9ICdkYW5nZXJvdXNseSc7XG4vL1x0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00udmlydHVhbENvbnNvbGUgPSBmYWxzZTtcblxuXHRcdC8vb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zID0gb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zIHx8IHt9O1xuXG4vL1x0XHRpZiAoIW9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucy5qYXIpXG4vL1x0XHR7XG5cdFx0Ly9vcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMuamFyID0gb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphci53cmFwRm9yUmVxdWVzdCgpO1xuLy9cdFx0fVxuXG5cdFx0Ly9vcHRpb25zUnVudGltZS5vcHRpb25zSlNET00udXNlckFnZW50ID0gJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS83MS4wLjM1NzguOTggU2FmYXJpLzUzNy4zNic7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGRvd25sb2FkKHVybDogc3RyaW5nIHwgVVJMLCBkb3dubG9hZE9wdGlvbnM6IElEb3dubG9hZE9wdGlvbnMgPSB7fSlcblx0e1xuXHRcdHJldHVybiBzdXBlci5kb3dubG9hZCh1cmwsIGRvd25sb2FkT3B0aW9ucyk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX3BhcnNlQ2hhcHRlcjxUPihyZXQsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZSk6IFByb21pc2U8c3RyaW5nPlxuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGlmICghb3B0aW9uc1J1bnRpbWUuZGlzYWJsZVR4dGRvd25sb2FkKVxuXHRcdHtcblx0XHRcdHJldHVybiByZXQuYm9keTtcblx0XHR9XG5cblx0XHRjb25zdCAkOiBKUXVlcnlTdGF0aWMgPSByZXQuZG9tLiQ7XG5cblx0XHRsZXQgX2ltZ3MgPSAkKCcjbm92ZWxfcCwgI25vdmVsX2hvbmJ1biwgI25vdmVsX2EnKVxuXHRcdFx0LmZpbmQoJ2ltZ1tzcmNdJylcblx0XHQ7XG5cblx0XHRhd2FpdCBQcm9taXNlQmx1ZWJpcmRcblx0XHRcdC5yZXNvbHZlKF9pbWdzLnRvQXJyYXkoKSlcblx0XHRcdC5lYWNoKGFzeW5jIChlbGVtLCBpKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgaW1nID0gJChlbGVtKTtcblx0XHRcdFx0bGV0IHNyYyA9IGltZy5wcm9wKCdzcmMnKTtcblxuXHRcdFx0XHRjYWNoZS5jaGFwdGVyLmltZ3MgPSBjYWNoZS5jaGFwdGVyLmltZ3MgfHwgW107XG5cblx0XHRcdFx0YXdhaXQgcGFyc2VBc3luYyhzcmMpXG5cdFx0XHRcdFx0LnRoZW4oZGF0YSA9PiB7XG5cdFx0XHRcdFx0XHRpZiAoZGF0YS5mdWxsc2l6ZSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0c3JjID0gZGF0YS5mdWxsc2l6ZTtcblxuXHRcdFx0XHRcdFx0XHRpbWcucHJvcCgnc3JjJywgc3JjKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChlID0+IGNvbnNvbGUuZXJyb3IoZSkpXG5cdFx0XHRcdDtcblxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGNhY2hlLmNoYXB0ZXIuaW1ncy5wdXNoKHNyYyk7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0Y2FjaGUubm92ZWwuaW1ncy5wdXNoKHNyYyk7XG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdGlmIChvcHRpb25zUnVudGltZS5rZWVwSW1hZ2UpXG5cdFx0e1xuXHRcdFx0YXdhaXQgX2tlZXBJbWFnZUluQ29udGV4dChfaW1ncywgJCwge1xuXHRcdFx0XHRwcmVmaXg6ICfmjL/ntbUnLFxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0bGV0IGJvZHlzOiBKUXVlcnlbXSA9IFtcblx0XHRcdCQoJyNub3ZlbF9wJyksXG5cdFx0XHQkKCcjbm92ZWxfaG9uYnVuJyksXG5cdFx0XHQkKCcjbm92ZWxfYScpLFxuXHRcdF07XG5cblx0XHRib2R5cy5mb3JFYWNoKHQgPT4ga2VlcEZvcm1hdFRhZyh0LCB7XG5cdFx0XHQkLFxuXHRcdFx0b3B0aW9uc1J1bnRpbWUsXG5cdFx0fSkpO1xuXG5cdFx0cmV0dXJuIGJvZHlzLm1hcCh2ID0+IHYudGV4dCgpKS5maWx0ZXIoZnVuY3Rpb24gKHYpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHY7XG5cdFx0fSkuam9pbignXFxuXFxuPT09PT09PT09PT09PT09PT09XFxuXFxuJyk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2NyZWF0ZUNoYXB0ZXJVcmw8VCA9IElPcHRpb25zUnVudGltZSAmIElEb3dubG9hZE9wdGlvbnM+KHtcblx0XHRub3ZlbCxcblx0XHR2b2x1bWUsXG5cdFx0Y2hhcHRlcixcblx0fToge1xuXHRcdG5vdmVsOiBOb3ZlbFNpdGUuSU5vdmVsLFxuXHRcdHZvbHVtZTogTm92ZWxTaXRlLklWb2x1bWUsXG5cdFx0Y2hhcHRlcjogTm92ZWxTaXRlLklDaGFwdGVyLFxuXHR9LCBvcHRpb25zUnVudGltZT86IFQgJiBJT3B0aW9uc1J1bnRpbWUpOiBVUkxcblx0e1xuXHRcdGlmIChvcHRpb25zUnVudGltZS5kaXNhYmxlVHh0ZG93bmxvYWQpXG5cdFx0e1xuXHRcdFx0bGV0IHVybCA9IHRoaXMubWFrZVVybCh7XG5cdFx0XHRcdGNoYXB0ZXJfaWQ6IGNoYXB0ZXIuY2hhcHRlcl9pZCxcblx0XHRcdFx0bm92ZWxfaWQ6IG5vdmVsLnVybF9kYXRhLm5vdmVsX2lkLFxuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiB0aGlzLl9oYWNrVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUpO1xuXHRcdH1cblxuXHRcdHJldHVybiBzdXBlci5fY3JlYXRlQ2hhcHRlclVybCh7XG5cdFx0XHRub3ZlbCxcblx0XHRcdHZvbHVtZSxcblx0XHRcdGNoYXB0ZXIsXG5cdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMgPSB7fSwgLi4ub3B0cylcblx0e1xuXHRcdG9wdGlvbnNbdGhpcy5JREtFWV0gPSB7XG5cdFx0XHR0eHRkb3dubG9hZF9pZDogb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbC5ub3ZlbF9zeW9zZXR1X2lkIHx8ICcnLFxuXHRcdFx0c2VyaWVzX2lkOiBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsLm5vdmVsX3N5b3NldHVfc2VyaWVzX2lkIHx8ICcnLFxuXHRcdH07XG5cblx0XHRyZXR1cm4gc3VwZXIuX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMsIHtcblx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0dGV4dGxheW91dDoge1xuXHRcdFx0XHRcdGFsbG93X2xmMjogdHJ1ZSxcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0fSwgLi4ub3B0cyk7XG5cdH1cblxuXHRfaGFja1VSTChvYmo6IFVSTCB8IHN0cmluZywgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSlcblx0e1xuXHRcdGlmICh0eXBlb2Ygb2JqID09PSAnc3RyaW5nJylcblx0XHR7XG5cdFx0XHRvYmogPSBjcmVhdGVVUkwob2JqKTtcblx0XHR9XG5cblx0XHRpZiAob2JqLmhvc3RuYW1lID09PSAnbmNvZGUuc3lvc2V0dS5jb20nIHx8IG9iai5ob3N0bmFtZSA9PT0gJ25vdmVsMTguc3lvc2V0dS5jb20nKVxuXHRcdHtcblx0XHRcdHN3aXRjaCAob3B0aW9uc1J1bnRpbWUucHJvdG9jb2xNb2RlKVxuXHRcdFx0e1xuXHRcdFx0XHRjYXNlIEVudW1Qcm90b2NvbE1vZGUuSFRUUDpcblx0XHRcdFx0XHRvYmoucHJvdG9jb2wgPSAnaHR0cCc7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgdHJ1ZTpcblx0XHRcdFx0Y2FzZSBFbnVtUHJvdG9jb2xNb2RlLkhUVFBTOlxuXHRcdFx0XHRcdG9iai5wcm90b2NvbCA9ICdodHRwcyc7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9ialxuXHR9XG5cblx0cHJvdGVjdGVkIF9mZXRjaENoYXB0ZXI8VD4odXJsOiBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBfY2FjaGVfOiB7XG5cdFx0bm92ZWw6IElOb3ZlbCxcblx0fSlcblx0e1xuXHRcdGxldCB0cnllZDogYm9vbGVhbjtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdGxldCBfZmV0Y2hDaGFwdGVyID0gc3VwZXIuX2ZldGNoQ2hhcHRlcjtcblxuXHRcdHJldHVybiBzdXBlci5fZmV0Y2hDaGFwdGVyKHVybCwgb3B0aW9uc1J1bnRpbWUsIF9jYWNoZV8pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAocmV0KVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAocmV0ID09IG51bGwpIHJldHVybiByZXQ7XG5cblx0XHRcdFx0Y29uc3QgZG9tID0gcmV0LmRvbTtcblxuXHRcdFx0XHRpZiAoIXRyeWVkICYmIGRvbSAmJiBkb20uJCgnI21vZGFsIC55ZXMgI3llczE4JykubGVuZ3RoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmVycm9yKGDnhKHms5XmiJDlip/oroDlj5YgUjE4IOmggemdomAsIHVybC5ocmVmKTtcblxuXHRcdFx0XHRcdHRyeWVkID0gdHJ1ZTtcblxuXHRcdFx0XHRcdHRyeVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdCQoJyNtb2RhbCAueWVzICN5ZXMxOCcpLmNsaWNrKCk7XG5cdFx0XHRcdFx0XHQkKCcjbW9kYWwgLnllcyAjeWVzMTgnKVswXS5jbGljaygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYXRjaCAoZSlcblx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyLnNldENvb2tpZVN5bmMoJ292ZXIxOD15ZXM7IERvbWFpbj0uc3lvc2V0dS5jb207IFBhdGg9LzsgaG9zdE9ubHk9ZmFsc2UnLCB1cmwpO1xuXHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIuc2V0Q29va2llU3luYyhgb3ZlcjE4PXllczsgRG9tYWluPSR7ZG9tLnVybC5ob3N0fTsgUGF0aD0vOyBob3N0T25seT1mYWxzZWAsIGRvbS51cmwpO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmRlYnVnKG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIuZ2V0QWxsQ29va2llcygpKTtcblxuXHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZWZlcnJlciA9IGRvbS51cmw7XG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zID0gb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zIHx8IHt9O1xuXHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucy5mb3JtID0gZG9tLnVybDtcblxuXHRcdFx0XHRcdHJldHVybiBfZmV0Y2hDaGFwdGVyLmNhbGwoc2VsZiwgdXJsLCBvcHRpb25zUnVudGltZSwgX2NhY2hlXylcblx0XHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXQpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGRvbSA9IHJldC5kb207XG5cdFx0XHRcdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRcdFx0XHRpZiAoJCgnI21vZGFsIC55ZXMgI3llczE4JykubGVuZ3RoKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcihg54Sh5rOV5oiQ5Yqf6K6A5Y+WIFIxOCDpoIHpnaJgLCB1cmwuaHJlZik7XG5cblx0XHRcdFx0XHRcdFx0XHQvL3Byb2Nlc3MuZXhpdCgpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHJldDtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcmV0O1xuXHRcdFx0fSlcblx0fVxuXG5cdGFzeW5jIF9ub3ZlbDE4PFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPih1cmwsXG5cdFx0ZG9tOiBJSlNET00sXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge30sXG5cdCk6IFByb21pc2U8SUpTRE9NPlxuXHR7XG5cdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0aWYgKCEkKCcjbm92ZWxfY29udGVudHMnKS5sZW5ndGggfHwgJCgnI21vZGFsIC55ZXMgI3llczE4JykubGVuZ3RoKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2coZG9tLnVybCwgZG9tLl9vcHRpb25zKTtcblxuXHRcdFx0JCgnI21vZGFsIC55ZXMgI3llczE4JykuY2xpY2soKTtcblxuXHRcdFx0ZG9tLl9vcHRpb25zLnJlcXVlc3RPcHRpb25zLmphci5zZXRDb29raWUoJ292ZXIxOD15ZXM7IERvbWFpbj0uc3lvc2V0dS5jb207IFBhdGg9LzsgaG9zdE9ubHk9ZmFsc2UnLCB1cmwpO1xuXG5cdFx0XHQvL2NvbnNvbGUubG9nKGRvbS5zZXJpYWxpemUoKSk7XG5cblx0XHRcdHJldHVybiBmcm9tVVJMKHVybCwgT2JqZWN0LmFzc2lnbihvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00sIHtcblxuXHRcdFx0XHQvL2Nvb2tpZUphcjogZG9tLl9vcHRpb25zLnJlcXVlc3RPcHRpb25zLmphci5famFyLFxuXHRcdFx0XHQvL3JlcXVlc3RPcHRpb25zOiBkb20uX29wdGlvbnMucmVxdWVzdE9wdGlvbnMsXG5cblx0XHRcdH0gYXMgSUZyb21VcmxPcHRpb25zKSk7XG5cdFx0fVxuXG5cdFx0Ly9jb25zb2xlLmxvZyhkb20uX29wdGlvbnMucmVxdWVzdE9wdGlvbnMuamFyKTtcblxuXHRcdHJldHVybiBkb207XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2dldEV4dHJhSW5mb1VSTDxUPihzZWFyY2g6IHN0cmluZyxcblx0XHR1cmxfZGF0YTogTm92ZWxTaXRlLklQYXJzZVVybCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4sXG5cdClcblx0e1xuXHRcdGxldCBvcHRpb25zSlNET00gPSB7XG5cdFx0XHQuLi5vcHRpb25zUnVudGltZS5vcHRpb25zSlNET00sXG5cdFx0XHRyZXF1ZXN0T3B0aW9uczoge1xuXHRcdFx0XHQuLi5vcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMsXG5cdFx0XHR9LFxuXHRcdH07XG5cblx0XHRvcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgPSBvcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgfHwge307XG5cdFx0b3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zLmZvbGxvd1JlZGlyZWN0ID0gdHJ1ZTtcblxuXHRcdGxldCBfZG9tYWluID0gMSA/ICduYXIuanAnIDogJ2RpcC5qcCc7XG5cblx0XHRsZXQgX3VybCA9IGBodHRwczovLyR7dXJsX2RhdGEubm92ZWxfcjE4XG5cdFx0XHQ/ICduYXJvdTE4J1xuXHRcdFx0OiAnbmFyb3UnfS4ke19kb21haW59L3NlYXJjaC5waHA/dGV4dD0ke3NlYXJjaH0mbm92ZWw9YWxsJmdlbnJlPWFsbCZuZXdfZ2VucmU9YWxsJmxlbmd0aD0wJmRvd249MCZ1cD0xMDBgO1xuXG5cdFx0Y29uc29sZURlYnVnLmRlYnVnKGDoqablnJblj5blvpflsI/oqqrnm7jpl5zos4foqIogKDEpYCwgX3VybCk7XG5cblx0XHRyZXR1cm4gZnJvbVVSTChfdXJsLCBvcHRpb25zSlNET00pXG5cdH1cblxuXHRwcm90ZWN0ZWQgX2dldEV4dHJhSW5mb1VSTDI8VCwgTSBleHRlbmRzIFBhcnRpYWw8SU5vdmVsICYgSU1kY29uZk1ldGE+Pih1cmxfZGF0YTogTm92ZWxTaXRlLklQYXJzZVVybCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4sXG5cdFx0ZGF0YV9tZXRhOiBNLFxuXHQpOiBQcm9taXNlQmx1ZWJpcmQ8TT5cblx0e1xuXHRcdGxldCBzdWJkb21haW4gPSB1cmxfZGF0YS5ub3ZlbF9yMTggPyAnbm92ZWwxOCcgOiAnbmNvZGUnO1xuXG5cdFx0bGV0IGluZm9fdXJsID0gYGh0dHBzOi8vJHtzdWJkb21haW59LnN5b3NldHUuY29tL25vdmVsdmlldy9pbmZvdG9wL25jb2RlLyR7dXJsX2RhdGEubm92ZWxfaWR9L2A7XG5cblx0XHRkYXRhX21ldGEgPSBkYXRhX21ldGEgfHwgKHt9IGFzIE0pO1xuXG5cdFx0Y29uc29sZURlYnVnLmRlYnVnKGDoqablnJblj5blvpflsI/oqqrnm7jpl5zos4foqIogKDIpYCwgaW5mb191cmwpO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwoaW5mb191cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb20pXG5cdFx0XHR7XG5cdFx0XHRcdGxldCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0JCgnI25vdmVsdGFibGUxIHRyJylcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdGxldCBfdHIgPSAkKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRsZXQgX3RoX3RleHQgPSBTdHJpbmcoJCgndGgnLCBfdHIpLnRleHQoKSk7XG5cblx0XHRcdFx0XHRcdGlmIChfdGhfdGV4dC5pbmRleE9mKCfjgq3jg7zjg6/jg7zjg4knKSAhPSAtMSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsID0gZGF0YV9tZXRhLm5vdmVsIHx8IHt9O1xuXHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncyA9IGRhdGFfbWV0YS5ub3ZlbC50YWdzIHx8IFtdO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBfdGRfdGV4dCA9IFN0cmluZygkKCd0ZCcsIF90cikudGV4dCgpKVxuXHRcdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9cXHMrL2csICcgJylcblx0XHRcdFx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0XHRfdGRfdGV4dFxuXHRcdFx0XHRcdFx0XHRcdC5zcGxpdCgvXFxzKy8pXG5cdFx0XHRcdFx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKHRhZylcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodGFnKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRsZXQgX3QgPSB0YWcuc3BsaXQoJy8nKS5tYXAocyA9PiBzLnRyaW0oKSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MucHVzaCguLi5fdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoX3RoX3RleHQuaW5kZXhPZign44K444Oj44Oz44OrJykgIT0gLTEgfHwgX3RoX3RleHQuaW5kZXhPZign5o6y6LyJ44K144Kk44OIJykgIT0gLTEpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbCA9IGRhdGFfbWV0YS5ub3ZlbCB8fCB7fTtcblx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MgPSBkYXRhX21ldGEubm92ZWwudGFncyB8fCBbXTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgX3RkX3RleHQgPSBTdHJpbmcoJCgndGQnLCBfdHIpLnRleHQoKSlcblx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvXFxzKy9nLCAnICcpXG5cdFx0XHRcdFx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0aWYgKF90ZF90ZXh0KVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MucHVzaChfdGRfdGV4dClcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgYWdlX2xpbWl0ID0gJCgnI2FnZV9saW1pdCcpO1xuXG5cdFx0XHRcdGlmIChhZ2VfbGltaXQubGVuZ3RoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IF90ID0gYWdlX2xpbWl0LnRleHQoKS50cmltKCk7XG5cblx0XHRcdFx0XHRpZiAoX3QpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsID0gZGF0YV9tZXRhLm5vdmVsIHx8IHt9O1xuXHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MgPSBkYXRhX21ldGEubm92ZWwudGFncyB8fCBbXTtcblxuXHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MucHVzaChfdCk7XG5cblx0XHRcdFx0XHRcdGlmIChfdC5tYXRjaCgvcjE4L2kpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncy5wdXNoKGBub3ZlbDE4YCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZGF0YV9tZXRhLmxpbmsgPSBkYXRhX21ldGEubGluayB8fCBbXTtcblxuXHRcdFx0XHRkYXRhX21ldGEubGluay5wdXNoKGBb5bCP6Kqs5oOF5aCxXSgke2RvbS51cmx9KWApO1xuXG5cdFx0XHRcdHJldHVybiBkYXRhX21ldGE7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGUgPT5cblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZURlYnVnLmdyYXkuZXJyb3IoZS50b1N0cmluZygpKTtcblx0XHRcdFx0Y29uc29sZS53YXJuKGDkuIvovInlsI/oqqros4foqIrmmYLnmbznlJ/pjK/oqqQgKDIp77yM5q2k5o+Q6YaS6KiK5oGv5Y+v5Lul54Sh6KaWYCk7XG5cblx0XHRcdFx0cmV0dXJuIGRhdGFfbWV0YTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRjcmVhdGVNYWluVXJsPFQ+KHVybDogc3RyaW5nIHwgVVJMLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSlcblx0e1xuXHRcdHJldHVybiB0aGlzLl9oYWNrVVJMKHN1cGVyLmNyZWF0ZU1haW5VcmwodXJsIGFzIGFueSwgb3B0aW9uc1J1bnRpbWUpLCBvcHRpb25zUnVudGltZSlcblx0fVxuXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4odXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge30sXG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHR1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwodXJsIGFzIGFueSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0Y29uc29sZURlYnVnLmRlYnVnKGBnZXRfdm9sdW1lX2xpc3RgLCB1cmwudG9TdHJpbmcoKSk7XG5cblx0XHRyZXR1cm4gZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb206IElKU0RPTSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHNlbGYuX25vdmVsMTg8VD4odXJsLCBkb20sIG9wdGlvbnNSdW50aW1lKTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKGDplovlp4vomZXnkIblsI/oqqros4foqIrku6Xlj4rnq6Dnr4DliJfooahgKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfdGl0bGUgPSBkb20uJCgnLm5vdmVsX3RpdGxlJykudGV4dCgpO1xuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yID0gbm92ZWxUZXh0LnRyaW0oZG9tXG5cdFx0XHRcdFx0LiQoJy5ub3ZlbF93cml0ZXJuYW1lIGEsIC5ub3ZlbF93cml0ZXJuYW1lJylcblx0XHRcdFx0XHQuZXEoLTEpXG5cdFx0XHRcdFx0LnRleHQoKSlcblx0XHRcdFx0XHQucmVwbGFjZSgvXi4q5L2c6ICF77yaLywgJycpXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYyA9IGRvbS4kKCcjbm92ZWxfZXgnKS50ZXh0KCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3B1Ymxpc2hlciA9IHNlbGYuSURLRVk7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybChkb20udXJsLmhyZWYpO1xuXG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIE5vdmVsU2l0ZS5JVm9sdW1lW107XG5cblx0XHRcdFx0bGV0IGN1cnJlbnRWb2x1bWU6IE5vdmVsU2l0ZS5JVm9sdW1lO1xuXG5cdFx0XHRcdGxldCB0YWJsZSA9IGRvbS4kKCcuaW5kZXhfYm94JykuZmluZCgnPiAuY2hhcHRlcl90aXRsZSwgLm5vdmVsX3N1Ymxpc3QyJyk7XG5cblx0XHRcdFx0bGV0IF9jYWNoZV9kYXRlcyA9IFtdO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9zeW9zZXR1X2lkO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb20uc2VyaWFsaXplKCkpO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygkKCcjbm92ZWxfZm9vdGVyJykpO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygkKCcjbm92ZWxfZm9vdGVyJykuZmluZCgnLnVuZGVybmF2aSBhW2hyZWYqPVwidHh0ZG93bmxvYWRcIl0nKSk7XG5cblx0XHRcdFx0XHRsZXQgbTtcblx0XHRcdFx0XHRsZXQgZHQgPSBkb20uJCgnI25vdmVsX2Zvb3RlciAudW5kZXJuYXZpIGFbaHJlZio9XCJ0eHRkb3dubG9hZFwiXScpLnByb3AoJ2hyZWYnKTtcblxuXHRcdFx0XHRcdGlmIChkdCAmJiAobSA9IGR0Lm1hdGNoKC9uY29kZVxcLyhcXGQrKS8pKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRub3ZlbF9zeW9zZXR1X2lkID0gbVsxXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoIW9wdGlvbnNSdW50aW1lLmRpc2FibGVUeHRkb3dubG9hZClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYOWumOaWuSB0eHQg5LiL6LyJ5Yqf6IO96YGt56aB55So77yM5oiW6KuL5L2/55SoIGNvb2tpZXMg55m75YWl77yM5oiW5bCHIGRpc2FibGVUeHRkb3dubG9hZCDoqK3ngrogdHJ1ZWApXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGFibGVcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0bGV0IHRyID0gZG9tLiQodGhpcyk7XG5cblx0XHRcdFx0XHRcdGlmICh0ci5pcygnLmNoYXB0ZXJfdGl0bGUnKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IHZvbHVtZV9saXN0W3ZvbHVtZV9saXN0Lmxlbmd0aF0gPSB7XG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiB2b2x1bWVfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiB0ci50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogW10sXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmICghY3VycmVudFZvbHVtZSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiB2b2x1bWVfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGU6ICdudWxsJyxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogW10sXG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBhID0gdHIuZmluZCgnLnN1YnRpdGxlIGEnKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl9kYXRlO1xuXHRcdFx0XHRcdFx0XHRsZXQgZGQ7XG5cdFx0XHRcdFx0XHRcdGxldCBkYSA9IHRyLmZpbmQoJy5sb25nX3VwZGF0ZScpO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChkYS5maW5kKCdzcGFuW3RpdGxlKj1cIi9cIl0nKS5sZW5ndGgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkZCA9IGRhLmZpbmQoJ3NwYW5bdGl0bGUqPVwiL1wiXScpLmF0dHIoJ3RpdGxlJykucmVwbGFjZSgv5pS556i/fF5cXHMrfFxccyskL2csICcnKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmICghZGQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkYS5maW5kKCcqJykucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHRcdFx0ZGQgPSBkYS50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKGRkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9kYXRlID0gbW9tZW50KGRkLCAnWVlZWS9NTS9ERCBISDptbScpLmxvY2FsKCk7XG5cdFx0XHRcdFx0XHRcdFx0X2NhY2hlX2RhdGVzLnB1c2goY2hhcHRlcl9kYXRlLnVuaXgoKSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgaHJlZiA9IGEucHJvcCgnaHJlZicpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBkYXRhID0gc2VsZi5wYXJzZVVybChocmVmKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIWRhdGEuY2hhcHRlcl9pZClcblx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHRyLmZpbmQoJy5ib29rbWFya2VyX25vdycpLmxlbmd0aClcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdFx0XHRcdCAqIGZpeCBodHRwczovL25jb2RlLnN5b3NldHUuY29tL243NjM3ZGovXG5cdFx0XHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyh0ci5wcm9wKFwib3V0ZXJIVE1MXCIpKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhLnByb3AoXCJvdXRlckhUTUxcIikpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGEpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGhyZWYpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGEuYXR0cignaHJlZicpKTtcblx0XHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2cobmV3IFVSTChocmVmLCBkb20udXJsKSk7XG5cblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhkb20uX29wdGlvbnMpO1xuXG5cdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkYXRhID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0dXJsOiBudWxsLFxuXHRcdFx0XHRcdFx0XHRcdFx0bm92ZWxfcGlkOiBub3ZlbF9zeW9zZXR1X2lkIGFzIHN0cmluZyxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCBhcyBzdHJpbmcsXG5cdFx0XHRcdFx0XHRcdFx0fSBhcyBhbnk7XG5cblx0XHRcdFx0XHRcdFx0XHRocmVmID0gc2VsZi5faGFja1VSTChzZWxmLm1ha2VVcmwoZGF0YSksIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRcdFx0XHRcdGRhdGEudXJsID0gaHJlZjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWVcblx0XHRcdFx0XHRcdFx0XHQuY2hhcHRlcl9saXN0XG5cdFx0XHRcdFx0XHRcdFx0LnB1c2goe1xuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogY3VycmVudFZvbHVtZS5jaGFwdGVyX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZTogYS50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmw6IGhyZWYsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhOiBkYXRhLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9kYXRlLFxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0X2NhY2hlX2RhdGVzLnNvcnQoKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGF0ZSA9IG1vbWVudC51bml4KF9jYWNoZV9kYXRlc1tfY2FjaGVfZGF0ZXMubGVuZ3RoIC0gMV0pLmxvY2FsKCk7XG5cblx0XHRcdFx0bGV0IGEgPSBhd2FpdCBzZWxmLl9nZXRFeHRyYUluZm9VUkwodXJsX2RhdGEubm92ZWxfaWQsIHVybF9kYXRhLCBvcHRpb25zUnVudGltZSlcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBoMiA9IGRvbS4kKGBkaXY6aGFzKD4gaDIuc2VhcmNoOmhhcyg+IGFbaHJlZio9XCIke3VybF9kYXRhLm5vdmVsX2lkfVwiXSkpYCkuZXEoMCk7XG5cblx0XHRcdFx0XHRcdGlmICghaDIubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRoMiA9IGRvbS4kKGBoMjpoYXMoPiBhW2hyZWYqPVwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIl0pYCkuZXEoMCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICghaDIubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlLndhcm4oYGNhbiBub3QgZm91bmQga2V5d29yZCBcIiR7dXJsX2RhdGEubm92ZWxfaWR9XCIsIHdpbGwgdHJ5IHVzZSB0aXRsZSBzZWFyY2hgKTtcblxuXHRcdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdFx0ICogaHR0cHM6Ly9uYXJvdTE4Lm5hci5qcC9zZWFyY2gucGhwP3RleHQ9JUUzJTgzJUE5JUUzJTgzJUIzJUUzJTgyJUFGJUU1JTg2JTkyJUU5JTk5JUJBJUU4JTgwJTg1JUUzJTgxJUFFJUUzJTgyJUI5JUUzJTgzJUFEJUUzJTgzJUJDJUUzJTgzJUE5JUUzJTgyJUE0JUUzJTgzJTk1Jm5vdmVsPWFsbCZnZW5yZT1hbGwmbmV3X2dlbnJlPWFsbCZsZW5ndGg9MCZkb3duPTAmdXA9MTAwXG5cdFx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0XHRsZXQgdGl0bGUgPSBub3ZlbF90aXRsZVxuXHRcdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9bXFx3772BLe+9ml0rL2lnLCAnICcpXG5cdFx0XHRcdFx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHNlbGYuX2dldEV4dHJhSW5mb1VSTCh0aXRsZSwgdXJsX2RhdGEsIG9wdGlvbnNSdW50aW1lKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0dXJuIGRvbTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb20pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb20udXJsKTtcblxuXHRcdFx0XHRcdFx0bGV0IGRhdGE6IElNZGNvbmZNZXRhID0ge307XG5cblx0XHRcdFx0XHRcdGxldCBoMiA9IGRvbS4kKGBkaXY6aGFzKD4gaDIuc2VhcmNoOmhhcyg+IGFbaHJlZio9XCIke3VybF9kYXRhLm5vdmVsX2lkfVwiXSkpYCkuZXEoMCk7XG5cblx0XHRcdFx0XHRcdGlmICghaDIubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRoMiA9IGRvbS4kKGBoMjpoYXMoPiBhW2hyZWYqPVwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIl0pYCkuZXEoMCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGxldCBzZWFyY2hfbGVmdCA9IGgyLm5leHRBbGwoJy5zZWFyY2hfbGVmdDplcSgwKScpLmVxKDApO1xuXHRcdFx0XHRcdFx0bGV0IHNlYXJjaF9yaWdodCA9IGgyLm5leHRBbGwoJy5zZWFyY2hfcmlnaHQ6ZXEoMCknKS5lcSgwKTtcblxuXHRcdFx0XHRcdFx0aWYgKCFzZWFyY2hfbGVmdC5sZW5ndGgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHNlYXJjaF9sZWZ0ID0gaDIuc2libGluZ3MoJy5zZWFyY2hfbGVmdDplcSgwKScpLmVxKDApO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAoIXNlYXJjaF9yaWdodC5sZW5ndGgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHNlYXJjaF9yaWdodCA9IGgyLnNpYmxpbmdzKCcuc2VhcmNoX3JpZ2h0OmVxKDApJykuZXEoMCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICghaDIubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKDExMTExMTExMTExMTExMTExMTExMSk7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUud2FybihgY2FuIG5vdCBmb3VuZCBrZXl3b3JkIGZvciAke3VybF9kYXRhLm5vdmVsX2lkfWAsIGRvbS51cmwpO1xuXG5cdFx0XHRcdFx0XHRcdHJldHVybiBkYXRhO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKHNlYXJjaF9sZWZ0KTtcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coc2VhcmNoX3JpZ2h0KTtcblxuXHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbCA9IHt9O1xuXG5cdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnN0YXR1cyA9IHNlYXJjaF9sZWZ0LmZpbmQoJy5ub3ZlbF90eXBlJykudGV4dCgpLnRyaW0oKTtcblx0XHRcdFx0XHRcdGRhdGEubm92ZWwudGFncyA9IFtdO1xuXG5cdFx0XHRcdFx0XHRpZiAoZGF0YS5ub3ZlbC5zdGF0dXMgPT09ICflrozntZDmuIgnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRkYXRhLm5vdmVsLm5vdmVsX3N0YXR1cyB8PSBFbnVtTm92ZWxTdGF0dXMuQVVUSE9SX0RPTkU7XG5cblx0XHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzLnB1c2goZGF0YS5ub3ZlbC5zdGF0dXMpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRzZWFyY2hfcmlnaHQuZmluZCgnLmtleXdvcmQgYScpXG5cdFx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGxldCBrID0gZG9tLiQoZWxlbSlcblx0XHRcdFx0XHRcdFx0XHRcdC50ZXh0KClcblx0XHRcdFx0XHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0XHRcdFx0XHRcdC5zcGxpdCgvW1xcL1xcc10vKVxuXHRcdFx0XHRcdFx0XHRcdFx0Lm1hcChmdW5jdGlvbiAocylcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHMudHJpbSgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdC5maWx0ZXIoKHYpID0+IHYpXG5cdFx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzID0gZGF0YS5ub3ZlbC50YWdzLmNvbmNhdChrKTtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0c2VhcmNoX2xlZnRcblx0XHRcdFx0XHRcdFx0LmZpbmQoJ1tjbGFzcyo9XCJuZXdfZ2VucmVcIl0sIC5ub2NnZW5yZScpXG5cdFx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGxldCBrID0gZG9tLiQoZWxlbSlcblx0XHRcdFx0XHRcdFx0XHRcdC50ZXh0KClcblx0XHRcdFx0XHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcblx0XHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAoaylcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MucHVzaChrKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdGRhdGEubGluayA9IGRhdGEubGluayB8fCBbXTtcblxuXHRcdFx0XHRcdFx0ZGF0YS5saW5rLnB1c2goYFske2RvbS51cmwuaG9zdG5hbWV9XSgke2RvbS51cmx9KSAtIOWwj+iqrOWutuOBq+OBquOCjeOBhuOAgOabtOaWsOaDheWgseaknOe0omApO1xuXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gZGF0YTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zb2xlRGVidWcuZ3JheS5lcnJvcihlLnRvU3RyaW5nKCkpO1xuXHRcdFx0XHRcdFx0Y29uc29sZS53YXJuKGDkuIvovInlsI/oqqros4foqIrmmYLnmbznlJ/pjK/oqqQgKDEp77yM5q2k5o+Q6YaS6KiK5oGv5Y+v5Lul54Sh6KaWYCk7XG5cblx0XHRcdFx0XHRcdHJldHVybiB7fTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0YSA9IGF3YWl0IHNlbGYuX2dldEV4dHJhSW5mb1VSTDIodXJsX2RhdGEsIG9wdGlvbnNSdW50aW1lLCBhKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfc2VyaWVzX3RpdGxlOiBzdHJpbmc7XG5cdFx0XHRcdGxldCBub3ZlbF9zeW9zZXR1X3Nlcmllc19pZDogc3RyaW5nO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgX2EgPSBkb20uJCgnI25vdmVsX2NvbnRlbnRzIC5zZXJpZXNfdGl0bGUnKTtcblxuXHRcdFx0XHRcdGxldCB0ID0gX2EudGV4dCgpXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvW1xcclxcblxcdF0rfF5cXHMrfFxccyskL2csICcnKVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdGlmICh0KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdG5vdmVsX3Nlcmllc190aXRsZSA9IHQ7XG5cblx0XHRcdFx0XHRcdF9hID0gX2EuZmluZCgnYScpO1xuXHRcdFx0XHRcdFx0bGV0IF90ID0gX2EuYXR0cignaHJlZicpIHx8ICcnO1xuXG5cdFx0XHRcdFx0XHRpZiAoL1xcLyhcXHd7Nix9KVxcLy9pLmV4ZWMoX3QpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRub3ZlbF9zeW9zZXR1X3Nlcmllc19pZCA9IFJlZ0V4cC4kMTtcblxuXHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdGEubGluayA9IGEubGluayB8fCBbXTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgdGl0bGUgPSBub3ZlbF9zZXJpZXNfdGl0bGVcblx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvW1xcW1xcXVxcflxcYF0vZywgJ1xcXFwkMCcpXG5cdFx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL1tcIiddL2csICcnKVxuXHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRhLmxpbmsucHVzaChgWyR7dGl0bGV9XSgke19hLnByb3AoJ2hyZWYnKX0pYCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKGDntZDmnZ/omZXnkIblsI/oqqros4foqIrku6Xlj4rnq6Dnr4DliJfooahgKTtcblxuXHRcdFx0XHRyZXR1cm4ge1xuXG5cdFx0XHRcdFx0Li4uYSxcblxuXHRcdFx0XHRcdHVybDogZG9tLnVybCxcblx0XHRcdFx0XHR1cmxfZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxuXHRcdFx0XHRcdG5vdmVsX2F1dGhvcixcblxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSxcblx0XHRcdFx0XHRub3ZlbF9wdWJsaXNoZXIsXG5cblx0XHRcdFx0XHRub3ZlbF9zZXJpZXNfdGl0bGUsXG5cdFx0XHRcdFx0bm92ZWxfc3lvc2V0dV9zZXJpZXNfaWQsXG5cblx0XHRcdFx0XHRub3ZlbF9zeW9zZXR1X2lkLFxuXG5cdFx0XHRcdFx0dm9sdW1lX2xpc3QsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlU3lvc2V0dTtcblxuIl19