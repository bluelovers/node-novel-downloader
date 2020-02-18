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
const const_1 = require("node-novel-info/lib/const");
const html_1 = require("../../util/html");
const util_2 = require("./util");
let NovelSiteWenku8 = /** @class */ (() => {
    let NovelSiteWenku8 = class NovelSiteWenku8 extends base_1.default {
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
        async _parseChapter(ret, optionsRuntime, cache) {
            if (!ret) {
                return '';
            }
            const $ = ret.dom.$;
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
                // @ts-ignore
                let src = ret.dom.$(this).prop('src').trim();
                if (src) {
                    cache.chapter.imgs = cache.chapter.imgs || [];
                    cache.chapter.imgs.push(src);
                    cache.novel.imgs.push(src);
                }
            });
            if (optionsRuntime.keepImage) {
                await html_1._keepImageInContext(ret.dom.$('#content img[src]'), $, {
                    append: '\n',
                });
            }
            //console.log(ret.dom.serialize());
            return ret.dom.$('#content').text();
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
                let table = $('body > #info').siblings('table').eq(0);
                table
                    .find('td.vcss, td.ccss')
                    .each(function (index) {
                    // @ts-ignore
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
                return Object.assign(Object.assign({ url: dom.url, url_data }, data_meta), { volume_list, 
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
                return Object.assign(Object.assign({ url,
                    url_data }, data), { novel_title,
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
    return NovelSiteWenku8;
})();
exports.NovelSiteWenku8 = NovelSiteWenku8;
exports.default = NovelSiteWenku8;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQXVEO0FBQ3ZELG9DQUFtRjtBQUluRix1Q0FBeUM7QUFDekMsa0NBQWtDO0FBQ2xDLDZDQUErRDtBQUUvRCxvQ0FBa0M7QUFDbEMsMkNBQW1DO0FBQ25DLHFEQUE0RDtBQUM1RCwwQ0FBc0Q7QUFDdEQsaUNBQWtEO0FBR2xEO0lBQUEsSUFBYSxlQUFlLEdBQTVCLE1BQWEsZUFBZ0IsU0FBUSxjQUFhO1FBSWpELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBd0MsRUFBRSxHQUFHLElBQUk7WUFFN0QsT0FBTyxZQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBNEIsRUFBRSxJQUF1QixFQUFFLEdBQUcsSUFBSTtZQUU1RSxPQUFPLGNBQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDdEMsQ0FBQztRQUVELE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBMEIsRUFBRSxHQUFHLElBQUk7WUFFbEQsT0FBTyxlQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVELE9BQU8sQ0FBQyxNQUE0QixFQUFFLElBQXVCLEVBQUUsR0FBRyxJQUFJO1lBRXJFLE9BQU8sY0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUN0QyxDQUFDO1FBRUQsUUFBUSxDQUFDLEdBQTBCLEVBQUUsR0FBRyxJQUFJO1lBRTNDLE9BQU8sZUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFRCxhQUFhLENBQUksR0FBaUIsRUFBRSxjQUFtQztZQUV0RSxJQUFJLElBQUks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QztnQkFFbEMscUNBQ0MsR0FBRztvQkFDSCxRQUFRLElBRUwsSUFBSSxLQUVQLFdBQVc7b0JBQ1gsV0FBVztvQkFDWCxZQUFZO29CQUNaLFVBQVU7b0JBRVYsVUFBVTtvQkFDVixZQUFZO29CQUNaLGVBQWUsSUFDZDtZQUNILENBQUMsQ0FBQyxDQUNEO1FBQ0gsQ0FBQztRQUVTLHVCQUF1QixDQUFDLEdBQUcsSUFBSTtZQUV4QyxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsdUJBQXVCLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUVwRCxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQ2hCO2dCQUNDLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLEdBQUcsdUJBQWUsQ0FBQyxNQUFNLENBQUM7YUFFckY7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7S0FFRCxDQUFBO0lBMVN1QixxQkFBSyxHQUFHLFFBQVEsQ0FBQztJQUY1QixlQUFlO1FBRDNCLHdCQUFnQixFQUFnRDtPQUNwRCxlQUFlLENBNFMzQjtJQUFELHNCQUFDO0tBQUE7QUE1U1ksMENBQWU7QUE4UzVCLGtCQUFlLGVBQWUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMy8yNS8wMjUuXG4gKi9cblxuaW1wb3J0IHsgaXNVbmRlZiwgbWluaWZ5SFRNTCwgdHJpbSB9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IF9Ob3ZlbFNpdGUsIHsgSU1kY29uZk1ldGEsIHN0YXRpY0ltcGxlbWVudHMsIFNZTUJPTF9DQUNIRSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IElEb3dubG9hZE9wdGlvbnMsIElOb3ZlbCB9IGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgeyBJRmV0Y2hDaGFwdGVyLCBJT3B0aW9uc1J1bnRpbWUgfSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IE5vdmVsU2l0ZURlbW8gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCBOb3ZlbFNpdGVCYXNlIGZyb20gJy4uL2RlbW8vYmFzZSc7XG4vL2ltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xuaW1wb3J0IHsgRW51bU5vdmVsU3RhdHVzIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvL2xpYi9jb25zdCc7XG5pbXBvcnQgeyBfa2VlcEltYWdlSW5Db250ZXh0IH0gZnJvbSAnLi4vLi4vdXRpbC9odG1sJztcbmltcG9ydCB7IHBhcnNlVXJsLCBtYWtlVXJsLCBjaGVjayB9IGZyb20gJy4vdXRpbCc7XG5cbkBzdGF0aWNJbXBsZW1lbnRzPF9Ob3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVXZW5rdTg+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlV2Vua3U4IGV4dGVuZHMgTm92ZWxTaXRlQmFzZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gJ3dlbmt1OCc7XG5cblx0c3RhdGljIGNoZWNrKHVybDogc3RyaW5nIHwgVVJMIHwgX05vdmVsU2l0ZS5JUGFyc2VVcmwsIC4uLmFyZ3YpOiBib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gY2hlY2sodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdHN0YXRpYyBtYWtlVXJsKHVybG9iajogX05vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIG1ha2VVcmwodXJsb2JqLCBib29sLCAuLi5hcmd2KVxuXHR9XG5cblx0c3RhdGljIHBhcnNlVXJsKHVybDogc3RyaW5nIHwgVVJMIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIHBhcnNlVXJsKHVybCwgLi4uYXJndik7XG5cdH1cblxuXHRtYWtlVXJsKHVybG9iajogX05vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIG1ha2VVcmwodXJsb2JqLCBib29sLCAuLi5hcmd2KVxuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwgfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gcGFyc2VVcmwodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdGNyZWF0ZU1haW5Vcmw8VD4odXJsOiBzdHJpbmcgfCBVUkwsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0bGV0IGRhdGEgPSB0aGlzLnBhcnNlVXJsKHVybCk7XG5cblx0XHRpZiAoIWRhdGEgfHwgIWRhdGEubm92ZWxfaWQpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5sb2coZGF0YSk7XG5cblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcigpO1xuXHRcdH1cblxuXHRcdGxldCByZXQgPSB0aGlzLm1ha2VVcmwoZGF0YSwgdHJ1ZSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfcGFyc2VDaGFwdGVyPFQ+KHJldDogSUZldGNoQ2hhcHRlciwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlKVxuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGNvbnN0ICQgPSByZXQuZG9tLiQ7XG5cblx0XHR7XG5cdFx0XHRsZXQgYyA9IHJldC5kb20uJCgnI2NvbnRlbnQnKTtcblxuXHRcdFx0Yy5maW5kKCcjY29udGVudGRwJykucmVtb3ZlKCk7XG5cdFx0XHRjLmZpbmQoJyNjb250ZW50ZHAnKS5yZW1vdmUoKTtcblx0XHRcdGMuZmluZCgnI2NvbnRlbnRkcCcpLnJlbW92ZSgpO1xuXHRcdH1cblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdGxldCBodG1sID0gbWluaWZ5SFRNTChyZXQuZG9tLiQoJyNjb250ZW50JykuaHRtbCgpKTtcblxuXHRcdFx0aHRtbCA9IGh0bWwucmVwbGFjZSgvXigmbmJzcDspezR9L2dtLCAnJyk7XG5cblx0XHRcdHJldC5kb20uJCgnI2NvbnRlbnQnKS5odG1sKGh0bWwpO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cblx0XHR9XG5cblx0XHRyZXQuZG9tLiQoJyNjb250ZW50IGltZ1tzcmNdJykuZWFjaChmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGxldCBzcmMgPSByZXQuZG9tLiQodGhpcykucHJvcCgnc3JjJykudHJpbSgpO1xuXG5cdFx0XHRpZiAoc3JjKVxuXHRcdFx0e1xuXHRcdFx0XHRjYWNoZS5jaGFwdGVyLmltZ3MgPSBjYWNoZS5jaGFwdGVyLmltZ3MgfHwgW107XG5cblx0XHRcdFx0Y2FjaGUuY2hhcHRlci5pbWdzLnB1c2goc3JjKTtcblx0XHRcdFx0Y2FjaGUubm92ZWwuaW1ncy5wdXNoKHNyYyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUua2VlcEltYWdlKVxuXHRcdHtcblx0XHRcdGF3YWl0IF9rZWVwSW1hZ2VJbkNvbnRleHQocmV0LmRvbS4kKCcjY29udGVudCBpbWdbc3JjXScpLCAkLCB7XG5cdFx0XHRcdGFwcGVuZDogJ1xcbicsXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvL2NvbnNvbGUubG9nKHJldC5kb20uc2VyaWFsaXplKCkpO1xuXG5cdFx0cmV0dXJuIHJldC5kb20uJCgnI2NvbnRlbnQnKS50ZXh0KCk7XG5cdH1cblxuXHRhc3luYyBnZXRfdm9sdW1lX2xpc3Q8VCA9IElPcHRpb25zUnVudGltZT4oaW5wdXRVcmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fVxuXHQpOiBQcm9taXNlPElOb3ZlbD5cblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGxldCB1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwoaW5wdXRVcmwsIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdHJldHVybiBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybChkb20udXJsLmhyZWYpO1xuXG5cdFx0XHRcdGxldCBkYXRhX21ldGEgPSBhd2FpdCBzZWxmLl9nZXRfbWV0YSh1cmwsIG9wdGlvbnNSdW50aW1lLCB7XG5cdFx0XHRcdFx0ZG9tLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlX2RhdGVzID0gW107XG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIF9Ob3ZlbFNpdGUuSVZvbHVtZVtdO1xuXG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBfTm92ZWxTaXRlLklWb2x1bWU7XG5cblx0XHRcdFx0bGV0IHRhYmxlID0gJCgnYm9keSA+ICNpbmZvJykuc2libGluZ3MoJ3RhYmxlJykuZXEoMCk7XG5cdFx0XHRcdHRhYmxlXG5cdFx0XHRcdFx0LmZpbmQoJ3RkLnZjc3MsIHRkLmNjc3MnKVxuXHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRsZXQgdHIgPSBkb20uJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0aWYgKHRyLmlzKCcudmNzcycpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IHZvbHVtZV9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGU6IHRyaW0odHIudGV4dCgpKSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAodHIuaXMoJy5jY3NzJykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCBhID0gdHIuZmluZCgnYScpLmVxKDApO1xuXG5cdFx0XHRcdFx0XHRcdGlmICghYS5sZW5ndGgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgaHJlZiA9IGEucHJvcCgnaHJlZicpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBkYXRhID0gc2VsZi5wYXJzZVVybChocmVmKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIWRhdGEuY2hhcHRlcl9pZClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aHJlZiA9IHNlbGYubWFrZVVybChkYXRhKTtcblxuXHRcdFx0XHRcdFx0XHRcdGRhdGEudXJsID0gaHJlZjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3RpdGxlID0gdHJpbShhLnRleHQoKSk7XG5cblx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZVxuXHRcdFx0XHRcdFx0XHRcdC5jaGFwdGVyX2xpc3Rcblx0XHRcdFx0XHRcdFx0XHQucHVzaCh7XG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLmNoYXB0ZXJfbGlzdC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmw6IGhyZWYsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhOiBkYXRhLFxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGU7XG5cblx0XHRcdFx0aWYgKF9jYWNoZV9kYXRlcy5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRfY2FjaGVfZGF0ZXMuc29ydCgpO1xuXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSA9IG1vbWVudC51bml4KF9jYWNoZV9kYXRlc1tfY2FjaGVfZGF0ZXMubGVuZ3RoIC0gMV0pLmxvY2FsKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4ge1xuXG5cdFx0XHRcdFx0dXJsOiBkb20udXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0Li4uZGF0YV9tZXRhLFxuXG5cdFx0XHRcdFx0dm9sdW1lX2xpc3QsXG5cblx0XHRcdFx0XHQvL25vdmVsX2RhdGUsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0LnRhcChmdW5jdGlvbiAobm92ZWwpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUubG9nKG5vdmVsKTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX2dldF9tZXRhKGlucHV0VXJsLCBvcHRpb25zUnVudGltZSwgY2FjaGU6IHtcblx0XHRkb206IElKU0RPTSxcblx0fSlcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGxldCB1cmwgPSB0aGlzLm1ha2VVcmwodGhpcy5wYXJzZVVybChpbnB1dFVybCksIC0xKTtcblxuXHRcdHJldHVybiBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKGRvbSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXHRcdFx0XHRsZXQgZGF0YTogSU1kY29uZk1ldGEgPSB7fTtcblx0XHRcdFx0ZGF0YS5ub3ZlbCA9IHt9O1xuXG5cdFx0XHRcdGxldCBub3ZlbF90aXRsZSA9IGNhY2hlLmRvbS4kKCdib2R5ID4gI3RpdGxlJykudGV4dCgpLnRyaW0oKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yID0gY2FjaGUuZG9tLiQoJyNpbmZvJylcblx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL14uK++8mi9nLCAnJylcblx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgX2NvbnRlbnQgPSBkb20uJCgnI2NvbnRlbnQgPiBkaXYgPiB0YWJsZTplcSgxKScpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9jb3ZlciA9IF9jb250ZW50LmZpbmQoJ2ltZzplcSgwKScpLnByb3AoJ3NyYycpO1xuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYyA9IG5vdmVsVGV4dC50cmltKF9jb250ZW50LmZpbmQoJy5ob3R0ZXh0ICsgYnIgKyBzcGFuOmVxKC0xKScpLnRleHQoKSB8fCAnJywge1xuXHRcdFx0XHRcdHRyaW06IHRydWUsXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9zdGF0dXM7XG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlO1xuXHRcdFx0XHRsZXQgbm92ZWxfcHVibGlzaGVyO1xuXG5cdFx0XHRcdGRvbS4kKCcjY29udGVudCA+IGRpdiA+IHRhYmxlOmVxKDApIHRyOmVxKC0xKSA+IHRkJykuZWFjaChmdW5jdGlvbiAoaSwgZWxlbSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB0ID0gdHJpbShkb20uJChlbGVtKS50ZXh0KCkpO1xuXG5cdFx0XHRcdFx0aWYgKHQubWF0Y2goLyg/OueKtuaAgXzni4DmhYsp77yaXFxzKiguKykvKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRub3ZlbF9zdGF0dXMgPSB0cmltKFJlZ0V4cC4kMSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKHQubWF0Y2goLyg/OuabtOaWsCnvvJpcXHMqKC4rKS8pKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdG5vdmVsX2RhdGUgPSB0cmltKFJlZ0V4cC4kMSk7XG5cblx0XHRcdFx0XHRcdG5vdmVsX2RhdGUgPSBtb21lbnQobm92ZWxfZGF0ZSkubG9jYWwoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAodC5tYXRjaCgvKD865paH5bqT5YiG57G7Ke+8mlxccyooLispLykpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bm92ZWxfcHVibGlzaGVyID0gdHJpbShSZWdFeHAuJDEpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKHVybCk7XG5cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR1cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHQuLi5kYXRhLFxuXG5cdFx0XHRcdFx0bm92ZWxfdGl0bGUsXG5cdFx0XHRcdFx0bm92ZWxfY292ZXIsXG5cdFx0XHRcdFx0bm92ZWxfYXV0aG9yLFxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cblx0XHRcdFx0XHRub3ZlbF9kYXRlLFxuXHRcdFx0XHRcdG5vdmVsX3N0YXR1cyxcblx0XHRcdFx0XHRub3ZlbF9wdWJsaXNoZXIsXG5cdFx0XHRcdH07XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIF9oYW5kbGVEYXRhRm9yU3RyaW5naWZ5KC4uLmFyZ3YpOiBJTWRjb25mTWV0YVxuXHR7XG5cdFx0bGV0IG1kY29uZiA9IHN1cGVyLl9oYW5kbGVEYXRhRm9yU3RyaW5naWZ5KC4uLmFyZ3YpO1xuXG5cdFx0aWYgKG1kY29uZi5ub3ZlbClcblx0XHR7XG5cdFx0XHRtZGNvbmYubm92ZWwubm92ZWxfc3RhdHVzID0gKG1kY29uZi5ub3ZlbC5ub3ZlbF9zdGF0dXMgfCAwKSB8IEVudW1Ob3ZlbFN0YXR1cy5QX0JPT0s7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gbWRjb25mO1xuXHR9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlV2Vua3U4O1xuIl19