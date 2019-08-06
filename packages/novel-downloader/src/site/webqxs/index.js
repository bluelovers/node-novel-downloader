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
let NovelSiteWebqxs = class NovelSiteWebqxs extends base_1.default {
    makeUrl(urlobj, bool) {
        let url;
        if (util_1.isUndef(urlobj.novel_pid) || bool < 0) {
            url = `http://www.webqxs.com/lightnovel/${urlobj.novel_id}.html`;
        }
        else {
            let cid = (!bool && urlobj.chapter_id) ? urlobj.chapter_id + '.html' : '';
            url = `http://www.webqxs.com/${urlobj.novel_pid}/${urlobj.novel_id}/${cid}`;
        }
        return new jsdom_url_1.URL(url);
    }
    parseUrl(url, options) {
        let urlobj = {
            url: url,
            novel_pid: null,
            novel_id: null,
            chapter_id: null,
        };
        urlobj.url = new jsdom_url_1.URL(url);
        url = urlobj.url.href;
        let r = /www\.webqxs\.com\/([\d]+)\/([\d]+)\/(?:([\d]+)\.html?)?/;
        let m = r.exec(url);
        if (m) {
            urlobj.novel_pid = m[1];
            urlobj.novel_id = m[2];
            urlobj.chapter_id = m[3];
            return urlobj;
        }
        r = /www\.webqxs\.com\/lightnovel\/(\d+).html/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        return urlobj;
    }
    createMainUrl(url) {
        let data = this.parseUrl(url);
        if (!data || util_1.isUndef(data.novel_pid) || !data.novel_id) {
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
            let html = util_1.minifyHTML(ret.dom.$('#articlecontent').html());
            html = html.replace(/^(&nbsp;){4}/gm, '');
            ret.dom.$('#articlecontent').html(html);
        }
        catch (e) {
        }
        //console.log(ret.dom.serialize());
        return ret.dom.$('#articlecontent').text();
    }
    async get_volume_list(inputUrl, optionsRuntime = {}) {
        const self = this;
        let url = await this.createMainUrl(inputUrl);
        return await jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            let url_data = self.parseUrl(dom.url.href);
            let novel_title = dom.$('.story-head .story-title').text();
            let data_meta = await self._get_meta(url, optionsRuntime);
            let _cache_dates = [];
            let volume_list = [];
            let currentVolume;
            let table = $('.ml_content .ml_list ul').eq(0);
            table.children()
                .each(function (index) {
                let tr = dom.$(this);
                if (tr.is('div.volume-z')) {
                    currentVolume = volume_list[volume_list.length] = {
                        volume_index: volume_list.length,
                        volume_title: novel_text_1.default.trim(tr.text()),
                        chapter_list: [],
                    };
                }
                else if (tr.is('li')) {
                    tr.find('a')
                        .each(function (index) {
                        let a = dom.$(this);
                        let href = a.prop('href');
                        let data = self.parseUrl(href);
                        if (!data.chapter_id) {
                            throw new Error();
                        }
                        else {
                            href = self.makeUrl(data);
                            data.url = href;
                        }
                        let chapter_title = a.text().trim();
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
            return Object.assign(Object.assign({}, data_meta), { url: dom.url, url_data,
                novel_title,
                volume_list,
                novel_date, checkdate: index_2.moment().local(), imgs: [] });
        })
            .tap(function (novel) {
            console.log(novel);
        });
    }
    async _get_meta(inputUrl, optionsRuntime) {
        let url = this.makeUrl(this.parseUrl(inputUrl), -1);
        return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(function (dom) {
            const $ = dom.$;
            let novel_author = $('.z-author .f-text-overflow')
                .text()
                .trim();
            $('.u-bookDetail-synopsis .u-synopsis-text > strong:eq(0)').remove();
            let novel_desc = $('.u-bookDetail-synopsis .u-synopsis-text')
                .text()
                .trim();
            return {
                url,
                novel_author,
                novel_desc,
            };
        });
    }
};
NovelSiteWebqxs.IDKEY = 'webqxs';
NovelSiteWebqxs = __decorate([
    index_1.staticImplements()
], NovelSiteWebqxs);
exports.NovelSiteWebqxs = NovelSiteWebqxs;
exports.default = NovelSiteWebqxs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQWlEO0FBQ2pELG9DQUFzRTtBQUl0RSx1Q0FBeUM7QUFDekMseUNBQWdDO0FBQ2hDLDZDQUErRDtBQUUvRCxvQ0FBa0M7QUFDbEMsMkNBQW1DO0FBR25DLElBQWEsZUFBZSxHQUE1QixNQUFhLGVBQWdCLFNBQVEsY0FBYTtJQUlqRCxPQUFPLENBQUMsTUFBNEIsRUFBRSxJQUF1QjtRQUU1RCxJQUFJLEdBQVcsQ0FBQztRQUVoQixJQUFJLGNBQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsRUFDekM7WUFDQyxHQUFHLEdBQUcsb0NBQW9DLE1BQU0sQ0FBQyxRQUFRLE9BQU8sQ0FBQztTQUNqRTthQUVEO1lBQ0MsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFFMUUsR0FBRyxHQUFHLHlCQUF5QixNQUFNLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxRQUFRLElBQUksR0FBRyxFQUFFLENBQUM7U0FDNUU7UUFFRCxPQUFPLElBQUksZUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxRQUFRLENBQUMsR0FBaUIsRUFBRSxPQUFRO1FBRW5DLElBQUksTUFBTSxHQUFHO1lBQ1osR0FBRyxFQUFFLEdBQUc7WUFFUixTQUFTLEVBQUUsSUFBSTtZQUNmLFFBQVEsRUFBRSxJQUFJO1lBQ2QsVUFBVSxFQUFFLElBQUk7U0FDaEIsQ0FBQztRQUVGLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxlQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUIsR0FBRyxHQUFHLE1B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QyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFcEQsT0FBTyxxQkFBTyxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsWUFBWSxDQUFDO2FBQzlDLElBQUksQ0FBQyxVQUFVLEdBQUc7WUFFbEIsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUVoQixJQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsNEJBQTRCLENBQUM7aUJBQ2hELElBQUksRUFBRTtpQkFDTixJQUFJLEVBQUUsQ0FDUDtZQUVELENBQUMsQ0FBQyx3REFBd0QsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRXJFLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQyx5Q0FBeUMsQ0FBQztpQkFDM0QsSUFBSSxFQUFFO2lCQUNOLElBQUksRUFBRSxDQUNQO1lBRUQsT0FBTztnQkFDTixHQUFHO2dCQUVILFlBQVk7Z0JBQ1osVUFBVTthQUNWLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FDRjtJQUNGLENBQUM7Q0FDRCxDQUFBO0FBNU91QixxQkFBSyxHQUFHLFFBQVEsQ0FBQztBQUY1QixlQUFlO0lBRDNCLHdCQUFnQixFQUFnRDtHQUNwRCxlQUFlLENBOE8zQjtBQTlPWSwwQ0FBZTtBQWdQNUIsa0JBQWUsZUFBZSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzI1LzAyNS5cbiAqL1xuXG5pbXBvcnQgeyBpc1VuZGVmLCBtaW5pZnlIVE1MIH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgX05vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBTWU1CT0xfQ0FDSEUgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBJRG93bmxvYWRPcHRpb25zLCBJTm92ZWwgfSBmcm9tICcuLi9kZW1vL2Jhc2UnO1xuaW1wb3J0IHsgSUZldGNoQ2hhcHRlciwgSU9wdGlvbnNSdW50aW1lIH0gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCAqIGFzIE5vdmVsU2l0ZURlbW8gZnJvbSAnLi4vZGVtby9iYXNlJztcbmltcG9ydCBOb3ZlbFNpdGVCYXNlIGZyb20gJy4uL2RlbW8vYmFzZSc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IG5vdmVsVGV4dCBmcm9tICdub3ZlbC10ZXh0JztcblxuQHN0YXRpY0ltcGxlbWVudHM8X05vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZVdlYnF4cz4+KClcbmV4cG9ydCBjbGFzcyBOb3ZlbFNpdGVXZWJxeHMgZXh0ZW5kcyBOb3ZlbFNpdGVCYXNlXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVkgPSAnd2VicXhzJztcblxuXHRtYWtlVXJsKHVybG9iajogX05vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyKTogVVJMXG5cdHtcblx0XHRsZXQgdXJsOiBzdHJpbmc7XG5cblx0XHRpZiAoaXNVbmRlZih1cmxvYmoubm92ZWxfcGlkKSB8fCBib29sIDwgMClcblx0XHR7XG5cdFx0XHR1cmwgPSBgaHR0cDovL3d3dy53ZWJxeHMuY29tL2xpZ2h0bm92ZWwvJHt1cmxvYmoubm92ZWxfaWR9Lmh0bWxgO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0bGV0IGNpZCA9ICghYm9vbCAmJiB1cmxvYmouY2hhcHRlcl9pZCkgPyB1cmxvYmouY2hhcHRlcl9pZCArICcuaHRtbCcgOiAnJztcblxuXHRcdFx0dXJsID0gYGh0dHA6Ly93d3cud2VicXhzLmNvbS8ke3VybG9iai5ub3ZlbF9waWR9LyR7dXJsb2JqLm5vdmVsX2lkfS8ke2NpZH1gO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgVVJMKHVybCk7XG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IFVSTCB8IHN0cmluZywgb3B0aW9ucz8pOiBfTm92ZWxTaXRlLklQYXJzZVVybFxuXHR7XG5cdFx0bGV0IHVybG9iaiA9IHtcblx0XHRcdHVybDogdXJsLFxuXG5cdFx0XHRub3ZlbF9waWQ6IG51bGwsXG5cdFx0XHRub3ZlbF9pZDogbnVsbCxcblx0XHRcdGNoYXB0ZXJfaWQ6IG51bGwsXG5cdFx0fTtcblxuXHRcdHVybG9iai51cmwgPSBuZXcgVVJMKHVybCk7XG5cdFx0dXJsID0gdXJsb2JqLnVybC5ocmVmO1xuXG5cdFx0bGV0IHIgPSAvd3d3XFwud2VicXhzXFwuY29tXFwvKFtcXGRdKylcXC8oW1xcZF0rKVxcLyg/OihbXFxkXSspXFwuaHRtbD8pPy87XG5cblx0XHRsZXQgbSA9IHIuZXhlYyh1cmwpO1xuXHRcdGlmIChtKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9waWQgPSBtWzFdO1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsyXTtcblx0XHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVszXTtcblxuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyID0gL3d3d1xcLndlYnF4c1xcLmNvbVxcL2xpZ2h0bm92ZWxcXC8oXFxkKykuaHRtbC87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHJldHVybiB1cmxvYmo7XG5cdH1cblxuXHRjcmVhdGVNYWluVXJsKHVybClcblx0e1xuXHRcdGxldCBkYXRhID0gdGhpcy5wYXJzZVVybCh1cmwpO1xuXG5cdFx0aWYgKCFkYXRhIHx8IGlzVW5kZWYoZGF0YS5ub3ZlbF9waWQpIHx8ICFkYXRhLm5vdmVsX2lkKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHR9XG5cblx0XHRsZXQgcmV0ID0gdGhpcy5tYWtlVXJsKGRhdGEsIHRydWUpO1xuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdHByb3RlY3RlZCBfcGFyc2VDaGFwdGVyPFQ+KHJldDogSUZldGNoQ2hhcHRlciwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlKTogc3RyaW5nXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0bGV0IGh0bWwgPSBtaW5pZnlIVE1MKHJldC5kb20uJCgnI2FydGljbGVjb250ZW50JykuaHRtbCgpKTtcblxuXHRcdFx0aHRtbCA9IGh0bWwucmVwbGFjZSgvXigmbmJzcDspezR9L2dtLCAnJyk7XG5cblx0XHRcdHJldC5kb20uJCgnI2FydGljbGVjb250ZW50JykuaHRtbChodG1sKTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXG5cdFx0fVxuXG5cdFx0Ly9jb25zb2xlLmxvZyhyZXQuZG9tLnNlcmlhbGl6ZSgpKTtcblxuXHRcdHJldHVybiByZXQuZG9tLiQoJyNhcnRpY2xlY29udGVudCcpLnRleHQoKTtcblx0fVxuXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUID0gSU9wdGlvbnNSdW50aW1lPihpbnB1dFVybDogc3RyaW5nIHwgVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPFQgJiBJRG93bmxvYWRPcHRpb25zPiA9IHt9XG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0bGV0IHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybChpbnB1dFVybCk7XG5cblx0XHRyZXR1cm4gYXdhaXQgZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb206IElKU0RPTSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdGxldCB1cmxfZGF0YSA9IHNlbGYucGFyc2VVcmwoZG9tLnVybC5ocmVmKTtcblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gZG9tLiQoJy5zdG9yeS1oZWFkIC5zdG9yeS10aXRsZScpLnRleHQoKTtcblxuXHRcdFx0XHRsZXQgZGF0YV9tZXRhID0gYXdhaXQgc2VsZi5fZ2V0X21ldGEodXJsLCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0bGV0IF9jYWNoZV9kYXRlcyA9IFtdO1xuXHRcdFx0XHRsZXQgdm9sdW1lX2xpc3QgPSBbXSBhcyBfTm92ZWxTaXRlLklWb2x1bWVbXTtcblxuXHRcdFx0XHRsZXQgY3VycmVudFZvbHVtZTogX05vdmVsU2l0ZS5JVm9sdW1lO1xuXG5cdFx0XHRcdGxldCB0YWJsZSA9ICQoJy5tbF9jb250ZW50IC5tbF9saXN0IHVsJykuZXEoMCk7XG5cdFx0XHRcdHRhYmxlLmNoaWxkcmVuKClcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IHRyID0gZG9tLiQodGhpcyk7XG5cblx0XHRcdFx0XHRcdGlmICh0ci5pcygnZGl2LnZvbHVtZS16JykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSB2b2x1bWVfbGlzdFt2b2x1bWVfbGlzdC5sZW5ndGhdID0ge1xuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZTogbm92ZWxUZXh0LnRyaW0odHIudGV4dCgpKSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAodHIuaXMoJ2xpJykpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHRyLmZpbmQoJ2EnKVxuXHRcdFx0XHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleClcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgYSA9IGRvbS4kKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgaHJlZiA9IGEucHJvcCgnaHJlZicpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgZGF0YSA9IHNlbGYucGFyc2VVcmwoaHJlZik7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmICghZGF0YS5jaGFwdGVyX2lkKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRocmVmID0gc2VsZi5tYWtlVXJsKGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGRhdGEudXJsID0gaHJlZjtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfdGl0bGUgPSBhLnRleHQoKS50cmltKCk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWVcblx0XHRcdFx0XHRcdFx0XHRcdFx0LmNoYXB0ZXJfbGlzdFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQucHVzaCh7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogY3VycmVudFZvbHVtZS5jaGFwdGVyX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsOiBocmVmLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGE6IGRhdGEsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGU7XG5cblx0XHRcdFx0aWYgKF9jYWNoZV9kYXRlcy5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRfY2FjaGVfZGF0ZXMuc29ydCgpO1xuXG5cdFx0XHRcdFx0bm92ZWxfZGF0ZSA9IG1vbWVudC51bml4KF9jYWNoZV9kYXRlc1tfY2FjaGVfZGF0ZXMubGVuZ3RoIC0gMV0pLmxvY2FsKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4ge1xuXG5cdFx0XHRcdFx0Li4uZGF0YV9tZXRhLFxuXG5cdFx0XHRcdFx0dXJsOiBkb20udXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0bm92ZWxfdGl0bGUsXG5cblx0XHRcdFx0XHR2b2x1bWVfbGlzdCxcblxuXHRcdFx0XHRcdG5vdmVsX2RhdGUsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0LnRhcChmdW5jdGlvbiAobm92ZWwpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUubG9nKG5vdmVsKTtcblx0XHRcdH0pXG5cdFx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9nZXRfbWV0YShpbnB1dFVybCwgb3B0aW9uc1J1bnRpbWUpXG5cdHtcblx0XHRsZXQgdXJsID0gdGhpcy5tYWtlVXJsKHRoaXMucGFyc2VVcmwoaW5wdXRVcmwpLCAtMSk7XG5cblx0XHRyZXR1cm4gZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChkb20pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yID0gJCgnLnotYXV0aG9yIC5mLXRleHQtb3ZlcmZsb3cnKVxuXHRcdFx0XHRcdC50ZXh0KClcblx0XHRcdFx0XHQudHJpbSgpXG5cdFx0XHRcdDtcblxuXHRcdFx0XHQkKCcudS1ib29rRGV0YWlsLXN5bm9wc2lzIC51LXN5bm9wc2lzLXRleHQgPiBzdHJvbmc6ZXEoMCknKS5yZW1vdmUoKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYyA9ICQoJy51LWJvb2tEZXRhaWwtc3lub3BzaXMgLnUtc3lub3BzaXMtdGV4dCcpXG5cdFx0XHRcdFx0LnRleHQoKVxuXHRcdFx0XHRcdC50cmltKClcblx0XHRcdFx0O1xuXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0dXJsLFxuXG5cdFx0XHRcdFx0bm92ZWxfYXV0aG9yLFxuXHRcdFx0XHRcdG5vdmVsX2Rlc2MsXG5cdFx0XHRcdH07XG5cdFx0XHR9KVxuXHRcdDtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVXZWJxeHM7XG4iXX0=