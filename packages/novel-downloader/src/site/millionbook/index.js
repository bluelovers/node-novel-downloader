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
const util_2 = require("./util");
let NovelSiteClass = /** @class */ (() => {
    let NovelSiteClass = class NovelSiteClass extends base_1.default {
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
                .replace(/^[ \uFEFF\xA0]+/gm, '')
                .replace(/^\n+/, '')
                .replace(/\s+$/, '');
        }
        _parseChapter(ret, optionsRuntime, cache) {
            if (!ret) {
                return '';
            }
            ret.dom.$('.tt2 center').remove();
            let body_selector = '.tt2';
            try {
                let html = util_1.minifyHTML(ret.dom.$(body_selector).html());
                //html = html.replace(/^(&nbsp;){4}/gm, '');
                html = html.replace(/^\s+|\s+$/g, '');
                ret.dom.$(body_selector).html(html);
            }
            catch (e) {
            }
            ret.dom.$(body_selector).html(function (i, old) {
                return old;
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
                // @ts-ignore
                $.fn.eachReverse = function (...argv) {
                    // @ts-ignore
                    return $($(this).get().reverse()).each(...argv);
                };
                let url_data = self.parseUrl(dom.url.href);
                let data_meta = await self._get_meta(url, optionsRuntime, {
                    dom,
                });
                let _cache_dates = [];
                let volume_list = [];
                let currentVolume;
                let novel_vip = 0;
                let table = $('body > center > table center:has(font[color="#FF0000"]) > center > table td');
                table
                    .each(function (index) {
                    // @ts-ignore
                    let tr = dom.$(this);
                    let title = novel_text_1.default.trim(util_1.trim(tr.text())).replace(/^◎/, '');
                    if (title && tr.find('a').length == 0) {
                        currentVolume = volume_list[volume_list.length] = {
                            volume_index: volume_list.length,
                            volume_title: title,
                            chapter_list: [],
                        };
                    }
                    else if (title && tr.has('a').length) {
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
                let novel_author = util_1.trim($('title').text().match(/\(([^()]+)\)\s*$/)[1]);
                let novel_title = util_1.trim($('body > center > table center font[color="#FF0000"]').text());
                let url_data = self.parseUrl(url);
                return Object.assign(Object.assign({ url,
                    url_data }, data), { novel_title,
                    novel_author });
            });
        }
    };
    NovelSiteClass.IDKEY = path.basename(__dirname);
    NovelSiteClass = __decorate([
        index_1.staticImplements()
    ], NovelSiteClass);
    return NovelSiteClass;
})();
exports.NovelSiteClass = NovelSiteClass;
exports.default = NovelSiteClass;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgsdUNBQTJDO0FBQzNDLHFDQUFxRTtBQUNyRSxvQ0FBbUY7QUFJbkYsdUNBQXlDO0FBQ3pDLGtDQUFrQztBQUNsQyw2Q0FBK0Q7QUFFL0Qsb0NBQWtDO0FBQ2xDLDJDQUFtQztBQUNuQyw2QkFBNkI7QUFHN0IsaUNBQWtEO0FBR2xEO0lBQUEsSUFBYSxjQUFjLEdBQTNCLE1BQWEsY0FBZSxTQUFRLGNBQWE7UUFJaEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUF3QyxFQUFFLEdBQUcsSUFBSTtZQUU3RCxPQUFPLFlBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUE0QixFQUFFLElBQXVCLEVBQUUsR0FBRyxJQUFJO1lBRTVFLE9BQU8sY0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUN0QyxDQUFDO1FBRUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUEwQixFQUFFLEdBQUcsSUFBSTtZQUVsRCxPQUFPLGVBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRUQsT0FBTyxDQUFDLE1BQTRCLEVBQUUsSUFBdUIsRUFBRSxHQUFHLElBQUk7WUFFckUsT0FBTyxjQUFPLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO1FBQ3RDLENBQUM7UUFFRCxRQUFRLENBQUMsR0FBMEIsRUFBRSxHQUFHLElBQUk7WUFFM0MsT0FBTyxlQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVELGFBQWEsQ0FBSSxHQUFpQixFQUFFLGNBQW1DO1lBRXRFLElBQUksSUFBSSxH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QUFDLENBQUM7Z0JBRXhFLElBQUksV0FBVyxHQUFHLFdBQUksQ0FDckIsQ0FBQyxDQUFDLG9EQUFvRCxDQUFDLENBQUMsSUFBSSxFQUFFLENBQzlELENBQUM7Z0JBRUYsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFbEMscUNBQ0MsR0FBRztvQkFDSCxRQUFRLElBRUwsSUFBSSxLQUVQLFdBQVc7b0JBRVgsWUFBWSxJQUVYO1lBQ0gsQ0FBQyxDQUFDLENBQ0Q7UUFDSCxDQUFDO0tBQ0QsQ0FBQTtJQTVRdUIsb0JBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRjVDLGNBQWM7UUFEMUIsd0JBQWdCLEVBQStDO09BQ25ELGNBQWMsQ0E4UTFCO0lBQUQscUJBQUM7S0FBQTtBQTlRWSx3Q0FBYztBQWdSM0Isa0JBQWUsY0FBYyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzI1LzAyNS5cbiAqL1xuXG5pbXBvcnQgeyBzdHJpcENvbnRlbnQgfSBmcm9tICcuLi8uLi9zdHJpcCc7XG5pbXBvcnQgeyBhcnJheV91bmlxdWUsIGlzVW5kZWYsIG1pbmlmeUhUTUwsIHRyaW0gfSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCBfTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIFNZTUJPTF9DQUNIRSwgSU1kY29uZk1ldGEgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBJRG93bmxvYWRPcHRpb25zLCBJTm92ZWwgfSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IHsgSUZldGNoQ2hhcHRlciwgSU9wdGlvbnNSdW50aW1lIH0gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCAqIGFzIE5vdmVsU2l0ZURlbW8gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCBOb3ZlbFNpdGVCYXNlIGZyb20gJy4uL2RlbW8vYmFzZSc7XG4vL2ltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgU3RyVXRpbCBmcm9tICdzdHItdXRpbCc7XG5pbXBvcnQgeyB6aFJlZ0V4cCB9IGZyb20gJ3JlZ2V4cC1jamsnO1xuaW1wb3J0IHsgcGFyc2VVcmwsIG1ha2VVcmwsIGNoZWNrIH0gZnJvbSAnLi91dGlsJztcblxuQHN0YXRpY0ltcGxlbWVudHM8X05vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZUNsYXNzPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZUNsYXNzIGV4dGVuZHMgTm92ZWxTaXRlQmFzZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gcGF0aC5iYXNlbmFtZShfX2Rpcm5hbWUpO1xuXG5cdHN0YXRpYyBjaGVjayh1cmw6IHN0cmluZyB8IFVSTCB8IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsLCAuLi5hcmd2KTogYm9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIGNoZWNrKHVybCwgLi4uYXJndik7XG5cdH1cblxuXHRzdGF0aWMgbWFrZVVybCh1cmxvYmo6IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sPzogYm9vbGVhbiB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBtYWtlVXJsKHVybG9iaiwgYm9vbCwgLi4uYXJndilcblx0fVxuXG5cdHN0YXRpYyBwYXJzZVVybCh1cmw6IHN0cmluZyB8IFVSTCB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBwYXJzZVVybCh1cmwsIC4uLmFyZ3YpO1xuXHR9XG5cblx0bWFrZVVybCh1cmxvYmo6IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sPzogYm9vbGVhbiB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBtYWtlVXJsKHVybG9iaiwgYm9vbCwgLi4uYXJndilcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogc3RyaW5nIHwgVVJMIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIHBhcnNlVXJsKHVybCwgLi4uYXJndik7XG5cdH1cblxuXHRjcmVhdGVNYWluVXJsPFQ+KHVybDogc3RyaW5nIHwgVVJMLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSlcblx0e1xuXHRcdGxldCBkYXRhID0gdGhpcy5wYXJzZVVybCh1cmwpO1xuXG5cdFx0aWYgKCFkYXRhIHx8ICFkYXRhLm5vdmVsX2lkKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHR9XG5cblx0XHRsZXQgcmV0ID0gdGhpcy5tYWtlVXJsKGRhdGEsIHRydWUsIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRfc3RyaXBDb250ZW50KHRleHQ6IHN0cmluZylcblx0e1xuXHRcdHRleHQgPSBzdHJpcENvbnRlbnQodGV4dCk7XG5cblx0XHQvL3Byb2Nlc3MuZXhpdCgpO1xuXG5cdFx0cmV0dXJuIHRleHRcblx0XHRcdC5yZXBsYWNlKC9e44CA44CAL2dtLCAnJylcblx0XHRcdC5yZXBsYWNlKC9eWyBcXHVGRUZGXFx4QTBdKy9nbSwgJycpXG5cdFx0XHQucmVwbGFjZSgvXlxcbisvLCAnJylcblx0XHRcdC5yZXBsYWNlKC9cXHMrJC8sICcnKVxuXHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldDogSUZldGNoQ2hhcHRlciwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlKTogc3RyaW5nXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0cmV0LmRvbS4kKCcudHQyIGNlbnRlcicpLnJlbW92ZSgpO1xuXG5cdFx0bGV0IGJvZHlfc2VsZWN0b3IgPSAnLnR0Mic7XG5cblx0XHR0cnlcblx0XHR7XG5cdFx0XHRsZXQgaHRtbCA9IG1pbmlmeUhUTUwocmV0LmRvbS4kKGJvZHlfc2VsZWN0b3IpLmh0bWwoKSk7XG5cblx0XHRcdC8vaHRtbCA9IGh0bWwucmVwbGFjZSgvXigmbmJzcDspezR9L2dtLCAnJyk7XG5cdFx0XHRodG1sID0gaHRtbC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG5cblx0XHRcdHJldC5kb20uJChib2R5X3NlbGVjdG9yKS5odG1sKGh0bWwpO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cblx0XHR9XG5cblx0XHRyZXQuZG9tLiQoYm9keV9zZWxlY3RvcikuaHRtbChmdW5jdGlvbiAoaSwgb2xkKVxuXHRcdHtcblx0XHRcdHJldHVybiBvbGRcblx0XHRcdFx0Ly8ucmVwbGFjZSgvKDxiclxcLz8+KS9pZywgJyQxXFxuJylcblx0XHRcdFx0Ly8ucmVwbGFjZSgvKDxwPikvaWcsICdcXG4kMScpXG5cdFx0XHRcdDtcblx0XHR9KTtcblxuXHRcdGxldCB0ZXh0ID0gcmV0LmRvbS4kKGJvZHlfc2VsZWN0b3IpLnRleHQoKTtcblxuXHRcdHRleHQgPSB0aGlzLl9zdHJpcENvbnRlbnQodGV4dCk7XG5cblx0XHRyZXR1cm4gdGV4dDtcblx0fVxuXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUID0gSU9wdGlvbnNSdW50aW1lPihpbnB1dFVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9XG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0bGV0IHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybChpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdCQuZm4uZWFjaFJldmVyc2UgPSBmdW5jdGlvbiAoLi4uYXJndilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRyZXR1cm4gJCgkKHRoaXMpLmdldCgpLnJldmVyc2UoKSkuZWFjaCguLi5hcmd2KTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKGRvbS51cmwuaHJlZik7XG5cblx0XHRcdFx0bGV0IGRhdGFfbWV0YSA9IGF3YWl0IHNlbGYuX2dldF9tZXRhKHVybCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRkb20sXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGxldCBfY2FjaGVfZGF0ZXMgPSBbXTtcblx0XHRcdFx0bGV0IHZvbHVtZV9saXN0ID0gW10gYXMgX05vdmVsU2l0ZS5JVm9sdW1lW107XG5cblx0XHRcdFx0bGV0IGN1cnJlbnRWb2x1bWU6IF9Ob3ZlbFNpdGUuSVZvbHVtZTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfdmlwID0gMDtcblxuXHRcdFx0XHRsZXQgdGFibGUgPSAkKCdib2R5ID4gY2VudGVyID4gdGFibGUgY2VudGVyOmhhcyhmb250W2NvbG9yPVwiI0ZGMDAwMFwiXSkgPiBjZW50ZXIgPiB0YWJsZSB0ZCcpO1xuXHRcdFx0XHR0YWJsZVxuXHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRsZXQgdHIgPSBkb20uJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0bGV0IHRpdGxlID0gbm92ZWxUZXh0LnRyaW0odHJpbSh0ci50ZXh0KCkpKS5yZXBsYWNlKC9e4peOLywgJycpO1xuXG5cdFx0XHRcdFx0XHRpZiAodGl0bGUgJiYgdHIuZmluZCgnYScpLmxlbmd0aCA9PSAwKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IHZvbHVtZV9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGU6IHRpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogW10sXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIGlmICh0aXRsZSAmJiB0ci5oYXMoJ2EnKS5sZW5ndGgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHRyLmZpbmQoJ2E6ZXEoMCknKVxuXHRcdFx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleClcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgYSA9IGRvbS4kKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgaHJlZiA9IGEucHJvcCgnaHJlZicpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgZGF0YSA9IHNlbGYucGFyc2VVcmwoaHJlZik7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmICghZGF0YS5jaGFwdGVyX2lkKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGhyZWYsIGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGhyZWYgPSBzZWxmLm1ha2VVcmwoZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0ZGF0YS51cmwgPSBocmVmO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl90aXRsZSA9IHRyaW0oYS50ZXh0KCkpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoIWNoYXB0ZXJfdGl0bGUpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGhyZWYpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQuY2hhcHRlcl9saXN0XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC5wdXNoKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLmNoYXB0ZXJfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmw6IGhyZWYsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmxfZGF0YTogZGF0YSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGF0ZTtcblxuXHRcdFx0XHRpZiAoX2NhY2hlX2RhdGVzLmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdF9jYWNoZV9kYXRlcy5zb3J0KCk7XG5cblx0XHRcdFx0XHRub3ZlbF9kYXRlID0gbW9tZW50LnVuaXgoX2NhY2hlX2RhdGVzW19jYWNoZV9kYXRlcy5sZW5ndGggLSAxXSkubG9jYWwoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiB7XG5cblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHQuLi5kYXRhX21ldGEsXG5cblx0XHRcdFx0XHR2b2x1bWVfbGlzdCxcblxuXHRcdFx0XHRcdC8vbm92ZWxfZGF0ZSxcblxuXHRcdFx0XHRcdGNoZWNrZGF0ZTogbW9tZW50KCkubG9jYWwoKSxcblxuXHRcdFx0XHRcdGltZ3M6IFtdIGFzIHN0cmluZ1tdLFxuXHRcdFx0XHR9IGFzIElOb3ZlbDtcblx0XHRcdH0pXG5cdFx0XHQudGFwKGZ1bmN0aW9uIChub3ZlbClcblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZS5kaXIobm92ZWwsIHtcblx0XHRcdFx0XHRjb2xvcnM6IHRydWUsXG5cdFx0XHRcdFx0Ly9kZXB0aDogMyxcblx0XHRcdFx0fSk7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9nZXRfbWV0YShpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlOiB7XG5cdFx0ZG9tOiBJSlNET00sXG5cdH0pXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdGxldCB1cmwgPSB0aGlzLm1ha2VVcmwodGhpcy5wYXJzZVVybChpbnB1dFVybCksIC0xKTtcblxuXHRcdC8vcmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShjYWNoZS5kb20pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cdFx0XHRcdGxldCBkYXRhOiBJTWRjb25mTWV0YSA9IHt9O1xuXHRcdFx0XHRkYXRhLm5vdmVsID0ge307XG5cblx0XHRcdFx0bGV0IG5vdmVsX2F1dGhvciA9IHRyaW0oJCgndGl0bGUnKS50ZXh0KCkubWF0Y2goL1xcKChbXigpXSspXFwpXFxzKiQvKVsxXSk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gdHJpbShcblx0XHRcdFx0XHQkKCdib2R5ID4gY2VudGVyID4gdGFibGUgY2VudGVyIGZvbnRbY29sb3I9XCIjRkYwMDAwXCJdJykudGV4dCgpXG5cdFx0XHRcdCk7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybCh1cmwpO1xuXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0Li4uZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxuXG5cdFx0XHRcdFx0bm92ZWxfYXV0aG9yLFxuXG5cdFx0XHRcdH07XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZUNsYXNzO1xuIl19