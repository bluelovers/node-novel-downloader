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
const strip_1 = require("../../strip");
const util_1 = require("../../util");
const index_1 = require("../index");
const base_1 = require("../demo/base");
//import { URL } from 'jsdom-url';
const jsdom_extra_1 = require("jsdom-extra");
const index_2 = require("../index");
const novel_text_1 = require("novel-text");
const path = require("path");
const { Script } = require("vm");
const util_2 = require("./util");
let NovelSiteHetubook = /** @class */ (() => {
    let NovelSiteHetubook = class NovelSiteHetubook extends base_1.default {
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
        _stripContent(text) {
            text = strip_1.stripContent(text);
            //process.exit();
            return text
                .replace(/^　　/gm, '')
                .replace(/^[ \uFEFF\xA0]+/gm, '');
        }
        session(optionsRuntime, url) {
            super.session(optionsRuntime, url);
            Object.assign(optionsRuntime.optionsJSDOM, {
                minifyHTML: false,
                runScripts: 'dangerously',
                pretendToBeVisual: true,
                resources: "usable",
            });
            return this;
        }
        _parseChapter(ret, optionsRuntime, cache) {
            if (!ret) {
                return '';
            }
            let body_selector = '#content';
            ret.dom.$(body_selector).find('h2').remove();
            ret.dom.$(body_selector).html(function (i, old) {
                return old
                    .replace(/(<\/div>)/ig, '$1\n');
            });
            let text = ret.dom.$(body_selector).text();
            text = this._stripContent(text);
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
                let table = $('#dir').find('dt, dd');
                table
                    .each(function (index) {
                    // @ts-ignore
                    let tr = dom.$(this);
                    if (tr.is('dt')) {
                        currentVolume = volume_list[volume_list.length] = {
                            volume_index: volume_list.length,
                            volume_title: novel_text_1.default.trim(tr.text()),
                            chapter_list: [],
                        };
                    }
                    if (tr.is('dd, dt:has(a)')) {
                        tr.find('a:eq(0)')
                            .each(function (index) {
                            // @ts-ignore
                            let a = dom.$(this);
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
                            });
                        });
                    }
                });
                let novel_date;
                if (_cache_dates.length) {
                    _cache_dates.sort();
                    novel_date = index_2.moment.unix(_cache_dates[_cache_dates.length - 1]).local();
                }
                return Object.assign(Object.assign({ url: dom.url, url_data }, data_meta), { volume_list, 
                    //novel_date,
                    checkdate: index_2.moment().local(), imgs: [] });
            })
                .tap(function (novel) {
                console.dir(novel, {
                    colors: true,
                });
            });
        }
        async _get_meta(inputUrl, optionsRuntime, cache) {
            const self = this;
            let url = this.makeUrl(this.parseUrl(inputUrl), -1);
            //return fromURL(url, optionsRuntime.optionsJSDOM)
            return Promise.resolve(cache.dom)
                .then(function (dom) {
                const $ = dom.$;
                let data = {};
                data.novel = {};
                let novel_author = util_1.trim($('.book_info a[href*="/author/"]').text());
                $('.jieshao_content h3:eq(0)').html(function (i, old) {
                    return old.replace(/(<br\/?>)/ig, '$1\n');
                });
                let novel_desc = $('.book_info .intro')
                    .text()
                    .trim();
                if ($('.book_info.finish').length) {
                    data.novel.status = '已完結';
                }
                let novel_title = util_1.trim($('.book_info > img[alt]').attr('alt'));
                let url_data = self.parseUrl(url);
                data.novel.cover = $(`.book_info > img`).prop('src');
                data.novel.tags = [];
                data.novel.tags.push($('.title a:eq(1)').text());
                $('.tag dd .button')
                    .each(function () {
                    // @ts-ignore
                    data.novel.tags.push($(this).text());
                });
                return Object.assign(Object.assign({ url,
                    url_data }, data), { novel_title,
                    novel_author,
                    novel_desc });
            });
        }
    };
    NovelSiteHetubook.IDKEY = path.basename(__dirname);
    NovelSiteHetubook = __decorate([
        index_1.staticImplements()
    ], NovelSiteHetubook);
    return NovelSiteHetubook;
})();
exports.NovelSiteHetubook = NovelSiteHetubook;
exports.default = NovelSiteHetubook;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgsdUNBQTJDO0FBQzNDLHFDQUFxRTtBQUNyRSxvQ0FBbUY7QUFJbkYsdUNBQXlDO0FBQ3pDLGtDQUFrQztBQUNsQyw2Q0FBK0Q7QUFFL0Qsb0NBQWtDO0FBQ2xDLDJDQUFtQztBQUNuQyw2QkFBNkI7QUFHN0IsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQyxpQ0FBa0Q7QUFHbEQ7SUFBQSxJQUFhLGlCQUFpQixHQUE5QixNQUFhLGlCQUFrQixTQUFRLGNBQWE7UUFJbkQsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUF3QyxFQUFFLEdBQUcsSUFBSTtZQUU3RCxPQUFPLFlBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUE0QixFQUFFLElBQXVCLEVBQUUsR0FBRyxJQUFJO1lBRTVFLE9BQU8sY0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUN0QyxDQUFDO1FBRUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUEwQixFQUFFLEdBQUcsSUFBSTtZQUVsRCxPQUFPLGVBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRUQsT0FBTyxDQUFDLE1BQTRCLEVBQUUsSUFBdUIsRUFBRSxHQUFHLElBQUk7WUFFckUsT0FBTyxjQUFPLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO1FBQ3RDLENBQUM7UUFFRCxRQUFRLENBQUMsR0FBMEIsRUFBRSxHQUFHLElBQUk7WUFFM0MsT0FBTyxlQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7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XG5cbmltcG9ydCB7IHN0cmlwQ29udGVudCB9IGZyb20gJy4uLy4uL3N0cmlwJztcbmltcG9ydCB7IGFycmF5X3VuaXF1ZSwgaXNVbmRlZiwgbWluaWZ5SFRNTCwgdHJpbSB9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IF9Ob3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgU1lNQk9MX0NBQ0hFLCBJTWRjb25mTWV0YSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IElEb3dubG9hZE9wdGlvbnMsIElOb3ZlbCB9IGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgeyBJRmV0Y2hDaGFwdGVyLCBJT3B0aW9uc1J1bnRpbWUgfSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0ICogYXMgTm92ZWxTaXRlRGVtbyBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IE5vdmVsU2l0ZUJhc2UgZnJvbSAnLi4vZGVtby9iYXNlJztcbi8vaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkLCBibHVlYmlyZERlY29yYXRvciB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IG1vbWVudCB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgKiBhcyBTdHJVdGlsIGZyb20gJ3N0ci11dGlsJztcbmltcG9ydCB7IHpoUmVnRXhwIH0gZnJvbSAncmVnZXhwLWNqayc7XG5jb25zdCB7IFNjcmlwdCB9ID0gcmVxdWlyZShcInZtXCIpO1xuaW1wb3J0IHsgcGFyc2VVcmwsIG1ha2VVcmwsIGNoZWNrIH0gZnJvbSAnLi91dGlsJztcblxuQHN0YXRpY0ltcGxlbWVudHM8X05vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZUhldHVib29rPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZUhldHVib29rIGV4dGVuZHMgTm92ZWxTaXRlQmFzZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gcGF0aC5iYXNlbmFtZShfX2Rpcm5hbWUpO1xuXG5cdHN0YXRpYyBjaGVjayh1cmw6IHN0cmluZyB8IFVSTCB8IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsLCAuLi5hcmd2KTogYm9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIGNoZWNrKHVybCwgLi4uYXJndik7XG5cdH1cblxuXHRzdGF0aWMgbWFrZVVybCh1cmxvYmo6IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sPzogYm9vbGVhbiB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBtYWtlVXJsKHVybG9iaiwgYm9vbCwgLi4uYXJndilcblx0fVxuXG5cdHN0YXRpYyBwYXJzZVVybCh1cmw6IHN0cmluZyB8IFVSTCB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBwYXJzZVVybCh1cmwsIC4uLmFyZ3YpO1xuXHR9XG5cblx0bWFrZVVybCh1cmxvYmo6IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sPzogYm9vbGVhbiB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBtYWtlVXJsKHVybG9iaiwgYm9vbCwgLi4uYXJndilcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogc3RyaW5nIHwgVVJMIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIHBhcnNlVXJsKHVybCwgLi4uYXJndik7XG5cdH1cblxuXHRjcmVhdGVNYWluVXJsPFQ+KHVybDogc3RyaW5nIHwgVVJMLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSlcblx0e1xuXHRcdGxldCBkYXRhID0gdGhpcy5wYXJzZVVybCh1cmwpO1xuXG5cdFx0aWYgKCFkYXRhIHx8ICFkYXRhLm5vdmVsX2lkKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHR9XG5cblx0XHRsZXQgcmV0ID0gdGhpcy5tYWtlVXJsKGRhdGEsIHRydWUsIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRfc3RyaXBDb250ZW50KHRleHQ6IHN0cmluZylcblx0e1xuXHRcdHRleHQgPSBzdHJpcENvbnRlbnQodGV4dCk7XG5cblx0XHQvL3Byb2Nlc3MuZXhpdCgpO1xuXG5cdFx0cmV0dXJuIHRleHRcblx0XHRcdC5yZXBsYWNlKC9e44CA44CAL2dtLCAnJylcblx0XHRcdC5yZXBsYWNlKC9eWyBcXHVGRUZGXFx4QTBdKy9nbSwgJycpXG5cdFx0O1xuXHR9XG5cblx0c2Vzc2lvbihvcHRpb25zUnVudGltZSwgdXJsKVxuXHR7XG5cdFx0c3VwZXIuc2Vzc2lvbihvcHRpb25zUnVudGltZSwgdXJsKTtcblxuXHRcdE9iamVjdC5hc3NpZ24ob3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLCB7XG5cdFx0XHRtaW5pZnlIVE1MOiBmYWxzZSxcblx0XHRcdHJ1blNjcmlwdHM6ICdkYW5nZXJvdXNseScsXG5cdFx0XHRwcmV0ZW5kVG9CZVZpc3VhbDogdHJ1ZSxcblx0XHRcdHJlc291cmNlczogXCJ1c2FibGVcIixcblx0XHR9IGFzIElPcHRpb25zUnVudGltZVtcIm9wdGlvbnNKU0RPTVwiXSk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldDogSUZldGNoQ2hhcHRlciwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlKVxuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGxldCBib2R5X3NlbGVjdG9yID0gJyNjb250ZW50JztcblxuXHRcdHJldC5kb20uJChib2R5X3NlbGVjdG9yKS5maW5kKCdoMicpLnJlbW92ZSgpO1xuXG5cdFx0cmV0LmRvbS4kKGJvZHlfc2VsZWN0b3IpLmh0bWwoZnVuY3Rpb24gKGksIG9sZClcblx0XHR7XG5cdFx0XHRyZXR1cm4gb2xkXG5cdFx0XHRcdC5yZXBsYWNlKC8oPFxcL2Rpdj4pL2lnLCAnJDFcXG4nKVxuXHRcdFx0XHQ7XG5cdFx0fSk7XG5cblx0XHRsZXQgdGV4dCA9IHJldC5kb20uJChib2R5X3NlbGVjdG9yKS50ZXh0KCk7XG5cblx0XHR0ZXh0ID0gdGhpcy5fc3RyaXBDb250ZW50KHRleHQpO1xuXG5cdFx0cmV0dXJuIHRleHQ7XG5cdH1cblxuXHRhc3luYyBnZXRfdm9sdW1lX2xpc3Q8VCA9IElPcHRpb25zUnVudGltZT4oaW5wdXRVcmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fVxuXHQpOiBQcm9taXNlPElOb3ZlbD5cblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGxldCB1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwoaW5wdXRVcmwsIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdHJldHVybiBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybChkb20udXJsLmhyZWYpO1xuXG5cdFx0XHRcdGxldCBkYXRhX21ldGEgPSBhd2FpdCBzZWxmLl9nZXRfbWV0YSh1cmwsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0ZG9tLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlX2RhdGVzID0gW107XG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIF9Ob3ZlbFNpdGUuSVZvbHVtZVtdO1xuXG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBfTm92ZWxTaXRlLklWb2x1bWU7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3ZpcCA9IDA7XG5cblx0XHRcdFx0bGV0IHRhYmxlID0gJCgnI2RpcicpLmZpbmQoJ2R0LCBkZCcpO1xuXHRcdFx0XHR0YWJsZVxuXHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRsZXQgdHIgPSBkb20uJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0aWYgKHRyLmlzKCdkdCcpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IHZvbHVtZV9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGU6IG5vdmVsVGV4dC50cmltKHRyLnRleHQoKSksXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9saXN0OiBbXSxcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKHRyLmlzKCdkZCwgZHQ6aGFzKGEpJykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHRyLmZpbmQoJ2E6ZXEoMCknKVxuXHRcdFx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleClcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgYSA9IGRvbS4kKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgaHJlZiA9IGEucHJvcCgnaHJlZicpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgZGF0YSA9IHNlbGYucGFyc2VVcmwoaHJlZik7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmICghZGF0YS5jaGFwdGVyX2lkKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGhyZWYsIGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGhyZWYgPSBzZWxmLm1ha2VVcmwoZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0ZGF0YS51cmwgPSBocmVmO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl90aXRsZSA9IHRyaW0oYS50ZXh0KCkpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoIWNoYXB0ZXJfdGl0bGUpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGhyZWYpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQuY2hhcHRlcl9saXN0XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC5wdXNoKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLmNoYXB0ZXJfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmw6IGhyZWYsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmxfZGF0YTogZGF0YSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGF0ZTtcblxuXHRcdFx0XHRpZiAoX2NhY2hlX2RhdGVzLmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdF9jYWNoZV9kYXRlcy5zb3J0KCk7XG5cblx0XHRcdFx0XHRub3ZlbF9kYXRlID0gbW9tZW50LnVuaXgoX2NhY2hlX2RhdGVzW19jYWNoZV9kYXRlcy5sZW5ndGggLSAxXSkubG9jYWwoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiB7XG5cblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHQuLi5kYXRhX21ldGEsXG5cblx0XHRcdFx0XHR2b2x1bWVfbGlzdCxcblxuXHRcdFx0XHRcdC8vbm92ZWxfZGF0ZSxcblxuXHRcdFx0XHRcdGNoZWNrZGF0ZTogbW9tZW50KCkubG9jYWwoKSxcblxuXHRcdFx0XHRcdGltZ3M6IFtdIGFzIHN0cmluZ1tdLFxuXHRcdFx0XHR9IGFzIElOb3ZlbDtcblx0XHRcdH0pXG5cdFx0XHQudGFwKGZ1bmN0aW9uIChub3ZlbClcblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZS5kaXIobm92ZWwsIHtcblx0XHRcdFx0XHRjb2xvcnM6IHRydWUsXG5cdFx0XHRcdFx0Ly9kZXB0aDogMyxcblx0XHRcdFx0fSk7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9nZXRfbWV0YShpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlOiB7XG5cdFx0ZG9tOiBJSlNET00sXG5cdH0pXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdGxldCB1cmwgPSB0aGlzLm1ha2VVcmwodGhpcy5wYXJzZVVybChpbnB1dFVybCksIC0xKTtcblxuXHRcdC8vcmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShjYWNoZS5kb20pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cdFx0XHRcdGxldCBkYXRhOiBJTWRjb25mTWV0YSA9IHt9O1xuXHRcdFx0XHRkYXRhLm5vdmVsID0ge307XG5cblx0XHRcdFx0bGV0IG5vdmVsX2F1dGhvciA9IHRyaW0oJCgnLmJvb2tfaW5mbyBhW2hyZWYqPVwiL2F1dGhvci9cIl0nKS50ZXh0KCkpO1xuXG5cdFx0XHRcdCQoJy5qaWVzaGFvX2NvbnRlbnQgaDM6ZXEoMCknKS5odG1sKGZ1bmN0aW9uIChpLCBvbGQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gb2xkLnJlcGxhY2UoLyg8YnJcXC8/PikvaWcsICckMVxcbicpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYyA9ICQoJy5ib29rX2luZm8gLmludHJvJylcblx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0LnRyaW0oKVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0aWYgKCQoJy5ib29rX2luZm8uZmluaXNoJykubGVuZ3RoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZGF0YS5ub3ZlbC5zdGF0dXMgPSAn5bey5a6M57WQJztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBub3ZlbF90aXRsZSA9IHRyaW0oXG5cdFx0XHRcdFx0JCgnLmJvb2tfaW5mbyA+IGltZ1thbHRdJykuYXR0cignYWx0Jylcblx0XHRcdFx0KTtcblxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKHVybCk7XG5cblx0XHRcdFx0ZGF0YS5ub3ZlbC5jb3ZlciA9ICQoYC5ib29rX2luZm8gPiBpbWdgKS5wcm9wKCdzcmMnKTtcblxuXHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MgPSBbXTtcblxuXHRcdFx0XHRkYXRhLm5vdmVsLnRhZ3MucHVzaCgkKCcudGl0bGUgYTplcSgxKScpLnRleHQoKSk7XG5cblx0XHRcdFx0JCgnLnRhZyBkZCAuYnV0dG9uJylcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdGRhdGEubm92ZWwudGFncy5wdXNoKCQodGhpcykudGV4dCgpKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR1cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHQuLi5kYXRhLFxuXG5cdFx0XHRcdFx0bm92ZWxfdGl0bGUsXG5cblx0XHRcdFx0XHRub3ZlbF9hdXRob3IsXG5cdFx0XHRcdFx0bm92ZWxfZGVzYyxcblxuXHRcdFx0XHR9IGFzIElOb3ZlbDtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlSGV0dWJvb2s7XG4iXX0=