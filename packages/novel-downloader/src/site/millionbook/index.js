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
const jsdom_url_1 = require("jsdom-url");
const jsdom_extra_1 = require("jsdom-extra");
const index_2 = require("../index");
const novel_text_1 = require("novel-text");
const path = require("path");
let NovelSiteClass = class NovelSiteClass extends base_1.default {
    makeUrl(urlobj, bool) {
        let url;
        let cid = (!bool && urlobj.chapter_id) ? `${urlobj.chapter_id}.htm` : 'index.html';
        url = `http://www.millionbook.net/${urlobj.novel_pid}/${urlobj.novel_id}/${cid}`;
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
        let r = /www\.millionbook\.net\/([\w\/]+)\/(\w+)\/(?:(\d+)|index)\.html?/;
        let m = r.exec(url);
        if (m) {
            urlobj.novel_pid = m[1];
            urlobj.novel_id = m[2];
            urlobj.chapter_id = m[3];
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
        let url = await this.createMainUrl(inputUrl);
        return await jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            $.fn.eachReverse = function (...argv) {
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
            return Object.assign({ url: dom.url, url_data }, data_meta, { volume_list, 
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
            return Object.assign({ url,
                url_data }, data, { novel_title,
                novel_author });
        });
    }
};
NovelSiteClass.IDKEY = path.basename(__dirname);
NovelSiteClass = __decorate([
    index_1.staticImplements()
], NovelSiteClass);
exports.NovelSiteClass = NovelSiteClass;
exports.default = NovelSiteClass;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgsdUNBQTJDO0FBQzNDLHFDQUFxRTtBQUNyRSxvQ0FBbUY7QUFJbkYsdUNBQXlDO0FBQ3pDLHlDQUFnQztBQUNoQyw2Q0FBK0Q7QUFFL0Qsb0NBQWtDO0FBQ2xDLDJDQUFtQztBQUNuQyw2QkFBNkI7QUFLN0IsSUFBYSxjQUFjLEdBQTNCLE1BQWEsY0FBZSxTQUFRLGNBQWE7SUFJaEQsT0FBTyxDQUFDLE1BQTRCLEVBQUUsSUFBdUI7UUFFNUQsSUFBSSxHQUFXLENBQUM7UUFFaEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsTUFBTSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUM7UUFFbkYsR0FBRyxHQUFHLDhCQUE4QixNQUFNLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxRQUFRLElBQUksR0FBRyxFQUFFLENBQUM7UUFFakYsT0FBTyxJQUFJLGVBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBRUQsUUFBUSxDQUFDLEdBQWlCLEVBQUUsT0FBUTtRQUVuQyxJQUFJLE1BQU0sR0FBRztZQUNaLEdBQUcsRUFBRSxHQUFHO1lBRVIsU0FBUyxFQUFFLElBQUk7WUFDZixRQUFRLEVBQUUsSUFBSTtZQUNkLFVBQVUsRUFBRSxJQUFJO1lBRWhCLFdBQVcsRUFBRSxJQUFJO1NBQ2pCLENBQUM7UUFFRixNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksZUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztRQUV0QixJQUFJLENBQUMsR0FBRyxpRUFBaUUsQ0FBQztRQUUxRSxJQUFJLENBQUMsR0FBRyxD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LEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNoQixJQUFJLElBQUksR0FBZ0IsRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1lBRWhCLElBQUksWUFBWSxHQUFHLFdBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV4RSxJQUFJLFdBQVcsR0FBRyxXQUFJLENBQ3JCLENBQUMsQ0FBQyxvREFBb0QsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUM5RCxDQUFDO1lBRUYsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVsQyx1QkFDQyxHQUFHO2dCQUNILFFBQVEsSUFFTCxJQUFJLElBRVAsV0FBVztnQkFFWCxZQUFZLElBRVg7UUFDSCxDQUFDLENBQUMsQ0FDRDtJQUNILENBQUM7Q0FDRCxDQUFBO0FBelJ1QixvQkFBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7QUFGNUMsY0FBYztJQUQxQix3QkFBZ0IsRUFBK0M7R0FDbkQsY0FBYyxDQTJSMUI7QUEzUlksd0NBQWM7QUE2UjNCLGtCQUFlLGNBQWMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMy8yNS8wMjUuXG4gKi9cblxuaW1wb3J0IHsgc3RyaXBDb250ZW50IH0gZnJvbSAnLi4vLi4vc3RyaXAnO1xuaW1wb3J0IHsgYXJyYXlfdW5pcXVlLCBpc1VuZGVmLCBtaW5pZnlIVE1MLCB0cmltIH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgX05vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBTWU1CT0xfQ0FDSEUsIElNZGNvbmZNZXRhIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgSURvd25sb2FkT3B0aW9ucywgSU5vdmVsIH0gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCB7IElGZXRjaENoYXB0ZXIsIElPcHRpb25zUnVudGltZSB9IGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgKiBhcyBOb3ZlbFNpdGVEZW1vIGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgTm92ZWxTaXRlQmFzZSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkLCBibHVlYmlyZERlY29yYXRvciB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IG1vbWVudCB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgKiBhcyBTdHJVdGlsIGZyb20gJ3N0ci11dGlsJztcbmltcG9ydCB7IHpoUmVnRXhwIH0gZnJvbSAncmVnZXhwLWNqayc7XG5cbkBzdGF0aWNJbXBsZW1lbnRzPF9Ob3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVDbGFzcz4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVDbGFzcyBleHRlbmRzIE5vdmVsU2l0ZUJhc2Vcbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWSA9IHBhdGguYmFzZW5hbWUoX19kaXJuYW1lKTtcblxuXHRtYWtlVXJsKHVybG9iajogX05vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyKTogVVJMXG5cdHtcblx0XHRsZXQgdXJsOiBzdHJpbmc7XG5cblx0XHRsZXQgY2lkID0gKCFib29sICYmIHVybG9iai5jaGFwdGVyX2lkKSA/IGAke3VybG9iai5jaGFwdGVyX2lkfS5odG1gIDogJ2luZGV4Lmh0bWwnO1xuXG5cdFx0dXJsID0gYGh0dHA6Ly93d3cubWlsbGlvbmJvb2submV0LyR7dXJsb2JqLm5vdmVsX3BpZH0vJHt1cmxvYmoubm92ZWxfaWR9LyR7Y2lkfWA7XG5cblx0XHRyZXR1cm4gbmV3IFVSTCh1cmwpO1xuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBVUkwgfCBzdHJpbmcsIG9wdGlvbnM/KTogX05vdmVsU2l0ZS5JUGFyc2VVcmxcblx0e1xuXHRcdGxldCB1cmxvYmogPSB7XG5cdFx0XHR1cmw6IHVybCxcblxuXHRcdFx0bm92ZWxfcGlkOiBudWxsLFxuXHRcdFx0bm92ZWxfaWQ6IG51bGwsXG5cdFx0XHRjaGFwdGVyX2lkOiBudWxsLFxuXG5cdFx0XHRjaGFwdGVyX3ZpcDogbnVsbCxcblx0XHR9O1xuXG5cdFx0dXJsb2JqLnVybCA9IG5ldyBVUkwodXJsKTtcblx0XHR1cmwgPSB1cmxvYmoudXJsLmhyZWY7XG5cblx0XHRsZXQgciA9IC93d3dcXC5taWxsaW9uYm9va1xcLm5ldFxcLyhbXFx3XFwvXSspXFwvKFxcdyspXFwvKD86KFxcZCspfGluZGV4KVxcLmh0bWw/LztcblxuXHRcdGxldCBtID0gci5leGVjKHVybCk7XG5cblx0XHRpZiAobSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfcGlkID0gbVsxXTtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMl07XG5cdFx0XHR1cmxvYmouY2hhcHRlcl9pZCA9IG1bM107XG5cblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVybG9iajtcblx0fVxuXG5cdGNyZWF0ZU1haW5VcmwodXJsKVxuXHR7XG5cdFx0bGV0IGRhdGEgPSB0aGlzLnBhcnNlVXJsKHVybCk7XG5cblx0XHRpZiAoIWRhdGEgfHwgIWRhdGEubm92ZWxfaWQpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5sb2coZGF0YSk7XG5cblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcigpO1xuXHRcdH1cblxuXHRcdGxldCByZXQgPSB0aGlzLm1ha2VVcmwoZGF0YSwgdHJ1ZSk7XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0X3N0cmlwQ29udGVudCh0ZXh0OiBzdHJpbmcpXG5cdHtcblx0XHR0ZXh0ID0gc3RyaXBDb250ZW50KHRleHQpO1xuXG5cdFx0Ly9wcm9jZXNzLmV4aXQoKTtcblxuXHRcdHJldHVybiB0ZXh0XG5cdFx0XHQucmVwbGFjZSgvXuOAgOOAgC9nbSwgJycpXG5cdFx0XHQucmVwbGFjZSgvXlsgXFx1RkVGRlxceEEwXSsvZ20sICcnKVxuXHRcdFx0LnJlcGxhY2UoL15cXG4rLywgJycpXG5cdFx0XHQucmVwbGFjZSgvXFxzKyQvLCAnJylcblx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihyZXQ6IElGZXRjaENoYXB0ZXIsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZSk6IHN0cmluZ1xuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdHJldC5kb20uJCgnLnR0MiBjZW50ZXInKS5yZW1vdmUoKTtcblxuXHRcdGxldCBib2R5X3NlbGVjdG9yID0gJy50dDInO1xuXG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0bGV0IGh0bWwgPSBtaW5pZnlIVE1MKHJldC5kb20uJChib2R5X3NlbGVjdG9yKS5odG1sKCkpO1xuXG5cdFx0XHQvL2h0bWwgPSBodG1sLnJlcGxhY2UoL14oJm5ic3A7KXs0fS9nbSwgJycpO1xuXHRcdFx0aHRtbCA9IGh0bWwucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuXG5cdFx0XHRyZXQuZG9tLiQoYm9keV9zZWxlY3RvcikuaHRtbChodG1sKTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXG5cdFx0fVxuXG5cdFx0cmV0LmRvbS4kKGJvZHlfc2VsZWN0b3IpLmh0bWwoZnVuY3Rpb24gKGksIG9sZClcblx0XHR7XG5cdFx0XHRyZXR1cm4gb2xkXG5cdFx0XHRcdC8vLnJlcGxhY2UoLyg8YnJcXC8/PikvaWcsICckMVxcbicpXG5cdFx0XHRcdC8vLnJlcGxhY2UoLyg8cD4pL2lnLCAnXFxuJDEnKVxuXHRcdFx0XHQ7XG5cdFx0fSk7XG5cblx0XHRsZXQgdGV4dCA9IHJldC5kb20uJChib2R5X3NlbGVjdG9yKS50ZXh0KCk7XG5cblx0XHR0ZXh0ID0gdGhpcy5fc3RyaXBDb250ZW50KHRleHQpO1xuXG5cdFx0cmV0dXJuIHRleHQ7XG5cdH1cblxuXHRhc3luYyBnZXRfdm9sdW1lX2xpc3Q8VCA9IElPcHRpb25zUnVudGltZT4oaW5wdXRVcmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fVxuXHQpOiBQcm9taXNlPElOb3ZlbD5cblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGxldCB1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwoaW5wdXRVcmwpO1xuXG5cdFx0cmV0dXJuIGF3YWl0IGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHQkLmZuLmVhY2hSZXZlcnNlID0gZnVuY3Rpb24gKC4uLmFyZ3YpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gJCgkKHRoaXMpLmdldCgpLnJldmVyc2UoKSkuZWFjaCguLi5hcmd2KTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKGRvbS51cmwuaHJlZik7XG5cblx0XHRcdFx0bGV0IGRhdGFfbWV0YSA9IGF3YWl0IHNlbGYuX2dldF9tZXRhKHVybCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRkb20sXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGxldCBfY2FjaGVfZGF0ZXMgPSBbXTtcblx0XHRcdFx0bGV0IHZvbHVtZV9saXN0ID0gW10gYXMgX05vdmVsU2l0ZS5JVm9sdW1lW107XG5cblx0XHRcdFx0bGV0IGN1cnJlbnRWb2x1bWU6IF9Ob3ZlbFNpdGUuSVZvbHVtZTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfdmlwID0gMDtcblxuXHRcdFx0XHRsZXQgdGFibGUgPSAkKCdib2R5ID4gY2VudGVyID4gdGFibGUgY2VudGVyOmhhcyhmb250W2NvbG9yPVwiI0ZGMDAwMFwiXSkgPiBjZW50ZXIgPiB0YWJsZSB0ZCcpO1xuXHRcdFx0XHR0YWJsZVxuXHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgdHIgPSBkb20uJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0bGV0IHRpdGxlID0gbm92ZWxUZXh0LnRyaW0odHJpbSh0ci50ZXh0KCkpKS5yZXBsYWNlKC9e4peOLywgJycpO1xuXG5cdFx0XHRcdFx0XHRpZiAodGl0bGUgJiYgdHIuZmluZCgnYScpLmxlbmd0aCA9PSAwKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IHZvbHVtZV9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGU6IHRpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogW10sXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIGlmICh0aXRsZSAmJiB0ci5oYXMoJ2EnKS5sZW5ndGgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHRyLmZpbmQoJ2E6ZXEoMCknKVxuXHRcdFx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleClcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgYSA9IGRvbS4kKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgaHJlZiA9IGEucHJvcCgnaHJlZicpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgZGF0YSA9IHNlbGYucGFyc2VVcmwoaHJlZik7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmICghZGF0YS5jaGFwdGVyX2lkKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGhyZWYsIGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGhyZWYgPSBzZWxmLm1ha2VVcmwoZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0ZGF0YS51cmwgPSBocmVmO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl90aXRsZSA9IHRyaW0oYS50ZXh0KCkpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoIWNoYXB0ZXJfdGl0bGUpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGhyZWYpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhhKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQuY2hhcHRlcl9saXN0XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC5wdXNoKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLmNoYXB0ZXJfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmw6IGhyZWYsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmxfZGF0YTogZGF0YSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGF0ZTtcblxuXHRcdFx0XHRpZiAoX2NhY2hlX2RhdGVzLmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdF9jYWNoZV9kYXRlcy5zb3J0KCk7XG5cblx0XHRcdFx0XHRub3ZlbF9kYXRlID0gbW9tZW50LnVuaXgoX2NhY2hlX2RhdGVzW19jYWNoZV9kYXRlcy5sZW5ndGggLSAxXSkubG9jYWwoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiB7XG5cblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHQuLi5kYXRhX21ldGEsXG5cblx0XHRcdFx0XHR2b2x1bWVfbGlzdCxcblxuXHRcdFx0XHRcdC8vbm92ZWxfZGF0ZSxcblxuXHRcdFx0XHRcdGNoZWNrZGF0ZTogbW9tZW50KCkubG9jYWwoKSxcblxuXHRcdFx0XHRcdGltZ3M6IFtdIGFzIHN0cmluZ1tdLFxuXHRcdFx0XHR9IGFzIElOb3ZlbDtcblx0XHRcdH0pXG5cdFx0XHQudGFwKGZ1bmN0aW9uIChub3ZlbClcblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZS5kaXIobm92ZWwsIHtcblx0XHRcdFx0XHRjb2xvcnM6IHRydWUsXG5cdFx0XHRcdFx0Ly9kZXB0aDogMyxcblx0XHRcdFx0fSk7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9nZXRfbWV0YShpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlOiB7XG5cdFx0ZG9tOiBJSlNET00sXG5cdH0pXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdGxldCB1cmwgPSB0aGlzLm1ha2VVcmwodGhpcy5wYXJzZVVybChpbnB1dFVybCksIC0xKTtcblxuXHRcdC8vcmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShjYWNoZS5kb20pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cdFx0XHRcdGxldCBkYXRhOiBJTWRjb25mTWV0YSA9IHt9O1xuXHRcdFx0XHRkYXRhLm5vdmVsID0ge307XG5cblx0XHRcdFx0bGV0IG5vdmVsX2F1dGhvciA9IHRyaW0oJCgndGl0bGUnKS50ZXh0KCkubWF0Y2goL1xcKChbXigpXSspXFwpXFxzKiQvKVsxXSk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gdHJpbShcblx0XHRcdFx0XHQkKCdib2R5ID4gY2VudGVyID4gdGFibGUgY2VudGVyIGZvbnRbY29sb3I9XCIjRkYwMDAwXCJdJykudGV4dCgpXG5cdFx0XHRcdCk7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybCh1cmwpO1xuXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0dXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0Li4uZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxuXG5cdFx0XHRcdFx0bm92ZWxfYXV0aG9yLFxuXG5cdFx0XHRcdH07XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZUNsYXNzO1xuIl19