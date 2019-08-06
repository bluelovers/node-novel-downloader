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
        const $ = ret.dom.$;
        $('#novel_p, #novel_honbun, #novel_a')
            .find('img[src]')
            .each(function (i, elem) {
            let img = $(elem);
            let src = img.prop('src');
            cache.chapter.imgs = cache.chapter.imgs || [];
            // @ts-ignore
            cache.chapter.imgs.push(src);
            // @ts-ignore
            cache.novel.imgs.push(src);
        });
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
        let optionsJSDOM = Object.assign(Object.assign({}, optionsRuntime.optionsJSDOM), { requestOptions: Object.assign({}, optionsRuntime.optionsJSDOM.requestOptions) });
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
            log_1.console.error(e);
            log_1.console.error(`can't download novel extra info 2`);
            return data_meta;
        });
    }
    async get_volume_list(url, optionsRuntime = {}) {
        const self = this;
        url = await this.createMainUrl(url);
        return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHFEQUE0RDtBQU81RCw2Q0FBK0Q7QUFHL0QseUNBQWdDO0FBR2hDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFFbEMsOENBQStDO0FBQy9DLDJDQUFtQztBQUVuQyx3Q0FBeUM7QUFpQnpDLElBQWEsZ0JBQWdCLEdBQTdCLE1BQWEsZ0JBQWlCLFNBQVEsYUFBYSxDQUFDLFNBQVM7SUFJNUQsWUFBWSxPQUF5QixFQUFFLEdBQUcsSUFBSTtRQUU3QyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFFeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxPQUFPLENBQWdDLGNBQTZDLEVBQUUsR0FBUTtRQUU3RixhQUFhO1FBQ2IsY0FBYyxDQUFDLFdBQVcsR0FBRyxjQUFjLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQztRQUM5RCxhQUFhO1FBQ2IsY0FBYyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBRTFDOzs7Ozs7VUFNRTtRQUVGLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRW5DLDZDQUE2QztRQUU3QyxjQUFjLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FFcEM7UUFFSCwyREFBMkQ7UUFDM0QsdURBQXVEO1FBRXJELGdHQUFnRztRQUVsRyx3REFBd0Q7UUFDeEQsS0FBSztRQUNILDBHQUEwRztRQUM1RyxLQUFLO1FBRUgsK0pBQStKO1FBRS9KLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELFFBQVEsQ0FBQyxHQUFpQixFQUFFLGtCQUFvQyxFQUFFO1FBRWpFLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFH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LEdBQUcsQ0FBQyxHQUFHLEVBQ1osUUFBUTtnQkFFUixXQUFXO2dCQUNYLFlBQVk7Z0JBRVosVUFBVTtnQkFDVixVQUFVO2dCQUNWLGVBQWU7Z0JBRWYsa0JBQWtCO2dCQUNsQix1QkFBdUI7Z0JBRXZCLGdCQUFnQjtnQkFFaEIsV0FBVyxFQUVYLFNBQVMsRUFBRSxjQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFFM0IsSUFBSSxFQUFFLEVBQWMsR0FDVixDQUFDO1FBQ2IsQ0FBQyxDQUFDLENBQ0Q7SUFDSCxDQUFDO0NBRUQsQ0FBQTtBQTd4QnVCLHNCQUFLLEdBQUcsU0FBUyxDQUFDO0FBRjdCLGdCQUFnQjtJQUQ1Qix3QkFBZ0IsRUFBZ0Q7O0dBQ3BELGdCQUFnQixDQSt4QjVCO0FBL3hCWSw0Q0FBZ0I7QUFpeUI3QixrQkFBZSxnQkFBZ0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVudW1Ob3ZlbFN0YXR1cyB9IGZyb20gJ25vZGUtbm92ZWwtaW5mby9saWIvY29uc3QnO1xuaW1wb3J0IHsgcmV0cnlSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vZmV0Y2gnO1xuXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYvdXRpbCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCB7IExhenlDb29raWUsIExhenlDb29raWVKYXIgfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZ2V0RmlsZVBhdGgsIGdldFZvbHVtZVBhdGggfSBmcm9tICcuLi9mcyc7XG5cbmltcG9ydCBOb3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgZGVmYXVsdEpTRE9NT3B0aW9ucywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkLCBibHVlYmlyZERlY29yYXRvciB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IG1vbWVudCB9IGZyb20gJy4uL2luZGV4JztcblxuaW1wb3J0IE5vdmVsU2l0ZURlbW8gPSByZXF1aXJlKCcuLi9kZW1vL2Jhc2UnKTtcbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG5cbmltcG9ydCB7IGNvbnNvbGUgfSBmcm9tICcuLi8uLi91dGlsL2xvZyc7XG5cbmV4cG9ydCB0eXBlIElOb3ZlbCA9IE5vdmVsU2l0ZURlbW8uSU5vdmVsICYge1xuXHRub3ZlbF9zeW9zZXR1X2lkOiBzdHJpbmcsXG59O1xuXG5leHBvcnQgdHlwZSBJT3B0aW9uc1BsdXMgPSB7XG5cdC8qKlxuXHQgKiDkuI3kvb/nlKjlsI/oqqrlrrbmj5DkvpvnmoQgdHh0IOS4i+i8iemAo+e1kFxuXHQgKi9cblx0ZGlzYWJsZVR4dGRvd25sb2FkPzogYm9vbGVhbixcbn1cblxuZXhwb3J0IHR5cGUgSURvd25sb2FkT3B0aW9ucyA9IE5vdmVsU2l0ZURlbW8uSURvd25sb2FkT3B0aW9ucyAmIElPcHRpb25zUGx1c1xuZXhwb3J0IHR5cGUgSU9wdGlvbnNSdW50aW1lID0gTm92ZWxTaXRlRGVtby5JT3B0aW9uc1J1bnRpbWUgJiBJRG93bmxvYWRPcHRpb25zICYgSU9wdGlvbnNQbHVzXG5cbkBzdGF0aWNJbXBsZW1lbnRzPE5vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZVN5b3NldHU+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlU3lvc2V0dSBleHRlbmRzIE5vdmVsU2l0ZURlbW8uTm92ZWxTaXRlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVkgPSAnc3lvc2V0dSc7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogSURvd25sb2FkT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdHN1cGVyKG9wdGlvbnMsIC4uLmFyZ3YpO1xuXG5cdFx0dGhpcy5vcHRpb25zSW5pdC5yZXRyeURlbGF5ID0gdGhpcy5vcHRpb25zSW5pdC5yZXRyeURlbGF5IHx8IDI1MDAwO1xuXHR9XG5cblx0c2Vzc2lvbjxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+LCB1cmw6IFVSTClcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSA9IG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhIHx8IHt9O1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YS5vdmVyMTggPSAneWVzJztcblxuXHRcdC8qXG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEuc2FzaWVubyA9IDA7XG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEubGluZWhlaWdodCA9IDA7XG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEuZm9udHNpemUgPSAwO1xuXHRcdG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhLm5vdmVsbGF5b3V0ID0gMDtcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YS5maXhfbWVudV9iYXIgPSAwO1xuXHRcdCovXG5cblx0XHRzdXBlci5zZXNzaW9uKG9wdGlvbnNSdW50aW1lLCB1cmwpO1xuXG5cdFx0Ly9sZXQgdXJsID0gb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS51cmw7XG5cblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyXG5cdFx0Ly8uc2V0Q29va2llU3luYygnb3ZlcjE4PXllczsgRG9tYWluPS5zeW9zZXR1LmNvbTsgUGF0aD0vOyBob3N0T25seT1mYWxzZScsIHVybC5ocmVmKVxuXHRcdDtcblxuLy9cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJ1blNjcmlwdHMgPSAnZGFuZ2Vyb3VzbHknO1xuLy9cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnZpcnR1YWxDb25zb2xlID0gZmFsc2U7XG5cblx0XHQvL29wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyB8fCB7fTtcblxuLy9cdFx0aWYgKCFvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMuamFyKVxuLy9cdFx0e1xuXHRcdC8vb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zLmphciA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIud3JhcEZvclJlcXVlc3QoKTtcbi8vXHRcdH1cblxuXHRcdC8vb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnVzZXJBZ2VudCA9ICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNzEuMC4zNTc4Ljk4IFNhZmFyaS81MzcuMzYnO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRkb3dubG9hZCh1cmw6IHN0cmluZyB8IFVSTCwgZG93bmxvYWRPcHRpb25zOiBJRG93bmxvYWRPcHRpb25zID0ge30pXG5cdHtcblx0XHRyZXR1cm4gc3VwZXIuZG93bmxvYWQodXJsLCBkb3dubG9hZE9wdGlvbnMpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9wYXJzZUNoYXB0ZXI8VD4ocmV0LCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGUpOiBzdHJpbmdcblx0e1xuXHRcdGlmICghcmV0KVxuXHRcdHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLmRpc2FibGVUeHRkb3dubG9hZClcblx0XHR7XG5cdFx0XHRyZXR1cm4gcmV0LmJvZHk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgJCA9IHJldC5kb20uJDtcblxuXHRcdCQoJyNub3ZlbF9wLCAjbm92ZWxfaG9uYnVuLCAjbm92ZWxfYScpXG5cdFx0XHQuZmluZCgnaW1nW3NyY10nKVxuXHRcdFx0LmVhY2goZnVuY3Rpb24gKGksIGVsZW0pXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBpbWcgPSAkKGVsZW0pO1xuXHRcdFx0XHRsZXQgc3JjID0gaW1nLnByb3AoJ3NyYycpO1xuXG5cdFx0XHRcdGNhY2hlLmNoYXB0ZXIuaW1ncyA9IGNhY2hlLmNoYXB0ZXIuaW1ncyB8fCBbXTtcblxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGNhY2hlLmNoYXB0ZXIuaW1ncy5wdXNoKHNyYyk7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0Y2FjaGUubm92ZWwuaW1ncy5wdXNoKHNyYyk7XG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdHJldHVybiBbXG5cdFx0XHRyZXQuZG9tLiQoJyNub3ZlbF9wJykudGV4dCgpLFxuXHRcdFx0cmV0LmRvbS4kKCcjbm92ZWxfaG9uYnVuJykudGV4dCgpLFxuXHRcdFx0cmV0LmRvbS4kKCcjbm92ZWxfYScpLnRleHQoKSxcblx0XHRdLmZpbHRlcihmdW5jdGlvbiAodilcblx0XHR7XG5cdFx0XHRyZXR1cm4gdjtcblx0XHR9KS5qb2luKCdcXG5cXG49PT09PT09PT09PT09PT09PT1cXG5cXG4nKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfY3JlYXRlQ2hhcHRlclVybDxUID0gSU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4oe1xuXHRcdG5vdmVsLFxuXHRcdHZvbHVtZSxcblx0XHRjaGFwdGVyLFxuXHR9OiB7XG5cdFx0bm92ZWw6IE5vdmVsU2l0ZS5JTm92ZWwsXG5cdFx0dm9sdW1lOiBOb3ZlbFNpdGUuSVZvbHVtZSxcblx0XHRjaGFwdGVyOiBOb3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdH0sIG9wdGlvbnNSdW50aW1lPzogVCAmIElPcHRpb25zUnVudGltZSk6IFVSTFxuXHR7XG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lLmRpc2FibGVUeHRkb3dubG9hZClcblx0XHR7XG5cdFx0XHRsZXQgdXJsID0gdGhpcy5tYWtlVXJsKHtcblx0XHRcdFx0Y2hhcHRlcl9pZDogY2hhcHRlci5jaGFwdGVyX2lkLFxuXHRcdFx0XHRub3ZlbF9pZDogbm92ZWwudXJsX2RhdGEubm92ZWxfaWQsXG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIHVybDtcblx0XHR9XG5cblx0XHRyZXR1cm4gc3VwZXIuX2NyZWF0ZUNoYXB0ZXJVcmwoe1xuXHRcdFx0bm92ZWwsXG5cdFx0XHR2b2x1bWUsXG5cdFx0XHRjaGFwdGVyLFxuXHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBvcHRpb25zID0ge30sIC4uLm9wdHMpXG5cdHtcblx0XHRvcHRpb25zW3RoaXMuSURLRVldID0ge1xuXHRcdFx0dHh0ZG93bmxvYWRfaWQ6IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwubm92ZWxfc3lvc2V0dV9pZCB8fCAnJyxcblx0XHRcdHNlcmllc19pZDogb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbC5ub3ZlbF9zeW9zZXR1X3Nlcmllc19pZCB8fCAnJyxcblx0XHR9O1xuXG5cdFx0cmV0dXJuIHN1cGVyLl9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lLCBvcHRpb25zLCB7XG5cdFx0XHRvcHRpb25zOiB7XG5cdFx0XHRcdHRleHRsYXlvdXQ6IHtcblx0XHRcdFx0XHRhbGxvd19sZjI6IHRydWUsXG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdH0sIC4uLm9wdHMpO1xuXHR9XG5cblx0bWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2wgPzogYm9vbGVhbik6IFVSTFxuXHR7XG5cdFx0bGV0IHN1YmRvbWFpbiA9IHVybG9iai5ub3ZlbF9yMTggPyAnbm92ZWwxOCcgOiAnbmNvZGUnO1xuXG5cdFx0aWYgKHVybG9iai5ub3ZlbF9waWQgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpXG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0cmV0dXJuIG5ldyBVUkwoYGh0dHBzOi8vJHtzdWJkb21haW59LnN5b3NldHUuY29tL3R4dGRvd25sb2FkL2Rsc3RhcnQvbmNvZGUvJHt1cmxvYmoubm92ZWxfcGlkfS8/bm89JHt1cmxvYmouY2hhcHRlcl9pZH0maGFua2FrdT0wJmNvZGU9dXRmLTgma2FpZ3lvPWNybGZgKTtcblx0XHR9XG5cblx0XHRsZXQgcGFkID0gKCFib29sICYmIHVybG9iai5jaGFwdGVyX2lkKSA/IHVybG9iai5jaGFwdGVyX2lkIDogJyc7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG5ldyBVUkwoYGh0dHA6Ly8ke3N1YmRvbWFpbn0uc3lvc2V0dS5jb20vJHt1cmxvYmoubm92ZWxfaWR9LyR7cGFkfWApO1xuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwpOiBOb3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHRsZXQgdXJsb2JqID0ge1xuXHRcdFx0dXJsLFxuXG5cdFx0XHRub3ZlbF9waWQ6IG51bGwsXG5cdFx0XHRub3ZlbF9pZDogbnVsbCxcblx0XHRcdGNoYXB0ZXJfaWQ6IG51bGwsXG5cblx0XHRcdG5vdmVsX3IxODogbnVsbCxcblx0XHR9O1xuXG5cdFx0Ly91cmwgPSB1cmwudG9TdHJpbmcoKTtcblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHVybG9iai51cmwgPSBuZXcgVVJMKHVybCk7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR1cmwgPSB1cmxvYmoudXJsLmhyZWY7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUud2FybihlLnRvU3RyaW5nKCkgKyBgIFwiJHt1cmx9XCJgKTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIHVybCAhPSAnc3RyaW5nJylcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKHVybCk7XG5cdFx0fVxuXG5cdFx0bGV0IHI6IFJlZ0V4cDtcblx0XHRsZXQgbTtcblxuXHRcdHIgPSAvXihuW1xcd117NSw2fSkkLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvKG5vdmVsMTgpXFwuc3lvc2V0dVxcLmNvbS87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfcjE4ID0gbVsxXTtcblx0XHR9XG5cblx0XHRyID0gL3R4dGRvd25sb2FkXFwvZGxzdGFydFxcL25jb2RlXFwvKFxcZCspLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9waWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvXFwuc3lvc2V0dVxcLmNvbVxcLyhuXFx3KykoPzpcXC8/KFxcZCspKT8vO1xuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVsyXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyZXR1cm4gdXJsb2JqO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9mZXRjaENoYXB0ZXI8VD4odXJsOiBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0bGV0IHRyeWVkOiBib29sZWFuO1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IF9mZXRjaENoYXB0ZXIgPSBzdXBlci5fZmV0Y2hDaGFwdGVyO1xuXG5cdFx0cmV0dXJuIHN1cGVyLl9mZXRjaENoYXB0ZXIodXJsLCBvcHRpb25zUnVudGltZSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChyZXQpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChyZXQgPT0gbnVsbCkgcmV0dXJuIHJldDtcblxuXHRcdFx0XHRjb25zdCBkb20gPSByZXQuZG9tO1xuXG5cdFx0XHRcdGlmICghdHJ5ZWQgJiYgZG9tICYmIGRvbS4kKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0XHQvL2NvbnNvbGUuZXJyb3IoYOeEoeazleaIkOWKn+iugOWPliBSMTgg6aCB6Z2iYCwgdXJsLmhyZWYpO1xuXG5cdFx0XHRcdFx0dHJ5ZWQgPSB0cnVlO1xuXG5cdFx0XHRcdFx0dHJ5XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0JCgnI21vZGFsIC55ZXMgI3llczE4JykuY2xpY2soKTtcblx0XHRcdFx0XHRcdCQoJyNtb2RhbCAueWVzICN5ZXMxOCcpWzBdLmNsaWNrKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhdGNoIChlKVxuXHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIuc2V0Q29va2llU3luYygnb3ZlcjE4PXllczsgRG9tYWluPS5zeW9zZXR1LmNvbTsgUGF0aD0vOyBob3N0T25seT1mYWxzZScsIHVybCk7XG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphci5zZXRDb29raWVTeW5jKGBvdmVyMTg9eWVzOyBEb21haW49JHtkb20udXJsLmhvc3R9OyBQYXRoPS87IGhvc3RPbmx5PWZhbHNlYCwgZG9tLnVybCk7XG5cblx0XHRcdFx0XHQvL2NvbnNvbGUuZGVidWcob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphci5nZXRBbGxDb29raWVzKCkpO1xuXG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlZmVycmVyID0gZG9tLnVybDtcblx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgPSBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgfHwge307XG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zLmZvcm0gPSBkb20udXJsO1xuXG5cdFx0XHRcdFx0cmV0dXJuIF9mZXRjaENoYXB0ZXIuY2FsbChzZWxmLCB1cmwsIG9wdGlvbnNSdW50aW1lKVxuXHRcdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJldClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZG9tID0gcmV0LmRvbTtcblx0XHRcdFx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdFx0XHRcdGlmICgkKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5sZW5ndGgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGDnhKHms5XmiJDlip/oroDlj5YgUjE4IOmggemdomAsIHVybC5ocmVmKTtcblxuXHRcdFx0XHRcdFx0XHRcdC8vcHJvY2Vzcy5leGl0KCk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcmV0O1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiByZXQ7XG5cdFx0XHR9KVxuXHR9XG5cblx0YXN5bmMgX25vdmVsMTg8VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KHVybCxcblx0XHRkb206IElKU0RPTSxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fSxcblx0KTogUHJvbWlzZTxJSlNET00+XG5cdHtcblx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRpZiAoISQoJyNub3ZlbF9jb250ZW50cycpLmxlbmd0aCB8fCAkKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhkb20udXJsLCBkb20uX29wdGlvbnMpO1xuXG5cdFx0XHQkKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5jbGljaygpO1xuXG5cdFx0XHRkb20uX29wdGlvbnMucmVxdWVzdE9wdGlvbnMuamFyLnNldENvb2tpZSgnb3ZlcjE4PXllczsgRG9tYWluPS5zeW9zZXR1LmNvbTsgUGF0aD0vOyBob3N0T25seT1mYWxzZScsIHVybCk7XG5cblx0XHRcdC8vY29uc29sZS5sb2coZG9tLnNlcmlhbGl6ZSgpKTtcblxuXHRcdFx0cmV0dXJuIGZyb21VUkwodXJsLCBPYmplY3QuYXNzaWduKG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSwge1xuXG5cdFx0XHRcdC8vY29va2llSmFyOiBkb20uX29wdGlvbnMucmVxdWVzdE9wdGlvbnMuamFyLl9qYXIsXG5cdFx0XHRcdC8vcmVxdWVzdE9wdGlvbnM6IGRvbS5fb3B0aW9ucy5yZXF1ZXN0T3B0aW9ucyxcblxuXHRcdFx0fSBhcyBJRnJvbVVybE9wdGlvbnMpKTtcblx0XHR9XG5cblx0XHQvL2NvbnNvbGUubG9nKGRvbS5fb3B0aW9ucy5yZXF1ZXN0T3B0aW9ucy5qYXIpO1xuXG5cdFx0cmV0dXJuIGRvbTtcblx0fVxuXG5cdHByb3RlY3RlZCBfZ2V0RXh0cmFJbmZvVVJMPFQ+KHNlYXJjaDogc3RyaW5nLFxuXHRcdHVybF9kYXRhOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPixcblx0KVxuXHR7XG5cdFx0bGV0IG9wdGlvbnNKU0RPTSA9IHtcblx0XHRcdC4uLm9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSxcblx0XHRcdHJlcXVlc3RPcHRpb25zOiB7XG5cdFx0XHRcdC4uLm9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyxcblx0XHRcdH0sXG5cdFx0fTtcblxuXHRcdG9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyA9IG9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyB8fCB7fTtcblx0XHRvcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMuZm9sbG93UmVkaXJlY3QgPSB0cnVlO1xuXG5cdFx0bGV0IF9kb21haW4gPSAxID8gJ25hci5qcCcgOiAnZGlwLmpwJztcblxuXHRcdHJldHVybiBmcm9tVVJMKGBodHRwczovLyR7dXJsX2RhdGEubm92ZWxfcjE4XG5cdFx0XHQ/ICduYXJvdTE4J1xuXHRcdFx0OiAnbmFyb3UnfS4ke19kb21haW59L3NlYXJjaC5waHA/dGV4dD0ke3NlYXJjaH0mbm92ZWw9YWxsJmdlbnJlPWFsbCZuZXdfZ2VucmU9YWxsJmxlbmd0aD0wJmRvd249MCZ1cD0xMDBgLCBvcHRpb25zSlNET00pXG5cdH1cblxuXHRwcm90ZWN0ZWQgX2dldEV4dHJhSW5mb1VSTDI8VCwgTSBleHRlbmRzIFBhcnRpYWw8SU5vdmVsICYgSU1kY29uZk1ldGE+Pih1cmxfZGF0YTogTm92ZWxTaXRlLklQYXJzZVVybCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4sXG5cdFx0ZGF0YV9tZXRhOiBNLFxuXHQpOiBQcm9taXNlQmx1ZWJpcmQ8TT5cblx0e1xuXHRcdGxldCBzdWJkb21haW4gPSB1cmxfZGF0YS5ub3ZlbF9yMTggPyAnbm92ZWwxOCcgOiAnbmNvZGUnO1xuXG5cdFx0bGV0IGluZm9fdXJsID0gYGh0dHBzOi8vJHtzdWJkb21haW59LnN5b3NldHUuY29tL25vdmVsdmlldy9pbmZvdG9wL25jb2RlLyR7dXJsX2RhdGEubm92ZWxfaWR9L2A7XG5cblx0XHRkYXRhX21ldGEgPSBkYXRhX21ldGEgfHwgKHt9IGFzIE0pO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwoaW5mb191cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb20pXG5cdFx0XHR7XG5cdFx0XHRcdGxldCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0JCgnI25vdmVsdGFibGUxIHRyJylcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdGxldCBfdHIgPSAkKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRsZXQgX3RoX3RleHQgPSBTdHJpbmcoJCgndGgnLCBfdHIpLnRleHQoKSk7XG5cblx0XHRcdFx0XHRcdGlmIChfdGhfdGV4dC5pbmRleE9mKCfjgq3jg7zjg6/jg7zjg4knKSAhPSAtMSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsID0gZGF0YV9tZXRhLm5vdmVsIHx8IHt9O1xuXHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncyA9IGRhdGFfbWV0YS5ub3ZlbC50YWdzIHx8IFtdO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBfdGRfdGV4dCA9IFN0cmluZygkKCd0ZCcsIF90cikudGV4dCgpKVxuXHRcdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9cXHMrL2csICcgJylcblx0XHRcdFx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0XHRfdGRfdGV4dFxuXHRcdFx0XHRcdFx0XHRcdC5zcGxpdCgvXFxzKy8pXG5cdFx0XHRcdFx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKHRhZylcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodGFnKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRsZXQgX3QgPSB0YWcuc3BsaXQoJy8nKS5tYXAocyA9PiBzLnRyaW0oKSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MucHVzaCguLi5fdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoX3RoX3RleHQuaW5kZXhPZign44K444Oj44Oz44OrJykgIT0gLTEgfHwgX3RoX3RleHQuaW5kZXhPZign5o6y6LyJ44K144Kk44OIJykgIT0gLTEpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbCA9IGRhdGFfbWV0YS5ub3ZlbCB8fCB7fTtcblx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MgPSBkYXRhX21ldGEubm92ZWwudGFncyB8fCBbXTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgX3RkX3RleHQgPSBTdHJpbmcoJCgndGQnLCBfdHIpLnRleHQoKSlcblx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvXFxzKy9nLCAnICcpXG5cdFx0XHRcdFx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0aWYgKF90ZF90ZXh0KVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MucHVzaChfdGRfdGV4dClcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgYWdlX2xpbWl0ID0gJCgnI2FnZV9saW1pdCcpO1xuXG5cdFx0XHRcdGlmIChhZ2VfbGltaXQubGVuZ3RoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IF90ID0gYWdlX2xpbWl0LnRleHQoKS50cmltKCk7XG5cblx0XHRcdFx0XHRpZiAoX3QpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsID0gZGF0YV9tZXRhLm5vdmVsIHx8IHt9O1xuXHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MgPSBkYXRhX21ldGEubm92ZWwudGFncyB8fCBbXTtcblxuXHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MucHVzaChfdCk7XG5cblx0XHRcdFx0XHRcdGlmIChfdC5tYXRjaCgvcjE4L2kpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncy5wdXNoKGBub3ZlbDE4YCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZGF0YV9tZXRhLmxpbmsgPSBkYXRhX21ldGEubGluayB8fCBbXTtcblxuXHRcdFx0XHRkYXRhX21ldGEubGluay5wdXNoKGBb5bCP6Kqs5oOF5aCxXSgke2RvbS51cmx9KWApO1xuXG5cdFx0XHRcdHJldHVybiBkYXRhX21ldGE7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGUgPT5cblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZS5lcnJvcihlKTtcblx0XHRcdFx0Y29uc29sZS5lcnJvcihgY2FuJ3QgZG93bmxvYWQgbm92ZWwgZXh0cmEgaW5mbyAyYCk7XG5cblx0XHRcdFx0cmV0dXJuIGRhdGFfbWV0YTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRhc3luYyBnZXRfdm9sdW1lX2xpc3Q8VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KHVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9LFxuXHQpOiBQcm9taXNlPElOb3ZlbD5cblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0dXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKHVybCBhcyBhbnkpO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBzZWxmLl9ub3ZlbDE4PFQ+KHVybCwgZG9tLCBvcHRpb25zUnVudGltZSk7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgbm92ZWxfdGl0bGUgPSBkb20uJCgnLm5vdmVsX3RpdGxlJykudGV4dCgpO1xuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yID0gbm92ZWxUZXh0LnRyaW0oZG9tXG5cdFx0XHRcdFx0LiQoJy5ub3ZlbF93cml0ZXJuYW1lIGEsIC5ub3ZlbF93cml0ZXJuYW1lJylcblx0XHRcdFx0XHQuZXEoLTEpXG5cdFx0XHRcdFx0LnRleHQoKSlcblx0XHRcdFx0XHQucmVwbGFjZSgvXi4q5L2c6ICF77yaLywgJycpXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYyA9IGRvbS4kKCcjbm92ZWxfZXgnKS50ZXh0KCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3B1Ymxpc2hlciA9IHNlbGYuSURLRVk7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybChkb20udXJsLmhyZWYpO1xuXG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIE5vdmVsU2l0ZS5JVm9sdW1lW107XG5cblx0XHRcdFx0bGV0IGN1cnJlbnRWb2x1bWU6IE5vdmVsU2l0ZS5JVm9sdW1lO1xuXG5cdFx0XHRcdGxldCB0YWJsZSA9IGRvbS4kKCcuaW5kZXhfYm94JykuZmluZCgnPiAuY2hhcHRlcl90aXRsZSwgLm5vdmVsX3N1Ymxpc3QyJyk7XG5cblx0XHRcdFx0bGV0IF9jYWNoZV9kYXRlcyA9IFtdO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9zeW9zZXR1X2lkO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb20uc2VyaWFsaXplKCkpO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygkKCcjbm92ZWxfZm9vdGVyJykpO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygkKCcjbm92ZWxfZm9vdGVyJykuZmluZCgnLnVuZGVybmF2aSBhW2hyZWYqPVwidHh0ZG93bmxvYWRcIl0nKSk7XG5cblx0XHRcdFx0XHRsZXQgbTtcblx0XHRcdFx0XHRsZXQgZHQgPSBkb20uJCgnI25vdmVsX2Zvb3RlciAudW5kZXJuYXZpIGFbaHJlZio9XCJ0eHRkb3dubG9hZFwiXScpLnByb3AoJ2hyZWYnKTtcblxuXHRcdFx0XHRcdGlmIChkdCAmJiAobSA9IGR0Lm1hdGNoKC9uY29kZVxcLyhcXGQrKS8pKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRub3ZlbF9zeW9zZXR1X2lkID0gbVsxXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoIW9wdGlvbnNSdW50aW1lLmRpc2FibGVUeHRkb3dubG9hZClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYOWumOaWuSB0eHQg5LiL6LyJ5Yqf6IO96YGt56aB55So77yM5oiW6KuL5L2/55SoIGNvb2tpZXMg55m75YWl77yM5oiW5bCHIGRpc2FibGVUeHRkb3dubG9hZCDoqK3ngrogdHJ1ZWApXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGFibGVcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0bGV0IHRyID0gZG9tLiQodGhpcyk7XG5cblx0XHRcdFx0XHRcdGlmICh0ci5pcygnLmNoYXB0ZXJfdGl0bGUnKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IHZvbHVtZV9saXN0W3ZvbHVtZV9saXN0Lmxlbmd0aF0gPSB7XG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiB2b2x1bWVfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiB0ci50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogW10sXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmICghY3VycmVudFZvbHVtZSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiB2b2x1bWVfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGU6ICdudWxsJyxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogW10sXG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBhID0gdHIuZmluZCgnLnN1YnRpdGxlIGEnKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl9kYXRlO1xuXHRcdFx0XHRcdFx0XHRsZXQgZGQ7XG5cdFx0XHRcdFx0XHRcdGxldCBkYSA9IHRyLmZpbmQoJy5sb25nX3VwZGF0ZScpO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChkYS5maW5kKCdzcGFuW3RpdGxlKj1cIi9cIl0nKS5sZW5ndGgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkZCA9IGRhLmZpbmQoJ3NwYW5bdGl0bGUqPVwiL1wiXScpLmF0dHIoJ3RpdGxlJykucmVwbGFjZSgv5pS556i/fF5cXHMrfFxccyskL2csICcnKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmICghZGQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkYS5maW5kKCcqJykucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHRcdFx0ZGQgPSBkYS50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKGRkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9kYXRlID0gbW9tZW50KGRkLCAnWVlZWS9NTS9ERCBISDptbScpLmxvY2FsKCk7XG5cdFx0XHRcdFx0XHRcdFx0X2NhY2hlX2RhdGVzLnB1c2goY2hhcHRlcl9kYXRlLnVuaXgoKSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgaHJlZiA9IGEucHJvcCgnaHJlZicpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBkYXRhID0gc2VsZi5wYXJzZVVybChocmVmKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIWRhdGEuY2hhcHRlcl9pZClcblx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHRyLmZpbmQoJy5ib29rbWFya2VyX25vdycpLmxlbmd0aClcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdFx0XHRcdCAqIGZpeCBodHRwczovL25jb2RlLnN5b3NldHUuY29tL243NjM3ZGovXG5cdFx0XHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyh0ci5wcm9wKFwib3V0ZXJIVE1MXCIpKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhLnByb3AoXCJvdXRlckhUTUxcIikpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGEpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGhyZWYpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGEuYXR0cignaHJlZicpKTtcblx0XHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2cobmV3IFVSTChocmVmLCBkb20udXJsKSk7XG5cblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhkb20uX29wdGlvbnMpO1xuXG5cdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkYXRhID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0dXJsOiBudWxsLFxuXHRcdFx0XHRcdFx0XHRcdFx0bm92ZWxfcGlkOiBub3ZlbF9zeW9zZXR1X2lkIGFzIHN0cmluZyxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCBhcyBzdHJpbmcsXG5cdFx0XHRcdFx0XHRcdFx0fSBhcyBhbnk7XG5cblx0XHRcdFx0XHRcdFx0XHRocmVmID0gc2VsZi5tYWtlVXJsKGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS51cmwgPSBocmVmO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZVxuXHRcdFx0XHRcdFx0XHRcdC5jaGFwdGVyX2xpc3Rcblx0XHRcdFx0XHRcdFx0XHQucHVzaCh7XG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLmNoYXB0ZXJfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlOiBhLnRleHQoKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyksXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybDogaHJlZixcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGE6IGRhdGEsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2RhdGUsXG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRfY2FjaGVfZGF0ZXMuc29ydCgpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlID0gbW9tZW50LnVuaXgoX2NhY2hlX2RhdGVzW19jYWNoZV9kYXRlcy5sZW5ndGggLSAxXSkubG9jYWwoKTtcblxuXHRcdFx0XHRsZXQgYSA9IGF3YWl0IHNlbGYuX2dldEV4dHJhSW5mb1VSTCh1cmxfZGF0YS5ub3ZlbF9pZCwgdXJsX2RhdGEsIG9wdGlvbnNSdW50aW1lKVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb20pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IGgyID0gZG9tLiQoYGRpdjpoYXMoPiBoMi5zZWFyY2g6aGFzKD4gYVtocmVmKj1cIiR7dXJsX2RhdGEubm92ZWxfaWR9XCJdKSlgKS5lcSgwKTtcblxuXHRcdFx0XHRcdFx0aWYgKCFoMi5sZW5ndGgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGgyID0gZG9tLiQoYGgyOmhhcyg+IGFbaHJlZio9XCIke3VybF9kYXRhLm5vdmVsX2lkfVwiXSlgKS5lcSgwKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKCFoMi5sZW5ndGgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUud2FybihgY2FuIG5vdCBmb3VuZCBrZXl3b3JkIFwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIiwgd2lsbCB0cnkgdXNlIHRpdGxlIHNlYXJjaGApO1xuXG5cdFx0XHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdFx0XHQgKiBodHRwczovL25hcm91MTgubmFyLmpwL3NlYXJjaC5waHA/dGV4dD0lRTMlODMlQTklRTMlODMlQjMlRTMlODIlQUYlRTUlODYlOTIlRTklOTklQkElRTglODAlODUlRTMlODElQUUlRTMlODIlQjklRTMlODMlQUQlRTMlODMlQkMlRTMlODMlQTklRTMlODIlQTQlRTMlODMlOTUmbm92ZWw9YWxsJmdlbnJlPWFsbCZuZXdfZ2VucmU9YWxsJmxlbmd0aD0wJmRvd249MCZ1cD0xMDBcblx0XHRcdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0XHRcdGxldCB0aXRsZSA9IG5vdmVsX3RpdGxlXG5cdFx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL1tcXHfvvYEt772aXSsvaWcsICcgJylcblx0XHRcdFx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gc2VsZi5fZ2V0RXh0cmFJbmZvVVJMKHRpdGxlLCB1cmxfZGF0YSwgb3B0aW9uc1J1bnRpbWUpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRyZXR1cm4gZG9tO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKGRvbSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRvbS51cmwpO1xuXG5cdFx0XHRcdFx0XHRsZXQgZGF0YTogSU1kY29uZk1ldGEgPSB7fTtcblxuXHRcdFx0XHRcdFx0bGV0IGgyID0gZG9tLiQoYGRpdjpoYXMoPiBoMi5zZWFyY2g6aGFzKD4gYVtocmVmKj1cIiR7dXJsX2RhdGEubm92ZWxfaWR9XCJdKSlgKS5lcSgwKTtcblxuXHRcdFx0XHRcdFx0aWYgKCFoMi5sZW5ndGgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGgyID0gZG9tLiQoYGgyOmhhcyg+IGFbaHJlZio9XCIke3VybF9kYXRhLm5vdmVsX2lkfVwiXSlgKS5lcSgwKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bGV0IHNlYXJjaF9sZWZ0ID0gaDIubmV4dEFsbCgnLnNlYXJjaF9sZWZ0OmVxKDApJykuZXEoMCk7XG5cdFx0XHRcdFx0XHRsZXQgc2VhcmNoX3JpZ2h0ID0gaDIubmV4dEFsbCgnLnNlYXJjaF9yaWdodDplcSgwKScpLmVxKDApO1xuXG5cdFx0XHRcdFx0XHRpZiAoIXNlYXJjaF9sZWZ0Lmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0c2VhcmNoX2xlZnQgPSBoMi5zaWJsaW5ncygnLnNlYXJjaF9sZWZ0OmVxKDApJykuZXEoMCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICghc2VhcmNoX3JpZ2h0Lmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0c2VhcmNoX3JpZ2h0ID0gaDIuc2libGluZ3MoJy5zZWFyY2hfcmlnaHQ6ZXEoMCknKS5lcSgwKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKCFoMi5sZW5ndGgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coMTExMTExMTExMTExMTExMTExMTExKTtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS53YXJuKGBjYW4gbm90IGZvdW5kIGtleXdvcmQgZm9yICR7dXJsX2RhdGEubm92ZWxfaWR9YCwgZG9tLnVybCk7XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIGRhdGE7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coc2VhcmNoX2xlZnQpO1xuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhzZWFyY2hfcmlnaHQpO1xuXG5cdFx0XHRcdFx0XHRkYXRhLm5vdmVsID0ge307XG5cblx0XHRcdFx0XHRcdGRhdGEubm92ZWwuc3RhdHVzID0gc2VhcmNoX2xlZnQuZmluZCgnLm5vdmVsX3R5cGUnKS50ZXh0KCkudHJpbSgpO1xuXHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzID0gW107XG5cblx0XHRcdFx0XHRcdGlmIChkYXRhLm5vdmVsLnN0YXR1cyA9PT0gJ+WujOe1kOa4iCcpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRhdGEubm92ZWwubm92ZWxfc3RhdHVzIHw9IEVudW1Ob3ZlbFN0YXR1cy5BVVRIT1JfRE9ORTtcblxuXHRcdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MucHVzaChkYXRhLm5vdmVsLnN0YXR1cyk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHNlYXJjaF9yaWdodC5maW5kKCcua2V5d29yZCBhJylcblx0XHRcdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IGsgPSBkb20uJChlbGVtKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnRleHQoKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnNwbGl0KC9bXFwvXFxzXS8pXG5cdFx0XHRcdFx0XHRcdFx0XHQubWFwKGZ1bmN0aW9uIChzKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcy50cmltKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0LmZpbHRlcigodikgPT4gdilcblx0XHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MgPSBkYXRhLm5vdmVsLnRhZ3MuY29uY2F0KGspO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRzZWFyY2hfbGVmdFxuXHRcdFx0XHRcdFx0XHQuZmluZCgnW2NsYXNzKj1cIm5ld19nZW5yZVwiXSwgLm5vY2dlbnJlJylcblx0XHRcdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IGsgPSBkb20uJChlbGVtKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnRleHQoKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxuXHRcdFx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0XHRcdGlmIChrKVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdGRhdGEubm92ZWwudGFncy5wdXNoKGspO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0ZGF0YS5saW5rID0gZGF0YS5saW5rIHx8IFtdO1xuXG5cdFx0XHRcdFx0XHRkYXRhLmxpbmsucHVzaChgWyR7ZG9tLnVybC5ob3N0bmFtZX1dKCR7ZG9tLnVybH0pIC0g5bCP6Kqs5a6244Gr44Gq44KN44GG44CA5pu05paw5oOF5aCx5qSc57SiYCk7XG5cblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coZGF0YSk7XG5cblx0XHRcdFx0XHRcdHJldHVybiBkYXRhO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoZSk7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGBjYW4ndCBkb3dubG9hZCBub3ZlbCBleHRyYSBpbmZvYCk7XG5cblx0XHRcdFx0XHRcdHJldHVybiB7fTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0YSA9IGF3YWl0IHNlbGYuX2dldEV4dHJhSW5mb1VSTDIodXJsX2RhdGEsIG9wdGlvbnNSdW50aW1lLCBhKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfc2VyaWVzX3RpdGxlOiBzdHJpbmc7XG5cdFx0XHRcdGxldCBub3ZlbF9zeW9zZXR1X3Nlcmllc19pZDogc3RyaW5nO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgX2EgPSBkb20uJCgnI25vdmVsX2NvbnRlbnRzIC5zZXJpZXNfdGl0bGUnKTtcblxuXHRcdFx0XHRcdGxldCB0ID0gX2EudGV4dCgpXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvW1xcclxcblxcdF0rfF5cXHMrfFxccyskL2csICcnKVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdGlmICh0KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdG5vdmVsX3Nlcmllc190aXRsZSA9IHQ7XG5cblx0XHRcdFx0XHRcdF9hID0gX2EuZmluZCgnYScpO1xuXHRcdFx0XHRcdFx0bGV0IF90ID0gX2EuYXR0cignaHJlZicpIHx8ICcnO1xuXG5cdFx0XHRcdFx0XHRpZiAoL1xcLyhcXHd7Nix9KVxcLy9pLmV4ZWMoX3QpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRub3ZlbF9zeW9zZXR1X3Nlcmllc19pZCA9IFJlZ0V4cC4kMTtcblxuXHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdGEubGluayA9IGEubGluayB8fCBbXTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgdGl0bGUgPSBub3ZlbF9zZXJpZXNfdGl0bGVcblx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvW1xcW1xcXVxcflxcYF0vZywgJ1xcXFwkMCcpXG5cdFx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL1tcIiddL2csICcnKVxuXHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRhLmxpbmsucHVzaChgWyR7dGl0bGV9XSgke19hLnByb3AoJ2hyZWYnKX0pYCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdC4uLmEsXG5cblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcblx0XHRcdFx0XHRub3ZlbF9hdXRob3IsXG5cblx0XHRcdFx0XHRub3ZlbF9kZXNjLFxuXHRcdFx0XHRcdG5vdmVsX2RhdGUsXG5cdFx0XHRcdFx0bm92ZWxfcHVibGlzaGVyLFxuXG5cdFx0XHRcdFx0bm92ZWxfc2VyaWVzX3RpdGxlLFxuXHRcdFx0XHRcdG5vdmVsX3N5b3NldHVfc2VyaWVzX2lkLFxuXG5cdFx0XHRcdFx0bm92ZWxfc3lvc2V0dV9pZCxcblxuXHRcdFx0XHRcdHZvbHVtZV9saXN0LFxuXG5cdFx0XHRcdFx0Y2hlY2tkYXRlOiBtb21lbnQoKS5sb2NhbCgpLFxuXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdH0gYXMgSU5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZVN5b3NldHU7XG5cbiJdfQ==