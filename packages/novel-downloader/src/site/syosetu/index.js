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
exports.NovelSiteSyosetu = exports.EnumProtocolMode = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxnQ0FBZ0M7QUFDaEMscURBQTREO0FBTzVELDZDQUErRDtBQU0vRCxvQ0FBMEY7QUFDMUYsb0NBQThEO0FBQzlELG9DQUFrQztBQUVsQyw4Q0FBK0M7QUFDL0MsMkNBQW1DO0FBRW5DLHdDQUF1RDtBQUN2RCwwQ0FBcUU7QUFFckUscUNBQXFDO0FBQ3JDLGlDQUFrRDtBQUNsRCx3Q0FBdUM7QUFNdkMsSUFBa0IsZ0JBS2pCO0FBTEQsV0FBa0IsZ0JBQWdCO0lBRWpDLHVEQUFJLENBQUE7SUFDSix5REFBSyxDQUFBO0lBQ0wsdURBQUksQ0FBQTtBQUNMLENBQUMsRUFMaUIsZ0JBQWdCLEdBQWhCLHdCQUFnQixLQUFoQix3QkFBZ0IsUUFLakM7QUFlRDtJQUFBLElBQWEsZ0JBQWdCLEdBQTdCLE1BQWEsZ0JBQWlCLFNBQVEsYUFBYSxDQUFDLFNBQVM7UUFJNUQsWUFBWSxPQUF5QixFQUFFLEdBQUcsSUFBSTtZQUU3QyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFFeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDO1FBQ3BFLENBQUM7UUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQXVDLEVBQUUsR0FBRyxJQUFJO1lBRTVELE9BQU8sWUFBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQTJCLEVBQUUsSUFBdUIsRUFBRSxHQUFHLElBQUk7WUFFM0UsT0FBTyxjQUFPLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO1FBQ3RDLENBQUM7UUFFRCxNQUFNLENBQUMsUUFBUSxDQUFD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M0IsSUFBSSxFQUFFLEVBQWMsR0FDVixDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQ0Q7UUFDSCxDQUFDO0tBRUQsQ0FBQTtJQTN5QnVCLHNCQUFLLEdBQUcsU0FBUyxDQUFDO0lBRjdCLGdCQUFnQjtRQUQ1Qix3QkFBZ0IsRUFBZ0Q7O09BQ3BELGdCQUFnQixDQTZ5QjVCO0lBQUQsdUJBQUM7S0FBQTtBQTd5QlksNENBQWdCO0FBK3lCN0Isa0JBQWUsZ0JBQWdCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSB0eXBlcz1cImpxdWVyeVwiIC8+XG5pbXBvcnQgeyBFbnVtTm92ZWxTdGF0dXMgfSBmcm9tICdub2RlLW5vdmVsLWluZm8vbGliL2NvbnN0JztcbmltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uLy4uL2ZldGNoJztcblxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IHRyaW1GaWxlbmFtZSB9IGZyb20gJ2ZzLWljb252L3V0aWwnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICd1cGF0aDInO1xuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCB7IExhenlDb29raWUsIExhenlDb29raWVKYXIgfSBmcm9tICdqc2RvbS1leHRyYSc7XG4vL2ltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5pbXBvcnQgeyBnZXRGaWxlUGF0aCwgZ2V0Vm9sdW1lUGF0aCB9IGZyb20gJy4uL2ZzJztcblxuaW1wb3J0IE5vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBkZWZhdWx0SlNET01PcHRpb25zLCBTWU1CT0xfQ0FDSEUgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xuXG5pbXBvcnQgTm92ZWxTaXRlRGVtbyA9IHJlcXVpcmUoJy4uL2RlbW8vYmFzZScpO1xuaW1wb3J0IG5vdmVsVGV4dCBmcm9tICdub3ZlbC10ZXh0JztcblxuaW1wb3J0IHsgY29uc29sZSwgY29uc29sZURlYnVnIH0gZnJvbSAnLi4vLi4vdXRpbC9sb2cnO1xuaW1wb3J0IHsgX2tlZXBJbWFnZUluQ29udGV4dCwga2VlcEZvcm1hdFRhZyB9IGZyb20gJy4uLy4uL3V0aWwvaHRtbCc7XG5pbXBvcnQgeyBoYXNoU3VtIH0gZnJvbSAnLi4vLi4vdXRpbC9oYXNoJztcbmltcG9ydCB7IHBhcnNlQXN5bmMgfSBmcm9tICdtaXRlbWluJztcbmltcG9ydCB7IHBhcnNlVXJsLCBtYWtlVXJsLCBjaGVjayB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgY3JlYXRlVVJMIGZyb20gJy4uLy4uL3V0aWwvdXJsJztcblxuZXhwb3J0IHR5cGUgSU5vdmVsID0gTm92ZWxTaXRlRGVtby5JTm92ZWwgJiB7XG5cdG5vdmVsX3N5b3NldHVfaWQ6IHN0cmluZyxcbn07XG5cbmV4cG9ydCBjb25zdCBlbnVtIEVudW1Qcm90b2NvbE1vZGVcbntcblx0Tk9ORSxcblx0SFRUUFMsXG5cdEhUVFAsXG59XG5cbmV4cG9ydCB0eXBlIElPcHRpb25zUGx1cyA9IHtcblx0LyoqXG5cdCAqIOS4jeS9v+eUqOWwj+iqquWutuaPkOS+m+eahCB0eHQg5LiL6LyJ6YCj57WQXG5cdCAqL1xuXHRkaXNhYmxlVHh0ZG93bmxvYWQ/OiBib29sZWFuLFxuXG5cdHByb3RvY29sTW9kZT86IEVudW1Qcm90b2NvbE1vZGUgfCBib29sZWFuLFxufVxuXG5leHBvcnQgdHlwZSBJRG93bmxvYWRPcHRpb25zID0gTm92ZWxTaXRlRGVtby5JRG93bmxvYWRPcHRpb25zICYgSU9wdGlvbnNQbHVzXG5leHBvcnQgdHlwZSBJT3B0aW9uc1J1bnRpbWUgPSBOb3ZlbFNpdGVEZW1vLklPcHRpb25zUnVudGltZSAmIElEb3dubG9hZE9wdGlvbnMgJiBJT3B0aW9uc1BsdXNcblxuQHN0YXRpY0ltcGxlbWVudHM8Tm92ZWxTaXRlLklOb3ZlbFNpdGVTdGF0aWM8Tm92ZWxTaXRlU3lvc2V0dT4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVTeW9zZXR1IGV4dGVuZHMgTm92ZWxTaXRlRGVtby5Ob3ZlbFNpdGVcbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWSA9ICdzeW9zZXR1JztcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zOiBJRG93bmxvYWRPcHRpb25zLCAuLi5hcmd2KVxuXHR7XG5cdFx0c3VwZXIob3B0aW9ucywgLi4uYXJndik7XG5cblx0XHR0aGlzLm9wdGlvbnNJbml0LnJldHJ5RGVsYXkgPSB0aGlzLm9wdGlvbnNJbml0LnJldHJ5RGVsYXkgfHwgMjUwMDA7XG5cdH1cblxuXHRzdGF0aWMgY2hlY2sodXJsOiBzdHJpbmcgfCBVUkwgfCBOb3ZlbFNpdGUuSVBhcnNlVXJsLCAuLi5hcmd2KTogYm9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIGNoZWNrKHVybCwgLi4uYXJndik7XG5cdH1cblxuXHRzdGF0aWMgbWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIG1ha2VVcmwodXJsb2JqLCBib29sLCAuLi5hcmd2KVxuXHR9XG5cblx0c3RhdGljIHBhcnNlVXJsKHVybDogc3RyaW5nIHwgVVJMIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIHBhcnNlVXJsKHVybCwgLi4uYXJndik7XG5cdH1cblxuXHRtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbD86IGJvb2xlYW4gfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gbWFrZVVybCh1cmxvYmosIGJvb2wsIC4uLmFyZ3YpXG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IHN0cmluZyB8IFVSTCB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBwYXJzZVVybCh1cmwsIC4uLmFyZ3YpO1xuXHR9XG5cblx0c2Vzc2lvbjxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+LCB1cmw6IFVSTClcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSA9IG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhIHx8IHt9O1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YS5vdmVyMTggPSAneWVzJztcblxuXHRcdC8qXG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEuc2FzaWVubyA9IDA7XG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEubGluZWhlaWdodCA9IDA7XG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEuZm9udHNpemUgPSAwO1xuXHRcdG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhLm5vdmVsbGF5b3V0ID0gMDtcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YS5maXhfbWVudV9iYXIgPSAwO1xuXHRcdCovXG5cblx0XHRzdXBlci5zZXNzaW9uKG9wdGlvbnNSdW50aW1lLCB1cmwpO1xuXG5cdFx0Ly9sZXQgdXJsID0gb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS51cmw7XG5cblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyXG5cdFx0Ly8uc2V0Q29va2llU3luYygnb3ZlcjE4PXllczsgRG9tYWluPS5zeW9zZXR1LmNvbTsgUGF0aD0vOyBob3N0T25seT1mYWxzZScsIHVybC5ocmVmKVxuXHRcdDtcblxuLy9cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJ1blNjcmlwdHMgPSAnZGFuZ2Vyb3VzbHknO1xuLy9cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnZpcnR1YWxDb25zb2xlID0gZmFsc2U7XG5cblx0XHQvL29wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyB8fCB7fTtcblxuLy9cdFx0aWYgKCFvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMuamFyKVxuLy9cdFx0e1xuXHRcdC8vb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zLmphciA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIud3JhcEZvclJlcXVlc3QoKTtcbi8vXHRcdH1cblxuXHRcdC8vb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnVzZXJBZ2VudCA9ICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNzEuMC4zNTc4Ljk4IFNhZmFyaS81MzcuMzYnO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRkb3dubG9hZCh1cmw6IHN0cmluZyB8IFVSTCwgZG93bmxvYWRPcHRpb25zOiBJRG93bmxvYWRPcHRpb25zID0ge30pXG5cdHtcblx0XHRyZXR1cm4gc3VwZXIuZG93bmxvYWQodXJsLCBkb3dubG9hZE9wdGlvbnMpO1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9wYXJzZUNoYXB0ZXI8VD4ocmV0LCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGUpOiBQcm9taXNlPHN0cmluZz5cblx0e1xuXHRcdGlmICghcmV0KVxuXHRcdHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLmRpc2FibGVUeHRkb3dubG9hZClcblx0XHR7XG5cdFx0XHRyZXR1cm4gcmV0LmJvZHk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgJDogSlF1ZXJ5U3RhdGljID0gcmV0LmRvbS4kO1xuXG5cdFx0bGV0IF9pbWdzID0gJCgnI25vdmVsX3AsICNub3ZlbF9ob25idW4sICNub3ZlbF9hJylcblx0XHRcdC5maW5kKCdpbWdbc3JjXScpXG5cdFx0O1xuXG5cdFx0YXdhaXQgUHJvbWlzZUJsdWViaXJkXG5cdFx0XHQucmVzb2x2ZShfaW1ncy50b0FycmF5KCkpXG5cdFx0XHQuZWFjaChhc3luYyAoZWxlbSwgaSkgPT5cblx0XHRcdHtcblx0XHRcdFx0bGV0IGltZyA9ICQoZWxlbSk7XG5cdFx0XHRcdGxldCBzcmMgPSBpbWcucHJvcCgnc3JjJyk7XG5cblx0XHRcdFx0Y2FjaGUuY2hhcHRlci5pbWdzID0gY2FjaGUuY2hhcHRlci5pbWdzIHx8IFtdO1xuXG5cdFx0XHRcdGF3YWl0IHBhcnNlQXN5bmMoc3JjKVxuXHRcdFx0XHRcdC50aGVuKGRhdGEgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKGRhdGEuZnVsbHNpemUpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHNyYyA9IGRhdGEuZnVsbHNpemU7XG5cblx0XHRcdFx0XHRcdFx0aW1nLnByb3AoJ3NyYycsIHNyYyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZSA9PiBjb25zb2xlLmVycm9yKGUpKVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRjYWNoZS5jaGFwdGVyLmltZ3MucHVzaChzcmMpO1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGNhY2hlLm5vdmVsLmltZ3MucHVzaChzcmMpO1xuXHRcdFx0fSlcblx0XHQ7XG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUua2VlcEltYWdlKVxuXHRcdHtcblx0XHRcdGF3YWl0IF9rZWVwSW1hZ2VJbkNvbnRleHQoX2ltZ3MsICQsIHtcblx0XHRcdFx0cHJlZml4OiAn5oy/57W1Jyxcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGxldCBib2R5czogSlF1ZXJ5W10gPSBbXG5cdFx0XHQkKCcjbm92ZWxfcCcpLFxuXHRcdFx0JCgnI25vdmVsX2hvbmJ1bicpLFxuXHRcdFx0JCgnI25vdmVsX2EnKSxcblx0XHRdO1xuXG5cdFx0Ym9keXMuZm9yRWFjaCh0ID0+IGtlZXBGb3JtYXRUYWcodCwge1xuXHRcdFx0JCxcblx0XHRcdG9wdGlvbnNSdW50aW1lLFxuXHRcdH0pKTtcblxuXHRcdHJldHVybiBib2R5cy5tYXAodiA9PiB2LnRleHQoKSkuZmlsdGVyKGZ1bmN0aW9uICh2KVxuXHRcdHtcblx0XHRcdHJldHVybiB2O1xuXHRcdH0pLmpvaW4oJ1xcblxcbj09PT09PT09PT09PT09PT09PVxcblxcbicpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9jcmVhdGVDaGFwdGVyVXJsPFQgPSBJT3B0aW9uc1J1bnRpbWUgJiBJRG93bmxvYWRPcHRpb25zPih7XG5cdFx0bm92ZWwsXG5cdFx0dm9sdW1lLFxuXHRcdGNoYXB0ZXIsXG5cdH06IHtcblx0XHRub3ZlbDogTm92ZWxTaXRlLklOb3ZlbCxcblx0XHR2b2x1bWU6IE5vdmVsU2l0ZS5JVm9sdW1lLFxuXHRcdGNoYXB0ZXI6IE5vdmVsU2l0ZS5JQ2hhcHRlcixcblx0fSwgb3B0aW9uc1J1bnRpbWU/OiBUICYgSU9wdGlvbnNSdW50aW1lKTogVVJMXG5cdHtcblx0XHRpZiAob3B0aW9uc1J1bnRpbWUuZGlzYWJsZVR4dGRvd25sb2FkKVxuXHRcdHtcblx0XHRcdGxldCB1cmwgPSB0aGlzLm1ha2VVcmwoe1xuXHRcdFx0XHRjaGFwdGVyX2lkOiBjaGFwdGVyLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdG5vdmVsX2lkOiBub3ZlbC51cmxfZGF0YS5ub3ZlbF9pZCxcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gdGhpcy5faGFja1VSTCh1cmwsIG9wdGlvbnNSdW50aW1lKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gc3VwZXIuX2NyZWF0ZUNoYXB0ZXJVcmwoe1xuXHRcdFx0bm92ZWwsXG5cdFx0XHR2b2x1bWUsXG5cdFx0XHRjaGFwdGVyLFxuXHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBvcHRpb25zID0ge30sIC4uLm9wdHMpXG5cdHtcblx0XHRvcHRpb25zW3RoaXMuSURLRVldID0ge1xuXHRcdFx0dHh0ZG93bmxvYWRfaWQ6IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwubm92ZWxfc3lvc2V0dV9pZCB8fCAnJyxcblx0XHRcdHNlcmllc19pZDogb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbC5ub3ZlbF9zeW9zZXR1X3Nlcmllc19pZCB8fCAnJyxcblx0XHR9O1xuXG5cdFx0cmV0dXJuIHN1cGVyLl9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lLCBvcHRpb25zLCB7XG5cdFx0XHRvcHRpb25zOiB7XG5cdFx0XHRcdHRleHRsYXlvdXQ6IHtcblx0XHRcdFx0XHRhbGxvd19sZjI6IHRydWUsXG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdH0sIC4uLm9wdHMpO1xuXHR9XG5cblx0X2hhY2tVUkwob2JqOiBVUkwgfCBzdHJpbmcsIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUpXG5cdHtcblx0XHRpZiAodHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpXG5cdFx0e1xuXHRcdFx0b2JqID0gY3JlYXRlVVJMKG9iaik7XG5cdFx0fVxuXG5cdFx0aWYgKG9iai5ob3N0bmFtZSA9PT0gJ25jb2RlLnN5b3NldHUuY29tJyB8fCBvYmouaG9zdG5hbWUgPT09ICdub3ZlbDE4LnN5b3NldHUuY29tJylcblx0XHR7XG5cdFx0XHRzd2l0Y2ggKG9wdGlvbnNSdW50aW1lLnByb3RvY29sTW9kZSlcblx0XHRcdHtcblx0XHRcdFx0Y2FzZSBFbnVtUHJvdG9jb2xNb2RlLkhUVFA6XG5cdFx0XHRcdFx0b2JqLnByb3RvY29sID0gJ2h0dHAnO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIHRydWU6XG5cdFx0XHRcdGNhc2UgRW51bVByb3RvY29sTW9kZS5IVFRQUzpcblx0XHRcdFx0XHRvYmoucHJvdG9jb2wgPSAnaHR0cHMnO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBvYmpcblx0fVxuXG5cdHByb3RlY3RlZCBfZmV0Y2hDaGFwdGVyPFQ+KHVybDogVVJMLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgX2NhY2hlXzoge1xuXHRcdG5vdmVsOiBJTm92ZWwsXG5cdH0pXG5cdHtcblx0XHRsZXQgdHJ5ZWQ6IGJvb2xlYW47XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgX2ZldGNoQ2hhcHRlciA9IHN1cGVyLl9mZXRjaENoYXB0ZXI7XG5cblx0XHRyZXR1cm4gc3VwZXIuX2ZldGNoQ2hhcHRlcih1cmwsIG9wdGlvbnNSdW50aW1lLCBfY2FjaGVfKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKHJldClcblx0XHRcdHtcblx0XHRcdFx0aWYgKHJldCA9PSBudWxsKSByZXR1cm4gcmV0O1xuXG5cdFx0XHRcdGNvbnN0IGRvbSA9IHJldC5kb207XG5cblx0XHRcdFx0aWYgKCF0cnllZCAmJiBkb20gJiYgZG9tLiQoJyNtb2RhbCAueWVzICN5ZXMxOCcpLmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5lcnJvcihg54Sh5rOV5oiQ5Yqf6K6A5Y+WIFIxOCDpoIHpnaJgLCB1cmwuaHJlZik7XG5cblx0XHRcdFx0XHR0cnllZCA9IHRydWU7XG5cblx0XHRcdFx0XHR0cnlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQkKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5jbGljaygpO1xuXHRcdFx0XHRcdFx0JCgnI21vZGFsIC55ZXMgI3llczE4JylbMF0uY2xpY2soKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphci5zZXRDb29raWVTeW5jKCdvdmVyMTg9eWVzOyBEb21haW49LnN5b3NldHUuY29tOyBQYXRoPS87IGhvc3RPbmx5PWZhbHNlJywgdXJsKTtcblx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyLnNldENvb2tpZVN5bmMoYG92ZXIxOD15ZXM7IERvbWFpbj0ke2RvbS51cmwuaG9zdH07IFBhdGg9LzsgaG9zdE9ubHk9ZmFsc2VgLCBkb20udXJsKTtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5kZWJ1ZyhvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyLmdldEFsbENvb2tpZXMoKSk7XG5cblx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVmZXJyZXIgPSBkb20udXJsO1xuXHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyB8fCB7fTtcblx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMuZm9ybSA9IGRvbS51cmw7XG5cblx0XHRcdFx0XHRyZXR1cm4gX2ZldGNoQ2hhcHRlci5jYWxsKHNlbGYsIHVybCwgb3B0aW9uc1J1bnRpbWUsIF9jYWNoZV8pXG5cdFx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAocmV0KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjb25zdCBkb20gPSByZXQuZG9tO1xuXHRcdFx0XHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCQoJyNtb2RhbCAueWVzICN5ZXMxOCcpLmxlbmd0aClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoYOeEoeazleaIkOWKn+iugOWPliBSMTgg6aCB6Z2iYCwgdXJsLmhyZWYpO1xuXG5cdFx0XHRcdFx0XHRcdFx0Ly9wcm9jZXNzLmV4aXQoKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXQ7XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHJldDtcblx0XHRcdH0pXG5cdH1cblxuXHRhc3luYyBfbm92ZWwxODxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4odXJsLFxuXHRcdGRvbTogSUpTRE9NLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9LFxuXHQpOiBQcm9taXNlPElKU0RPTT5cblx0e1xuXHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdGlmICghJCgnI25vdmVsX2NvbnRlbnRzJykubGVuZ3RoIHx8ICQoJyNtb2RhbCAueWVzICN5ZXMxOCcpLmxlbmd0aClcblx0XHR7XG5cdFx0XHQvL2NvbnNvbGUubG9nKGRvbS51cmwsIGRvbS5fb3B0aW9ucyk7XG5cblx0XHRcdCQoJyNtb2RhbCAueWVzICN5ZXMxOCcpLmNsaWNrKCk7XG5cblx0XHRcdGRvbS5fb3B0aW9ucy5yZXF1ZXN0T3B0aW9ucy5qYXIuc2V0Q29va2llKCdvdmVyMTg9eWVzOyBEb21haW49LnN5b3NldHUuY29tOyBQYXRoPS87IGhvc3RPbmx5PWZhbHNlJywgdXJsKTtcblxuXHRcdFx0Ly9jb25zb2xlLmxvZyhkb20uc2VyaWFsaXplKCkpO1xuXG5cdFx0XHRyZXR1cm4gZnJvbVVSTCh1cmwsIE9iamVjdC5hc3NpZ24ob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLCB7XG5cblx0XHRcdFx0Ly9jb29raWVKYXI6IGRvbS5fb3B0aW9ucy5yZXF1ZXN0T3B0aW9ucy5qYXIuX2phcixcblx0XHRcdFx0Ly9yZXF1ZXN0T3B0aW9uczogZG9tLl9vcHRpb25zLnJlcXVlc3RPcHRpb25zLFxuXG5cdFx0XHR9IGFzIElGcm9tVXJsT3B0aW9ucykpO1xuXHRcdH1cblxuXHRcdC8vY29uc29sZS5sb2coZG9tLl9vcHRpb25zLnJlcXVlc3RPcHRpb25zLmphcik7XG5cblx0XHRyZXR1cm4gZG9tO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9nZXRFeHRyYUluZm9VUkw8VD4oc2VhcmNoOiBzdHJpbmcsXG5cdFx0dXJsX2RhdGE6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+LFxuXHQpXG5cdHtcblx0XHRsZXQgb3B0aW9uc0pTRE9NID0ge1xuXHRcdFx0Li4ub3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLFxuXHRcdFx0cmVxdWVzdE9wdGlvbnM6IHtcblx0XHRcdFx0Li4ub3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zLFxuXHRcdFx0fSxcblx0XHR9O1xuXG5cdFx0b3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zID0gb3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zIHx8IHt9O1xuXHRcdG9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucy5mb2xsb3dSZWRpcmVjdCA9IHRydWU7XG5cblx0XHRsZXQgX2RvbWFpbiA9IDEgPyAnbmFyLmpwJyA6ICdkaXAuanAnO1xuXG5cdFx0bGV0IF91cmwgPSBgaHR0cHM6Ly8ke3VybF9kYXRhLm5vdmVsX3IxOFxuXHRcdFx0PyAnbmFyb3UxOCdcblx0XHRcdDogJ25hcm91J30uJHtfZG9tYWlufS9zZWFyY2gucGhwP3RleHQ9JHtzZWFyY2h9Jm5vdmVsPWFsbCZnZW5yZT1hbGwmbmV3X2dlbnJlPWFsbCZsZW5ndGg9MCZkb3duPTAmdXA9MTAwYDtcblxuXHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1Zyhg6Kmm5ZyW5Y+W5b6X5bCP6Kqq55u46Zec6LOH6KiKICgxKWAsIF91cmwpO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwoX3VybCwgb3B0aW9uc0pTRE9NKVxuXHR9XG5cblx0cHJvdGVjdGVkIF9nZXRFeHRyYUluZm9VUkwyPFQsIE0gZXh0ZW5kcyBQYXJ0aWFsPElOb3ZlbCAmIElNZGNvbmZNZXRhPj4odXJsX2RhdGE6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+LFxuXHRcdGRhdGFfbWV0YTogTSxcblx0KTogUHJvbWlzZUJsdWViaXJkPE0+XG5cdHtcblx0XHRsZXQgc3ViZG9tYWluID0gdXJsX2RhdGEubm92ZWxfcjE4ID8gJ25vdmVsMTgnIDogJ25jb2RlJztcblxuXHRcdGxldCBpbmZvX3VybCA9IGBodHRwczovLyR7c3ViZG9tYWlufS5zeW9zZXR1LmNvbS9ub3ZlbHZpZXcvaW5mb3RvcC9uY29kZS8ke3VybF9kYXRhLm5vdmVsX2lkfS9gO1xuXG5cdFx0ZGF0YV9tZXRhID0gZGF0YV9tZXRhIHx8ICh7fSBhcyBNKTtcblxuXHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1Zyhg6Kmm5ZyW5Y+W5b6X5bCP6Kqq55u46Zec6LOH6KiKICgyKWAsIGluZm9fdXJsKTtcblxuXHRcdHJldHVybiBmcm9tVVJMKGluZm9fdXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdCQoJyNub3ZlbHRhYmxlMSB0cicpXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRsZXQgX3RyID0gJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0bGV0IF90aF90ZXh0ID0gU3RyaW5nKCQoJ3RoJywgX3RyKS50ZXh0KCkpO1xuXG5cdFx0XHRcdFx0XHRpZiAoX3RoX3RleHQuaW5kZXhPZign44Kt44O844Ov44O844OJJykgIT0gLTEpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbCA9IGRhdGFfbWV0YS5ub3ZlbCB8fCB7fTtcblx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MgPSBkYXRhX21ldGEubm92ZWwudGFncyB8fCBbXTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgX3RkX3RleHQgPSBTdHJpbmcoJCgndGQnLCBfdHIpLnRleHQoKSlcblx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvXFxzKy9nLCAnICcpXG5cdFx0XHRcdFx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0X3RkX3RleHRcblx0XHRcdFx0XHRcdFx0XHQuc3BsaXQoL1xccysvKVxuXHRcdFx0XHRcdFx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uICh0YWcpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHRhZylcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0IF90ID0gdGFnLnNwbGl0KCcvJykubWFwKHMgPT4gcy50cmltKCkpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzLnB1c2goLi4uX3QpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2UgaWYgKF90aF90ZXh0LmluZGV4T2YoJ+OCuOODo+ODs+ODqycpICE9IC0xIHx8IF90aF90ZXh0LmluZGV4T2YoJ+aOsui8ieOCteOCpOODiCcpICE9IC0xKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwgPSBkYXRhX21ldGEubm92ZWwgfHwge307XG5cdFx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzID0gZGF0YV9tZXRhLm5vdmVsLnRhZ3MgfHwgW107XG5cblx0XHRcdFx0XHRcdFx0bGV0IF90ZF90ZXh0ID0gU3RyaW5nKCQoJ3RkJywgX3RyKS50ZXh0KCkpXG5cdFx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL1xccysvZywgJyAnKVxuXHRcdFx0XHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdGlmIChfdGRfdGV4dClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzLnB1c2goX3RkX3RleHQpXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IGFnZV9saW1pdCA9ICQoJyNhZ2VfbGltaXQnKTtcblxuXHRcdFx0XHRpZiAoYWdlX2xpbWl0Lmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBfdCA9IGFnZV9saW1pdC50ZXh0KCkudHJpbSgpO1xuXG5cdFx0XHRcdFx0aWYgKF90KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbCA9IGRhdGFfbWV0YS5ub3ZlbCB8fCB7fTtcblx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzID0gZGF0YV9tZXRhLm5vdmVsLnRhZ3MgfHwgW107XG5cblx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzLnB1c2goX3QpO1xuXG5cdFx0XHRcdFx0XHRpZiAoX3QubWF0Y2goL3IxOC9pKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MucHVzaChgbm92ZWwxOGApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRhdGFfbWV0YS5saW5rID0gZGF0YV9tZXRhLmxpbmsgfHwgW107XG5cblx0XHRcdFx0ZGF0YV9tZXRhLmxpbmsucHVzaChgW+Wwj+iqrOaDheWgsV0oJHtkb20udXJsfSlgKTtcblxuXHRcdFx0XHRyZXR1cm4gZGF0YV9tZXRhO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChlID0+XG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5ncmF5LmVycm9yKGUudG9TdHJpbmcoKSk7XG5cdFx0XHRcdGNvbnNvbGUud2Fybihg5LiL6LyJ5bCP6Kqq6LOH6KiK5pmC55m855Sf6Yyv6KqkICgyKe+8jOatpOaPkOmGkuioiuaBr+WPr+S7peeEoeimlmApO1xuXG5cdFx0XHRcdHJldHVybiBkYXRhX21ldGE7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0Y3JlYXRlTWFpblVybDxUPih1cmw6IHN0cmluZyB8IFVSTCwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5faGFja1VSTChzdXBlci5jcmVhdGVNYWluVXJsKHVybCBhcyBhbnksIG9wdGlvbnNSdW50aW1lKSwgb3B0aW9uc1J1bnRpbWUpXG5cdH1cblxuXHRhc3luYyBnZXRfdm9sdW1lX2xpc3Q8VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KHVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9LFxuXHQpOiBQcm9taXNlPElOb3ZlbD5cblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0dXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKHVybCBhcyBhbnksIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhgZ2V0X3ZvbHVtZV9saXN0YCwgdXJsLnRvU3RyaW5nKCkpO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBzZWxmLl9ub3ZlbDE4PFQ+KHVybCwgZG9tLCBvcHRpb25zUnVudGltZSk7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zb2xlRGVidWcuaW5mbyhg6ZaL5aeL6JmV55CG5bCP6Kqq6LOH6KiK5Lul5Y+K56ug56+A5YiX6KGoYCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gZG9tLiQoJy5ub3ZlbF90aXRsZScpLnRleHQoKTtcblx0XHRcdFx0bGV0IG5vdmVsX2F1dGhvciA9IG5vdmVsVGV4dC50cmltKGRvbVxuXHRcdFx0XHRcdC4kKCcubm92ZWxfd3JpdGVybmFtZSBhLCAubm92ZWxfd3JpdGVybmFtZScpXG5cdFx0XHRcdFx0LmVxKC0xKVxuXHRcdFx0XHRcdC50ZXh0KCkpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL14uKuS9nOiAhe+8mi8sICcnKVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2Rlc2MgPSBkb20uJCgnI25vdmVsX2V4JykudGV4dCgpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9wdWJsaXNoZXIgPSBzZWxmLklES0VZO1xuXG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwoZG9tLnVybC5ocmVmKTtcblxuXHRcdFx0XHRsZXQgdm9sdW1lX2xpc3QgPSBbXSBhcyBOb3ZlbFNpdGUuSVZvbHVtZVtdO1xuXG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBOb3ZlbFNpdGUuSVZvbHVtZTtcblxuXHRcdFx0XHRsZXQgdGFibGUgPSBkb20uJCgnLmluZGV4X2JveCcpLmZpbmQoJz4gLmNoYXB0ZXJfdGl0bGUsIC5ub3ZlbF9zdWJsaXN0MicpO1xuXG5cdFx0XHRcdGxldCBfY2FjaGVfZGF0ZXMgPSBbXTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfc3lvc2V0dV9pZDtcblxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coZG9tLnNlcmlhbGl6ZSgpKTtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coJCgnI25vdmVsX2Zvb3RlcicpKTtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coJCgnI25vdmVsX2Zvb3RlcicpLmZpbmQoJy51bmRlcm5hdmkgYVtocmVmKj1cInR4dGRvd25sb2FkXCJdJykpO1xuXG5cdFx0XHRcdFx0bGV0IG07XG5cdFx0XHRcdFx0bGV0IGR0ID0gZG9tLiQoJyNub3ZlbF9mb290ZXIgLnVuZGVybmF2aSBhW2hyZWYqPVwidHh0ZG93bmxvYWRcIl0nKS5wcm9wKCdocmVmJyk7XG5cblx0XHRcdFx0XHRpZiAoZHQgJiYgKG0gPSBkdC5tYXRjaCgvbmNvZGVcXC8oXFxkKykvKSkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bm92ZWxfc3lvc2V0dV9pZCA9IG1bMV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKCFvcHRpb25zUnVudGltZS5kaXNhYmxlVHh0ZG93bmxvYWQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGDlrpjmlrkgdHh0IOS4i+i8ieWKn+iDvemBreemgeeUqO+8jOaIluiri+S9v+eUqCBjb29raWVzIOeZu+WFpe+8jOaIluWwhyBkaXNhYmxlVHh0ZG93bmxvYWQg6Kit54K6IHRydWVgKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRhYmxlXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdGxldCB0ciA9IGRvbS4kKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRpZiAodHIuaXMoJy5jaGFwdGVyX3RpdGxlJykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZTogdHIudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoIWN1cnJlbnRWb2x1bWUpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiAnbnVsbCcsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgYSA9IHRyLmZpbmQoJy5zdWJ0aXRsZSBhJyk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfZGF0ZTtcblx0XHRcdFx0XHRcdFx0bGV0IGRkO1xuXHRcdFx0XHRcdFx0XHRsZXQgZGEgPSB0ci5maW5kKCcubG9uZ191cGRhdGUnKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoZGEuZmluZCgnc3Bhblt0aXRsZSo9XCIvXCJdJykubGVuZ3RoKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZGQgPSBkYS5maW5kKCdzcGFuW3RpdGxlKj1cIi9cIl0nKS5hdHRyKCd0aXRsZScpLnJlcGxhY2UoL+aUueeov3xeXFxzK3xcXHMrJC9nLCAnJyk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoIWRkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZGEuZmluZCgnKicpLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0XHRcdGRkID0gZGEudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChkZClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfZGF0ZSA9IG1vbWVudChkZCwgJ1lZWVkvTU0vREQgSEg6bW0nKS5sb2NhbCgpO1xuXHRcdFx0XHRcdFx0XHRcdF9jYWNoZV9kYXRlcy5wdXNoKGNoYXB0ZXJfZGF0ZS51bml4KCkpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0bGV0IGhyZWYgPSBhLnByb3AoJ2hyZWYnKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgZGF0YSA9IHNlbGYucGFyc2VVcmwoaHJlZik7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFkYXRhLmNoYXB0ZXJfaWQpXG5cdFx0XHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0XHRcdGlmICh0ci5maW5kKCcuYm9va21hcmtlcl9ub3cnKS5sZW5ndGgpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdFx0XHQgKiBmaXggaHR0cHM6Ly9uY29kZS5zeW9zZXR1LmNvbS9uNzYzN2RqL1xuXHRcdFx0XHRcdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2codHIucHJvcChcIm91dGVySFRNTFwiKSk7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYS5wcm9wKFwib3V0ZXJIVE1MXCIpKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhocmVmKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhLmF0dHIoJ2hyZWYnKSk7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKG5ldyBVUkwoaHJlZiwgZG9tLnVybCkpO1xuXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZG9tLl9vcHRpb25zKTtcblxuXHRcdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZGF0YSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdHVybDogbnVsbCxcblx0XHRcdFx0XHRcdFx0XHRcdG5vdmVsX3BpZDogbm92ZWxfc3lvc2V0dV9pZCBhcyBzdHJpbmcsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQgYXMgc3RyaW5nLFxuXHRcdFx0XHRcdFx0XHRcdH0gYXMgYW55O1xuXG5cdFx0XHRcdFx0XHRcdFx0aHJlZiA9IHNlbGYuX2hhY2tVUkwoc2VsZi5tYWtlVXJsKGRhdGEpLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0XHRcdFx0XHRkYXRhLnVybCA9IGhyZWY7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lXG5cdFx0XHRcdFx0XHRcdFx0LmNoYXB0ZXJfbGlzdFxuXHRcdFx0XHRcdFx0XHRcdC5wdXNoKHtcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaW5kZXg6IGN1cnJlbnRWb2x1bWUuY2hhcHRlcl9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGU6IGEudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKSxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsOiBocmVmLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmxfZGF0YTogZGF0YSxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfZGF0ZSxcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdF9jYWNoZV9kYXRlcy5zb3J0KCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGUgPSBtb21lbnQudW5peChfY2FjaGVfZGF0ZXNbX2NhY2hlX2RhdGVzLmxlbmd0aCAtIDFdKS5sb2NhbCgpO1xuXG5cdFx0XHRcdGxldCBhID0gYXdhaXQgc2VsZi5fZ2V0RXh0cmFJbmZvVVJMKHVybF9kYXRhLm5vdmVsX2lkLCB1cmxfZGF0YSwgb3B0aW9uc1J1bnRpbWUpXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKGRvbSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgaDIgPSBkb20uJChgZGl2Omhhcyg+IGgyLnNlYXJjaDpoYXMoPiBhW2hyZWYqPVwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIl0pKWApLmVxKDApO1xuXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aDIgPSBkb20uJChgaDI6aGFzKD4gYVtocmVmKj1cIiR7dXJsX2RhdGEubm92ZWxfaWR9XCJdKWApLmVxKDApO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS53YXJuKGBjYW4gbm90IGZvdW5kIGtleXdvcmQgXCIke3VybF9kYXRhLm5vdmVsX2lkfVwiLCB3aWxsIHRyeSB1c2UgdGl0bGUgc2VhcmNoYCk7XG5cblx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdCAqIGh0dHBzOi8vbmFyb3UxOC5uYXIuanAvc2VhcmNoLnBocD90ZXh0PSVFMyU4MyVBOSVFMyU4MyVCMyVFMyU4MiVBRiVFNSU4NiU5MiVFOSU5OSVCQSVFOCU4MCU4NSVFMyU4MSVBRSVFMyU4MiVCOSVFMyU4MyVBRCVFMyU4MyVCQyVFMyU4MyVBOSVFMyU4MiVBNCVFMyU4MyU5NSZub3ZlbD1hbGwmZ2VucmU9YWxsJm5ld19nZW5yZT1hbGwmbGVuZ3RoPTAmZG93bj0wJnVwPTEwMFxuXHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0bGV0IHRpdGxlID0gbm92ZWxfdGl0bGVcblx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvW1xcd++9gS3vvZpdKy9pZywgJyAnKVxuXHRcdFx0XHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9nZXRFeHRyYUluZm9VUkwodGl0bGUsIHVybF9kYXRhLCBvcHRpb25zUnVudGltZSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldHVybiBkb207XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coZG9tLnVybCk7XG5cblx0XHRcdFx0XHRcdGxldCBkYXRhOiBJTWRjb25mTWV0YSA9IHt9O1xuXG5cdFx0XHRcdFx0XHRsZXQgaDIgPSBkb20uJChgZGl2Omhhcyg+IGgyLnNlYXJjaDpoYXMoPiBhW2hyZWYqPVwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIl0pKWApLmVxKDApO1xuXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aDIgPSBkb20uJChgaDI6aGFzKD4gYVtocmVmKj1cIiR7dXJsX2RhdGEubm92ZWxfaWR9XCJdKWApLmVxKDApO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRsZXQgc2VhcmNoX2xlZnQgPSBoMi5uZXh0QWxsKCcuc2VhcmNoX2xlZnQ6ZXEoMCknKS5lcSgwKTtcblx0XHRcdFx0XHRcdGxldCBzZWFyY2hfcmlnaHQgPSBoMi5uZXh0QWxsKCcuc2VhcmNoX3JpZ2h0OmVxKDApJykuZXEoMCk7XG5cblx0XHRcdFx0XHRcdGlmICghc2VhcmNoX2xlZnQubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRzZWFyY2hfbGVmdCA9IGgyLnNpYmxpbmdzKCcuc2VhcmNoX2xlZnQ6ZXEoMCknKS5lcSgwKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKCFzZWFyY2hfcmlnaHQubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRzZWFyY2hfcmlnaHQgPSBoMi5zaWJsaW5ncygnLnNlYXJjaF9yaWdodDplcSgwKScpLmVxKDApO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygxMTExMTExMTExMTExMTExMTExMTEpO1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlLndhcm4oYGNhbiBub3QgZm91bmQga2V5d29yZCBmb3IgJHt1cmxfZGF0YS5ub3ZlbF9pZH1gLCBkb20udXJsKTtcblxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZGF0YTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhzZWFyY2hfbGVmdCk7XG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKHNlYXJjaF9yaWdodCk7XG5cblx0XHRcdFx0XHRcdGRhdGEubm92ZWwgPSB7fTtcblxuXHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC5zdGF0dXMgPSBzZWFyY2hfbGVmdC5maW5kKCcubm92ZWxfdHlwZScpLnRleHQoKS50cmltKCk7XG5cdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MgPSBbXTtcblxuXHRcdFx0XHRcdFx0aWYgKGRhdGEubm92ZWwuc3RhdHVzID09PSAn5a6M57WQ5riIJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC5ub3ZlbF9zdGF0dXMgfD0gRW51bU5vdmVsU3RhdHVzLkFVVEhPUl9ET05FO1xuXG5cdFx0XHRcdFx0XHRcdGRhdGEubm92ZWwudGFncy5wdXNoKGRhdGEubm92ZWwuc3RhdHVzKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0c2VhcmNoX3JpZ2h0LmZpbmQoJy5rZXl3b3JkIGEnKVxuXHRcdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgayA9IGRvbS4kKGVsZW0pXG5cdFx0XHRcdFx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdFx0XHRcdFx0XHQuc3BsaXQoL1tcXC9cXHNdLylcblx0XHRcdFx0XHRcdFx0XHRcdC5tYXAoZnVuY3Rpb24gKHMpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBzLnRyaW0oKTtcblx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHQuZmlsdGVyKCh2KSA9PiB2KVxuXHRcdFx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0XHRcdGRhdGEubm92ZWwudGFncyA9IGRhdGEubm92ZWwudGFncy5jb25jYXQoayk7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdHNlYXJjaF9sZWZ0XG5cdFx0XHRcdFx0XHRcdC5maW5kKCdbY2xhc3MqPVwibmV3X2dlbnJlXCJdLCAubm9jZ2VucmUnKVxuXHRcdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgayA9IGRvbS4kKGVsZW0pXG5cdFx0XHRcdFx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG5cdFx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGspXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzLnB1c2goayk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRkYXRhLmxpbmsgPSBkYXRhLmxpbmsgfHwgW107XG5cblx0XHRcdFx0XHRcdGRhdGEubGluay5wdXNoKGBbJHtkb20udXJsLmhvc3RuYW1lfV0oJHtkb20udXJsfSkgLSDlsI/oqqzlrrbjgavjgarjgo3jgYbjgIDmm7TmlrDmg4XloLHmpJzntKJgKTtcblxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkYXRhKTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGRhdGE7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLmdyYXkuZXJyb3IoZS50b1N0cmluZygpKTtcblx0XHRcdFx0XHRcdGNvbnNvbGUud2Fybihg5LiL6LyJ5bCP6Kqq6LOH6KiK5pmC55m855Sf6Yyv6KqkICgxKe+8jOatpOaPkOmGkuioiuaBr+WPr+S7peeEoeimlmApO1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4ge307XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGEgPSBhd2FpdCBzZWxmLl9nZXRFeHRyYUluZm9VUkwyKHVybF9kYXRhLCBvcHRpb25zUnVudGltZSwgYSk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3Nlcmllc190aXRsZTogc3RyaW5nO1xuXHRcdFx0XHRsZXQgbm92ZWxfc3lvc2V0dV9zZXJpZXNfaWQ6IHN0cmluZztcblxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IF9hID0gZG9tLiQoJyNub3ZlbF9jb250ZW50cyAuc2VyaWVzX3RpdGxlJyk7XG5cblx0XHRcdFx0XHRsZXQgdCA9IF9hLnRleHQoKVxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoL1tcXHJcXG5cXHRdK3xeXFxzK3xcXHMrJC9nLCAnJylcblx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRpZiAodClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRub3ZlbF9zZXJpZXNfdGl0bGUgPSB0O1xuXG5cdFx0XHRcdFx0XHRfYSA9IF9hLmZpbmQoJ2EnKTtcblx0XHRcdFx0XHRcdGxldCBfdCA9IF9hLmF0dHIoJ2hyZWYnKSB8fCAnJztcblxuXHRcdFx0XHRcdFx0aWYgKC9cXC8oXFx3ezYsfSlcXC8vaS5leGVjKF90KSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bm92ZWxfc3lvc2V0dV9zZXJpZXNfaWQgPSBSZWdFeHAuJDE7XG5cblx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRhLmxpbmsgPSBhLmxpbmsgfHwgW107XG5cblx0XHRcdFx0XHRcdFx0bGV0IHRpdGxlID0gbm92ZWxfc2VyaWVzX3RpdGxlXG5cdFx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL1tcXFtcXF1cXH5cXGBdL2csICdcXFxcJDAnKVxuXHRcdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9bXCInXS9nLCAnJylcblx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0YS5saW5rLnB1c2goYFske3RpdGxlfV0oJHtfYS5wcm9wKCdocmVmJyl9KWApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1Zyhg57WQ5p2f6JmV55CG5bCP6Kqq6LOH6KiK5Lul5Y+K56ug56+A5YiX6KGoYCk7XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdC4uLmEsXG5cblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcblx0XHRcdFx0XHRub3ZlbF9hdXRob3IsXG5cblx0XHRcdFx0XHRub3ZlbF9kZXNjLFxuXHRcdFx0XHRcdG5vdmVsX2RhdGUsXG5cdFx0XHRcdFx0bm92ZWxfcHVibGlzaGVyLFxuXG5cdFx0XHRcdFx0bm92ZWxfc2VyaWVzX3RpdGxlLFxuXHRcdFx0XHRcdG5vdmVsX3N5b3NldHVfc2VyaWVzX2lkLFxuXG5cdFx0XHRcdFx0bm92ZWxfc3lvc2V0dV9pZCxcblxuXHRcdFx0XHRcdHZvbHVtZV9saXN0LFxuXG5cdFx0XHRcdFx0Y2hlY2tkYXRlOiBtb21lbnQoKS5sb2NhbCgpLFxuXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdH0gYXMgSU5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZVN5b3NldHU7XG5cbiJdfQ==