"use strict";
/**
 * Created by user on 2018/3/17/017.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../util");
const tree_1 = require("../demo/tree");
const jsdom_extra_1 = require("jsdom-extra");
const jsdom_url_1 = require("jsdom-url");
const index_1 = require("../index");
const index_2 = require("../index");
let NovelSiteNovelba = class NovelSiteNovelba extends tree_1.default {
    static check(url, options) {
        // @ts-ignore
        return /novelba\.com/i.test(new jsdom_url_1.URL(url).hostname || '');
    }
    makeUrl(urlobj, bool) {
        let pad = (!bool && urlobj.chapter_id) ? '/episodes/' + urlobj.chapter_id : '';
        // @ts-ignore
        return new jsdom_url_1.URL(`https://novelba.com/works/${urlobj.novel_id}${pad}`);
    }
    parseUrl(url) {
        let urlobj = {
            url,
            novel_pid: null,
            novel_id: null,
            chapter_id: null,
        };
        //url = url.toString();
        try {
            // @ts-ignore
            urlobj.url = new jsdom_url_1.URL(url);
            // @ts-ignore
            url = urlobj.url.href;
        }
        catch (e) {
            console.warn(e.toString() + ` "${url}"`);
        }
        if (typeof url != 'string') {
            // @ts-ignore
            throw new TypeError(url);
        }
        let r;
        let m;
        r = /^(\d{6,})$/;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        r = /novelba\.com\/works\/(\d+)(?:\/(?:episodes\/(\d+)))?/g;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            urlobj.chapter_id = m[2];
            return urlobj;
        }
        return urlobj;
    }
    _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        try {
            let html = util_1.minifyHTML(ret.dom.$('.episode_box').html());
            ret.dom.$('.episode_box').html(html);
        }
        catch (e) {
        }
        return ret.dom.$('.episode_section .episode_box .detail')
            .html(function (index, old) {
            return old.replace(/(?<=\<br\>)\r?\n?/ig, '\n');
        })
            .text()
            .replace(/^\s+|\s+$/g, '');
        ;
    }
    async get_volume_list(url, optionsRuntime = {}) {
        const self = this;
        url = await this.createMainUrl(url, optionsRuntime);
        return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            $('.work_section .summary_box a.more').click();
            try {
                let html = util_1.minifyHTML(dom.$('.summary_box .detail').html());
                dom.$('.summary_box .detail').html(html);
            }
            catch (e) {
            }
            let novel_title = dom.$('.work_section .info_list .title').text();
            let novel_author = dom.$('.work_section .info_list .author a').text();
            let novel_desc;
            novel_desc = $('.work_section .summary_box .detail')
                .text()
                .replace(/^[ \xa0]+/gm, '')
                .replace(/[ \t　\xa0]+$/gm, '')
                .replace(/\s+$/g, '');
            let novel_publisher = self.IDKEY;
            let url_data = self.parseUrl(dom.url.href);
            let volume_list = [];
            const novelTree = optionsRuntime.novelTree;
            let currentVolume;
            let table = dom.$('.episode_box').find('.episode_list > li');
            let _cache_dates = [];
            let total_idx = 0;
            table
                .each(function (index) {
                // @ts-ignore
                let tr = dom.$(this);
                if (1) {
                    if (!currentVolume) {
                        /*
                        currentVolume = volume_list[volume_list.length] = {
                            volume_index: volume_list.length,
                            volume_title: 'null',
                            chapter_list: [],
                        };
                        */
                        let volume_title = 'null';
                        let volume_level = null;
                        currentVolume = novelTree.addVolume({
                            volume_title,
                            volume_level,
                            volume_index: novelTree.root().size(),
                            total_idx: total_idx++,
                        });
                    }
                    let a = tr.find('a:eq(0)');
                    let chapter_date;
                    let dd;
                    let da = a.find('.update');
                    if (da.length) {
                        dd = da.find('time').text();
                        da.remove();
                    }
                    if (dd) {
                        chapter_date = index_2.moment(dd, ['YYYY/MM/DD']).local();
                        _cache_dates.push(chapter_date.unix());
                    }
                    let chapter_title = util_1.trim(a.text(), true);
                    let href = a.prop('href');
                    let data = self.parseUrl(href);
                    if (!data.chapter_id) {
                        throw new Error();
                    }
                    else {
                        href = self.makeUrl(data);
                        data.url = href;
                    }
                    let chapter = {
                        chapter_title,
                        chapter_id: data.chapter_id,
                        chapter_url: href,
                        chapter_url_data: data,
                        chapter_date,
                        chapter_index: currentVolume.size(),
                        total_idx: total_idx++,
                    };
                    novelTree.addChapter(chapter, currentVolume);
                }
            });
            _cache_dates.sort();
            let novel_date = index_2.moment.unix(_cache_dates[_cache_dates.length - 1]).local();
            let data_meta = {};
            {
                data_meta.novel = {};
                data_meta.novel.tags = [];
                $('.work_section .keyword_list a')
                    .each(function () {
                    // @ts-ignore
                    let t = $(this).text().replace(/^\s+|\s+$/g, '');
                    if (t) {
                        data_meta.novel.tags.push(t);
                    }
                });
            }
            return Object.assign(Object.assign({}, data_meta), { url: dom.url, url_data,
                novel_title,
                novel_author,
                novel_desc,
                novel_date,
                novel_publisher,
                //volume_list,
                novelTree, checkdate: index_2.moment().local(), imgs: [] });
        });
    }
};
NovelSiteNovelba.IDKEY = 'novelba';
NovelSiteNovelba = __decorate([
    index_1.staticImplements()
], NovelSiteNovelba);
exports.NovelSiteNovelba = NovelSiteNovelba;
exports.default = NovelSiteNovelba;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQThDO0FBQzlDLHVDQUF3RjtBQU94Riw2Q0FBK0Q7QUFFL0QseUNBQWdDO0FBRWhDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFHbEMsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBaUIsU0FBUSxjQUFhO0lBSWxELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBdUMsRUFBRSxPQUFRO1FBRTdELGFBQWE7UUFDYixPQUFPLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxlQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRCxPQUFPLENBQUMsTUFBMkIsRUFBRSxJQUFlO1FBRW5ELElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRS9FLGFBQWE7UUFDYixPQUFPLElBQUksZUFBRyxDQUFDLDZCQUE2QixNQUFNLENBQUMsUUFBUSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUVELFFBQVEsQ0FBQyxHQUFpQjtRQUV6QixJQUFJLE1BQU0sR0FBRztZQUNaLEdBQUc7WUFFSCxTQUFTLEVBQUUsSUFBSTtZQUNmLFFBQVEsRUFBRSxJQUFJO1lBQ2QsVUFBVSxFQUFFLElBQUk7U0FFaEIsQ0FBQztRQUVGLHVCQUF1QjtRQUV2QixJQUNBO1lBQ0MsYUFBYTtZQUNiLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxlQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUIsYUFBYTtZQUNiLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FB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O2dCQUNWLFVBQVU7Z0JBQ1YsZUFBZTtnQkFFZixjQUFjO2dCQUNkLFNBQVMsRUFFVCxTQUFTLEVBQUUsY0FBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBRTNCLElBQUksRUFBRSxFQUFjLEdBQ1YsQ0FBQztRQUNiLENBQUMsQ0FBQyxDQUNEO0lBQ0gsQ0FBQztDQUVELENBQUE7QUF2UnVCLHNCQUFLLEdBQUcsU0FBUyxDQUFDO0FBRjdCLGdCQUFnQjtJQUQ1Qix3QkFBZ0IsRUFBZ0Q7R0FDcEQsZ0JBQWdCLENBeVI1QjtBQXpSWSw0Q0FBZ0I7QUEyUjdCLGtCQUFlLGdCQUFnQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzE3LzAxNy5cbiAqL1xuXG5pbXBvcnQgeyBtaW5pZnlIVE1MLCB0cmltIH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgTm92ZWxTaXRlRGVtbywgeyBJRG93bmxvYWRPcHRpb25zLCBJTm92ZWwsIElPcHRpb25zUnVudGltZSB9IGZyb20gJy4uL2RlbW8vdHJlZSc7XG5pbXBvcnQgeyBJUm93Vm9sdW1lLCBUcmVlTm9kZSB9IGZyb20gJy4uLy4uL3RyZWUvaW5kZXgnO1xuXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYvdXRpbCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3VwYXRoMic7XG5pbXBvcnQgbm92ZWxJbmZvLCB7IElNZGNvbmZNZXRhIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuXG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuXG5pbXBvcnQgTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIGRlZmF1bHRKU0RPTU9wdGlvbnMsIFNZTUJPTF9DQUNIRSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5cbkBzdGF0aWNJbXBsZW1lbnRzPE5vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZU5vdmVsYmE+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlTm92ZWxiYSBleHRlbmRzIE5vdmVsU2l0ZURlbW9cbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWSA9ICdub3ZlbGJhJztcblxuXHRzdGF0aWMgY2hlY2sodXJsOiBzdHJpbmcgfCBVUkwgfCBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBvcHRpb25zPyk6IGJvb2xlYW5cblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gL25vdmVsYmFcXC5jb20vaS50ZXN0KG5ldyBVUkwodXJsKS5ob3N0bmFtZSB8fCAnJyk7XG5cdH1cblxuXHRtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbCA/OiBib29sZWFuKTogVVJMXG5cdHtcblx0XHRsZXQgcGFkID0gKCFib29sICYmIHVybG9iai5jaGFwdGVyX2lkKSA/ICcvZXBpc29kZXMvJyArIHVybG9iai5jaGFwdGVyX2lkIDogJyc7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG5ldyBVUkwoYGh0dHBzOi8vbm92ZWxiYS5jb20vd29ya3MvJHt1cmxvYmoubm92ZWxfaWR9JHtwYWR9YCk7XG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IHN0cmluZyB8IFVSTCk6IE5vdmVsU2l0ZS5JUGFyc2VVcmxcblx0e1xuXHRcdGxldCB1cmxvYmogPSB7XG5cdFx0XHR1cmwsXG5cblx0XHRcdG5vdmVsX3BpZDogbnVsbCxcblx0XHRcdG5vdmVsX2lkOiBudWxsLFxuXHRcdFx0Y2hhcHRlcl9pZDogbnVsbCxcblxuXHRcdH07XG5cblx0XHQvL3VybCA9IHVybC50b1N0cmluZygpO1xuXG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0dXJsb2JqLnVybCA9IG5ldyBVUkwodXJsKTtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHVybCA9IHVybG9iai51cmwuaHJlZjtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS53YXJuKGUudG9TdHJpbmcoKSArIGAgXCIke3VybH1cImApO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgdXJsICE9ICdzdHJpbmcnKVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IodXJsKTtcblx0XHR9XG5cblx0XHRsZXQgcjogUmVnRXhwO1xuXHRcdGxldCBtO1xuXG5cdFx0ciA9IC9eKFxcZHs2LH0pJC87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyID0gL25vdmVsYmFcXC5jb21cXC93b3Jrc1xcLyhcXGQrKSg/OlxcLyg/OmVwaXNvZGVzXFwvKFxcZCspKSk/L2c7XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdFx0dXJsb2JqLmNoYXB0ZXJfaWQgPSBtWzJdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHJldHVybiB1cmxvYmo7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihyZXQsIG9wdGlvbnNSdW50aW1lLCBjYWNoZSk6IHN0cmluZ1xuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdGxldCBodG1sID0gbWluaWZ5SFRNTChyZXQuZG9tLiQoJy5lcGlzb2RlX2JveCcpLmh0bWwoKSk7XG5cblx0XHRcdHJldC5kb20uJCgnLmVwaXNvZGVfYm94JykuaHRtbChodG1sKTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldC5kb20uJCgnLmVwaXNvZGVfc2VjdGlvbiAuZXBpc29kZV9ib3ggLmRldGFpbCcpXG5cdFx0XHQuaHRtbChmdW5jdGlvbiAoaW5kZXgsIG9sZClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIG9sZC5yZXBsYWNlKC8oPzw9XFw8YnJcXD4pXFxyP1xcbj8vaWcsICdcXG4nKVxuXHRcdFx0fSlcblx0XHRcdC50ZXh0KClcblx0XHRcdC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcblx0XHRcdDtcblx0XHQ7XG5cdH1cblxuXHRhc3luYyBnZXRfdm9sdW1lX2xpc3Q8VCBleHRlbmRzIElPcHRpb25zUnVudGltZT4odXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge30sXG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHR1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwodXJsIGFzIGFueSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHQkKCcud29ya19zZWN0aW9uIC5zdW1tYXJ5X2JveCBhLm1vcmUnKS5jbGljaygpO1xuXG5cdFx0XHRcdHRyeVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IGh0bWwgPSBtaW5pZnlIVE1MKGRvbS4kKCcuc3VtbWFyeV9ib3ggLmRldGFpbCcpLmh0bWwoKSk7XG5cblx0XHRcdFx0XHRkb20uJCgnLnN1bW1hcnlfYm94IC5kZXRhaWwnKS5odG1sKGh0bWwpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhdGNoIChlKVxuXHRcdFx0XHR7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBub3ZlbF90aXRsZSA9IGRvbS4kKCcud29ya19zZWN0aW9uIC5pbmZvX2xpc3QgLnRpdGxlJykudGV4dCgpO1xuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yID0gZG9tLiQoJy53b3JrX3NlY3Rpb24gLmluZm9fbGlzdCAuYXV0aG9yIGEnKS50ZXh0KCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2Rlc2M6IHN0cmluZztcblxuXHRcdFx0XHRub3ZlbF9kZXNjID0gJCgnLndvcmtfc2VjdGlvbiAuc3VtbWFyeV9ib3ggLmRldGFpbCcpXG5cdFx0XHRcdFx0LnRleHQoKVxuXHRcdFx0XHRcdC5yZXBsYWNlKC9eWyBcXHhhMF0rL2dtLCAnJylcblx0XHRcdFx0XHQucmVwbGFjZSgvWyBcXHTjgIBcXHhhMF0rJC9nbSwgJycpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1xccyskL2csICcnKVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3B1Ymxpc2hlciA9IHNlbGYuSURLRVk7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybChkb20udXJsLmhyZWYpO1xuXG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIE5vdmVsU2l0ZS5JVm9sdW1lW107XG5cblx0XHRcdFx0Y29uc3Qgbm92ZWxUcmVlID0gb3B0aW9uc1J1bnRpbWUubm92ZWxUcmVlO1xuXHRcdFx0XHRsZXQgY3VycmVudFZvbHVtZTogVHJlZU5vZGU8SVJvd1ZvbHVtZT47XG5cblx0XHRcdFx0bGV0IHRhYmxlID0gZG9tLiQoJy5lcGlzb2RlX2JveCcpLmZpbmQoJy5lcGlzb2RlX2xpc3QgPiBsaScpO1xuXG5cdFx0XHRcdGxldCBfY2FjaGVfZGF0ZXMgPSBbXTtcblxuXHRcdFx0XHRsZXQgdG90YWxfaWR4ID0gMDtcblxuXHRcdFx0XHR0YWJsZVxuXHRcdFx0XHRcdC5lYWNoKGZ1bmN0aW9uIChpbmRleClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRsZXQgdHIgPSBkb20uJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0aWYgKDEpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmICghY3VycmVudFZvbHVtZSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IHZvbHVtZV9saXN0W3ZvbHVtZV9saXN0Lmxlbmd0aF0gPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IHZvbHVtZV9saXN0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZTogJ251bGwnLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9saXN0OiBbXSxcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdCovXG5cblx0XHRcdFx0XHRcdFx0XHRsZXQgdm9sdW1lX3RpdGxlID0gJ251bGwnO1xuXHRcdFx0XHRcdFx0XHRcdGxldCB2b2x1bWVfbGV2ZWwgPSBudWxsO1xuXG5cdFx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IG5vdmVsVHJlZS5hZGRWb2x1bWUoe1xuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2xldmVsLFxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiBub3ZlbFRyZWUucm9vdCgpLnNpemUoKSxcblx0XHRcdFx0XHRcdFx0XHRcdHRvdGFsX2lkeDogdG90YWxfaWR4KyssXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgYSA9IHRyLmZpbmQoJ2E6ZXEoMCknKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl9kYXRlO1xuXHRcdFx0XHRcdFx0XHRsZXQgZGQ7XG5cdFx0XHRcdFx0XHRcdGxldCBkYSA9IGEuZmluZCgnLnVwZGF0ZScpO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChkYS5sZW5ndGgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkZCA9IGRhLmZpbmQoJ3RpbWUnKS50ZXh0KCk7XG5cblx0XHRcdFx0XHRcdFx0XHRkYS5yZW1vdmUoKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChkZClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfZGF0ZSA9IG1vbWVudChkZCwgWydZWVlZL01NL0REJ10pLmxvY2FsKCk7XG5cdFx0XHRcdFx0XHRcdFx0X2NhY2hlX2RhdGVzLnB1c2goY2hhcHRlcl9kYXRlLnVuaXgoKSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl90aXRsZSA9IHRyaW0oYS50ZXh0KCksIHRydWUpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBocmVmID0gYS5wcm9wKCdocmVmJyk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGRhdGEgPSBzZWxmLnBhcnNlVXJsKGhyZWYpO1xuXG5cdFx0XHRcdFx0XHRcdGlmICghZGF0YS5jaGFwdGVyX2lkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRocmVmID0gc2VsZi5tYWtlVXJsKGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS51cmwgPSBocmVmO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXIgPSB7XG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmw6IGhyZWYsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmxfZGF0YTogZGF0YSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2RhdGUsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogY3VycmVudFZvbHVtZS5zaXplKCksXG5cdFx0XHRcdFx0XHRcdFx0dG90YWxfaWR4OiB0b3RhbF9pZHgrKyxcblx0XHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0XHRub3ZlbFRyZWUuYWRkQ2hhcHRlcihjaGFwdGVyLCBjdXJyZW50Vm9sdW1lKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRfY2FjaGVfZGF0ZXMuc29ydCgpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kYXRlID0gbW9tZW50LnVuaXgoX2NhY2hlX2RhdGVzW19jYWNoZV9kYXRlcy5sZW5ndGggLSAxXSkubG9jYWwoKTtcblxuXHRcdFx0XHRsZXQgZGF0YV9tZXRhOiBJTWRjb25mTWV0YSA9IHt9O1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwgPSB7fTtcblx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncyA9IFtdO1xuXG5cdFx0XHRcdFx0JCgnLndvcmtfc2VjdGlvbiAua2V5d29yZF9saXN0IGEnKVxuXHRcdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRsZXQgdCA9ICQodGhpcykudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcblx0XHRcdFx0XHRcdFx0aWYgKHQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncy5wdXNoKHQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiB7XG5cblx0XHRcdFx0XHQuLi5kYXRhX21ldGEsXG5cblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcblx0XHRcdFx0XHRub3ZlbF9hdXRob3IsXG5cblx0XHRcdFx0XHRub3ZlbF9kZXNjLFxuXHRcdFx0XHRcdG5vdmVsX2RhdGUsXG5cdFx0XHRcdFx0bm92ZWxfcHVibGlzaGVyLFxuXG5cdFx0XHRcdFx0Ly92b2x1bWVfbGlzdCxcblx0XHRcdFx0XHRub3ZlbFRyZWUsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlTm92ZWxiYTtcbiJdfQ==