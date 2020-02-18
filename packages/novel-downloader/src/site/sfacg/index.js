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
//import { URL } from 'jsdom-url';
const jsdom_extra_1 = require("jsdom-extra");
const index_2 = require("../index");
const novel_text_1 = require("novel-text");
const util_2 = require("./util");
let NovelSiteSfacg = /** @class */ (() => {
    let NovelSiteSfacg = class NovelSiteSfacg extends base_1.default {
        static check(url, ...argv) {
            return util_2.check(url, ...argv);
        }
        static makeUrl(urlobj, bool, ...argv) {
            return util_2.makeUrl(urlobj, bool, ...argv);
        }
        static parseUrl(url, ...argv) {
            return util_2.parseUrl(url, ...argv);
        }
        makeUrl(urlobj, bool, ...argv) {
            return util_2.makeUrl(urlobj, bool, ...argv);
        }
        parseUrl(url, ...argv) {
            return util_2.parseUrl(url, ...argv);
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
    return NovelSiteSfacg;
})();
exports.NovelSiteSfacg = NovelSiteSfacg;
exports.default = NovelSiteSfacg;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQXVEO0FBQ3ZELG9DQUFtRjtBQUluRix1Q0FBeUM7QUFDekMsa0NBQWtDO0FBQ2xDLDZDQUErRDtBQUUvRCxvQ0FBa0M7QUFDbEMsMkNBQW1DO0FBQ25DLGlDQUFrRDtBQUdsRDtJQUFBLElBQWEsY0FBYyxHQUEzQixNQUFhLGNBQWUsU0FBUSxjQUFhO1FBSWhELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBd0MsRUFBRSxHQUFHLElBQUk7WUFFN0QsT0FBTyxZQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBNEIsRUFBRSxJQUF1QixFQUFFLEdBQUcsSUFBSTtZQUU1RSxPQUFPLGNBQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDdEMsQ0FBQztRQUVELE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBMEIsRUFBRSxHQUFHLElBQUk7WUFFbEQsT0FBTyxlQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVELE9BQU8sQ0FBQyxNQUE0QixFQUFFLElBQXVCLEVBQUUsR0FBRyxJQUFJO1lBRXJFLE9BQU8sY0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUN0QyxDQUFDO1FBRUQsUUFBUSxDQUFDLEdBQTBCLEVBQUUsR0FBRyxJQUFJO1lBRTNDLE9BQU8sZUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFRCxhQUFhLENBQUksR0FBaUIsRUFBRSxjQUFtQztZQUV0RSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdB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QUFJLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBRTlCLElBQUksR0FBRyxFQUNQO3dCQUNDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztxQkFDdkI7Z0JBQ0YsQ0FBQyxDQUFDLENBQUM7Z0JBRUgscUNBQ0MsR0FBRztvQkFDSCxRQUFRLElBRUwsSUFBSSxLQUVQLFdBQVc7b0JBRVgsWUFBWTtvQkFDWixVQUFVO29CQUVWLFVBQVUsSUFFVDtZQUNILENBQUMsQ0FBQyxDQUNGO1FBQ0YsQ0FBQztLQUNELENBQUE7SUFoWHVCLG9CQUFLLEdBQUcsT0FBTyxDQUFDO0lBRjNCLGNBQWM7UUFEMUIsd0JBQWdCLEVBQStDO09BQ25ELGNBQWMsQ0FrWDFCO0lBQUQscUJBQUM7S0FBQTtBQWxYWSx3Q0FBYztBQW9YM0Isa0JBQWUsY0FBYyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzI1LzAyNS5cbiAqL1xuXG5pbXBvcnQgeyBpc1VuZGVmLCBtaW5pZnlIVE1MLCB0cmltIH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgX05vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBTWU1CT0xfQ0FDSEUsIElNZGNvbmZNZXRhIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgSURvd25sb2FkT3B0aW9ucywgSU5vdmVsIH0gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCB7IElGZXRjaENoYXB0ZXIsIElPcHRpb25zUnVudGltZSB9IGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgKiBhcyBOb3ZlbFNpdGVEZW1vIGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgTm92ZWxTaXRlQmFzZSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuLy9pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IG5vdmVsVGV4dCBmcm9tICdub3ZlbC10ZXh0JztcbmltcG9ydCB7IHBhcnNlVXJsLCBtYWtlVXJsLCBjaGVjayB9IGZyb20gJy4vdXRpbCc7XG5cbkBzdGF0aWNJbXBsZW1lbnRzPF9Ob3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVTZmFjZz4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVTZmFjZyBleHRlbmRzIE5vdmVsU2l0ZUJhc2Vcbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWSA9ICdzZmFjZyc7XG5cblx0c3RhdGljIGNoZWNrKHVybDogc3RyaW5nIHwgVVJMIHwgX05vdmVsU2l0ZS5JUGFyc2VVcmwsIC4uLmFyZ3YpOiBib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gY2hlY2sodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdHN0YXRpYyBtYWtlVXJsKHVybG9iajogX05vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIG1ha2VVcmwodXJsb2JqLCBib29sLCAuLi5hcmd2KVxuXHR9XG5cblx0c3RhdGljIHBhcnNlVXJsKHVybDogc3RyaW5nIHwgVVJMIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIHBhcnNlVXJsKHVybCwgLi4uYXJndik7XG5cdH1cblxuXHRtYWtlVXJsKHVybG9iajogX05vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIG1ha2VVcmwodXJsb2JqLCBib29sLCAuLi5hcmd2KVxuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwgfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gcGFyc2VVcmwodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdGNyZWF0ZU1haW5Vcmw8VD4odXJsOiBzdHJpbmcgfCBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0bGV0IGRhdGEgPSB0aGlzLnBhcnNlVXJsKHVybCk7XG5cblx0XHRpZiAoIWRhdGEgfHwgIWRhdGEubm92ZWxfaWQpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5sb2coZGF0YSk7XG5cblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcigpO1xuXHRcdH1cblxuXHRcdGxldCByZXQgPSB0aGlzLm1ha2VVcmwoZGF0YSwgdHJ1ZSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldDogSUZldGNoQ2hhcHRlciwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlKTogc3RyaW5nXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0bGV0IGh0bWwgPSBtaW5pZnlIVE1MKHJldC5kb20uJCgnI0NoYXB0ZXJCb2R5JykuaHRtbCgpKTtcblxuXHRcdFx0Ly9odG1sID0gaHRtbC5yZXBsYWNlKC9eKCZuYnNwOyl7NH0vZ20sICcnKTtcblx0XHRcdGh0bWwgPSBodG1sLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcblxuXHRcdFx0cmV0LmRvbS4kKCcjQ2hhcHRlckJvZHknKS5odG1sKGh0bWwpO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cblx0XHR9XG5cblx0XHRyZXQuZG9tLiQoJyNDaGFwdGVyQm9keScpLmh0bWwoZnVuY3Rpb24gKGksIG9sZClcblx0XHR7XG5cdFx0XHRyZXR1cm4gb2xkLnJlcGxhY2UoLyg8XFwvcD4pWyBcXHRdKig8cD4pL2csICckMVxcbiQyJyk7XG5cdFx0fSk7XG5cblx0XHQvKlxuXHRcdHJldC5kb20uJCgnI0NoYXB0ZXJCb2R5IHAnKS50ZXh0KGZ1bmN0aW9uIChpLCBvbGQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIG9sZCArIFwiXFxuXCI7XG5cdFx0fSk7XG5cdFx0Ki9cblxuXHRcdHJldC5kb20uJCgnI0NoYXB0ZXJCb2R5IGltZ1tzcmNdJykuZWFjaChmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGxldCBzcmMgPSByZXQuZG9tLiQodGhpcykucHJvcCgnc3JjJykudHJpbSgpO1xuXG5cdFx0XHRpZiAoc3JjKVxuXHRcdFx0e1xuXHRcdFx0XHRjYWNoZS5jaGFwdGVyLmltZ3MgPSBjYWNoZS5jaGFwdGVyLmltZ3MgfHwgW107XG5cblx0XHRcdFx0Y2FjaGUuY2hhcHRlci5pbWdzLnB1c2goc3JjKTtcblx0XHRcdFx0Y2FjaGUubm92ZWwuaW1ncy5wdXNoKHNyYyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRsZXQgdGV4dCA9IHJldC5kb20uJCgnI0NoYXB0ZXJCb2R5JykudGV4dCgpO1xuXG5cdFx0aWYgKGNhY2hlLmNoYXB0ZXIuY2hhcHRlcl92aXApXG5cdFx0e1xuXHRcdFx0dGV4dCA9IGDku5josrvnq6DoioJcXG5cXG49PT09PT09PT09PT09PT09PT09PT09PT09PVxcblxcbiR7dGV4dH1gO1xuXHRcdH1cblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdGxldCBjaGFwdGVyX2RhdGU7XG5cdFx0XHRsZXQgZCA9IHJldC5kb20uJCgnI1wiYXJ0aWNsZSAuYXJ0aWNsZS1kZXNjIC50ZXh0OmVxKDEpJylcblx0XHRcdFx0LnRleHQoKVxuXHRcdFx0XHQucmVwbGFjZSgvXi4r77yaL2csICcnKVxuXHRcdFx0XHQudHJpbSgpXG5cdFx0XHQ7XG5cblx0XHRcdGNoYXB0ZXJfZGF0ZSA9IG1vbWVudChkLCAnWVlZWS9NTS9ERCBISDptbTpzcycpLmxvY2FsKCk7XG5cblx0XHRcdGNhY2hlLmNoYXB0ZXIuY2hhcHRlcl9kYXRlID0gY2hhcHRlcl9kYXRlO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7fVxuXG5cdFx0cmV0dXJuIHRleHQ7XG5cdH1cblxuXHRhc3luYyBnZXRfdm9sdW1lX2xpc3Q8VCA9IElPcHRpb25zUnVudGltZT4oaW5wdXRVcmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fVxuXHQpOiBQcm9taXNlPElOb3ZlbD5cblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGxldCB1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwoaW5wdXRVcmwsIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdHJldHVybiBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybChkb20udXJsLmhyZWYpO1xuXG5cdFx0XHRcdGxldCBkYXRhX21ldGEgPSBhd2FpdCBzZWxmLl9nZXRfbWV0YSh1cmwsIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlX2RhdGVzID0gW107XG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIF9Ob3ZlbFNpdGUuSVZvbHVtZVtdO1xuXG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBfTm92ZWxTaXRlLklWb2x1bWU7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3ZpcCA9IDA7XG5cblx0XHRcdFx0bGV0IHRhYmxlID0gJCgnLnMtbGlzdCAuc3RvcnktY2F0YWxvZyA+IGRpdicpO1xuXHRcdFx0XHR0YWJsZVxuXHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRsZXQgdHIgPSBkb20uJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0aWYgKHRyLmlzKCcuY2F0YWxvZy1oZCcpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IHZvbHVtZV9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGU6IG5vdmVsVGV4dC50cmltKHRyLmZpbmQoJy5jYXRhbG9nLXRpdGxlJykudGV4dCgpKSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAodHIuaXMoJy5jYXRhbG9nLWxpc3QnKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0dHIuZmluZCgndWwgPiBsaSA+IGEnKVxuXHRcdFx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleClcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgYSA9IGRvbS4kKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgaHJlZiA9IGEucHJvcCgnaHJlZicpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgZGF0YSA9IHNlbGYucGFyc2VVcmwoaHJlZik7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmICghZGF0YS5jaGFwdGVyX2lkIHx8ICFkYXRhLmNoYXB0ZXJfdmlwICYmICFkYXRhLm5vdmVsX3BpZClcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhocmVmLCBkYXRhKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRocmVmID0gc2VsZi5tYWtlVXJsKGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGRhdGEudXJsID0gaHJlZjtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfdmlwID0gYS5maW5kKCcuaWNuX3ZpcCcpLmxlbmd0aDtcblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGNoYXB0ZXJfdmlwKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRub3ZlbF92aXArKztcblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0YVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQuZmluZCgnLmljbiwgLmljbl92aXAnKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQucmVtb3ZlKClcblx0XHRcdFx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfdGl0bGUgPSB0cmltKGEudGV4dCgpKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGNoYXB0ZXJfdGl0bGUgPT09ICcnKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmICghY2hhcHRlcl90aXRsZSlcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coaHJlZik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGEpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC5jaGFwdGVyX2xpc3Rcblx0XHRcdFx0XHRcdFx0XHRcdFx0LnB1c2goe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaW5kZXg6IGN1cnJlbnRWb2x1bWUuY2hhcHRlcl9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybDogaHJlZixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhOiBkYXRhLFxuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl92aXAsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGU7XG5cblx0XHRcdFx0aWYgKF9jYWNoZV9kYXRlcy5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRfY2FjaGVfZGF0ZXMuc29ydCgpO1xuXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSA9IG1vbWVudC51bml4KF9jYWNoZV9kYXRlc1tfY2FjaGVfZGF0ZXMubGVuZ3RoIC0gMV0pLmxvY2FsKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAobm92ZWxfdmlwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsID0gZGF0YV9tZXRhLm5vdmVsIHx8IHt9O1xuXHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzID0gZGF0YV9tZXRhLm5vdmVsLnRhZ3MgfHwgW107XG5cblx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncy5wdXNoKCdWSVAnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiB7XG5cblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHQuLi5kYXRhX21ldGEsXG5cblx0XHRcdFx0XHRub3ZlbF92aXAsXG5cblx0XHRcdFx0XHR2b2x1bWVfbGlzdCxcblxuXHRcdFx0XHRcdC8vbm92ZWxfZGF0ZSxcblxuXHRcdFx0XHRcdGNoZWNrZGF0ZTogbW9tZW50KCkubG9jYWwoKSxcblxuXHRcdFx0XHRcdGltZ3M6IFtdIGFzIHN0cmluZ1tdLFxuXHRcdFx0XHR9IGFzIElOb3ZlbDtcblx0XHRcdH0pXG5cdFx0XHQudGFwKGZ1bmN0aW9uIChub3ZlbClcblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZS5sb2cobm92ZWwpO1xuXHRcdFx0fSlcblx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX2dldF9tZXRhKGlucHV0VXJsLCBvcHRpb25zUnVudGltZSlcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IHVybCA9IHRoaXMubWFrZVVybCh0aGlzLnBhcnNlVXJsKGlucHV0VXJsKSwgLTEpO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cdFx0XHRcdGxldCBkYXRhOiBJTWRjb25mTWV0YSA9IHt9O1xuXHRcdFx0XHRkYXRhLm5vdmVsID0ge307XG5cblx0XHRcdFx0bGV0IG5vdmVsX2F1dGhvciA9ICQoJy5hdXRob3ItaW5mbyAuYXV0aG9yLW5hbWUgc3BhbicpXG5cdFx0XHRcdFx0LnRleHQoKVxuXHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kZXNjID0gJCgnLnN1bW1hcnktY29udGVudCAuaW50cm9kdWNlJylcblx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0ZGF0YS5ub3ZlbC5zdGF0dXMgPSAkKCcuY291bnQtZGV0YWlsIC50ZXh0OmVxKDEpJylcblx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL14uK1xcWyguKylcXF0uKiQvZywgJyQxJylcblx0XHRcdFx0O1xuXHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MgPSBbXTtcblxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHQgPSAkKCcuY291bnQtZGV0YWlsIC50ZXh0OmVxKDApJylcblx0XHRcdFx0XHRcdC50ZXh0KClcblx0XHRcdFx0XHRcdC5yZXBsYWNlKC9eLivvvJovZywgJycpXG5cdFx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0aWYgKHQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZGF0YS5ub3ZlbC50YWdzLnB1c2godCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0JCgnLm1haW4tcGFydCAudGFnLWxpc3QgLnRhZyAudGV4dCcpXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRsZXQgdCA9IHRyaW0oJCh0aGlzKVxuXHRcdFx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9cXChcXGQrXFwpL2csICcnKSlcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0aWYgKHQpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRhdGEubm92ZWwudGFncy5wdXNoKHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGF0ZTtcblxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IGQgPSAkKCcuY291bnQtZGV0YWlsIC50ZXh0Omxhc3QnKVxuXHRcdFx0XHRcdFx0LnRleHQoKVxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoL+abtOaWsO+8mi8sICcnKVxuXHRcdFx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkKTtcblxuXHRcdFx0XHRcdG5vdmVsX2RhdGUgPSBtb21lbnQoZCwgJ1lZWVkvTU0vREQgSEg6bW06c3MnKS5sb2NhbCgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gdHJpbSgkKCcuc3VtbWFyeS1jb250ZW50IC50aXRsZSAudGV4dCcpLnRleHQoKSk7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybCh1cmwpO1xuXG5cdFx0XHRcdCQoYC5kLXN1bW1hcnkgLnN1bW1hcnktcGljIGltZ1tzcmNdLCAjaGFzVGlja2V0IC5sZWZ0LXBhcnQgYVtocmVmKj1cIiR7dXJsX2RhdGEubm92ZWxfaWR9XCJdIGltZ1tzcmNdYCkuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdGxldCBzcmMgPSAkKHRoaXMpLnByb3AoJ3NyYycpO1xuXG5cdFx0XHRcdFx0aWYgKHNyYylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRkYXRhLm5vdmVsLmNvdmVyID0gc3JjO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR1cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHQuLi5kYXRhLFxuXG5cdFx0XHRcdFx0bm92ZWxfdGl0bGUsXG5cblx0XHRcdFx0XHRub3ZlbF9hdXRob3IsXG5cdFx0XHRcdFx0bm92ZWxfZGVzYyxcblxuXHRcdFx0XHRcdG5vdmVsX2RhdGUsXG5cblx0XHRcdFx0fTtcblx0XHRcdH0pXG5cdFx0O1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZVNmYWNnO1xuIl19