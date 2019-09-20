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
    makeUrl(urlobj, bool, optionsRuntime) {
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
        r = /^(\d+)$/;
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
exports.NovelSiteWenku8 = NovelSiteWenku8;
exports.default = NovelSiteWenku8;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQXVEO0FBQ3ZELG9DQUFtRjtBQUluRix1Q0FBeUM7QUFDekMseUNBQWdDO0FBQ2hDLDZDQUErRDtBQUUvRCxvQ0FBa0M7QUFDbEMsMkNBQW1DO0FBQ25DLHFEQUE0RDtBQUc1RCxJQUFhLGVBQWUsR0FBNUIsTUFBYSxlQUFnQixTQUFRLGNBQWE7SUFJakQsT0FBTyxDQUFJLE1BQTRCLEVBQUUsSUFBdUIsRUFBRSxjQUFvQztRQUVyRyxJQUFJLEdBQVcsQ0FBQztRQUVoQixJQUFJLElBQUksR0FBRyxDQUFDLEVBQ1o7WUFDQyxHQUFHLEdBQUcsOEJBQThCLE1BQU0sQ0FBQyxRQUFRLE1BQU0sQ0FBQztTQUMxRDthQUVEO1lBQ0MsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFFMUUsR0FBRyxHQUFHLHdEQUF3RCxNQUFNLENBQUMsUUFBUSxHQUFHLEdBQUcsRUFBRSxDQUFDO1NBQ3RGO1FBRUQsYUFBYTtRQUNiLE9BQU8sSUFBSSxlQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUVELFFBQVEsQ0FBQyxHQUFpQixFQUFFLE9BQVE7UUFFbkMsSUFBSSxNQUFNLEdBQUc7WUFDWixHQUFHLEVBQUUsR0FBRztZQUVSLFNBQVMsRUFBRSxJQUFJO1lBQ2YsUUFBUSxFQUFFLElBQUk7WUFDZCxVQUFVLEVBQUUsSUFBSTtTQUNoQixDQUFDO1FBRUYsYUFBYTtRQUNiLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxlQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUIsYUFBYTtRQUNiLEdBQUcsR0FBRyxNQUFN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QUVWLFVBQVU7Z0JBQ1YsWUFBWTtnQkFDWixlQUFlLElBQ2Q7UUFDSCxDQUFDLENBQUMsQ0FDRDtJQUNILENBQUM7SUFFUyx1QkFBdUIsQ0FBQyxHQUFHLElBQUk7UUFFeEMsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFFcEQsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUNoQjtZQUNDLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLEdBQUcsdUJBQWUsQ0FBQyxNQUFNLENBQUM7U0FFckY7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7Q0FFRCxDQUFBO0FBelZ1QixxQkFBSyxHQUFHLFFBQVEsQ0FBQztBQUY1QixlQUFlO0lBRDNCLHdCQUFnQixFQUFnRDtHQUNwRCxlQUFlLENBMlYzQjtBQTNWWSwwQ0FBZTtBQTZWNUIsa0JBQWUsZUFBZSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzI1LzAyNS5cbiAqL1xuXG5pbXBvcnQgeyBpc1VuZGVmLCBtaW5pZnlIVE1MLCB0cmltIH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgX05vdmVsU2l0ZSwgeyBJTWRjb25mTWV0YSwgc3RhdGljSW1wbGVtZW50cywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgSURvd25sb2FkT3B0aW9ucywgSU5vdmVsIH0gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCB7IElGZXRjaENoYXB0ZXIsIElPcHRpb25zUnVudGltZSB9IGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgTm92ZWxTaXRlRGVtbyBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IE5vdmVsU2l0ZUJhc2UgZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xuaW1wb3J0IHsgRW51bU5vdmVsU3RhdHVzIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvL2xpYi9jb25zdCc7XG5cbkBzdGF0aWNJbXBsZW1lbnRzPF9Ob3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVXZW5rdTg+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlV2Vua3U4IGV4dGVuZHMgTm92ZWxTaXRlQmFzZVxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gJ3dlbmt1OCc7XG5cblx0bWFrZVVybDxUPih1cmxvYmo6IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sPzogYm9vbGVhbiB8IG51bWJlciwgb3B0aW9uc1J1bnRpbWU/OiBUICYgSU9wdGlvbnNSdW50aW1lKTogVVJMXG5cdHtcblx0XHRsZXQgdXJsOiBzdHJpbmc7XG5cblx0XHRpZiAoYm9vbCA8IDApXG5cdFx0e1xuXHRcdFx0dXJsID0gYGh0dHA6Ly93d3cud2Vua3U4LmNvbS9ib29rLyR7dXJsb2JqLm5vdmVsX2lkfS5odG1gO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0bGV0IGNpZCA9ICghYm9vbCAmJiB1cmxvYmouY2hhcHRlcl9pZCkgPyAnJmNpZD0nICsgdXJsb2JqLmNoYXB0ZXJfaWQgOiAnJztcblxuXHRcdFx0dXJsID0gYGh0dHA6Ly93d3cud2Vua3U4LmNvbS9tb2R1bGVzL2FydGljbGUvcmVhZGVyLnBocD9haWQ9JHt1cmxvYmoubm92ZWxfaWR9JHtjaWR9YDtcblx0XHR9XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG5ldyBVUkwodXJsKTtcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogVVJMIHwgc3RyaW5nLCBvcHRpb25zPyk6IF9Ob3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHRsZXQgdXJsb2JqID0ge1xuXHRcdFx0dXJsOiB1cmwsXG5cblx0XHRcdG5vdmVsX3BpZDogbnVsbCxcblx0XHRcdG5vdmVsX2lkOiBudWxsLFxuXHRcdFx0Y2hhcHRlcl9pZDogbnVsbCxcblx0XHR9O1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHVybG9iai51cmwgPSBuZXcgVVJMKHVybCk7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHVybCA9IHVybG9iai51cmwuaHJlZiBhcyBzdHJpbmc7XG5cblx0XHRsZXQgcjogUmVnRXhwO1xuXHRcdGxldCBtOiBSZWdFeHBFeGVjQXJyYXk7XG5cblx0XHRyID0gL21vZHVsZXNcXC9hcnRpY2xlXFwvYXJ0aWNsZWluZm9cXC5waHBcXD9pZD0oXFxkKykvO1xuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyID0gL21vZHVsZXNcXC9hcnRpY2xlXFwvcmVhZGVyXFwucGhwXFw/YWlkPShcXGQrKSg/OiZjaWQ9KFxcZCspKT8vO1xuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVsyXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyID0gL2Jvb2tcXC8oXFxkKylcXC5odG0vO1xuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyID0gL25vdmVsXFwvKFtcXGRdKylcXC8oW1xcZF0rKVxcLyg/OihbXFxkXSspXFwuaHRtbD8pPy87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfcGlkID0gbVsxXTtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMl07XG5cdFx0XHR1cmxvYmouY2hhcHRlcl9pZCA9IG1bM107XG5cdFx0fVxuXG5cdFx0ciA9IC9eKFxcZCspJC87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHJldHVybiB1cmxvYmo7XG5cdH1cblxuXHRjcmVhdGVNYWluVXJsPFQ+KHVybDogc3RyaW5nIHwgVVJMLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSlcblx0e1xuXHRcdGxldCBkYXRhID0gdGhpcy5wYXJzZVVybCh1cmwpO1xuXG5cdFx0aWYgKCFkYXRhIHx8ICFkYXRhLm5vdmVsX2lkKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHR9XG5cblx0XHRsZXQgcmV0ID0gdGhpcy5tYWtlVXJsKGRhdGEsIHRydWUsIG9wdGlvbnNSdW50aW1lKTtcblxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihyZXQ6IElGZXRjaENoYXB0ZXIsIG9wdGlvbnNSdW50aW1lOiBUICYgSU9wdGlvbnNSdW50aW1lLCBjYWNoZSk6IHN0cmluZ1xuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdHtcblx0XHRcdGxldCBjID0gcmV0LmRvbS4kKCcjY29udGVudCcpO1xuXG5cdFx0XHRjLmZpbmQoJyNjb250ZW50ZHAnKS5yZW1vdmUoKTtcblx0XHRcdGMuZmluZCgnI2NvbnRlbnRkcCcpLnJlbW92ZSgpO1xuXHRcdFx0Yy5maW5kKCcjY29udGVudGRwJykucmVtb3ZlKCk7XG5cdFx0fVxuXG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0bGV0IGh0bWwgPSBtaW5pZnlIVE1MKHJldC5kb20uJCgnI2NvbnRlbnQnKS5odG1sKCkpO1xuXG5cdFx0XHRodG1sID0gaHRtbC5yZXBsYWNlKC9eKCZuYnNwOyl7NH0vZ20sICcnKTtcblxuXHRcdFx0cmV0LmRvbS4kKCcjY29udGVudCcpLmh0bWwoaHRtbCk7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblxuXHRcdH1cblxuXHRcdHJldC5kb20uJCgnI2NvbnRlbnQgaW1nW3NyY10nKS5lYWNoKGZ1bmN0aW9uICgpXG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0bGV0IHNyYyA9IHJldC5kb20uJCh0aGlzKS5wcm9wKCdzcmMnKS50cmltKCk7XG5cblx0XHRcdGlmIChzcmMpXG5cdFx0XHR7XG5cdFx0XHRcdGNhY2hlLmNoYXB0ZXIuaW1ncyA9IGNhY2hlLmNoYXB0ZXIuaW1ncyB8fCBbXTtcblxuXHRcdFx0XHRjYWNoZS5jaGFwdGVyLmltZ3MucHVzaChzcmMpO1xuXHRcdFx0XHRjYWNoZS5ub3ZlbC5pbWdzLnB1c2goc3JjKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vY29uc29sZS5sb2cocmV0LmRvbS5zZXJpYWxpemUoKSk7XG5cblx0XHRyZXR1cm4gcmV0LmRvbS4kKCcjY29udGVudCcpLnRleHQoKTtcblx0fVxuXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUID0gSU9wdGlvbnNSdW50aW1lPihpbnB1dFVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9XG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0bGV0IHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybChpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKGRvbS51cmwuaHJlZik7XG5cblx0XHRcdFx0bGV0IGRhdGFfbWV0YSA9IGF3YWl0IHNlbGYuX2dldF9tZXRhKHVybCwgb3B0aW9uc1J1bnRpbWUsIHtcblx0XHRcdFx0XHRkb20sXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGxldCBfY2FjaGVfZGF0ZXMgPSBbXTtcblx0XHRcdFx0bGV0IHZvbHVtZV9saXN0ID0gW10gYXMgX05vdmVsU2l0ZS5JVm9sdW1lW107XG5cblx0XHRcdFx0bGV0IGN1cnJlbnRWb2x1bWU6IF9Ob3ZlbFNpdGUuSVZvbHVtZTtcblxuXHRcdFx0XHRsZXQgdGFibGUgPSAkKCdib2R5ID4gI2luZm8nKS5zaWJsaW5ncygndGFibGUnKS5lcSgwKTtcblx0XHRcdFx0dGFibGVcblx0XHRcdFx0XHQuZmluZCgndGQudmNzcywgdGQuY2NzcycpXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdGxldCB0ciA9IGRvbS4kKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRpZiAodHIuaXMoJy52Y3NzJykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZTogdHJpbSh0ci50ZXh0KCkpLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfbGlzdDogW10sXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIGlmICh0ci5pcygnLmNjc3MnKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IGEgPSB0ci5maW5kKCdhJykuZXEoMCk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFhLmxlbmd0aClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBocmVmID0gYS5wcm9wKCdocmVmJyk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGRhdGEgPSBzZWxmLnBhcnNlVXJsKGhyZWYpO1xuXG5cdFx0XHRcdFx0XHRcdGlmICghZGF0YS5jaGFwdGVyX2lkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRocmVmID0gc2VsZi5tYWtlVXJsKGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS51cmwgPSBocmVmO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfdGl0bGUgPSB0cmltKGEudGV4dCgpKTtcblxuXHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lXG5cdFx0XHRcdFx0XHRcdFx0LmNoYXB0ZXJfbGlzdFxuXHRcdFx0XHRcdFx0XHRcdC5wdXNoKHtcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaW5kZXg6IGN1cnJlbnRWb2x1bWUuY2hhcHRlcl9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybDogaHJlZixcblx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGE6IGRhdGEsXG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGF0ZTtcblxuXHRcdFx0XHRpZiAoX2NhY2hlX2RhdGVzLmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdF9jYWNoZV9kYXRlcy5zb3J0KCk7XG5cblx0XHRcdFx0XHRub3ZlbF9kYXRlID0gbW9tZW50LnVuaXgoX2NhY2hlX2RhdGVzW19jYWNoZV9kYXRlcy5sZW5ndGggLSAxXSkubG9jYWwoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiB7XG5cblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHQuLi5kYXRhX21ldGEsXG5cblx0XHRcdFx0XHR2b2x1bWVfbGlzdCxcblxuXHRcdFx0XHRcdC8vbm92ZWxfZGF0ZSxcblxuXHRcdFx0XHRcdGNoZWNrZGF0ZTogbW9tZW50KCkubG9jYWwoKSxcblxuXHRcdFx0XHRcdGltZ3M6IFtdIGFzIHN0cmluZ1tdLFxuXHRcdFx0XHR9IGFzIElOb3ZlbDtcblx0XHRcdH0pXG5cdFx0XHQudGFwKGZ1bmN0aW9uIChub3ZlbClcblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZS5sb2cobm92ZWwpO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfZ2V0X21ldGEoaW5wdXRVcmwsIG9wdGlvbnNSdW50aW1lLCBjYWNoZToge1xuXHRcdGRvbTogSUpTRE9NLFxuXHR9KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0bGV0IHVybCA9IHRoaXMubWFrZVVybCh0aGlzLnBhcnNlVXJsKGlucHV0VXJsKSwgLTEpO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoZG9tKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cdFx0XHRcdGxldCBkYXRhOiBJTWRjb25mTWV0YSA9IHt9O1xuXHRcdFx0XHRkYXRhLm5vdmVsID0ge307XG5cblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gY2FjaGUuZG9tLiQoJ2JvZHkgPiAjdGl0bGUnKS50ZXh0KCkudHJpbSgpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9hdXRob3IgPSBjYWNoZS5kb20uJCgnI2luZm8nKVxuXHRcdFx0XHRcdC50ZXh0KClcblx0XHRcdFx0XHQucmVwbGFjZSgvXi4r77yaL2csICcnKVxuXHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGxldCBfY29udGVudCA9IGRvbS4kKCcjY29udGVudCA+IGRpdiA+IHRhYmxlOmVxKDEpJyk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2NvdmVyID0gX2NvbnRlbnQuZmluZCgnaW1nOmVxKDApJykucHJvcCgnc3JjJyk7XG5cdFx0XHRcdGxldCBub3ZlbF9kZXNjID0gbm92ZWxUZXh0LnRyaW0oX2NvbnRlbnQuZmluZCgnLmhvdHRleHQgKyBiciArIHNwYW46ZXEoLTEpJykudGV4dCgpIHx8ICcnLCB7XG5cdFx0XHRcdFx0dHJpbTogdHJ1ZSxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3N0YXR1cztcblx0XHRcdFx0bGV0IG5vdmVsX2RhdGU7XG5cdFx0XHRcdGxldCBub3ZlbF9wdWJsaXNoZXI7XG5cblx0XHRcdFx0ZG9tLiQoJyNjb250ZW50ID4gZGl2ID4gdGFibGU6ZXEoMCkgdHI6ZXEoLTEpID4gdGQnKS5lYWNoKGZ1bmN0aW9uIChpLCBlbGVtKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHQgPSB0cmltKGRvbS4kKGVsZW0pLnRleHQoKSk7XG5cblx0XHRcdFx0XHRpZiAodC5tYXRjaCgvKD8654q25oCBfOeLgOaFiynvvJpcXHMqKC4rKS8pKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdG5vdmVsX3N0YXR1cyA9IHRyaW0oUmVnRXhwLiQxKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAodC5tYXRjaCgvKD865pu05pawKe+8mlxccyooLispLykpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bm92ZWxfZGF0ZSA9IHRyaW0oUmVnRXhwLiQxKTtcblxuXHRcdFx0XHRcdFx0bm92ZWxfZGF0ZSA9IG1vbWVudChub3ZlbF9kYXRlKS5sb2NhbCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIGlmICh0Lm1hdGNoKC8oPzrmloflupPliIbnsbsp77yaXFxzKiguKykvKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRub3ZlbF9wdWJsaXNoZXIgPSB0cmltKFJlZ0V4cC4kMSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwodXJsKTtcblxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHVybCxcblx0XHRcdFx0XHR1cmxfZGF0YSxcblxuXHRcdFx0XHRcdC4uLmRhdGEsXG5cblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcblx0XHRcdFx0XHRub3ZlbF9jb3Zlcixcblx0XHRcdFx0XHRub3ZlbF9hdXRob3IsXG5cdFx0XHRcdFx0bm92ZWxfZGVzYyxcblxuXHRcdFx0XHRcdG5vdmVsX2RhdGUsXG5cdFx0XHRcdFx0bm92ZWxfc3RhdHVzLFxuXHRcdFx0XHRcdG5vdmVsX3B1Ymxpc2hlcixcblx0XHRcdFx0fTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2hhbmRsZURhdGFGb3JTdHJpbmdpZnkoLi4uYXJndik6IElNZGNvbmZNZXRhXG5cdHtcblx0XHRsZXQgbWRjb25mID0gc3VwZXIuX2hhbmRsZURhdGFGb3JTdHJpbmdpZnkoLi4uYXJndik7XG5cblx0XHRpZiAobWRjb25mLm5vdmVsKVxuXHRcdHtcblx0XHRcdG1kY29uZi5ub3ZlbC5ub3ZlbF9zdGF0dXMgPSAobWRjb25mLm5vdmVsLm5vdmVsX3N0YXR1cyB8IDApIHwgRW51bU5vdmVsU3RhdHVzLlBfQk9PSztcblxuXHRcdH1cblxuXHRcdHJldHVybiBtZGNvbmY7XG5cdH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVXZW5rdTg7XG4iXX0=