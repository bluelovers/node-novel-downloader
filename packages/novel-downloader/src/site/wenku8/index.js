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
const const_1 = require("node-novel-info/lib/const");
let NovelSiteWenku8 = class NovelSiteWenku8 extends base_1.default {
    makeUrl(urlobj, bool) {
        let url;
        if (bool < 0) {
            url = `http://www.wenku8.com/book/${urlobj.novel_id}.htm`;
        }
        else {
            let cid = (!bool && urlobj.chapter_id) ? '&cid=' + urlobj.chapter_id : '';
            url = `http://www.wenku8.com/modules/article/reader.php?aid=${urlobj.novel_id}${cid}`;
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
        };
        // @ts-ignore
        urlobj.url = new jsdom_url_1.URL(url);
        // @ts-ignore
        url = urlobj.url.href;
        let r;
        let m;
        r = /modules\/article\/articleinfo\.php\?id=(\d+)/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        r = /modules\/article\/reader\.php\?aid=(\d+)(?:&cid=(\d+))?/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            urlobj.chapter_id = m[2];
            return urlobj;
        }
        r = /book\/(\d+)\.htm/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        r = /novel\/([\d]+)\/([\d]+)\/(?:([\d]+)\.html?)?/;
        if (m = r.exec(url)) {
            urlobj.novel_pid = m[1];
            urlobj.novel_id = m[2];
            urlobj.chapter_id = m[3];
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
        {
            let c = ret.dom.$('#content');
            c.find('#contentdp').remove();
            c.find('#contentdp').remove();
            c.find('#contentdp').remove();
        }
        try {
            let html = util_1.minifyHTML(ret.dom.$('#content').html());
            html = html.replace(/^(&nbsp;){4}/gm, '');
            ret.dom.$('#content').html(html);
        }
        catch (e) {
        }
        ret.dom.$('#content img[src]').each(function () {
            let src = ret.dom.$(this).prop('src').trim();
            if (src) {
                cache.chapter.imgs = cache.chapter.imgs || [];
                cache.chapter.imgs.push(src);
                cache.novel.imgs.push(src);
            }
        });
        //console.log(ret.dom.serialize());
        return ret.dom.$('#content').text();
    }
    async get_volume_list(inputUrl, optionsRuntime = {}) {
        const self = this;
        let url = await this.createMainUrl(inputUrl);
        return await jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            let url_data = self.parseUrl(dom.url.href);
            let data_meta = await self._get_meta(url, optionsRuntime, {
                dom,
            });
            let _cache_dates = [];
            let volume_list = [];
            let currentVolume;
            let table = $('body > #info').siblings('table').eq(0);
            table
                .find('td.vcss, td.ccss')
                .each(function (index) {
                let tr = dom.$(this);
                if (tr.is('.vcss')) {
                    currentVolume = volume_list[volume_list.length] = {
                        volume_index: volume_list.length,
                        volume_title: util_1.trim(tr.text()),
                        chapter_list: [],
                    };
                }
                else if (tr.is('.ccss')) {
                    let a = tr.find('a').eq(0);
                    if (!a.length) {
                        return;
                    }
                    let href = a.prop('href');
                    let data = self.parseUrl(href);
                    if (!data.chapter_id) {
                        throw new Error();
                    }
                    else {
                        href = self.makeUrl(data);
                        data.url = href;
                    }
                    let chapter_title = util_1.trim(a.text());
                    currentVolume
                        .chapter_list
                        .push({
                        chapter_index: currentVolume.chapter_list.length,
                        chapter_title,
                        chapter_id: data.chapter_id,
                        chapter_url: href,
                        chapter_url_data: data,
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
            console.log(novel);
        });
    }
    async _get_meta(inputUrl, optionsRuntime, cache) {
        const self = this;
        let url = this.makeUrl(this.parseUrl(inputUrl), -1);
        return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(function (dom) {
            const $ = dom.$;
            let data = {};
            data.novel = {};
            let novel_title = cache.dom.$('body > #title').text().trim();
            let novel_author = cache.dom.$('#info')
                .text()
                .replace(/^.+：/g, '')
                .trim();
            let _content = dom.$('#content > div > table:eq(1)');
            let novel_cover = _content.find('img:eq(0)').prop('src');
            let novel_desc = novel_text_1.default.trim(_content.find('.hottext + br + span:eq(-1)').text() || '', {
                trim: true,
            });
            let novel_status;
            let novel_date;
            let novel_publisher;
            dom.$('#content > div > table:eq(0) tr:eq(-1) > td').each(function (i, elem) {
                let t = util_1.trim(dom.$(elem).text());
                if (t.match(/(?:状态|狀態)：\s*(.+)/)) {
                    novel_status = util_1.trim(RegExp.$1);
                }
                else if (t.match(/(?:更新)：\s*(.+)/)) {
                    novel_date = util_1.trim(RegExp.$1);
                    novel_date = index_2.moment(novel_date).local();
                }
                else if (t.match(/(?:文库分类)：\s*(.+)/)) {
                    novel_publisher = util_1.trim(RegExp.$1);
                }
            });
            let url_data = self.parseUrl(url);
            return Object.assign({ url,
                url_data }, data, { novel_title,
                novel_cover,
                novel_author,
                novel_desc,
                novel_date,
                novel_status,
                novel_publisher });
        });
    }
    _handleDataForStringify(...argv) {
        let mdconf = super._handleDataForStringify(...argv);
        if (mdconf.novel) {
            mdconf.novel.novel_status = (mdconf.novel.novel_status | 0) | const_1.EnumNovelStatus.P_BOOK;
        }
        return mdconf;
    }
};
NovelSiteWenku8.IDKEY = 'wenku8';
NovelSiteWenku8 = __decorate([
    index_1.staticImplements()
], NovelSiteWenku8);
exports.NovelSiteWenku8 = NovelSiteWenku8;
exports.default = NovelSiteWenku8;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQXVEO0FBQ3ZELG9DQUFtRjtBQUluRix1Q0FBeUM7QUFDekMseUNBQWdDO0FBQ2hDLDZDQUErRDtBQUUvRCxvQ0FBa0M7QUFDbEMsMkNBQW1DO0FBQ25DLHFEQUE0RDtBQUc1RCxJQUFhLGVBQWUsR0FBNUIsTUFBYSxlQUFnQixTQUFRLGNBQWE7SUFJakQsT0FBTyxDQUFDLE1BQTRCLEVBQUUsSUFBdUI7UUFFNUQsSUFBSSxHQUFXLENBQUM7UUFFaEIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUNaO1lBQ0MsR0FBRyxHQUFHLDhCQUE4QixNQUFNLENBQUMsUUFBUSxNQUFNLENBQUM7U0FDMUQ7YUFFRDtZQUNDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBRTFFLEdBQUcsR0FBRyx3REFBd0QsTUFBTSxDQUFDLFFBQVEsR0FBRyxHQUFHLEVBQUUsQ0FBQztTQUN0RjtRQUVELGFBQWE7UUFDYixPQUFPLElBQUksZUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxRQUFRLENBQUMsR0FBaUIsRUFBRSxPQUFRO1FBRW5DLElBQUksTUFBTSxHQUFHO1lBQ1osR0FBRyxFQUFFLEdBQUc7WUFFUixTQUFTLEVBQUUsSUFBSTtZQUNmLFFBQVEsRUFBRSxJQUFJO1lBQ2QsVUFBVSxFQUFFLElBQUk7U0FDaEIsQ0FBQztRQUVGLGFBQWE7UUFDYixNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksZUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLGFBQWE7UUFDYixHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcs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WSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLEdBQUcsdUJBQWUsQ0FBQyxNQUFNLENBQUM7U0FFckY7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7Q0FFRCxDQUFBO0FBL1V1QixxQkFBSyxHQUFHLFFBQVEsQ0FBQztBQUY1QixlQUFlO0lBRDNCLHdCQUFnQixFQUFnRDtHQUNwRCxlQUFlLENBaVYzQjtBQWpWWSwwQ0FBZTtBQW1WNUIsa0JBQWUsZUFBZSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzI1LzAyNS5cbiAqL1xuXG5pbXBvcnQgeyBpc1VuZGVmLCBtaW5pZnlIVE1MLCB0cmltIH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgX05vdmVsU2l0ZSwgeyBJTWRjb25mTWV0YSwgc3RhdGljSW1wbGVtZW50cywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgSURvd25sb2FkT3B0aW9ucywgSU5vdmVsIH0gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCB7IElGZXRjaENoYXB0ZXIsIElPcHRpb25zUnVudGltZSB9IGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgTm92ZWxTaXRlRGVtbyBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IE5vdmVsU2l0ZUJhc2UgZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xuaW1wb3J0IHsgRW51bU5vdmVsU3RhdHVzIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvL2xpYi9jb25zdCc7XG5cbkBzdGF0aWNJbXBsZW1lbnRzPF9Ob3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVXZW5rdTg+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlV2Vua3U4IGV4dGVuZHMgTm92ZWxTaXRlQmFzZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gJ3dlbmt1OCc7XG5cblx0bWFrZVVybCh1cmxvYmo6IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sPzogYm9vbGVhbiB8IG51bWJlcik6IFVSTFxuXHR7XG5cdFx0bGV0IHVybDogc3RyaW5nO1xuXG5cdFx0aWYgKGJvb2wgPCAwKVxuXHRcdHtcblx0XHRcdHVybCA9IGBodHRwOi8vd3d3Lndlbmt1OC5jb20vYm9vay8ke3VybG9iai5ub3ZlbF9pZH0uaHRtYDtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGxldCBjaWQgPSAoIWJvb2wgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpID8gJyZjaWQ9JyArIHVybG9iai5jaGFwdGVyX2lkIDogJyc7XG5cblx0XHRcdHVybCA9IGBodHRwOi8vd3d3Lndlbmt1OC5jb20vbW9kdWxlcy9hcnRpY2xlL3JlYWRlci5waHA/YWlkPSR7dXJsb2JqLm5vdmVsX2lkfSR7Y2lkfWA7XG5cdFx0fVxuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBuZXcgVVJMKHVybCk7XG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IFVSTCB8IHN0cmluZywgb3B0aW9ucz8pOiBfTm92ZWxTaXRlLklQYXJzZVVybFxuXHR7XG5cdFx0bGV0IHVybG9iaiA9IHtcblx0XHRcdHVybDogdXJsLFxuXG5cdFx0XHRub3ZlbF9waWQ6IG51bGwsXG5cdFx0XHRub3ZlbF9pZDogbnVsbCxcblx0XHRcdGNoYXB0ZXJfaWQ6IG51bGwsXG5cdFx0fTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHR1cmxvYmoudXJsID0gbmV3IFVSTCh1cmwpO1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHR1cmwgPSB1cmxvYmoudXJsLmhyZWYgYXMgc3RyaW5nO1xuXG5cdFx0bGV0IHI6IFJlZ0V4cDtcblx0XHRsZXQgbTogUmVnRXhwRXhlY0FycmF5O1xuXG5cdFx0ciA9IC9tb2R1bGVzXFwvYXJ0aWNsZVxcL2FydGljbGVpbmZvXFwucGhwXFw/aWQ9KFxcZCspLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0ciA9IC9tb2R1bGVzXFwvYXJ0aWNsZVxcL3JlYWRlclxcLnBocFxcP2FpZD0oXFxkKykoPzomY2lkPShcXGQrKSk/Lztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHR1cmxvYmouY2hhcHRlcl9pZCA9IG1bMl07XG5cblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0ciA9IC9ib29rXFwvKFxcZCspXFwuaHRtLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0ciA9IC9ub3ZlbFxcLyhbXFxkXSspXFwvKFtcXGRdKylcXC8oPzooW1xcZF0rKVxcLmh0bWw/KT8vO1xuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX3BpZCA9IG1bMV07XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzJdO1xuXHRcdFx0dXJsb2JqLmNoYXB0ZXJfaWQgPSBtWzNdO1xuXHRcdH1cblxuXHRcdHJldHVybiB1cmxvYmo7XG5cdH1cblxuXHRjcmVhdGVNYWluVXJsKHVybClcblx0e1xuXHRcdGxldCBkYXRhID0gdGhpcy5wYXJzZVVybCh1cmwpO1xuXG5cdFx0aWYgKCFkYXRhIHx8ICFkYXRhLm5vdmVsX2lkKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHR9XG5cblx0XHRsZXQgcmV0ID0gdGhpcy5tYWtlVXJsKGRhdGEsIHRydWUpO1xuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldDogSUZldGNoQ2hhcHRlciwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlKTogc3RyaW5nXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0e1xuXHRcdFx0bGV0IGMgPSByZXQuZG9tLiQoJyNjb250ZW50Jyk7XG5cblx0XHRcdGMuZmluZCgnI2NvbnRlbnRkcCcpLnJlbW92ZSgpO1xuXHRcdFx0Yy5maW5kKCcjY29udGVudGRwJykucmVtb3ZlKCk7XG5cdFx0XHRjLmZpbmQoJyNjb250ZW50ZHAnKS5yZW1vdmUoKTtcblx0XHR9XG5cblx0XHR0cnlcblx0XHR7XG5cdFx0XHRsZXQgaHRtbCA9IG1pbmlmeUhUTUwocmV0LmRvbS4kKCcjY29udGVudCcpLmh0bWwoKSk7XG5cblx0XHRcdGh0bWwgPSBodG1sLnJlcGxhY2UoL14oJm5ic3A7KXs0fS9nbSwgJycpO1xuXG5cdFx0XHRyZXQuZG9tLiQoJyNjb250ZW50JykuaHRtbChodG1sKTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXG5cdFx0fVxuXG5cdFx0cmV0LmRvbS4kKCcjY29udGVudCBpbWdbc3JjXScpLmVhY2goZnVuY3Rpb24gKClcblx0XHR7XG5cdFx0XHRsZXQgc3JjID0gcmV0LmRvbS4kKHRoaXMpLnByb3AoJ3NyYycpLnRyaW0oKTtcblxuXHRcdFx0aWYgKHNyYylcblx0XHRcdHtcblx0XHRcdFx0Y2FjaGUuY2hhcHRlci5pbWdzID0gY2FjaGUuY2hhcHRlci5pbWdzIHx8IFtdO1xuXG5cdFx0XHRcdGNhY2hlLmNoYXB0ZXIuaW1ncy5wdXNoKHNyYyk7XG5cdFx0XHRcdGNhY2hlLm5vdmVsLmltZ3MucHVzaChzcmMpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhyZXQuZG9tLnNlcmlhbGl6ZSgpKTtcblxuXHRcdHJldHVybiByZXQuZG9tLiQoJyNjb250ZW50JykudGV4dCgpO1xuXHR9XG5cblx0YXN5bmMgZ2V0X3ZvbHVtZV9saXN0PFQgPSBJT3B0aW9uc1J1bnRpbWU+KGlucHV0VXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge31cblx0KTogUHJvbWlzZTxJTm92ZWw+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRsZXQgdXJsID0gYXdhaXQgdGhpcy5jcmVhdGVNYWluVXJsKGlucHV0VXJsKTtcblxuXHRcdHJldHVybiBhd2FpdCBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybChkb20udXJsLmhyZWYpO1xuXG5cdFx0XHRcdGxldCBkYXRhX21ldGEgPSBhd2FpdCBzZWxmLl9nZXRfbWV0YSh1cmwsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0ZG9tLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlX2RhdGVzID0gW107XG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIF9Ob3ZlbFNpdGUuSVZvbHVtZVtdO1xuXG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBfTm92ZWxTaXRlLklWb2x1bWU7XG5cblx0XHRcdFx0bGV0IHRhYmxlID0gJCgnYm9keSA+ICNpbmZvJykuc2libGluZ3MoJ3RhYmxlJykuZXEoMCk7XG5cdFx0XHRcdHRhYmxlXG5cdFx0XHRcdFx0LmZpbmQoJ3RkLnZjc3MsIHRkLmNjc3MnKVxuXHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgdHIgPSBkb20uJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0aWYgKHRyLmlzKCcudmNzcycpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IHZvbHVtZV9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGU6IHRyaW0odHIudGV4dCgpKSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAodHIuaXMoJy5jY3NzJykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCBhID0gdHIuZmluZCgnYScpLmVxKDApO1xuXG5cdFx0XHRcdFx0XHRcdGlmICghYS5sZW5ndGgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgaHJlZiA9IGEucHJvcCgnaHJlZicpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBkYXRhID0gc2VsZi5wYXJzZVVybChocmVmKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIWRhdGEuY2hhcHRlcl9pZClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aHJlZiA9IHNlbGYubWFrZVVybChkYXRhKTtcblxuXHRcdFx0XHRcdFx0XHRcdGRhdGEudXJsID0gaHJlZjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3RpdGxlID0gdHJpbShhLnRleHQoKSk7XG5cblx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZVxuXHRcdFx0XHRcdFx0XHRcdC5jaGFwdGVyX2xpc3Rcblx0XHRcdFx0XHRcdFx0XHQucHVzaCh7XG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLmNoYXB0ZXJfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmw6IGhyZWYsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhOiBkYXRhLFxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGU7XG5cblx0XHRcdFx0aWYgKF9jYWNoZV9kYXRlcy5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRfY2FjaGVfZGF0ZXMuc29ydCgpO1xuXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSA9IG1vbWVudC51bml4KF9jYWNoZV9kYXRlc1tfY2FjaGVfZGF0ZXMubGVuZ3RoIC0gMV0pLmxvY2FsKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4ge1xuXG5cdFx0XHRcdFx0dXJsOiBkb20udXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0Li4uZGF0YV9tZXRhLFxuXG5cdFx0XHRcdFx0dm9sdW1lX2xpc3QsXG5cblx0XHRcdFx0XHQvL25vdmVsX2RhdGUsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0LnRhcChmdW5jdGlvbiAobm92ZWwpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUubG9nKG5vdmVsKTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX2dldF9tZXRhKGlucHV0VXJsLCBvcHRpb25zUnVudGltZSwgY2FjaGU6IHtcblx0XHRkb206IElKU0RPTSxcblx0fSlcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGxldCB1cmwgPSB0aGlzLm1ha2VVcmwodGhpcy5wYXJzZVVybChpbnB1dFVybCksIC0xKTtcblxuXHRcdHJldHVybiBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKGRvbSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXHRcdFx0XHRsZXQgZGF0YTogSU1kY29uZk1ldGEgPSB7fTtcblx0XHRcdFx0ZGF0YS5ub3ZlbCA9IHt9O1xuXG5cdFx0XHRcdGxldCBub3ZlbF90aXRsZSA9IGNhY2hlLmRvbS4kKCdib2R5ID4gI3RpdGxlJykudGV4dCgpLnRyaW0oKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yID0gY2FjaGUuZG9tLiQoJyNpbmZvJylcblx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL14uK++8mi9nLCAnJylcblx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgX2NvbnRlbnQgPSBkb20uJCgnI2NvbnRlbnQgPiBkaXYgPiB0YWJsZTplcSgxKScpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9jb3ZlciA9IF9jb250ZW50LmZpbmQoJ2ltZzplcSgwKScpLnByb3AoJ3NyYycpO1xuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYyA9IG5vdmVsVGV4dC50cmltKF9jb250ZW50LmZpbmQoJy5ob3R0ZXh0ICsgYnIgKyBzcGFuOmVxKC0xKScpLnRleHQoKSB8fCAnJywge1xuXHRcdFx0XHRcdHRyaW06IHRydWUsXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9zdGF0dXM7XG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlO1xuXHRcdFx0XHRsZXQgbm92ZWxfcHVibGlzaGVyO1xuXG5cdFx0XHRcdGRvbS4kKCcjY29udGVudCA+IGRpdiA+IHRhYmxlOmVxKDApIHRyOmVxKC0xKSA+IHRkJykuZWFjaChmdW5jdGlvbiAoaSwgZWxlbSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB0ID0gdHJpbShkb20uJChlbGVtKS50ZXh0KCkpO1xuXG5cdFx0XHRcdFx0aWYgKHQubWF0Y2goLyg/OueKtuaAgXzni4DmhYsp77yaXFxzKiguKykvKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRub3ZlbF9zdGF0dXMgPSB0cmltKFJlZ0V4cC4kMSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKHQubWF0Y2goLyg/OuabtOaWsCnvvJpcXHMqKC4rKS8pKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdG5vdmVsX2RhdGUgPSB0cmltKFJlZ0V4cC4kMSk7XG5cblx0XHRcdFx0XHRcdG5vdmVsX2RhdGUgPSBtb21lbnQobm92ZWxfZGF0ZSkubG9jYWwoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAodC5tYXRjaCgvKD865paH5bqT5YiG57G7Ke+8mlxccyooLispLykpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bm92ZWxfcHVibGlzaGVyID0gdHJpbShSZWdFeHAuJDEpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKHVybCk7XG5cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR1cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHQuLi5kYXRhLFxuXG5cdFx0XHRcdFx0bm92ZWxfdGl0bGUsXG5cdFx0XHRcdFx0bm92ZWxfY292ZXIsXG5cdFx0XHRcdFx0bm92ZWxfYXV0aG9yLFxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cblx0XHRcdFx0XHRub3ZlbF9kYXRlLFxuXHRcdFx0XHRcdG5vdmVsX3N0YXR1cyxcblx0XHRcdFx0XHRub3ZlbF9wdWJsaXNoZXIsXG5cdFx0XHRcdH07XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9oYW5kbGVEYXRhRm9yU3RyaW5naWZ5KC4uLmFyZ3YpOiBJTWRjb25mTWV0YVxuXHR7XG5cdFx0bGV0IG1kY29uZiA9IHN1cGVyLl9oYW5kbGVEYXRhRm9yU3RyaW5naWZ5KC4uLmFyZ3YpO1xuXG5cdFx0aWYgKG1kY29uZi5ub3ZlbClcblx0XHR7XG5cdFx0XHRtZGNvbmYubm92ZWwubm92ZWxfc3RhdHVzID0gKG1kY29uZi5ub3ZlbC5ub3ZlbF9zdGF0dXMgfCAwKSB8IEVudW1Ob3ZlbFN0YXR1cy5QX0JPT0s7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gbWRjb25mO1xuXHR9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlV2Vua3U4O1xuIl19