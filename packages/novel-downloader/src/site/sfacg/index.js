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
const util_1 = require("../../util");
const index_1 = require("../index");
const base_1 = require("../demo/base");
const jsdom_url_1 = require("jsdom-url");
const jsdom_extra_1 = require("jsdom-extra");
const index_2 = require("../index");
const novel_text_1 = require("novel-text");
let NovelSiteSfacg = class NovelSiteSfacg extends base_1.default {
    makeUrl(urlobj, bool, optionsRuntime) {
        let url;
        if (bool < 0) {
            url = `http://book.sfacg.com/Novel/${urlobj.novel_id}/`;
        }
        else if (urlobj.chapter_vip && urlobj.chapter_id) {
            url = `http://book.sfacg.com/vip/c/${urlobj.chapter_id}/`;
        }
        else {
            let cid = (!bool && urlobj.chapter_id) ? [urlobj.novel_pid, urlobj.chapter_id].join('/') : 'MainIndex';
            url = `http://book.sfacg.com/Novel/${urlobj.novel_id}/${cid}/`;
        }
        // @ts-ignore
        return new jsdom_url_1.URL(url);
    }
    parseUrl(url, options) {
        let urlobj = {
            url: url,
            novel_pid: null,
            novel_id: null,
            chapter_id: null,
            chapter_vip: null,
        };
        // @ts-ignore
        urlobj.url = new jsdom_url_1.URL(url);
        url = urlobj.url.href;
        let r = /book\.sfacg\.com\/Novel\/(\d+)\/(?:(\d+)\/(\d+))/;
        let m = r.exec(url);
        if (m) {
            urlobj.novel_pid = m[2];
            urlobj.novel_id = m[1];
            urlobj.chapter_id = m[3];
            return urlobj;
        }
        r = /book\.sfacg\.com\/Novel\/(\d+)\/(?:MainIndex)?/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        r = /book\.sfacg\.com\/vip\/c\/(\d+)/;
        if (m = r.exec(url)) {
            urlobj.chapter_id = m[1];
            urlobj.chapter_vip = true;
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
        try {
            let html = util_1.minifyHTML(ret.dom.$('#ChapterBody').html());
            //html = html.replace(/^(&nbsp;){4}/gm, '');
            html = html.replace(/^\s+|\s+$/g, '');
            ret.dom.$('#ChapterBody').html(html);
        }
        catch (e) {
        }
        ret.dom.$('#ChapterBody').html(function (i, old) {
            return old.replace(/(<\/p>)[ \t]*(<p>)/g, '$1\n$2');
        });
        /*
        ret.dom.$('#ChapterBody p').text(function (i, old)
        {
            return old + "\n";
        });
        */
        ret.dom.$('#ChapterBody img[src]').each(function () {
            // @ts-ignore
            let src = ret.dom.$(this).prop('src').trim();
            if (src) {
                cache.chapter.imgs = cache.chapter.imgs || [];
                cache.chapter.imgs.push(src);
                cache.novel.imgs.push(src);
            }
        });
        let text = ret.dom.$('#ChapterBody').text();
        if (cache.chapter.chapter_vip) {
            text = `付費章节\n\n==========================\n\n${text}`;
        }
        try {
            let chapter_date;
            let d = ret.dom.$('#"article .article-desc .text:eq(1)')
                .text()
                .replace(/^.+：/g, '')
                .trim();
            chapter_date = index_2.moment(d, 'YYYY/MM/DD HH:mm:ss').local();
            cache.chapter.chapter_date = chapter_date;
        }
        catch (e) { }
        return text;
    }
    async get_volume_list(inputUrl, optionsRuntime = {}) {
        const self = this;
        let url = await this.createMainUrl(inputUrl, optionsRuntime);
        return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            let url_data = self.parseUrl(dom.url.href);
            let data_meta = await self._get_meta(url, optionsRuntime);
            let _cache_dates = [];
            let volume_list = [];
            let currentVolume;
            let novel_vip = 0;
            let table = $('.s-list .story-catalog > div');
            table
                .each(function (index) {
                // @ts-ignore
                let tr = dom.$(this);
                if (tr.is('.catalog-hd')) {
                    currentVolume = volume_list[volume_list.length] = {
                        volume_index: volume_list.length,
                        volume_title: novel_text_1.default.trim(tr.find('.catalog-title').text()),
                        chapter_list: [],
                    };
                }
                else if (tr.is('.catalog-list')) {
                    tr.find('ul > li > a')
                        .each(function (index) {
                        // @ts-ignore
                        let a = dom.$(this);
                        let href = a.prop('href');
                        let data = self.parseUrl(href);
                        if (!data.chapter_id || !data.chapter_vip && !data.novel_pid) {
                            //console.log(href, data);
                            throw new Error();
                        }
                        else {
                            href = self.makeUrl(data);
                            data.url = href;
                        }
                        let chapter_vip = a.find('.icn_vip').length;
                        if (chapter_vip) {
                            novel_vip++;
                        }
                        a
                            .find('.icn, .icn_vip')
                            .remove();
                        let chapter_title = util_1.trim(a.text());
                        if (chapter_title === '') {
                            return;
                        }
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
    async _get_meta(inputUrl, optionsRuntime) {
        const self = this;
        let url = this.makeUrl(this.parseUrl(inputUrl), -1);
        return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(function (dom) {
            const $ = dom.$;
            let data = {};
            data.novel = {};
            let novel_author = $('.author-info .author-name span')
                .text()
                .trim();
            let novel_desc = $('.summary-content .introduce')
                .text()
                .trim();
            data.novel.status = $('.count-detail .text:eq(1)')
                .text()
                .replace(/^.+\[(.+)\].*$/g, '$1');
            data.novel.tags = [];
            {
                let t = $('.count-detail .text:eq(0)')
                    .text()
                    .replace(/^.+：/g, '')
                    .trim();
                if (t) {
                    data.novel.tags.push(t);
                }
            }
            $('.main-part .tag-list .tag .text')
                .each(function () {
                // @ts-ignore
                let t = util_1.trim($(this)
                    .text()
                    .replace(/\(\d+\)/g, ''));
                if (t) {
                    data.novel.tags.push(t);
                }
            });
            let novel_date;
            {
                let d = $('.count-detail .text:last')
                    .text()
                    .replace(/更新：/, '')
                    .trim();
                //console.log(d);
                novel_date = index_2.moment(d, 'YYYY/MM/DD HH:mm:ss').local();
            }
            let novel_title = util_1.trim($('.summary-content .title .text').text());
            let url_data = self.parseUrl(url);
            $(`.d-summary .summary-pic img[src], #hasTicket .left-part a[href*="${url_data.novel_id}"] img[src]`).each(function () {
                // @ts-ignore
                let src = $(this).prop('src');
                if (src) {
                    data.novel.cover = src;
                }
            });
            return Object.assign(Object.assign({ url,
                url_data }, data), { novel_title,
                novel_author,
                novel_desc,
                novel_date });
        });
    }
};
NovelSiteSfacg.IDKEY = 'sfacg';
NovelSiteSfacg = __decorate([
    index_1.staticImplements()
], NovelSiteSfacg);
exports.NovelSiteSfacg = NovelSiteSfacg;
exports.default = NovelSiteSfacg;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQXVEO0FBQ3ZELG9DQUFtRjtBQUluRix1Q0FBeUM7QUFDekMseUNBQWdDO0FBQ2hDLDZDQUErRDtBQUUvRCxvQ0FBa0M7QUFDbEMsMkNBQW1DO0FBR25DLElBQWEsY0FBYyxHQUEzQixNQUFhLGNBQWUsU0FBUSxjQUFhO0lBSWhELE9BQU8sQ0FBSSxNQUE0QixFQUFFLElBQXVCLEVBQUUsY0FBb0M7UUFFckcsSUFBSSxHQUFXLENBQUM7UUFFaEIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUNaO1lBQ0MsR0FBRyxHQUFHLCtCQUErQixNQUFNLENBQUMsUUFBUSxHQUFHLENBQUM7U0FDeEQ7YUFDSSxJQUFJLE1BQU0sQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLFVBQVUsRUFDaEQ7WUFDQyxHQUFHLEdBQUcsK0JBQStCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsQ0FBQztTQUMxRDthQUVEO1lBQ0MsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7WUFFdkcsR0FBRyxHQUFHLCtCQUErQixNQUFNLENBQUMsUUFBUSxJQUFJLEdBQUcsR0FBRyxDQUFDO1NBQy9EO1FBRUQsYUFBYTtRQUNiLE9BQU8sSUFBSSxlQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUVELFFBQVEsQ0FBQyxHQUFpQixFQUFFLE9BQVE7UUFFbkMsSUFBSSxNQUFNLEdBQUc7WUFDWixHQUFHLEVBQUUsR0FBaUI7WUFFdEIsU0FBUyxFQUFFLElBQUk7WUFDZixRQUFRLEVBQUUsSUFBSTtZQUNkLFVBQVUsRUFBRSxJQUFJO1lBRWhCLFdBQVcsRUFBRSxJQUFJO1NBQ2pCLENBQUM7UUFFRixhQUFhO1FBQ2IsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLGVBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQixHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFFdEIsSUFBSSxDQUFDLEdBQUcsa0RBQWtELENBQUM7UUFFM0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsRUFDTDtZQUNDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXpCLE9BQU8sTUFBTSxDQUFDO1NBQ2Q7UUFFRCxDQUFDLEdBQUcsZ0RBQWdELENBQUM7UUFDckQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFDbkI7WUFDQyxNQUFNLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV2QixPQUFPLE1BQU0sQ0FBQztTQUNkO1FBRUQsQ0FBQyxHQUFHLGlDQUFpQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQ25CO1lBQ0MsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsTUFBTSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFFMUIsT0FBTyxNQUFNLENBQUM7U0FDZDtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQUVELGFBQWEsQ0FBSSxHQUFpQixFQUFFLGNBQW1DO1FBRXRFLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFOUIsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQzNCO1lBQ0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVsQixNQUFNLElBQUksY0FBYyxFQUFFLENBQUM7U0FDM0I7UUFFRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFFbkQsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDO0lBRVMsYUFBYSxDQUFJLEdBQWtCLEVBQUUsY0FBbUMsRUFBRSxLQUFLO1FBRXhGLElBQUksQ0FBQyxHQUFHLEVBQ1I7WUFDQyxPQUFPLEVBQUUsQ0FBQztTQUNWO1FBRUQsSUFDQTtZQUNDLElBQUksSUFBSSxHQUFHLGlCQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUV4RCw0Q0FBNEM7WUFDNUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRXRDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNyQztRQUNELE9BQU8sQ0FBQyxFQUNSO1NBRUM7UUFFRCxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsR0FBRztZQUU5QyxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDckQsQ0FBQyxDQUFDLENBQUM7UUFFSDs7Ozs7VUFLRTtRQUVGLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsSUFBSSxDQUFDO1lBRXZDLGFBQWE7WUFDYixJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFN0MsSUFBSSxHQUFHLEVBQ1A7Z0JBQ0MsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUU5QyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzdCLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUMzQjtRQUNGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFNUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFDN0I7WUFDQyxJQUFJLEdBQUcseUNBQXlDLElBQUksRUFBRSxDQUFDO1NBQ3ZEO1FBRUQsSUFDQTtZQUNDLElBQUksWUFBWSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLHFDQUFxQyxDQUFDO2lCQUN0RCxJQUFJLEVBQUU7aUJBQ04sT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7aUJBQ3BCLElBQUksRUFBRSxDQUNQO1lBRUQsWUFBWSxHQUFHLGNBQU0sQ0FBQyxDQUFDLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUV4RCxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7U0FDMUM7UUFDRCxPQUFPLENBQUMsRUFDUixHQUFFO1FBRUYsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsS0FBSyxDQUFDLGVBQWUsQ0FBc0IsUUFBc0IsRUFDaEUsaUJBQWdELEVBQUU7UUFHbEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFFN0QsT0FBTyxxQkFBTyxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsWUFBWSxDQUFDO2FBQzlDLElBQUksQ0FBQyxLQUFLLFdBQVcsR0FBVztZQUVoQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRWhCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUUzQyxJQUFJLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBRTFELElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztZQUN0QixJQUFJLFdBQVcsR0FBRyxFQUEwQixDQUFDO1lBRTdDLElBQUksYUFBaUMsQ0FBQztZQUV0QyxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFFbEIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLENBQUM7WUFDOUMsS0FBSztpQkFDSCxJQUFJLENBQUMsVUFBVSxLQUFLO2dCQUVwQixhQUFhO2dCQUNiLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRXJCLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFDeEI7b0JBQ0MsYUFBYSxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUc7d0JBQ2pELFlBQVksRUFBRSxXQUFXLENBQUMsTUFBTTt3QkFDaEMsWUFBWSxFQUFFLG9CQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDOUQsWUFBWSxFQUFFLEVBQUU7cUJBQ2hCLENBQUM7aUJBQ0Y7cUJBQ0ksSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxFQUMvQjtvQkFDQyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQzt5QkFDcEIsSUFBSSxDQUFDLFVBQVUsS0FBSzt3QkFFcEIsYUFBYTt3QkFDYixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUVwQixJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUUxQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUUvQixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUM1RDs0QkFDQywwQkFBMEI7NEJBRTFCLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQTt5QkFDakI7NkJBRUQ7NEJBQ0MsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBRTFCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO3lCQUNoQjt3QkFFRCxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQzt3QkFFNUMsSUFBSSxXQUFXLEVBQ2Y7NEJBQ0MsU0FBUyxFQUFFLENBQUM7eUJBQ1o7d0JBRUQsQ0FBQzs2QkFDQyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7NkJBQ3RCLE1BQU0sRUFBRSxDQUNUO3dCQUVELElBQUksYUFBYSxHQUFHLFdBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQzt3QkFFbkMsSUFBSSxhQUFhLEtBQUssRUFBRSxFQUN4Qjs0QkFDQyxPQUFPO3lCQUNQO3dCQUVELElBQUksQ0FBQyxhQUFhLEVBQ2xCOzRCQUNDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ2YsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFBO3lCQUNqQjt3QkFFRCxhQUFhOzZCQUNYLFlBQVk7NkJBQ1osSUFBSSxDQUFDOzRCQUNMLGFBQWEsRUFBRSxhQUFhLENBQUMsWUFBWSxDQUFDLE1BQU07NEJBQ2hELGFBQWE7NEJBQ2IsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVOzRCQUMzQixXQUFXLEVBQUUsSUFBSTs0QkFDakIsZ0JBQWdCLEVBQUUsSUFBSTs0QkFFdEIsV0FBVzt5QkFDWCxDQUFDLENBQ0Y7b0JBQ0YsQ0FBQyxDQUFDLENBQUE7aUJBQ0g7WUFDRixDQUFDLENBQUMsQ0FDRjtZQUVELElBQUksVUFBVSxDQUFDO1lBRWYsSUFBSSxZQUFZLENBQUMsTUFBTSxFQUN2QjtnQkFDQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRXBCLFVBQVUsR0FBRyxjQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDeEU7WUFFRCxJQUFJLFNBQVMsRUFDYjtnQkFDQyxTQUFTLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO2dCQUN4QyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBRWxELFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNqQztZQUVELE9BQU8sOEJBRU4sR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQ1osUUFBUSxJQUVMLFNBQVMsS0FFWixTQUFTO2dCQUVULFdBQVc7Z0JBRVgsYUFBYTtnQkFFYixTQUFTLEVBQUUsY0FBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBRTNCLElBQUksRUFBRSxFQUFjLEdBQ1YsQ0FBQztRQUNiLENBQUMsQ0FBQzthQUNELEdBQUcsQ0FBQyxVQUFVLEtBQUs7WUFFbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwQixDQUFDLENBQUMsQ0FDRjtJQUNGLENBQUM7SUFFUyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxjQUFjO1FBRWpELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztRQUVsQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVwRCxPQUFPLHFCQUFPLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxZQUFZLENBQUM7YUFDOUMsSUFBSSxDQUFDLFVBQVUsR0FBRztZQUVsQixNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLElBQUksSUFBSSxHQUFnQixFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7WUFFaEIsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDLGdDQUFnQyxDQUFDO2lCQUNwRCxJQUFJLEVBQUU7aUJBQ04sSUFBSSxFQUFFLENBQ1A7WUFFRCxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsNkJBQTZCLENBQUM7aUJBQy9DLElBQUksRUFBRTtpQkFDTixJQUFJLEVBQUUsQ0FDUDtZQUVELElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQywyQkFBMkIsQ0FBQztpQkFDaEQsSUFBSSxFQUFFO2lCQUNOLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FDakM7WUFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7WUFFckI7Z0JBQ0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLDJCQUEyQixDQUFDO3FCQUNwQyxJQUFJLEVBQUU7cUJBQ04sT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7cUJBQ3BCLElBQUksRUFBRSxDQUNQO2dCQUVELElBQUksQ0FBQyxFQUNMO29CQUNDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDeEI7YUFDRDtZQUVELENBQUMsQ0FBQyxpQ0FBaUMsQ0FBQztpQkFDbEMsSUFBSSxDQUFDO2dCQUVMLGFBQWE7Z0JBQ2IsSUFBSSxDQUFDLEdBQUcsV0FBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7cUJBQ2xCLElBQUksRUFBRTtxQkFDTixPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQ3pCO2dCQUVELElBQUksQ0FBQyxFQUNMO29CQUNDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDeEI7WUFDRixDQUFDLENBQUMsQ0FDRjtZQUVELElBQUksVUFBVSxDQUFDO1lBRWY7Z0JBQ0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLDBCQUEwQixDQUFDO3FCQUNuQyxJQUFJLEVBQUU7cUJBQ04sT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUM7cUJBQ2xCLElBQUksRUFBRSxDQUNOO2dCQUVGLGlCQUFpQjtnQkFFakIsVUFBVSxHQUFHLGNBQU0sQ0FBQyxDQUFDLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUN0RDtZQUVELElBQUksV0FBVyxHQUFHLFdBQUksQ0FBQyxDQUFDLENBQUMsK0JBQStCLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBRWxFLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFbEMsQ0FBQyxDQUFDLG9FQUFvRSxRQUFRLENBQUMsUUFBUSxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBRTFHLGFBQWE7Z0JBQ2IsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFOUIsSUFBSSxHQUFHLEVBQ1A7b0JBQ0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDO2lCQUN2QjtZQUNGLENBQUMsQ0FBQyxDQUFDO1lBRUgscUNBQ0MsR0FBRztnQkFDSCxRQUFRLElBRUwsSUFBSSxLQUVQLFdBQVc7Z0JBRVgsWUFBWTtnQkFDWixVQUFVO2dCQUVWLFVBQVUsSUFFVDtRQUNILENBQUMsQ0FBQyxDQUNGO0lBQ0YsQ0FBQztDQUNELENBQUE7QUE5WnVCLG9CQUFLLEdBQUcsT0FBTyxDQUFDO0FBRjNCLGNBQWM7SUFEMUIsd0JBQWdCLEVBQStDO0dBQ25ELGNBQWMsQ0FnYTFCO0FBaGFZLHdDQUFjO0FBa2EzQixrQkFBZSxjQUFjLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzMvMjUvMDI1LlxuICovXG5cbmltcG9ydCB7IGlzVW5kZWYsIG1pbmlmeUhUTUwsIHRyaW0gfSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCBfTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIFNZTUJPTF9DQUNIRSwgSU1kY29uZk1ldGEgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBJRG93bmxvYWRPcHRpb25zLCBJTm92ZWwgfSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IHsgSUZldGNoQ2hhcHRlciwgSU9wdGlvbnNSdW50aW1lIH0gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCAqIGFzIE5vdmVsU2l0ZURlbW8gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCBOb3ZlbFNpdGVCYXNlIGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IG5vdmVsVGV4dCBmcm9tICdub3ZlbC10ZXh0JztcblxuQHN0YXRpY0ltcGxlbWVudHM8X05vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZVNmYWNnPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZVNmYWNnIGV4dGVuZHMgTm92ZWxTaXRlQmFzZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gJ3NmYWNnJztcblxuXHRtYWtlVXJsPFQ+KHVybG9iajogX05vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyLCBvcHRpb25zUnVudGltZT86IFQgJiBJT3B0aW9uc1J1bnRpbWUpOiBVUkxcblx0e1xuXHRcdGxldCB1cmw6IHN0cmluZztcblxuXHRcdGlmIChib29sIDwgMClcblx0XHR7XG5cdFx0XHR1cmwgPSBgaHR0cDovL2Jvb2suc2ZhY2cuY29tL05vdmVsLyR7dXJsb2JqLm5vdmVsX2lkfS9gO1xuXHRcdH1cblx0XHRlbHNlIGlmICh1cmxvYmouY2hhcHRlcl92aXAgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpXG5cdFx0e1xuXHRcdFx0dXJsID0gYGh0dHA6Ly9ib29rLnNmYWNnLmNvbS92aXAvYy8ke3VybG9iai5jaGFwdGVyX2lkfS9gO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0bGV0IGNpZCA9ICghYm9vbCAmJiB1cmxvYmouY2hhcHRlcl9pZCkgPyBbdXJsb2JqLm5vdmVsX3BpZCwgdXJsb2JqLmNoYXB0ZXJfaWRdLmpvaW4oJy8nKSA6ICdNYWluSW5kZXgnO1xuXG5cdFx0XHR1cmwgPSBgaHR0cDovL2Jvb2suc2ZhY2cuY29tL05vdmVsLyR7dXJsb2JqLm5vdmVsX2lkfS8ke2NpZH0vYDtcblx0XHR9XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG5ldyBVUkwodXJsKTtcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogVVJMIHwgc3RyaW5nLCBvcHRpb25zPyk6IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHRsZXQgdXJsb2JqID0ge1xuXHRcdFx0dXJsOiB1cmwgYXMgYW55IGFzIFVSTCxcblxuXHRcdFx0bm92ZWxfcGlkOiBudWxsLFxuXHRcdFx0bm92ZWxfaWQ6IG51bGwsXG5cdFx0XHRjaGFwdGVyX2lkOiBudWxsLFxuXG5cdFx0XHRjaGFwdGVyX3ZpcDogbnVsbCxcblx0XHR9O1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHVybG9iai51cmwgPSBuZXcgVVJMKHVybCk7XG5cdFx0dXJsID0gdXJsb2JqLnVybC5ocmVmO1xuXG5cdFx0bGV0IHIgPSAvYm9va1xcLnNmYWNnXFwuY29tXFwvTm92ZWxcXC8oXFxkKylcXC8oPzooXFxkKylcXC8oXFxkKykpLztcblxuXHRcdGxldCBtID0gci5leGVjKHVybCk7XG5cdFx0aWYgKG0pXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX3BpZCA9IG1bMl07XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdFx0dXJsb2JqLmNoYXB0ZXJfaWQgPSBtWzNdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvYm9va1xcLnNmYWNnXFwuY29tXFwvTm92ZWxcXC8oXFxkKylcXC8oPzpNYWluSW5kZXgpPy87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvYm9va1xcLnNmYWNnXFwuY29tXFwvdmlwXFwvY1xcLyhcXGQrKS87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmouY2hhcHRlcl9pZCA9IG1bMV07XG5cdFx0XHR1cmxvYmouY2hhcHRlcl92aXAgPSB0cnVlO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHJldHVybiB1cmxvYmo7XG5cdH1cblxuXHRjcmVhdGVNYWluVXJsPFQ+KHVybDogc3RyaW5nIHwgVVJMLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSlcblx0e1xuXHRcdGxldCBkYXRhID0gdGhpcy5wYXJzZVVybCh1cmwpO1xuXG5cdFx0aWYgKCFkYXRhIHx8ICFkYXRhLm5vdmVsX2lkKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHR9XG5cblx0XHRsZXQgcmV0ID0gdGhpcy5tYWtlVXJsKGRhdGEsIHRydWUsIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihyZXQ6IElGZXRjaENoYXB0ZXIsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZSk6IHN0cmluZ1xuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdGxldCBodG1sID0gbWluaWZ5SFRNTChyZXQuZG9tLiQoJyNDaGFwdGVyQm9keScpLmh0bWwoKSk7XG5cblx0XHRcdC8vaHRtbCA9IGh0bWwucmVwbGFjZSgvXigmbmJzcDspezR9L2dtLCAnJyk7XG5cdFx0XHRodG1sID0gaHRtbC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG5cblx0XHRcdHJldC5kb20uJCgnI0NoYXB0ZXJCb2R5JykuaHRtbChodG1sKTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXG5cdFx0fVxuXG5cdFx0cmV0LmRvbS4kKCcjQ2hhcHRlckJvZHknKS5odG1sKGZ1bmN0aW9uIChpLCBvbGQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIG9sZC5yZXBsYWNlKC8oPFxcL3A+KVsgXFx0XSooPHA+KS9nLCAnJDFcXG4kMicpO1xuXHRcdH0pO1xuXG5cdFx0Lypcblx0XHRyZXQuZG9tLiQoJyNDaGFwdGVyQm9keSBwJykudGV4dChmdW5jdGlvbiAoaSwgb2xkKVxuXHRcdHtcblx0XHRcdHJldHVybiBvbGQgKyBcIlxcblwiO1xuXHRcdH0pO1xuXHRcdCovXG5cblx0XHRyZXQuZG9tLiQoJyNDaGFwdGVyQm9keSBpbWdbc3JjXScpLmVhY2goZnVuY3Rpb24gKClcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRsZXQgc3JjID0gcmV0LmRvbS4kKHRoaXMpLnByb3AoJ3NyYycpLnRyaW0oKTtcblxuXHRcdFx0aWYgKHNyYylcblx0XHRcdHtcblx0XHRcdFx0Y2FjaGUuY2hhcHRlci5pbWdzID0gY2FjaGUuY2hhcHRlci5pbWdzIHx8IFtdO1xuXG5cdFx0XHRcdGNhY2hlLmNoYXB0ZXIuaW1ncy5wdXNoKHNyYyk7XG5cdFx0XHRcdGNhY2hlLm5vdmVsLmltZ3MucHVzaChzcmMpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0bGV0IHRleHQgPSByZXQuZG9tLiQoJyNDaGFwdGVyQm9keScpLnRleHQoKTtcblxuXHRcdGlmIChjYWNoZS5jaGFwdGVyLmNoYXB0ZXJfdmlwKVxuXHRcdHtcblx0XHRcdHRleHQgPSBg5LuY6LK756ug6IqCXFxuXFxuPT09PT09PT09PT09PT09PT09PT09PT09PT1cXG5cXG4ke3RleHR9YDtcblx0XHR9XG5cblx0XHR0cnlcblx0XHR7XG5cdFx0XHRsZXQgY2hhcHRlcl9kYXRlO1xuXHRcdFx0bGV0IGQgPSByZXQuZG9tLiQoJyNcImFydGljbGUgLmFydGljbGUtZGVzYyAudGV4dDplcSgxKScpXG5cdFx0XHRcdC50ZXh0KClcblx0XHRcdFx0LnJlcGxhY2UoL14uK++8mi9nLCAnJylcblx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0O1xuXG5cdFx0XHRjaGFwdGVyX2RhdGUgPSBtb21lbnQoZCwgJ1lZWVkvTU0vREQgSEg6bW06c3MnKS5sb2NhbCgpO1xuXG5cdFx0XHRjYWNoZS5jaGFwdGVyLmNoYXB0ZXJfZGF0ZSA9IGNoYXB0ZXJfZGF0ZTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e31cblxuXHRcdHJldHVybiB0ZXh0O1xuXHR9XG5cblx0YXN5bmMgZ2V0X3ZvbHVtZV9saXN0PFQgPSBJT3B0aW9uc1J1bnRpbWU+KGlucHV0VXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge31cblx0KTogUHJvbWlzZTxJTm92ZWw+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgdXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKGlucHV0VXJsLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRyZXR1cm4gZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb206IElKU0RPTSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwoZG9tLnVybC5ocmVmKTtcblxuXHRcdFx0XHRsZXQgZGF0YV9tZXRhID0gYXdhaXQgc2VsZi5fZ2V0X21ldGEodXJsLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0bGV0IF9jYWNoZV9kYXRlcyA9IFtdO1xuXHRcdFx0XHRsZXQgdm9sdW1lX2xpc3QgPSBbXSBhcyBfTm92ZWxTaXRlLklWb2x1bWVbXTtcblxuXHRcdFx0XHRsZXQgY3VycmVudFZvbHVtZTogX05vdmVsU2l0ZS5JVm9sdW1lO1xuXG5cdFx0XHRcdGxldCBub3ZlbF92aXAgPSAwO1xuXG5cdFx0XHRcdGxldCB0YWJsZSA9ICQoJy5zLWxpc3QgLnN0b3J5LWNhdGFsb2cgPiBkaXYnKTtcblx0XHRcdFx0dGFibGVcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0bGV0IHRyID0gZG9tLiQodGhpcyk7XG5cblx0XHRcdFx0XHRcdGlmICh0ci5pcygnLmNhdGFsb2ctaGQnKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IHZvbHVtZV9saXN0W3ZvbHVtZV9saXN0Lmxlbmd0aF0gPSB7XG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiB2b2x1bWVfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiBub3ZlbFRleHQudHJpbSh0ci5maW5kKCcuY2F0YWxvZy10aXRsZScpLnRleHQoKSksXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9saXN0OiBbXSxcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2UgaWYgKHRyLmlzKCcuY2F0YWxvZy1saXN0JykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHRyLmZpbmQoJ3VsID4gbGkgPiBhJylcblx0XHRcdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IGEgPSBkb20uJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IGhyZWYgPSBhLnByb3AoJ2hyZWYnKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IGRhdGEgPSBzZWxmLnBhcnNlVXJsKGhyZWYpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoIWRhdGEuY2hhcHRlcl9pZCB8fCAhZGF0YS5jaGFwdGVyX3ZpcCAmJiAhZGF0YS5ub3ZlbF9waWQpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coaHJlZiwgZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aHJlZiA9IHNlbGYubWFrZVVybChkYXRhKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRkYXRhLnVybCA9IGhyZWY7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3ZpcCA9IGEuZmluZCgnLmljbl92aXAnKS5sZW5ndGg7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmIChjaGFwdGVyX3ZpcClcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bm92ZWxfdmlwKys7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRcdGFcblx0XHRcdFx0XHRcdFx0XHRcdFx0LmZpbmQoJy5pY24sIC5pY25fdmlwJylcblx0XHRcdFx0XHRcdFx0XHRcdFx0LnJlbW92ZSgpXG5cdFx0XHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3RpdGxlID0gdHJpbShhLnRleHQoKSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmIChjaGFwdGVyX3RpdGxlID09PSAnJylcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoIWNoYXB0ZXJfdGl0bGUpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGhyZWYpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQuY2hhcHRlcl9saXN0XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC5wdXNoKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLmNoYXB0ZXJfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmw6IGhyZWYsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmxfZGF0YTogZGF0YSxcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdmlwLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlO1xuXG5cdFx0XHRcdGlmIChfY2FjaGVfZGF0ZXMubGVuZ3RoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0X2NhY2hlX2RhdGVzLnNvcnQoKTtcblxuXHRcdFx0XHRcdG5vdmVsX2RhdGUgPSBtb21lbnQudW5peChfY2FjaGVfZGF0ZXNbX2NhY2hlX2RhdGVzLmxlbmd0aCAtIDFdKS5sb2NhbCgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKG5vdmVsX3ZpcClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbCA9IGRhdGFfbWV0YS5ub3ZlbCB8fCB7fTtcblx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncyA9IGRhdGFfbWV0YS5ub3ZlbC50YWdzIHx8IFtdO1xuXG5cdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MucHVzaCgnVklQJyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4ge1xuXG5cdFx0XHRcdFx0dXJsOiBkb20udXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0Li4uZGF0YV9tZXRhLFxuXG5cdFx0XHRcdFx0bm92ZWxfdmlwLFxuXG5cdFx0XHRcdFx0dm9sdW1lX2xpc3QsXG5cblx0XHRcdFx0XHQvL25vdmVsX2RhdGUsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0LnRhcChmdW5jdGlvbiAobm92ZWwpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUubG9nKG5vdmVsKTtcblx0XHRcdH0pXG5cdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9nZXRfbWV0YShpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWUpXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdGxldCB1cmwgPSB0aGlzLm1ha2VVcmwodGhpcy5wYXJzZVVybChpbnB1dFVybCksIC0xKTtcblxuXHRcdHJldHVybiBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKGRvbSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXHRcdFx0XHRsZXQgZGF0YTogSU1kY29uZk1ldGEgPSB7fTtcblx0XHRcdFx0ZGF0YS5ub3ZlbCA9IHt9O1xuXG5cdFx0XHRcdGxldCBub3ZlbF9hdXRob3IgPSAkKCcuYXV0aG9yLWluZm8gLmF1dGhvci1uYW1lIHNwYW4nKVxuXHRcdFx0XHRcdC50ZXh0KClcblx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYyA9ICQoJy5zdW1tYXJ5LWNvbnRlbnQgLmludHJvZHVjZScpXG5cdFx0XHRcdFx0LnRleHQoKVxuXHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGRhdGEubm92ZWwuc3RhdHVzID0gJCgnLmNvdW50LWRldGFpbCAudGV4dDplcSgxKScpXG5cdFx0XHRcdFx0LnRleHQoKVxuXHRcdFx0XHRcdC5yZXBsYWNlKC9eLitcXFsoLispXFxdLiokL2csICckMScpXG5cdFx0XHRcdDtcblx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzID0gW107XG5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB0ID0gJCgnLmNvdW50LWRldGFpbCAudGV4dDplcSgwKScpXG5cdFx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvXi4r77yaL2csICcnKVxuXHRcdFx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdGlmICh0KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGRhdGEubm92ZWwudGFncy5wdXNoKHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdCQoJy5tYWluLXBhcnQgLnRhZy1saXN0IC50YWcgLnRleHQnKVxuXHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uICgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0bGV0IHQgPSB0cmltKCQodGhpcylcblx0XHRcdFx0XHRcdFx0LnRleHQoKVxuXHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvXFwoXFxkK1xcKS9nLCAnJykpXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdGlmICh0KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MucHVzaCh0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGU7XG5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBkID0gJCgnLmNvdW50LWRldGFpbCAudGV4dDpsYXN0Jylcblx0XHRcdFx0XHRcdC50ZXh0KClcblx0XHRcdFx0XHRcdC5yZXBsYWNlKC/mm7TmlrDvvJovLCAnJylcblx0XHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coZCk7XG5cblx0XHRcdFx0XHRub3ZlbF9kYXRlID0gbW9tZW50KGQsICdZWVlZL01NL0REIEhIOm1tOnNzJykubG9jYWwoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBub3ZlbF90aXRsZSA9IHRyaW0oJCgnLnN1bW1hcnktY29udGVudCAudGl0bGUgLnRleHQnKS50ZXh0KCkpO1xuXG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwodXJsKTtcblxuXHRcdFx0XHQkKGAuZC1zdW1tYXJ5IC5zdW1tYXJ5LXBpYyBpbWdbc3JjXSwgI2hhc1RpY2tldCAubGVmdC1wYXJ0IGFbaHJlZio9XCIke3VybF9kYXRhLm5vdmVsX2lkfVwiXSBpbWdbc3JjXWApLmVhY2goZnVuY3Rpb24gKClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRsZXQgc3JjID0gJCh0aGlzKS5wcm9wKCdzcmMnKTtcblxuXHRcdFx0XHRcdGlmIChzcmMpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC5jb3ZlciA9IHNyYztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0Li4uZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxuXG5cdFx0XHRcdFx0bm92ZWxfYXV0aG9yLFxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cblx0XHRcdFx0XHRub3ZlbF9kYXRlLFxuXG5cdFx0XHRcdH07XG5cdFx0XHR9KVxuXHRcdDtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVTZmFjZztcbiJdfQ==