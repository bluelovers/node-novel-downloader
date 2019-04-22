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
const const_1 = require("node-novel-info/lib/const");
const jsdom_extra_1 = require("jsdom-extra");
const jsdom_url_1 = require("jsdom-url");
const index_1 = require("../index");
const index_2 = require("../index");
const NovelSiteDemo = require("../demo/base");
const novel_text_1 = require("novel-text");
const log_1 = require("../../util/log");
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
        return [
            ret.dom.$('#novel_p').text(),
            ret.dom.$('#novel_honbun').text(),
            ret.dom.$('#novel_a').text(),
        ].filter(function (v) {
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
        let optionsJSDOM = Object.assign({}, optionsRuntime.optionsJSDOM, { requestOptions: Object.assign({}, optionsRuntime.optionsJSDOM.requestOptions) });
        optionsJSDOM.requestOptions = optionsJSDOM.requestOptions || {};
        optionsJSDOM.requestOptions.followRedirect = true;
        let _domain = 1 ? 'nar.jp' : 'dip.jp';
        return jsdom_extra_1.fromURL(`https://${url_data.novel_r18
            ? 'narou18'
            : 'narou'}.${_domain}/search.php?text=${search}&novel=all&genre=all&new_genre=all&length=0&down=0&up=100`, optionsJSDOM);
    }
    _getExtraInfoURL2(url_data, optionsRuntime, data_meta) {
        let subdomain = url_data.novel_r18 ? 'novel18' : 'ncode';
        let info_url = `https://${subdomain}.syosetu.com/novelview/infotop/ncode/${url_data.novel_id}/`;
        data_meta = data_meta || {};
        return jsdom_extra_1.fromURL(info_url, optionsRuntime.optionsJSDOM)
            .then(function (dom) {
            let $ = dom.$;
            $('#noveltable1 tr')
                .each(function () {
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
                            data_meta.novel.tags.push(tag);
                        }
                    });
                }
                else if (_th_text.indexOf('ジャンル') != -1) {
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
            data_meta.link = data_meta.link || [];
            data_meta.link.push(`[小説情報](${dom.url})`);
            return data_meta;
        })
            .catch(e => {
            log_1.console.error(e);
            log_1.console.error(`can't download novel extra info 2`);
            return data_meta;
        });
    }
    async get_volume_list(url, optionsRuntime = {}) {
        const self = this;
        url = await this.createMainUrl(url);
        return await jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            return self._novel18(url, dom, optionsRuntime);
        })
            .then(async function (dom) {
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
                log_1.console.error(e);
                log_1.console.error(`can't download novel extra info`);
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
            return Object.assign({}, a, { url: dom.url, url_data,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHFEQUE0RDtBQU81RCw2Q0FBK0Q7QUFHL0QseUNBQWdDO0FBR2hDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFFbEMsOENBQStDO0FBQy9DLDJDQUFtQztBQUVuQyx3Q0FBeUM7QUFpQnpDLElBQWEsZ0JBQWdCLEdBQTdCLE1BQWEsZ0JBQWlCLFNBQVEsYUFBYSxDQUFDLFNBQVM7SUFJNUQsWUFBWSxPQUF5QixFQUFFLEdBQUcsSUFBSTtRQUU3QyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFFeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxPQUFPLENBQWdDLGNBQTZDLEVBQUUsR0FBUTtRQUU3RixhQUFhO1FBQ2IsY0FBYyxDQUFDLFdBQVcsR0FBRyxjQUFjLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQztRQUM5RCxhQUFhO1FBQ2IsY0FBYyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBRTFDOzs7Ozs7VUFNRTtRQUVGLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRW5DLDZDQUE2QztRQUU3QyxjQUFjLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FFcEM7UUFFSCwyREFBMkQ7UUFDM0QsdURBQXVEO1FBRXJELGdHQUFnRztRQUVsRyx3REFBd0Q7UUFDeEQsS0FBSztRQUNILDBHQUEwRztRQUM1RyxLQUFLO1FBRUgsK0pBQStKO1FBRS9KLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELFFBQVEsQ0FBQyxHQUFpQixFQUFFLGtCQUFvQyxFQUFFO1FBRWpFLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFH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LFNBQVMsQ0FBQztBQUY3QixnQkFBZ0I7SUFENUIsd0JBQWdCLEVBQWdEOztHQUNwRCxnQkFBZ0IsQ0FvdkI1QjtBQXB2QlksNENBQWdCO0FBc3ZCN0Isa0JBQWUsZ0JBQWdCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFbnVtTm92ZWxTdGF0dXMgfSBmcm9tICdub2RlLW5vdmVsLWluZm8vbGliL2NvbnN0JztcbmltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uLy4uL2ZldGNoJztcblxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IHRyaW1GaWxlbmFtZSB9IGZyb20gJ2ZzLWljb252L3V0aWwnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBub3ZlbEluZm8sIHsgSU1kY29uZk1ldGEgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgeyBMYXp5Q29va2llLCBMYXp5Q29va2llSmFyIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcbmltcG9ydCB7IGdldEZpbGVQYXRoLCBnZXRWb2x1bWVQYXRoIH0gZnJvbSAnLi4vZnMnO1xuXG5pbXBvcnQgTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIGRlZmF1bHRKU0RPTU9wdGlvbnMsIFNZTUJPTF9DQUNIRSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5cbmltcG9ydCBOb3ZlbFNpdGVEZW1vID0gcmVxdWlyZSgnLi4vZGVtby9iYXNlJyk7XG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xuXG5pbXBvcnQgeyBjb25zb2xlIH0gZnJvbSAnLi4vLi4vdXRpbC9sb2cnO1xuXG5leHBvcnQgdHlwZSBJTm92ZWwgPSBOb3ZlbFNpdGVEZW1vLklOb3ZlbCAmIHtcblx0bm92ZWxfc3lvc2V0dV9pZDogc3RyaW5nLFxufTtcblxuZXhwb3J0IHR5cGUgSU9wdGlvbnNQbHVzID0ge1xuXHQvKipcblx0ICog5LiN5L2/55So5bCP6Kqq5a625o+Q5L6b55qEIHR4dCDkuIvovInpgKPntZBcblx0ICovXG5cdGRpc2FibGVUeHRkb3dubG9hZD86IGJvb2xlYW4sXG59XG5cbmV4cG9ydCB0eXBlIElEb3dubG9hZE9wdGlvbnMgPSBOb3ZlbFNpdGVEZW1vLklEb3dubG9hZE9wdGlvbnMgJiBJT3B0aW9uc1BsdXNcbmV4cG9ydCB0eXBlIElPcHRpb25zUnVudGltZSA9IE5vdmVsU2l0ZURlbW8uSU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucyAmIElPcHRpb25zUGx1c1xuXG5Ac3RhdGljSW1wbGVtZW50czxOb3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVTeW9zZXR1Pj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZVN5b3NldHUgZXh0ZW5kcyBOb3ZlbFNpdGVEZW1vLk5vdmVsU2l0ZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gJ3N5b3NldHUnO1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM6IElEb3dubG9hZE9wdGlvbnMsIC4uLmFyZ3YpXG5cdHtcblx0XHRzdXBlcihvcHRpb25zLCAuLi5hcmd2KTtcblxuXHRcdHRoaXMub3B0aW9uc0luaXQucmV0cnlEZWxheSA9IHRoaXMub3B0aW9uc0luaXQucmV0cnlEZWxheSB8fCAyNTAwMDtcblx0fVxuXG5cdHNlc3Npb248VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiwgdXJsOiBVUkwpXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEgPSBvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSB8fCB7fTtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEub3ZlcjE4ID0gJ3llcyc7XG5cblx0XHQvKlxuXHRcdG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhLnNhc2llbm8gPSAwO1xuXHRcdG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhLmxpbmVoZWlnaHQgPSAwO1xuXHRcdG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhLmZvbnRzaXplID0gMDtcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YS5ub3ZlbGxheW91dCA9IDA7XG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEuZml4X21lbnVfYmFyID0gMDtcblx0XHQqL1xuXG5cdFx0c3VwZXIuc2Vzc2lvbihvcHRpb25zUnVudGltZSwgdXJsKTtcblxuXHRcdC8vbGV0IHVybCA9IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0udXJsO1xuXG5cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphclxuXHRcdC8vLnNldENvb2tpZVN5bmMoJ292ZXIxOD15ZXM7IERvbWFpbj0uc3lvc2V0dS5jb207IFBhdGg9LzsgaG9zdE9ubHk9ZmFsc2UnLCB1cmwuaHJlZilcblx0XHQ7XG5cbi8vXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5ydW5TY3JpcHRzID0gJ2Rhbmdlcm91c2x5Jztcbi8vXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS52aXJ0dWFsQ29uc29sZSA9IGZhbHNlO1xuXG5cdFx0Ly9vcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgPSBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgfHwge307XG5cbi8vXHRcdGlmICghb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zLmphcilcbi8vXHRcdHtcblx0XHQvL29wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucy5qYXIgPSBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyLndyYXBGb3JSZXF1ZXN0KCk7XG4vL1x0XHR9XG5cblx0XHQvL29wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS51c2VyQWdlbnQgPSAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzcxLjAuMzU3OC45OCBTYWZhcmkvNTM3LjM2JztcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0ZG93bmxvYWQodXJsOiBzdHJpbmcgfCBVUkwsIGRvd25sb2FkT3B0aW9uczogSURvd25sb2FkT3B0aW9ucyA9IHt9KVxuXHR7XG5cdFx0cmV0dXJuIHN1cGVyLmRvd25sb2FkKHVybCwgZG93bmxvYWRPcHRpb25zKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldCwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlKTogc3RyaW5nXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0aWYgKCFvcHRpb25zUnVudGltZS5kaXNhYmxlVHh0ZG93bmxvYWQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHJldC5ib2R5O1xuXHRcdH1cblxuXHRcdHJldHVybiBbXG5cdFx0XHRyZXQuZG9tLiQoJyNub3ZlbF9wJykudGV4dCgpLFxuXHRcdFx0cmV0LmRvbS4kKCcjbm92ZWxfaG9uYnVuJykudGV4dCgpLFxuXHRcdFx0cmV0LmRvbS4kKCcjbm92ZWxfYScpLnRleHQoKSxcblx0XHRdLmZpbHRlcihmdW5jdGlvbiAodilcblx0XHR7XG5cdFx0XHRyZXR1cm4gdjtcblx0XHR9KS5qb2luKCdcXG5cXG49PT09PT09PT09PT09PT09PT1cXG5cXG4nKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfY3JlYXRlQ2hhcHRlclVybDxUID0gSU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4oe1xuXHRcdG5vdmVsLFxuXHRcdHZvbHVtZSxcblx0XHRjaGFwdGVyLFxuXHR9OiB7XG5cdFx0bm92ZWw6IE5vdmVsU2l0ZS5JTm92ZWwsXG5cdFx0dm9sdW1lOiBOb3ZlbFNpdGUuSVZvbHVtZSxcblx0XHRjaGFwdGVyOiBOb3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdH0sIG9wdGlvbnNSdW50aW1lPzogVCAmIElPcHRpb25zUnVudGltZSk6IFVSTFxuXHR7XG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lLmRpc2FibGVUeHRkb3dubG9hZClcblx0XHR7XG5cdFx0XHRsZXQgdXJsID0gdGhpcy5tYWtlVXJsKHtcblx0XHRcdFx0Y2hhcHRlcl9pZDogY2hhcHRlci5jaGFwdGVyX2lkLFxuXHRcdFx0XHRub3ZlbF9pZDogbm92ZWwudXJsX2RhdGEubm92ZWxfaWQsXG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIHVybDtcblx0XHR9XG5cblx0XHRyZXR1cm4gc3VwZXIuX2NyZWF0ZUNoYXB0ZXJVcmwoe1xuXHRcdFx0bm92ZWwsXG5cdFx0XHR2b2x1bWUsXG5cdFx0XHRjaGFwdGVyLFxuXHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBvcHRpb25zID0ge30sIC4uLm9wdHMpXG5cdHtcblx0XHRvcHRpb25zW3RoaXMuSURLRVldID0ge1xuXHRcdFx0dHh0ZG93bmxvYWRfaWQ6IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwubm92ZWxfc3lvc2V0dV9pZCB8fCAnJyxcblx0XHRcdHNlcmllc19pZDogb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbC5ub3ZlbF9zeW9zZXR1X3Nlcmllc19pZCB8fCAnJyxcblx0XHR9O1xuXG5cdFx0cmV0dXJuIHN1cGVyLl9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lLCBvcHRpb25zLCB7XG5cdFx0XHRvcHRpb25zOiB7XG5cdFx0XHRcdHRleHRsYXlvdXQ6IHtcblx0XHRcdFx0XHRhbGxvd19sZjI6IHRydWUsXG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdH0sIC4uLm9wdHMpO1xuXHR9XG5cblx0bWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2wgPzogYm9vbGVhbik6IFVSTFxuXHR7XG5cdFx0bGV0IHN1YmRvbWFpbiA9IHVybG9iai5ub3ZlbF9yMTggPyAnbm92ZWwxOCcgOiAnbmNvZGUnO1xuXG5cdFx0aWYgKHVybG9iai5ub3ZlbF9waWQgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpXG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0cmV0dXJuIG5ldyBVUkwoYGh0dHBzOi8vJHtzdWJkb21haW59LnN5b3NldHUuY29tL3R4dGRvd25sb2FkL2Rsc3RhcnQvbmNvZGUvJHt1cmxvYmoubm92ZWxfcGlkfS8/bm89JHt1cmxvYmouY2hhcHRlcl9pZH0maGFua2FrdT0wJmNvZGU9dXRmLTgma2FpZ3lvPWNybGZgKTtcblx0XHR9XG5cblx0XHRsZXQgcGFkID0gKCFib29sICYmIHVybG9iai5jaGFwdGVyX2lkKSA/IHVybG9iai5jaGFwdGVyX2lkIDogJyc7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG5ldyBVUkwoYGh0dHA6Ly8ke3N1YmRvbWFpbn0uc3lvc2V0dS5jb20vJHt1cmxvYmoubm92ZWxfaWR9LyR7cGFkfWApO1xuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwpOiBOb3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHRsZXQgdXJsb2JqID0ge1xuXHRcdFx0dXJsLFxuXG5cdFx0XHRub3ZlbF9waWQ6IG51bGwsXG5cdFx0XHRub3ZlbF9pZDogbnVsbCxcblx0XHRcdGNoYXB0ZXJfaWQ6IG51bGwsXG5cblx0XHRcdG5vdmVsX3IxODogbnVsbCxcblx0XHR9O1xuXG5cdFx0Ly91cmwgPSB1cmwudG9TdHJpbmcoKTtcblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHVybG9iai51cmwgPSBuZXcgVVJMKHVybCk7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR1cmwgPSB1cmxvYmoudXJsLmhyZWY7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUud2FybihlLnRvU3RyaW5nKCkgKyBgIFwiJHt1cmx9XCJgKTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIHVybCAhPSAnc3RyaW5nJylcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKHVybCk7XG5cdFx0fVxuXG5cdFx0bGV0IHI6IFJlZ0V4cDtcblx0XHRsZXQgbTtcblxuXHRcdHIgPSAvXihuW1xcd117NSw2fSkkLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvKG5vdmVsMTgpXFwuc3lvc2V0dVxcLmNvbS87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfcjE4ID0gbVsxXTtcblx0XHR9XG5cblx0XHRyID0gL3R4dGRvd25sb2FkXFwvZGxzdGFydFxcL25jb2RlXFwvKFxcZCspLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9waWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvXFwuc3lvc2V0dVxcLmNvbVxcLyhuXFx3KykoPzpcXC8/KFxcZCspKT8vO1xuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVsyXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyZXR1cm4gdXJsb2JqO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9mZXRjaENoYXB0ZXI8VD4odXJsOiBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0bGV0IHRyeWVkOiBib29sZWFuO1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IF9mZXRjaENoYXB0ZXIgPSBzdXBlci5fZmV0Y2hDaGFwdGVyO1xuXG5cdFx0cmV0dXJuIHN1cGVyLl9mZXRjaENoYXB0ZXIodXJsLCBvcHRpb25zUnVudGltZSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChyZXQpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChyZXQgPT0gbnVsbCkgcmV0dXJuIHJldDtcblxuXHRcdFx0XHRjb25zdCBkb20gPSByZXQuZG9tO1xuXG5cdFx0XHRcdGlmICghdHJ5ZWQgJiYgZG9tICYmIGRvbS4kKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0XHQvL2NvbnNvbGUuZXJyb3IoYOeEoeazleaIkOWKn+iugOWPliBSMTgg6aCB6Z2iYCwgdXJsLmhyZWYpO1xuXG5cdFx0XHRcdFx0dHJ5ZWQgPSB0cnVlO1xuXG5cdFx0XHRcdFx0dHJ5XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0JCgnI21vZGFsIC55ZXMgI3llczE4JykuY2xpY2soKTtcblx0XHRcdFx0XHRcdCQoJyNtb2RhbCAueWVzICN5ZXMxOCcpWzBdLmNsaWNrKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhdGNoIChlKVxuXHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIuc2V0Q29va2llU3luYygnb3ZlcjE4PXllczsgRG9tYWluPS5zeW9zZXR1LmNvbTsgUGF0aD0vOyBob3N0T25seT1mYWxzZScsIHVybCk7XG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphci5zZXRDb29raWVTeW5jKGBvdmVyMTg9eWVzOyBEb21haW49JHtkb20udXJsLmhvc3R9OyBQYXRoPS87IGhvc3RPbmx5PWZhbHNlYCwgZG9tLnVybCk7XG5cblx0XHRcdFx0XHQvL2NvbnNvbGUuZGVidWcob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphci5nZXRBbGxDb29raWVzKCkpO1xuXG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlZmVycmVyID0gZG9tLnVybDtcblx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgPSBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgfHwge307XG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zLmZvcm0gPSBkb20udXJsO1xuXG5cdFx0XHRcdFx0cmV0dXJuIF9mZXRjaENoYXB0ZXIuY2FsbChzZWxmLCB1cmwsIG9wdGlvbnNSdW50aW1lKVxuXHRcdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJldClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZG9tID0gcmV0LmRvbTtcblx0XHRcdFx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdFx0XHRcdGlmICgkKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5sZW5ndGgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGDnhKHms5XmiJDlip/oroDlj5YgUjE4IOmggemdomAsIHVybC5ocmVmKTtcblxuXHRcdFx0XHRcdFx0XHRcdC8vcHJvY2Vzcy5leGl0KCk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcmV0O1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiByZXQ7XG5cdFx0XHR9KVxuXHR9XG5cblx0YXN5bmMgX25vdmVsMTg8VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KHVybCxcblx0XHRkb206IElKU0RPTSxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fSxcblx0KTogUHJvbWlzZTxJSlNET00+XG5cdHtcblx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRpZiAoISQoJyNub3ZlbF9jb250ZW50cycpLmxlbmd0aCB8fCAkKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhkb20udXJsLCBkb20uX29wdGlvbnMpO1xuXG5cdFx0XHQkKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5jbGljaygpO1xuXG5cdFx0XHRkb20uX29wdGlvbnMucmVxdWVzdE9wdGlvbnMuamFyLnNldENvb2tpZSgnb3ZlcjE4PXllczsgRG9tYWluPS5zeW9zZXR1LmNvbTsgUGF0aD0vOyBob3N0T25seT1mYWxzZScsIHVybCk7XG5cblx0XHRcdC8vY29uc29sZS5sb2coZG9tLnNlcmlhbGl6ZSgpKTtcblxuXHRcdFx0cmV0dXJuIGZyb21VUkwodXJsLCBPYmplY3QuYXNzaWduKG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSwge1xuXG5cdFx0XHRcdC8vY29va2llSmFyOiBkb20uX29wdGlvbnMucmVxdWVzdE9wdGlvbnMuamFyLl9qYXIsXG5cdFx0XHRcdC8vcmVxdWVzdE9wdGlvbnM6IGRvbS5fb3B0aW9ucy5yZXF1ZXN0T3B0aW9ucyxcblxuXHRcdFx0fSBhcyBJRnJvbVVybE9wdGlvbnMpKTtcblx0XHR9XG5cblx0XHQvL2NvbnNvbGUubG9nKGRvbS5fb3B0aW9ucy5yZXF1ZXN0T3B0aW9ucy5qYXIpO1xuXG5cdFx0cmV0dXJuIGRvbTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZ2V0RXh0cmFJbmZvVVJMPFQ+KHNlYXJjaDogc3RyaW5nLFxuXHRcdHVybF9kYXRhOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPixcblx0KVxuXHR7XG5cdFx0bGV0IG9wdGlvbnNKU0RPTSA9IHtcblx0XHRcdC4uLm9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSxcblx0XHRcdHJlcXVlc3RPcHRpb25zOiB7XG5cdFx0XHRcdC4uLm9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyxcblx0XHRcdH0sXG5cdFx0fTtcblxuXHRcdG9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyA9IG9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyB8fCB7fTtcblx0XHRvcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMuZm9sbG93UmVkaXJlY3QgPSB0cnVlO1xuXG5cdFx0bGV0IF9kb21haW4gPSAxID8gJ25hci5qcCcgOiAnZGlwLmpwJztcblxuXHRcdHJldHVybiBmcm9tVVJMKGBodHRwczovLyR7dXJsX2RhdGEubm92ZWxfcjE4XG5cdFx0XHQ/ICduYXJvdTE4J1xuXHRcdFx0OiAnbmFyb3UnfS4ke19kb21haW59L3NlYXJjaC5waHA/dGV4dD0ke3NlYXJjaH0mbm92ZWw9YWxsJmdlbnJlPWFsbCZuZXdfZ2VucmU9YWxsJmxlbmd0aD0wJmRvd249MCZ1cD0xMDBgLCBvcHRpb25zSlNET00pXG5cdH1cblxuXHRwcm90ZWN0ZWQgX2dldEV4dHJhSW5mb1VSTDI8VCwgTSBleHRlbmRzIFBhcnRpYWw8SU5vdmVsICYgSU1kY29uZk1ldGE+Pih1cmxfZGF0YTogTm92ZWxTaXRlLklQYXJzZVVybCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4sXG5cdFx0ZGF0YV9tZXRhOiBNLFxuXHQpOiBQcm9taXNlQmx1ZWJpcmQ8TT5cblx0e1xuXHRcdGxldCBzdWJkb21haW4gPSB1cmxfZGF0YS5ub3ZlbF9yMTggPyAnbm92ZWwxOCcgOiAnbmNvZGUnO1xuXG5cdFx0bGV0IGluZm9fdXJsID0gYGh0dHBzOi8vJHtzdWJkb21haW59LnN5b3NldHUuY29tL25vdmVsdmlldy9pbmZvdG9wL25jb2RlLyR7dXJsX2RhdGEubm92ZWxfaWR9L2A7XG5cblx0XHRkYXRhX21ldGEgPSBkYXRhX21ldGEgfHwgKHt9IGFzIE0pO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwoaW5mb191cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb20pXG5cdFx0XHR7XG5cdFx0XHRcdGxldCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0JCgnI25vdmVsdGFibGUxIHRyJylcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBfdHIgPSAkKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRsZXQgX3RoX3RleHQgPSBTdHJpbmcoJCgndGgnLCBfdHIpLnRleHQoKSk7XG5cblx0XHRcdFx0XHRcdGlmIChfdGhfdGV4dC5pbmRleE9mKCfjgq3jg7zjg6/jg7zjg4knKSAhPSAtMSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsID0gZGF0YV9tZXRhLm5vdmVsIHx8IHt9O1xuXHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncyA9IGRhdGFfbWV0YS5ub3ZlbC50YWdzIHx8IFtdO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBfdGRfdGV4dCA9IFN0cmluZygkKCd0ZCcsIF90cikudGV4dCgpKVxuXHRcdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9cXHMrL2csICcgJylcblx0XHRcdFx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0XHRfdGRfdGV4dFxuXHRcdFx0XHRcdFx0XHRcdC5zcGxpdCgvXFxzKy8pXG5cdFx0XHRcdFx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKHRhZylcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodGFnKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncy5wdXNoKHRhZylcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIGlmIChfdGhfdGV4dC5pbmRleE9mKCfjgrjjg6Pjg7Pjg6snKSAhPSAtMSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsID0gZGF0YV9tZXRhLm5vdmVsIHx8IHt9O1xuXHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncyA9IGRhdGFfbWV0YS5ub3ZlbC50YWdzIHx8IFtdO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBfdGRfdGV4dCA9IFN0cmluZygkKCd0ZCcsIF90cikudGV4dCgpKVxuXHRcdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9cXHMrL2csICcgJylcblx0XHRcdFx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0XHRpZiAoX3RkX3RleHQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncy5wdXNoKF90ZF90ZXh0KVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGRhdGFfbWV0YS5saW5rID0gZGF0YV9tZXRhLmxpbmsgfHwgW107XG5cblx0XHRcdFx0ZGF0YV9tZXRhLmxpbmsucHVzaChgW+Wwj+iqrOaDheWgsV0oJHtkb20udXJsfSlgKTtcblxuXHRcdFx0XHRyZXR1cm4gZGF0YV9tZXRhO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChlID0+XG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoZSk7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoYGNhbid0IGRvd25sb2FkIG5vdmVsIGV4dHJhIGluZm8gMmApO1xuXG5cdFx0XHRcdHJldHVybiBkYXRhX21ldGE7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0YXN5bmMgZ2V0X3ZvbHVtZV9saXN0PFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPih1cmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fSxcblx0KTogUHJvbWlzZTxJTm92ZWw+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybCh1cmwgYXMgYW55KTtcblxuXHRcdHJldHVybiBhd2FpdCBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gc2VsZi5fbm92ZWwxODxUPih1cmwsIGRvbSwgb3B0aW9uc1J1bnRpbWUpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb206IElKU0RPTSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gZG9tLiQoJy5ub3ZlbF90aXRsZScpLnRleHQoKTtcblx0XHRcdFx0bGV0IG5vdmVsX2F1dGhvciA9IG5vdmVsVGV4dC50cmltKGRvbVxuXHRcdFx0XHRcdC4kKCcubm92ZWxfd3JpdGVybmFtZSBhLCAubm92ZWxfd3JpdGVybmFtZScpXG5cdFx0XHRcdFx0LmVxKC0xKVxuXHRcdFx0XHRcdC50ZXh0KCkpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL14uKuS9nOiAhe+8mi8sICcnKVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2Rlc2MgPSBkb20uJCgnI25vdmVsX2V4JykudGV4dCgpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9wdWJsaXNoZXIgPSBzZWxmLklES0VZO1xuXG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwoZG9tLnVybC5ocmVmKTtcblxuXHRcdFx0XHRsZXQgdm9sdW1lX2xpc3QgPSBbXSBhcyBOb3ZlbFNpdGUuSVZvbHVtZVtdO1xuXG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBOb3ZlbFNpdGUuSVZvbHVtZTtcblxuXHRcdFx0XHRsZXQgdGFibGUgPSBkb20uJCgnLmluZGV4X2JveCcpLmZpbmQoJz4gLmNoYXB0ZXJfdGl0bGUsIC5ub3ZlbF9zdWJsaXN0MicpO1xuXG5cdFx0XHRcdGxldCBfY2FjaGVfZGF0ZXMgPSBbXTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfc3lvc2V0dV9pZDtcblxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coZG9tLnNlcmlhbGl6ZSgpKTtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coJCgnI25vdmVsX2Zvb3RlcicpKTtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coJCgnI25vdmVsX2Zvb3RlcicpLmZpbmQoJy51bmRlcm5hdmkgYVtocmVmKj1cInR4dGRvd25sb2FkXCJdJykpO1xuXG5cdFx0XHRcdFx0bGV0IG07XG5cdFx0XHRcdFx0bGV0IGR0ID0gZG9tLiQoJyNub3ZlbF9mb290ZXIgLnVuZGVybmF2aSBhW2hyZWYqPVwidHh0ZG93bmxvYWRcIl0nKS5wcm9wKCdocmVmJyk7XG5cblx0XHRcdFx0XHRpZiAoZHQgJiYgKG0gPSBkdC5tYXRjaCgvbmNvZGVcXC8oXFxkKykvKSkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bm92ZWxfc3lvc2V0dV9pZCA9IG1bMV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKCFvcHRpb25zUnVudGltZS5kaXNhYmxlVHh0ZG93bmxvYWQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGDlrpjmlrkgdHh0IOS4i+i8ieWKn+iDvemBreemgeeUqO+8jOaIluiri+S9v+eUqCBjb29raWVzIOeZu+WFpe+8jOaIluWwhyBkaXNhYmxlVHh0ZG93bmxvYWQg6Kit54K6IHRydWVgKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRhYmxlXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCB0ciA9IGRvbS4kKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRpZiAodHIuaXMoJy5jaGFwdGVyX3RpdGxlJykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZTogdHIudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoIWN1cnJlbnRWb2x1bWUpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiAnbnVsbCcsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgYSA9IHRyLmZpbmQoJy5zdWJ0aXRsZSBhJyk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfZGF0ZTtcblx0XHRcdFx0XHRcdFx0bGV0IGRkO1xuXHRcdFx0XHRcdFx0XHRsZXQgZGEgPSB0ci5maW5kKCcubG9uZ191cGRhdGUnKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoZGEuZmluZCgnc3Bhblt0aXRsZSo9XCIvXCJdJykubGVuZ3RoKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZGQgPSBkYS5maW5kKCdzcGFuW3RpdGxlKj1cIi9cIl0nKS5hdHRyKCd0aXRsZScpLnJlcGxhY2UoL+aUueeov3xeXFxzK3xcXHMrJC9nLCAnJyk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoIWRkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZGEuZmluZCgnKicpLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0XHRcdGRkID0gZGEudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChkZClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfZGF0ZSA9IG1vbWVudChkZCwgJ1lZWVkvTU0vREQgSEg6bW0nKS5sb2NhbCgpO1xuXHRcdFx0XHRcdFx0XHRcdF9jYWNoZV9kYXRlcy5wdXNoKGNoYXB0ZXJfZGF0ZS51bml4KCkpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0bGV0IGhyZWYgPSBhLnByb3AoJ2hyZWYnKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgZGF0YSA9IHNlbGYucGFyc2VVcmwoaHJlZik7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFkYXRhLmNoYXB0ZXJfaWQpXG5cdFx0XHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0XHRcdGlmICh0ci5maW5kKCcuYm9va21hcmtlcl9ub3cnKS5sZW5ndGgpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdFx0XHQgKiBmaXggaHR0cHM6Ly9uY29kZS5zeW9zZXR1LmNvbS9uNzYzN2RqL1xuXHRcdFx0XHRcdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2codHIucHJvcChcIm91dGVySFRNTFwiKSk7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYS5wcm9wKFwib3V0ZXJIVE1MXCIpKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhocmVmKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhLmF0dHIoJ2hyZWYnKSk7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2cobmV3IFVSTChocmVmLCBkb20udXJsKSk7XG5cblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhkb20uX29wdGlvbnMpO1xuXG5cdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkYXRhID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0dXJsOiBudWxsLFxuXHRcdFx0XHRcdFx0XHRcdFx0bm92ZWxfcGlkOiBub3ZlbF9zeW9zZXR1X2lkIGFzIHN0cmluZyxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCBhcyBzdHJpbmcsXG5cdFx0XHRcdFx0XHRcdFx0fSBhcyBhbnk7XG5cblx0XHRcdFx0XHRcdFx0XHRocmVmID0gc2VsZi5tYWtlVXJsKGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS51cmwgPSBocmVmO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZVxuXHRcdFx0XHRcdFx0XHRcdC5jaGFwdGVyX2xpc3Rcblx0XHRcdFx0XHRcdFx0XHQucHVzaCh7XG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLmNoYXB0ZXJfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlOiBhLnRleHQoKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyksXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybDogaHJlZixcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGE6IGRhdGEsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2RhdGUsXG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRfY2FjaGVfZGF0ZXMuc29ydCgpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlID0gbW9tZW50LnVuaXgoX2NhY2hlX2RhdGVzW19jYWNoZV9kYXRlcy5sZW5ndGggLSAxXSkubG9jYWwoKTtcblxuXHRcdFx0XHRsZXQgYSA9IGF3YWl0IHNlbGYuX2dldEV4dHJhSW5mb1VSTCh1cmxfZGF0YS5ub3ZlbF9pZCwgdXJsX2RhdGEsIG9wdGlvbnNSdW50aW1lKVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb20pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IGgyID0gZG9tLiQoYGRpdjpoYXMoPiBoMi5zZWFyY2g6aGFzKD4gYVtocmVmKj1cIiR7dXJsX2RhdGEubm92ZWxfaWR9XCJdKSlgKS5lcSgwKTtcblxuXHRcdFx0XHRcdFx0aWYgKCFoMi5sZW5ndGgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGgyID0gZG9tLiQoYGgyOmhhcyg+IGFbaHJlZio9XCIke3VybF9kYXRhLm5vdmVsX2lkfVwiXSlgKS5lcSgwKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKCFoMi5sZW5ndGgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUud2FybihgY2FuIG5vdCBmb3VuZCBrZXl3b3JkIFwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIiwgd2lsbCB0cnkgdXNlIHRpdGxlIHNlYXJjaGApO1xuXG5cdFx0XHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdFx0XHQgKiBodHRwczovL25hcm91MTgubmFyLmpwL3NlYXJjaC5waHA/dGV4dD0lRTMlODMlQTklRTMlODMlQjMlRTMlODIlQUYlRTUlODYlOTIlRTklOTklQkElRTglODAlODUlRTMlODElQUUlRTMlODIlQjklRTMlODMlQUQlRTMlODMlQkMlRTMlODMlQTklRTMlODIlQTQlRTMlODMlOTUmbm92ZWw9YWxsJmdlbnJlPWFsbCZuZXdfZ2VucmU9YWxsJmxlbmd0aD0wJmRvd249MCZ1cD0xMDBcblx0XHRcdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0XHRcdGxldCB0aXRsZSA9IG5vdmVsX3RpdGxlXG5cdFx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL1tcXHfvvYEt772aXSsvaWcsICcgJylcblx0XHRcdFx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gc2VsZi5fZ2V0RXh0cmFJbmZvVVJMKHRpdGxlLCB1cmxfZGF0YSwgb3B0aW9uc1J1bnRpbWUpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRyZXR1cm4gZG9tO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKGRvbSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRvbS51cmwpO1xuXG5cdFx0XHRcdFx0XHRsZXQgZGF0YTogSU1kY29uZk1ldGEgPSB7fTtcblxuXHRcdFx0XHRcdFx0bGV0IGgyID0gZG9tLiQoYGRpdjpoYXMoPiBoMi5zZWFyY2g6aGFzKD4gYVtocmVmKj1cIiR7dXJsX2RhdGEubm92ZWxfaWR9XCJdKSlgKS5lcSgwKTtcblxuXHRcdFx0XHRcdFx0aWYgKCFoMi5sZW5ndGgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGgyID0gZG9tLiQoYGgyOmhhcyg+IGFbaHJlZio9XCIke3VybF9kYXRhLm5vdmVsX2lkfVwiXSlgKS5lcSgwKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bGV0IHNlYXJjaF9sZWZ0ID0gaDIubmV4dEFsbCgnLnNlYXJjaF9sZWZ0OmVxKDApJykuZXEoMCk7XG5cdFx0XHRcdFx0XHRsZXQgc2VhcmNoX3JpZ2h0ID0gaDIubmV4dEFsbCgnLnNlYXJjaF9yaWdodDplcSgwKScpLmVxKDApO1xuXG5cdFx0XHRcdFx0XHRpZiAoIXNlYXJjaF9sZWZ0Lmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0c2VhcmNoX2xlZnQgPSBoMi5zaWJsaW5ncygnLnNlYXJjaF9sZWZ0OmVxKDApJykuZXEoMCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICghc2VhcmNoX3JpZ2h0Lmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0c2VhcmNoX3JpZ2h0ID0gaDIuc2libGluZ3MoJy5zZWFyY2hfcmlnaHQ6ZXEoMCknKS5lcSgwKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKCFoMi5sZW5ndGgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coMTExMTExMTExMTExMTExMTExMTExKTtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS53YXJuKGBjYW4gbm90IGZvdW5kIGtleXdvcmQgZm9yICR7dXJsX2RhdGEubm92ZWxfaWR9YCwgZG9tLnVybCk7XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIGRhdGE7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coc2VhcmNoX2xlZnQpO1xuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhzZWFyY2hfcmlnaHQpO1xuXG5cdFx0XHRcdFx0XHRkYXRhLm5vdmVsID0ge307XG5cblx0XHRcdFx0XHRcdGRhdGEubm92ZWwuc3RhdHVzID0gc2VhcmNoX2xlZnQuZmluZCgnLm5vdmVsX3R5cGUnKS50ZXh0KCkudHJpbSgpO1xuXHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzID0gW107XG5cblx0XHRcdFx0XHRcdGlmIChkYXRhLm5vdmVsLnN0YXR1cyA9PT0gJ+WujOe1kOa4iCcpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRhdGEubm92ZWwubm92ZWxfc3RhdHVzIHw9IEVudW1Ob3ZlbFN0YXR1cy5BVVRIT1JfRE9ORTtcblxuXHRcdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MucHVzaChkYXRhLm5vdmVsLnN0YXR1cyk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHNlYXJjaF9yaWdodC5maW5kKCcua2V5d29yZCBhJylcblx0XHRcdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IGsgPSBkb20uJChlbGVtKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnRleHQoKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnNwbGl0KC9bXFwvXFxzXS8pXG5cdFx0XHRcdFx0XHRcdFx0XHQubWFwKGZ1bmN0aW9uIChzKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcy50cmltKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0LmZpbHRlcigodikgPT4gdilcblx0XHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MgPSBkYXRhLm5vdmVsLnRhZ3MuY29uY2F0KGspO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRzZWFyY2hfbGVmdFxuXHRcdFx0XHRcdFx0XHQuZmluZCgnW2NsYXNzKj1cIm5ld19nZW5yZVwiXSwgLm5vY2dlbnJlJylcblx0XHRcdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IGsgPSBkb20uJChlbGVtKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnRleHQoKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxuXHRcdFx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0XHRcdGlmIChrKVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdGRhdGEubm92ZWwudGFncy5wdXNoKGspO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0ZGF0YS5saW5rID0gZGF0YS5saW5rIHx8IFtdO1xuXG5cdFx0XHRcdFx0XHRkYXRhLmxpbmsucHVzaChgWyR7ZG9tLnVybC5ob3N0bmFtZX1dKCR7ZG9tLnVybH0pIC0g5bCP6Kqs5a6244Gr44Gq44KN44GG44CA5pu05paw5oOF5aCx5qSc57SiYCk7XG5cblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coZGF0YSk7XG5cblx0XHRcdFx0XHRcdHJldHVybiBkYXRhO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoZSk7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGBjYW4ndCBkb3dubG9hZCBub3ZlbCBleHRyYSBpbmZvYCk7XG5cblx0XHRcdFx0XHRcdHJldHVybiB7fTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0YSA9IGF3YWl0IHNlbGYuX2dldEV4dHJhSW5mb1VSTDIodXJsX2RhdGEsIG9wdGlvbnNSdW50aW1lLCBhKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfc2VyaWVzX3RpdGxlOiBzdHJpbmc7XG5cdFx0XHRcdGxldCBub3ZlbF9zeW9zZXR1X3Nlcmllc19pZDogc3RyaW5nO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgX2EgPSBkb20uJCgnI25vdmVsX2NvbnRlbnRzIC5zZXJpZXNfdGl0bGUnKTtcblxuXHRcdFx0XHRcdGxldCB0ID0gX2EudGV4dCgpXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvW1xcclxcblxcdF0rfF5cXHMrfFxccyskL2csICcnKVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdGlmICh0KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdG5vdmVsX3Nlcmllc190aXRsZSA9IHQ7XG5cblx0XHRcdFx0XHRcdF9hID0gX2EuZmluZCgnYScpO1xuXHRcdFx0XHRcdFx0bGV0IF90ID0gX2EuYXR0cignaHJlZicpIHx8ICcnO1xuXG5cdFx0XHRcdFx0XHRpZiAoL1xcLyhcXHd7Nix9KVxcLy9pLmV4ZWMoX3QpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRub3ZlbF9zeW9zZXR1X3Nlcmllc19pZCA9IFJlZ0V4cC4kMTtcblxuXHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdGEubGluayA9IGEubGluayB8fCBbXTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgdGl0bGUgPSBub3ZlbF9zZXJpZXNfdGl0bGVcblx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvW1xcW1xcXVxcflxcYF0vZywgJ1xcXFwkMCcpXG5cdFx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL1tcIiddL2csICcnKVxuXHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRhLmxpbmsucHVzaChgWyR7dGl0bGV9XSgke19hLnByb3AoJ2hyZWYnKX0pYCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdC4uLmEsXG5cblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcblx0XHRcdFx0XHRub3ZlbF9hdXRob3IsXG5cblx0XHRcdFx0XHRub3ZlbF9kZXNjLFxuXHRcdFx0XHRcdG5vdmVsX2RhdGUsXG5cdFx0XHRcdFx0bm92ZWxfcHVibGlzaGVyLFxuXG5cdFx0XHRcdFx0bm92ZWxfc2VyaWVzX3RpdGxlLFxuXHRcdFx0XHRcdG5vdmVsX3N5b3NldHVfc2VyaWVzX2lkLFxuXG5cdFx0XHRcdFx0bm92ZWxfc3lvc2V0dV9pZCxcblxuXHRcdFx0XHRcdHZvbHVtZV9saXN0LFxuXG5cdFx0XHRcdFx0Y2hlY2tkYXRlOiBtb21lbnQoKS5sb2NhbCgpLFxuXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdH0gYXMgSU5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZVN5b3NldHU7XG5cbiJdfQ==