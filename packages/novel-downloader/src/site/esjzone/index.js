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
let NovelSiteESJZone = class NovelSiteESJZone extends tree_1.default {
    static check(url, options) {
        return /esjzone\.cc/i.test(new jsdom_url_1.URL(url).hostname || '');
    }
    makeUrl(urlobj, bool) {
        let pad;
        if (!bool && urlobj.chapter_id) {
            pad = `forum/${urlobj.novel_id}/${urlobj.chapter_id}.html`;
        }
        else {
            pad = `detail/${urlobj.novel_id}.html`;
        }
        // @ts-ignore
        return new jsdom_url_1.URL(`https://www.esjzone.cc/${pad}`);
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
        r = /esjzone\.cc\/forum\/(\d+)(?:\.html|\/(\d+).html)/g;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            urlobj.chapter_id = m[2];
            return urlobj;
        }
        r = /esjzone\.cc\/detail\/(\d+)(?:\.html)?/g;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            return urlobj;
        }
        return urlobj;
    }
    _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        try {
            let html = util_1.minifyHTML(ret.dom.$('.container .row:has(.forum-content)').html());
            ret.dom.$('.container .row:has(.forum-content)').html(html);
        }
        catch (e) {
        }
        ret.dom.$('p[class]:has(> script), .adsbygoogle').remove();
        _p_2_br('.forum-content > p', ret.dom.$);
        let elem = ret.dom.$('.container .forum-content');
        elem.html(function (i, old) {
            return old
                .replace(/(\<br\>){3,4}/g, '$1')
                .replace(/(?<=\<br\>)(?=[^\n])/g, '\n');
        });
        let title = util_1.trim(ret.dom.$('.container .row > div > h3').text());
        let txt = elem
            .text()
            .replace(/^由於百度 2017 年以前的貼文都刪了|所以不清楚是由哪位大佬翻譯|若轉載的動作冒犯了您，先跟您說聲抱歉！|也麻煩留言告知，我們會將此文下架|由譯者授權轉載！|原文網址：[^\n]+$/uigm, '')
            .replace(/^\s+|\s+$/g, '');
        if (txt.indexOf(title + '\n') === 0) {
            txt = txt.slice(title.length + 1)
                .replace(/^\n+/g, '');
        }
        let html = elem.html();
        //		throw console.dir({
        //			html,
        //			txt,
        //		});
        return txt;
    }
    async get_volume_list(url, optionsRuntime = {}) {
        const self = this;
        url = await this.createMainUrl(url);
        return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            try {
                let html = util_1.minifyHTML(dom.$('.product-detail').html());
                dom.$('.product-detail').html(html);
            }
            catch (e) {
            }
            let novel_title = dom.$('.container .row > div > h3').text();
            let novel_publisher = self.IDKEY;
            let url_data = self.parseUrl(dom.url.href);
            let volume_list = [];
            const novelTree = optionsRuntime.novelTree;
            let currentVolume;
            let table = dom.$('.product-detail .tabbable .tab-content.show-desc').find('a');
            let _cache_dates = [];
            let total_idx = 0;
            {
                let volume_title = 'null';
                let volume_level = null;
                currentVolume = novelTree.addVolume({
                    volume_title,
                    volume_level,
                    volume_index: novelTree.root().size(),
                    total_idx: total_idx++,
                });
            }
            dom.$('p[class]:has(> script[src*=google]), div[class]:has(> script[src*=google]), .adsbygoogle').remove();
            table
                .each(function (index) {
                let tr = dom.$(this);
                if (1) {
                    let a = tr;
                    let chapter_title = util_1.trim(a.text(), true);
                    let href = a.prop('href');
                    let data = self.parseUrl(href);
                    if (!data.chapter_id) {
                        return;
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
                        chapter_index: currentVolume.size(),
                        total_idx: total_idx++,
                    };
                    novelTree.addChapter(chapter, currentVolume);
                }
            });
            let data_meta = {};
            return Object.assign({}, data_meta, { url: dom.url, url_data,
                novel_title,
                novel_publisher,
                //volume_list,
                novelTree, checkdate: index_2.moment().local(), imgs: [] });
        });
    }
};
NovelSiteESJZone.IDKEY = 'esjzone';
NovelSiteESJZone = __decorate([
    index_1.staticImplements()
], NovelSiteESJZone);
exports.NovelSiteESJZone = NovelSiteESJZone;
exports.default = NovelSiteESJZone;
function _p_2_br(target, $) {
    return $(target)
        .each(function () {
        let _this = $(this);
        let _html = _this
            .html()
            .replace(/(?:&nbsp;?)/g, ' ')
            .replace(/[\xA0\s]+$/g, '');
        if (_html == '<br/>' || _html == '<br>') {
            _html = '';
        }
        _this.after(`${_html}<br/>`);
        _this.remove();
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQThDO0FBQzlDLHVDQUF3RjtBQU94Riw2Q0FBK0Q7QUFFL0QseUNBQWdDO0FBRWhDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFHbEMsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBaUIsU0FBUSxjQUFhO0lBSWxELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBdUMsRUFBRSxPQUFRO1FBRTdELE9BQU8sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGVBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELE9BQU8sQ0FBQyxNQUEyQixFQUFFLElBQWU7UUFFbkQsSUFBSSxHQUFXLENBQUM7UUFFaEIsSUFBSSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsVUFBVSxFQUM5QjtZQUNDLEdBQUcsR0FBRyxTQUFTLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLFVBQVUsT0FBTyxDQUFBO1NBQzFEO2FBRUQ7WUFDQyxHQUFHLEdBQUcsVUFBVSxNQUFNLENBQUMsUUFBUSxPQUFPLENBQUE7U0FDdEM7UUFFRCxhQUFhO1FBQ2IsT0FBTyxJQUFJLGVBQUcsQ0FBQywwQkFBMEIsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQsUUFBUSxDQUFDLEdBQWlCO1FBRXpCLElBQUksTUFBTSxHQUFHO1lBQ1osR0FBRztZQUVILFNBQVMsRUFBRSxJQUFJO1lBQ2YsUUFBUSxFQUFFLElBQUk7WUFDZCxVQUFVLEVBQUUsSUFBSTtTQUVoQixDQUFDO1FBRUYsdUJBQXVCO1FBRXZCLElBQ0E7WUFDQyxhQUFhO1lBQ2IsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLGVBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQixhQUFhO1lBQ2Is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LGNBQWMsRUFBRSxHQUFHLENBQUM7YUFDNUIsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FDM0I7UUFFRCxJQUFJLEtBQUssSUFBSSxPQUFPLElBQUksS0FBSyxJQUFJLE1BQU0sRUFDdkM7WUFDQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1NBQ1g7UUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxPQUFPLENBQUMsQ0FBQztRQUM3QixLQUFLLENBQUMsTUFBTSxFQUFFLENBQUE7SUFDZixDQUFDLENBQUMsQ0FDRDtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzMvMTcvMDE3LlxuICovXG5cbmltcG9ydCB7IG1pbmlmeUhUTUwsIHRyaW0gfSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCBOb3ZlbFNpdGVEZW1vLCB7IElEb3dubG9hZE9wdGlvbnMsIElOb3ZlbCwgSU9wdGlvbnNSdW50aW1lIH0gZnJvbSAnLi4vZGVtby90cmVlJztcbmltcG9ydCB7IElSb3dWb2x1bWUsIFRyZWVOb2RlIH0gZnJvbSAnLi4vLi4vdHJlZS9pbmRleCc7XG5cbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyB0cmltRmlsZW5hbWUgfSBmcm9tICdmcy1pY29udi91dGlsJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgbm92ZWxJbmZvLCB7IElNZGNvbmZNZXRhIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuXG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS11cmwnO1xuXG5pbXBvcnQgTm92ZWxTaXRlLCB7IHN0YXRpY0ltcGxlbWVudHMsIGRlZmF1bHRKU0RPTU9wdGlvbnMsIFNZTUJPTF9DQUNIRSB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IFByb21pc2VCbHVlYmlyZCwgYmx1ZWJpcmREZWNvcmF0b3IgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBtb21lbnQgfSBmcm9tICcuLi9pbmRleCc7XG5cbkBzdGF0aWNJbXBsZW1lbnRzPE5vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZUVTSlpvbmU+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlRVNKWm9uZSBleHRlbmRzIE5vdmVsU2l0ZURlbW9cbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWSA9ICdlc2p6b25lJztcblxuXHRzdGF0aWMgY2hlY2sodXJsOiBzdHJpbmcgfCBVUkwgfCBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBvcHRpb25zPyk6IGJvb2xlYW5cblx0e1xuXHRcdHJldHVybiAvZXNqem9uZVxcLmNjL2kudGVzdChuZXcgVVJMKHVybCkuaG9zdG5hbWUgfHwgJycpO1xuXHR9XG5cblx0bWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2wgPzogYm9vbGVhbik6IFVSTFxuXHR7XG5cdFx0bGV0IHBhZDogc3RyaW5nO1xuXG5cdFx0aWYgKCFib29sICYmIHVybG9iai5jaGFwdGVyX2lkKVxuXHRcdHtcblx0XHRcdHBhZCA9IGBmb3J1bS8ke3VybG9iai5ub3ZlbF9pZH0vJHt1cmxvYmouY2hhcHRlcl9pZH0uaHRtbGBcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHBhZCA9IGBkZXRhaWwvJHt1cmxvYmoubm92ZWxfaWR9Lmh0bWxgXG5cdFx0fVxuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBuZXcgVVJMKGBodHRwczovL3d3dy5lc2p6b25lLmNjLyR7cGFkfWApO1xuXHR9XG5cblx0cGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwpOiBOb3ZlbFNpdGUuSVBhcnNlVXJsXG5cdHtcblx0XHRsZXQgdXJsb2JqID0ge1xuXHRcdFx0dXJsLFxuXG5cdFx0XHRub3ZlbF9waWQ6IG51bGwsXG5cdFx0XHRub3ZlbF9pZDogbnVsbCxcblx0XHRcdGNoYXB0ZXJfaWQ6IG51bGwsXG5cblx0XHR9O1xuXG5cdFx0Ly91cmwgPSB1cmwudG9TdHJpbmcoKTtcblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHVybG9iai51cmwgPSBuZXcgVVJMKHVybCk7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR1cmwgPSB1cmxvYmoudXJsLmhyZWY7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUud2FybihlLnRvU3RyaW5nKCkgKyBgIFwiJHt1cmx9XCJgKTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIHVybCAhPSAnc3RyaW5nJylcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKHVybCk7XG5cdFx0fVxuXG5cdFx0bGV0IHI6IFJlZ0V4cDtcblx0XHRsZXQgbTtcblxuXHRcdHIgPSAvXihcXGR7Nix9KSQvO1xuXHRcdGlmIChtID0gci5leGVjKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHRcdHJldHVybiB1cmxvYmo7XG5cdFx0fVxuXG5cdFx0ciA9IC9lc2p6b25lXFwuY2NcXC9mb3J1bVxcLyhcXGQrKSg/OlxcLmh0bWx8XFwvKFxcZCspLmh0bWwpL2c7XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdFx0dXJsb2JqLmNoYXB0ZXJfaWQgPSBtWzJdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvZXNqem9uZVxcLmNjXFwvZGV0YWlsXFwvKFxcZCspKD86XFwuaHRtbCk/L2c7XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHJldHVybiB1cmxvYmo7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihyZXQsIG9wdGlvbnNSdW50aW1lLCBjYWNoZSk6IHN0cmluZ1xuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdGxldCBodG1sID0gbWluaWZ5SFRNTChyZXQuZG9tLiQoJy5jb250YWluZXIgLnJvdzpoYXMoLmZvcnVtLWNvbnRlbnQpJykuaHRtbCgpKTtcblxuXHRcdFx0cmV0LmRvbS4kKCcuY29udGFpbmVyIC5yb3c6aGFzKC5mb3J1bS1jb250ZW50KScpLmh0bWwoaHRtbCk7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblxuXHRcdH1cblxuXHRcdHJldC5kb20uJCgncFtjbGFzc106aGFzKD4gc2NyaXB0KSwgLmFkc2J5Z29vZ2xlJykucmVtb3ZlKCk7XG5cblx0XHRfcF8yX2JyKCcuZm9ydW0tY29udGVudCA+IHAnLCByZXQuZG9tLiQpO1xuXG5cdFx0bGV0IGVsZW0gPSByZXQuZG9tLiQoJy5jb250YWluZXIgLmZvcnVtLWNvbnRlbnQnKTtcblxuXHRcdGVsZW0uaHRtbChmdW5jdGlvbiAoaSwgb2xkOiBzdHJpbmcpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIG9sZFxuXHRcdFx0XHQucmVwbGFjZSgvKFxcPGJyXFw+KXszLDR9L2csICckMScpXG5cdFx0XHRcdC5yZXBsYWNlKC8oPzw9XFw8YnJcXD4pKD89W15cXG5dKS9nLCAnXFxuJylcblx0XHR9KTtcblxuXHRcdGxldCB0aXRsZSA9IHRyaW0ocmV0LmRvbS4kKCcuY29udGFpbmVyIC5yb3cgPiBkaXYgPiBoMycpLnRleHQoKSk7XG5cblx0XHRsZXQgdHh0OiBzdHJpbmcgPSBlbGVtXG5cdFx0XHQudGV4dCgpXG5cdFx0XHQucmVwbGFjZSgvXueUseaWvOeZvuW6piAyMDE3IOW5tOS7peWJjeeahOiyvOaWh+mDveWIquS6hnzmiYDku6XkuI3muIXmpZrmmK/nlLHlk6rkvY3lpKfkvaznv7vora986Iul6L2J6LyJ55qE5YuV5L2c5YaS54qv5LqG5oKo77yM5YWI6Lef5oKo6Kqq6IGy5oqx5q2J77yBfOS5n+m6u+eFqeeVmeiogOWRiuefpe+8jOaIkeWAkeacg+Wwh+atpOaWh+S4i+aetnznlLHora/ogIXmjojmrIrovYnovInvvIF85Y6f5paH57ay5Z2A77yaW15cXG5dKyQvdWlnbSwgJycpXG5cdFx0XHQucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG5cdFx0O1xuXG5cdFx0aWYgKHR4dC5pbmRleE9mKHRpdGxlICsgJ1xcbicpID09PSAwKVxuXHRcdHtcblx0XHRcdHR4dCA9IHR4dC5zbGljZSh0aXRsZS5sZW5ndGggKyAxKVxuXHRcdFx0XHQucmVwbGFjZSgvXlxcbisvZywgJycpXG5cdFx0XHQ7XG5cdFx0fVxuXG5cdFx0bGV0IGh0bWwgPSBlbGVtLmh0bWwoKTtcblxuLy9cdFx0dGhyb3cgY29uc29sZS5kaXIoe1xuLy9cdFx0XHRodG1sLFxuLy9cdFx0XHR0eHQsXG4vL1x0XHR9KTtcblxuXHRcdHJldHVybiB0eHRcblx0fVxuXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUIGV4dGVuZHMgSU9wdGlvbnNSdW50aW1lPih1cmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fSxcblx0KTogUHJvbWlzZTxJTm92ZWw+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybCh1cmwgYXMgYW55KTtcblxuXHRcdHJldHVybiBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKGRvbTogSUpTRE9NKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCAkID0gZG9tLiQ7XG5cblx0XHRcdFx0dHJ5XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgaHRtbCA9IG1pbmlmeUhUTUwoZG9tLiQoJy5wcm9kdWN0LWRldGFpbCcpLmh0bWwoKSk7XG5cblx0XHRcdFx0XHRkb20uJCgnLnByb2R1Y3QtZGV0YWlsJykuaHRtbChodG1sKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXRjaCAoZSlcblx0XHRcdFx0e1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgbm92ZWxfdGl0bGUgPSBkb20uJCgnLmNvbnRhaW5lciAucm93ID4gZGl2ID4gaDMnKS50ZXh0KCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3B1Ymxpc2hlciA9IHNlbGYuSURLRVk7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybChkb20udXJsLmhyZWYpO1xuXG5cdFx0XHRcdGxldCB2b2x1bWVfbGlzdCA9IFtdIGFzIE5vdmVsU2l0ZS5JVm9sdW1lW107XG5cblx0XHRcdFx0Y29uc3Qgbm92ZWxUcmVlID0gb3B0aW9uc1J1bnRpbWUubm92ZWxUcmVlO1xuXHRcdFx0XHRsZXQgY3VycmVudFZvbHVtZTogVHJlZU5vZGU8SVJvd1ZvbHVtZT47XG5cblx0XHRcdFx0bGV0IHRhYmxlID0gZG9tLiQoJy5wcm9kdWN0LWRldGFpbCAudGFiYmFibGUgLnRhYi1jb250ZW50LnNob3ctZGVzYycpLmZpbmQoJ2EnKTtcblxuXHRcdFx0XHRsZXQgX2NhY2hlX2RhdGVzID0gW107XG5cblx0XHRcdFx0bGV0IHRvdGFsX2lkeCA9IDA7XG5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB2b2x1bWVfdGl0bGUgPSAnbnVsbCc7XG5cdFx0XHRcdFx0bGV0IHZvbHVtZV9sZXZlbCA9IG51bGw7XG5cblx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gbm92ZWxUcmVlLmFkZFZvbHVtZSh7XG5cdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGUsXG5cdFx0XHRcdFx0XHR2b2x1bWVfbGV2ZWwsXG5cdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IG5vdmVsVHJlZS5yb290KCkuc2l6ZSgpLFxuXHRcdFx0XHRcdFx0dG90YWxfaWR4OiB0b3RhbF9pZHgrKyxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRvbS4kKCdwW2NsYXNzXTpoYXMoPiBzY3JpcHRbc3JjKj1nb29nbGVdKSwgZGl2W2NsYXNzXTpoYXMoPiBzY3JpcHRbc3JjKj1nb29nbGVdKSwgLmFkc2J5Z29vZ2xlJykucmVtb3ZlKCk7XG5cblx0XHRcdFx0dGFibGVcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IHRyID0gZG9tLiQodGhpcyk7XG5cblx0XHRcdFx0XHRcdGlmICgxKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgYSA9IHRyO1xuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl90aXRsZSA9IHRyaW0oYS50ZXh0KCksIHRydWUpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBocmVmID0gYS5wcm9wKCdocmVmJyk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGRhdGEgPSBzZWxmLnBhcnNlVXJsKGhyZWYpO1xuXG5cdFx0XHRcdFx0XHRcdGlmICghZGF0YS5jaGFwdGVyX2lkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGhyZWYgPSBzZWxmLm1ha2VVcmwoZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHRkYXRhLnVybCA9IGhyZWY7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlciA9IHtcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybDogaHJlZixcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhOiBkYXRhLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaW5kZXg6IGN1cnJlbnRWb2x1bWUuc2l6ZSgpLFxuXHRcdFx0XHRcdFx0XHRcdHRvdGFsX2lkeDogdG90YWxfaWR4KyssXG5cdFx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdFx0bm92ZWxUcmVlLmFkZENoYXB0ZXIoY2hhcHRlciwgY3VycmVudFZvbHVtZSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IGRhdGFfbWV0YTogSU1kY29uZk1ldGEgPSB7fTtcblxuXHRcdFx0XHRyZXR1cm4ge1xuXG5cdFx0XHRcdFx0Li4uZGF0YV9tZXRhLFxuXG5cdFx0XHRcdFx0dXJsOiBkb20udXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0bm92ZWxfdGl0bGUsXG5cdFx0XHRcdFx0bm92ZWxfcHVibGlzaGVyLFxuXG5cdFx0XHRcdFx0Ly92b2x1bWVfbGlzdCxcblx0XHRcdFx0XHRub3ZlbFRyZWUsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlRVNKWm9uZTtcblxuZnVuY3Rpb24gX3BfMl9icih0YXJnZXQsICQpXG57XG5cdHJldHVybiAkKHRhcmdldClcblx0XHQuZWFjaChmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdGxldCBfdGhpcyA9ICQodGhpcyk7XG5cblx0XHRcdGxldCBfaHRtbCA9IF90aGlzXG5cdFx0XHRcdC5odG1sKClcblx0XHRcdFx0LnJlcGxhY2UoLyg/OiZuYnNwOz8pL2csICcgJylcblx0XHRcdFx0LnJlcGxhY2UoL1tcXHhBMFxcc10rJC9nLCAnJylcblx0XHRcdDtcblxuXHRcdFx0aWYgKF9odG1sID09ICc8YnIvPicgfHwgX2h0bWwgPT0gJzxicj4nKVxuXHRcdFx0e1xuXHRcdFx0XHRfaHRtbCA9ICcnO1xuXHRcdFx0fVxuXG5cdFx0XHRfdGhpcy5hZnRlcihgJHtfaHRtbH08YnIvPmApO1xuXHRcdFx0X3RoaXMucmVtb3ZlKClcblx0XHR9KVxuXHRcdDtcbn0iXX0=