"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
        };
        return super._saveReadme(optionsRuntime, options, {
            options: {
                textlayout: {
                    allow_lf2: true,
                }
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
            let novel_series_title;
            {
                let a = dom.$('#novel_contents .series_title').text()
                    .replace(/[\r\n\t]+|^\s+|\s+$/g, '');
                if (a) {
                    novel_series_title = a;
                }
            }
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
            let a = await jsdom_extra_1.fromURL(`https://${url_data.novel_r18
                ? 'narou18'
                : 'narou'}.dip.jp/search.php?text=${url_data.novel_id}&novel=all&genre=all&new_genre=all&length=0&down=0&up=100`, optionsRuntime.optionsJSDOM)
                .then(function (dom) {
                let h2 = dom.$(`div:has(> h2.search:has(> a[href*="${url_data.novel_id}"]))`).eq(0);
                if (!h2.length) {
                    h2 = dom.$(`h2:has(> a[href*="${url_data.novel_id}"])`).eq(0);
                }
                if (!h2.length) {
                    //console.warn(`can not found keyword "${url_data.novel_id}", will try use title search`);
                    return jsdom_extra_1.fromURL(`https://${url_data.novel_r18
                        ? 'narou18'
                        : 'narou'}.dip.jp/search.php?text=${novel_title}&novel=all&genre=all&new_genre=all&length=0&down=0&up=100`, optionsRuntime.optionsJSDOM);
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
                let search_left = h2.siblings('.search_left').eq(0);
                let search_right = h2.siblings('.search_right').eq(0);
                if (!h2.length) {
                    //console.log(111111111111111111111);
                    log_1.console.warn(`can not found keyword for ${url_data.novel_id}`);
                    return data;
                }
                //console.log(search_left);
                //console.log(search_right);
                data.novel = {};
                data.novel.status = search_left.find('.novel_type').text().trim();
                data.novel.tags = [];
                if (data.novel.status === '完結済') {
                    data.novel.novel_status |= const_1.EnumNovelStatus.AUTHOR_DONE;
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
                data.link = [];
                data.link.push(`[dip.jp](${dom.url}) - 小説家になろう　更新情報検索`);
                //console.log(data);
                return data;
            })
                .catch(function (e) {
                log_1.console.error(e);
                log_1.console.error(`can't download novel extra info`);
                return {};
            });
            return Object.assign({}, a, { url: dom.url, url_data,
                novel_title,
                novel_author,
                novel_desc,
                novel_date,
                novel_publisher,
                novel_series_title,
                novel_syosetu_id,
                volume_list, checkdate: index_2.moment().local(), imgs: [] });
        });
    }
};
NovelSiteSyosetu.IDKEY = 'syosetu';
NovelSiteSyosetu = __decorate([
    index_1.staticImplements()
], NovelSiteSyosetu);
exports.NovelSiteSyosetu = NovelSiteSyosetu;
exports.default = NovelSiteSyosetu;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLHFEQUE0RDtBQU01RCw2Q0FBK0Q7QUFHL0QseUNBQWdDO0FBR2hDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFFbEMsOENBQStDO0FBQy9DLDJDQUFtQztBQUVuQyx3Q0FBeUM7QUFpQnpDLElBQWEsZ0JBQWdCLEdBQTdCLE1BQWEsZ0JBQWlCLFNBQVEsYUFBYSxDQUFDLFNBQVM7SUFJNUQsWUFBWSxPQUF5QixFQUFFLEdBQUcsSUFBSTtRQUU3QyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFFeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxPQUFPLENBQWdDLGNBQTZDLEVBQUUsR0FBUTtRQUU3RixhQUFhO1FBQ2IsY0FBYyxDQUFDLFdBQVcsR0FBRyxjQUFjLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQztRQUM5RCxjQUFjLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFFMUM7Ozs7OztVQU1FO1FBRUYsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFbkMsNkNBQTZDO1FBRTdDLGNBQWMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUVwQztRQUVILDJEQUEyRDtRQUMzRCx1REFBdUQ7UUFFckQsZ0dBQWdHO1FBRWxHLHdEQUF3RDtRQUN4RCxLQUFLO1FBQ0YsMEdBQTBHO1FBQzdHLEtBQUs7UUFFSCwrSkFBK0o7UUFFL0osT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsUUFBUSxDQUFDLEdBQWlCLEVBQUUsa0JBQW9DLEVBQUU7UUFFakUsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxlQUFlLENB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L2xpYi9jb25zdCc7XHJcbmltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uLy4uL2ZldGNoJztcclxuXHJcbmltcG9ydCBmcywgeyB0cmltRmlsZW5hbWUgfSBmcm9tICdmcy1pY29udic7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCBub3ZlbEluZm8sIHsgSU1kY29uZk1ldGEgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xyXG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcclxuLy8gQHRzLWlnbm9yZVxyXG5pbXBvcnQgeyBMYXp5Q29va2llLCBMYXp5Q29va2llSmFyIH0gZnJvbSAnanNkb20tZXh0cmEnO1xyXG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xyXG5pbXBvcnQgeyBnZXRGaWxlUGF0aCwgZ2V0Vm9sdW1lUGF0aCB9IGZyb20gJy4uL2ZzJztcclxuXHJcbmltcG9ydCBOb3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgZGVmYXVsdEpTRE9NT3B0aW9ucywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xyXG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xyXG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XHJcblxyXG5pbXBvcnQgTm92ZWxTaXRlRGVtbyA9IHJlcXVpcmUoJy4uL2RlbW8vYmFzZScpO1xyXG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xyXG5cclxuaW1wb3J0IHsgY29uc29sZSB9IGZyb20gJy4uLy4uL3V0aWwvbG9nJztcclxuXHJcbmV4cG9ydCB0eXBlIElOb3ZlbCA9IE5vdmVsU2l0ZURlbW8uSU5vdmVsICYge1xyXG5cdG5vdmVsX3N5b3NldHVfaWQ6IHN0cmluZyxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIElPcHRpb25zUGx1cyA9IHtcclxuXHQvKipcclxuXHQgKiDkuI3kvb/nlKjlsI/oqqrlrrbmj5DkvpvnmoQgdHh0IOS4i+i8iemAo+e1kFxyXG5cdCAqL1xyXG5cdGRpc2FibGVUeHRkb3dubG9hZD86IGJvb2xlYW4sXHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIElEb3dubG9hZE9wdGlvbnMgPSBOb3ZlbFNpdGVEZW1vLklEb3dubG9hZE9wdGlvbnMgJiBJT3B0aW9uc1BsdXNcclxuZXhwb3J0IHR5cGUgSU9wdGlvbnNSdW50aW1lID0gTm92ZWxTaXRlRGVtby5JT3B0aW9uc1J1bnRpbWUgJiBJRG93bmxvYWRPcHRpb25zICYgSU9wdGlvbnNQbHVzXHJcblxyXG5Ac3RhdGljSW1wbGVtZW50czxOb3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVTeW9zZXR1Pj4oKVxyXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlU3lvc2V0dSBleHRlbmRzIE5vdmVsU2l0ZURlbW8uTm92ZWxTaXRlXHJcbntcclxuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gJ3N5b3NldHUnO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihvcHRpb25zOiBJRG93bmxvYWRPcHRpb25zLCAuLi5hcmd2KVxyXG5cdHtcclxuXHRcdHN1cGVyKG9wdGlvbnMsIC4uLmFyZ3YpO1xyXG5cclxuXHRcdHRoaXMub3B0aW9uc0luaXQucmV0cnlEZWxheSA9IHRoaXMub3B0aW9uc0luaXQucmV0cnlEZWxheSB8fCAyNTAwMDtcclxuXHR9XHJcblxyXG5cdHNlc3Npb248VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiwgdXJsOiBVUkwpXHJcblx0e1xyXG5cdFx0Ly8gQHRzLWlnbm9yZVxyXG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEgPSBvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSB8fCB7fTtcclxuXHRcdG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhLm92ZXIxOCA9ICd5ZXMnO1xyXG5cclxuXHRcdC8qXHJcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YS5zYXNpZW5vID0gMDtcclxuXHRcdG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhLmxpbmVoZWlnaHQgPSAwO1xyXG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEuZm9udHNpemUgPSAwO1xyXG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEubm92ZWxsYXlvdXQgPSAwO1xyXG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEuZml4X21lbnVfYmFyID0gMDtcclxuXHRcdCovXHJcblxyXG5cdFx0c3VwZXIuc2Vzc2lvbihvcHRpb25zUnVudGltZSwgdXJsKTtcclxuXHJcblx0XHQvL2xldCB1cmwgPSBvcHRpb25zUnVudGltZVtTWU1CT0xfQ0FDSEVdLnVybDtcclxuXHJcblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyXHJcblx0XHRcdC8vLnNldENvb2tpZVN5bmMoJ292ZXIxOD15ZXM7IERvbWFpbj0uc3lvc2V0dS5jb207IFBhdGg9LzsgaG9zdE9ubHk9ZmFsc2UnLCB1cmwuaHJlZilcclxuXHRcdDtcclxuXHJcbi8vXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5ydW5TY3JpcHRzID0gJ2Rhbmdlcm91c2x5JztcclxuLy9cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnZpcnR1YWxDb25zb2xlID0gZmFsc2U7XHJcblxyXG5cdFx0Ly9vcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgPSBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgfHwge307XHJcblxyXG4vL1x0XHRpZiAoIW9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucy5qYXIpXHJcbi8vXHRcdHtcclxuXHRcdFx0Ly9vcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMuamFyID0gb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphci53cmFwRm9yUmVxdWVzdCgpO1xyXG4vL1x0XHR9XHJcblxyXG5cdFx0Ly9vcHRpb25zUnVudGltZS5vcHRpb25zSlNET00udXNlckFnZW50ID0gJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS83MS4wLjM1NzguOTggU2FmYXJpLzUzNy4zNic7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cclxuXHRkb3dubG9hZCh1cmw6IHN0cmluZyB8IFVSTCwgZG93bmxvYWRPcHRpb25zOiBJRG93bmxvYWRPcHRpb25zID0ge30pXHJcblx0e1xyXG5cdFx0cmV0dXJuIHN1cGVyLmRvd25sb2FkKHVybCwgZG93bmxvYWRPcHRpb25zKTtcclxuXHR9XHJcblxyXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldCwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlKTogc3RyaW5nXHJcblx0e1xyXG5cdFx0aWYgKCFyZXQpXHJcblx0XHR7XHJcblx0XHRcdHJldHVybiAnJztcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIW9wdGlvbnNSdW50aW1lLmRpc2FibGVUeHRkb3dubG9hZClcclxuXHRcdHtcclxuXHRcdFx0cmV0dXJuIHJldC5ib2R5O1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBbXHJcblx0XHRcdHJldC5kb20uJCgnI25vdmVsX3AnKS50ZXh0KCksXHJcblx0XHRcdHJldC5kb20uJCgnI25vdmVsX2hvbmJ1bicpLnRleHQoKSxcclxuXHRcdFx0cmV0LmRvbS4kKCcjbm92ZWxfYScpLnRleHQoKSxcclxuXHRcdF0uZmlsdGVyKGZ1bmN0aW9uICh2KVxyXG5cdFx0e1xyXG5cdFx0XHRyZXR1cm4gdjtcclxuXHRcdH0pLmpvaW4oJ1xcblxcbj09PT09PT09PT09PT09PT09PVxcblxcbicpO1xyXG5cdH1cclxuXHJcblx0cHJvdGVjdGVkIF9jcmVhdGVDaGFwdGVyVXJsPFQgPSBJT3B0aW9uc1J1bnRpbWUgJiBJRG93bmxvYWRPcHRpb25zPih7XHJcblx0XHRub3ZlbCxcclxuXHRcdHZvbHVtZSxcclxuXHRcdGNoYXB0ZXIsXHJcblx0fToge1xyXG5cdFx0bm92ZWw6IE5vdmVsU2l0ZS5JTm92ZWwsXHJcblx0XHR2b2x1bWU6IE5vdmVsU2l0ZS5JVm9sdW1lLFxyXG5cdFx0Y2hhcHRlcjogTm92ZWxTaXRlLklDaGFwdGVyLFxyXG5cdH0sIG9wdGlvbnNSdW50aW1lPzogVCAmIElPcHRpb25zUnVudGltZSk6IFVSTFxyXG5cdHtcclxuXHRcdGlmIChvcHRpb25zUnVudGltZS5kaXNhYmxlVHh0ZG93bmxvYWQpXHJcblx0XHR7XHJcblx0XHRcdGxldCB1cmwgPSB0aGlzLm1ha2VVcmwoe1xyXG5cdFx0XHRcdGNoYXB0ZXJfaWQ6IGNoYXB0ZXIuY2hhcHRlcl9pZCxcclxuXHRcdFx0XHRub3ZlbF9pZDogbm92ZWwudXJsX2RhdGEubm92ZWxfaWQsXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIHVybDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gc3VwZXIuX2NyZWF0ZUNoYXB0ZXJVcmwoe1xyXG5cdFx0XHRub3ZlbCxcclxuXHRcdFx0dm9sdW1lLFxyXG5cdFx0XHRjaGFwdGVyLFxyXG5cdFx0fSwgb3B0aW9uc1J1bnRpbWUpO1xyXG5cdH1cclxuXHJcblx0cHJvdGVjdGVkIF9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMgPSB7fSwgLi4ub3B0cylcclxuXHR7XHJcblx0XHRvcHRpb25zW3RoaXMuSURLRVldID0ge1xyXG5cdFx0XHR0eHRkb3dubG9hZF9pZDogb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbC5ub3ZlbF9zeW9zZXR1X2lkIHx8ICcnLFxyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gc3VwZXIuX3NhdmVSZWFkbWUob3B0aW9uc1J1bnRpbWUsIG9wdGlvbnMsIHtcclxuXHRcdFx0b3B0aW9uczoge1xyXG5cdFx0XHRcdHRleHRsYXlvdXQ6IHtcclxuXHRcdFx0XHRcdGFsbG93X2xmMjogdHJ1ZSxcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHR9LCAuLi5vcHRzKTtcclxuXHR9XHJcblxyXG5cdG1ha2VVcmwodXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sID86IGJvb2xlYW4pOiBVUkxcclxuXHR7XHJcblx0XHRsZXQgc3ViZG9tYWluID0gdXJsb2JqLm5vdmVsX3IxOCA/ICdub3ZlbDE4JyA6ICduY29kZSc7XHJcblxyXG5cdFx0aWYgKHVybG9iai5ub3ZlbF9waWQgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpXHJcblx0XHR7XHJcblx0XHRcdC8vIEB0cy1pZ25vcmVcclxuXHRcdFx0cmV0dXJuIG5ldyBVUkwoYGh0dHBzOi8vJHtzdWJkb21haW59LnN5b3NldHUuY29tL3R4dGRvd25sb2FkL2Rsc3RhcnQvbmNvZGUvJHt1cmxvYmoubm92ZWxfcGlkfS8/bm89JHt1cmxvYmouY2hhcHRlcl9pZH0maGFua2FrdT0wJmNvZGU9dXRmLTgma2FpZ3lvPWNybGZgKTtcclxuXHRcdH1cclxuXHJcblx0XHRsZXQgcGFkID0gKCFib29sICYmIHVybG9iai5jaGFwdGVyX2lkKSA/IHVybG9iai5jaGFwdGVyX2lkIDogJyc7XHJcblxyXG5cdFx0Ly8gQHRzLWlnbm9yZVxyXG5cdFx0cmV0dXJuIG5ldyBVUkwoYGh0dHA6Ly8ke3N1YmRvbWFpbn0uc3lvc2V0dS5jb20vJHt1cmxvYmoubm92ZWxfaWR9LyR7cGFkfWApO1xyXG5cdH1cclxuXHJcblx0cGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwpOiBOb3ZlbFNpdGUuSVBhcnNlVXJsXHJcblx0e1xyXG5cdFx0bGV0IHVybG9iaiA9IHtcclxuXHRcdFx0dXJsLFxyXG5cclxuXHRcdFx0bm92ZWxfcGlkOiBudWxsLFxyXG5cdFx0XHRub3ZlbF9pZDogbnVsbCxcclxuXHRcdFx0Y2hhcHRlcl9pZDogbnVsbCxcclxuXHJcblx0XHRcdG5vdmVsX3IxODogbnVsbCxcclxuXHRcdH07XHJcblxyXG5cdFx0Ly91cmwgPSB1cmwudG9TdHJpbmcoKTtcclxuXHJcblx0XHR0cnlcclxuXHRcdHtcclxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxyXG5cdFx0XHR1cmxvYmoudXJsID0gbmV3IFVSTCh1cmwpO1xyXG5cdFx0XHQvLyBAdHMtaWdub3JlXHJcblx0XHRcdHVybCA9IHVybG9iai51cmwuaHJlZjtcclxuXHRcdH1cclxuXHRcdGNhdGNoIChlKVxyXG5cdFx0e1xyXG5cdFx0XHRjb25zb2xlLndhcm4oZS50b1N0cmluZygpICsgYCBcIiR7dXJsfVwiYCk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHR5cGVvZiB1cmwgIT0gJ3N0cmluZycpXHJcblx0XHR7XHJcblx0XHRcdC8vIEB0cy1pZ25vcmVcclxuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcih1cmwpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCByOiBSZWdFeHA7XHJcblx0XHRsZXQgbTtcclxuXHJcblx0XHRyID0gL14obltcXHddezUsNn0pJC87XHJcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxyXG5cdFx0e1xyXG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xyXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xyXG5cdFx0fVxyXG5cclxuXHRcdHIgPSAvKG5vdmVsMTgpXFwuc3lvc2V0dVxcLmNvbS87XHJcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxyXG5cdFx0e1xyXG5cdFx0XHR1cmxvYmoubm92ZWxfcjE4ID0gbVsxXTtcclxuXHRcdH1cclxuXHJcblx0XHRyID0gL3R4dGRvd25sb2FkXFwvZGxzdGFydFxcL25jb2RlXFwvKFxcZCspLztcclxuXHRcdGlmIChtID0gci5leGVjKHVybCkpXHJcblx0XHR7XHJcblx0XHRcdHVybG9iai5ub3ZlbF9waWQgPSBtWzFdO1xyXG5cclxuXHRcdFx0cmV0dXJuIHVybG9iajtcclxuXHRcdH1cclxuXHJcblx0XHRyID0gL1xcLnN5b3NldHVcXC5jb21cXC8oblxcdyspKD86XFwvPyhcXGQrKSk/LztcclxuXHRcdGlmIChtID0gci5leGVjKHVybCkpXHJcblx0XHR7XHJcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XHJcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVsyXTtcclxuXHJcblx0XHRcdHJldHVybiB1cmxvYmo7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHVybG9iajtcclxuXHR9XHJcblxyXG5cdHByb3RlY3RlZCBfZmV0Y2hDaGFwdGVyPFQ+KHVybDogVVJMLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSlcclxuXHR7XHJcblx0XHRsZXQgdHJ5ZWQ6IGJvb2xlYW47XHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHJcblx0XHRsZXQgX2ZldGNoQ2hhcHRlciA9IHN1cGVyLl9mZXRjaENoYXB0ZXI7XHJcblxyXG5cdFx0cmV0dXJuIHN1cGVyLl9mZXRjaENoYXB0ZXIodXJsLCBvcHRpb25zUnVudGltZSlcclxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKHJldClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGNvbnN0IGRvbSA9IHJldC5kb207XHJcblxyXG5cdFx0XHRcdGlmICghdHJ5ZWQgJiYgZG9tICYmIGRvbS4kKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5sZW5ndGgpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xyXG5cclxuXHRcdFx0XHRcdC8vY29uc29sZS5lcnJvcihg54Sh5rOV5oiQ5Yqf6K6A5Y+WIFIxOCDpoIHpnaJgLCB1cmwuaHJlZik7XHJcblxyXG5cdFx0XHRcdFx0dHJ5ZWQgPSB0cnVlO1xyXG5cclxuXHRcdFx0XHRcdHRyeVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHQkKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5jbGljaygpO1xyXG5cdFx0XHRcdFx0XHQkKCcjbW9kYWwgLnllcyAjeWVzMTgnKVswXS5jbGljaygpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Y2F0Y2ggKGUpXHJcblx0XHRcdFx0XHR7XHJcblxyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIuc2V0Q29va2llU3luYygnb3ZlcjE4PXllczsgRG9tYWluPS5zeW9zZXR1LmNvbTsgUGF0aD0vOyBob3N0T25seT1mYWxzZScsIHVybCk7XHJcblx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyLnNldENvb2tpZVN5bmMoYG92ZXIxOD15ZXM7IERvbWFpbj0ke2RvbS51cmwuaG9zdH07IFBhdGg9LzsgaG9zdE9ubHk9ZmFsc2VgLCBkb20udXJsKTtcclxuXHJcblx0XHRcdFx0XHQvL2NvbnNvbGUuZGVidWcob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphci5nZXRBbGxDb29raWVzKCkpO1xyXG5cclxuXHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZWZlcnJlciA9IGRvbS51cmw7XHJcblx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgPSBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgfHwge307XHJcblx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMuZm9ybSA9IGRvbS51cmw7XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIF9mZXRjaENoYXB0ZXIuY2FsbChzZWxmLCB1cmwsIG9wdGlvbnNSdW50aW1lKVxyXG5cdFx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAocmV0KVxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0Y29uc3QgZG9tID0gcmV0LmRvbTtcclxuXHRcdFx0XHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmICgkKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5sZW5ndGgpXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcihg54Sh5rOV5oiQ5Yqf6K6A5Y+WIFIxOCDpoIHpnaJgLCB1cmwuaHJlZik7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0Ly9wcm9jZXNzLmV4aXQoKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXQ7XHJcblx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gcmV0O1xyXG5cdFx0XHR9KVxyXG5cdH1cclxuXHJcblx0YXN5bmMgX25vdmVsMTg8VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KHVybCwgZG9tOiBJSlNET00sIG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9KTogUHJvbWlzZTxJSlNET00+XHJcblx0e1xyXG5cdFx0Y29uc3QgJCA9IGRvbS4kO1xyXG5cclxuXHRcdGlmICghJCgnI25vdmVsX2NvbnRlbnRzJykubGVuZ3RoIHx8ICQoJyNtb2RhbCAueWVzICN5ZXMxOCcpLmxlbmd0aClcclxuXHRcdHtcclxuXHRcdFx0Ly9jb25zb2xlLmxvZyhkb20udXJsLCBkb20uX29wdGlvbnMpO1xyXG5cclxuXHRcdFx0JCgnI21vZGFsIC55ZXMgI3llczE4JykuY2xpY2soKTtcclxuXHJcblx0XHRcdGRvbS5fb3B0aW9ucy5yZXF1ZXN0T3B0aW9ucy5qYXIuc2V0Q29va2llKCdvdmVyMTg9eWVzOyBEb21haW49LnN5b3NldHUuY29tOyBQYXRoPS87IGhvc3RPbmx5PWZhbHNlJywgdXJsKTtcclxuXHJcblx0XHRcdC8vY29uc29sZS5sb2coZG9tLnNlcmlhbGl6ZSgpKTtcclxuXHJcblx0XHRcdHJldHVybiBmcm9tVVJMKHVybCwgT2JqZWN0LmFzc2lnbihvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00sIHtcclxuXHJcblx0XHRcdFx0Ly9jb29raWVKYXI6IGRvbS5fb3B0aW9ucy5yZXF1ZXN0T3B0aW9ucy5qYXIuX2phcixcclxuXHRcdFx0XHQvL3JlcXVlc3RPcHRpb25zOiBkb20uX29wdGlvbnMucmVxdWVzdE9wdGlvbnMsXHJcblxyXG5cdFx0XHR9IGFzIElGcm9tVXJsT3B0aW9ucykpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vY29uc29sZS5sb2coZG9tLl9vcHRpb25zLnJlcXVlc3RPcHRpb25zLmphcik7XHJcblxyXG5cdFx0cmV0dXJuIGRvbTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4odXJsOiBzdHJpbmcgfCBVUkwsXHJcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fVxyXG5cdCk6IFByb21pc2U8SU5vdmVsPlxyXG5cdHtcclxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cclxuXHRcdHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybCh1cmwgYXMgYW55KTtcclxuXHJcblx0XHRyZXR1cm4gYXdhaXQgZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcclxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0cmV0dXJuIHNlbGYuX25vdmVsMTg8VD4odXJsLCBkb20sIG9wdGlvbnNSdW50aW1lKTtcclxuXHRcdFx0fSlcclxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gZG9tLiQoJy5ub3ZlbF90aXRsZScpLnRleHQoKTtcclxuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yID0gbm92ZWxUZXh0LnRyaW0oZG9tXHJcblx0XHRcdFx0XHQuJCgnLm5vdmVsX3dyaXRlcm5hbWUgYSwgLm5vdmVsX3dyaXRlcm5hbWUnKVxyXG5cdFx0XHRcdFx0LmVxKC0xKVxyXG5cdFx0XHRcdFx0LnRleHQoKSlcclxuXHRcdFx0XHRcdC5yZXBsYWNlKC9eLirkvZzogIXvvJovLCAnJylcclxuXHRcdFx0XHQ7XHJcblxyXG5cdFx0XHRcdGxldCBub3ZlbF9kZXNjID0gZG9tLiQoJyNub3ZlbF9leCcpLnRleHQoKTtcclxuXHJcblx0XHRcdFx0bGV0IG5vdmVsX3B1Ymxpc2hlciA9IHNlbGYuSURLRVk7XHJcblxyXG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwoZG9tLnVybC5ocmVmKTtcclxuXHJcblx0XHRcdFx0bGV0IHZvbHVtZV9saXN0ID0gW10gYXMgTm92ZWxTaXRlLklWb2x1bWVbXTtcclxuXHJcblx0XHRcdFx0bGV0IGN1cnJlbnRWb2x1bWU6IE5vdmVsU2l0ZS5JVm9sdW1lO1xyXG5cclxuXHRcdFx0XHRsZXQgdGFibGUgPSBkb20uJCgnLmluZGV4X2JveCcpLmZpbmQoJz4gLmNoYXB0ZXJfdGl0bGUsIC5ub3ZlbF9zdWJsaXN0MicpO1xyXG5cclxuXHRcdFx0XHRsZXQgX2NhY2hlX2RhdGVzID0gW107XHJcblxyXG5cdFx0XHRcdGxldCBub3ZlbF9zZXJpZXNfdGl0bGU7XHJcblxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGxldCBhID0gZG9tLiQoJyNub3ZlbF9jb250ZW50cyAuc2VyaWVzX3RpdGxlJykudGV4dCgpXHJcblx0XHRcdFx0XHRcdC5yZXBsYWNlKC9bXFxyXFxuXFx0XSt8Xlxccyt8XFxzKyQvZywgJycpXHJcblx0XHRcdFx0XHQ7XHJcblx0XHRcdFx0XHRpZiAoYSlcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0bm92ZWxfc2VyaWVzX3RpdGxlID0gYTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGxldCBub3ZlbF9zeW9zZXR1X2lkO1xyXG5cclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRsZXQgJCA9IGRvbS4kO1xyXG5cclxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coZG9tLnNlcmlhbGl6ZSgpKTtcclxuXHJcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKCQoJyNub3ZlbF9mb290ZXInKSk7XHJcblxyXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygkKCcjbm92ZWxfZm9vdGVyJykuZmluZCgnLnVuZGVybmF2aSBhW2hyZWYqPVwidHh0ZG93bmxvYWRcIl0nKSk7XHJcblxyXG5cdFx0XHRcdFx0bGV0IG07XHJcblx0XHRcdFx0XHRsZXQgZHQgPSBkb20uJCgnI25vdmVsX2Zvb3RlciAudW5kZXJuYXZpIGFbaHJlZio9XCJ0eHRkb3dubG9hZFwiXScpLnByb3AoJ2hyZWYnKTtcclxuXHJcblx0XHRcdFx0XHRpZiAoZHQgJiYgKG0gPSBkdC5tYXRjaCgvbmNvZGVcXC8oXFxkKykvKSkpXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdG5vdmVsX3N5b3NldHVfaWQgPSBtWzFdO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoIW9wdGlvbnNSdW50aW1lLmRpc2FibGVUeHRkb3dubG9hZClcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGDlrpjmlrkgdHh0IOS4i+i8ieWKn+iDvemBreemgeeUqO+8jOaIluiri+S9v+eUqCBjb29raWVzIOeZu+WFpe+8jOaIluWwhyBkaXNhYmxlVHh0ZG93bmxvYWQg6Kit54K6IHRydWVgKVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dGFibGVcclxuXHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleClcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0bGV0IHRyID0gZG9tLiQodGhpcyk7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAodHIuaXMoJy5jaGFwdGVyX3RpdGxlJykpXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcclxuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxyXG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiB0ci50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLFxyXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9saXN0OiBbXSxcclxuXHRcdFx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGlmICghY3VycmVudFZvbHVtZSlcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiB2b2x1bWVfbGlzdC5sZW5ndGgsXHJcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZTogJ251bGwnLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxyXG5cdFx0XHRcdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdGxldCBhID0gdHIuZmluZCgnLnN1YnRpdGxlIGEnKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfZGF0ZTtcclxuXHRcdFx0XHRcdFx0XHRsZXQgZGQ7XHJcblx0XHRcdFx0XHRcdFx0bGV0IGRhID0gdHIuZmluZCgnLmxvbmdfdXBkYXRlJyk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmIChkYS5maW5kKCdzcGFuW3RpdGxlKj1cIi9cIl0nKS5sZW5ndGgpXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGQgPSBkYS5maW5kKCdzcGFuW3RpdGxlKj1cIi9cIl0nKS5hdHRyKCd0aXRsZScpLnJlcGxhY2UoL+aUueeov3xeXFxzK3xcXHMrJC9nLCAnJyk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoIWRkKVxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGRhLmZpbmQoJyonKS5yZW1vdmUoKTtcclxuXHRcdFx0XHRcdFx0XHRcdGRkID0gZGEudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmIChkZClcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2RhdGUgPSBtb21lbnQoZGQsICdZWVlZL01NL0REIEhIOm1tJykubG9jYWwoKTtcclxuXHRcdFx0XHRcdFx0XHRcdF9jYWNoZV9kYXRlcy5wdXNoKGNoYXB0ZXJfZGF0ZS51bml4KCkpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0bGV0IGhyZWYgPSBhLnByb3AoJ2hyZWYnKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0bGV0IGRhdGEgPSBzZWxmLnBhcnNlVXJsKGhyZWYpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoIWRhdGEuY2hhcHRlcl9pZClcclxuXHRcdFx0XHRcdFx0XHR7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHRyLmZpbmQoJy5ib29rbWFya2VyX25vdycpLmxlbmd0aClcclxuXHRcdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0LyoqXHJcblx0XHRcdFx0XHRcdFx0XHRcdCAqIGZpeCBodHRwczovL25jb2RlLnN5b3NldHUuY29tL243NjM3ZGovXHJcblx0XHRcdFx0XHRcdFx0XHRcdCAqL1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2codHIucHJvcChcIm91dGVySFRNTFwiKSk7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhLnByb3AoXCJvdXRlckhUTUxcIikpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYSk7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGhyZWYpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYS5hdHRyKCdocmVmJykpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2cobmV3IFVSTChocmVmLCBkb20udXJsKSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZG9tLl9vcHRpb25zKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YSA9IHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dXJsOiBudWxsLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRub3ZlbF9waWQ6IG5vdmVsX3N5b3NldHVfaWQgYXMgc3RyaW5nLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQgYXMgc3RyaW5nLFxyXG5cdFx0XHRcdFx0XHRcdFx0fSBhcyBhbnk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0aHJlZiA9IHNlbGYubWFrZVVybChkYXRhKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRkYXRhLnVybCA9IGhyZWY7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lXHJcblx0XHRcdFx0XHRcdFx0XHQuY2hhcHRlcl9saXN0XHJcblx0XHRcdFx0XHRcdFx0XHQucHVzaCh7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaW5kZXg6IGN1cnJlbnRWb2x1bWUuY2hhcHRlcl9saXN0Lmxlbmd0aCxcclxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZTogYS50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsOiBocmVmLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhOiBkYXRhLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2RhdGUsXHJcblx0XHRcdFx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0XHRcdDtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHQ7XHJcblxyXG5cdFx0XHRcdF9jYWNoZV9kYXRlcy5zb3J0KCk7XHJcblxyXG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlID0gbW9tZW50LnVuaXgoX2NhY2hlX2RhdGVzW19jYWNoZV9kYXRlcy5sZW5ndGggLSAxXSkubG9jYWwoKTtcclxuXHJcblx0XHRcdFx0bGV0IGEgPSBhd2FpdCBmcm9tVVJMKGBodHRwczovLyR7dXJsX2RhdGEubm92ZWxfcjE4XHJcblx0XHRcdFx0XHQ/ICduYXJvdTE4J1xyXG5cdFx0XHRcdFx0OiAnbmFyb3UnfS5kaXAuanAvc2VhcmNoLnBocD90ZXh0PSR7dXJsX2RhdGEubm92ZWxfaWR9Jm5vdmVsPWFsbCZnZW5yZT1hbGwmbmV3X2dlbnJlPWFsbCZsZW5ndGg9MCZkb3duPTAmdXA9MTAwYCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxyXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKGRvbSlcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0bGV0IGgyID0gZG9tLiQoYGRpdjpoYXMoPiBoMi5zZWFyY2g6aGFzKD4gYVtocmVmKj1cIiR7dXJsX2RhdGEubm92ZWxfaWR9XCJdKSlgKS5lcSgwKTtcclxuXHJcblx0XHRcdFx0XHRcdGlmICghaDIubGVuZ3RoKVxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0aDIgPSBkb20uJChgaDI6aGFzKD4gYVtocmVmKj1cIiR7dXJsX2RhdGEubm92ZWxfaWR9XCJdKWApLmVxKDApO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdC8vY29uc29sZS53YXJuKGBjYW4gbm90IGZvdW5kIGtleXdvcmQgXCIke3VybF9kYXRhLm5vdmVsX2lkfVwiLCB3aWxsIHRyeSB1c2UgdGl0bGUgc2VhcmNoYCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdHJldHVybiBmcm9tVVJMKGBodHRwczovLyR7dXJsX2RhdGEubm92ZWxfcjE4XHJcblx0XHRcdFx0XHRcdFx0XHQ/ICduYXJvdTE4J1xyXG5cdFx0XHRcdFx0XHRcdFx0OiAnbmFyb3UnfS5kaXAuanAvc2VhcmNoLnBocD90ZXh0PSR7bm92ZWxfdGl0bGV9Jm5vdmVsPWFsbCZnZW5yZT1hbGwmbmV3X2dlbnJlPWFsbCZsZW5ndGg9MCZkb3duPTAmdXA9MTAwYCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxyXG5cdFx0XHRcdFx0XHRcdFx0O1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZG9tO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb20pXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coZG9tLnVybCk7XHJcblxyXG5cdFx0XHRcdFx0XHRsZXQgZGF0YTogSU1kY29uZk1ldGEgPSB7fTtcclxuXHJcblx0XHRcdFx0XHRcdGxldCBoMiA9IGRvbS4kKGBkaXY6aGFzKD4gaDIuc2VhcmNoOmhhcyg+IGFbaHJlZio9XCIke3VybF9kYXRhLm5vdmVsX2lkfVwiXSkpYCkuZXEoMCk7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoIWgyLmxlbmd0aClcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGgyID0gZG9tLiQoYGgyOmhhcyg+IGFbaHJlZio9XCIke3VybF9kYXRhLm5vdmVsX2lkfVwiXSlgKS5lcSgwKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0bGV0IHNlYXJjaF9sZWZ0ID0gaDIuc2libGluZ3MoJy5zZWFyY2hfbGVmdCcpLmVxKDApO1xyXG5cdFx0XHRcdFx0XHRsZXQgc2VhcmNoX3JpZ2h0ID0gaDIuc2libGluZ3MoJy5zZWFyY2hfcmlnaHQnKS5lcSgwKTtcclxuXHJcblx0XHRcdFx0XHRcdGlmICghaDIubGVuZ3RoKVxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygxMTExMTExMTExMTExMTExMTExMTEpO1xyXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUud2FybihgY2FuIG5vdCBmb3VuZCBrZXl3b3JkIGZvciAke3VybF9kYXRhLm5vdmVsX2lkfWApO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZGF0YTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhzZWFyY2hfbGVmdCk7XHJcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coc2VhcmNoX3JpZ2h0KTtcclxuXHJcblx0XHRcdFx0XHRcdGRhdGEubm92ZWwgPSB7fTtcclxuXHJcblx0XHRcdFx0XHRcdGRhdGEubm92ZWwuc3RhdHVzID0gc2VhcmNoX2xlZnQuZmluZCgnLm5vdmVsX3R5cGUnKS50ZXh0KCkudHJpbSgpO1xyXG5cdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MgPSBbXTtcclxuXHJcblx0XHRcdFx0XHRcdGlmIChkYXRhLm5vdmVsLnN0YXR1cyA9PT0gJ+WujOe1kOa4iCcpXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRkYXRhLm5vdmVsLm5vdmVsX3N0YXR1cyB8PSBFbnVtTm92ZWxTdGF0dXMuQVVUSE9SX0RPTkU7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdHNlYXJjaF9yaWdodC5maW5kKCcua2V5d29yZCBhJylcclxuXHRcdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0bGV0IGsgPSBkb20uJChlbGVtKVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQudGV4dCgpXHJcblx0XHRcdFx0XHRcdFx0XHRcdC50cmltKClcclxuXHRcdFx0XHRcdFx0XHRcdFx0LnNwbGl0KC9bXFwvXFxzXS8pXHJcblx0XHRcdFx0XHRcdFx0XHRcdC5tYXAoZnVuY3Rpb24gKHMpXHJcblx0XHRcdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcy50cmltKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHRcdFx0XHRcdC5maWx0ZXIoKHYpID0+IHYpXHJcblx0XHRcdFx0XHRcdFx0XHQ7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzID0gZGF0YS5ub3ZlbC50YWdzLmNvbmNhdChrKTtcclxuXHRcdFx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0XHQ7XHJcblxyXG5cdFx0XHRcdFx0XHRkYXRhLmxpbmsgPSBbXTtcclxuXHJcblx0XHRcdFx0XHRcdGRhdGEubGluay5wdXNoKGBbZGlwLmpwXSgke2RvbS51cmx9KSAtIOWwj+iqrOWutuOBq+OBquOCjeOBhuOAgOabtOaWsOaDheWgseaknOe0omApO1xyXG5cclxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkYXRhKTtcclxuXHJcblx0XHRcdFx0XHRcdHJldHVybiBkYXRhO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZSlcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcihlKTtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcihgY2FuJ3QgZG93bmxvYWQgbm92ZWwgZXh0cmEgaW5mb2ApO1xyXG5cclxuXHRcdFx0XHRcdFx0cmV0dXJuIHt9O1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHQ7XHJcblxyXG5cdFx0XHRcdHJldHVybiB7XHJcblxyXG5cdFx0XHRcdFx0Li4uYSxcclxuXHJcblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXHJcblx0XHRcdFx0XHR1cmxfZGF0YSxcclxuXHJcblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcclxuXHRcdFx0XHRcdG5vdmVsX2F1dGhvcixcclxuXHJcblx0XHRcdFx0XHRub3ZlbF9kZXNjLFxyXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSxcclxuXHRcdFx0XHRcdG5vdmVsX3B1Ymxpc2hlcixcclxuXHJcblx0XHRcdFx0XHRub3ZlbF9zZXJpZXNfdGl0bGUsXHJcblxyXG5cdFx0XHRcdFx0bm92ZWxfc3lvc2V0dV9pZCxcclxuXHJcblx0XHRcdFx0XHR2b2x1bWVfbGlzdCxcclxuXHJcblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXHJcblxyXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXHJcblx0XHRcdFx0fSBhcyBJTm92ZWw7XHJcblx0XHRcdH0pXHJcblx0XHRcdDtcclxuXHR9XHJcblxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVTeW9zZXR1O1xyXG5cclxuIl19