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
            return url;
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
    makeUrl(urlobj, bool) {
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
    async get_volume_list(url, optionsRuntime = {}) {
        const self = this;
        url = await this.createMainUrl(url);
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
                        href = self.makeUrl(data);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLGdDQUFnQztBQUNoQyxxREFBNEQ7QUFPNUQsNkNBQStEO0FBRy9ELHlDQUFnQztBQUdoQyxvQ0FBMEY7QUFFMUYsb0NBQWtDO0FBRWxDLDhDQUErQztBQUMvQywyQ0FBbUM7QUFFbkMsd0NBQXVEO0FBQ3ZELDBDQUFxRTtBQWtCckUsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBaUIsU0FBUSxhQUFhLENBQUMsU0FBUztJQUk1RCxZQUFZLE9BQXlCLEVBQUUsR0FBRyxJQUFJO1FBRTdDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUV4QixJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUM7SUFDcEUsQ0FBQztJQUVELE9BQU8sQ0FBZ0MsY0FBNkMsRUFBRSxHQUFRO1FBRTdGLGFBQWE7UUFDYixjQUFjLENBQUMsV0FBVyxHQUFHLGNBQWMsQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDO1FBQzlELGFBQWE7UUFDYixjQUFjLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFFMUM7Ozs7OztVQU1FO1FBRUYsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFbkMsNkNBQTZDO1FBRTdDLGNBQWMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUVwQztRQUVILDJEQUEyRDtRQUMzRCx1REFBdUQ7UUFFckQsZ0dBQWdHO1FBRWxHLHdEQUF3RDtRQUN4RCxLQUFLO1FBQ0gsMEdBQTBHO1FBQzVHLEtBQUs7UUFFSCwrSkFBK0o7UUFFL0osT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsUUFBUSxDQUFDLEdBQWlCLEVBQUUsa0JBQW9DLEVBQUU7UUFFakUsT0FB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NUI7QUExekJZLDRDQUFnQjtBQTR6QjdCLGtCQUFlLGdCQUFnQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJqcXVlcnlcIiAvPlxuaW1wb3J0IHsgRW51bU5vdmVsU3RhdHVzIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvL2xpYi9jb25zdCc7XG5pbXBvcnQgeyByZXRyeVJlcXVlc3QgfSBmcm9tICcuLi8uLi9mZXRjaCc7XG5cbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyB0cmltRmlsZW5hbWUgfSBmcm9tICdmcy1pY29udi91dGlsJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAndXBhdGgyJztcbmltcG9ydCBub3ZlbEluZm8sIHsgSU1kY29uZk1ldGEgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgeyBMYXp5Q29va2llLCBMYXp5Q29va2llSmFyIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcbmltcG9ydCB7IGdldEZpbGVQYXRoLCBnZXRWb2x1bWVQYXRoIH0gZnJvbSAnLi4vZnMnO1xuXG5pbXBvcnQgTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIGRlZmF1bHRKU0RPTU9wdGlvbnMsIFNZTUJPTF9DQUNIRSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5cbmltcG9ydCBOb3ZlbFNpdGVEZW1vID0gcmVxdWlyZSgnLi4vZGVtby9iYXNlJyk7XG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xuXG5pbXBvcnQgeyBjb25zb2xlLCBjb25zb2xlRGVidWcgfSBmcm9tICcuLi8uLi91dGlsL2xvZyc7XG5pbXBvcnQgeyBfa2VlcEltYWdlSW5Db250ZXh0LCBrZWVwRm9ybWF0VGFnIH0gZnJvbSAnLi4vLi4vdXRpbC9odG1sJztcbmltcG9ydCB7IGhhc2hTdW0gfSBmcm9tICcuLi8uLi91dGlsL2hhc2gnO1xuXG5leHBvcnQgdHlwZSBJTm92ZWwgPSBOb3ZlbFNpdGVEZW1vLklOb3ZlbCAmIHtcblx0bm92ZWxfc3lvc2V0dV9pZDogc3RyaW5nLFxufTtcblxuZXhwb3J0IHR5cGUgSU9wdGlvbnNQbHVzID0ge1xuXHQvKipcblx0ICog5LiN5L2/55So5bCP6Kqq5a625o+Q5L6b55qEIHR4dCDkuIvovInpgKPntZBcblx0ICovXG5cdGRpc2FibGVUeHRkb3dubG9hZD86IGJvb2xlYW4sXG59XG5cbmV4cG9ydCB0eXBlIElEb3dubG9hZE9wdGlvbnMgPSBOb3ZlbFNpdGVEZW1vLklEb3dubG9hZE9wdGlvbnMgJiBJT3B0aW9uc1BsdXNcbmV4cG9ydCB0eXBlIElPcHRpb25zUnVudGltZSA9IE5vdmVsU2l0ZURlbW8uSU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucyAmIElPcHRpb25zUGx1c1xuXG5Ac3RhdGljSW1wbGVtZW50czxOb3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVTeW9zZXR1Pj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZVN5b3NldHUgZXh0ZW5kcyBOb3ZlbFNpdGVEZW1vLk5vdmVsU2l0ZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gJ3N5b3NldHUnO1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM6IElEb3dubG9hZE9wdGlvbnMsIC4uLmFyZ3YpXG5cdHtcblx0XHRzdXBlcihvcHRpb25zLCAuLi5hcmd2KTtcblxuXHRcdHRoaXMub3B0aW9uc0luaXQucmV0cnlEZWxheSA9IHRoaXMub3B0aW9uc0luaXQucmV0cnlEZWxheSB8fCAyNTAwMDtcblx0fVxuXG5cdHNlc3Npb248VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiwgdXJsOiBVUkwpXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEgPSBvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSB8fCB7fTtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEub3ZlcjE4ID0gJ3llcyc7XG5cblx0XHQvKlxuXHRcdG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhLnNhc2llbm8gPSAwO1xuXHRcdG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhLmxpbmVoZWlnaHQgPSAwO1xuXHRcdG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhLmZvbnRzaXplID0gMDtcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YS5ub3ZlbGxheW91dCA9IDA7XG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEuZml4X21lbnVfYmFyID0gMDtcblx0XHQqL1xuXG5cdFx0c3VwZXIuc2Vzc2lvbihvcHRpb25zUnVudGltZSwgdXJsKTtcblxuXHRcdC8vbGV0IHVybCA9IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0udXJsO1xuXG5cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphclxuXHRcdC8vLnNldENvb2tpZVN5bmMoJ292ZXIxOD15ZXM7IERvbWFpbj0uc3lvc2V0dS5jb207IFBhdGg9LzsgaG9zdE9ubHk9ZmFsc2UnLCB1cmwuaHJlZilcblx0XHQ7XG5cbi8vXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5ydW5TY3JpcHRzID0gJ2Rhbmdlcm91c2x5Jztcbi8vXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS52aXJ0dWFsQ29uc29sZSA9IGZhbHNlO1xuXG5cdFx0Ly9vcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgPSBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgfHwge307XG5cbi8vXHRcdGlmICghb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zLmphcilcbi8vXHRcdHtcblx0XHQvL29wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucy5qYXIgPSBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyLndyYXBGb3JSZXF1ZXN0KCk7XG4vL1x0XHR9XG5cblx0XHQvL29wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS51c2VyQWdlbnQgPSAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzcxLjAuMzU3OC45OCBTYWZhcmkvNTM3LjM2JztcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0ZG93bmxvYWQodXJsOiBzdHJpbmcgfCBVUkwsIGRvd25sb2FkT3B0aW9uczogSURvd25sb2FkT3B0aW9ucyA9IHt9KVxuXHR7XG5cdFx0cmV0dXJuIHN1cGVyLmRvd25sb2FkKHVybCwgZG93bmxvYWRPcHRpb25zKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldCwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlKTogc3RyaW5nXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0aWYgKCFvcHRpb25zUnVudGltZS5kaXNhYmxlVHh0ZG93bmxvYWQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHJldC5ib2R5O1xuXHRcdH1cblxuXHRcdGNvbnN0ICQ6IEpRdWVyeVN0YXRpYyA9IHJldC5kb20uJDtcblxuXHRcdGxldCBfaW1ncyA9ICQoJyNub3ZlbF9wLCAjbm92ZWxfaG9uYnVuLCAjbm92ZWxfYScpXG5cdFx0XHQuZmluZCgnaW1nW3NyY10nKVxuXHRcdDtcblxuXHRcdF9pbWdzXG5cdFx0XHQuZWFjaChmdW5jdGlvbiAoaSwgZWxlbSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IGltZyA9ICQoZWxlbSk7XG5cdFx0XHRcdGxldCBzcmMgPSBpbWcucHJvcCgnc3JjJyk7XG5cblx0XHRcdFx0Y2FjaGUuY2hhcHRlci5pbWdzID0gY2FjaGUuY2hhcHRlci5pbWdzIHx8IFtdO1xuXG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0Y2FjaGUuY2hhcHRlci5pbWdzLnB1c2goc3JjKTtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRjYWNoZS5ub3ZlbC5pbWdzLnB1c2goc3JjKTtcblx0XHRcdH0pXG5cdFx0O1xuXG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lLmtlZXBJbWFnZSlcblx0XHR7XG5cdFx0XHRfa2VlcEltYWdlSW5Db250ZXh0KF9pbWdzLCAkKTtcblx0XHR9XG5cblx0XHRsZXQgYm9keXM6IEpRdWVyeVtdID0gW1xuXHRcdFx0JCgnI25vdmVsX3AnKSxcblx0XHRcdCQoJyNub3ZlbF9ob25idW4nKSxcblx0XHRcdCQoJyNub3ZlbF9hJyksXG5cdFx0XTtcblxuXHRcdGJvZHlzLmZvckVhY2godCA9PiBrZWVwRm9ybWF0VGFnKHQsIHtcblx0XHRcdCQsXG5cdFx0XHRvcHRpb25zUnVudGltZSxcblx0XHR9KSk7XG5cblx0XHRyZXR1cm4gYm9keXMubWFwKHYgPT4gdi50ZXh0KCkpLmZpbHRlcihmdW5jdGlvbiAodilcblx0XHR7XG5cdFx0XHRyZXR1cm4gdjtcblx0XHR9KS5qb2luKCdcXG5cXG49PT09PT09PT09PT09PT09PT1cXG5cXG4nKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfY3JlYXRlQ2hhcHRlclVybDxUID0gSU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4oe1xuXHRcdG5vdmVsLFxuXHRcdHZvbHVtZSxcblx0XHRjaGFwdGVyLFxuXHR9OiB7XG5cdFx0bm92ZWw6IE5vdmVsU2l0ZS5JTm92ZWwsXG5cdFx0dm9sdW1lOiBOb3ZlbFNpdGUuSVZvbHVtZSxcblx0XHRjaGFwdGVyOiBOb3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdH0sIG9wdGlvbnNSdW50aW1lPzogVCAmIElPcHRpb25zUnVudGltZSk6IFVSTFxuXHR7XG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lLmRpc2FibGVUeHRkb3dubG9hZClcblx0XHR7XG5cdFx0XHRsZXQgdXJsID0gdGhpcy5tYWtlVXJsKHtcblx0XHRcdFx0Y2hhcHRlcl9pZDogY2hhcHRlci5jaGFwdGVyX2lkLFxuXHRcdFx0XHRub3ZlbF9pZDogbm92ZWwudXJsX2RhdGEubm92ZWxfaWQsXG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIHVybDtcblx0XHR9XG5cblx0XHRyZXR1cm4gc3VwZXIuX2NyZWF0ZUNoYXB0ZXJVcmwoe1xuXHRcdFx0bm92ZWwsXG5cdFx0XHR2b2x1bWUsXG5cdFx0XHRjaGFwdGVyLFxuXHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBvcHRpb25zID0ge30sIC4uLm9wdHMpXG5cdHtcblx0XHRvcHRpb25zW3RoaXMuSURLRVldID0ge1xuXHRcdFx0dHh0ZG93bmxvYWRfaWQ6IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwubm92ZWxfc3lvc2V0dV9pZCB8fCAnJyxcblx0XHRcdHNlcmllc19pZDogb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbC5ub3ZlbF9zeW9zZXR1X3Nlcmllc19pZCB8fCAnJyxcblx0XHR9O1xuXG5cdFx0cmV0dXJuIHN1cGVyLl9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lLCBvcHRpb25zLCB7XG5cdFx0XHRvcHRpb25zOiB7XG5cdFx0XHRcdHRleHRsYXlvdXQ6IHtcblx0XHRcdFx0XHRhbGxvd19sZjI6IHRydWUsXG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdH0sIC4uLm9wdHMpO1xuXHR9XG5cblx0bWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2wgPzogYm9vbGVhbik6IFVSTFxuXHR7XG5cdFx0bGV0IHN1YmRvbWFpbiA9IHVybG9iai5ub3ZlbF9yMTggPyAnbm92ZWwxOCcgOiAnbmNvZGUnO1xuXG5cdFx0aWYgKHVybG9iai5ub3ZlbF9waWQgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpXG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0cmV0dXJuIG5ldyBVUkwoYGh0dHBzOi8vJHtzdWJkb21haW59LnN5b3NldHUuY29tL3R4dGRvd25sb2FkL2Rsc3RhcnQvbmNvZGUvJHt1cmxvYmoubm92ZWxfcGlkfS8/bm89JHt1cmxvYmouY2hhcHRlcl9pZH0maGFua2FrdT0wJmNvZGU9dXRmLTgma2FpZ3lvPWNybGZgKTtcblx0XHR9XG5cblx0XHRsZXQgcGFkID0gKCFib29sICYmIHVybG9iai5jaGFwdGVyX2lkKSA/IHVybG9iai5jaGFwdGVyX2lkIDogJyc7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG5ldyBVUkwoYGh0dHA6Ly8ke3N1YmRvbWFpbn0uc3lvc2V0dS5jb20vJHt1cmxvYmoubm92ZWxfaWR9LyR7cGFkfWApO1xuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwpOiBOb3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHRsZXQgdXJsb2JqID0ge1xuXHRcdFx0dXJsLFxuXG5cdFx0XHRub3ZlbF9waWQ6IG51bGwsXG5cdFx0XHRub3ZlbF9pZDogbnVsbCxcblx0XHRcdGNoYXB0ZXJfaWQ6IG51bGwsXG5cblx0XHRcdG5vdmVsX3IxODogbnVsbCxcblx0XHR9O1xuXG5cdFx0Ly91cmwgPSB1cmwudG9TdHJpbmcoKTtcblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHVybG9iai51cmwgPSBuZXcgVVJMKHVybCk7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR1cmwgPSB1cmxvYmoudXJsLmhyZWY7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUud2FybihlLnRvU3RyaW5nKCkgKyBgIFwiJHt1cmx9XCJgKTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIHVybCAhPSAnc3RyaW5nJylcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKHVybCk7XG5cdFx0fVxuXG5cdFx0bGV0IHI6IFJlZ0V4cDtcblx0XHRsZXQgbTtcblxuXHRcdHIgPSAvXihuW1xcd117NSw2fSkkLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvKG5vdmVsMTgpXFwuc3lvc2V0dVxcLmNvbS87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfcjE4ID0gbVsxXTtcblx0XHR9XG5cblx0XHRyID0gL3R4dGRvd25sb2FkXFwvZGxzdGFydFxcL25jb2RlXFwvKFxcZCspLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9waWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvXFwuc3lvc2V0dVxcLmNvbVxcLyhuXFx3KykoPzpcXC8/KFxcZCspKT8vO1xuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVsyXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyZXR1cm4gdXJsb2JqO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9mZXRjaENoYXB0ZXI8VD4odXJsOiBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0bGV0IHRyeWVkOiBib29sZWFuO1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IF9mZXRjaENoYXB0ZXIgPSBzdXBlci5fZmV0Y2hDaGFwdGVyO1xuXG5cdFx0cmV0dXJuIHN1cGVyLl9mZXRjaENoYXB0ZXIodXJsLCBvcHRpb25zUnVudGltZSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChyZXQpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChyZXQgPT0gbnVsbCkgcmV0dXJuIHJldDtcblxuXHRcdFx0XHRjb25zdCBkb20gPSByZXQuZG9tO1xuXG5cdFx0XHRcdGlmICghdHJ5ZWQgJiYgZG9tICYmIGRvbS4kKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0XHQvL2NvbnNvbGUuZXJyb3IoYOeEoeazleaIkOWKn+iugOWPliBSMTgg6aCB6Z2iYCwgdXJsLmhyZWYpO1xuXG5cdFx0XHRcdFx0dHJ5ZWQgPSB0cnVlO1xuXG5cdFx0XHRcdFx0dHJ5XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0JCgnI21vZGFsIC55ZXMgI3llczE4JykuY2xpY2soKTtcblx0XHRcdFx0XHRcdCQoJyNtb2RhbCAueWVzICN5ZXMxOCcpWzBdLmNsaWNrKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhdGNoIChlKVxuXHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIuc2V0Q29va2llU3luYygnb3ZlcjE4PXllczsgRG9tYWluPS5zeW9zZXR1LmNvbTsgUGF0aD0vOyBob3N0T25seT1mYWxzZScsIHVybCk7XG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphci5zZXRDb29raWVTeW5jKGBvdmVyMTg9eWVzOyBEb21haW49JHtkb20udXJsLmhvc3R9OyBQYXRoPS87IGhvc3RPbmx5PWZhbHNlYCwgZG9tLnVybCk7XG5cblx0XHRcdFx0XHQvL2NvbnNvbGUuZGVidWcob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphci5nZXRBbGxDb29raWVzKCkpO1xuXG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlZmVycmVyID0gZG9tLnVybDtcblx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgPSBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgfHwge307XG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zLmZvcm0gPSBkb20udXJsO1xuXG5cdFx0XHRcdFx0cmV0dXJuIF9mZXRjaENoYXB0ZXIuY2FsbChzZWxmLCB1cmwsIG9wdGlvbnNSdW50aW1lKVxuXHRcdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJldClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZG9tID0gcmV0LmRvbTtcblx0XHRcdFx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdFx0XHRcdGlmICgkKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5sZW5ndGgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGDnhKHms5XmiJDlip/oroDlj5YgUjE4IOmggemdomAsIHVybC5ocmVmKTtcblxuXHRcdFx0XHRcdFx0XHRcdC8vcHJvY2Vzcy5leGl0KCk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcmV0O1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiByZXQ7XG5cdFx0XHR9KVxuXHR9XG5cblx0YXN5bmMgX25vdmVsMTg8VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KHVybCxcblx0XHRkb206IElKU0RPTSxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fSxcblx0KTogUHJvbWlzZTxJSlNET00+XG5cdHtcblx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRpZiAoISQoJyNub3ZlbF9jb250ZW50cycpLmxlbmd0aCB8fCAkKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhkb20udXJsLCBkb20uX29wdGlvbnMpO1xuXG5cdFx0XHQkKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5jbGljaygpO1xuXG5cdFx0XHRkb20uX29wdGlvbnMucmVxdWVzdE9wdGlvbnMuamFyLnNldENvb2tpZSgnb3ZlcjE4PXllczsgRG9tYWluPS5zeW9zZXR1LmNvbTsgUGF0aD0vOyBob3N0T25seT1mYWxzZScsIHVybCk7XG5cblx0XHRcdC8vY29uc29sZS5sb2coZG9tLnNlcmlhbGl6ZSgpKTtcblxuXHRcdFx0cmV0dXJuIGZyb21VUkwodXJsLCBPYmplY3QuYXNzaWduKG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSwge1xuXG5cdFx0XHRcdC8vY29va2llSmFyOiBkb20uX29wdGlvbnMucmVxdWVzdE9wdGlvbnMuamFyLl9qYXIsXG5cdFx0XHRcdC8vcmVxdWVzdE9wdGlvbnM6IGRvbS5fb3B0aW9ucy5yZXF1ZXN0T3B0aW9ucyxcblxuXHRcdFx0fSBhcyBJRnJvbVVybE9wdGlvbnMpKTtcblx0XHR9XG5cblx0XHQvL2NvbnNvbGUubG9nKGRvbS5fb3B0aW9ucy5yZXF1ZXN0T3B0aW9ucy5qYXIpO1xuXG5cdFx0cmV0dXJuIGRvbTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZ2V0RXh0cmFJbmZvVVJMPFQ+KHNlYXJjaDogc3RyaW5nLFxuXHRcdHVybF9kYXRhOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPixcblx0KVxuXHR7XG5cdFx0bGV0IG9wdGlvbnNKU0RPTSA9IHtcblx0XHRcdC4uLm9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSxcblx0XHRcdHJlcXVlc3RPcHRpb25zOiB7XG5cdFx0XHRcdC4uLm9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyxcblx0XHRcdH0sXG5cdFx0fTtcblxuXHRcdG9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyA9IG9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyB8fCB7fTtcblx0XHRvcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMuZm9sbG93UmVkaXJlY3QgPSB0cnVlO1xuXG5cdFx0bGV0IF9kb21haW4gPSAxID8gJ25hci5qcCcgOiAnZGlwLmpwJztcblxuXHRcdGxldCBfdXJsID0gYGh0dHBzOi8vJHt1cmxfZGF0YS5ub3ZlbF9yMThcblx0XHRcdD8gJ25hcm91MTgnXG5cdFx0XHQ6ICduYXJvdSd9LiR7X2RvbWFpbn0vc2VhcmNoLnBocD90ZXh0PSR7c2VhcmNofSZub3ZlbD1hbGwmZ2VucmU9YWxsJm5ld19nZW5yZT1hbGwmbGVuZ3RoPTAmZG93bj0wJnVwPTEwMGA7XG5cblx0XHRjb25zb2xlRGVidWcuZGVidWcoYOippuWcluWPluW+l+Wwj+iqquebuOmXnOizh+ioiiAoMSlgLCBfdXJsKTtcblxuXHRcdHJldHVybiBmcm9tVVJMKF91cmwsIG9wdGlvbnNKU0RPTSlcblx0fVxuXG5cdHByb3RlY3RlZCBfZ2V0RXh0cmFJbmZvVVJMMjxULCBNIGV4dGVuZHMgUGFydGlhbDxJTm92ZWwgJiBJTWRjb25mTWV0YT4+KHVybF9kYXRhOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPixcblx0XHRkYXRhX21ldGE6IE0sXG5cdCk6IFByb21pc2VCbHVlYmlyZDxNPlxuXHR7XG5cdFx0bGV0IHN1YmRvbWFpbiA9IHVybF9kYXRhLm5vdmVsX3IxOCA/ICdub3ZlbDE4JyA6ICduY29kZSc7XG5cblx0XHRsZXQgaW5mb191cmwgPSBgaHR0cHM6Ly8ke3N1YmRvbWFpbn0uc3lvc2V0dS5jb20vbm92ZWx2aWV3L2luZm90b3AvbmNvZGUvJHt1cmxfZGF0YS5ub3ZlbF9pZH0vYDtcblxuXHRcdGRhdGFfbWV0YSA9IGRhdGFfbWV0YSB8fCAoe30gYXMgTSk7XG5cblx0XHRjb25zb2xlRGVidWcuZGVidWcoYOippuWcluWPluW+l+Wwj+iqquebuOmXnOizh+ioiiAoMilgLCBpbmZvX3VybCk7XG5cblx0XHRyZXR1cm4gZnJvbVVSTChpbmZvX3VybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKGRvbSlcblx0XHRcdHtcblx0XHRcdFx0bGV0ICQgPSBkb20uJDtcblxuXHRcdFx0XHQkKCcjbm92ZWx0YWJsZTEgdHInKVxuXHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uICgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0bGV0IF90ciA9ICQodGhpcyk7XG5cblx0XHRcdFx0XHRcdGxldCBfdGhfdGV4dCA9IFN0cmluZygkKCd0aCcsIF90cikudGV4dCgpKTtcblxuXHRcdFx0XHRcdFx0aWYgKF90aF90ZXh0LmluZGV4T2YoJ+OCreODvOODr+ODvOODiScpICE9IC0xKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwgPSBkYXRhX21ldGEubm92ZWwgfHwge307XG5cdFx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzID0gZGF0YV9tZXRhLm5vdmVsLnRhZ3MgfHwgW107XG5cblx0XHRcdFx0XHRcdFx0bGV0IF90ZF90ZXh0ID0gU3RyaW5nKCQoJ3RkJywgX3RyKS50ZXh0KCkpXG5cdFx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL1xccysvZywgJyAnKVxuXHRcdFx0XHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdF90ZF90ZXh0XG5cdFx0XHRcdFx0XHRcdFx0LnNwbGl0KC9cXHMrLylcblx0XHRcdFx0XHRcdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAodGFnKVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmICh0YWcpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGxldCBfdCA9IHRhZy5zcGxpdCgnLycpLm1hcChzID0+IHMudHJpbSgpKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncy5wdXNoKC4uLl90KTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIGlmIChfdGhfdGV4dC5pbmRleE9mKCfjgrjjg6Pjg7Pjg6snKSAhPSAtMSB8fCBfdGhfdGV4dC5pbmRleE9mKCfmjrLovInjgrXjgqTjg4gnKSAhPSAtMSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsID0gZGF0YV9tZXRhLm5vdmVsIHx8IHt9O1xuXHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncyA9IGRhdGFfbWV0YS5ub3ZlbC50YWdzIHx8IFtdO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBfdGRfdGV4dCA9IFN0cmluZygkKCd0ZCcsIF90cikudGV4dCgpKVxuXHRcdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9cXHMrL2csICcgJylcblx0XHRcdFx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0XHRpZiAoX3RkX3RleHQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncy5wdXNoKF90ZF90ZXh0KVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGxldCBhZ2VfbGltaXQgPSAkKCcjYWdlX2xpbWl0Jyk7XG5cblx0XHRcdFx0aWYgKGFnZV9saW1pdC5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgX3QgPSBhZ2VfbGltaXQudGV4dCgpLnRyaW0oKTtcblxuXHRcdFx0XHRcdGlmIChfdClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwgPSBkYXRhX21ldGEubm92ZWwgfHwge307XG5cdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncyA9IGRhdGFfbWV0YS5ub3ZlbC50YWdzIHx8IFtdO1xuXG5cdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncy5wdXNoKF90KTtcblxuXHRcdFx0XHRcdFx0aWYgKF90Lm1hdGNoKC9yMTgvaSkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzLnB1c2goYG5vdmVsMThgKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkYXRhX21ldGEubGluayA9IGRhdGFfbWV0YS5saW5rIHx8IFtdO1xuXG5cdFx0XHRcdGRhdGFfbWV0YS5saW5rLnB1c2goYFvlsI/oqqzmg4XloLFdKCR7ZG9tLnVybH0pYCk7XG5cblx0XHRcdFx0cmV0dXJuIGRhdGFfbWV0YTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRjb25zb2xlRGVidWcuZ3JheS5lcnJvcihlLnRvU3RyaW5nKCkpO1xuXHRcdFx0XHRjb25zb2xlLndhcm4oYOS4i+i8ieWwj+iqquizh+ioiuaZgueZvOeUn+mMr+iqpCAoMinvvIzmraTmj5DphpLoqIrmga/lj6/ku6XnhKHoppZgKTtcblxuXHRcdFx0XHRyZXR1cm4gZGF0YV9tZXRhO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4odXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge30sXG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHR1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwodXJsIGFzIGFueSk7XG5cblx0XHRjb25zb2xlRGVidWcuZGVidWcoYGdldF92b2x1bWVfbGlzdGAsIHVybC50b1N0cmluZygpKTtcblxuXHRcdHJldHVybiBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gc2VsZi5fbm92ZWwxODxUPih1cmwsIGRvbSwgb3B0aW9uc1J1bnRpbWUpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb206IElKU0RPTSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZURlYnVnLmluZm8oYOmWi+Wni+iZleeQhuWwj+iqquizh+ioiuS7peWPiueroOevgOWIl+ihqGApO1xuXG5cdFx0XHRcdGxldCBub3ZlbF90aXRsZSA9IGRvbS4kKCcubm92ZWxfdGl0bGUnKS50ZXh0KCk7XG5cdFx0XHRcdGxldCBub3ZlbF9hdXRob3IgPSBub3ZlbFRleHQudHJpbShkb21cblx0XHRcdFx0XHQuJCgnLm5vdmVsX3dyaXRlcm5hbWUgYSwgLm5vdmVsX3dyaXRlcm5hbWUnKVxuXHRcdFx0XHRcdC5lcSgtMSlcblx0XHRcdFx0XHQudGV4dCgpKVxuXHRcdFx0XHRcdC5yZXBsYWNlKC9eLirkvZzogIXvvJovLCAnJylcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kZXNjID0gZG9tLiQoJyNub3ZlbF9leCcpLnRleHQoKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfcHVibGlzaGVyID0gc2VsZi5JREtFWTtcblxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKGRvbS51cmwuaHJlZik7XG5cblx0XHRcdFx0bGV0IHZvbHVtZV9saXN0ID0gW10gYXMgTm92ZWxTaXRlLklWb2x1bWVbXTtcblxuXHRcdFx0XHRsZXQgY3VycmVudFZvbHVtZTogTm92ZWxTaXRlLklWb2x1bWU7XG5cblx0XHRcdFx0bGV0IHRhYmxlID0gZG9tLiQoJy5pbmRleF9ib3gnKS5maW5kKCc+IC5jaGFwdGVyX3RpdGxlLCAubm92ZWxfc3VibGlzdDInKTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlX2RhdGVzID0gW107XG5cblx0XHRcdFx0bGV0IG5vdmVsX3N5b3NldHVfaWQ7XG5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRvbS5zZXJpYWxpemUoKSk7XG5cblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKCQoJyNub3ZlbF9mb290ZXInKSk7XG5cblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKCQoJyNub3ZlbF9mb290ZXInKS5maW5kKCcudW5kZXJuYXZpIGFbaHJlZio9XCJ0eHRkb3dubG9hZFwiXScpKTtcblxuXHRcdFx0XHRcdGxldCBtO1xuXHRcdFx0XHRcdGxldCBkdCA9IGRvbS4kKCcjbm92ZWxfZm9vdGVyIC51bmRlcm5hdmkgYVtocmVmKj1cInR4dGRvd25sb2FkXCJdJykucHJvcCgnaHJlZicpO1xuXG5cdFx0XHRcdFx0aWYgKGR0ICYmIChtID0gZHQubWF0Y2goL25jb2RlXFwvKFxcZCspLykpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdG5vdmVsX3N5b3NldHVfaWQgPSBtWzFdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIGlmICghb3B0aW9uc1J1bnRpbWUuZGlzYWJsZVR4dGRvd25sb2FkKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihg5a6Y5pa5IHR4dCDkuIvovInlip/og73pga3npoHnlKjvvIzmiJboq4vkvb/nlKggY29va2llcyDnmbvlhaXvvIzmiJblsIcgZGlzYWJsZVR4dGRvd25sb2FkIOioreeCuiB0cnVlYClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0YWJsZVxuXHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRsZXQgdHIgPSBkb20uJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0aWYgKHRyLmlzKCcuY2hhcHRlcl90aXRsZScpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IHZvbHVtZV9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGU6IHRyLnRleHQoKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyksXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9saXN0OiBbXSxcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKCFjdXJyZW50Vm9sdW1lKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IHZvbHVtZV9saXN0W3ZvbHVtZV9saXN0Lmxlbmd0aF0gPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IHZvbHVtZV9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZTogJ251bGwnLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9saXN0OiBbXSxcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0bGV0IGEgPSB0ci5maW5kKCcuc3VidGl0bGUgYScpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX2RhdGU7XG5cdFx0XHRcdFx0XHRcdGxldCBkZDtcblx0XHRcdFx0XHRcdFx0bGV0IGRhID0gdHIuZmluZCgnLmxvbmdfdXBkYXRlJyk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKGRhLmZpbmQoJ3NwYW5bdGl0bGUqPVwiL1wiXScpLmxlbmd0aClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGRkID0gZGEuZmluZCgnc3Bhblt0aXRsZSo9XCIvXCJdJykuYXR0cigndGl0bGUnKS5yZXBsYWNlKC/mlLnnqL98Xlxccyt8XFxzKyQvZywgJycpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFkZClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGRhLmZpbmQoJyonKS5yZW1vdmUoKTtcblx0XHRcdFx0XHRcdFx0XHRkZCA9IGRhLnRleHQoKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoZGQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2RhdGUgPSBtb21lbnQoZGQsICdZWVlZL01NL0REIEhIOm1tJykubG9jYWwoKTtcblx0XHRcdFx0XHRcdFx0XHRfY2FjaGVfZGF0ZXMucHVzaChjaGFwdGVyX2RhdGUudW5peCgpKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBocmVmID0gYS5wcm9wKCdocmVmJyk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGRhdGEgPSBzZWxmLnBhcnNlVXJsKGhyZWYpO1xuXG5cdFx0XHRcdFx0XHRcdGlmICghZGF0YS5jaGFwdGVyX2lkKVxuXHRcdFx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAodHIuZmluZCgnLmJvb2ttYXJrZXJfbm93JykubGVuZ3RoKVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdFx0XHRcdFx0ICogZml4IGh0dHBzOi8vbmNvZGUuc3lvc2V0dS5jb20vbjc2Mzdkai9cblx0XHRcdFx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKHRyLnByb3AoXCJvdXRlckhUTUxcIikpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGEucHJvcChcIm91dGVySFRNTFwiKSk7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYSk7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZGF0YSk7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coaHJlZik7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYS5hdHRyKCdocmVmJykpO1xuXHRcdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhuZXcgVVJMKGhyZWYsIGRvbS51cmwpKTtcblxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGRvbS5fb3B0aW9ucyk7XG5cblx0XHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGRhdGEgPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR1cmw6IG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0XHRub3ZlbF9waWQ6IG5vdmVsX3N5b3NldHVfaWQgYXMgc3RyaW5nLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkIGFzIHN0cmluZyxcblx0XHRcdFx0XHRcdFx0XHR9IGFzIGFueTtcblxuXHRcdFx0XHRcdFx0XHRcdGhyZWYgPSBzZWxmLm1ha2VVcmwoZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHRkYXRhLnVybCA9IGhyZWY7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lXG5cdFx0XHRcdFx0XHRcdFx0LmNoYXB0ZXJfbGlzdFxuXHRcdFx0XHRcdFx0XHRcdC5wdXNoKHtcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaW5kZXg6IGN1cnJlbnRWb2x1bWUuY2hhcHRlcl9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGU6IGEudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKSxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsOiBocmVmLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmxfZGF0YTogZGF0YSxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfZGF0ZSxcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdF9jYWNoZV9kYXRlcy5zb3J0KCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGUgPSBtb21lbnQudW5peChfY2FjaGVfZGF0ZXNbX2NhY2hlX2RhdGVzLmxlbmd0aCAtIDFdKS5sb2NhbCgpO1xuXG5cdFx0XHRcdGxldCBhID0gYXdhaXQgc2VsZi5fZ2V0RXh0cmFJbmZvVVJMKHVybF9kYXRhLm5vdmVsX2lkLCB1cmxfZGF0YSwgb3B0aW9uc1J1bnRpbWUpXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKGRvbSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgaDIgPSBkb20uJChgZGl2Omhhcyg+IGgyLnNlYXJjaDpoYXMoPiBhW2hyZWYqPVwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIl0pKWApLmVxKDApO1xuXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aDIgPSBkb20uJChgaDI6aGFzKD4gYVtocmVmKj1cIiR7dXJsX2RhdGEubm92ZWxfaWR9XCJdKWApLmVxKDApO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS53YXJuKGBjYW4gbm90IGZvdW5kIGtleXdvcmQgXCIke3VybF9kYXRhLm5vdmVsX2lkfVwiLCB3aWxsIHRyeSB1c2UgdGl0bGUgc2VhcmNoYCk7XG5cblx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdCAqIGh0dHBzOi8vbmFyb3UxOC5uYXIuanAvc2VhcmNoLnBocD90ZXh0PSVFMyU4MyVBOSVFMyU4MyVCMyVFMyU4MiVBRiVFNSU4NiU5MiVFOSU5OSVCQSVFOCU4MCU4NSVFMyU4MSVBRSVFMyU4MiVCOSVFMyU4MyVBRCVFMyU4MyVCQyVFMyU4MyVBOSVFMyU4MiVBNCVFMyU4MyU5NSZub3ZlbD1hbGwmZ2VucmU9YWxsJm5ld19nZW5yZT1hbGwmbGVuZ3RoPTAmZG93bj0wJnVwPTEwMFxuXHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0bGV0IHRpdGxlID0gbm92ZWxfdGl0bGVcblx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvW1xcd++9gS3vvZpdKy9pZywgJyAnKVxuXHRcdFx0XHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9nZXRFeHRyYUluZm9VUkwodGl0bGUsIHVybF9kYXRhLCBvcHRpb25zUnVudGltZSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldHVybiBkb207XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coZG9tLnVybCk7XG5cblx0XHRcdFx0XHRcdGxldCBkYXRhOiBJTWRjb25mTWV0YSA9IHt9O1xuXG5cdFx0XHRcdFx0XHRsZXQgaDIgPSBkb20uJChgZGl2Omhhcyg+IGgyLnNlYXJjaDpoYXMoPiBhW2hyZWYqPVwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIl0pKWApLmVxKDApO1xuXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aDIgPSBkb20uJChgaDI6aGFzKD4gYVtocmVmKj1cIiR7dXJsX2RhdGEubm92ZWxfaWR9XCJdKWApLmVxKDApO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRsZXQgc2VhcmNoX2xlZnQgPSBoMi5uZXh0QWxsKCcuc2VhcmNoX2xlZnQ6ZXEoMCknKS5lcSgwKTtcblx0XHRcdFx0XHRcdGxldCBzZWFyY2hfcmlnaHQgPSBoMi5uZXh0QWxsKCcuc2VhcmNoX3JpZ2h0OmVxKDApJykuZXEoMCk7XG5cblx0XHRcdFx0XHRcdGlmICghc2VhcmNoX2xlZnQubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRzZWFyY2hfbGVmdCA9IGgyLnNpYmxpbmdzKCcuc2VhcmNoX2xlZnQ6ZXEoMCknKS5lcSgwKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKCFzZWFyY2hfcmlnaHQubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRzZWFyY2hfcmlnaHQgPSBoMi5zaWJsaW5ncygnLnNlYXJjaF9yaWdodDplcSgwKScpLmVxKDApO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygxMTExMTExMTExMTExMTExMTExMTEpO1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlLndhcm4oYGNhbiBub3QgZm91bmQga2V5d29yZCBmb3IgJHt1cmxfZGF0YS5ub3ZlbF9pZH1gLCBkb20udXJsKTtcblxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZGF0YTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhzZWFyY2hfbGVmdCk7XG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKHNlYXJjaF9yaWdodCk7XG5cblx0XHRcdFx0XHRcdGRhdGEubm92ZWwgPSB7fTtcblxuXHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC5zdGF0dXMgPSBzZWFyY2hfbGVmdC5maW5kKCcubm92ZWxfdHlwZScpLnRleHQoKS50cmltKCk7XG5cdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MgPSBbXTtcblxuXHRcdFx0XHRcdFx0aWYgKGRhdGEubm92ZWwuc3RhdHVzID09PSAn5a6M57WQ5riIJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC5ub3ZlbF9zdGF0dXMgfD0gRW51bU5vdmVsU3RhdHVzLkFVVEhPUl9ET05FO1xuXG5cdFx0XHRcdFx0XHRcdGRhdGEubm92ZWwudGFncy5wdXNoKGRhdGEubm92ZWwuc3RhdHVzKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0c2VhcmNoX3JpZ2h0LmZpbmQoJy5rZXl3b3JkIGEnKVxuXHRcdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgayA9IGRvbS4kKGVsZW0pXG5cdFx0XHRcdFx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdFx0XHRcdFx0XHQuc3BsaXQoL1tcXC9cXHNdLylcblx0XHRcdFx0XHRcdFx0XHRcdC5tYXAoZnVuY3Rpb24gKHMpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBzLnRyaW0oKTtcblx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHQuZmlsdGVyKCh2KSA9PiB2KVxuXHRcdFx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0XHRcdGRhdGEubm92ZWwudGFncyA9IGRhdGEubm92ZWwudGFncy5jb25jYXQoayk7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdHNlYXJjaF9sZWZ0XG5cdFx0XHRcdFx0XHRcdC5maW5kKCdbY2xhc3MqPVwibmV3X2dlbnJlXCJdLCAubm9jZ2VucmUnKVxuXHRcdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgayA9IGRvbS4kKGVsZW0pXG5cdFx0XHRcdFx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG5cdFx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGspXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzLnB1c2goayk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRkYXRhLmxpbmsgPSBkYXRhLmxpbmsgfHwgW107XG5cblx0XHRcdFx0XHRcdGRhdGEubGluay5wdXNoKGBbJHtkb20udXJsLmhvc3RuYW1lfV0oJHtkb20udXJsfSkgLSDlsI/oqqzlrrbjgavjgarjgo3jgYbjgIDmm7TmlrDmg4XloLHmpJzntKJgKTtcblxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkYXRhKTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGRhdGE7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLmdyYXkuZXJyb3IoZS50b1N0cmluZygpKTtcblx0XHRcdFx0XHRcdGNvbnNvbGUud2Fybihg5LiL6LyJ5bCP6Kqq6LOH6KiK5pmC55m855Sf6Yyv6KqkICgxKe+8jOatpOaPkOmGkuioiuaBr+WPr+S7peeEoeimlmApO1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4ge307XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGEgPSBhd2FpdCBzZWxmLl9nZXRFeHRyYUluZm9VUkwyKHVybF9kYXRhLCBvcHRpb25zUnVudGltZSwgYSk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3Nlcmllc190aXRsZTogc3RyaW5nO1xuXHRcdFx0XHRsZXQgbm92ZWxfc3lvc2V0dV9zZXJpZXNfaWQ6IHN0cmluZztcblxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IF9hID0gZG9tLiQoJyNub3ZlbF9jb250ZW50cyAuc2VyaWVzX3RpdGxlJyk7XG5cblx0XHRcdFx0XHRsZXQgdCA9IF9hLnRleHQoKVxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoL1tcXHJcXG5cXHRdK3xeXFxzK3xcXHMrJC9nLCAnJylcblx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRpZiAodClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRub3ZlbF9zZXJpZXNfdGl0bGUgPSB0O1xuXG5cdFx0XHRcdFx0XHRfYSA9IF9hLmZpbmQoJ2EnKTtcblx0XHRcdFx0XHRcdGxldCBfdCA9IF9hLmF0dHIoJ2hyZWYnKSB8fCAnJztcblxuXHRcdFx0XHRcdFx0aWYgKC9cXC8oXFx3ezYsfSlcXC8vaS5leGVjKF90KSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bm92ZWxfc3lvc2V0dV9zZXJpZXNfaWQgPSBSZWdFeHAuJDE7XG5cblx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRhLmxpbmsgPSBhLmxpbmsgfHwgW107XG5cblx0XHRcdFx0XHRcdFx0bGV0IHRpdGxlID0gbm92ZWxfc2VyaWVzX3RpdGxlXG5cdFx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL1tcXFtcXF1cXH5cXGBdL2csICdcXFxcJDAnKVxuXHRcdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9bXCInXS9nLCAnJylcblx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0YS5saW5rLnB1c2goYFske3RpdGxlfV0oJHtfYS5wcm9wKCdocmVmJyl9KWApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1Zyhg57WQ5p2f6JmV55CG5bCP6Kqq6LOH6KiK5Lul5Y+K56ug56+A5YiX6KGoYCk7XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdC4uLmEsXG5cblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcblx0XHRcdFx0XHRub3ZlbF9hdXRob3IsXG5cblx0XHRcdFx0XHRub3ZlbF9kZXNjLFxuXHRcdFx0XHRcdG5vdmVsX2RhdGUsXG5cdFx0XHRcdFx0bm92ZWxfcHVibGlzaGVyLFxuXG5cdFx0XHRcdFx0bm92ZWxfc2VyaWVzX3RpdGxlLFxuXHRcdFx0XHRcdG5vdmVsX3N5b3NldHVfc2VyaWVzX2lkLFxuXG5cdFx0XHRcdFx0bm92ZWxfc3lvc2V0dV9pZCxcblxuXHRcdFx0XHRcdHZvbHVtZV9saXN0LFxuXG5cdFx0XHRcdFx0Y2hlY2tkYXRlOiBtb21lbnQoKS5sb2NhbCgpLFxuXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdH0gYXMgSU5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZVN5b3NldHU7XG5cbiJdfQ==