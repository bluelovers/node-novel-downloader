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
                data.link = data.link || [];
                data.link.push(`[dip.jp](${dom.url}) - 小説家になろう　更新情報検索`);
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
    index_1.staticImplements()
], NovelSiteSyosetu);
exports.NovelSiteSyosetu = NovelSiteSyosetu;
exports.default = NovelSiteSyosetu;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLHFEQUE0RDtBQU01RCw2Q0FBK0Q7QUFHL0QseUNBQWdDO0FBR2hDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFFbEMsOENBQStDO0FBQy9DLDJDQUFtQztBQUVuQyx3Q0FBeUM7QUFpQnpDLElBQWEsZ0JBQWdCLEdBQTdCLE1BQWEsZ0JBQWlCLFNBQVEsYUFBYSxDQUFDLFNBQVM7SUFJNUQsWUFBWSxPQUF5QixFQUFFLEdBQUcsSUFBSTtRQUU3QyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFFeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxPQUFPLENBQWdDLGNBQTZDLEVBQUUsR0FBUTtRQUU3RixhQUFhO1FBQ2IsY0FBYyxDQUFDLFdBQVcsR0FBRyxjQUFjLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQztRQUM5RCxjQUFjLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFFMUM7Ozs7OztVQU1FO1FBRUYsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFbkMsNkNBQTZDO1FBRTdDLGNBQWMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUVwQztRQUVILDJEQUEyRDtRQUMzRCx1REFBdUQ7UUFFckQsZ0dBQWdHO1FBRWxHLHdEQUF3RDtRQUN4RCxLQUFLO1FBQ0YsMEdBQTBHO1FBQzdHLEtBQUs7UUFFSCwrSkFBK0o7UUFFL0osT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsUUFBUSxDQUFDLEdBQWlCLEVBQUUsa0JBQW9DLEVBQUU7UUFFakUsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxlQUFlLENB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dEIsSUFBSSxLQUFLLEdBQUcsa0JBQWtCOzZCQUM1QixPQUFPLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQzs2QkFDOUIsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FDckI7d0JBRUQsYUFBYTt3QkFDYixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDOUM7aUJBQ0Q7YUFDRDtZQUVELE9BQU8sa0JBRUgsQ0FBQyxJQUVKLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUNaLFFBQVE7Z0JBRVIsV0FBVztnQkFDWCxZQUFZO2dCQUVaLFVBQVU7Z0JBQ1YsVUFBVTtnQkFDVixlQUFlO2dCQUVmLGtCQUFrQjtnQkFDbEIsdUJBQXVCO2dCQUV2QixnQkFBZ0I7Z0JBRWhCLFdBQVcsRUFFWCxTQUFTLEVBQUUsY0FBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBRTNCLElBQUksRUFBRSxFQUFjLEdBQ1YsQ0FBQztRQUNiLENBQUMsQ0FBQyxDQUNEO0lBQ0gsQ0FBQztDQUVELENBQUE7QUF4bUJ1QixzQkFBSyxHQUFHLFNBQVMsQ0FBQztBQUY3QixnQkFBZ0I7SUFENUIsd0JBQWdCLEVBQWdEO0dBQ3BELGdCQUFnQixDQTBtQjVCO0FBMW1CWSw0Q0FBZ0I7QUE0bUI3QixrQkFBZSxnQkFBZ0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVudW1Ob3ZlbFN0YXR1cyB9IGZyb20gJ25vZGUtbm92ZWwtaW5mby9saWIvY29uc3QnO1xuaW1wb3J0IHsgcmV0cnlSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vZmV0Y2gnO1xuXG5pbXBvcnQgZnMsIHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBub3ZlbEluZm8sIHsgSU1kY29uZk1ldGEgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgeyBMYXp5Q29va2llLCBMYXp5Q29va2llSmFyIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcbmltcG9ydCB7IGdldEZpbGVQYXRoLCBnZXRWb2x1bWVQYXRoIH0gZnJvbSAnLi4vZnMnO1xuXG5pbXBvcnQgTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIGRlZmF1bHRKU0RPTU9wdGlvbnMsIFNZTUJPTF9DQUNIRSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5cbmltcG9ydCBOb3ZlbFNpdGVEZW1vID0gcmVxdWlyZSgnLi4vZGVtby9iYXNlJyk7XG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xuXG5pbXBvcnQgeyBjb25zb2xlIH0gZnJvbSAnLi4vLi4vdXRpbC9sb2cnO1xuXG5leHBvcnQgdHlwZSBJTm92ZWwgPSBOb3ZlbFNpdGVEZW1vLklOb3ZlbCAmIHtcblx0bm92ZWxfc3lvc2V0dV9pZDogc3RyaW5nLFxufTtcblxuZXhwb3J0IHR5cGUgSU9wdGlvbnNQbHVzID0ge1xuXHQvKipcblx0ICog5LiN5L2/55So5bCP6Kqq5a625o+Q5L6b55qEIHR4dCDkuIvovInpgKPntZBcblx0ICovXG5cdGRpc2FibGVUeHRkb3dubG9hZD86IGJvb2xlYW4sXG59XG5cbmV4cG9ydCB0eXBlIElEb3dubG9hZE9wdGlvbnMgPSBOb3ZlbFNpdGVEZW1vLklEb3dubG9hZE9wdGlvbnMgJiBJT3B0aW9uc1BsdXNcbmV4cG9ydCB0eXBlIElPcHRpb25zUnVudGltZSA9IE5vdmVsU2l0ZURlbW8uSU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucyAmIElPcHRpb25zUGx1c1xuXG5Ac3RhdGljSW1wbGVtZW50czxOb3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVTeW9zZXR1Pj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZVN5b3NldHUgZXh0ZW5kcyBOb3ZlbFNpdGVEZW1vLk5vdmVsU2l0ZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gJ3N5b3NldHUnO1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM6IElEb3dubG9hZE9wdGlvbnMsIC4uLmFyZ3YpXG5cdHtcblx0XHRzdXBlcihvcHRpb25zLCAuLi5hcmd2KTtcblxuXHRcdHRoaXMub3B0aW9uc0luaXQucmV0cnlEZWxheSA9IHRoaXMub3B0aW9uc0luaXQucmV0cnlEZWxheSB8fCAyNTAwMDtcblx0fVxuXG5cdHNlc3Npb248VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiwgdXJsOiBVUkwpXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEgPSBvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YSB8fCB7fTtcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YS5vdmVyMTggPSAneWVzJztcblxuXHRcdC8qXG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEuc2FzaWVubyA9IDA7XG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEubGluZWhlaWdodCA9IDA7XG5cdFx0b3B0aW9uc1J1bnRpbWUuc2Vzc2lvbkRhdGEuZm9udHNpemUgPSAwO1xuXHRcdG9wdGlvbnNSdW50aW1lLnNlc3Npb25EYXRhLm5vdmVsbGF5b3V0ID0gMDtcblx0XHRvcHRpb25zUnVudGltZS5zZXNzaW9uRGF0YS5maXhfbWVudV9iYXIgPSAwO1xuXHRcdCovXG5cblx0XHRzdXBlci5zZXNzaW9uKG9wdGlvbnNSdW50aW1lLCB1cmwpO1xuXG5cdFx0Ly9sZXQgdXJsID0gb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS51cmw7XG5cblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyXG5cdFx0XHQvLy5zZXRDb29raWVTeW5jKCdvdmVyMTg9eWVzOyBEb21haW49LnN5b3NldHUuY29tOyBQYXRoPS87IGhvc3RPbmx5PWZhbHNlJywgdXJsLmhyZWYpXG5cdFx0O1xuXG4vL1x0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucnVuU2NyaXB0cyA9ICdkYW5nZXJvdXNseSc7XG4vL1x0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00udmlydHVhbENvbnNvbGUgPSBmYWxzZTtcblxuXHRcdC8vb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zID0gb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zIHx8IHt9O1xuXG4vL1x0XHRpZiAoIW9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucy5qYXIpXG4vL1x0XHR7XG5cdFx0XHQvL29wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5yZXF1ZXN0T3B0aW9ucy5qYXIgPSBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00uY29va2llSmFyLndyYXBGb3JSZXF1ZXN0KCk7XG4vL1x0XHR9XG5cblx0XHQvL29wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS51c2VyQWdlbnQgPSAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzcxLjAuMzU3OC45OCBTYWZhcmkvNTM3LjM2JztcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0ZG93bmxvYWQodXJsOiBzdHJpbmcgfCBVUkwsIGRvd25sb2FkT3B0aW9uczogSURvd25sb2FkT3B0aW9ucyA9IHt9KVxuXHR7XG5cdFx0cmV0dXJuIHN1cGVyLmRvd25sb2FkKHVybCwgZG93bmxvYWRPcHRpb25zKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldCwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlKTogc3RyaW5nXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0aWYgKCFvcHRpb25zUnVudGltZS5kaXNhYmxlVHh0ZG93bmxvYWQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHJldC5ib2R5O1xuXHRcdH1cblxuXHRcdHJldHVybiBbXG5cdFx0XHRyZXQuZG9tLiQoJyNub3ZlbF9wJykudGV4dCgpLFxuXHRcdFx0cmV0LmRvbS4kKCcjbm92ZWxfaG9uYnVuJykudGV4dCgpLFxuXHRcdFx0cmV0LmRvbS4kKCcjbm92ZWxfYScpLnRleHQoKSxcblx0XHRdLmZpbHRlcihmdW5jdGlvbiAodilcblx0XHR7XG5cdFx0XHRyZXR1cm4gdjtcblx0XHR9KS5qb2luKCdcXG5cXG49PT09PT09PT09PT09PT09PT1cXG5cXG4nKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfY3JlYXRlQ2hhcHRlclVybDxUID0gSU9wdGlvbnNSdW50aW1lICYgSURvd25sb2FkT3B0aW9ucz4oe1xuXHRcdG5vdmVsLFxuXHRcdHZvbHVtZSxcblx0XHRjaGFwdGVyLFxuXHR9OiB7XG5cdFx0bm92ZWw6IE5vdmVsU2l0ZS5JTm92ZWwsXG5cdFx0dm9sdW1lOiBOb3ZlbFNpdGUuSVZvbHVtZSxcblx0XHRjaGFwdGVyOiBOb3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdH0sIG9wdGlvbnNSdW50aW1lPzogVCAmIElPcHRpb25zUnVudGltZSk6IFVSTFxuXHR7XG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lLmRpc2FibGVUeHRkb3dubG9hZClcblx0XHR7XG5cdFx0XHRsZXQgdXJsID0gdGhpcy5tYWtlVXJsKHtcblx0XHRcdFx0Y2hhcHRlcl9pZDogY2hhcHRlci5jaGFwdGVyX2lkLFxuXHRcdFx0XHRub3ZlbF9pZDogbm92ZWwudXJsX2RhdGEubm92ZWxfaWQsXG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIHVybDtcblx0XHR9XG5cblx0XHRyZXR1cm4gc3VwZXIuX2NyZWF0ZUNoYXB0ZXJVcmwoe1xuXHRcdFx0bm92ZWwsXG5cdFx0XHR2b2x1bWUsXG5cdFx0XHRjaGFwdGVyLFxuXHRcdH0sIG9wdGlvbnNSdW50aW1lKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfc2F2ZVJlYWRtZShvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lLCBvcHRpb25zID0ge30sIC4uLm9wdHMpXG5cdHtcblx0XHRvcHRpb25zW3RoaXMuSURLRVldID0ge1xuXHRcdFx0dHh0ZG93bmxvYWRfaWQ6IG9wdGlvbnNSdW50aW1lW1NZTUJPTF9DQUNIRV0ubm92ZWwubm92ZWxfc3lvc2V0dV9pZCB8fCAnJyxcblx0XHRcdHNlcmllc19pZDogb3B0aW9uc1J1bnRpbWVbU1lNQk9MX0NBQ0hFXS5ub3ZlbC5ub3ZlbF9zeW9zZXR1X3Nlcmllc19pZCB8fCAnJyxcblx0XHR9O1xuXG5cdFx0cmV0dXJuIHN1cGVyLl9zYXZlUmVhZG1lKG9wdGlvbnNSdW50aW1lLCBvcHRpb25zLCB7XG5cdFx0XHRvcHRpb25zOiB7XG5cdFx0XHRcdHRleHRsYXlvdXQ6IHtcblx0XHRcdFx0XHRhbGxvd19sZjI6IHRydWUsXG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdH0sIC4uLm9wdHMpO1xuXHR9XG5cblx0bWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2wgPzogYm9vbGVhbik6IFVSTFxuXHR7XG5cdFx0bGV0IHN1YmRvbWFpbiA9IHVybG9iai5ub3ZlbF9yMTggPyAnbm92ZWwxOCcgOiAnbmNvZGUnO1xuXG5cdFx0aWYgKHVybG9iai5ub3ZlbF9waWQgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpXG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0cmV0dXJuIG5ldyBVUkwoYGh0dHBzOi8vJHtzdWJkb21haW59LnN5b3NldHUuY29tL3R4dGRvd25sb2FkL2Rsc3RhcnQvbmNvZGUvJHt1cmxvYmoubm92ZWxfcGlkfS8/bm89JHt1cmxvYmouY2hhcHRlcl9pZH0maGFua2FrdT0wJmNvZGU9dXRmLTgma2FpZ3lvPWNybGZgKTtcblx0XHR9XG5cblx0XHRsZXQgcGFkID0gKCFib29sICYmIHVybG9iai5jaGFwdGVyX2lkKSA/IHVybG9iai5jaGFwdGVyX2lkIDogJyc7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG5ldyBVUkwoYGh0dHA6Ly8ke3N1YmRvbWFpbn0uc3lvc2V0dS5jb20vJHt1cmxvYmoubm92ZWxfaWR9LyR7cGFkfWApO1xuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwpOiBOb3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHRsZXQgdXJsb2JqID0ge1xuXHRcdFx0dXJsLFxuXG5cdFx0XHRub3ZlbF9waWQ6IG51bGwsXG5cdFx0XHRub3ZlbF9pZDogbnVsbCxcblx0XHRcdGNoYXB0ZXJfaWQ6IG51bGwsXG5cblx0XHRcdG5vdmVsX3IxODogbnVsbCxcblx0XHR9O1xuXG5cdFx0Ly91cmwgPSB1cmwudG9TdHJpbmcoKTtcblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHVybG9iai51cmwgPSBuZXcgVVJMKHVybCk7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR1cmwgPSB1cmxvYmoudXJsLmhyZWY7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUud2FybihlLnRvU3RyaW5nKCkgKyBgIFwiJHt1cmx9XCJgKTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIHVybCAhPSAnc3RyaW5nJylcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKHVybCk7XG5cdFx0fVxuXG5cdFx0bGV0IHI6IFJlZ0V4cDtcblx0XHRsZXQgbTtcblxuXHRcdHIgPSAvXihuW1xcd117NSw2fSkkLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvKG5vdmVsMTgpXFwuc3lvc2V0dVxcLmNvbS87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfcjE4ID0gbVsxXTtcblx0XHR9XG5cblx0XHRyID0gL3R4dGRvd25sb2FkXFwvZGxzdGFydFxcL25jb2RlXFwvKFxcZCspLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9waWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvXFwuc3lvc2V0dVxcLmNvbVxcLyhuXFx3KykoPzpcXC8/KFxcZCspKT8vO1xuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVsyXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyZXR1cm4gdXJsb2JqO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9mZXRjaENoYXB0ZXI8VD4odXJsOiBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0bGV0IHRyeWVkOiBib29sZWFuO1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IF9mZXRjaENoYXB0ZXIgPSBzdXBlci5fZmV0Y2hDaGFwdGVyO1xuXG5cdFx0cmV0dXJuIHN1cGVyLl9mZXRjaENoYXB0ZXIodXJsLCBvcHRpb25zUnVudGltZSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChyZXQpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChyZXQgPT0gbnVsbCkgcmV0dXJuIHJldDtcblxuXHRcdFx0XHRjb25zdCBkb20gPSByZXQuZG9tO1xuXG5cdFx0XHRcdGlmICghdHJ5ZWQgJiYgZG9tICYmIGRvbS4kKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0XHQvL2NvbnNvbGUuZXJyb3IoYOeEoeazleaIkOWKn+iugOWPliBSMTgg6aCB6Z2iYCwgdXJsLmhyZWYpO1xuXG5cdFx0XHRcdFx0dHJ5ZWQgPSB0cnVlO1xuXG5cdFx0XHRcdFx0dHJ5XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0JCgnI21vZGFsIC55ZXMgI3llczE4JykuY2xpY2soKTtcblx0XHRcdFx0XHRcdCQoJyNtb2RhbCAueWVzICN5ZXMxOCcpWzBdLmNsaWNrKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhdGNoIChlKVxuXHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTS5jb29raWVKYXIuc2V0Q29va2llU3luYygnb3ZlcjE4PXllczsgRG9tYWluPS5zeW9zZXR1LmNvbTsgUGF0aD0vOyBob3N0T25seT1mYWxzZScsIHVybCk7XG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphci5zZXRDb29raWVTeW5jKGBvdmVyMTg9eWVzOyBEb21haW49JHtkb20udXJsLmhvc3R9OyBQYXRoPS87IGhvc3RPbmx5PWZhbHNlYCwgZG9tLnVybCk7XG5cblx0XHRcdFx0XHQvL2NvbnNvbGUuZGVidWcob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLmNvb2tpZUphci5nZXRBbGxDb29raWVzKCkpO1xuXG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlZmVycmVyID0gZG9tLnVybDtcblx0XHRcdFx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgPSBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucmVxdWVzdE9wdGlvbnMgfHwge307XG5cdFx0XHRcdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJlcXVlc3RPcHRpb25zLmZvcm0gPSBkb20udXJsO1xuXG5cdFx0XHRcdFx0cmV0dXJuIF9mZXRjaENoYXB0ZXIuY2FsbChzZWxmLCB1cmwsIG9wdGlvbnNSdW50aW1lKVxuXHRcdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJldClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZG9tID0gcmV0LmRvbTtcblx0XHRcdFx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdFx0XHRcdGlmICgkKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5sZW5ndGgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGDnhKHms5XmiJDlip/oroDlj5YgUjE4IOmggemdomAsIHVybC5ocmVmKTtcblxuXHRcdFx0XHRcdFx0XHRcdC8vcHJvY2Vzcy5leGl0KCk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcmV0O1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiByZXQ7XG5cdFx0XHR9KVxuXHR9XG5cblx0YXN5bmMgX25vdmVsMTg8VCA9IE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+KHVybCwgZG9tOiBJSlNET00sIG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9KTogUHJvbWlzZTxJSlNET00+XG5cdHtcblx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRpZiAoISQoJyNub3ZlbF9jb250ZW50cycpLmxlbmd0aCB8fCAkKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhkb20udXJsLCBkb20uX29wdGlvbnMpO1xuXG5cdFx0XHQkKCcjbW9kYWwgLnllcyAjeWVzMTgnKS5jbGljaygpO1xuXG5cdFx0XHRkb20uX29wdGlvbnMucmVxdWVzdE9wdGlvbnMuamFyLnNldENvb2tpZSgnb3ZlcjE4PXllczsgRG9tYWluPS5zeW9zZXR1LmNvbTsgUGF0aD0vOyBob3N0T25seT1mYWxzZScsIHVybCk7XG5cblx0XHRcdC8vY29uc29sZS5sb2coZG9tLnNlcmlhbGl6ZSgpKTtcblxuXHRcdFx0cmV0dXJuIGZyb21VUkwodXJsLCBPYmplY3QuYXNzaWduKG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSwge1xuXG5cdFx0XHRcdC8vY29va2llSmFyOiBkb20uX29wdGlvbnMucmVxdWVzdE9wdGlvbnMuamFyLl9qYXIsXG5cdFx0XHRcdC8vcmVxdWVzdE9wdGlvbnM6IGRvbS5fb3B0aW9ucy5yZXF1ZXN0T3B0aW9ucyxcblxuXHRcdFx0fSBhcyBJRnJvbVVybE9wdGlvbnMpKTtcblx0XHR9XG5cblx0XHQvL2NvbnNvbGUubG9nKGRvbS5fb3B0aW9ucy5yZXF1ZXN0T3B0aW9ucy5qYXIpO1xuXG5cdFx0cmV0dXJuIGRvbTtcblx0fVxuXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUID0gTm92ZWxTaXRlLklPcHRpb25zUnVudGltZT4odXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge31cblx0KTogUHJvbWlzZTxJTm92ZWw+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybCh1cmwgYXMgYW55KTtcblxuXHRcdHJldHVybiBhd2FpdCBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gc2VsZi5fbm92ZWwxODxUPih1cmwsIGRvbSwgb3B0aW9uc1J1bnRpbWUpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb206IElKU0RPTSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gZG9tLiQoJy5ub3ZlbF90aXRsZScpLnRleHQoKTtcblx0XHRcdFx0bGV0IG5vdmVsX2F1dGhvciA9IG5vdmVsVGV4dC50cmltKGRvbVxuXHRcdFx0XHRcdC4kKCcubm92ZWxfd3JpdGVybmFtZSBhLCAubm92ZWxfd3JpdGVybmFtZScpXG5cdFx0XHRcdFx0LmVxKC0xKVxuXHRcdFx0XHRcdC50ZXh0KCkpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL14uKuS9nOiAhe+8mi8sICcnKVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2Rlc2MgPSBkb20uJCgnI25vdmVsX2V4JykudGV4dCgpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9wdWJsaXNoZXIgPSBzZWxmLklES0VZO1xuXG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwoZG9tLnVybC5ocmVmKTtcblxuXHRcdFx0XHRsZXQgdm9sdW1lX2xpc3QgPSBbXSBhcyBOb3ZlbFNpdGUuSVZvbHVtZVtdO1xuXG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBOb3ZlbFNpdGUuSVZvbHVtZTtcblxuXHRcdFx0XHRsZXQgdGFibGUgPSBkb20uJCgnLmluZGV4X2JveCcpLmZpbmQoJz4gLmNoYXB0ZXJfdGl0bGUsIC5ub3ZlbF9zdWJsaXN0MicpO1xuXG5cdFx0XHRcdGxldCBfY2FjaGVfZGF0ZXMgPSBbXTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfc3lvc2V0dV9pZDtcblxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coZG9tLnNlcmlhbGl6ZSgpKTtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coJCgnI25vdmVsX2Zvb3RlcicpKTtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coJCgnI25vdmVsX2Zvb3RlcicpLmZpbmQoJy51bmRlcm5hdmkgYVtocmVmKj1cInR4dGRvd25sb2FkXCJdJykpO1xuXG5cdFx0XHRcdFx0bGV0IG07XG5cdFx0XHRcdFx0bGV0IGR0ID0gZG9tLiQoJyNub3ZlbF9mb290ZXIgLnVuZGVybmF2aSBhW2hyZWYqPVwidHh0ZG93bmxvYWRcIl0nKS5wcm9wKCdocmVmJyk7XG5cblx0XHRcdFx0XHRpZiAoZHQgJiYgKG0gPSBkdC5tYXRjaCgvbmNvZGVcXC8oXFxkKykvKSkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bm92ZWxfc3lvc2V0dV9pZCA9IG1bMV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKCFvcHRpb25zUnVudGltZS5kaXNhYmxlVHh0ZG93bmxvYWQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGDlrpjmlrkgdHh0IOS4i+i8ieWKn+iDvemBreemgeeUqO+8jOaIluiri+S9v+eUqCBjb29raWVzIOeZu+WFpe+8jOaIluWwhyBkaXNhYmxlVHh0ZG93bmxvYWQg6Kit54K6IHRydWVgKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRhYmxlXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCB0ciA9IGRvbS4kKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRpZiAodHIuaXMoJy5jaGFwdGVyX3RpdGxlJykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZTogdHIudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoIWN1cnJlbnRWb2x1bWUpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiAnbnVsbCcsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgYSA9IHRyLmZpbmQoJy5zdWJ0aXRsZSBhJyk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfZGF0ZTtcblx0XHRcdFx0XHRcdFx0bGV0IGRkO1xuXHRcdFx0XHRcdFx0XHRsZXQgZGEgPSB0ci5maW5kKCcubG9uZ191cGRhdGUnKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoZGEuZmluZCgnc3Bhblt0aXRsZSo9XCIvXCJdJykubGVuZ3RoKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZGQgPSBkYS5maW5kKCdzcGFuW3RpdGxlKj1cIi9cIl0nKS5hdHRyKCd0aXRsZScpLnJlcGxhY2UoL+aUueeov3xeXFxzK3xcXHMrJC9nLCAnJyk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoIWRkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZGEuZmluZCgnKicpLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0XHRcdGRkID0gZGEudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChkZClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfZGF0ZSA9IG1vbWVudChkZCwgJ1lZWVkvTU0vREQgSEg6bW0nKS5sb2NhbCgpO1xuXHRcdFx0XHRcdFx0XHRcdF9jYWNoZV9kYXRlcy5wdXNoKGNoYXB0ZXJfZGF0ZS51bml4KCkpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0bGV0IGhyZWYgPSBhLnByb3AoJ2hyZWYnKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgZGF0YSA9IHNlbGYucGFyc2VVcmwoaHJlZik7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFkYXRhLmNoYXB0ZXJfaWQpXG5cdFx0XHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0XHRcdGlmICh0ci5maW5kKCcuYm9va21hcmtlcl9ub3cnKS5sZW5ndGgpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdFx0XHQgKiBmaXggaHR0cHM6Ly9uY29kZS5zeW9zZXR1LmNvbS9uNzYzN2RqL1xuXHRcdFx0XHRcdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2codHIucHJvcChcIm91dGVySFRNTFwiKSk7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYS5wcm9wKFwib3V0ZXJIVE1MXCIpKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhocmVmKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhLmF0dHIoJ2hyZWYnKSk7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2cobmV3IFVSTChocmVmLCBkb20udXJsKSk7XG5cblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhkb20uX29wdGlvbnMpO1xuXG5cdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkYXRhID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0dXJsOiBudWxsLFxuXHRcdFx0XHRcdFx0XHRcdFx0bm92ZWxfcGlkOiBub3ZlbF9zeW9zZXR1X2lkIGFzIHN0cmluZyxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCBhcyBzdHJpbmcsXG5cdFx0XHRcdFx0XHRcdFx0fSBhcyBhbnk7XG5cblx0XHRcdFx0XHRcdFx0XHRocmVmID0gc2VsZi5tYWtlVXJsKGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS51cmwgPSBocmVmO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZVxuXHRcdFx0XHRcdFx0XHRcdC5jaGFwdGVyX2xpc3Rcblx0XHRcdFx0XHRcdFx0XHQucHVzaCh7XG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLmNoYXB0ZXJfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlOiBhLnRleHQoKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyksXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybDogaHJlZixcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGE6IGRhdGEsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2RhdGUsXG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRfY2FjaGVfZGF0ZXMuc29ydCgpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlID0gbW9tZW50LnVuaXgoX2NhY2hlX2RhdGVzW19jYWNoZV9kYXRlcy5sZW5ndGggLSAxXSkubG9jYWwoKTtcblxuXHRcdFx0XHRsZXQgYSA9IGF3YWl0IGZyb21VUkwoYGh0dHBzOi8vJHt1cmxfZGF0YS5ub3ZlbF9yMThcblx0XHRcdFx0XHQ/ICduYXJvdTE4J1xuXHRcdFx0XHRcdDogJ25hcm91J30uZGlwLmpwL3NlYXJjaC5waHA/dGV4dD0ke3VybF9kYXRhLm5vdmVsX2lkfSZub3ZlbD1hbGwmZ2VucmU9YWxsJm5ld19nZW5yZT1hbGwmbGVuZ3RoPTAmZG93bj0wJnVwPTEwMGAsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBoMiA9IGRvbS4kKGBkaXY6aGFzKD4gaDIuc2VhcmNoOmhhcyg+IGFbaHJlZio9XCIke3VybF9kYXRhLm5vdmVsX2lkfVwiXSkpYCkuZXEoMCk7XG5cblx0XHRcdFx0XHRcdGlmICghaDIubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRoMiA9IGRvbS4kKGBoMjpoYXMoPiBhW2hyZWYqPVwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIl0pYCkuZXEoMCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICghaDIubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUud2FybihgY2FuIG5vdCBmb3VuZCBrZXl3b3JkIFwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIiwgd2lsbCB0cnkgdXNlIHRpdGxlIHNlYXJjaGApO1xuXG5cdFx0XHRcdFx0XHRcdHJldHVybiBmcm9tVVJMKGBodHRwczovLyR7dXJsX2RhdGEubm92ZWxfcjE4XG5cdFx0XHRcdFx0XHRcdFx0PyAnbmFyb3UxOCdcblx0XHRcdFx0XHRcdFx0XHQ6ICduYXJvdSd9LmRpcC5qcC9zZWFyY2gucGhwP3RleHQ9JHtub3ZlbF90aXRsZX0mbm92ZWw9YWxsJmdlbnJlPWFsbCZuZXdfZ2VucmU9YWxsJmxlbmd0aD0wJmRvd249MCZ1cD0xMDBgLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRyZXR1cm4gZG9tO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKGRvbSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRvbS51cmwpO1xuXG5cdFx0XHRcdFx0XHRsZXQgZGF0YTogSU1kY29uZk1ldGEgPSB7fTtcblxuXHRcdFx0XHRcdFx0bGV0IGgyID0gZG9tLiQoYGRpdjpoYXMoPiBoMi5zZWFyY2g6aGFzKD4gYVtocmVmKj1cIiR7dXJsX2RhdGEubm92ZWxfaWR9XCJdKSlgKS5lcSgwKTtcblxuXHRcdFx0XHRcdFx0aWYgKCFoMi5sZW5ndGgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGgyID0gZG9tLiQoYGgyOmhhcyg+IGFbaHJlZio9XCIke3VybF9kYXRhLm5vdmVsX2lkfVwiXSlgKS5lcSgwKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bGV0IHNlYXJjaF9sZWZ0ID0gaDIuc2libGluZ3MoJy5zZWFyY2hfbGVmdCcpLmVxKDApO1xuXHRcdFx0XHRcdFx0bGV0IHNlYXJjaF9yaWdodCA9IGgyLnNpYmxpbmdzKCcuc2VhcmNoX3JpZ2h0JykuZXEoMCk7XG5cblx0XHRcdFx0XHRcdGlmICghaDIubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKDExMTExMTExMTExMTExMTExMTExMSk7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUud2FybihgY2FuIG5vdCBmb3VuZCBrZXl3b3JkIGZvciAke3VybF9kYXRhLm5vdmVsX2lkfWApO1xuXG5cdFx0XHRcdFx0XHRcdHJldHVybiBkYXRhO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKHNlYXJjaF9sZWZ0KTtcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coc2VhcmNoX3JpZ2h0KTtcblxuXHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbCA9IHt9O1xuXG5cdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnN0YXR1cyA9IHNlYXJjaF9sZWZ0LmZpbmQoJy5ub3ZlbF90eXBlJykudGV4dCgpLnRyaW0oKTtcblx0XHRcdFx0XHRcdGRhdGEubm92ZWwudGFncyA9IFtdO1xuXG5cdFx0XHRcdFx0XHRpZiAoZGF0YS5ub3ZlbC5zdGF0dXMgPT09ICflrozntZDmuIgnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRkYXRhLm5vdmVsLm5vdmVsX3N0YXR1cyB8PSBFbnVtTm92ZWxTdGF0dXMuQVVUSE9SX0RPTkU7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHNlYXJjaF9yaWdodC5maW5kKCcua2V5d29yZCBhJylcblx0XHRcdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IGsgPSBkb20uJChlbGVtKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnRleHQoKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnNwbGl0KC9bXFwvXFxzXS8pXG5cdFx0XHRcdFx0XHRcdFx0XHQubWFwKGZ1bmN0aW9uIChzKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcy50cmltKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0LmZpbHRlcigodikgPT4gdilcblx0XHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MgPSBkYXRhLm5vdmVsLnRhZ3MuY29uY2F0KGspO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRkYXRhLmxpbmsgPSBkYXRhLmxpbmsgfHwgW107XG5cblx0XHRcdFx0XHRcdGRhdGEubGluay5wdXNoKGBbZGlwLmpwXSgke2RvbS51cmx9KSAtIOWwj+iqrOWutuOBq+OBquOCjeOBhuOAgOabtOaWsOaDheWgseaknOe0omApO1xuXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gZGF0YTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGUpO1xuXHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcihgY2FuJ3QgZG93bmxvYWQgbm92ZWwgZXh0cmEgaW5mb2ApO1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4ge307XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGxldCBub3ZlbF9zZXJpZXNfdGl0bGU6IHN0cmluZztcblx0XHRcdFx0bGV0IG5vdmVsX3N5b3NldHVfc2VyaWVzX2lkOiBzdHJpbmc7XG5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBfYSA9IGRvbS4kKCcjbm92ZWxfY29udGVudHMgLnNlcmllc190aXRsZScpO1xuXG5cdFx0XHRcdFx0bGV0IHQgPSBfYS50ZXh0KClcblx0XHRcdFx0XHRcdC5yZXBsYWNlKC9bXFxyXFxuXFx0XSt8Xlxccyt8XFxzKyQvZywgJycpXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0aWYgKHQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bm92ZWxfc2VyaWVzX3RpdGxlID0gdDtcblxuXHRcdFx0XHRcdFx0X2EgPSBfYS5maW5kKCdhJyk7XG5cdFx0XHRcdFx0XHRsZXQgX3QgPSBfYS5hdHRyKCdocmVmJykgfHwgJyc7XG5cblx0XHRcdFx0XHRcdGlmICgvXFwvKFxcd3s2LH0pXFwvL2kuZXhlYyhfdCkpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdG5vdmVsX3N5b3NldHVfc2VyaWVzX2lkID0gUmVnRXhwLiQxO1xuXG5cdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0YS5saW5rID0gYS5saW5rIHx8IFtdO1xuXG5cdFx0XHRcdFx0XHRcdGxldCB0aXRsZSA9IG5vdmVsX3Nlcmllc190aXRsZVxuXHRcdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9bXFxbXFxdXFx+XFxgXS9nLCAnXFxcXCQwJylcblx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvW1wiJ10vZywgJycpXG5cdFx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdGEubGluay5wdXNoKGBbJHt0aXRsZX1dKCR7X2EucHJvcCgnaHJlZicpfSlgKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4ge1xuXG5cdFx0XHRcdFx0Li4uYSxcblxuXHRcdFx0XHRcdHVybDogZG9tLnVybCxcblx0XHRcdFx0XHR1cmxfZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxuXHRcdFx0XHRcdG5vdmVsX2F1dGhvcixcblxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSxcblx0XHRcdFx0XHRub3ZlbF9wdWJsaXNoZXIsXG5cblx0XHRcdFx0XHRub3ZlbF9zZXJpZXNfdGl0bGUsXG5cdFx0XHRcdFx0bm92ZWxfc3lvc2V0dV9zZXJpZXNfaWQsXG5cblx0XHRcdFx0XHRub3ZlbF9zeW9zZXR1X2lkLFxuXG5cdFx0XHRcdFx0dm9sdW1lX2xpc3QsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlU3lvc2V0dTtcblxuIl19