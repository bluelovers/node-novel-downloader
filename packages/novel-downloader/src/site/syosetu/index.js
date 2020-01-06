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
const index_3 = require("../index");
const NovelSiteDemo = require("../demo/base");
const novel_text_1 = require("novel-text");
const log_1 = require("../../util/log");
const html_1 = require("../../util/html");
const mitemin_1 = require("mitemin");
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
            await html_1._keepImageInContext(_imgs, $, '挿絵');
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
exports.NovelSiteSyosetu = NovelSiteSyosetu;
exports.default = NovelSiteSyosetu;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLGdDQUFnQztBQUNoQyxxREFBNEQ7QUFPNUQsNkNBQStEO0FBRy9ELHlDQUFnQztBQUdoQyxvQ0FBMEY7QUFDMUYsb0NBQThEO0FBQzlELG9DQUFrQztBQUVsQyw4Q0FBK0M7QUFDL0MsMkNBQW1DO0FBRW5DLHdDQUF1RDtBQUN2RCwwQ0FBcUU7QUFFckUscUNBQXFDO0FBTXJDLElBQWtCLGdCQUtqQjtBQUxELFdBQWtCLGdCQUFnQjtJQUVqQyx1REFBSSxDQUFBO0lBQ0oseURBQUssQ0FBQTtJQUNMLHVEQUFJLENBQUE7QUFDTCxDQUFDLEVBTGlCLGdCQUFnQixHQUFoQix3QkFBZ0IsS0FBaEIsd0JBQWdCLFFBS2pDO0FBZUQsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBaUIsU0FBUSxhQUFhLENBQUMsU0FBUztJQUk1RCxZQUFZLE9BQXlCLEVBQUUsR0FBRyxJQUFJO1FBRTdDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUV4QixJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUM7SUFDcEUsQ0FBQztJQUVELE9BQU8sQ0FBZ0MsY0FBNkMsRUFBRSxHQUFRO1FBRTdGLGFBQWE7UUFDYixjQUFjLENBQUMsV0FBVyxHQUFHLGNBQWMsQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDO1FBQzlELGFBQWE7UUFDYixjQUFjLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFFMUM7Ozs7OztVQU1FO1FBRUYsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFbkMsNkNBQTZDO1FBRTdDLGNBQWMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUVwQztRQUVILDJEQUEy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RVIsV0FBVztnQkFDWCxZQUFZO2dCQUVaLFVBQVU7Z0JBQ1YsVUFBVTtnQkFDVixlQUFlO2dCQUVmLGtCQUFrQjtnQkFDbEIsdUJBQXVCO2dCQUV2QixnQkFBZ0I7Z0JBRWhCLFdBQVcsRUFFWCxTQUFTLEVBQUUsY0FBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBRTNCLElBQUksRUFBRSxFQUFjLEdBQ1YsQ0FBQztRQUNiLENBQUMsQ0FBQyxDQUNEO0lBQ0gsQ0FBQztDQUVELENBQUE7QUFyMkJ1QixzQkFBSyxHQUFHLFNBQVMsQ0FBQztBQUY3QixnQkFBZ0I7SUFENUIsd0JBQWdCLEVBQWdEOztHQUNwRCxnQkFBZ0IsQ0F1MkI1QjtBQXYyQlksNENBQWdCO0FBeTJCN0Isa0JBQWUsZ0JBQWdCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSB0eXBlcz1cImpxdWVyeVwiIC8+XG5pbXBvcnQgeyBFbnVtTm92ZWxTdGF0dXMgfSBmcm9tICdub2RlLW5vdmVsLWluZm8vbGliL2NvbnN0JztcbmltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uLy4uL2ZldGNoJztcblxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IHRyaW1GaWxlbmFtZSB9IGZyb20gJ2ZzLWljb252L3V0aWwnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICd1cGF0aDInO1xuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCB7IExhenlDb29raWUsIExhenlDb29raWVKYXIgfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZ2V0RmlsZVBhdGgsIGdldFZvbHVtZVBhdGggfSBmcm9tICcuLi9mcyc7XG5cbmltcG9ydCBOb3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgZGVmYXVsdEpTRE9NT3B0aW9ucywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkLCBibHVlYmlyZERlY29yYXRvciB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IG1vbWVudCB9IGZyb20gJy4uL2luZGV4JztcblxuaW1wb3J0IE5vdmVsU2l0ZURlbW8gPSByZXF1aXJlKCcuLi9kZW1vL2Jhc2UnKTtcbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG5cbmltcG9ydCB7IGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZyB9IGZyb20gJy4uLy4uL3V0aWwvbG9nJztcbmltcG9ydCB7IF9rZWVwSW1hZ2VJbkNvbnRleHQsIGtlZXBGb3JtYXRUYWcgfSBmcm9tICcuLi8uLi91dGlsL2h0bWwnO1xuaW1wb3J0IHsgaGFzaFN1bSB9IGZyb20gJy4uLy4uL3V0aWwvaGFzaCc7XG5pbXBvcnQgeyBwYXJzZUFzeW5jIH0gZnJvbSAnbWl0ZW1pbic7XG5cbmV4cG9ydCB0eXBlIElOb3ZlbCA9IE5vdmVsU2l0ZURlbW8uSU5vdmVsICYge1xuXHRub3ZlbF9zeW9zZXR1X2lkOiBzdHJpbmcsXG59O1xuXG5leHBvcnQgY29uc3QgZW51bSBFbnVtUHJvdG9jb2xNb2RlXG57XG5cdE5PTkUsXG5cdEhUVFBTLFxuXHRIVFRQLFxufVxuXG5leHBvcnQgdHlwZSBJT3B0aW9uc1BsdXMgPSB7XG5cdC8qKlxuXHQgKiDkuI3kvb/nlKjlsI/oqqrlrrbmj5DkvpvnmoQgdHh0IOS4i+i8iemAo+e1kFxuXHQgKi9cblx0ZGlzYWJsZVR4dGRvd25sb2FkPzogYm9vbGVhbixcblxuXHRwcm90b2NvbE1vZGU/OiBFbnVtUHJvdG9jb2xNb2RlIHwgYm9vbGVhbixcbn1cblxuZXhwb3J0IHR5cGUgSURvd25sb2FkT3B0aW9ucyA9IE5vdmVsU2l0ZURlbW8uSURvd25sb2FkT3B0aW9ucyAmIElPcHRpb25zUGx1c1xuZXhwb3J0IHR5cGUgSU9wdGlvbnNSdW50aW1lID0gTm92ZWxTaXRlRGVtby5JT3B0aW9uc1J1bnRpbWUgJiBJRG93bmxvYWRPcHRpb25zICYgSU9wdGlvbnNQbHVzXG5cbkBzdGF0aWNJbXBsZW1lbnRzPE5vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZVN5b3NldHU+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlU3lvc2V0dSBleHRlbmRzIE5vdmVsU2l0ZURlbW8uTm92ZWxTaXRlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVkgPSAnc3lvc2V0dSc7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogSURvd25sb2FkT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdHN1cGVyKG9wdGlvbnMsIC4uLmFyZ3YpO1xuXG5cdFx0dGhpcy5vcHRpb25zSW5pdC5yZXRyeURlbGF5ID0gdGhpcy5vcHRpb25zSW5pdC5yZXRyeURlbGF5IHx8IDI1MDAwO1xuXHR9XG5cblx0c2Vzc2lvbjxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+LCB1cmw6IFVSTClcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSA9IG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhIHx8IHt9O1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YS5vdmVyMTggPSAneWVzJztcblxuXHRcdC8qXG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEuc2FzaWVubyA9IDA7XG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEubGluZWhlaWdodCA9IDA7XG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEuZm9udHNpemUgPSAwO1xuXHRcdG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhLm5vdmVsbGF5b3V0ID0gMDtcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YS5maXhfbWVudV9iYXIgPSAwO1xuXHRcdCovXG5cblx0XHRzdXBlci5zZXNzaW9uKG9wdGlvbnNSdW50aW1lLCB1cmwpO1xuXG5cdFx0Ly9sZXQgdXJsID0gb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS51cmw7XG5cblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyXG5cdFx0Ly8uc2V0Q29va2llU3luYygnb3ZlcjE4PXllczsgRG9tYWluPS5zeW9zZXR1LmNvbTsgUGF0aD0vOyBob3N0T25seT1mYWxzZScsIHVybC5ocmVmKVxuXHRcdDtcblxuLy9cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJ1blNjcmlwdHMgPSAnZGFuZ2Vyb3VzbHknO1xuLy9cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnZpcnR1YWxDb25zb2xlID0gZmFsc2U7XG5cblx0XHQvL29wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyB8fCB7fTtcblxuLy9cdFx0aWYgKCFvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMuamFyKVxuLy9cdFx0e1xuXHRcdC8vb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zLmphciA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIud3JhcEZvclJlcXVlc3QoKTtcbi8vXHRcdH1cblxuXHRcdC8vb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnVzZXJBZ2VudCA9ICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNzEuMC4zNTc4Ljk4IFNhZmFyaS81MzcuMzYnO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRkb3dubG9hZCh1cmw6IHN0cmluZyB8IFVSTCwgZG93bmxvYWRPcHRpb25zOiBJRG93bmxvYWRPcHRpb25zID0ge30pXG5cdHtcblx0XHRyZXR1cm4gc3VwZXIuZG93bmxvYWQodXJsLCBkb3dubG9hZE9wdGlvbnMpO1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9wYXJzZUNoYXB0ZXI8VD4ocmV0LCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGUpOiBQcm9taXNlPHN0cmluZz5cblx0e1xuXHRcdGlmICghcmV0KVxuXHRcdHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLmRpc2FibGVUeHRkb3dubG9hZClcblx0XHR7XG5cdFx0XHRyZXR1cm4gcmV0LmJvZHk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgJDogSlF1ZXJ5U3RhdGljID0gcmV0LmRvbS4kO1xuXG5cdFx0bGV0IF9pbWdzID0gJCgnI25vdmVsX3AsICNub3ZlbF9ob25idW4sICNub3ZlbF9hJylcblx0XHRcdC5maW5kKCdpbWdbc3JjXScpXG5cdFx0O1xuXG5cdFx0YXdhaXQgUHJvbWlzZUJsdWViaXJkXG5cdFx0XHQucmVzb2x2ZShfaW1ncy50b0FycmF5KCkpXG5cdFx0XHQuZWFjaChhc3luYyAoZWxlbSwgaSkgPT5cblx0XHRcdHtcblx0XHRcdFx0bGV0IGltZyA9ICQoZWxlbSk7XG5cdFx0XHRcdGxldCBzcmMgPSBpbWcucHJvcCgnc3JjJyk7XG5cblx0XHRcdFx0Y2FjaGUuY2hhcHRlci5pbWdzID0gY2FjaGUuY2hhcHRlci5pbWdzIHx8IFtdO1xuXG5cdFx0XHRcdGF3YWl0IHBhcnNlQXN5bmMoc3JjKVxuXHRcdFx0XHRcdC50aGVuKGRhdGEgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKGRhdGEuZnVsbHNpemUpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHNyYyA9IGRhdGEuZnVsbHNpemU7XG5cblx0XHRcdFx0XHRcdFx0aW1nLnByb3AoJ3NyYycsIHNyYyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZSA9PiBjb25zb2xlLmVycm9yKGUpKVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRjYWNoZS5jaGFwdGVyLmltZ3MucHVzaChzcmMpO1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGNhY2hlLm5vdmVsLmltZ3MucHVzaChzcmMpO1xuXHRcdFx0fSlcblx0XHQ7XG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUua2VlcEltYWdlKVxuXHRcdHtcblx0XHRcdGF3YWl0IF9rZWVwSW1hZ2VJbkNvbnRleHQoX2ltZ3MsICQsICfmjL/ntbUnKTtcblx0XHR9XG5cblx0XHRsZXQgYm9keXM6IEpRdWVyeVtdID0gW1xuXHRcdFx0JCgnI25vdmVsX3AnKSxcblx0XHRcdCQoJyNub3ZlbF9ob25idW4nKSxcblx0XHRcdCQoJyNub3ZlbF9hJyksXG5cdFx0XTtcblxuXHRcdGJvZHlzLmZvckVhY2godCA9PiBrZWVwRm9ybWF0VGFnKHQsIHtcblx0XHRcdCQsXG5cdFx0XHRvcHRpb25zUnVudGltZSxcblx0XHR9KSk7XG5cblx0XHRyZXR1cm4gYm9keXMubWFwKHYgPT4gdi50ZXh0KCkpLmZpbHRlcihmdW5jdGlvbiAodilcblx0XHR7XG5cdFx0XHRyZXR1cm4gdjtcblx0XHR9KS5qb2luKCdcXG5cXG49PT09PT09PT09PT09PT09PT1cXG5cXG4nKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfY3JlYXRlQ2hhcHRlclVybDxUID0gSU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4oe1xuXHRcdG5vdmVsLFxuXHRcdHZvbHVtZSxcblx0XHRjaGFwdGVyLFxuXHR9OiB7XG5cdFx0bm92ZWw6IE5vdmVsU2l0ZS5JTm92ZWwsXG5cdFx0dm9sdW1lOiBOb3ZlbFNpdGUuSVZvbHVtZSxcblx0XHRjaGFwdGVyOiBOb3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdH0sIG9wdGlvbnNSdW50aW1lPzogVCAmIElPcHRpb25zUnVudGltZSk6IFVSTFxuXHR7XG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lLmRpc2FibGVUeHRkb3dubG9hZClcblx0XHR7XG5cdFx0XHRsZXQgdXJsID0gdGhpcy5tYWtlVXJsKHtcblx0XHRcdFx0Y2hhcHRlcl9pZDogY2hhcHRlci5jaGFwdGVyX2lkLFxuXHRcdFx0XHRub3ZlbF9pZDogbm92ZWwudXJsX2RhdGEubm92ZWxfaWQsXG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIHRoaXMuX2hhY2tVUkwodXJsLCBvcHRpb25zUnVudGltZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHN1cGVyLl9jcmVhdGVDaGFwdGVyVXJsKHtcblx0XHRcdG5vdmVsLFxuXHRcdFx0dm9sdW1lLFxuXHRcdFx0Y2hhcHRlcixcblx0XHR9LCBvcHRpb25zUnVudGltZSk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSwgb3B0aW9ucyA9IHt9LCAuLi5vcHRzKVxuXHR7XG5cdFx0b3B0aW9uc1t0aGlzLklES0VZXSA9IHtcblx0XHRcdHR4dGRvd25sb2FkX2lkOiBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsLm5vdmVsX3N5b3NldHVfaWQgfHwgJycsXG5cdFx0XHRzZXJpZXNfaWQ6IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwubm92ZWxfc3lvc2V0dV9zZXJpZXNfaWQgfHwgJycsXG5cdFx0fTtcblxuXHRcdHJldHVybiBzdXBlci5fc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZSwgb3B0aW9ucywge1xuXHRcdFx0b3B0aW9uczoge1xuXHRcdFx0XHR0ZXh0bGF5b3V0OiB7XG5cdFx0XHRcdFx0YWxsb3dfbGYyOiB0cnVlLFxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHR9LCAuLi5vcHRzKTtcblx0fVxuXG5cdF9oYWNrVVJMKG9iajogVVJMIHwgc3RyaW5nLCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0aWYgKHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdG9iaiA9IG5ldyBVUkwob2JqKSBhcyBVUkw7XG5cdFx0fVxuXG5cdFx0aWYgKG9iai5ob3N0bmFtZSA9PT0gJ25jb2RlLnN5b3NldHUuY29tJyB8fCBvYmouaG9zdG5hbWUgPT09ICdub3ZlbDE4LnN5b3NldHUuY29tJylcblx0XHR7XG5cdFx0XHRzd2l0Y2ggKG9wdGlvbnNSdW50aW1lLnByb3RvY29sTW9kZSlcblx0XHRcdHtcblx0XHRcdFx0Y2FzZSBFbnVtUHJvdG9jb2xNb2RlLkhUVFA6XG5cdFx0XHRcdFx0b2JqLnByb3RvY29sID0gJ2h0dHAnO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIHRydWU6XG5cdFx0XHRcdGNhc2UgRW51bVByb3RvY29sTW9kZS5IVFRQUzpcblx0XHRcdFx0XHRvYmoucHJvdG9jb2wgPSAnaHR0cHMnO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBvYmpcblx0fVxuXG5cdG1ha2VVcmw8VD4odXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sID86IGJvb2xlYW4sIG9wdGlvbnNSdW50aW1lPzogVCAmIElPcHRpb25zUnVudGltZSk6IFVSTFxuXHR7XG5cdFx0bGV0IHN1YmRvbWFpbiA9IHVybG9iai5ub3ZlbF9yMTggPyAnbm92ZWwxOCcgOiAnbmNvZGUnO1xuXG5cdFx0aWYgKHVybG9iai5ub3ZlbF9waWQgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpXG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0cmV0dXJuIG5ldyBVUkwoYGh0dHBzOi8vJHtzdWJkb21haW59LnN5b3NldHUuY29tL3R4dGRvd25sb2FkL2Rsc3RhcnQvbmNvZGUvJHt1cmxvYmoubm92ZWxfcGlkfS8/bm89JHt1cmxvYmouY2hhcHRlcl9pZH0maGFua2FrdT0wJmNvZGU9dXRmLTgma2FpZ3lvPWNybGZgKTtcblx0XHR9XG5cblx0XHRsZXQgcGFkID0gKCFib29sICYmIHVybG9iai5jaGFwdGVyX2lkKSA/IHVybG9iai5jaGFwdGVyX2lkIDogJyc7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG5ldyBVUkwoYGh0dHA6Ly8ke3N1YmRvbWFpbn0uc3lvc2V0dS5jb20vJHt1cmxvYmoubm92ZWxfaWR9LyR7cGFkfWApO1xuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwpOiBOb3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHRsZXQgdXJsb2JqID0ge1xuXHRcdFx0dXJsLFxuXG5cdFx0XHRub3ZlbF9waWQ6IG51bGwsXG5cdFx0XHRub3ZlbF9pZDogbnVsbCxcblx0XHRcdGNoYXB0ZXJfaWQ6IG51bGwsXG5cblx0XHRcdG5vdmVsX3IxODogbnVsbCxcblx0XHR9O1xuXG5cdFx0Ly91cmwgPSB1cmwudG9TdHJpbmcoKTtcblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHVybG9iai51cmwgPSBuZXcgVVJMKHVybCk7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR1cmwgPSB1cmxvYmoudXJsLmhyZWY7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUud2FybihlLnRvU3RyaW5nKCkgKyBgIFwiJHt1cmx9XCJgKTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIHVybCAhPSAnc3RyaW5nJylcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKHVybCk7XG5cdFx0fVxuXG5cdFx0bGV0IHI6IFJlZ0V4cDtcblx0XHRsZXQgbTtcblxuXHRcdHIgPSAvXihuW1xcd117NSw2fSkkLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvKG5vdmVsMTgpXFwuc3lvc2V0dVxcLmNvbS87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfcjE4ID0gbVsxXTtcblx0XHR9XG5cblx0XHRyID0gL3R4dGRvd25sb2FkXFwvZGxzdGFydFxcL25jb2RlXFwvKFxcZCspLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9waWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvXFwuc3lvc2V0dVxcLmNvbVxcLyhuXFx3KykoPzpcXC8/KFxcZCspKT8vO1xuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVsyXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyZXR1cm4gdXJsb2JqO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9mZXRjaENoYXB0ZXI8VD4odXJsOiBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBfY2FjaGVfOiB7XG5cdFx0bm92ZWw6IElOb3ZlbCxcblx0fSlcblx0e1xuXHRcdGxldCB0cnllZDogYm9vbGVhbjtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdGxldCBfZmV0Y2hDaGFwdGVyID0gc3VwZXIuX2ZldGNoQ2hhcHRlcjtcblxuXHRcdHJldHVybiBzdXBlci5fZmV0Y2hDaGFwdGVyKHVybCwgb3B0aW9uc1J1bnRpbWUsIF9jYWNoZV8pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAocmV0KVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAocmV0ID09IG51bGwpIHJldHVybiByZXQ7XG5cblx0XHRcdFx0Y29uc3QgZG9tID0gcmV0LmRvbTtcblxuXHRcdFx0XHRpZiAoIXRyeWVkICYmIGRvbSAmJiBkb20uJCgnI21vZGFsIC55ZXMgI3llczE4JykubGVuZ3RoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmVycm9yKGDnhKHms5XmiJDlip/oroDlj5YgUjE4IOmggemdomAsIHVybC5ocmVmKTtcblxuXHRcdFx0XHRcdHRyeWVkID0gdHJ1ZTtcblxuXHRcdFx0XHRcdHRyeVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdCQoJyNtb2RhbCAueWVzICN5ZXMxOCcpLmNsaWNrKCk7XG5cdFx0XHRcdFx0XHQkKCcjbW9kYWwgLnllcyAjeWVzMTgnKVswXS5jbGljaygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYXRjaCAoZSlcblx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyLnNldENvb2tpZVN5bmMoJ292ZXIxOD15ZXM7IERvbWFpbj0uc3lvc2V0dS5jb207IFBhdGg9LzsgaG9zdE9ubHk9ZmFsc2UnLCB1cmwpO1xuXHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIuc2V0Q29va2llU3luYyhgb3ZlcjE4PXllczsgRG9tYWluPSR7ZG9tLnVybC5ob3N0fTsgUGF0aD0vOyBob3N0T25seT1mYWxzZWAsIGRvbS51cmwpO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmRlYnVnKG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIuZ2V0QWxsQ29va2llcygpKTtcblxuXHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZWZlcnJlciA9IGRvbS51cmw7XG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zID0gb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zIHx8IHt9O1xuXHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucy5mb3JtID0gZG9tLnVybDtcblxuXHRcdFx0XHRcdHJldHVybiBfZmV0Y2hDaGFwdGVyLmNhbGwoc2VsZiwgdXJsLCBvcHRpb25zUnVudGltZSwgX2NhY2hlXylcblx0XHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXQpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGRvbSA9IHJldC5kb207XG5cdFx0XHRcdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRcdFx0XHRpZiAoJCgnI21vZGFsIC55ZXMgI3llczE4JykubGVuZ3RoKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcihg54Sh5rOV5oiQ5Yqf6K6A5Y+WIFIxOCDpoIHpnaJgLCB1cmwuaHJlZik7XG5cblx0XHRcdFx0XHRcdFx0XHQvL3Byb2Nlc3MuZXhpdCgpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHJldDtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcmV0O1xuXHRcdFx0fSlcblx0fVxuXG5cdGFzeW5jIF9ub3ZlbDE4PFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPih1cmwsXG5cdFx0ZG9tOiBJSlNET00sXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge30sXG5cdCk6IFByb21pc2U8SUpTRE9NPlxuXHR7XG5cdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0aWYgKCEkKCcjbm92ZWxfY29udGVudHMnKS5sZW5ndGggfHwgJCgnI21vZGFsIC55ZXMgI3llczE4JykubGVuZ3RoKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2coZG9tLnVybCwgZG9tLl9vcHRpb25zKTtcblxuXHRcdFx0JCgnI21vZGFsIC55ZXMgI3llczE4JykuY2xpY2soKTtcblxuXHRcdFx0ZG9tLl9vcHRpb25zLnJlcXVlc3RPcHRpb25zLmphci5zZXRDb29raWUoJ292ZXIxOD15ZXM7IERvbWFpbj0uc3lvc2V0dS5jb207IFBhdGg9LzsgaG9zdE9ubHk9ZmFsc2UnLCB1cmwpO1xuXG5cdFx0XHQvL2NvbnNvbGUubG9nKGRvbS5zZXJpYWxpemUoKSk7XG5cblx0XHRcdHJldHVybiBmcm9tVVJMKHVybCwgT2JqZWN0LmFzc2lnbihvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00sIHtcblxuXHRcdFx0XHQvL2Nvb2tpZUphcjogZG9tLl9vcHRpb25zLnJlcXVlc3RPcHRpb25zLmphci5famFyLFxuXHRcdFx0XHQvL3JlcXVlc3RPcHRpb25zOiBkb20uX29wdGlvbnMucmVxdWVzdE9wdGlvbnMsXG5cblx0XHRcdH0gYXMgSUZyb21VcmxPcHRpb25zKSk7XG5cdFx0fVxuXG5cdFx0Ly9jb25zb2xlLmxvZyhkb20uX29wdGlvbnMucmVxdWVzdE9wdGlvbnMuamFyKTtcblxuXHRcdHJldHVybiBkb207XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2dldEV4dHJhSW5mb1VSTDxUPihzZWFyY2g6IHN0cmluZyxcblx0XHR1cmxfZGF0YTogTm92ZWxTaXRlLklQYXJzZVVybCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4sXG5cdClcblx0e1xuXHRcdGxldCBvcHRpb25zSlNET00gPSB7XG5cdFx0XHQuLi5vcHRpb25zUnVudGltZS5vcHRpb25zSlNET00sXG5cdFx0XHRyZXF1ZXN0T3B0aW9uczoge1xuXHRcdFx0XHQuLi5vcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMsXG5cdFx0XHR9LFxuXHRcdH07XG5cblx0XHRvcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgPSBvcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgfHwge307XG5cdFx0b3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zLmZvbGxvd1JlZGlyZWN0ID0gdHJ1ZTtcblxuXHRcdGxldCBfZG9tYWluID0gMSA/ICduYXIuanAnIDogJ2RpcC5qcCc7XG5cblx0XHRsZXQgX3VybCA9IGBodHRwczovLyR7dXJsX2RhdGEubm92ZWxfcjE4XG5cdFx0XHQ/ICduYXJvdTE4J1xuXHRcdFx0OiAnbmFyb3UnfS4ke19kb21haW59L3NlYXJjaC5waHA/dGV4dD0ke3NlYXJjaH0mbm92ZWw9YWxsJmdlbnJlPWFsbCZuZXdfZ2VucmU9YWxsJmxlbmd0aD0wJmRvd249MCZ1cD0xMDBgO1xuXG5cdFx0Y29uc29sZURlYnVnLmRlYnVnKGDoqablnJblj5blvpflsI/oqqrnm7jpl5zos4foqIogKDEpYCwgX3VybCk7XG5cblx0XHRyZXR1cm4gZnJvbVVSTChfdXJsLCBvcHRpb25zSlNET00pXG5cdH1cblxuXHRwcm90ZWN0ZWQgX2dldEV4dHJhSW5mb1VSTDI8VCwgTSBleHRlbmRzIFBhcnRpYWw8SU5vdmVsICYgSU1kY29uZk1ldGE+Pih1cmxfZGF0YTogTm92ZWxTaXRlLklQYXJzZVVybCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4sXG5cdFx0ZGF0YV9tZXRhOiBNLFxuXHQpOiBQcm9taXNlQmx1ZWJpcmQ8TT5cblx0e1xuXHRcdGxldCBzdWJkb21haW4gPSB1cmxfZGF0YS5ub3ZlbF9yMTggPyAnbm92ZWwxOCcgOiAnbmNvZGUnO1xuXG5cdFx0bGV0IGluZm9fdXJsID0gYGh0dHBzOi8vJHtzdWJkb21haW59LnN5b3NldHUuY29tL25vdmVsdmlldy9pbmZvdG9wL25jb2RlLyR7dXJsX2RhdGEubm92ZWxfaWR9L2A7XG5cblx0XHRkYXRhX21ldGEgPSBkYXRhX21ldGEgfHwgKHt9IGFzIE0pO1xuXG5cdFx0Y29uc29sZURlYnVnLmRlYnVnKGDoqablnJblj5blvpflsI/oqqrnm7jpl5zos4foqIogKDIpYCwgaW5mb191cmwpO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwoaW5mb191cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb20pXG5cdFx0XHR7XG5cdFx0XHRcdGxldCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0JCgnI25vdmVsdGFibGUxIHRyJylcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdGxldCBfdHIgPSAkKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRsZXQgX3RoX3RleHQgPSBTdHJpbmcoJCgndGgnLCBfdHIpLnRleHQoKSk7XG5cblx0XHRcdFx0XHRcdGlmIChfdGhfdGV4dC5pbmRleE9mKCfjgq3jg7zjg6/jg7zjg4knKSAhPSAtMSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsID0gZGF0YV9tZXRhLm5vdmVsIHx8IHt9O1xuXHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncyA9IGRhdGFfbWV0YS5ub3ZlbC50YWdzIHx8IFtdO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBfdGRfdGV4dCA9IFN0cmluZygkKCd0ZCcsIF90cikudGV4dCgpKVxuXHRcdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9cXHMrL2csICcgJylcblx0XHRcdFx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0XHRfdGRfdGV4dFxuXHRcdFx0XHRcdFx0XHRcdC5zcGxpdCgvXFxzKy8pXG5cdFx0XHRcdFx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKHRhZylcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodGFnKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRsZXQgX3QgPSB0YWcuc3BsaXQoJy8nKS5tYXAocyA9PiBzLnRyaW0oKSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MucHVzaCguLi5fdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoX3RoX3RleHQuaW5kZXhPZign44K444Oj44Oz44OrJykgIT0gLTEgfHwgX3RoX3RleHQuaW5kZXhPZign5o6y6LyJ44K144Kk44OIJykgIT0gLTEpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbCA9IGRhdGFfbWV0YS5ub3ZlbCB8fCB7fTtcblx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MgPSBkYXRhX21ldGEubm92ZWwudGFncyB8fCBbXTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgX3RkX3RleHQgPSBTdHJpbmcoJCgndGQnLCBfdHIpLnRleHQoKSlcblx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvXFxzKy9nLCAnICcpXG5cdFx0XHRcdFx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0aWYgKF90ZF90ZXh0KVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MucHVzaChfdGRfdGV4dClcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgYWdlX2xpbWl0ID0gJCgnI2FnZV9saW1pdCcpO1xuXG5cdFx0XHRcdGlmIChhZ2VfbGltaXQubGVuZ3RoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IF90ID0gYWdlX2xpbWl0LnRleHQoKS50cmltKCk7XG5cblx0XHRcdFx0XHRpZiAoX3QpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsID0gZGF0YV9tZXRhLm5vdmVsIHx8IHt9O1xuXHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MgPSBkYXRhX21ldGEubm92ZWwudGFncyB8fCBbXTtcblxuXHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MucHVzaChfdCk7XG5cblx0XHRcdFx0XHRcdGlmIChfdC5tYXRjaCgvcjE4L2kpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncy5wdXNoKGBub3ZlbDE4YCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZGF0YV9tZXRhLmxpbmsgPSBkYXRhX21ldGEubGluayB8fCBbXTtcblxuXHRcdFx0XHRkYXRhX21ldGEubGluay5wdXNoKGBb5bCP6Kqs5oOF5aCxXSgke2RvbS51cmx9KWApO1xuXG5cdFx0XHRcdHJldHVybiBkYXRhX21ldGE7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGUgPT5cblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZURlYnVnLmdyYXkuZXJyb3IoZS50b1N0cmluZygpKTtcblx0XHRcdFx0Y29uc29sZS53YXJuKGDkuIvovInlsI/oqqros4foqIrmmYLnmbznlJ/pjK/oqqQgKDIp77yM5q2k5o+Q6YaS6KiK5oGv5Y+v5Lul54Sh6KaWYCk7XG5cblx0XHRcdFx0cmV0dXJuIGRhdGFfbWV0YTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRjcmVhdGVNYWluVXJsPFQ+KHVybDogc3RyaW5nIHwgVVJMLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSlcblx0e1xuXHRcdHJldHVybiB0aGlzLl9oYWNrVVJMKHN1cGVyLmNyZWF0ZU1haW5VcmwodXJsIGFzIGFueSwgb3B0aW9uc1J1bnRpbWUpLCBvcHRpb25zUnVudGltZSlcblx0fVxuXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4odXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge30sXG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHR1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwodXJsIGFzIGFueSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0Y29uc29sZURlYnVnLmRlYnVnKGBnZXRfdm9sdW1lX2xpc3RgLCB1cmwudG9TdHJpbmcoKSk7XG5cblx0XHRyZXR1cm4gZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb206IElKU0RPTSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHNlbGYuX25vdmVsMTg8VD4odXJsLCBkb20sIG9wdGlvbnNSdW50aW1lKTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKGDplovlp4vomZXnkIblsI/oqqros4foqIrku6Xlj4rnq6Dnr4DliJfooahgKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfdGl0bGUgPSBkb20uJCgnLm5vdmVsX3RpdGxlJykudGV4dCgpO1xuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yID0gbm92ZWxUZXh0LnRyaW0oZG9tXG5cdFx0XHRcdFx0LiQoJy5ub3ZlbF93cml0ZXJuYW1lIGEsIC5ub3ZlbF93cml0ZXJuYW1lJylcblx0XHRcdFx0XHQuZXEoLTEpXG5cdFx0XHRcdFx0LnRleHQoKSlcblx0XHRcdFx0XHQucmVwbGFjZSgvXi4q5L2c6ICF77yaLywgJycpXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYyA9IGRvbS4kKCcjbm92ZWxfZXgnKS50ZXh0KCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3B1Ymxpc2hlciA9IHNlbGYuSURLRVk7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybChkb20udXJsLmhyZWYpO1xuXG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIE5vdmVsU2l0ZS5JVm9sdW1lW107XG5cblx0XHRcdFx0bGV0IGN1cnJlbnRWb2x1bWU6IE5vdmVsU2l0ZS5JVm9sdW1lO1xuXG5cdFx0XHRcdGxldCB0YWJsZSA9IGRvbS4kKCcuaW5kZXhfYm94JykuZmluZCgnPiAuY2hhcHRlcl90aXRsZSwgLm5vdmVsX3N1Ymxpc3QyJyk7XG5cblx0XHRcdFx0bGV0IF9jYWNoZV9kYXRlcyA9IFtdO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9zeW9zZXR1X2lkO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb20uc2VyaWFsaXplKCkpO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygkKCcjbm92ZWxfZm9vdGVyJykpO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygkKCcjbm92ZWxfZm9vdGVyJykuZmluZCgnLnVuZGVybmF2aSBhW2hyZWYqPVwidHh0ZG93bmxvYWRcIl0nKSk7XG5cblx0XHRcdFx0XHRsZXQgbTtcblx0XHRcdFx0XHRsZXQgZHQgPSBkb20uJCgnI25vdmVsX2Zvb3RlciAudW5kZXJuYXZpIGFbaHJlZio9XCJ0eHRkb3dubG9hZFwiXScpLnByb3AoJ2hyZWYnKTtcblxuXHRcdFx0XHRcdGlmIChkdCAmJiAobSA9IGR0Lm1hdGNoKC9uY29kZVxcLyhcXGQrKS8pKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRub3ZlbF9zeW9zZXR1X2lkID0gbVsxXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoIW9wdGlvbnNSdW50aW1lLmRpc2FibGVUeHRkb3dubG9hZClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYOWumOaWuSB0eHQg5LiL6LyJ5Yqf6IO96YGt56aB55So77yM5oiW6KuL5L2/55SoIGNvb2tpZXMg55m75YWl77yM5oiW5bCHIGRpc2FibGVUeHRkb3dubG9hZCDoqK3ngrogdHJ1ZWApXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGFibGVcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0bGV0IHRyID0gZG9tLiQodGhpcyk7XG5cblx0XHRcdFx0XHRcdGlmICh0ci5pcygnLmNoYXB0ZXJfdGl0bGUnKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IHZvbHVtZV9saXN0W3ZvbHVtZV9saXN0Lmxlbmd0aF0gPSB7XG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiB2b2x1bWVfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiB0ci50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogW10sXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmICghY3VycmVudFZvbHVtZSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiB2b2x1bWVfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGU6ICdudWxsJyxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogW10sXG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBhID0gdHIuZmluZCgnLnN1YnRpdGxlIGEnKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl9kYXRlO1xuXHRcdFx0XHRcdFx0XHRsZXQgZGQ7XG5cdFx0XHRcdFx0XHRcdGxldCBkYSA9IHRyLmZpbmQoJy5sb25nX3VwZGF0ZScpO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChkYS5maW5kKCdzcGFuW3RpdGxlKj1cIi9cIl0nKS5sZW5ndGgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkZCA9IGRhLmZpbmQoJ3NwYW5bdGl0bGUqPVwiL1wiXScpLmF0dHIoJ3RpdGxlJykucmVwbGFjZSgv5pS556i/fF5cXHMrfFxccyskL2csICcnKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmICghZGQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkYS5maW5kKCcqJykucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHRcdFx0ZGQgPSBkYS50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKGRkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9kYXRlID0gbW9tZW50KGRkLCAnWVlZWS9NTS9ERCBISDptbScpLmxvY2FsKCk7XG5cdFx0XHRcdFx0XHRcdFx0X2NhY2hlX2RhdGVzLnB1c2goY2hhcHRlcl9kYXRlLnVuaXgoKSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgaHJlZiA9IGEucHJvcCgnaHJlZicpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBkYXRhID0gc2VsZi5wYXJzZVVybChocmVmKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIWRhdGEuY2hhcHRlcl9pZClcblx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHRyLmZpbmQoJy5ib29rbWFya2VyX25vdycpLmxlbmd0aClcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdFx0XHRcdCAqIGZpeCBodHRwczovL25jb2RlLnN5b3NldHUuY29tL243NjM3ZGovXG5cdFx0XHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyh0ci5wcm9wKFwib3V0ZXJIVE1MXCIpKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhLnByb3AoXCJvdXRlckhUTUxcIikpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGEpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGhyZWYpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGEuYXR0cignaHJlZicpKTtcblx0XHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2cobmV3IFVSTChocmVmLCBkb20udXJsKSk7XG5cblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhkb20uX29wdGlvbnMpO1xuXG5cdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkYXRhID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0dXJsOiBudWxsLFxuXHRcdFx0XHRcdFx0XHRcdFx0bm92ZWxfcGlkOiBub3ZlbF9zeW9zZXR1X2lkIGFzIHN0cmluZyxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCBhcyBzdHJpbmcsXG5cdFx0XHRcdFx0XHRcdFx0fSBhcyBhbnk7XG5cblx0XHRcdFx0XHRcdFx0XHRocmVmID0gc2VsZi5faGFja1VSTChzZWxmLm1ha2VVcmwoZGF0YSksIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRcdFx0XHRcdGRhdGEudXJsID0gaHJlZjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWVcblx0XHRcdFx0XHRcdFx0XHQuY2hhcHRlcl9saXN0XG5cdFx0XHRcdFx0XHRcdFx0LnB1c2goe1xuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogY3VycmVudFZvbHVtZS5jaGFwdGVyX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZTogYS50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmw6IGhyZWYsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhOiBkYXRhLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9kYXRlLFxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0X2NhY2hlX2RhdGVzLnNvcnQoKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGF0ZSA9IG1vbWVudC51bml4KF9jYWNoZV9kYXRlc1tfY2FjaGVfZGF0ZXMubGVuZ3RoIC0gMV0pLmxvY2FsKCk7XG5cblx0XHRcdFx0bGV0IGEgPSBhd2FpdCBzZWxmLl9nZXRFeHRyYUluZm9VUkwodXJsX2RhdGEubm92ZWxfaWQsIHVybF9kYXRhLCBvcHRpb25zUnVudGltZSlcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBoMiA9IGRvbS4kKGBkaXY6aGFzKD4gaDIuc2VhcmNoOmhhcyg+IGFbaHJlZio9XCIke3VybF9kYXRhLm5vdmVsX2lkfVwiXSkpYCkuZXEoMCk7XG5cblx0XHRcdFx0XHRcdGlmICghaDIubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRoMiA9IGRvbS4kKGBoMjpoYXMoPiBhW2hyZWYqPVwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIl0pYCkuZXEoMCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICghaDIubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlLndhcm4oYGNhbiBub3QgZm91bmQga2V5d29yZCBcIiR7dXJsX2RhdGEubm92ZWxfaWR9XCIsIHdpbGwgdHJ5IHVzZSB0aXRsZSBzZWFyY2hgKTtcblxuXHRcdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdFx0ICogaHR0cHM6Ly9uYXJvdTE4Lm5hci5qcC9zZWFyY2gucGhwP3RleHQ9JUUzJTgzJUE5JUUzJTgzJUIzJUUzJTgyJUFGJUU1JTg2JTkyJUU5JTk5JUJBJUU4JTgwJTg1JUUzJTgxJUFFJUUzJTgyJUI5JUUzJTgzJUFEJUUzJTgzJUJDJUUzJTgzJUE5JUUzJTgyJUE0JUUzJTgzJTk1Jm5vdmVsPWFsbCZnZW5yZT1hbGwmbmV3X2dlbnJlPWFsbCZsZW5ndGg9MCZkb3duPTAmdXA9MTAwXG5cdFx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0XHRsZXQgdGl0bGUgPSBub3ZlbF90aXRsZVxuXHRcdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9bXFx3772BLe+9ml0rL2lnLCAnICcpXG5cdFx0XHRcdFx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHNlbGYuX2dldEV4dHJhSW5mb1VSTCh0aXRsZSwgdXJsX2RhdGEsIG9wdGlvbnNSdW50aW1lKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0dXJuIGRvbTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb20pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb20udXJsKTtcblxuXHRcdFx0XHRcdFx0bGV0IGRhdGE6IElNZGNvbmZNZXRhID0ge307XG5cblx0XHRcdFx0XHRcdGxldCBoMiA9IGRvbS4kKGBkaXY6aGFzKD4gaDIuc2VhcmNoOmhhcyg+IGFbaHJlZio9XCIke3VybF9kYXRhLm5vdmVsX2lkfVwiXSkpYCkuZXEoMCk7XG5cblx0XHRcdFx0XHRcdGlmICghaDIubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRoMiA9IGRvbS4kKGBoMjpoYXMoPiBhW2hyZWYqPVwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIl0pYCkuZXEoMCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGxldCBzZWFyY2hfbGVmdCA9IGgyLm5leHRBbGwoJy5zZWFyY2hfbGVmdDplcSgwKScpLmVxKDApO1xuXHRcdFx0XHRcdFx0bGV0IHNlYXJjaF9yaWdodCA9IGgyLm5leHRBbGwoJy5zZWFyY2hfcmlnaHQ6ZXEoMCknKS5lcSgwKTtcblxuXHRcdFx0XHRcdFx0aWYgKCFzZWFyY2hfbGVmdC5sZW5ndGgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHNlYXJjaF9sZWZ0ID0gaDIuc2libGluZ3MoJy5zZWFyY2hfbGVmdDplcSgwKScpLmVxKDApO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAoIXNlYXJjaF9yaWdodC5sZW5ndGgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHNlYXJjaF9yaWdodCA9IGgyLnNpYmxpbmdzKCcuc2VhcmNoX3JpZ2h0OmVxKDApJykuZXEoMCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICghaDIubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKDExMTExMTExMTExMTExMTExMTExMSk7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUud2FybihgY2FuIG5vdCBmb3VuZCBrZXl3b3JkIGZvciAke3VybF9kYXRhLm5vdmVsX2lkfWAsIGRvbS51cmwpO1xuXG5cdFx0XHRcdFx0XHRcdHJldHVybiBkYXRhO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKHNlYXJjaF9sZWZ0KTtcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coc2VhcmNoX3JpZ2h0KTtcblxuXHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbCA9IHt9O1xuXG5cdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnN0YXR1cyA9IHNlYXJjaF9sZWZ0LmZpbmQoJy5ub3ZlbF90eXBlJykudGV4dCgpLnRyaW0oKTtcblx0XHRcdFx0XHRcdGRhdGEubm92ZWwudGFncyA9IFtdO1xuXG5cdFx0XHRcdFx0XHRpZiAoZGF0YS5ub3ZlbC5zdGF0dXMgPT09ICflrozntZDmuIgnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRkYXRhLm5vdmVsLm5vdmVsX3N0YXR1cyB8PSBFbnVtTm92ZWxTdGF0dXMuQVVUSE9SX0RPTkU7XG5cblx0XHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzLnB1c2goZGF0YS5ub3ZlbC5zdGF0dXMpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRzZWFyY2hfcmlnaHQuZmluZCgnLmtleXdvcmQgYScpXG5cdFx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGxldCBrID0gZG9tLiQoZWxlbSlcblx0XHRcdFx0XHRcdFx0XHRcdC50ZXh0KClcblx0XHRcdFx0XHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0XHRcdFx0XHRcdC5zcGxpdCgvW1xcL1xcc10vKVxuXHRcdFx0XHRcdFx0XHRcdFx0Lm1hcChmdW5jdGlvbiAocylcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHMudHJpbSgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdC5maWx0ZXIoKHYpID0+IHYpXG5cdFx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzID0gZGF0YS5ub3ZlbC50YWdzLmNvbmNhdChrKTtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0c2VhcmNoX2xlZnRcblx0XHRcdFx0XHRcdFx0LmZpbmQoJ1tjbGFzcyo9XCJuZXdfZ2VucmVcIl0sIC5ub2NnZW5yZScpXG5cdFx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGxldCBrID0gZG9tLiQoZWxlbSlcblx0XHRcdFx0XHRcdFx0XHRcdC50ZXh0KClcblx0XHRcdFx0XHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcblx0XHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAoaylcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MucHVzaChrKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdGRhdGEubGluayA9IGRhdGEubGluayB8fCBbXTtcblxuXHRcdFx0XHRcdFx0ZGF0YS5saW5rLnB1c2goYFske2RvbS51cmwuaG9zdG5hbWV9XSgke2RvbS51cmx9KSAtIOWwj+iqrOWutuOBq+OBquOCjeOBhuOAgOabtOaWsOaDheWgseaknOe0omApO1xuXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gZGF0YTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zb2xlRGVidWcuZ3JheS5lcnJvcihlLnRvU3RyaW5nKCkpO1xuXHRcdFx0XHRcdFx0Y29uc29sZS53YXJuKGDkuIvovInlsI/oqqros4foqIrmmYLnmbznlJ/pjK/oqqQgKDEp77yM5q2k5o+Q6YaS6KiK5oGv5Y+v5Lul54Sh6KaWYCk7XG5cblx0XHRcdFx0XHRcdHJldHVybiB7fTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0YSA9IGF3YWl0IHNlbGYuX2dldEV4dHJhSW5mb1VSTDIodXJsX2RhdGEsIG9wdGlvbnNSdW50aW1lLCBhKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfc2VyaWVzX3RpdGxlOiBzdHJpbmc7XG5cdFx0XHRcdGxldCBub3ZlbF9zeW9zZXR1X3Nlcmllc19pZDogc3RyaW5nO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgX2EgPSBkb20uJCgnI25vdmVsX2NvbnRlbnRzIC5zZXJpZXNfdGl0bGUnKTtcblxuXHRcdFx0XHRcdGxldCB0ID0gX2EudGV4dCgpXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvW1xcclxcblxcdF0rfF5cXHMrfFxccyskL2csICcnKVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdGlmICh0KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdG5vdmVsX3Nlcmllc190aXRsZSA9IHQ7XG5cblx0XHRcdFx0XHRcdF9hID0gX2EuZmluZCgnYScpO1xuXHRcdFx0XHRcdFx0bGV0IF90ID0gX2EuYXR0cignaHJlZicpIHx8ICcnO1xuXG5cdFx0XHRcdFx0XHRpZiAoL1xcLyhcXHd7Nix9KVxcLy9pLmV4ZWMoX3QpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRub3ZlbF9zeW9zZXR1X3Nlcmllc19pZCA9IFJlZ0V4cC4kMTtcblxuXHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdGEubGluayA9IGEubGluayB8fCBbXTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgdGl0bGUgPSBub3ZlbF9zZXJpZXNfdGl0bGVcblx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvW1xcW1xcXVxcflxcYF0vZywgJ1xcXFwkMCcpXG5cdFx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL1tcIiddL2csICcnKVxuXHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRhLmxpbmsucHVzaChgWyR7dGl0bGV9XSgke19hLnByb3AoJ2hyZWYnKX0pYCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKGDntZDmnZ/omZXnkIblsI/oqqros4foqIrku6Xlj4rnq6Dnr4DliJfooahgKTtcblxuXHRcdFx0XHRyZXR1cm4ge1xuXG5cdFx0XHRcdFx0Li4uYSxcblxuXHRcdFx0XHRcdHVybDogZG9tLnVybCxcblx0XHRcdFx0XHR1cmxfZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxuXHRcdFx0XHRcdG5vdmVsX2F1dGhvcixcblxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSxcblx0XHRcdFx0XHRub3ZlbF9wdWJsaXNoZXIsXG5cblx0XHRcdFx0XHRub3ZlbF9zZXJpZXNfdGl0bGUsXG5cdFx0XHRcdFx0bm92ZWxfc3lvc2V0dV9zZXJpZXNfaWQsXG5cblx0XHRcdFx0XHRub3ZlbF9zeW9zZXR1X2lkLFxuXG5cdFx0XHRcdFx0dm9sdW1lX2xpc3QsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlU3lvc2V0dTtcblxuIl19