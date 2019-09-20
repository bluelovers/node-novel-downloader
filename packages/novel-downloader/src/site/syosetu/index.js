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
const jsdom_url_1 = require("jsdom-url");
const index_1 = require("../index");
const index_2 = require("../index");
const NovelSiteDemo = require("../demo/base");
const novel_text_1 = require("novel-text");
const log_1 = require("../../util/log");
const html_1 = require("../../util/html");
var EnumProtocolMode;
(function (EnumProtocolMode) {
    EnumProtocolMode[EnumProtocolMode["NONE"] = 0] = "NONE";
    EnumProtocolMode[EnumProtocolMode["HTTPS"] = 1] = "HTTPS";
    EnumProtocolMode[EnumProtocolMode["HTTP"] = 2] = "HTTP";
})(EnumProtocolMode = exports.EnumProtocolMode || (exports.EnumProtocolMode = {}));
let NovelSiteSyosetu = class NovelSiteSyosetu extends NovelSiteDemo.NovelSite {
    constructor(options, ...argv) {
        super(options, ...argv);
        this.optionsInit.retryDelay = this.optionsInit.retryDelay || 25000;
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
    _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        if (!optionsRuntime.disableTxtdownload) {
            return ret.body;
        }
        const $ = ret.dom.$;
        let _imgs = $('#novel_p, #novel_honbun, #novel_a')
            .find('img[src]');
        _imgs
            .each(function (i, elem) {
            let img = $(elem);
            let src = img.prop('src');
            cache.chapter.imgs = cache.chapter.imgs || [];
            // @ts-ignore
            cache.chapter.imgs.push(src);
            // @ts-ignore
            cache.novel.imgs.push(src);
        });
        if (optionsRuntime.keepImage) {
            html_1._keepImageInContext(_imgs, $);
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
            // @ts-ignore
            obj = new jsdom_url_1.URL(obj);
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
    makeUrl(urlobj, bool, optionsRuntime) {
        let subdomain = urlobj.novel_r18 ? 'novel18' : 'ncode';
        if (urlobj.novel_pid && urlobj.chapter_id) {
            // @ts-ignore
            return new jsdom_url_1.URL(`https://${subdomain}.syosetu.com/txtdownload/dlstart/ncode/${urlobj.novel_pid}/?no=${urlobj.chapter_id}&hankaku=0&code=utf-8&kaigyo=crlf`);
        }
        let pad = (!bool && urlobj.chapter_id) ? urlobj.chapter_id : '';
        // @ts-ignore
        return new jsdom_url_1.URL(`http://${subdomain}.syosetu.com/${urlobj.novel_id}/${pad}`);
    }
    parseUrl(url) {
        let urlobj = {
            url,
            novel_pid: null,
            novel_id: null,
            chapter_id: null,
            novel_r18: null,
        };
        //url = url.toString();
        try {
            // @ts-ignore
            urlobj.url = new jsdom_url_1.URL(url);
            // @ts-ignore
            url = urlobj.url.href;
        }
        catch (e) {
            log_1.console.warn(e.toString() + ` "${url}"`);
        }
        if (typeof url != 'string') {
            // @ts-ignore
            throw new TypeError(url);
        }
        let r;
        let m;
        r = /^(n[\w]{5,6})$/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        r = /(novel18)\.syosetu\.com/;
        if (m = r.exec(url)) {
            urlobj.novel_r18 = m[1];
        }
        r = /txtdownload\/dlstart\/ncode\/(\d+)/;
        if (m = r.exec(url)) {
            urlobj.novel_pid = m[1];
            return urlobj;
        }
        r = /\.syosetu\.com\/(n\w+)(?:\/?(\d+))?/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            urlobj.chapter_id = m[2];
            return urlobj;
        }
        return urlobj;
    }
    _fetchChapter(url, optionsRuntime) {
        let tryed;
        const self = this;
        let _fetchChapter = super._fetchChapter;
        return super._fetchChapter(url, optionsRuntime)
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
                return _fetchChapter.call(self, url, optionsRuntime)
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
                        chapter_date = index_2.moment(dd, 'YYYY/MM/DD HH:mm').local();
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
                        log_1.console.log(new jsdom_url_1.URL(href, dom.url));
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
            let novel_date = index_2.moment.unix(_cache_dates[_cache_dates.length - 1]).local();
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
                volume_list, checkdate: index_2.moment().local(), imgs: [] });
        });
    }
};
NovelSiteSyosetu.IDKEY = 'syosetu';
NovelSiteSyosetu = __decorate([
    index_1.staticImplements(),
    __metadata("design:paramtypes", [Object, Object])
], NovelSiteSyosetu);
exports.NovelSiteSyosetu = NovelSiteSyosetu;
exports.default = NovelSiteSyosetu;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLGdDQUFnQztBQUNoQyxxREFBNEQ7QUFPNUQsNkNBQStEO0FBRy9ELHlDQUFnQztBQUdoQyxvQ0FBMEY7QUFFMUYsb0NBQWtDO0FBRWxDLDhDQUErQztBQUMvQywyQ0FBbUM7QUFFbkMsd0NBQXVEO0FBQ3ZELDBDQUFxRTtBQU9yRSxJQUFrQixnQkFLakI7QUFMRCxXQUFrQixnQkFBZ0I7SUFFakMsdURBQUksQ0FBQTtJQUNKLHlEQUFLLENBQUE7SUFDTCx1REFBSSxDQUFBO0FBQ0wsQ0FBQyxFQUxpQixnQkFBZ0IsR0FBaEIsd0JBQWdCLEtBQWhCLHdCQUFnQixRQUtqQztBQWVELElBQWEsZ0JBQWdCLEdBQTdCLE1BQWEsZ0JBQWlCLFNBQVEsYUFBYSxDQUFDLFNBQVM7SUFJNUQsWUFBWSxPQUF5QixFQUFFLEdBQUcsSUFBSTtRQUU3QyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFFeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxPQUFPLENBQWdDLGNBQTZDLEVBQUUsR0FBUTtRQUU3RixhQUFhO1FBQ2IsY0FBYyxDQUFDLFdBQVcsR0FBRyxjQUFjLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQztRQUM5RCxhQUFhO1FBQ2IsY0FBYyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBRTFDOzs7Ozs7VUFNRTtRQUVGLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRW5DLDZDQUE2QztRQUU3QyxjQUFjLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FFcEM7UUFFSCwyREFBMkQ7UUFDM0QsdURBQXVEO1FBRXJELGdHQUFnRztRQUVsRyx3REFBd0Q7UUFDeEQsS0FBSztRQUNILDBHQUEwRztRQUM1RyxLQUFLO1FBRUgsK0pBQStKO1FBRS9KLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELFFBQVEsQ0FBQyxHQUFpQixFQUFFLGtCQUFvQyxFQUFFO1FBRWpFLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVTLGFBQWEsQ0FBSSxHQUFHLEVBQUUsY0FBbUMsRUFBRSxLQUFLO1FBRXpFLElBQUksQ0FBQyxHQUFHLEVBQ1I7WUFDQyxPQUFPLEVBQUUsQ0FBQztTQUNWO1FBRUQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsRUFDdEM7WUFDQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUM7U0FDaEI7UUFFRCxNQUFNLENBQUMsR0FBaUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFbEMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLG1DQUFtQyxDQUFDO2FBQ2hELElBQUksQ0FBQyxVQUFVLENBQUMsQ0FDakI7UUFFRCxLQUFLO2FBQ0gsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUk7WUFFdEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xCLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFMUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO1lBRTlDLGFBQWE7WUFDYixLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0IsYUFBYTtZQUNiLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FDRjtRQUVELElBQUksY0FBYyxDQUFDLFNBQVMsRUFDNUI7WUFDQywwQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDOUI7UUFFRCxJQUFJLEtBQUssR0FBYTtZQUNyQixDQUFDLENBQUMsVUFBVSxDQUFDO1lBQ2IsQ0FBQyxDQUFDLGVBQWUsQ0FBQztZQUNsQixDQUFDLENBQUMsVUFBVSxDQUFDO1NBQ2IsQ0FBQztRQUVGLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxvQkFBYSxDQUFDLENBQUMsRUFBRTtZQUNuQyxDQUFDO1lBQ0QsY0FBYztTQUNkLENBQUMsQ0FBQyxDQUFDO1FBRUosT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztZQUVqRCxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFUyxpQkFBaUIsQ0FBeUMsRUFDbkUsS0FBSyxFQUNMLE1BQU0sRUFDTixPQUFPLEdBS1AsRUFBRSxjQUFvQztRQUV0QyxJQUFJLGNBQWMsQ0FBQyxrQkFBa0IsRUFDckM7WUFDQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO2dCQUN0QixVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVU7Z0JBQzlCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVE7YUFDakMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQztTQUMxQztRQUVELE9BQU8sS0FBSyxDQUFDLGlCQUFpQixDQUFDO1lBQzlCLEtBQUs7WUFDTCxNQUFNO1lBQ04sT0FBTztTQUNQLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUVTLFdBQVcsQ0FBQyxjQUErQixFQUFFLE9BQU8sR0FBRyxFQUFFLEVBQUUsR0FBRyxJQUFJO1FBRTNFLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUc7WUFDckIsY0FBYyxFQUFFLGNBQWMsQ0FBQyxvQkFBWSxDQUFDLENBQUMsS0FBSyxDQUFDLGdCQUFnQixJQUFJLEVBQUU7WUFDekUsU0FBUyxFQUFFLGNBQWMsQ0FBQyxvQkFBWSxDQUFDLENBQUMsS0FBSyxDQUFDLHVCQUF1QixJQUFJLEVBQUU7U0FDM0UsQ0FBQztRQUVGLE9BQU8sS0FBSyxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUFFO1lBQ2pELE9BQU8sRUFBRTtnQkFDUixVQUFVLEVBQUU7b0JBQ1gsU0FBUyxFQUFFLElBQUk7aUJBQ2Y7YUFDRDtTQUNELEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNiLENBQUM7SUFFRCxRQUFRLENBQUMsR0FBaUIsRUFBRSxjQUErQjtRQUUxRCxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFDM0I7WUFDQyxhQUFhO1lBQ2IsR0FBRyxHQUFHLElBQUksZUFBRyxDQUFDLEdBQUcsQ0FBUSxDQUFDO1NBQzFCO1FBRUQsSUFBSSxHQUFHLENBQUMsUUFBUSxLQUFLLG1CQUFtQixJQUFJLEdBQUcsQ0FBQyxRQUFRLEtBQUsscUJBQXFCLEVBQ2xGO1lBQ0MsUUFBUSxjQUFjLENBQUMsWUFBWSxFQUNuQztnQkFDQztvQkFDQyxHQUFHLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQztvQkFDdEIsTUFBTTtnQkFDUCxLQUFLLElBQUksQ0FBQztnQkFDVjtvQkFDQyxHQUFHLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztvQkFDdkIsTUFBTTthQUNQO1NBQ0Q7UUFFRCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFFRCxPQUFPLENBQUksTUFBMkIsRUFBRSxJQUFlLEVBQUUsY0FBb0M7UUFFNUYsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFFdkQsSUFBSSxNQUFNLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQ3pDO1lBQ0MsYUFBYTtZQUNiLE9BQU8sSUFBSSxlQUFHLENBQUMsV0FBVyxTQUFTLDBDQUEwQyxNQUFNLENBQUMsU0FBUyxRQUFRLE1BQU0sQ0FBQyxVQUFVLG1DQUFtQyxDQUFDLENBQUM7U0FDM0o7UUFFRCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRWhFLGFBQWE7UUFDYixPQUFPLElBQUksZUFBRyxDQUFDLFVBQVUsU0FBUyxnQkFBZ0IsTUFBTSxDQUFDLFFBQVEsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFFRCxRQUFRLENBQUMsR0FBaUI7UUFFekIsSUFBSSxNQUFNLEdBQUc7WUFDWixHQUFHO1lBRUgsU0FBUyxFQUFFLElBQUk7WUFDZixRQUFRLEVBQUUsSUFBSTtZQUNkLFVBQVUsRUFBRSxJQUFJO1lBRWhCLFNBQVMsRUFBRSxJQUFJO1NBQ2YsQ0FBQztRQUVGLHVCQUF1QjtRQUV2QixJQUNBO1lBQ0MsYUFBYTtZQUNiLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxlQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUIsYUFBYTtZQUNiLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztTQUN0QjtRQUNELE9BQU8sQ0FBQyxFQUNSO1lBQ0MsYUFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1NBQ3pDO1FBRUQsSUFBSSxPQUFPLEdBQUcsSUFBSSxRQUFRLEVBQzFCO1lBQ0MsYUFBYTtZQUNiLE1BQU0sSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDekI7UUFFRCxJQUFJLENBQVMsQ0FBQztRQUNkLElBQUksQ0FBQyxDQUFDO1FBRU4sQ0FBQyxHQUFHLGdCQUFnQixDQUFDO1FBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQ25CO1lBQ0MsTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsT0FBTyxNQUFNLENBQUM7U0FDZDtRQUVELENBQUMsR0FBRyx5QkFBeUIsQ0FBQztRQUM5QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUNuQjtZQUNDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsQ0FBQyxHQUFHLG9DQUFvQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQ25CO1lBQ0MsTUFBTSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFeEIsT0FBTyxNQUFNLENBQUM7U0FDZDtRQUVELENBQUMsR0FBRyxxQ0FBcUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUNuQjtZQUNDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXpCLE9BQU8sTUFBTSxDQUFDO1NBQ2Q7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFFUyxhQUFhLENBQUksR0FBUSxFQUFFLGNBQW1DO1FBRXZFLElBQUksS0FBYyxDQUFDO1FBQ25CLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztRQUVsQixJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDO1FBRXhDLE9BQU8sS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDO2FBQzdDLElBQUksQ0FBQyxLQUFLLFdBQVcsR0FBRztZQUV4QixJQUFJLEdBQUcsSUFBSSxJQUFJO2dCQUFFLE9BQU8sR0FBRyxDQUFDO1lBRTVCLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7WUFFcEIsSUFBSSxDQUFDLEtBQUssSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLE1BQU0sRUFDdkQ7Z0JBQ0MsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFFaEIsMkNBQTJDO2dCQUUzQyxLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUViLElBQ0E7b0JBQ0MsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2hDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO2lCQUNuQztnQkFDRCxPQUFPLENBQUMsRUFDUjtpQkFFQztnQkFFRCxjQUFjLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMseURBQXlELEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ3BILGNBQWMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLDBCQUEwQixFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFM0gsdUVBQXVFO2dCQUV2RSxjQUFjLENBQUMsWUFBWSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO2dCQUMvQyxjQUFjLENBQUMsWUFBWSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUMsWUFBWSxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUM7Z0JBQzlGLGNBQWMsQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO2dCQUUxRCxPQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxjQUFjLENBQUM7cUJBQ2xELElBQUksQ0FBQyxVQUFVLEdBQUc7b0JBRWxCLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7b0JBQ3BCLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBRWhCLElBQUksQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsTUFBTSxFQUNsQzt3QkFDQyxhQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBRXpDLGlCQUFpQjtxQkFDakI7b0JBRUQsT0FBTyxHQUFHLENBQUM7Z0JBQ1osQ0FBQyxDQUFDLENBQUE7YUFDSDtZQUVELE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDO0lBRUQsS0FBSyxDQUFDLFFBQVEsQ0FBZ0MsR0FBRyxFQUNoRCxHQUFXLEVBQ1gsaUJBQWdELEVBQUU7UUFHbEQsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVoQixJQUFJLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLE1BQU0sRUFDbEU7WUFDQyxxQ0FBcUM7WUFFckMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFaEMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyx5REFBeUQsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUUxRywrQkFBK0I7WUFFL0IsT0FBTyxxQkFBTyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUU7WUFFOUQsa0RBQWtEO1lBQ2xELDhDQUE4QzthQUUzQixDQUFDLENBQUMsQ0FBQztTQUN2QjtRQUVELCtDQUErQztRQUUvQyxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFFUyxnQkFBZ0IsQ0FBSSxNQUFjLEVBQzNDLFFBQTZCLEVBQzdCLGNBQTZDO1FBRzdDLElBQUksWUFBWSxtQ0FDWixjQUFjLENBQUMsWUFBWSxLQUM5QixjQUFjLG9CQUNWLGNBQWMsQ0FBQyxZQUFZLENBQUMsY0FBYyxJQUU5QyxDQUFDO1FBRUYsWUFBWSxDQUFDLGNBQWMsR0FBRyxZQUFZLENBQUMsY0FBYyxJQUFJLEVBQUUsQ0FBQztRQUNoRSxZQUFZLENBQUMsY0FBYyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFFbEQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUV0QyxJQUFJLElBQUksR0FBRyxXQUFXLFFBQVEsQ0FBQyxTQUFTO1lBQ3ZDLENBQUMsQ0FBQyxTQUFTO1lBQ1gsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLG9CQUFvQixNQUFNLDJEQUEyRCxDQUFDO1FBRTNHLGtCQUFZLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTNDLE9BQU8scUJBQU8sQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUE7SUFDbkMsQ0FBQztJQUVTLGlCQUFpQixDQUE2QyxRQUE2QixFQUNwRyxjQUE2QyxFQUM3QyxTQUFZO1FBR1osSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFFekQsSUFBSSxRQUFRLEdBQUcsV0FBVyxTQUFTLHdDQUF3QyxRQUFRLENBQUMsUUFBUSxHQUFHLENBQUM7UUFFaEcsU0FBUyxHQUFHLFNBQVMsSUFBSyxFQUFRLENBQUM7UUFFbkMsa0JBQVksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFL0MsT0FBTyxxQkFBTyxDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsWUFBWSxDQUFDO2FBQ25ELElBQUksQ0FBQyxVQUFVLEdBQUc7WUFFbEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUVkLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQztpQkFDbEIsSUFBSSxDQUFDO2dCQUVMLGFBQWE7Z0JBQ2IsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVsQixJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUUzQyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQ25DO29CQUNDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7b0JBQ3hDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztvQkFFbEQsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7eUJBQ3hDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDO3lCQUNwQixJQUFJLEVBQUUsQ0FDUDtvQkFFRCxRQUFRO3lCQUNOLEtBQUssQ0FBQyxLQUFLLENBQUM7eUJBQ1osT0FBTyxDQUFDLFVBQVUsR0FBRzt3QkFFckIsSUFBSSxHQUFHLEVBQ1A7NEJBQ0MsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQzs0QkFFM0MsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7eUJBQ2pDO29CQUNGLENBQUMsQ0FBQyxDQUNGO2lCQUNEO3FCQUNJLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUMxRTtvQkFDQyxTQUFTLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO29CQUN4QyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7b0JBRWxELElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO3lCQUN4QyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQzt5QkFDcEIsSUFBSSxFQUFFLENBQ1A7b0JBRUQsSUFBSSxRQUFRLEVBQ1o7d0JBQ0MsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO3FCQUNuQztpQkFDRDtZQUNGLENBQUMsQ0FBQyxDQUNGO1lBRUQsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRWhDLElBQUksU0FBUyxDQUFDLE1BQU0sRUFDcEI7Z0JBQ0MsSUFBSSxFQUFFLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUVqQyxJQUFJLEVBQUUsRUFDTjtvQkFDQyxTQUFTLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO29CQUN4QyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7b0JBRWxELFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFFOUIsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUNwQjt3QkFDQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7cUJBQ3JDO2lCQUNEO2FBQ0Q7WUFFRCxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO1lBRXRDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFFMUMsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQyxDQUFDO2FBQ0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBRVYsa0JBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3RDLGFBQU8sQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUUxQyxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FDRDtJQUNILENBQUM7SUFFRCxhQUFhLENBQUksR0FBaUIsRUFBRSxjQUFtQztRQUV0RSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFVLEVBQUUsY0FBYyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUE7SUFDdEYsQ0FBQztJQUVELEtBQUssQ0FBQyxlQUFlLENBQWdDLEdBQWlCLEVBQ3JFLGlCQUFnRCxFQUFFO1FBR2xELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztRQUVsQixHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQVUsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUUzRCxrQkFBWSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUV0RCxPQUFPLHFCQUFPLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxZQUFZLENBQUM7YUFDOUMsSUFBSSxDQUFDLEtBQUssV0FBVyxHQUFXO1lBRWhDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQzthQUNELElBQUksQ0FBQyxLQUFLLFdBQVcsR0FBVztZQUVoQyxrQkFBWSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBRXBDLElBQUksV0FBVyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDL0MsSUFBSSxZQUFZLEdBQUcsb0JBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRztpQkFDbkMsQ0FBQyxDQUFDLHdDQUF3QyxDQUFDO2lCQUMzQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ04sSUFBSSxFQUFFLENBQUM7aUJBQ1AsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FDdEI7WUFFRCxJQUFJLFVBQVUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBRTNDLElBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFFakMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTNDLElBQUksV0FBVyxHQUFHLEVBQXlCLENBQUM7WUFFNUMsSUFBSSxhQUFnQyxDQUFDO1lBRXJDLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7WUFFMUUsSUFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDO1lBRXRCLElBQUksZ0JBQWdCLENBQUM7WUFFckI7Z0JBQ0MsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFFZCwrQkFBK0I7Z0JBRS9CLGtDQUFrQztnQkFFbEMsNEVBQTRFO2dCQUU1RSxJQUFJLENBQUMsQ0FBQztnQkFDTixJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLGlEQUFpRCxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUUvRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQ3hDO29CQUNDLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDeEI7cUJBQ0ksSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsRUFDM0M7b0JBQ0MsTUFBTSxJQUFJLEtBQUssQ0FBQyw4REFBOEQsQ0FBQyxDQUFBO2lCQUMvRTthQUNEO1lBRUQsS0FBSztpQkFDSCxJQUFJLENBQUMsVUFBVSxLQUFLO2dCQUVwQixhQUFhO2dCQUNiLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRXJCLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUMzQjtvQkFDQyxhQUFhLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRzt3QkFDakQsWUFBWSxFQUFFLFdBQVcsQ0FBQyxNQUFNO3dCQUNoQyxZQUFZLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDO3dCQUNqRCxZQUFZLEVBQUUsRUFBRTtxQkFDaEIsQ0FBQztpQkFDRjtxQkFFRDtvQkFDQyxJQUFJLENBQUMsYUFBYSxFQUNsQjt3QkFDQyxhQUFhLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRzs0QkFDakQsWUFBWSxFQUFFLFdBQVcsQ0FBQyxNQUFNOzRCQUNoQyxZQUFZLEVBQUUsTUFBTTs0QkFDcEIsWUFBWSxFQUFFLEVBQUU7eUJBQ2hCLENBQUM7cUJBQ0Y7b0JBRUQsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFFL0IsSUFBSSxZQUFZLENBQUM7b0JBQ2pCLElBQUksRUFBRSxDQUFDO29CQUNQLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBRWpDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE1BQU0sRUFDdEM7d0JBQ0MsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztxQkFDNUU7b0JBRUQsSUFBSSxDQUFDLEVBQUUsRUFDUDt3QkFDQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO3dCQUN0QixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7cUJBQ3pDO29CQUVELElBQUksRUFBRSxFQUNOO3dCQUNDLFlBQVksR0FBRyxjQUFNLENBQUMsRUFBRSxFQUFFLGtCQUFrQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7d0JBQ3RELFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7cUJBQ3ZDO29CQUVELElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBRTFCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRS9CLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUNwQjt3QkFFQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxNQUFNLEVBQ3JDOzRCQUNDOzsrQkFFRzs0QkFDSCxPQUFPO3lCQUNQO3dCQUVELGFBQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO3dCQUNsQyxhQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzt3QkFDakMsYUFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDZixhQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNsQixhQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNsQixhQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzt3QkFDNUIsYUFBYTt3QkFDYixhQUFPLENBQUMsR0FBRyxDQUFDLElBQUksZUFBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFFcEMsYUFBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBRTFCLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQTtxQkFDakI7eUJBRUQ7d0JBQ0MsSUFBSSxHQUFHOzRCQUNOLEdBQUcsRUFBRSxJQUFJOzRCQUNULFNBQVMsRUFBRSxnQkFBMEI7NEJBQ3JDLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBb0I7eUJBQzlCLENBQUM7d0JBRVQsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQzt3QkFFekQsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7cUJBQ2hCO29CQUVELGFBQWE7eUJBQ1gsWUFBWTt5QkFDWixJQUFJLENBQUM7d0JBQ0wsYUFBYSxFQUFFLGFBQWEsQ0FBQyxZQUFZLENBQUMsTUFBTTt3QkFDaEQsYUFBYSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQzt3QkFDakQsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO3dCQUMzQixXQUFXLEVBQUUsSUFBSTt3QkFDakIsZ0JBQWdCLEVBQUUsSUFBSTt3QkFDdEIsWUFBWTtxQkFDWixDQUFDLENBQ0Y7aUJBQ0Q7WUFDRixDQUFDLENBQUMsQ0FDRjtZQUVELFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUVwQixJQUFJLFVBQVUsR0FBRyxjQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFNUUsSUFBSSxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsY0FBYyxDQUFDO2lCQUM5RSxJQUFJLENBQUMsVUFBVSxHQUFHO2dCQUVsQixJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLHNDQUFzQyxRQUFRLENBQUMsUUFBUSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXBGLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUNkO29CQUNDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixRQUFRLENBQUMsUUFBUSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzlEO2dCQUVELElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUNkO29CQUNDLGFBQU8sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLFFBQVEsQ0FBQyxRQUFRLDhCQUE4QixDQUFDLENBQUM7b0JBRXhGOzt1QkFFRztvQkFDSCxJQUFJLEtBQUssR0FBRyxXQUFXO3lCQUNyQixPQUFPLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQzt5QkFDMUIsSUFBSSxFQUFFLENBQ1A7b0JBRUQsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQztpQkFDOUQ7Z0JBRUQsT0FBTyxHQUFHLENBQUM7WUFDWixDQUFDLENBQUM7aUJBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRztnQkFFbEIsdUJBQXVCO2dCQUV2QixJQUFJLElBQUksR0FBZ0IsRUFBRSxDQUFDO2dCQUUzQixJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLHNDQUFzQyxRQUFRLENBQUMsUUFBUSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXBGLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUNkO29CQUNDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixRQUFRLENBQUMsUUFBUSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzlEO2dCQUVELElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pELElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTNELElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUN2QjtvQkFDQyxXQUFXLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDdEQ7Z0JBRUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQ3hCO29CQUNDLFlBQVksR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN4RDtnQkFFRCxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFDZDtvQkFDQyxxQ0FBcUM7b0JBQ3JDLGFBQU8sQ0FBQyxJQUFJLENBQUMsNkJBQTZCLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBRXhFLE9BQU8sSUFBSSxDQUFDO2lCQUNaO2dCQUVELDJCQUEyQjtnQkFDM0IsNEJBQTRCO2dCQUU1QixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztnQkFFaEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUVyQixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLEtBQUssRUFDL0I7b0JBQ0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLElBQUksdUJBQWUsQ0FBQyxXQUFXLENBQUM7b0JBRXZELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUN4QztnQkFFRCxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztxQkFDN0IsSUFBSSxDQUFDLFVBQVUsS0FBSyxFQUFFLElBQUk7b0JBRTFCLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO3lCQUNqQixJQUFJLEVBQUU7eUJBQ04sSUFBSSxFQUFFO3lCQUNOLEtBQUssQ0FBQyxRQUFRLENBQUM7eUJBQ2YsR0FBRyxDQUFDLFVBQVUsQ0FBQzt3QkFFZixPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDakIsQ0FBQyxDQUFDO3lCQUNELE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQ2pCO29CQUVELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0MsQ0FBQyxDQUFDLENBQ0Y7Z0JBRUQsV0FBVztxQkFDVCxJQUFJLENBQUMsaUNBQWlDLENBQUM7cUJBQ3ZDLElBQUksQ0FBQyxVQUFVLEtBQUssRUFBRSxJQUFJO29CQUUxQixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQzt5QkFDakIsSUFBSSxFQUFFO3lCQUNOLElBQUksRUFBRTt5QkFDTixPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUMxQjtvQkFFRCxJQUFJLENBQUMsRUFDTDt3QkFDQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ3hCO2dCQUNGLENBQUMsQ0FBQyxDQUNGO2dCQUVELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBRTVCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssR0FBRyxDQUFDLEdBQUcsb0JBQW9CLENBQUMsQ0FBQztnQkFFckUsb0JBQW9CO2dCQUVwQixPQUFPLElBQUksQ0FBQztZQUNiLENBQUMsQ0FBQztpQkFDRCxLQUFLLENBQUMsVUFBVSxDQUFDO2dCQUVqQixrQkFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQ3RDLGFBQU8sQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQztnQkFFMUMsT0FBTyxFQUFFLENBQUM7WUFDWCxDQUFDLENBQUMsQ0FDRjtZQUVELENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTlELElBQUksa0JBQTBCLENBQUM7WUFDL0IsSUFBSSx1QkFBK0IsQ0FBQztZQUVwQztnQkFDQyxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLCtCQUErQixDQUFDLENBQUM7Z0JBRWhELElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUU7cUJBQ2YsT0FBTyxDQUFDLHNCQUFzQixFQUFFLEVBQUUsQ0FBQyxDQUNwQztnQkFFRCxJQUFJLENBQUMsRUFDTDtvQkFDQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7b0JBRXZCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNsQixJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFFL0IsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUM1Qjt3QkFDQyx1QkFBdUIsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDO3dCQUVwQyxhQUFhO3dCQUNiLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7d0JBRXRCLElBQUksS0FBSyxHQUFHLGtCQUFrQjs2QkFDNUIsT0FBTyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUM7NkJBQzlCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQ3JCO3dCQUVELGFBQWE7d0JBQ2IsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBQzlDO2lCQUNEO2FBQ0Q7WUFFRCxrQkFBWSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBRXJDLE9BQU8sZ0NBRUgsQ0FBQyxLQUVKLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUNaLFFBQVE7Z0JBRVIsV0FBVztnQkFDWCxZQUFZO2dCQUVaLFVBQVU7Z0JBQ1YsVUFBVTtnQkFDVixlQUFlO2dCQUVmLGtCQUFrQjtnQkFDbEIsdUJBQXVCO2dCQUV2QixnQkFBZ0I7Z0JBRWhCLFdBQVcsRUFFWCxTQUFTLEVBQUUsY0FBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBRTNCLElBQUksRUFBRSxFQUFjLEdBQ1YsQ0FBQztRQUNiLENBQUMsQ0FBQyxDQUNEO0lBQ0gsQ0FBQztDQUVELENBQUE7QUF0MUJ1QixzQkFBSyxHQUFHLFNBQVMsQ0FBQztBQUY3QixnQkFBZ0I7SUFENUIsd0JBQWdCLEVBQWdEOztHQUNwRCxnQkFBZ0IsQ0F3MUI1QjtBQXgxQlksNENBQWdCO0FBMDFCN0Isa0JBQWUsZ0JBQWdCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSB0eXBlcz1cImpxdWVyeVwiIC8+XG5pbXBvcnQgeyBFbnVtTm92ZWxTdGF0dXMgfSBmcm9tICdub2RlLW5vdmVsLWluZm8vbGliL2NvbnN0JztcbmltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uLy4uL2ZldGNoJztcblxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IHRyaW1GaWxlbmFtZSB9IGZyb20gJ2ZzLWljb252L3V0aWwnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICd1cGF0aDInO1xuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCB7IExhenlDb29raWUsIExhenlDb29raWVKYXIgfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZ2V0RmlsZVBhdGgsIGdldFZvbHVtZVBhdGggfSBmcm9tICcuLi9mcyc7XG5cbmltcG9ydCBOb3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgZGVmYXVsdEpTRE9NT3B0aW9ucywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkLCBibHVlYmlyZERlY29yYXRvciB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IG1vbWVudCB9IGZyb20gJy4uL2luZGV4JztcblxuaW1wb3J0IE5vdmVsU2l0ZURlbW8gPSByZXF1aXJlKCcuLi9kZW1vL2Jhc2UnKTtcbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG5cbmltcG9ydCB7IGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZyB9IGZyb20gJy4uLy4uL3V0aWwvbG9nJztcbmltcG9ydCB7IF9rZWVwSW1hZ2VJbkNvbnRleHQsIGtlZXBGb3JtYXRUYWcgfSBmcm9tICcuLi8uLi91dGlsL2h0bWwnO1xuaW1wb3J0IHsgaGFzaFN1bSB9IGZyb20gJy4uLy4uL3V0aWwvaGFzaCc7XG5cbmV4cG9ydCB0eXBlIElOb3ZlbCA9IE5vdmVsU2l0ZURlbW8uSU5vdmVsICYge1xuXHRub3ZlbF9zeW9zZXR1X2lkOiBzdHJpbmcsXG59O1xuXG5leHBvcnQgY29uc3QgZW51bSBFbnVtUHJvdG9jb2xNb2RlXG57XG5cdE5PTkUsXG5cdEhUVFBTLFxuXHRIVFRQLFxufVxuXG5leHBvcnQgdHlwZSBJT3B0aW9uc1BsdXMgPSB7XG5cdC8qKlxuXHQgKiDkuI3kvb/nlKjlsI/oqqrlrrbmj5DkvpvnmoQgdHh0IOS4i+i8iemAo+e1kFxuXHQgKi9cblx0ZGlzYWJsZVR4dGRvd25sb2FkPzogYm9vbGVhbixcblxuXHRwcm90b2NvbE1vZGU/OiBFbnVtUHJvdG9jb2xNb2RlIHwgYm9vbGVhbixcbn1cblxuZXhwb3J0IHR5cGUgSURvd25sb2FkT3B0aW9ucyA9IE5vdmVsU2l0ZURlbW8uSURvd25sb2FkT3B0aW9ucyAmIElPcHRpb25zUGx1c1xuZXhwb3J0IHR5cGUgSU9wdGlvbnNSdW50aW1lID0gTm92ZWxTaXRlRGVtby5JT3B0aW9uc1J1bnRpbWUgJiBJRG93bmxvYWRPcHRpb25zICYgSU9wdGlvbnNQbHVzXG5cbkBzdGF0aWNJbXBsZW1lbnRzPE5vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZVN5b3NldHU+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlU3lvc2V0dSBleHRlbmRzIE5vdmVsU2l0ZURlbW8uTm92ZWxTaXRlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVkgPSAnc3lvc2V0dSc7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogSURvd25sb2FkT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdHN1cGVyKG9wdGlvbnMsIC4uLmFyZ3YpO1xuXG5cdFx0dGhpcy5vcHRpb25zSW5pdC5yZXRyeURlbGF5ID0gdGhpcy5vcHRpb25zSW5pdC5yZXRyeURlbGF5IHx8IDI1MDAwO1xuXHR9XG5cblx0c2Vzc2lvbjxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+LCB1cmw6IFVSTClcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSA9IG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhIHx8IHt9O1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YS5vdmVyMTggPSAneWVzJztcblxuXHRcdC8qXG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEuc2FzaWVubyA9IDA7XG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEubGluZWhlaWdodCA9IDA7XG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEuZm9udHNpemUgPSAwO1xuXHRcdG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhLm5vdmVsbGF5b3V0ID0gMDtcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YS5maXhfbWVudV9iYXIgPSAwO1xuXHRcdCovXG5cblx0XHRzdXBlci5zZXNzaW9uKG9wdGlvbnNSdW50aW1lLCB1cmwpO1xuXG5cdFx0Ly9sZXQgdXJsID0gb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS51cmw7XG5cblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyXG5cdFx0Ly8uc2V0Q29va2llU3luYygnb3ZlcjE4PXllczsgRG9tYWluPS5zeW9zZXR1LmNvbTsgUGF0aD0vOyBob3N0T25seT1mYWxzZScsIHVybC5ocmVmKVxuXHRcdDtcblxuLy9cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJ1blNjcmlwdHMgPSAnZGFuZ2Vyb3VzbHknO1xuLy9cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnZpcnR1YWxDb25zb2xlID0gZmFsc2U7XG5cblx0XHQvL29wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyB8fCB7fTtcblxuLy9cdFx0aWYgKCFvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMuamFyKVxuLy9cdFx0e1xuXHRcdC8vb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zLmphciA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIud3JhcEZvclJlcXVlc3QoKTtcbi8vXHRcdH1cblxuXHRcdC8vb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnVzZXJBZ2VudCA9ICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNzEuMC4zNTc4Ljk4IFNhZmFyaS81MzcuMzYnO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRkb3dubG9hZCh1cmw6IHN0cmluZyB8IFVSTCwgZG93bmxvYWRPcHRpb25zOiBJRG93bmxvYWRPcHRpb25zID0ge30pXG5cdHtcblx0XHRyZXR1cm4gc3VwZXIuZG93bmxvYWQodXJsLCBkb3dubG9hZE9wdGlvbnMpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9wYXJzZUNoYXB0ZXI8VD4ocmV0LCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGUpOiBzdHJpbmdcblx0e1xuXHRcdGlmICghcmV0KVxuXHRcdHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLmRpc2FibGVUeHRkb3dubG9hZClcblx0XHR7XG5cdFx0XHRyZXR1cm4gcmV0LmJvZHk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgJDogSlF1ZXJ5U3RhdGljID0gcmV0LmRvbS4kO1xuXG5cdFx0bGV0IF9pbWdzID0gJCgnI25vdmVsX3AsICNub3ZlbF9ob25idW4sICNub3ZlbF9hJylcblx0XHRcdC5maW5kKCdpbWdbc3JjXScpXG5cdFx0O1xuXG5cdFx0X2ltZ3Ncblx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpLCBlbGVtKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgaW1nID0gJChlbGVtKTtcblx0XHRcdFx0bGV0IHNyYyA9IGltZy5wcm9wKCdzcmMnKTtcblxuXHRcdFx0XHRjYWNoZS5jaGFwdGVyLmltZ3MgPSBjYWNoZS5jaGFwdGVyLmltZ3MgfHwgW107XG5cblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRjYWNoZS5jaGFwdGVyLmltZ3MucHVzaChzcmMpO1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGNhY2hlLm5vdmVsLmltZ3MucHVzaChzcmMpO1xuXHRcdFx0fSlcblx0XHQ7XG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUua2VlcEltYWdlKVxuXHRcdHtcblx0XHRcdF9rZWVwSW1hZ2VJbkNvbnRleHQoX2ltZ3MsICQpO1xuXHRcdH1cblxuXHRcdGxldCBib2R5czogSlF1ZXJ5W10gPSBbXG5cdFx0XHQkKCcjbm92ZWxfcCcpLFxuXHRcdFx0JCgnI25vdmVsX2hvbmJ1bicpLFxuXHRcdFx0JCgnI25vdmVsX2EnKSxcblx0XHRdO1xuXG5cdFx0Ym9keXMuZm9yRWFjaCh0ID0+IGtlZXBGb3JtYXRUYWcodCwge1xuXHRcdFx0JCxcblx0XHRcdG9wdGlvbnNSdW50aW1lLFxuXHRcdH0pKTtcblxuXHRcdHJldHVybiBib2R5cy5tYXAodiA9PiB2LnRleHQoKSkuZmlsdGVyKGZ1bmN0aW9uICh2KVxuXHRcdHtcblx0XHRcdHJldHVybiB2O1xuXHRcdH0pLmpvaW4oJ1xcblxcbj09PT09PT09PT09PT09PT09PVxcblxcbicpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9jcmVhdGVDaGFwdGVyVXJsPFQgPSBJT3B0aW9uc1J1bnRpbWUgJiBJRG93bmxvYWRPcHRpb25zPih7XG5cdFx0bm92ZWwsXG5cdFx0dm9sdW1lLFxuXHRcdGNoYXB0ZXIsXG5cdH06IHtcblx0XHRub3ZlbDogTm92ZWxTaXRlLklOb3ZlbCxcblx0XHR2b2x1bWU6IE5vdmVsU2l0ZS5JVm9sdW1lLFxuXHRcdGNoYXB0ZXI6IE5vdmVsU2l0ZS5JQ2hhcHRlcixcblx0fSwgb3B0aW9uc1J1bnRpbWU/OiBUICYgSU9wdGlvbnNSdW50aW1lKTogVVJMXG5cdHtcblx0XHRpZiAob3B0aW9uc1J1bnRpbWUuZGlzYWJsZVR4dGRvd25sb2FkKVxuXHRcdHtcblx0XHRcdGxldCB1cmwgPSB0aGlzLm1ha2VVcmwoe1xuXHRcdFx0XHRjaGFwdGVyX2lkOiBjaGFwdGVyLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdG5vdmVsX2lkOiBub3ZlbC51cmxfZGF0YS5ub3ZlbF9pZCxcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gdGhpcy5faGFja1VSTCh1cmwsIG9wdGlvbnNSdW50aW1lKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gc3VwZXIuX2NyZWF0ZUNoYXB0ZXJVcmwoe1xuXHRcdFx0bm92ZWwsXG5cdFx0XHR2b2x1bWUsXG5cdFx0XHRjaGFwdGVyLFxuXHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBvcHRpb25zID0ge30sIC4uLm9wdHMpXG5cdHtcblx0XHRvcHRpb25zW3RoaXMuSURLRVldID0ge1xuXHRcdFx0dHh0ZG93bmxvYWRfaWQ6IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwubm92ZWxfc3lvc2V0dV9pZCB8fCAnJyxcblx0XHRcdHNlcmllc19pZDogb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbC5ub3ZlbF9zeW9zZXR1X3Nlcmllc19pZCB8fCAnJyxcblx0XHR9O1xuXG5cdFx0cmV0dXJuIHN1cGVyLl9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lLCBvcHRpb25zLCB7XG5cdFx0XHRvcHRpb25zOiB7XG5cdFx0XHRcdHRleHRsYXlvdXQ6IHtcblx0XHRcdFx0XHRhbGxvd19sZjI6IHRydWUsXG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdH0sIC4uLm9wdHMpO1xuXHR9XG5cblx0X2hhY2tVUkwob2JqOiBVUkwgfCBzdHJpbmcsIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUpXG5cdHtcblx0XHRpZiAodHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpXG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0b2JqID0gbmV3IFVSTChvYmopIGFzIFVSTDtcblx0XHR9XG5cblx0XHRpZiAob2JqLmhvc3RuYW1lID09PSAnbmNvZGUuc3lvc2V0dS5jb20nIHx8IG9iai5ob3N0bmFtZSA9PT0gJ25vdmVsMTguc3lvc2V0dS5jb20nKVxuXHRcdHtcblx0XHRcdHN3aXRjaCAob3B0aW9uc1J1bnRpbWUucHJvdG9jb2xNb2RlKVxuXHRcdFx0e1xuXHRcdFx0XHRjYXNlIEVudW1Qcm90b2NvbE1vZGUuSFRUUDpcblx0XHRcdFx0XHRvYmoucHJvdG9jb2wgPSAnaHR0cCc7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgdHJ1ZTpcblx0XHRcdFx0Y2FzZSBFbnVtUHJvdG9jb2xNb2RlLkhUVFBTOlxuXHRcdFx0XHRcdG9iai5wcm90b2NvbCA9ICdodHRwcyc7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9ialxuXHR9XG5cblx0bWFrZVVybDxUPih1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2wgPzogYm9vbGVhbiwgb3B0aW9uc1J1bnRpbWU/OiBUICYgSU9wdGlvbnNSdW50aW1lKTogVVJMXG5cdHtcblx0XHRsZXQgc3ViZG9tYWluID0gdXJsb2JqLm5vdmVsX3IxOCA/ICdub3ZlbDE4JyA6ICduY29kZSc7XG5cblx0XHRpZiAodXJsb2JqLm5vdmVsX3BpZCAmJiB1cmxvYmouY2hhcHRlcl9pZClcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRyZXR1cm4gbmV3IFVSTChgaHR0cHM6Ly8ke3N1YmRvbWFpbn0uc3lvc2V0dS5jb20vdHh0ZG93bmxvYWQvZGxzdGFydC9uY29kZS8ke3VybG9iai5ub3ZlbF9waWR9Lz9ubz0ke3VybG9iai5jaGFwdGVyX2lkfSZoYW5rYWt1PTAmY29kZT11dGYtOCZrYWlneW89Y3JsZmApO1xuXHRcdH1cblxuXHRcdGxldCBwYWQgPSAoIWJvb2wgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpID8gdXJsb2JqLmNoYXB0ZXJfaWQgOiAnJztcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gbmV3IFVSTChgaHR0cDovLyR7c3ViZG9tYWlufS5zeW9zZXR1LmNvbS8ke3VybG9iai5ub3ZlbF9pZH0vJHtwYWR9YCk7XG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IHN0cmluZyB8IFVSTCk6IE5vdmVsU2l0ZS5JUGFyc2VVcmxcblx0e1xuXHRcdGxldCB1cmxvYmogPSB7XG5cdFx0XHR1cmwsXG5cblx0XHRcdG5vdmVsX3BpZDogbnVsbCxcblx0XHRcdG5vdmVsX2lkOiBudWxsLFxuXHRcdFx0Y2hhcHRlcl9pZDogbnVsbCxcblxuXHRcdFx0bm92ZWxfcjE4OiBudWxsLFxuXHRcdH07XG5cblx0XHQvL3VybCA9IHVybC50b1N0cmluZygpO1xuXG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0dXJsb2JqLnVybCA9IG5ldyBVUkwodXJsKTtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHVybCA9IHVybG9iai51cmwuaHJlZjtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS53YXJuKGUudG9TdHJpbmcoKSArIGAgXCIke3VybH1cImApO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgdXJsICE9ICdzdHJpbmcnKVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IodXJsKTtcblx0XHR9XG5cblx0XHRsZXQgcjogUmVnRXhwO1xuXHRcdGxldCBtO1xuXG5cdFx0ciA9IC9eKG5bXFx3XXs1LDZ9KSQvO1xuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0ciA9IC8obm92ZWwxOClcXC5zeW9zZXR1XFwuY29tLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9yMTggPSBtWzFdO1xuXHRcdH1cblxuXHRcdHIgPSAvdHh0ZG93bmxvYWRcXC9kbHN0YXJ0XFwvbmNvZGVcXC8oXFxkKykvO1xuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX3BpZCA9IG1bMV07XG5cblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0ciA9IC9cXC5zeW9zZXR1XFwuY29tXFwvKG5cXHcrKSg/OlxcLz8oXFxkKykpPy87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdFx0dXJsb2JqLmNoYXB0ZXJfaWQgPSBtWzJdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHJldHVybiB1cmxvYmo7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2ZldGNoQ2hhcHRlcjxUPih1cmw6IFVSTCwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUpXG5cdHtcblx0XHRsZXQgdHJ5ZWQ6IGJvb2xlYW47XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgX2ZldGNoQ2hhcHRlciA9IHN1cGVyLl9mZXRjaENoYXB0ZXI7XG5cblx0XHRyZXR1cm4gc3VwZXIuX2ZldGNoQ2hhcHRlcih1cmwsIG9wdGlvbnNSdW50aW1lKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKHJldClcblx0XHRcdHtcblx0XHRcdFx0aWYgKHJldCA9PSBudWxsKSByZXR1cm4gcmV0O1xuXG5cdFx0XHRcdGNvbnN0IGRvbSA9IHJldC5kb207XG5cblx0XHRcdFx0aWYgKCF0cnllZCAmJiBkb20gJiYgZG9tLiQoJyNtb2RhbCAueWVzICN5ZXMxOCcpLmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5lcnJvcihg54Sh5rOV5oiQ5Yqf6K6A5Y+WIFIxOCDpoIHpnaJgLCB1cmwuaHJlZik7XG5cblx0XHRcdFx0XHR0cnllZCA9IHRydWU7XG5cblx0XHRcdFx0XHR0cnlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQkKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5jbGljaygpO1xuXHRcdFx0XHRcdFx0JCgnI21vZGFsIC55ZXMgI3llczE4JylbMF0uY2xpY2soKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphci5zZXRDb29raWVTeW5jKCdvdmVyMTg9eWVzOyBEb21haW49LnN5b3NldHUuY29tOyBQYXRoPS87IGhvc3RPbmx5PWZhbHNlJywgdXJsKTtcblx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyLnNldENvb2tpZVN5bmMoYG92ZXIxOD15ZXM7IERvbWFpbj0ke2RvbS51cmwuaG9zdH07IFBhdGg9LzsgaG9zdE9ubHk9ZmFsc2VgLCBkb20udXJsKTtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5kZWJ1ZyhvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyLmdldEFsbENvb2tpZXMoKSk7XG5cblx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVmZXJyZXIgPSBkb20udXJsO1xuXHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyB8fCB7fTtcblx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMuZm9ybSA9IGRvbS51cmw7XG5cblx0XHRcdFx0XHRyZXR1cm4gX2ZldGNoQ2hhcHRlci5jYWxsKHNlbGYsIHVybCwgb3B0aW9uc1J1bnRpbWUpXG5cdFx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAocmV0KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjb25zdCBkb20gPSByZXQuZG9tO1xuXHRcdFx0XHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCQoJyNtb2RhbCAueWVzICN5ZXMxOCcpLmxlbmd0aClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoYOeEoeazleaIkOWKn+iugOWPliBSMTgg6aCB6Z2iYCwgdXJsLmhyZWYpO1xuXG5cdFx0XHRcdFx0XHRcdFx0Ly9wcm9jZXNzLmV4aXQoKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXQ7XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHJldDtcblx0XHRcdH0pXG5cdH1cblxuXHRhc3luYyBfbm92ZWwxODxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4odXJsLFxuXHRcdGRvbTogSUpTRE9NLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9LFxuXHQpOiBQcm9taXNlPElKU0RPTT5cblx0e1xuXHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdGlmICghJCgnI25vdmVsX2NvbnRlbnRzJykubGVuZ3RoIHx8ICQoJyNtb2RhbCAueWVzICN5ZXMxOCcpLmxlbmd0aClcblx0XHR7XG5cdFx0XHQvL2NvbnNvbGUubG9nKGRvbS51cmwsIGRvbS5fb3B0aW9ucyk7XG5cblx0XHRcdCQoJyNtb2RhbCAueWVzICN5ZXMxOCcpLmNsaWNrKCk7XG5cblx0XHRcdGRvbS5fb3B0aW9ucy5yZXF1ZXN0T3B0aW9ucy5qYXIuc2V0Q29va2llKCdvdmVyMTg9eWVzOyBEb21haW49LnN5b3NldHUuY29tOyBQYXRoPS87IGhvc3RPbmx5PWZhbHNlJywgdXJsKTtcblxuXHRcdFx0Ly9jb25zb2xlLmxvZyhkb20uc2VyaWFsaXplKCkpO1xuXG5cdFx0XHRyZXR1cm4gZnJvbVVSTCh1cmwsIE9iamVjdC5hc3NpZ24ob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLCB7XG5cblx0XHRcdFx0Ly9jb29raWVKYXI6IGRvbS5fb3B0aW9ucy5yZXF1ZXN0T3B0aW9ucy5qYXIuX2phcixcblx0XHRcdFx0Ly9yZXF1ZXN0T3B0aW9uczogZG9tLl9vcHRpb25zLnJlcXVlc3RPcHRpb25zLFxuXG5cdFx0XHR9IGFzIElGcm9tVXJsT3B0aW9ucykpO1xuXHRcdH1cblxuXHRcdC8vY29uc29sZS5sb2coZG9tLl9vcHRpb25zLnJlcXVlc3RPcHRpb25zLmphcik7XG5cblx0XHRyZXR1cm4gZG9tO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9nZXRFeHRyYUluZm9VUkw8VD4oc2VhcmNoOiBzdHJpbmcsXG5cdFx0dXJsX2RhdGE6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+LFxuXHQpXG5cdHtcblx0XHRsZXQgb3B0aW9uc0pTRE9NID0ge1xuXHRcdFx0Li4ub3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLFxuXHRcdFx0cmVxdWVzdE9wdGlvbnM6IHtcblx0XHRcdFx0Li4ub3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zLFxuXHRcdFx0fSxcblx0XHR9O1xuXG5cdFx0b3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zID0gb3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zIHx8IHt9O1xuXHRcdG9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucy5mb2xsb3dSZWRpcmVjdCA9IHRydWU7XG5cblx0XHRsZXQgX2RvbWFpbiA9IDEgPyAnbmFyLmpwJyA6ICdkaXAuanAnO1xuXG5cdFx0bGV0IF91cmwgPSBgaHR0cHM6Ly8ke3VybF9kYXRhLm5vdmVsX3IxOFxuXHRcdFx0PyAnbmFyb3UxOCdcblx0XHRcdDogJ25hcm91J30uJHtfZG9tYWlufS9zZWFyY2gucGhwP3RleHQ9JHtzZWFyY2h9Jm5vdmVsPWFsbCZnZW5yZT1hbGwmbmV3X2dlbnJlPWFsbCZsZW5ndGg9MCZkb3duPTAmdXA9MTAwYDtcblxuXHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1Zyhg6Kmm5ZyW5Y+W5b6X5bCP6Kqq55u46Zec6LOH6KiKICgxKWAsIF91cmwpO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwoX3VybCwgb3B0aW9uc0pTRE9NKVxuXHR9XG5cblx0cHJvdGVjdGVkIF9nZXRFeHRyYUluZm9VUkwyPFQsIE0gZXh0ZW5kcyBQYXJ0aWFsPElOb3ZlbCAmIElNZGNvbmZNZXRhPj4odXJsX2RhdGE6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+LFxuXHRcdGRhdGFfbWV0YTogTSxcblx0KTogUHJvbWlzZUJsdWViaXJkPE0+XG5cdHtcblx0XHRsZXQgc3ViZG9tYWluID0gdXJsX2RhdGEubm92ZWxfcjE4ID8gJ25vdmVsMTgnIDogJ25jb2RlJztcblxuXHRcdGxldCBpbmZvX3VybCA9IGBodHRwczovLyR7c3ViZG9tYWlufS5zeW9zZXR1LmNvbS9ub3ZlbHZpZXcvaW5mb3RvcC9uY29kZS8ke3VybF9kYXRhLm5vdmVsX2lkfS9gO1xuXG5cdFx0ZGF0YV9tZXRhID0gZGF0YV9tZXRhIHx8ICh7fSBhcyBNKTtcblxuXHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1Zyhg6Kmm5ZyW5Y+W5b6X5bCP6Kqq55u46Zec6LOH6KiKICgyKWAsIGluZm9fdXJsKTtcblxuXHRcdHJldHVybiBmcm9tVVJMKGluZm9fdXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdCQoJyNub3ZlbHRhYmxlMSB0cicpXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRsZXQgX3RyID0gJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0bGV0IF90aF90ZXh0ID0gU3RyaW5nKCQoJ3RoJywgX3RyKS50ZXh0KCkpO1xuXG5cdFx0XHRcdFx0XHRpZiAoX3RoX3RleHQuaW5kZXhPZign44Kt44O844Ov44O844OJJykgIT0gLTEpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbCA9IGRhdGFfbWV0YS5ub3ZlbCB8fCB7fTtcblx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MgPSBkYXRhX21ldGEubm92ZWwudGFncyB8fCBbXTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgX3RkX3RleHQgPSBTdHJpbmcoJCgndGQnLCBfdHIpLnRleHQoKSlcblx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvXFxzKy9nLCAnICcpXG5cdFx0XHRcdFx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0X3RkX3RleHRcblx0XHRcdFx0XHRcdFx0XHQuc3BsaXQoL1xccysvKVxuXHRcdFx0XHRcdFx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uICh0YWcpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHRhZylcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0IF90ID0gdGFnLnNwbGl0KCcvJykubWFwKHMgPT4gcy50cmltKCkpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzLnB1c2goLi4uX3QpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2UgaWYgKF90aF90ZXh0LmluZGV4T2YoJ+OCuOODo+ODs+ODqycpICE9IC0xIHx8IF90aF90ZXh0LmluZGV4T2YoJ+aOsui8ieOCteOCpOODiCcpICE9IC0xKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwgPSBkYXRhX21ldGEubm92ZWwgfHwge307XG5cdFx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzID0gZGF0YV9tZXRhLm5vdmVsLnRhZ3MgfHwgW107XG5cblx0XHRcdFx0XHRcdFx0bGV0IF90ZF90ZXh0ID0gU3RyaW5nKCQoJ3RkJywgX3RyKS50ZXh0KCkpXG5cdFx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL1xccysvZywgJyAnKVxuXHRcdFx0XHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdGlmIChfdGRfdGV4dClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzLnB1c2goX3RkX3RleHQpXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IGFnZV9saW1pdCA9ICQoJyNhZ2VfbGltaXQnKTtcblxuXHRcdFx0XHRpZiAoYWdlX2xpbWl0Lmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBfdCA9IGFnZV9saW1pdC50ZXh0KCkudHJpbSgpO1xuXG5cdFx0XHRcdFx0aWYgKF90KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbCA9IGRhdGFfbWV0YS5ub3ZlbCB8fCB7fTtcblx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzID0gZGF0YV9tZXRhLm5vdmVsLnRhZ3MgfHwgW107XG5cblx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzLnB1c2goX3QpO1xuXG5cdFx0XHRcdFx0XHRpZiAoX3QubWF0Y2goL3IxOC9pKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MucHVzaChgbm92ZWwxOGApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRhdGFfbWV0YS5saW5rID0gZGF0YV9tZXRhLmxpbmsgfHwgW107XG5cblx0XHRcdFx0ZGF0YV9tZXRhLmxpbmsucHVzaChgW+Wwj+iqrOaDheWgsV0oJHtkb20udXJsfSlgKTtcblxuXHRcdFx0XHRyZXR1cm4gZGF0YV9tZXRhO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChlID0+XG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5ncmF5LmVycm9yKGUudG9TdHJpbmcoKSk7XG5cdFx0XHRcdGNvbnNvbGUud2Fybihg5LiL6LyJ5bCP6Kqq6LOH6KiK5pmC55m855Sf6Yyv6KqkICgyKe+8jOatpOaPkOmGkuioiuaBr+WPr+S7peeEoeimlmApO1xuXG5cdFx0XHRcdHJldHVybiBkYXRhX21ldGE7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0Y3JlYXRlTWFpblVybDxUPih1cmw6IHN0cmluZyB8IFVSTCwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5faGFja1VSTChzdXBlci5jcmVhdGVNYWluVXJsKHVybCBhcyBhbnksIG9wdGlvbnNSdW50aW1lKSwgb3B0aW9uc1J1bnRpbWUpXG5cdH1cblxuXHRhc3luYyBnZXRfdm9sdW1lX2xpc3Q8VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KHVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9LFxuXHQpOiBQcm9taXNlPElOb3ZlbD5cblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0dXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKHVybCBhcyBhbnksIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhgZ2V0X3ZvbHVtZV9saXN0YCwgdXJsLnRvU3RyaW5nKCkpO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBzZWxmLl9ub3ZlbDE4PFQ+KHVybCwgZG9tLCBvcHRpb25zUnVudGltZSk7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zb2xlRGVidWcuaW5mbyhg6ZaL5aeL6JmV55CG5bCP6Kqq6LOH6KiK5Lul5Y+K56ug56+A5YiX6KGoYCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gZG9tLiQoJy5ub3ZlbF90aXRsZScpLnRleHQoKTtcblx0XHRcdFx0bGV0IG5vdmVsX2F1dGhvciA9IG5vdmVsVGV4dC50cmltKGRvbVxuXHRcdFx0XHRcdC4kKCcubm92ZWxfd3JpdGVybmFtZSBhLCAubm92ZWxfd3JpdGVybmFtZScpXG5cdFx0XHRcdFx0LmVxKC0xKVxuXHRcdFx0XHRcdC50ZXh0KCkpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL14uKuS9nOiAhe+8mi8sICcnKVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2Rlc2MgPSBkb20uJCgnI25vdmVsX2V4JykudGV4dCgpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9wdWJsaXNoZXIgPSBzZWxmLklES0VZO1xuXG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwoZG9tLnVybC5ocmVmKTtcblxuXHRcdFx0XHRsZXQgdm9sdW1lX2xpc3QgPSBbXSBhcyBOb3ZlbFNpdGUuSVZvbHVtZVtdO1xuXG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBOb3ZlbFNpdGUuSVZvbHVtZTtcblxuXHRcdFx0XHRsZXQgdGFibGUgPSBkb20uJCgnLmluZGV4X2JveCcpLmZpbmQoJz4gLmNoYXB0ZXJfdGl0bGUsIC5ub3ZlbF9zdWJsaXN0MicpO1xuXG5cdFx0XHRcdGxldCBfY2FjaGVfZGF0ZXMgPSBbXTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfc3lvc2V0dV9pZDtcblxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coZG9tLnNlcmlhbGl6ZSgpKTtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coJCgnI25vdmVsX2Zvb3RlcicpKTtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coJCgnI25vdmVsX2Zvb3RlcicpLmZpbmQoJy51bmRlcm5hdmkgYVtocmVmKj1cInR4dGRvd25sb2FkXCJdJykpO1xuXG5cdFx0XHRcdFx0bGV0IG07XG5cdFx0XHRcdFx0bGV0IGR0ID0gZG9tLiQoJyNub3ZlbF9mb290ZXIgLnVuZGVybmF2aSBhW2hyZWYqPVwidHh0ZG93bmxvYWRcIl0nKS5wcm9wKCdocmVmJyk7XG5cblx0XHRcdFx0XHRpZiAoZHQgJiYgKG0gPSBkdC5tYXRjaCgvbmNvZGVcXC8oXFxkKykvKSkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bm92ZWxfc3lvc2V0dV9pZCA9IG1bMV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKCFvcHRpb25zUnVudGltZS5kaXNhYmxlVHh0ZG93bmxvYWQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGDlrpjmlrkgdHh0IOS4i+i8ieWKn+iDvemBreemgeeUqO+8jOaIluiri+S9v+eUqCBjb29raWVzIOeZu+WFpe+8jOaIluWwhyBkaXNhYmxlVHh0ZG93bmxvYWQg6Kit54K6IHRydWVgKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRhYmxlXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdGxldCB0ciA9IGRvbS4kKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRpZiAodHIuaXMoJy5jaGFwdGVyX3RpdGxlJykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZTogdHIudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoIWN1cnJlbnRWb2x1bWUpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiAnbnVsbCcsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgYSA9IHRyLmZpbmQoJy5zdWJ0aXRsZSBhJyk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfZGF0ZTtcblx0XHRcdFx0XHRcdFx0bGV0IGRkO1xuXHRcdFx0XHRcdFx0XHRsZXQgZGEgPSB0ci5maW5kKCcubG9uZ191cGRhdGUnKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoZGEuZmluZCgnc3Bhblt0aXRsZSo9XCIvXCJdJykubGVuZ3RoKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZGQgPSBkYS5maW5kKCdzcGFuW3RpdGxlKj1cIi9cIl0nKS5hdHRyKCd0aXRsZScpLnJlcGxhY2UoL+aUueeov3xeXFxzK3xcXHMrJC9nLCAnJyk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoIWRkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZGEuZmluZCgnKicpLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0XHRcdGRkID0gZGEudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChkZClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfZGF0ZSA9IG1vbWVudChkZCwgJ1lZWVkvTU0vREQgSEg6bW0nKS5sb2NhbCgpO1xuXHRcdFx0XHRcdFx0XHRcdF9jYWNoZV9kYXRlcy5wdXNoKGNoYXB0ZXJfZGF0ZS51bml4KCkpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0bGV0IGhyZWYgPSBhLnByb3AoJ2hyZWYnKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgZGF0YSA9IHNlbGYucGFyc2VVcmwoaHJlZik7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFkYXRhLmNoYXB0ZXJfaWQpXG5cdFx0XHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0XHRcdGlmICh0ci5maW5kKCcuYm9va21hcmtlcl9ub3cnKS5sZW5ndGgpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdFx0XHQgKiBmaXggaHR0cHM6Ly9uY29kZS5zeW9zZXR1LmNvbS9uNzYzN2RqL1xuXHRcdFx0XHRcdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2codHIucHJvcChcIm91dGVySFRNTFwiKSk7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYS5wcm9wKFwib3V0ZXJIVE1MXCIpKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhocmVmKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhLmF0dHIoJ2hyZWYnKSk7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKG5ldyBVUkwoaHJlZiwgZG9tLnVybCkpO1xuXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZG9tLl9vcHRpb25zKTtcblxuXHRcdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZGF0YSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdHVybDogbnVsbCxcblx0XHRcdFx0XHRcdFx0XHRcdG5vdmVsX3BpZDogbm92ZWxfc3lvc2V0dV9pZCBhcyBzdHJpbmcsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQgYXMgc3RyaW5nLFxuXHRcdFx0XHRcdFx0XHRcdH0gYXMgYW55O1xuXG5cdFx0XHRcdFx0XHRcdFx0aHJlZiA9IHNlbGYuX2hhY2tVUkwoc2VsZi5tYWtlVXJsKGRhdGEpLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0XHRcdFx0XHRkYXRhLnVybCA9IGhyZWY7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lXG5cdFx0XHRcdFx0XHRcdFx0LmNoYXB0ZXJfbGlzdFxuXHRcdFx0XHRcdFx0XHRcdC5wdXNoKHtcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaW5kZXg6IGN1cnJlbnRWb2x1bWUuY2hhcHRlcl9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGU6IGEudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKSxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsOiBocmVmLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmxfZGF0YTogZGF0YSxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfZGF0ZSxcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdF9jYWNoZV9kYXRlcy5zb3J0KCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGUgPSBtb21lbnQudW5peChfY2FjaGVfZGF0ZXNbX2NhY2hlX2RhdGVzLmxlbmd0aCAtIDFdKS5sb2NhbCgpO1xuXG5cdFx0XHRcdGxldCBhID0gYXdhaXQgc2VsZi5fZ2V0RXh0cmFJbmZvVVJMKHVybF9kYXRhLm5vdmVsX2lkLCB1cmxfZGF0YSwgb3B0aW9uc1J1bnRpbWUpXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKGRvbSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgaDIgPSBkb20uJChgZGl2Omhhcyg+IGgyLnNlYXJjaDpoYXMoPiBhW2hyZWYqPVwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIl0pKWApLmVxKDApO1xuXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aDIgPSBkb20uJChgaDI6aGFzKD4gYVtocmVmKj1cIiR7dXJsX2RhdGEubm92ZWxfaWR9XCJdKWApLmVxKDApO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS53YXJuKGBjYW4gbm90IGZvdW5kIGtleXdvcmQgXCIke3VybF9kYXRhLm5vdmVsX2lkfVwiLCB3aWxsIHRyeSB1c2UgdGl0bGUgc2VhcmNoYCk7XG5cblx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdCAqIGh0dHBzOi8vbmFyb3UxOC5uYXIuanAvc2VhcmNoLnBocD90ZXh0PSVFMyU4MyVBOSVFMyU4MyVCMyVFMyU4MiVBRiVFNSU4NiU5MiVFOSU5OSVCQSVFOCU4MCU4NSVFMyU4MSVBRSVFMyU4MiVCOSVFMyU4MyVBRCVFMyU4MyVCQyVFMyU4MyVBOSVFMyU4MiVBNCVFMyU4MyU5NSZub3ZlbD1hbGwmZ2VucmU9YWxsJm5ld19nZW5yZT1hbGwmbGVuZ3RoPTAmZG93bj0wJnVwPTEwMFxuXHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0bGV0IHRpdGxlID0gbm92ZWxfdGl0bGVcblx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvW1xcd++9gS3vvZpdKy9pZywgJyAnKVxuXHRcdFx0XHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9nZXRFeHRyYUluZm9VUkwodGl0bGUsIHVybF9kYXRhLCBvcHRpb25zUnVudGltZSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldHVybiBkb207XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coZG9tLnVybCk7XG5cblx0XHRcdFx0XHRcdGxldCBkYXRhOiBJTWRjb25mTWV0YSA9IHt9O1xuXG5cdFx0XHRcdFx0XHRsZXQgaDIgPSBkb20uJChgZGl2Omhhcyg+IGgyLnNlYXJjaDpoYXMoPiBhW2hyZWYqPVwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIl0pKWApLmVxKDApO1xuXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aDIgPSBkb20uJChgaDI6aGFzKD4gYVtocmVmKj1cIiR7dXJsX2RhdGEubm92ZWxfaWR9XCJdKWApLmVxKDApO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRsZXQgc2VhcmNoX2xlZnQgPSBoMi5uZXh0QWxsKCcuc2VhcmNoX2xlZnQ6ZXEoMCknKS5lcSgwKTtcblx0XHRcdFx0XHRcdGxldCBzZWFyY2hfcmlnaHQgPSBoMi5uZXh0QWxsKCcuc2VhcmNoX3JpZ2h0OmVxKDApJykuZXEoMCk7XG5cblx0XHRcdFx0XHRcdGlmICghc2VhcmNoX2xlZnQubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRzZWFyY2hfbGVmdCA9IGgyLnNpYmxpbmdzKCcuc2VhcmNoX2xlZnQ6ZXEoMCknKS5lcSgwKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKCFzZWFyY2hfcmlnaHQubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRzZWFyY2hfcmlnaHQgPSBoMi5zaWJsaW5ncygnLnNlYXJjaF9yaWdodDplcSgwKScpLmVxKDApO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygxMTExMTExMTExMTExMTExMTExMTEpO1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlLndhcm4oYGNhbiBub3QgZm91bmQga2V5d29yZCBmb3IgJHt1cmxfZGF0YS5ub3ZlbF9pZH1gLCBkb20udXJsKTtcblxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZGF0YTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhzZWFyY2hfbGVmdCk7XG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKHNlYXJjaF9yaWdodCk7XG5cblx0XHRcdFx0XHRcdGRhdGEubm92ZWwgPSB7fTtcblxuXHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC5zdGF0dXMgPSBzZWFyY2hfbGVmdC5maW5kKCcubm92ZWxfdHlwZScpLnRleHQoKS50cmltKCk7XG5cdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MgPSBbXTtcblxuXHRcdFx0XHRcdFx0aWYgKGRhdGEubm92ZWwuc3RhdHVzID09PSAn5a6M57WQ5riIJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC5ub3ZlbF9zdGF0dXMgfD0gRW51bU5vdmVsU3RhdHVzLkFVVEhPUl9ET05FO1xuXG5cdFx0XHRcdFx0XHRcdGRhdGEubm92ZWwudGFncy5wdXNoKGRhdGEubm92ZWwuc3RhdHVzKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0c2VhcmNoX3JpZ2h0LmZpbmQoJy5rZXl3b3JkIGEnKVxuXHRcdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgayA9IGRvbS4kKGVsZW0pXG5cdFx0XHRcdFx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdFx0XHRcdFx0XHQuc3BsaXQoL1tcXC9cXHNdLylcblx0XHRcdFx0XHRcdFx0XHRcdC5tYXAoZnVuY3Rpb24gKHMpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBzLnRyaW0oKTtcblx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHQuZmlsdGVyKCh2KSA9PiB2KVxuXHRcdFx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0XHRcdGRhdGEubm92ZWwudGFncyA9IGRhdGEubm92ZWwudGFncy5jb25jYXQoayk7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdHNlYXJjaF9sZWZ0XG5cdFx0XHRcdFx0XHRcdC5maW5kKCdbY2xhc3MqPVwibmV3X2dlbnJlXCJdLCAubm9jZ2VucmUnKVxuXHRcdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgayA9IGRvbS4kKGVsZW0pXG5cdFx0XHRcdFx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG5cdFx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGspXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzLnB1c2goayk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRkYXRhLmxpbmsgPSBkYXRhLmxpbmsgfHwgW107XG5cblx0XHRcdFx0XHRcdGRhdGEubGluay5wdXNoKGBbJHtkb20udXJsLmhvc3RuYW1lfV0oJHtkb20udXJsfSkgLSDlsI/oqqzlrrbjgavjgarjgo3jgYbjgIDmm7TmlrDmg4XloLHmpJzntKJgKTtcblxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkYXRhKTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGRhdGE7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLmdyYXkuZXJyb3IoZS50b1N0cmluZygpKTtcblx0XHRcdFx0XHRcdGNvbnNvbGUud2Fybihg5LiL6LyJ5bCP6Kqq6LOH6KiK5pmC55m855Sf6Yyv6KqkICgxKe+8jOatpOaPkOmGkuioiuaBr+WPr+S7peeEoeimlmApO1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4ge307XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGEgPSBhd2FpdCBzZWxmLl9nZXRFeHRyYUluZm9VUkwyKHVybF9kYXRhLCBvcHRpb25zUnVudGltZSwgYSk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3Nlcmllc190aXRsZTogc3RyaW5nO1xuXHRcdFx0XHRsZXQgbm92ZWxfc3lvc2V0dV9zZXJpZXNfaWQ6IHN0cmluZztcblxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IF9hID0gZG9tLiQoJyNub3ZlbF9jb250ZW50cyAuc2VyaWVzX3RpdGxlJyk7XG5cblx0XHRcdFx0XHRsZXQgdCA9IF9hLnRleHQoKVxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoL1tcXHJcXG5cXHRdK3xeXFxzK3xcXHMrJC9nLCAnJylcblx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRpZiAodClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRub3ZlbF9zZXJpZXNfdGl0bGUgPSB0O1xuXG5cdFx0XHRcdFx0XHRfYSA9IF9hLmZpbmQoJ2EnKTtcblx0XHRcdFx0XHRcdGxldCBfdCA9IF9hLmF0dHIoJ2hyZWYnKSB8fCAnJztcblxuXHRcdFx0XHRcdFx0aWYgKC9cXC8oXFx3ezYsfSlcXC8vaS5leGVjKF90KSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bm92ZWxfc3lvc2V0dV9zZXJpZXNfaWQgPSBSZWdFeHAuJDE7XG5cblx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRhLmxpbmsgPSBhLmxpbmsgfHwgW107XG5cblx0XHRcdFx0XHRcdFx0bGV0IHRpdGxlID0gbm92ZWxfc2VyaWVzX3RpdGxlXG5cdFx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL1tcXFtcXF1cXH5cXGBdL2csICdcXFxcJDAnKVxuXHRcdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9bXCInXS9nLCAnJylcblx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0YS5saW5rLnB1c2goYFske3RpdGxlfV0oJHtfYS5wcm9wKCdocmVmJyl9KWApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1Zyhg57WQ5p2f6JmV55CG5bCP6Kqq6LOH6KiK5Lul5Y+K56ug56+A5YiX6KGoYCk7XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdC4uLmEsXG5cblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcblx0XHRcdFx0XHRub3ZlbF9hdXRob3IsXG5cblx0XHRcdFx0XHRub3ZlbF9kZXNjLFxuXHRcdFx0XHRcdG5vdmVsX2RhdGUsXG5cdFx0XHRcdFx0bm92ZWxfcHVibGlzaGVyLFxuXG5cdFx0XHRcdFx0bm92ZWxfc2VyaWVzX3RpdGxlLFxuXHRcdFx0XHRcdG5vdmVsX3N5b3NldHVfc2VyaWVzX2lkLFxuXG5cdFx0XHRcdFx0bm92ZWxfc3lvc2V0dV9pZCxcblxuXHRcdFx0XHRcdHZvbHVtZV9saXN0LFxuXG5cdFx0XHRcdFx0Y2hlY2tkYXRlOiBtb21lbnQoKS5sb2NhbCgpLFxuXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdH0gYXMgSU5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZVN5b3NldHU7XG5cbiJdfQ==