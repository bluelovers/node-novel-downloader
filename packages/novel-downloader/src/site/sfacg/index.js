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
    makeUrl(urlobj, bool) {
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
    createMainUrl(url) {
        let data = this.parseUrl(url);
        if (!data || !data.novel_id) {
            console.log(data);
            throw new ReferenceError();
        }
        let ret = this.makeUrl(data, true);
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
        let url = await this.createMainUrl(inputUrl);
        return await jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQXVEO0FBQ3ZELG9DQUFtRjtBQUluRix1Q0FBeUM7QUFDekMseUNBQWdDO0FBQ2hDLDZDQUErRDtBQUUvRCxvQ0FBa0M7QUFDbEMsMkNBQW1DO0FBR25DLElBQWEsY0FBYyxHQUEzQixNQUFhLGNBQWUsU0FBUSxjQUFhO0lBSWhELE9BQU8sQ0FBQyxNQUE0QixFQUFFLElBQXVCO1FBRTVELElBQUksR0FBVyxDQUFDO1FBRWhCLElBQUksSUFBSSxHQUFHLENBQUMsRUFDWjtZQUNDLEdBQUcsR0FBRywrQkFBK0IsTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDO1NBQ3hEO2FBQ0ksSUFBSSxNQUFNLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQ2hEO1lBQ0MsR0FBRyxHQUFHLCtCQUErQixNQUFNLENBQUMsVUFBVSxHQUFHLENBQUM7U0FDMUQ7YUFFRDtZQUNDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO1lBRXZHLEdBQUcsR0FBRywrQkFBK0IsTUFBTSxDQUFDLFFBQVEsSUFBSSxHQUFHLEdBQUcsQ0FBQztTQUMvRDtRQUVELE9BQU8sSUFBSSxlQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUVELFFBQVEsQ0FBQyxHQUFpQixFQUFFLE9BQVE7UUFFbkMsSUFBSSxNQUFNLEdBQUc7WUFDWixHQUFHLEVBQUUsR0FBRztZQUVSLFNBQVMsRUFBRSxJQUFJO1lBQ2YsUUFBUSxFQUFFLElBQUk7WUFDZCxVQUFVLEVB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LElBRUwsSUFBSSxLQUVQLFdBQVc7Z0JBRVgsWUFBWTtnQkFDWixVQUFVO2dCQUVWLFVBQVUsSUFFVDtRQUNILENBQUMsQ0FBQyxDQUNGO0lBQ0YsQ0FBQztDQUNELENBQUE7QUF2WnVCLG9CQUFLLEdBQUcsT0FBTyxDQUFDO0FBRjNCLGNBQWM7SUFEMUIsd0JBQWdCLEVBQStDO0dBQ25ELGNBQWMsQ0F5WjFCO0FBelpZLHdDQUFjO0FBMlozQixrQkFBZSxjQUFjLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzMvMjUvMDI1LlxuICovXG5cbmltcG9ydCB7IGlzVW5kZWYsIG1pbmlmeUhUTUwsIHRyaW0gfSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCBfTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIFNZTUJPTF9DQUNIRSwgSU1kY29uZk1ldGEgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBJRG93bmxvYWRPcHRpb25zLCBJTm92ZWwgfSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IHsgSUZldGNoQ2hhcHRlciwgSU9wdGlvbnNSdW50aW1lIH0gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCAqIGFzIE5vdmVsU2l0ZURlbW8gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCBOb3ZlbFNpdGVCYXNlIGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IG5vdmVsVGV4dCBmcm9tICdub3ZlbC10ZXh0JztcblxuQHN0YXRpY0ltcGxlbWVudHM8X05vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZVNmYWNnPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZVNmYWNnIGV4dGVuZHMgTm92ZWxTaXRlQmFzZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gJ3NmYWNnJztcblxuXHRtYWtlVXJsKHVybG9iajogX05vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyKTogVVJMXG5cdHtcblx0XHRsZXQgdXJsOiBzdHJpbmc7XG5cblx0XHRpZiAoYm9vbCA8IDApXG5cdFx0e1xuXHRcdFx0dXJsID0gYGh0dHA6Ly9ib29rLnNmYWNnLmNvbS9Ob3ZlbC8ke3VybG9iai5ub3ZlbF9pZH0vYDtcblx0XHR9XG5cdFx0ZWxzZSBpZiAodXJsb2JqLmNoYXB0ZXJfdmlwICYmIHVybG9iai5jaGFwdGVyX2lkKVxuXHRcdHtcblx0XHRcdHVybCA9IGBodHRwOi8vYm9vay5zZmFjZy5jb20vdmlwL2MvJHt1cmxvYmouY2hhcHRlcl9pZH0vYDtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGxldCBjaWQgPSAoIWJvb2wgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpID8gW3VybG9iai5ub3ZlbF9waWQsIHVybG9iai5jaGFwdGVyX2lkXS5qb2luKCcvJykgOiAnTWFpbkluZGV4JztcblxuXHRcdFx0dXJsID0gYGh0dHA6Ly9ib29rLnNmYWNnLmNvbS9Ob3ZlbC8ke3VybG9iai5ub3ZlbF9pZH0vJHtjaWR9L2A7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBVUkwodXJsKTtcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogVVJMIHwgc3RyaW5nLCBvcHRpb25zPyk6IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHRsZXQgdXJsb2JqID0ge1xuXHRcdFx0dXJsOiB1cmwsXG5cblx0XHRcdG5vdmVsX3BpZDogbnVsbCxcblx0XHRcdG5vdmVsX2lkOiBudWxsLFxuXHRcdFx0Y2hhcHRlcl9pZDogbnVsbCxcblxuXHRcdFx0Y2hhcHRlcl92aXA6IG51bGwsXG5cdFx0fTtcblxuXHRcdHVybG9iai51cmwgPSBuZXcgVVJMKHVybCk7XG5cdFx0dXJsID0gdXJsb2JqLnVybC5ocmVmO1xuXG5cdFx0bGV0IHIgPSAvYm9va1xcLnNmYWNnXFwuY29tXFwvTm92ZWxcXC8oXFxkKylcXC8oPzooXFxkKylcXC8oXFxkKykpLztcblxuXHRcdGxldCBtID0gci5leGVjKHVybCk7XG5cdFx0aWYgKG0pXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX3BpZCA9IG1bMl07XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdFx0dXJsb2JqLmNoYXB0ZXJfaWQgPSBtWzNdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvYm9va1xcLnNmYWNnXFwuY29tXFwvTm92ZWxcXC8oXFxkKylcXC8oPzpNYWluSW5kZXgpPy87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvYm9va1xcLnNmYWNnXFwuY29tXFwvdmlwXFwvY1xcLyhcXGQrKS87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmouY2hhcHRlcl9pZCA9IG1bMV07XG5cdFx0XHR1cmxvYmouY2hhcHRlcl92aXAgPSB0cnVlO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHJldHVybiB1cmxvYmo7XG5cdH1cblxuXHRjcmVhdGVNYWluVXJsKHVybClcblx0e1xuXHRcdGxldCBkYXRhID0gdGhpcy5wYXJzZVVybCh1cmwpO1xuXG5cdFx0aWYgKCFkYXRhIHx8ICFkYXRhLm5vdmVsX2lkKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHR9XG5cblx0XHRsZXQgcmV0ID0gdGhpcy5tYWtlVXJsKGRhdGEsIHRydWUpO1xuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldDogSUZldGNoQ2hhcHRlciwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlKTogc3RyaW5nXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0bGV0IGh0bWwgPSBtaW5pZnlIVE1MKHJldC5kb20uJCgnI0NoYXB0ZXJCb2R5JykuaHRtbCgpKTtcblxuXHRcdFx0Ly9odG1sID0gaHRtbC5yZXBsYWNlKC9eKCZuYnNwOyl7NH0vZ20sICcnKTtcblx0XHRcdGh0bWwgPSBodG1sLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcblxuXHRcdFx0cmV0LmRvbS4kKCcjQ2hhcHRlckJvZHknKS5odG1sKGh0bWwpO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cblx0XHR9XG5cblx0XHRyZXQuZG9tLiQoJyNDaGFwdGVyQm9keScpLmh0bWwoZnVuY3Rpb24gKGksIG9sZClcblx0XHR7XG5cdFx0XHRyZXR1cm4gb2xkLnJlcGxhY2UoLyg8XFwvcD4pWyBcXHRdKig8cD4pL2csICckMVxcbiQyJyk7XG5cdFx0fSk7XG5cblx0XHQvKlxuXHRcdHJldC5kb20uJCgnI0NoYXB0ZXJCb2R5IHAnKS50ZXh0KGZ1bmN0aW9uIChpLCBvbGQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIG9sZCArIFwiXFxuXCI7XG5cdFx0fSk7XG5cdFx0Ki9cblxuXHRcdHJldC5kb20uJCgnI0NoYXB0ZXJCb2R5IGltZ1tzcmNdJykuZWFjaChmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdGxldCBzcmMgPSByZXQuZG9tLiQodGhpcykucHJvcCgnc3JjJykudHJpbSgpO1xuXG5cdFx0XHRpZiAoc3JjKVxuXHRcdFx0e1xuXHRcdFx0XHRjYWNoZS5jaGFwdGVyLmltZ3MgPSBjYWNoZS5jaGFwdGVyLmltZ3MgfHwgW107XG5cblx0XHRcdFx0Y2FjaGUuY2hhcHRlci5pbWdzLnB1c2goc3JjKTtcblx0XHRcdFx0Y2FjaGUubm92ZWwuaW1ncy5wdXNoKHNyYyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRsZXQgdGV4dCA9IHJldC5kb20uJCgnI0NoYXB0ZXJCb2R5JykudGV4dCgpO1xuXG5cdFx0aWYgKGNhY2hlLmNoYXB0ZXIuY2hhcHRlcl92aXApXG5cdFx0e1xuXHRcdFx0dGV4dCA9IGDku5josrvnq6DoioJcXG5cXG49PT09PT09PT09PT09PT09PT09PT09PT09PVxcblxcbiR7dGV4dH1gO1xuXHRcdH1cblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdGxldCBjaGFwdGVyX2RhdGU7XG5cdFx0XHRsZXQgZCA9IHJldC5kb20uJCgnI1wiYXJ0aWNsZSAuYXJ0aWNsZS1kZXNjIC50ZXh0OmVxKDEpJylcblx0XHRcdFx0LnRleHQoKVxuXHRcdFx0XHQucmVwbGFjZSgvXi4r77yaL2csICcnKVxuXHRcdFx0XHQudHJpbSgpXG5cdFx0XHQ7XG5cblx0XHRcdGNoYXB0ZXJfZGF0ZSA9IG1vbWVudChkLCAnWVlZWS9NTS9ERCBISDptbTpzcycpLmxvY2FsKCk7XG5cblx0XHRcdGNhY2hlLmNoYXB0ZXIuY2hhcHRlcl9kYXRlID0gY2hhcHRlcl9kYXRlO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7fVxuXG5cdFx0cmV0dXJuIHRleHQ7XG5cdH1cblxuXHRhc3luYyBnZXRfdm9sdW1lX2xpc3Q8VCA9IElPcHRpb25zUnVudGltZT4oaW5wdXRVcmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fVxuXHQpOiBQcm9taXNlPElOb3ZlbD5cblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGxldCB1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwoaW5wdXRVcmwpO1xuXG5cdFx0cmV0dXJuIGF3YWl0IGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKGRvbS51cmwuaHJlZik7XG5cblx0XHRcdFx0bGV0IGRhdGFfbWV0YSA9IGF3YWl0IHNlbGYuX2dldF9tZXRhKHVybCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0XHRcdGxldCBfY2FjaGVfZGF0ZXMgPSBbXTtcblx0XHRcdFx0bGV0IHZvbHVtZV9saXN0ID0gW10gYXMgX05vdmVsU2l0ZS5JVm9sdW1lW107XG5cblx0XHRcdFx0bGV0IGN1cnJlbnRWb2x1bWU6IF9Ob3ZlbFNpdGUuSVZvbHVtZTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfdmlwID0gMDtcblxuXHRcdFx0XHRsZXQgdGFibGUgPSAkKCcucy1saXN0IC5zdG9yeS1jYXRhbG9nID4gZGl2Jyk7XG5cdFx0XHRcdHRhYmxlXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCB0ciA9IGRvbS4kKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRpZiAodHIuaXMoJy5jYXRhbG9nLWhkJykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZTogbm92ZWxUZXh0LnRyaW0odHIuZmluZCgnLmNhdGFsb2ctdGl0bGUnKS50ZXh0KCkpLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogW10sXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIGlmICh0ci5pcygnLmNhdGFsb2ctbGlzdCcpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHR0ci5maW5kKCd1bCA+IGxpID4gYScpXG5cdFx0XHRcdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4KVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdGxldCBhID0gZG9tLiQodGhpcyk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGxldCBocmVmID0gYS5wcm9wKCdocmVmJyk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGxldCBkYXRhID0gc2VsZi5wYXJzZVVybChocmVmKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFkYXRhLmNoYXB0ZXJfaWQgfHwgIWRhdGEuY2hhcHRlcl92aXAgJiYgIWRhdGEubm92ZWxfcGlkKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGhyZWYsIGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGhyZWYgPSBzZWxmLm1ha2VVcmwoZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0ZGF0YS51cmwgPSBocmVmO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl92aXAgPSBhLmZpbmQoJy5pY25fdmlwJykubGVuZ3RoO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoY2hhcHRlcl92aXApXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG5vdmVsX3ZpcCsrO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0XHRhXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC5maW5kKCcuaWNuLCAuaWNuX3ZpcCcpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC5yZW1vdmUoKVxuXHRcdFx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl90aXRsZSA9IHRyaW0oYS50ZXh0KCkpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoY2hhcHRlcl90aXRsZSA9PT0gJycpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFjaGFwdGVyX3RpdGxlKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhocmVmKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWVcblx0XHRcdFx0XHRcdFx0XHRcdFx0LmNoYXB0ZXJfbGlzdFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQucHVzaCh7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogY3VycmVudFZvbHVtZS5jaGFwdGVyX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsOiBocmVmLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGE6IGRhdGEsXG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3ZpcCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGF0ZTtcblxuXHRcdFx0XHRpZiAoX2NhY2hlX2RhdGVzLmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdF9jYWNoZV9kYXRlcy5zb3J0KCk7XG5cblx0XHRcdFx0XHRub3ZlbF9kYXRlID0gbW9tZW50LnVuaXgoX2NhY2hlX2RhdGVzW19jYWNoZV9kYXRlcy5sZW5ndGggLSAxXSkubG9jYWwoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChub3ZlbF92aXApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwgPSBkYXRhX21ldGEubm92ZWwgfHwge307XG5cdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MgPSBkYXRhX21ldGEubm92ZWwudGFncyB8fCBbXTtcblxuXHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzLnB1c2goJ1ZJUCcpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdHVybDogZG9tLnVybCxcblx0XHRcdFx0XHR1cmxfZGF0YSxcblxuXHRcdFx0XHRcdC4uLmRhdGFfbWV0YSxcblxuXHRcdFx0XHRcdG5vdmVsX3ZpcCxcblxuXHRcdFx0XHRcdHZvbHVtZV9saXN0LFxuXG5cdFx0XHRcdFx0Ly9ub3ZlbF9kYXRlLFxuXG5cdFx0XHRcdFx0Y2hlY2tkYXRlOiBtb21lbnQoKS5sb2NhbCgpLFxuXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdH0gYXMgSU5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdC50YXAoZnVuY3Rpb24gKG5vdmVsKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zb2xlLmxvZyhub3ZlbCk7XG5cdFx0XHR9KVxuXHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfZ2V0X21ldGEoaW5wdXRVcmwsIG9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgdXJsID0gdGhpcy5tYWtlVXJsKHRoaXMucGFyc2VVcmwoaW5wdXRVcmwpLCAtMSk7XG5cblx0XHRyZXR1cm4gZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb20pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblx0XHRcdFx0bGV0IGRhdGE6IElNZGNvbmZNZXRhID0ge307XG5cdFx0XHRcdGRhdGEubm92ZWwgPSB7fTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yID0gJCgnLmF1dGhvci1pbmZvIC5hdXRob3ItbmFtZSBzcGFuJylcblx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2Rlc2MgPSAkKCcuc3VtbWFyeS1jb250ZW50IC5pbnRyb2R1Y2UnKVxuXHRcdFx0XHRcdC50ZXh0KClcblx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRkYXRhLm5vdmVsLnN0YXR1cyA9ICQoJy5jb3VudC1kZXRhaWwgLnRleHQ6ZXEoMSknKVxuXHRcdFx0XHRcdC50ZXh0KClcblx0XHRcdFx0XHQucmVwbGFjZSgvXi4rXFxbKC4rKVxcXS4qJC9nLCAnJDEnKVxuXHRcdFx0XHQ7XG5cdFx0XHRcdGRhdGEubm92ZWwudGFncyA9IFtdO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgdCA9ICQoJy5jb3VudC1kZXRhaWwgLnRleHQ6ZXEoMCknKVxuXHRcdFx0XHRcdFx0LnRleHQoKVxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoL14uK++8mi9nLCAnJylcblx0XHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRpZiAodClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MucHVzaCh0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQkKCcubWFpbi1wYXJ0IC50YWctbGlzdCAudGFnIC50ZXh0Jylcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCB0ID0gdHJpbSgkKHRoaXMpXG5cdFx0XHRcdFx0XHRcdC50ZXh0KClcblx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL1xcKFxcZCtcXCkvZywgJycpKVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRpZiAodClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzLnB1c2godCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgZCA9ICQoJy5jb3VudC1kZXRhaWwgLnRleHQ6bGFzdCcpXG5cdFx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgv5pu05paw77yaLywgJycpXG5cdFx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGQpO1xuXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSA9IG1vbWVudChkLCAnWVlZWS9NTS9ERCBISDptbTpzcycpLmxvY2FsKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgbm92ZWxfdGl0bGUgPSB0cmltKCQoJy5zdW1tYXJ5LWNvbnRlbnQgLnRpdGxlIC50ZXh0JykudGV4dCgpKTtcblxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKHVybCk7XG5cblx0XHRcdFx0JChgLmQtc3VtbWFyeSAuc3VtbWFyeS1waWMgaW1nW3NyY10sICNoYXNUaWNrZXQgLmxlZnQtcGFydCBhW2hyZWYqPVwiJHt1cmxfZGF0YS5ub3ZlbF9pZH1cIl0gaW1nW3NyY11gKS5lYWNoKGZ1bmN0aW9uICgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgc3JjID0gJCh0aGlzKS5wcm9wKCdzcmMnKTtcblxuXHRcdFx0XHRcdGlmIChzcmMpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC5jb3ZlciA9IHNyYztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0Li4uZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxuXG5cdFx0XHRcdFx0bm92ZWxfYXV0aG9yLFxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cblx0XHRcdFx0XHRub3ZlbF9kYXRlLFxuXG5cdFx0XHRcdH07XG5cdFx0XHR9KVxuXHRcdDtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVTZmFjZztcbiJdfQ==