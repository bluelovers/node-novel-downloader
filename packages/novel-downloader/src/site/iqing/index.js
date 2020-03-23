"use strict";
/**
 * Created by user on 2018/3/25/025.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSiteIqing = void 0;
const util_1 = require("../../util");
const index_1 = require("../index");
const base_1 = require("../demo/base");
//import { URL } from 'jsdom-url';
const jsdom_extra_1 = require("jsdom-extra");
const index_2 = require("../index");
let NovelSiteIqing = /** @class */ (() => {
    let NovelSiteIqing = class NovelSiteIqing extends base_1.default {
        checkSessionData(data, optionsRuntime = {}) {
            if (data) {
                if (data.sessionid && data.steins_csrf_token) {
                    data.online = 1;
                    return data;
                }
            }
            return data;
        }
        makeUrl(urlobj, bool, optionsRuntime) {
            let url;
            if (bool || !urlobj.chapter_id) {
                url = `https://www.iqing.com/book/${urlobj.novel_id}/`;
            }
            else {
                url = `https://poi.iqing.com/content/${urlobj.chapter_id}/chapter/`;
            }
            // @ts-ignore
            return new URL(url);
        }
        parseUrl(url, options) {
            let urlobj = {
                url: url,
                novel_pid: null,
                novel_id: null,
                chapter_id: null,
            };
            // @ts-ignore
            urlobj.url = new URL(url);
            // @ts-ignore
            url = urlobj.url.href;
            let r = /www\.iqing\.com\/read\/(\d+)/;
            // @ts-ignore
            let m = r.exec(url);
            if (m) {
                urlobj.chapter_id = m[1];
                return urlobj;
            }
            r = /poi\.iqing\.com\/content\/(\d+)\/chapter/;
            // @ts-ignore
            if (m = r.exec(url)) {
                urlobj.chapter_id = m[1];
                return urlobj;
            }
            r = /www\.iqing\.com\/book\/(\d+)/;
            // @ts-ignore
            if (m = r.exec(url)) {
                urlobj.novel_id = m[1];
                return urlobj;
            }
            return urlobj;
        }
        createMainUrl(url, optionsRuntime) {
            let data = this.parseUrl(url);
            if (!data || !data.novel_id) {
                console.log(data);
                throw new ReferenceError();
            }
            let ret = this.makeUrl(data, true, optionsRuntime);
            return ret;
        }
        _parseChapter(ret, optionsRuntime, cache) {
            if (!ret) {
                return '';
            }
            let text;
            if (ret.json && ret.json.results && ret.json.results.length) {
                text = ret.json.results
                    .reduce(function (a, b) {
                    if (b && b.value) {
                        a.push(b.value);
                    }
                    else {
                        console.log(777, b);
                        throw new Error();
                    }
                    return a;
                }, [])
                    .join("\n");
                if (!text) {
                    console.log(666, ret.json.results);
                    throw new Error();
                }
                cache.chapter.chapter_date = index_2.moment(ret.json.updated_time).local();
                if (cache.chapter.chapter_vip) {
                    text = `付費章节\n\n==========================\n\n${text}`;
                }
                return text;
            }
            console.log(ret);
            throw new Error;
            // @ts-ignore
            return text;
        }
        async get_volume_list(inputUrl, optionsRuntime = {}) {
            const self = this;
            let url = await this.createMainUrl(inputUrl, optionsRuntime);
            return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
                .then(async function (dom) {
                const $ = dom.$;
                let url_data = self.parseUrl(dom.url.href);
                let data_meta = await self._get_meta(url, optionsRuntime, {
                    dom,
                });
                let _cache_dates = [];
                let volume_list = [];
                let currentVolume;
                let novel_vip = 0;
                let table = $('#book-menu .list-volume li');
                table
                    .each(function (index) {
                    // @ts-ignore
                    let tr = dom.$(this);
                    if (tr.is('.volume')) {
                        currentVolume = volume_list[volume_list.length] = {
                            volume_index: volume_list.length,
                            volume_title: util_1.trim(tr.find('h3').text()),
                            chapter_list: [],
                        };
                    }
                    else if (tr.is('.chapter')) {
                        let a = tr.find('a');
                        let href = a.prop('href');
                        let data = self.parseUrl(href);
                        if (!data.chapter_id) {
                            //console.log(href, data);
                            throw new Error();
                        }
                        else {
                            href = self.makeUrl(data);
                            data.url = href;
                        }
                        let chapter_vip;
                        chapter_vip = tr.find('.lock').length;
                        if (chapter_vip) {
                            novel_vip++;
                        }
                        let chapter_title = util_1.trim(a.text());
                        if (!chapter_title) {
                            console.log(href);
                            console.log(a);
                            throw new Error();
                        }
                        currentVolume
                            .chapter_list
                            .push({
                            chapter_index: currentVolume.chapter_list.length,
                            chapter_title,
                            chapter_id: data.chapter_id,
                            chapter_url: href,
                            chapter_url_data: data,
                            chapter_vip,
                        });
                    }
                });
                let novel_date;
                if (_cache_dates.length) {
                    _cache_dates.sort();
                    novel_date = index_2.moment.unix(_cache_dates[_cache_dates.length - 1]).local();
                }
                if (novel_vip) {
                    data_meta.novel = data_meta.novel || {};
                    data_meta.novel.tags = data_meta.novel.tags || [];
                    data_meta.novel.tags.push('VIP');
                }
                return Object.assign(Object.assign({ url: dom.url, url_data }, data_meta), { novel_vip,
                    volume_list, 
                    //novel_date,
                    checkdate: index_2.moment().local(), imgs: [] });
            })
                .tap(function (novel) {
                console.log(novel);
            });
        }
        async _get_meta(inputUrl, optionsRuntime, cache) {
            const self = this;
            let url = inputUrl;
            return Promise.resolve(cache.dom)
                .then(function (dom) {
                const $ = dom.$;
                let data = {};
                data.novel = {};
                let novel_author = $('#author-info .name[itemprop="author"] [itemprop="name"]')
                    .text()
                    .trim();
                $('#book-top .intro').find('.t').remove();
                let novel_desc = $('#book-top .intro')
                    .text()
                    .trim();
                data.novel.tags = [];
                $('#cat-list .cat, .book-title .book-tag')
                    .each(function () {
                    // @ts-ignore
                    let t = util_1.trim($(this)
                        .text()
                        .replace(/\(\d+\)/g, ''));
                    if (t) {
                        data.novel.tags.push(t);
                        // @ts-ignore
                        if (t == '连载' && $(this).is('.book-tag')) {
                            data.novel.status = t;
                        }
                    }
                });
                let novel_date;
                {
                    let d = $('.update-time [itemprop="datePublished"]')
                        .attr('content')
                        //.replace(/更新：/, '')
                        .trim();
                    //console.log(d);
                    novel_date = index_2.moment(d).local();
                }
                let novel_title = util_1.trim($('.book-title .title').text());
                $('#book-top img.cover[src]').each(function () {
                    // @ts-ignore
                    data.novel.cover = $(this)
                        .prop('src')
                        .replace(/\?imageMogr2.+$/, '');
                });
                let url_data = self.parseUrl(url);
                return Object.assign(Object.assign({ url,
                    url_data }, data), { novel_title,
                    novel_author,
                    novel_desc,
                    novel_date });
            });
        }
    };
    NovelSiteIqing.IDKEY = 'iqing';
    NovelSiteIqing.disabled = true;
    NovelSiteIqing = __decorate([
        index_1.staticImplements()
    ], NovelSiteIqing);
    return NovelSiteIqing;
})();
exports.NovelSiteIqing = NovelSiteIqing;
exports.default = NovelSiteIqing;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7OztBQUVILHFDQUF1RDtBQUN2RCxvQ0FBbUY7QUFJbkYsdUNBQXlDO0FBQ3pDLGtDQUFrQztBQUNsQyw2Q0FBK0Q7QUFFL0Qsb0NBQWtDO0FBa0JsQztJQUFBLElBQWEsY0FBYyxHQUEzQixNQUFhLGNBQWUsU0FBUSxjQUFhO1FBS2hELGdCQUFnQixDQUFtQixJQUFzQixFQUFFLGlCQUFrQyxFQUFFO1lBRTlGLElBQUksSUFBSSxFQUNSO2dCQUNDLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQzVDO29CQUNDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO29CQUVoQixPQUFPLElBQUksQ0FBQztpQkFDWjthQUNEO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsT0FBTyxDQUFJLE1BQTRCLEVBQUUsSUFBdUIsRUFBRSxjQUFvQztZQUVyRyxJQUFJLEdBQVcsQ0FBQztZQUVoQixJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQzlCO2dCQUNDLEdBQUcsR0FBRyw4QkFBOEIsTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDO2FBQ3ZEO2lCQUVEO2dCQUNDLEdBQUcsR0FBRyxpQ0FBaUMsTUFBTSxDQUFDLFVBQVUsV0FBVyxDQUFDO2FBQ3BFO1lBRUQsYUFBYTtZQUNiLE9BQU8sSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckIsQ0FBQztRQUVELFFBQVEsQ0FBQyxHQUFpQixFQUFFLE9BQVE7WUFFbkMsSUFBSSxNQUFNLEdBQUc7Z0JBQ1osR0FBRyxFQUFFLEdBQUc7Z0JBRVIsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsVUFBVSxFQUFFLElBQUk7YUFDaEIsQ0FBQztZQUVGLGFBQWE7WUFDYixNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFCLGFBQWE7WUFDYixHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFFdEIsSUFBSSxDQUFDLEdBQUcsOEJBQThCLENBQUM7WUFFdkMsYUFBYTtZQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLEVBQ0w7Z0JBQ0MsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXpCLE9BQU8sTUFBTSxDQUFDO2FBQ2Q7WUFFRCxDQUFDLEdBQUcsMENBQTBDLENBQUM7WUFDL0MsYUFBYTtZQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQ25CO2dCQUNDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV6QixPQUFPLE1BQU0sQ0FBQzthQUNkO1lBRUQsQ0FBQyxHQUFHLDhCQUE4QixDQUFDO1lBQ25DLGFBQWE7WUFDYixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUNuQjtnQkFDQyxNQUFNLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFdkIsT0FBTyxNQUFNLENBQUM7YUFDZDtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVELGFBQWEsQ0FBSSxHQUFpQixFQUFFLGNBQW1DO1lBRXRFLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFOUIsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQzNCO2dCQUNDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRWxCLE1BQU0sSUFBSSxjQUFjLEVBQUUsQ0FBQzthQUMzQjtZQUVELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztZQUVuRCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7UUFFUyxhQUFhLENBQUksR0FBa0IsRUFBRSxjQUFtQyxFQUFFLEtBQUs7WUFFeEYsSUFBSSxDQUFDLEdBQUcsRUFDUjtnQkFDQyxPQUFPLEVBQUUsQ0FBQzthQUNWO1lBRUQsSUFBSSxJQUFZLENBQUM7WUFFakIsSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFDM0Q7Z0JBQ0MsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTztxQkFDckIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7b0JBRXJCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQ2hCO3dCQUNDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO3FCQUNoQjt5QkFFRDt3QkFDQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFFcEIsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDO3FCQUNsQjtvQkFFRCxPQUFPLENBQUMsQ0FBQztnQkFDVixDQUFDLEVBQUUsRUFBRSxDQUFDO3FCQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDWDtnQkFFRCxJQUFJLENBQUMsSUFBSSxFQUNUO29CQUNDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBRW5DLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztpQkFDbEI7Z0JBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsY0FBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBRW5FLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQzdCO29CQUNDLElBQUksR0FBRyx5Q0FBeUMsSUFBSSxFQUFFLENBQUM7aUJBQ3ZEO2dCQUVELE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWpCLE1BQU0sSUFBSSxLQUFLLENBQUM7WUFFaEIsYUFBYTtZQUNiLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELEtBQUssQ0FBQyxlQUFlLENBQXNCLFFBQXNCLEVBQ2hFLGlCQUFnRCxFQUFFO1lBR2xELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBRTdELE9BQU8scUJBQU8sQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLFlBQVksQ0FBQztpQkFDOUMsSUFBSSxDQUFDLEtBQUssV0FBVyxHQUFXO2dCQUVoQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUVoQixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRTNDLElBQUksU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsY0FBYyxFQUFFO29CQUN6RCxHQUFHO2lCQUNILENBQUMsQ0FBQztnQkFFSCxJQUFJLFlBQVksR0FBRyxFQUFFLENBQUM7Z0JBQ3RCLElBQUksV0FBVyxHQUFHLEVBQTBCLENBQUM7Z0JBRTdDLElBQUksYUFBaUMsQ0FBQztnQkFFdEMsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO2dCQUVsQixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsNEJBQTRCLENBQUMsQ0FBQztnQkFDNUMsS0FBSztxQkFDSCxJQUFJLENBQUMsVUFBVSxLQUFLO29CQUVwQixhQUFhO29CQUNiLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRXJCLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFDcEI7d0JBQ0MsYUFBYSxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUc7NEJBQ2pELFlBQVksRUFBRSxXQUFXLENBQUMsTUFBTTs0QkFDaEMsWUFBWSxFQUFFLFdBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDOzRCQUN4QyxZQUFZLEVBQUUsRUFBRTt5QkFDaEIsQ0FBQztxQkFDRjt5QkFDSSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQzFCO3dCQUNDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBRXJCLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBRTFCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBRS9CLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUNwQjs0QkFDQywwQkFBMEI7NEJBRTFCLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQTt5QkFDakI7NkJBRUQ7NEJBQ0MsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBRTFCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO3lCQUNoQjt3QkFFRCxJQUFJLFdBQVcsQ0FBQzt3QkFFaEIsV0FBVyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDO3dCQUV0QyxJQUFJLFdBQVcsRUFDZjs0QkFDQyxTQUFTLEVBQUUsQ0FBQzt5QkFDWjt3QkFFRCxJQUFJLGFBQWEsR0FBRyxXQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7d0JBRW5DLElBQUksQ0FBQyxhQUFhLEVBQ2xCOzRCQUNDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ2YsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFBO3lCQUNqQjt3QkFFRCxhQUFhOzZCQUNYLFlBQVk7NkJBQ1osSUFBSSxDQUFDOzRCQUNMLGFBQWEsRUFBRSxhQUFhLENBQUMsWUFBWSxDQUFDLE1BQU07NEJBQ2hELGFBQWE7NEJBQ2IsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVOzRCQUMzQixXQUFXLEVBQUUsSUFBSTs0QkFDakIsZ0JBQWdCLEVBQUUsSUFBSTs0QkFFdEIsV0FBVzt5QkFDWCxDQUFDLENBQ0Y7cUJBQ0Q7Z0JBQ0YsQ0FBQyxDQUFDLENBQ0Y7Z0JBRUQsSUFBSSxVQUFVLENBQUM7Z0JBRWYsSUFBSSxZQUFZLENBQUMsTUFBTSxFQUN2QjtvQkFDQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBRXBCLFVBQVUsR0FBRyxjQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7aUJBQ3hFO2dCQUVELElBQUksU0FBUyxFQUNiO29CQUNDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7b0JBQ3hDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztvQkFFbEQsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNqQztnQkFFRCxPQUFPLDhCQUVOLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUNaLFFBQVEsSUFFTCxTQUFTLEtBRVosU0FBUztvQkFFVCxXQUFXO29CQUVYLGFBQWE7b0JBRWIsU0FBUyxFQUFFLGNBQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxFQUUzQixJQUFJLEVBQUUsRUFBYyxHQUNWLENBQUM7WUFDYixDQUFDLENBQUM7aUJBQ0QsR0FBRyxDQUFDLFVBQVUsS0FBSztnQkFFbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNwQixDQUFDLENBQUMsQ0FDRDtRQUNILENBQUM7UUFFUyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUUsS0FFbkQ7WUFFQSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7WUFFbEIsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDO1lBRW5CLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO2lCQUMvQixJQUFJLENBQUMsVUFBVSxHQUFHO2dCQUVsQixNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNoQixJQUFJLElBQUksR0FBZ0IsRUFBRSxDQUFDO2dCQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztnQkFFaEIsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDLHlEQUF5RCxDQUFDO3FCQUM3RSxJQUFJLEVBQUU7cUJBQ04sSUFBSSxFQUFFLENBQ1A7Z0JBRUQsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUUxQyxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsa0JBQWtCLENBQUM7cUJBQ3BDLElBQUksRUFBRTtxQkFDTixJQUFJLEVBQUUsQ0FDUDtnQkFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBRXJCLENBQUMsQ0FBQyx1Q0FBdUMsQ0FBQztxQkFDeEMsSUFBSSxDQUFDO29CQUVMLGFBQWE7b0JBQ2IsSUFBSSxDQUFDLEdBQUcsV0FBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7eUJBQ2xCLElBQUksRUFBRTt5QkFDTixPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQ3pCO29CQUVELElBQUksQ0FBQyxFQUNMO3dCQUNDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFFeEIsYUFBYTt3QkFDYixJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFDeEM7NEJBQ0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO3lCQUN0QjtxQkFDRDtnQkFDRixDQUFDLENBQUMsQ0FDRjtnQkFFRCxJQUFJLFVBQVUsQ0FBQztnQkFFZjtvQkFDQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMseUNBQXlDLENBQUM7eUJBQ2xELElBQUksQ0FBQyxTQUFTLENBQUM7d0JBQ2hCLHFCQUFxQjt5QkFDcEIsSUFBSSxFQUFFLENBQ1A7b0JBRUQsaUJBQWlCO29CQUVqQixVQUFVLEdBQUcsY0FBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO2lCQUMvQjtnQkFFRCxJQUFJLFdBQVcsR0FBRyxXQUFJLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFFdkQsQ0FBQyxDQUFDLDBCQUEwQixDQUFDLENBQUMsSUFBSSxDQUFDO29CQUVsQyxhQUFhO29CQUNiLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7eUJBQ3hCLElBQUksQ0FBQyxLQUFLLENBQUM7eUJBQ1gsT0FBTyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUMvQjtnQkFDRixDQUFDLENBQUMsQ0FBQztnQkFFSCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUVsQyxxQ0FDQyxHQUFHO29CQUNILFFBQVEsSUFFTCxJQUFJLEtBRVAsV0FBVztvQkFFWCxZQUFZO29CQUNaLFVBQVU7b0JBRVYsVUFBVSxJQUVUO1lBQ0gsQ0FBQyxDQUFDLENBQ0Q7UUFDSCxDQUFDO0tBQ0QsQ0FBQTtJQWpZdUIsb0JBQUssR0FBRyxPQUFPLENBQUM7SUFDaEMsdUJBQVEsR0FBRyxJQUFJLENBQUM7SUFIWCxjQUFjO1FBRDFCLHdCQUFnQixFQUErQztPQUNuRCxjQUFjLENBbVkxQjtJQUFELHFCQUFDO0tBQUE7QUFuWVksd0NBQWM7QUFxWTNCLGtCQUFlLGNBQWMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMy8yNS8wMjUuXG4gKi9cblxuaW1wb3J0IHsgaXNVbmRlZiwgbWluaWZ5SFRNTCwgdHJpbSB9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IF9Ob3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgU1lNQk9MX0NBQ0hFLCBJTWRjb25mTWV0YSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IElEb3dubG9hZE9wdGlvbnMsIElOb3ZlbCB9IGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgeyBJRmV0Y2hDaGFwdGVyLCBJT3B0aW9uc1J1bnRpbWUgfSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0ICogYXMgTm92ZWxTaXRlRGVtbyBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IE5vdmVsU2l0ZUJhc2UgZnJvbSAnLi4vZGVtby9iYXNlJztcbi8vaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkLCBibHVlYmlyZERlY29yYXRvciB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IG1vbWVudCB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG5cbmV4cG9ydCB0eXBlIElTZXNzaW9uRGF0YSA9IHtcblxuXHQvLyByZXF1aXJlXG5cdHNlc3Npb25pZDogc3RyaW5nLFxuXHRzdGVpbnNfY3NyZl90b2tlbjogc3RyaW5nLFxuXHRvbmxpbmU/OiAxIHwgJzEnLFxuXG5cdC8vIG5vIG5lZWRcblx0aWQ/OiBudW1iZXIgfCBzdHJpbmcsXG5cdGF2YXRhcj86IHN0cmluZyxcblx0dXNlcm5hbWU/OiBzdHJpbmcsXG5cbn1cblxuQHN0YXRpY0ltcGxlbWVudHM8X05vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZUlxaW5nPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZUlxaW5nIGV4dGVuZHMgTm92ZWxTaXRlQmFzZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gJ2lxaW5nJztcblx0c3RhdGljIGRpc2FibGVkID0gdHJ1ZTtcblxuXHRjaGVja1Nlc3Npb25EYXRhPFQgPSBJU2Vzc2lvbkRhdGE+KGRhdGE6IFQgJiBJU2Vzc2lvbkRhdGEsIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUgPSB7fSk6IFRcblx0e1xuXHRcdGlmIChkYXRhKVxuXHRcdHtcblx0XHRcdGlmIChkYXRhLnNlc3Npb25pZCAmJiBkYXRhLnN0ZWluc19jc3JmX3Rva2VuKVxuXHRcdFx0e1xuXHRcdFx0XHRkYXRhLm9ubGluZSA9IDE7XG5cblx0XHRcdFx0cmV0dXJuIGRhdGE7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRhdGE7XG5cdH1cblxuXHRtYWtlVXJsPFQ+KHVybG9iajogX05vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyLCBvcHRpb25zUnVudGltZT86IFQgJiBJT3B0aW9uc1J1bnRpbWUpOiBVUkxcblx0e1xuXHRcdGxldCB1cmw6IHN0cmluZztcblxuXHRcdGlmIChib29sIHx8ICF1cmxvYmouY2hhcHRlcl9pZClcblx0XHR7XG5cdFx0XHR1cmwgPSBgaHR0cHM6Ly93d3cuaXFpbmcuY29tL2Jvb2svJHt1cmxvYmoubm92ZWxfaWR9L2A7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR1cmwgPSBgaHR0cHM6Ly9wb2kuaXFpbmcuY29tL2NvbnRlbnQvJHt1cmxvYmouY2hhcHRlcl9pZH0vY2hhcHRlci9gO1xuXHRcdH1cblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gbmV3IFVSTCh1cmwpO1xuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBVUkwgfCBzdHJpbmcsIG9wdGlvbnM/KTogX05vdmVsU2l0ZS5JUGFyc2VVcmxcblx0e1xuXHRcdGxldCB1cmxvYmogPSB7XG5cdFx0XHR1cmw6IHVybCxcblxuXHRcdFx0bm92ZWxfcGlkOiBudWxsLFxuXHRcdFx0bm92ZWxfaWQ6IG51bGwsXG5cdFx0XHRjaGFwdGVyX2lkOiBudWxsLFxuXHRcdH07XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0dXJsb2JqLnVybCA9IG5ldyBVUkwodXJsKTtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0dXJsID0gdXJsb2JqLnVybC5ocmVmO1xuXG5cdFx0bGV0IHIgPSAvd3d3XFwuaXFpbmdcXC5jb21cXC9yZWFkXFwvKFxcZCspLztcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRsZXQgbSA9IHIuZXhlYyh1cmwpO1xuXHRcdGlmIChtKVxuXHRcdHtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVsxXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyID0gL3BvaVxcLmlxaW5nXFwuY29tXFwvY29udGVudFxcLyhcXGQrKVxcL2NoYXB0ZXIvO1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVsxXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyID0gL3d3d1xcLmlxaW5nXFwuY29tXFwvYm9va1xcLyhcXGQrKS87XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyZXR1cm4gdXJsb2JqO1xuXHR9XG5cblx0Y3JlYXRlTWFpblVybDxUPih1cmw6IHN0cmluZyB8IFVSTCwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUpXG5cdHtcblx0XHRsZXQgZGF0YSA9IHRoaXMucGFyc2VVcmwodXJsKTtcblxuXHRcdGlmICghZGF0YSB8fCAhZGF0YS5ub3ZlbF9pZClcblx0XHR7XG5cdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcblxuXHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCk7XG5cdFx0fVxuXG5cdFx0bGV0IHJldCA9IHRoaXMubWFrZVVybChkYXRhLCB0cnVlLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9wYXJzZUNoYXB0ZXI8VD4ocmV0OiBJRmV0Y2hDaGFwdGVyLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGUpOiBzdHJpbmdcblx0e1xuXHRcdGlmICghcmV0KVxuXHRcdHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRsZXQgdGV4dDogc3RyaW5nO1xuXG5cdFx0aWYgKHJldC5qc29uICYmIHJldC5qc29uLnJlc3VsdHMgJiYgcmV0Lmpzb24ucmVzdWx0cy5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0dGV4dCA9IHJldC5qc29uLnJlc3VsdHNcblx0XHRcdFx0LnJlZHVjZShmdW5jdGlvbiAoYSwgYilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChiICYmIGIudmFsdWUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YS5wdXNoKGIudmFsdWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coNzc3LCBiKTtcblxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHRcdH0sIFtdKVxuXHRcdFx0XHQuam9pbihcIlxcblwiKVxuXHRcdFx0O1xuXG5cdFx0XHRpZiAoIXRleHQpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUubG9nKDY2NiwgcmV0Lmpzb24ucmVzdWx0cyk7XG5cblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCk7XG5cdFx0XHR9XG5cblx0XHRcdGNhY2hlLmNoYXB0ZXIuY2hhcHRlcl9kYXRlID0gbW9tZW50KHJldC5qc29uLnVwZGF0ZWRfdGltZSkubG9jYWwoKTtcblxuXHRcdFx0aWYgKGNhY2hlLmNoYXB0ZXIuY2hhcHRlcl92aXApXG5cdFx0XHR7XG5cdFx0XHRcdHRleHQgPSBg5LuY6LK756ug6IqCXFxuXFxuPT09PT09PT09PT09PT09PT09PT09PT09PT1cXG5cXG4ke3RleHR9YDtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0fVxuXG5cdFx0Y29uc29sZS5sb2cocmV0KTtcblxuXHRcdHRocm93IG5ldyBFcnJvcjtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gdGV4dDtcblx0fVxuXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUID0gSU9wdGlvbnNSdW50aW1lPihpbnB1dFVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9XG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0bGV0IHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybChpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKGRvbS51cmwuaHJlZik7XG5cblx0XHRcdFx0bGV0IGRhdGFfbWV0YSA9IGF3YWl0IHNlbGYuX2dldF9tZXRhKHVybCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRkb20sXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGxldCBfY2FjaGVfZGF0ZXMgPSBbXTtcblx0XHRcdFx0bGV0IHZvbHVtZV9saXN0ID0gW10gYXMgX05vdmVsU2l0ZS5JVm9sdW1lW107XG5cblx0XHRcdFx0bGV0IGN1cnJlbnRWb2x1bWU6IF9Ob3ZlbFNpdGUuSVZvbHVtZTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfdmlwID0gMDtcblxuXHRcdFx0XHRsZXQgdGFibGUgPSAkKCcjYm9vay1tZW51IC5saXN0LXZvbHVtZSBsaScpO1xuXHRcdFx0XHR0YWJsZVxuXHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRsZXQgdHIgPSBkb20uJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0aWYgKHRyLmlzKCcudm9sdW1lJykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZTogdHJpbSh0ci5maW5kKCdoMycpLnRleHQoKSksXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9saXN0OiBbXSxcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2UgaWYgKHRyLmlzKCcuY2hhcHRlcicpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgYSA9IHRyLmZpbmQoJ2EnKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgaHJlZiA9IGEucHJvcCgnaHJlZicpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBkYXRhID0gc2VsZi5wYXJzZVVybChocmVmKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIWRhdGEuY2hhcHRlcl9pZClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coaHJlZiwgZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGhyZWYgPSBzZWxmLm1ha2VVcmwoZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHRkYXRhLnVybCA9IGhyZWY7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl92aXA7XG5cblx0XHRcdFx0XHRcdFx0Y2hhcHRlcl92aXAgPSB0ci5maW5kKCcubG9jaycpLmxlbmd0aDtcblxuXHRcdFx0XHRcdFx0XHRpZiAoY2hhcHRlcl92aXApXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRub3ZlbF92aXArKztcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3RpdGxlID0gdHJpbShhLnRleHQoKSk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFjaGFwdGVyX3RpdGxlKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coaHJlZik7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYSk7XG5cdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWVcblx0XHRcdFx0XHRcdFx0XHQuY2hhcHRlcl9saXN0XG5cdFx0XHRcdFx0XHRcdFx0LnB1c2goe1xuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogY3VycmVudFZvbHVtZS5jaGFwdGVyX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZSxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsOiBocmVmLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmxfZGF0YTogZGF0YSxcblxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl92aXAsXG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGF0ZTtcblxuXHRcdFx0XHRpZiAoX2NhY2hlX2RhdGVzLmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdF9jYWNoZV9kYXRlcy5zb3J0KCk7XG5cblx0XHRcdFx0XHRub3ZlbF9kYXRlID0gbW9tZW50LnVuaXgoX2NhY2hlX2RhdGVzW19jYWNoZV9kYXRlcy5sZW5ndGggLSAxXSkubG9jYWwoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChub3ZlbF92aXApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwgPSBkYXRhX21ldGEubm92ZWwgfHwge307XG5cdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MgPSBkYXRhX21ldGEubm92ZWwudGFncyB8fCBbXTtcblxuXHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzLnB1c2goJ1ZJUCcpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdHVybDogZG9tLnVybCxcblx0XHRcdFx0XHR1cmxfZGF0YSxcblxuXHRcdFx0XHRcdC4uLmRhdGFfbWV0YSxcblxuXHRcdFx0XHRcdG5vdmVsX3ZpcCxcblxuXHRcdFx0XHRcdHZvbHVtZV9saXN0LFxuXG5cdFx0XHRcdFx0Ly9ub3ZlbF9kYXRlLFxuXG5cdFx0XHRcdFx0Y2hlY2tkYXRlOiBtb21lbnQoKS5sb2NhbCgpLFxuXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdH0gYXMgSU5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdC50YXAoZnVuY3Rpb24gKG5vdmVsKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zb2xlLmxvZyhub3ZlbCk7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9nZXRfbWV0YShpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlOiB7XG5cdFx0ZG9tOiBJSlNET00sXG5cdH0pXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdGxldCB1cmwgPSBpbnB1dFVybDtcblxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoY2FjaGUuZG9tKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKGRvbSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXHRcdFx0XHRsZXQgZGF0YTogSU1kY29uZk1ldGEgPSB7fTtcblx0XHRcdFx0ZGF0YS5ub3ZlbCA9IHt9O1xuXG5cdFx0XHRcdGxldCBub3ZlbF9hdXRob3IgPSAkKCcjYXV0aG9yLWluZm8gLm5hbWVbaXRlbXByb3A9XCJhdXRob3JcIl0gW2l0ZW1wcm9wPVwibmFtZVwiXScpXG5cdFx0XHRcdFx0LnRleHQoKVxuXHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0O1xuXG5cdFx0XHRcdCQoJyNib29rLXRvcCAuaW50cm8nKS5maW5kKCcudCcpLnJlbW92ZSgpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kZXNjID0gJCgnI2Jvb2stdG9wIC5pbnRybycpXG5cdFx0XHRcdFx0LnRleHQoKVxuXHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGRhdGEubm92ZWwudGFncyA9IFtdO1xuXG5cdFx0XHRcdCQoJyNjYXQtbGlzdCAuY2F0LCAuYm9vay10aXRsZSAuYm9vay10YWcnKVxuXHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uICgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0bGV0IHQgPSB0cmltKCQodGhpcylcblx0XHRcdFx0XHRcdFx0LnRleHQoKVxuXHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvXFwoXFxkK1xcKS9nLCAnJykpXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdGlmICh0KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MucHVzaCh0KTtcblxuXHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdGlmICh0ID09ICfov57ovb0nICYmICQodGhpcykuaXMoJy5ib29rLXRhZycpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC5zdGF0dXMgPSB0O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgZCA9ICQoJy51cGRhdGUtdGltZSBbaXRlbXByb3A9XCJkYXRlUHVibGlzaGVkXCJdJylcblx0XHRcdFx0XHRcdC5hdHRyKCdjb250ZW50Jylcblx0XHRcdFx0XHRcdC8vLnJlcGxhY2UoL+abtOaWsO+8mi8sICcnKVxuXHRcdFx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coZCk7XG5cblx0XHRcdFx0XHRub3ZlbF9kYXRlID0gbW9tZW50KGQpLmxvY2FsKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgbm92ZWxfdGl0bGUgPSB0cmltKCQoJy5ib29rLXRpdGxlIC50aXRsZScpLnRleHQoKSk7XG5cblx0XHRcdFx0JCgnI2Jvb2stdG9wIGltZy5jb3ZlcltzcmNdJykuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdGRhdGEubm92ZWwuY292ZXIgPSAkKHRoaXMpXG5cdFx0XHRcdFx0XHQucHJvcCgnc3JjJylcblx0XHRcdFx0XHRcdC5yZXBsYWNlKC9cXD9pbWFnZU1vZ3IyLiskLywgJycpXG5cdFx0XHRcdFx0O1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKHVybCk7XG5cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR1cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHQuLi5kYXRhLFxuXG5cdFx0XHRcdFx0bm92ZWxfdGl0bGUsXG5cblx0XHRcdFx0XHRub3ZlbF9hdXRob3IsXG5cdFx0XHRcdFx0bm92ZWxfZGVzYyxcblxuXHRcdFx0XHRcdG5vdmVsX2RhdGUsXG5cblx0XHRcdFx0fTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlSXFpbmc7XG4iXX0=