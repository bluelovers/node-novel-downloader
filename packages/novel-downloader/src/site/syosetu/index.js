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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHFEQUE0RDtBQU81RCw2Q0FBK0Q7QUFHL0QseUNBQWdDO0FBR2hDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFFbEMsOENBQStDO0FBQy9DLDJDQUFtQztBQUVuQyx3Q0FBeUM7QUFpQnpDLElBQWEsZ0JBQWdCLEdBQTdCLE1BQWEsZ0JBQWlCLFNBQVEsYUFBYSxDQUFDLFNBQVM7SUFJNUQsWUFBWSxPQUF5QixFQUFFLEdBQUcsSUFBSTtRQUU3QyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFFeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxPQUFPLENBQWdDLGNBQTZDLEVBQUUsR0FBUTtRQUU3RixhQUFhO1FBQ2IsY0FBYyxDQUFDLFdBQVcsR0FBRyxjQUFjLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQztRQUM5RCxjQUFjLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFFMUM7Ozs7OztVQU1FO1FBRUYsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFbkMsNkNBQTZDO1FBRTdDLGNBQWMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUVwQztRQUVILDJEQUEyRDtRQUMzRCx1REFBdUQ7UUFFckQsZ0dBQWdHO1FBRWxHLHdEQUF3RDtRQUN4RCxLQUFLO1FBQ0YsMEdBQTBHO1FBQzdHLEtBQUs7UUFFSCwrSkFBK0o7UUFFL0osT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsUUFBUSxDQUFDLEdBQWlCLEVBQUUsa0JBQW9DLEVBQUU7UUFFakUsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxlQUFl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dXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVudW1Ob3ZlbFN0YXR1cyB9IGZyb20gJ25vZGUtbm92ZWwtaW5mby9saWIvY29uc3QnO1xuaW1wb3J0IHsgcmV0cnlSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vZmV0Y2gnO1xuXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYvdXRpbCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCB7IExhenlDb29raWUsIExhenlDb29raWVKYXIgfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZ2V0RmlsZVBhdGgsIGdldFZvbHVtZVBhdGggfSBmcm9tICcuLi9mcyc7XG5cbmltcG9ydCBOb3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgZGVmYXVsdEpTRE9NT3B0aW9ucywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkLCBibHVlYmlyZERlY29yYXRvciB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IG1vbWVudCB9IGZyb20gJy4uL2luZGV4JztcblxuaW1wb3J0IE5vdmVsU2l0ZURlbW8gPSByZXF1aXJlKCcuLi9kZW1vL2Jhc2UnKTtcbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG5cbmltcG9ydCB7IGNvbnNvbGUgfSBmcm9tICcuLi8uLi91dGlsL2xvZyc7XG5cbmV4cG9ydCB0eXBlIElOb3ZlbCA9IE5vdmVsU2l0ZURlbW8uSU5vdmVsICYge1xuXHRub3ZlbF9zeW9zZXR1X2lkOiBzdHJpbmcsXG59O1xuXG5leHBvcnQgdHlwZSBJT3B0aW9uc1BsdXMgPSB7XG5cdC8qKlxuXHQgKiDkuI3kvb/nlKjlsI/oqqrlrrbmj5DkvpvnmoQgdHh0IOS4i+i8iemAo+e1kFxuXHQgKi9cblx0ZGlzYWJsZVR4dGRvd25sb2FkPzogYm9vbGVhbixcbn1cblxuZXhwb3J0IHR5cGUgSURvd25sb2FkT3B0aW9ucyA9IE5vdmVsU2l0ZURlbW8uSURvd25sb2FkT3B0aW9ucyAmIElPcHRpb25zUGx1c1xuZXhwb3J0IHR5cGUgSU9wdGlvbnNSdW50aW1lID0gTm92ZWxTaXRlRGVtby5JT3B0aW9uc1J1bnRpbWUgJiBJRG93bmxvYWRPcHRpb25zICYgSU9wdGlvbnNQbHVzXG5cbkBzdGF0aWNJbXBsZW1lbnRzPE5vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZVN5b3NldHU+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlU3lvc2V0dSBleHRlbmRzIE5vdmVsU2l0ZURlbW8uTm92ZWxTaXRlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVkgPSAnc3lvc2V0dSc7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogSURvd25sb2FkT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdHN1cGVyKG9wdGlvbnMsIC4uLmFyZ3YpO1xuXG5cdFx0dGhpcy5vcHRpb25zSW5pdC5yZXRyeURlbGF5ID0gdGhpcy5vcHRpb25zSW5pdC5yZXRyeURlbGF5IHx8IDI1MDAwO1xuXHR9XG5cblx0c2Vzc2lvbjxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4ob3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+LCB1cmw6IFVSTClcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSA9IG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhIHx8IHt9O1xuXHRcdG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhLm92ZXIxOCA9ICd5ZXMnO1xuXG5cdFx0Lypcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YS5zYXNpZW5vID0gMDtcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YS5saW5laGVpZ2h0ID0gMDtcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YS5mb250c2l6ZSA9IDA7XG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEubm92ZWxsYXlvdXQgPSAwO1xuXHRcdG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhLmZpeF9tZW51X2JhciA9IDA7XG5cdFx0Ki9cblxuXHRcdHN1cGVyLnNlc3Npb24ob3B0aW9uc1J1bnRpbWUsIHVybCk7XG5cblx0XHQvL2xldCB1cmwgPSBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnVybDtcblxuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXJcblx0XHRcdC8vLnNldENvb2tpZVN5bmMoJ292ZXIxOD15ZXM7IERvbWFpbj0uc3lvc2V0dS5jb207IFBhdGg9LzsgaG9zdE9ubHk9ZmFsc2UnLCB1cmwuaHJlZilcblx0XHQ7XG5cbi8vXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5ydW5TY3JpcHRzID0gJ2Rhbmdlcm91c2x5Jztcbi8vXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS52aXJ0dWFsQ29uc29sZSA9IGZhbHNlO1xuXG5cdFx0Ly9vcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgPSBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgfHwge307XG5cbi8vXHRcdGlmICghb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zLmphcilcbi8vXHRcdHtcblx0XHRcdC8vb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zLmphciA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIud3JhcEZvclJlcXVlc3QoKTtcbi8vXHRcdH1cblxuXHRcdC8vb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnVzZXJBZ2VudCA9ICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNzEuMC4zNTc4Ljk4IFNhZmFyaS81MzcuMzYnO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRkb3dubG9hZCh1cmw6IHN0cmluZyB8IFVSTCwgZG93bmxvYWRPcHRpb25zOiBJRG93bmxvYWRPcHRpb25zID0ge30pXG5cdHtcblx0XHRyZXR1cm4gc3VwZXIuZG93bmxvYWQodXJsLCBkb3dubG9hZE9wdGlvbnMpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9wYXJzZUNoYXB0ZXI8VD4ocmV0LCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGUpOiBzdHJpbmdcblx0e1xuXHRcdGlmICghcmV0KVxuXHRcdHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLmRpc2FibGVUeHRkb3dubG9hZClcblx0XHR7XG5cdFx0XHRyZXR1cm4gcmV0LmJvZHk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFtcblx0XHRcdHJldC5kb20uJCgnI25vdmVsX3AnKS50ZXh0KCksXG5cdFx0XHRyZXQuZG9tLiQoJyNub3ZlbF9ob25idW4nKS50ZXh0KCksXG5cdFx0XHRyZXQuZG9tLiQoJyNub3ZlbF9hJykudGV4dCgpLFxuXHRcdF0uZmlsdGVyKGZ1bmN0aW9uICh2KVxuXHRcdHtcblx0XHRcdHJldHVybiB2O1xuXHRcdH0pLmpvaW4oJ1xcblxcbj09PT09PT09PT09PT09PT09PVxcblxcbicpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9jcmVhdGVDaGFwdGVyVXJsPFQgPSBJT3B0aW9uc1J1bnRpbWUgJiBJRG93bmxvYWRPcHRpb25zPih7XG5cdFx0bm92ZWwsXG5cdFx0dm9sdW1lLFxuXHRcdGNoYXB0ZXIsXG5cdH06IHtcblx0XHRub3ZlbDogTm92ZWxTaXRlLklOb3ZlbCxcblx0XHR2b2x1bWU6IE5vdmVsU2l0ZS5JVm9sdW1lLFxuXHRcdGNoYXB0ZXI6IE5vdmVsU2l0ZS5JQ2hhcHRlcixcblx0fSwgb3B0aW9uc1J1bnRpbWU/OiBUICYgSU9wdGlvbnNSdW50aW1lKTogVVJMXG5cdHtcblx0XHRpZiAob3B0aW9uc1J1bnRpbWUuZGlzYWJsZVR4dGRvd25sb2FkKVxuXHRcdHtcblx0XHRcdGxldCB1cmwgPSB0aGlzLm1ha2VVcmwoe1xuXHRcdFx0XHRjaGFwdGVyX2lkOiBjaGFwdGVyLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdG5vdmVsX2lkOiBub3ZlbC51cmxfZGF0YS5ub3ZlbF9pZCxcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gdXJsO1xuXHRcdH1cblxuXHRcdHJldHVybiBzdXBlci5fY3JlYXRlQ2hhcHRlclVybCh7XG5cdFx0XHRub3ZlbCxcblx0XHRcdHZvbHVtZSxcblx0XHRcdGNoYXB0ZXIsXG5cdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMgPSB7fSwgLi4ub3B0cylcblx0e1xuXHRcdG9wdGlvbnNbdGhpcy5JREtFWV0gPSB7XG5cdFx0XHR0eHRkb3dubG9hZF9pZDogb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbC5ub3ZlbF9zeW9zZXR1X2lkIHx8ICcnLFxuXHRcdFx0c2VyaWVzX2lkOiBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLm5vdmVsLm5vdmVsX3N5b3NldHVfc2VyaWVzX2lkIHx8ICcnLFxuXHRcdH07XG5cblx0XHRyZXR1cm4gc3VwZXIuX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMsIHtcblx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0dGV4dGxheW91dDoge1xuXHRcdFx0XHRcdGFsbG93X2xmMjogdHJ1ZSxcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0fSwgLi4ub3B0cyk7XG5cdH1cblxuXHRtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbCA/OiBib29sZWFuKTogVVJMXG5cdHtcblx0XHRsZXQgc3ViZG9tYWluID0gdXJsb2JqLm5vdmVsX3IxOCA/ICdub3ZlbDE4JyA6ICduY29kZSc7XG5cblx0XHRpZiAodXJsb2JqLm5vdmVsX3BpZCAmJiB1cmxvYmouY2hhcHRlcl9pZClcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRyZXR1cm4gbmV3IFVSTChgaHR0cHM6Ly8ke3N1YmRvbWFpbn0uc3lvc2V0dS5jb20vdHh0ZG93bmxvYWQvZGxzdGFydC9uY29kZS8ke3VybG9iai5ub3ZlbF9waWR9Lz9ubz0ke3VybG9iai5jaGFwdGVyX2lkfSZoYW5rYWt1PTAmY29kZT11dGYtOCZrYWlneW89Y3JsZmApO1xuXHRcdH1cblxuXHRcdGxldCBwYWQgPSAoIWJvb2wgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpID8gdXJsb2JqLmNoYXB0ZXJfaWQgOiAnJztcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gbmV3IFVSTChgaHR0cDovLyR7c3ViZG9tYWlufS5zeW9zZXR1LmNvbS8ke3VybG9iai5ub3ZlbF9pZH0vJHtwYWR9YCk7XG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IHN0cmluZyB8IFVSTCk6IE5vdmVsU2l0ZS5JUGFyc2VVcmxcblx0e1xuXHRcdGxldCB1cmxvYmogPSB7XG5cdFx0XHR1cmwsXG5cblx0XHRcdG5vdmVsX3BpZDogbnVsbCxcblx0XHRcdG5vdmVsX2lkOiBudWxsLFxuXHRcdFx0Y2hhcHRlcl9pZDogbnVsbCxcblxuXHRcdFx0bm92ZWxfcjE4OiBudWxsLFxuXHRcdH07XG5cblx0XHQvL3VybCA9IHVybC50b1N0cmluZygpO1xuXG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0dXJsb2JqLnVybCA9IG5ldyBVUkwodXJsKTtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHVybCA9IHVybG9iai51cmwuaHJlZjtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS53YXJuKGUudG9TdHJpbmcoKSArIGAgXCIke3VybH1cImApO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgdXJsICE9ICdzdHJpbmcnKVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IodXJsKTtcblx0XHR9XG5cblx0XHRsZXQgcjogUmVnRXhwO1xuXHRcdGxldCBtO1xuXG5cdFx0ciA9IC9eKG5bXFx3XXs1LDZ9KSQvO1xuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0ciA9IC8obm92ZWwxOClcXC5zeW9zZXR1XFwuY29tLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9yMTggPSBtWzFdO1xuXHRcdH1cblxuXHRcdHIgPSAvdHh0ZG93bmxvYWRcXC9kbHN0YXJ0XFwvbmNvZGVcXC8oXFxkKykvO1xuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX3BpZCA9IG1bMV07XG5cblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0ciA9IC9cXC5zeW9zZXR1XFwuY29tXFwvKG5cXHcrKSg/OlxcLz8oXFxkKykpPy87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdFx0dXJsb2JqLmNoYXB0ZXJfaWQgPSBtWzJdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHJldHVybiB1cmxvYmo7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2ZldGNoQ2hhcHRlcjxUPih1cmw6IFVSTCwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUpXG5cdHtcblx0XHRsZXQgdHJ5ZWQ6IGJvb2xlYW47XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgX2ZldGNoQ2hhcHRlciA9IHN1cGVyLl9mZXRjaENoYXB0ZXI7XG5cblx0XHRyZXR1cm4gc3VwZXIuX2ZldGNoQ2hhcHRlcih1cmwsIG9wdGlvbnNSdW50aW1lKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKHJldClcblx0XHRcdHtcblx0XHRcdFx0aWYgKHJldCA9PSBudWxsKSByZXR1cm4gcmV0O1xuXG5cdFx0XHRcdGNvbnN0IGRvbSA9IHJldC5kb207XG5cblx0XHRcdFx0aWYgKCF0cnllZCAmJiBkb20gJiYgZG9tLiQoJyNtb2RhbCAueWVzICN5ZXMxOCcpLmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5lcnJvcihg54Sh5rOV5oiQ5Yqf6K6A5Y+WIFIxOCDpoIHpnaJgLCB1cmwuaHJlZik7XG5cblx0XHRcdFx0XHR0cnllZCA9IHRydWU7XG5cblx0XHRcdFx0XHR0cnlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQkKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5jbGljaygpO1xuXHRcdFx0XHRcdFx0JCgnI21vZGFsIC55ZXMgI3llczE4JylbMF0uY2xpY2soKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphci5zZXRDb29raWVTeW5jKCdvdmVyMTg9eWVzOyBEb21haW49LnN5b3NldHUuY29tOyBQYXRoPS87IGhvc3RPbmx5PWZhbHNlJywgdXJsKTtcblx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyLnNldENvb2tpZVN5bmMoYG92ZXIxOD15ZXM7IERvbWFpbj0ke2RvbS51cmwuaG9zdH07IFBhdGg9LzsgaG9zdE9ubHk9ZmFsc2VgLCBkb20udXJsKTtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5kZWJ1ZyhvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyLmdldEFsbENvb2tpZXMoKSk7XG5cblx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVmZXJyZXIgPSBkb20udXJsO1xuXHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucyB8fCB7fTtcblx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMuZm9ybSA9IGRvbS51cmw7XG5cblx0XHRcdFx0XHRyZXR1cm4gX2ZldGNoQ2hhcHRlci5jYWxsKHNlbGYsIHVybCwgb3B0aW9uc1J1bnRpbWUpXG5cdFx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAocmV0KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjb25zdCBkb20gPSByZXQuZG9tO1xuXHRcdFx0XHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCQoJyNtb2RhbCAueWVzICN5ZXMxOCcpLmxlbmd0aClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoYOeEoeazleaIkOWKn+iugOWPliBSMTgg6aCB6Z2iYCwgdXJsLmhyZWYpO1xuXG5cdFx0XHRcdFx0XHRcdFx0Ly9wcm9jZXNzLmV4aXQoKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXQ7XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHJldDtcblx0XHRcdH0pXG5cdH1cblxuXHRhc3luYyBfbm92ZWwxODxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4odXJsLCBkb206IElKU0RPTSwgb3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge30pOiBQcm9taXNlPElKU0RPTT5cblx0e1xuXHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdGlmICghJCgnI25vdmVsX2NvbnRlbnRzJykubGVuZ3RoIHx8ICQoJyNtb2RhbCAueWVzICN5ZXMxOCcpLmxlbmd0aClcblx0XHR7XG5cdFx0XHQvL2NvbnNvbGUubG9nKGRvbS51cmwsIGRvbS5fb3B0aW9ucyk7XG5cblx0XHRcdCQoJyNtb2RhbCAueWVzICN5ZXMxOCcpLmNsaWNrKCk7XG5cblx0XHRcdGRvbS5fb3B0aW9ucy5yZXF1ZXN0T3B0aW9ucy5qYXIuc2V0Q29va2llKCdvdmVyMTg9eWVzOyBEb21haW49LnN5b3NldHUuY29tOyBQYXRoPS87IGhvc3RPbmx5PWZhbHNlJywgdXJsKTtcblxuXHRcdFx0Ly9jb25zb2xlLmxvZyhkb20uc2VyaWFsaXplKCkpO1xuXG5cdFx0XHRyZXR1cm4gZnJvbVVSTCh1cmwsIE9iamVjdC5hc3NpZ24ob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLCB7XG5cblx0XHRcdFx0Ly9jb29raWVKYXI6IGRvbS5fb3B0aW9ucy5yZXF1ZXN0T3B0aW9ucy5qYXIuX2phcixcblx0XHRcdFx0Ly9yZXF1ZXN0T3B0aW9uczogZG9tLl9vcHRpb25zLnJlcXVlc3RPcHRpb25zLFxuXG5cdFx0XHR9IGFzIElGcm9tVXJsT3B0aW9ucykpO1xuXHRcdH1cblxuXHRcdC8vY29uc29sZS5sb2coZG9tLl9vcHRpb25zLnJlcXVlc3RPcHRpb25zLmphcik7XG5cblx0XHRyZXR1cm4gZG9tO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9nZXRFeHRyYUluZm9VUkw8VD4oc2VhcmNoOiBzdHJpbmcsIHVybF9kYXRhOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4pXG5cdHtcblx0XHRsZXQgb3B0aW9uc0pTRE9NID0ge1xuXHRcdFx0Li4ub3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLFxuXHRcdFx0cmVxdWVzdE9wdGlvbnM6IHtcblx0XHRcdFx0Li4ub3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zXG5cdFx0XHR9LFxuXHRcdH07XG5cblx0XHRvcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgPSBvcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgfHwge307XG5cdFx0b3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zLmZvbGxvd1JlZGlyZWN0ID0gdHJ1ZTtcblxuXHRcdGxldCBfZG9tYWluID0gMSA/ICduYXIuanAnIDogJ2RpcC5qcCc7XG5cblx0XHRyZXR1cm4gZnJvbVVSTChgaHR0cHM6Ly8ke3VybF9kYXRhLm5vdmVsX3IxOFxuXHRcdFx0PyAnbmFyb3UxOCdcblx0XHRcdDogJ25hcm91J30uJHtfZG9tYWlufS9zZWFyY2gucGhwP3RleHQ9JHtzZWFyY2h9Jm5vdmVsPWFsbCZnZW5yZT1hbGwmbmV3X2dlbnJlPWFsbCZsZW5ndGg9MCZkb3duPTAmdXA9MTAwYCwgb3B0aW9uc0pTRE9NKVxuXHR9XG5cblx0YXN5bmMgZ2V0X3ZvbHVtZV9saXN0PFQgPSBOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPih1cmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fVxuXHQpOiBQcm9taXNlPElOb3ZlbD5cblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0dXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKHVybCBhcyBhbnkpO1xuXG5cdFx0cmV0dXJuIGF3YWl0IGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBzZWxmLl9ub3ZlbDE4PFQ+KHVybCwgZG9tLCBvcHRpb25zUnVudGltZSk7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgbm92ZWxfdGl0bGUgPSBkb20uJCgnLm5vdmVsX3RpdGxlJykudGV4dCgpO1xuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yID0gbm92ZWxUZXh0LnRyaW0oZG9tXG5cdFx0XHRcdFx0LiQoJy5ub3ZlbF93cml0ZXJuYW1lIGEsIC5ub3ZlbF93cml0ZXJuYW1lJylcblx0XHRcdFx0XHQuZXEoLTEpXG5cdFx0XHRcdFx0LnRleHQoKSlcblx0XHRcdFx0XHQucmVwbGFjZSgvXi4q5L2c6ICF77yaLywgJycpXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYyA9IGRvbS4kKCcjbm92ZWxfZXgnKS50ZXh0KCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3B1Ymxpc2hlciA9IHNlbGYuSURLRVk7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybChkb20udXJsLmhyZWYpO1xuXG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIE5vdmVsU2l0ZS5JVm9sdW1lW107XG5cblx0XHRcdFx0bGV0IGN1cnJlbnRWb2x1bWU6IE5vdmVsU2l0ZS5JVm9sdW1lO1xuXG5cdFx0XHRcdGxldCB0YWJsZSA9IGRvbS4kKCcuaW5kZXhfYm94JykuZmluZCgnPiAuY2hhcHRlcl90aXRsZSwgLm5vdmVsX3N1Ymxpc3QyJyk7XG5cblx0XHRcdFx0bGV0IF9jYWNoZV9kYXRlcyA9IFtdO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9zeW9zZXR1X2lkO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb20uc2VyaWFsaXplKCkpO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygkKCcjbm92ZWxfZm9vdGVyJykpO1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygkKCcjbm92ZWxfZm9vdGVyJykuZmluZCgnLnVuZGVybmF2aSBhW2hyZWYqPVwidHh0ZG93bmxvYWRcIl0nKSk7XG5cblx0XHRcdFx0XHRsZXQgbTtcblx0XHRcdFx0XHRsZXQgZHQgPSBkb20uJCgnI25vdmVsX2Zvb3RlciAudW5kZXJuYXZpIGFbaHJlZio9XCJ0eHRkb3dubG9hZFwiXScpLnByb3AoJ2hyZWYnKTtcblxuXHRcdFx0XHRcdGlmIChkdCAmJiAobSA9IGR0Lm1hdGNoKC9uY29kZVxcLyhcXGQrKS8pKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRub3ZlbF9zeW9zZXR1X2lkID0gbVsxXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoIW9wdGlvbnNSdW50aW1lLmRpc2FibGVUeHRkb3dubG9hZClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYOWumOaWuSB0eHQg5LiL6LyJ5Yqf6IO96YGt56aB55So77yM5oiW6KuL5L2/55SoIGNvb2tpZXMg55m75YWl77yM5oiW5bCHIGRpc2FibGVUeHRkb3dubG9hZCDoqK3ngrogdHJ1ZWApXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGFibGVcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IHRyID0gZG9tLiQodGhpcyk7XG5cblx0XHRcdFx0XHRcdGlmICh0ci5pcygnLmNoYXB0ZXJfdGl0bGUnKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IHZvbHVtZV9saXN0W3ZvbHVtZV9saXN0Lmxlbmd0aF0gPSB7XG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiB2b2x1bWVfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiB0ci50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogW10sXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmICghY3VycmVudFZvbHVtZSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiB2b2x1bWVfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGU6ICdudWxsJyxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogW10sXG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBhID0gdHIuZmluZCgnLnN1YnRpdGxlIGEnKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl9kYXRlO1xuXHRcdFx0XHRcdFx0XHRsZXQgZGQ7XG5cdFx0XHRcdFx0XHRcdGxldCBkYSA9IHRyLmZpbmQoJy5sb25nX3VwZGF0ZScpO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChkYS5maW5kKCdzcGFuW3RpdGxlKj1cIi9cIl0nKS5sZW5ndGgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkZCA9IGRhLmZpbmQoJ3NwYW5bdGl0bGUqPVwiL1wiXScpLmF0dHIoJ3RpdGxlJykucmVwbGFjZSgv5pS556i/fF5cXHMrfFxccyskL2csICcnKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmICghZGQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkYS5maW5kKCcqJykucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHRcdFx0ZGQgPSBkYS50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKGRkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9kYXRlID0gbW9tZW50KGRkLCAnWVlZWS9NTS9ERCBISDptbScpLmxvY2FsKCk7XG5cdFx0XHRcdFx0XHRcdFx0X2NhY2hlX2RhdGVzLnB1c2goY2hhcHRlcl9kYXRlLnVuaXgoKSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgaHJlZiA9IGEucHJvcCgnaHJlZicpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBkYXRhID0gc2VsZi5wYXJzZVVybChocmVmKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIWRhdGEuY2hhcHRlcl9pZClcblx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHRyLmZpbmQoJy5ib29rbWFya2VyX25vdycpLmxlbmd0aClcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdFx0XHRcdCAqIGZpeCBodHRwczovL25jb2RlLnN5b3NldHUuY29tL243NjM3ZGovXG5cdFx0XHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyh0ci5wcm9wKFwib3V0ZXJIVE1MXCIpKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhLnByb3AoXCJvdXRlckhUTUxcIikpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGEpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGhyZWYpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGEuYXR0cignaHJlZicpKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhuZXcgVVJMKGhyZWYsIGRvbS51cmwpKTtcblxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGRvbS5fb3B0aW9ucyk7XG5cblx0XHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGRhdGEgPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR1cmw6IG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0XHRub3ZlbF9waWQ6IG5vdmVsX3N5b3NldHVfaWQgYXMgc3RyaW5nLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkIGFzIHN0cmluZyxcblx0XHRcdFx0XHRcdFx0XHR9IGFzIGFueTtcblxuXHRcdFx0XHRcdFx0XHRcdGhyZWYgPSBzZWxmLm1ha2VVcmwoZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHRkYXRhLnVybCA9IGhyZWY7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lXG5cdFx0XHRcdFx0XHRcdFx0LmNoYXB0ZXJfbGlzdFxuXHRcdFx0XHRcdFx0XHRcdC5wdXNoKHtcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaW5kZXg6IGN1cnJlbnRWb2x1bWUuY2hhcHRlcl9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGU6IGEudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKSxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsOiBocmVmLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmxfZGF0YTogZGF0YSxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfZGF0ZSxcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdF9jYWNoZV9kYXRlcy5zb3J0KCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGUgPSBtb21lbnQudW5peChfY2FjaGVfZGF0ZXNbX2NhY2hlX2RhdGVzLmxlbmd0aCAtIDFdKS5sb2NhbCgpO1xuXG5cdFx0XHRcdGxldCBhID0gYXdhaXQgc2VsZi5fZ2V0RXh0cmFJbmZvVVJMKHVybF9kYXRhLm5vdmVsX2lkLCB1cmxfZGF0YSwgb3B0aW9uc1J1bnRpbWUpXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKGRvbSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgaDIgPSBkb20uJChgZGl2Omhhcyg+IGgyLnNlYXJjaDpoYXMoPiBhW2hyZWYqPVwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIl0pKWApLmVxKDApO1xuXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aDIgPSBkb20uJChgaDI6aGFzKD4gYVtocmVmKj1cIiR7dXJsX2RhdGEubm92ZWxfaWR9XCJdKWApLmVxKDApO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS53YXJuKGBjYW4gbm90IGZvdW5kIGtleXdvcmQgXCIke3VybF9kYXRhLm5vdmVsX2lkfVwiLCB3aWxsIHRyeSB1c2UgdGl0bGUgc2VhcmNoYCk7XG5cblx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdCAqIGh0dHBzOi8vbmFyb3UxOC5uYXIuanAvc2VhcmNoLnBocD90ZXh0PSVFMyU4MyVBOSVFMyU4MyVCMyVFMyU4MiVBRiVFNSU4NiU5MiVFOSU5OSVCQSVFOCU4MCU4NSVFMyU4MSVBRSVFMyU4MiVCOSVFMyU4MyVBRCVFMyU4MyVCQyVFMyU4MyVBOSVFMyU4MiVBNCVFMyU4MyU5NSZub3ZlbD1hbGwmZ2VucmU9YWxsJm5ld19nZW5yZT1hbGwmbGVuZ3RoPTAmZG93bj0wJnVwPTEwMFxuXHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0bGV0IHRpdGxlID0gbm92ZWxfdGl0bGVcblx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvW1xcd++9gS3vvZpdKy9pZywgJyAnKVxuXHRcdFx0XHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9nZXRFeHRyYUluZm9VUkwodGl0bGUsIHVybF9kYXRhLCBvcHRpb25zUnVudGltZSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldHVybiBkb207XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coZG9tLnVybCk7XG5cblx0XHRcdFx0XHRcdGxldCBkYXRhOiBJTWRjb25mTWV0YSA9IHt9O1xuXG5cdFx0XHRcdFx0XHRsZXQgaDIgPSBkb20uJChgZGl2Omhhcyg+IGgyLnNlYXJjaDpoYXMoPiBhW2hyZWYqPVwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIl0pKWApLmVxKDApO1xuXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aDIgPSBkb20uJChgaDI6aGFzKD4gYVtocmVmKj1cIiR7dXJsX2RhdGEubm92ZWxfaWR9XCJdKWApLmVxKDApO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRsZXQgc2VhcmNoX2xlZnQgPSBoMi5uZXh0QWxsKCcuc2VhcmNoX2xlZnQ6ZXEoMCknKS5lcSgwKTtcblx0XHRcdFx0XHRcdGxldCBzZWFyY2hfcmlnaHQgPSBoMi5uZXh0QWxsKCcuc2VhcmNoX3JpZ2h0OmVxKDApJykuZXEoMCk7XG5cblx0XHRcdFx0XHRcdGlmICghc2VhcmNoX2xlZnQubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRzZWFyY2hfbGVmdCA9IGgyLnNpYmxpbmdzKCcuc2VhcmNoX2xlZnQ6ZXEoMCknKS5lcSgwKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKCFzZWFyY2hfcmlnaHQubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRzZWFyY2hfcmlnaHQgPSBoMi5zaWJsaW5ncygnLnNlYXJjaF9yaWdodDplcSgwKScpLmVxKDApO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygxMTExMTExMTExMTExMTExMTExMTEpO1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlLndhcm4oYGNhbiBub3QgZm91bmQga2V5d29yZCBmb3IgJHt1cmxfZGF0YS5ub3ZlbF9pZH1gLCBkb20udXJsKTtcblxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZGF0YTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhzZWFyY2hfbGVmdCk7XG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKHNlYXJjaF9yaWdodCk7XG5cblx0XHRcdFx0XHRcdGRhdGEubm92ZWwgPSB7fTtcblxuXHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC5zdGF0dXMgPSBzZWFyY2hfbGVmdC5maW5kKCcubm92ZWxfdHlwZScpLnRleHQoKS50cmltKCk7XG5cdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MgPSBbXTtcblxuXHRcdFx0XHRcdFx0aWYgKGRhdGEubm92ZWwuc3RhdHVzID09PSAn5a6M57WQ5riIJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC5ub3ZlbF9zdGF0dXMgfD0gRW51bU5vdmVsU3RhdHVzLkFVVEhPUl9ET05FO1xuXG5cdFx0XHRcdFx0XHRcdGRhdGEubm92ZWwudGFncy5wdXNoKGRhdGEubm92ZWwuc3RhdHVzKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0c2VhcmNoX3JpZ2h0LmZpbmQoJy5rZXl3b3JkIGEnKVxuXHRcdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgayA9IGRvbS4kKGVsZW0pXG5cdFx0XHRcdFx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdFx0XHRcdFx0XHQuc3BsaXQoL1tcXC9cXHNdLylcblx0XHRcdFx0XHRcdFx0XHRcdC5tYXAoZnVuY3Rpb24gKHMpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBzLnRyaW0oKTtcblx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHQuZmlsdGVyKCh2KSA9PiB2KVxuXHRcdFx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0XHRcdGRhdGEubm92ZWwudGFncyA9IGRhdGEubm92ZWwudGFncy5jb25jYXQoayk7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdHNlYXJjaF9sZWZ0XG5cdFx0XHRcdFx0XHRcdC5maW5kKCdbY2xhc3MqPVwibmV3X2dlbnJlXCJdLCAubm9jZ2VucmUnKVxuXHRcdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgayA9IGRvbS4kKGVsZW0pXG5cdFx0XHRcdFx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG5cdFx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGspXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzLnB1c2goayk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRkYXRhLmxpbmsgPSBkYXRhLmxpbmsgfHwgW107XG5cblx0XHRcdFx0XHRcdGRhdGEubGluay5wdXNoKGBbJHtkb20udXJsLmhvc3RuYW1lfV0oJHtkb20udXJsfSkgLSDlsI/oqqzlrrbjgavjgarjgo3jgYbjgIDmm7TmlrDmg4XloLHmpJzntKJgKTtcblxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkYXRhKTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGRhdGE7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcihlKTtcblx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoYGNhbid0IGRvd25sb2FkIG5vdmVsIGV4dHJhIGluZm9gKTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIHt9O1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfc2VyaWVzX3RpdGxlOiBzdHJpbmc7XG5cdFx0XHRcdGxldCBub3ZlbF9zeW9zZXR1X3Nlcmllc19pZDogc3RyaW5nO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgX2EgPSBkb20uJCgnI25vdmVsX2NvbnRlbnRzIC5zZXJpZXNfdGl0bGUnKTtcblxuXHRcdFx0XHRcdGxldCB0ID0gX2EudGV4dCgpXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvW1xcclxcblxcdF0rfF5cXHMrfFxccyskL2csICcnKVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdGlmICh0KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdG5vdmVsX3Nlcmllc190aXRsZSA9IHQ7XG5cblx0XHRcdFx0XHRcdF9hID0gX2EuZmluZCgnYScpO1xuXHRcdFx0XHRcdFx0bGV0IF90ID0gX2EuYXR0cignaHJlZicpIHx8ICcnO1xuXG5cdFx0XHRcdFx0XHRpZiAoL1xcLyhcXHd7Nix9KVxcLy9pLmV4ZWMoX3QpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRub3ZlbF9zeW9zZXR1X3Nlcmllc19pZCA9IFJlZ0V4cC4kMTtcblxuXHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdGEubGluayA9IGEubGluayB8fCBbXTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgdGl0bGUgPSBub3ZlbF9zZXJpZXNfdGl0bGVcblx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvW1xcW1xcXVxcflxcYF0vZywgJ1xcXFwkMCcpXG5cdFx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL1tcIiddL2csICcnKVxuXHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRhLmxpbmsucHVzaChgWyR7dGl0bGV9XSgke19hLnByb3AoJ2hyZWYnKX0pYCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdC4uLmEsXG5cblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcblx0XHRcdFx0XHRub3ZlbF9hdXRob3IsXG5cblx0XHRcdFx0XHRub3ZlbF9kZXNjLFxuXHRcdFx0XHRcdG5vdmVsX2RhdGUsXG5cdFx0XHRcdFx0bm92ZWxfcHVibGlzaGVyLFxuXG5cdFx0XHRcdFx0bm92ZWxfc2VyaWVzX3RpdGxlLFxuXHRcdFx0XHRcdG5vdmVsX3N5b3NldHVfc2VyaWVzX2lkLFxuXG5cdFx0XHRcdFx0bm92ZWxfc3lvc2V0dV9pZCxcblxuXHRcdFx0XHRcdHZvbHVtZV9saXN0LFxuXG5cdFx0XHRcdFx0Y2hlY2tkYXRlOiBtb21lbnQoKS5sb2NhbCgpLFxuXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdH0gYXMgSU5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZVN5b3NldHU7XG5cbiJdfQ==