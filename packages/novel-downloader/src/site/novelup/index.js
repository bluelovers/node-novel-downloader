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
    /*
    protected _fixOptionsRuntime(optionsRuntime)
    {
        optionsRuntime.optionsJSDOM = optionsRuntime.optionsJSDOM || {};

        //optionsRuntime.optionsJSDOM.runScripts = 'dangerously';

        return super._fixOptionsRuntime(optionsRuntime)
    }
     */
    static check(url, options) {
        // @ts-ignore
        return /novelup\.plus/i.test(new jsdom_url_1.URL(url).hostname || '');
    }
    makeUrl(urlobj, bool) {
        let pad;
        pad = `story/${urlobj.novel_id}`;
        if (!bool && urlobj.chapter_id) {
            pad += `/${urlobj.chapter_id}`;
        }
        // @ts-ignore
        return new jsdom_url_1.URL(`https://novelup.plus/${pad}`);
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
        r = /novelup\.plus\/story\/(\d+)(?:\/(\d+))?/g;
        if (m = r.exec(url)) {
            urlobj.novel_id = m[1];
            urlobj.chapter_id = m[2];
            return urlobj;
        }
        console.dir(urlobj);
        return urlobj;
    }
    async _decodeChapter(ret, optionsRuntime, cache) {
        const { dom } = ret;
        const { $ } = dom;
    }
    async _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        const $ = ret.dom.$;
        let section_episode = $('#section_episode');
        try {
            //let html = minifyHTML(section_episode.html());
            //section_episode.html(html);
        }
        catch (e) {
        }
        //await this._decodeChapter(ret, optionsRuntime, cache);
        //_p_2_br(section_episode.find('.content > p'), ret.dom.$);
        let elem = section_episode.find('.content > p');
        let txt = (await elem
            .text())
            //.replace(/\x20/g, '\n')
            .replace(/^\n+|\s+$/g, '');
        //		let html = elem.html();
        /*
        let html = elem.html();

        throw console.dir({
            html,
            txt,
        });
         */
        //		console.dir(html);
        //
        //		console.dir(txt);
        //		console.dir(txt);
        //
        //		process.exit();
        return txt;
    }
    getOutputDir(options, novelName) {
        let ret = super.getOutputDir(options, novelName);
        ret[1].optionsJSDOM.minifyHTML = false;
        return ret;
    }
    async get_volume_list(url, optionsRuntime = {}) {
        const self = this;
        url = await this.createMainUrl(url, optionsRuntime);
        return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            let data_meta = {
                novel: {},
            };
            let section_works_info = $('#section_works_info');
            let novel_title = util_1.trim(section_works_info.find('.novel_title').text());
            let novel_publisher = self.IDKEY;
            let url_data = self.parseUrl(dom.url.href);
            let novel_author = util_1.trim(section_works_info.find('.novel_author').text());
            let novel_date;
            const novelTree = optionsRuntime.novelTree;
            let currentVolume;
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
            let table = $('#section_episode .episode_list ul:eq(0) > li');
            table
                .each(function (index, elem) {
                let tr = $(elem);
                if (tr.is('.chapter')) {
                    let volume_title = util_1.trim(tr.text());
                    if (volume_title != currentVolume.content.volume_title) {
                        currentVolume = novelTree.addVolume({
                            volume_title,
                            volume_index: novelTree.root().size(),
                            total_idx: total_idx++,
                        });
                    }
                }
                else {
                    let a = tr.find('.episode_link a');
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
            data_meta.novel.cover = section_works_info.find('.novel_cover img').prop('src');
            let novel_desc = util_1.trim(section_works_info.find('.novel_synopsis').text());
            data_meta.novel.tags = data_meta.novel.tags || [];
            $('#section_episode .info_table dd')
                .find(`a[href*="[tag]"], a[href*="genre[1]"]`)
                .each((i, elem) => {
                data_meta.novel.tags.push(util_1.trim($(elem).text()));
            });
            return Object.assign(Object.assign({}, data_meta), { url: dom.url, url_data,
                novel_author,
                novel_date,
                novel_desc,
                novel_title,
                novel_publisher,
                //volume_list,
                novelTree, checkdate: index_2.moment().local(), imgs: [] });
        });
    }
};
NovelSiteESJZone.IDKEY = 'novelup';
NovelSiteESJZone = __decorate([
    index_1.staticImplements()
], NovelSiteESJZone);
exports.NovelSiteESJZone = NovelSiteESJZone;
exports.default = NovelSiteESJZone;
function _p_2_br(target, $) {
    return $(target)
        .each(function (i, elem) {
        let _this = $(elem);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQThDO0FBQzlDLHVDQUF1RztBQU92Ryw2Q0FBK0Q7QUFFL0QseUNBQWdDO0FBRWhDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFJbEMsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBaUIsU0FBUSxjQUFhO0lBSWxEOzs7Ozs7Ozs7T0FTRztJQUVILE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBdUMsRUFBRSxPQUFRO1FBRTdELGFBQWE7UUFDYixPQUFPLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLGVBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVELE9BQU8sQ0FBQyxNQUEyQixFQUFFLElBQWU7UUFFbkQsSUFBSSxHQUFXLENBQUM7UUFFaEIsR0FBRyxHQUFHLFNBQVMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRWpDLElBQUksQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLFVBQVUsRUFDOUI7WUFDQyxHQUFHLElBQUksSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUE7U0FDOUI7UUFFRCxhQUFhO1FBQ2IsT0FBTyxJQUFJLGVBQUcsQ0FBQyx3QkFBd0IsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsUUFBUSxDQUFDLEdBQWlCO1FBRXpCLElBQUksTUFBTSxHQUFHO1lBQ1osR0FBRztZQUVILFNBQVMsRUFBRSxJQUFJO1lBQ2YsUUFBUSxFQUFFLElBQUk7WUFDZCxVQUFVLEVBQUUsSUFBSTtTQUVoQixDQUFDO1FBRUYsdUJBQXVCO1FBRXZCLElBQ0E7WUFDQyxhQUFhO1lBQ2IsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLGVBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQixhQUFhO1lBQ2Is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QUFFLEVBQWMsR0FDVixDQUFDO1FBQ2IsQ0FBQyxDQUFDLENBQ0Q7SUFDSCxDQUFDO0NBRUQsQ0FBQTtBQXBUdUIsc0JBQUssR0FBRyxTQUFTLENBQUM7QUFGN0IsZ0JBQWdCO0lBRDVCLHdCQUFnQixFQUFnRDtHQUNwRCxnQkFBZ0IsQ0FzVDVCO0FBdFRZLDRDQUFnQjtBQXdUN0Isa0JBQWUsZ0JBQWdCLENBQUM7QUFFaEMsU0FBUyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7SUFFekIsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDO1NBQ2QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUk7UUFFdEIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXBCLElBQUksS0FBSyxHQUFHLEtBQUs7YUFDZixJQUFJLEVBQUU7YUFDTixPQUFPLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQzthQUM1QixPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUMzQjtRQUVELElBQUksS0FBSyxJQUFJLE9BQU8sSUFBSSxLQUFLLElBQUksTUFBTSxFQUN2QztZQUNDLEtBQUssR0FBRyxFQUFFLENBQUM7U0FDWDtRQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLE9BQU8sQ0FBQyxDQUFDO1FBQzdCLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQTtJQUNmLENBQUMsQ0FBQyxDQUNEO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMy8xNy8wMTcuXG4gKi9cblxuaW1wb3J0IHsgbWluaWZ5SFRNTCwgdHJpbSB9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IE5vdmVsU2l0ZURlbW8sIHsgSURvd25sb2FkT3B0aW9ucywgSU5vdmVsLCBJT3B0aW9uc1J1bnRpbWUsIElGZXRjaENoYXB0ZXIgfSBmcm9tICcuLi9kZW1vL3RyZWUnO1xuaW1wb3J0IHsgSVJvd1ZvbHVtZSwgVHJlZU5vZGUgfSBmcm9tICcuLi8uLi90cmVlL2luZGV4JztcblxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IHRyaW1GaWxlbmFtZSB9IGZyb20gJ2ZzLWljb252L3V0aWwnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICd1cGF0aDInO1xuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcblxuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcblxuaW1wb3J0IE5vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBkZWZhdWx0SlNET01PcHRpb25zLCBTWU1CT0xfQ0FDSEUgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgcmV0cnlSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vZmV0Y2gnO1xuXG5Ac3RhdGljSW1wbGVtZW50czxOb3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVFU0pab25lPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZUVTSlpvbmUgZXh0ZW5kcyBOb3ZlbFNpdGVEZW1vXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVkgPSAnbm92ZWx1cCc7XG5cblx0Lypcblx0cHJvdGVjdGVkIF9maXhPcHRpb25zUnVudGltZShvcHRpb25zUnVudGltZSlcblx0e1xuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSA9IG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSB8fCB7fTtcblxuXHRcdC8vb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NLnJ1blNjcmlwdHMgPSAnZGFuZ2Vyb3VzbHknO1xuXG5cdFx0cmV0dXJuIHN1cGVyLl9maXhPcHRpb25zUnVudGltZShvcHRpb25zUnVudGltZSlcblx0fVxuXHQgKi9cblxuXHRzdGF0aWMgY2hlY2sodXJsOiBzdHJpbmcgfCBVUkwgfCBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBvcHRpb25zPyk6IGJvb2xlYW5cblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gL25vdmVsdXBcXC5wbHVzL2kudGVzdChuZXcgVVJMKHVybCkuaG9zdG5hbWUgfHwgJycpO1xuXHR9XG5cblx0bWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2wgPzogYm9vbGVhbik6IFVSTFxuXHR7XG5cdFx0bGV0IHBhZDogc3RyaW5nO1xuXG5cdFx0cGFkID0gYHN0b3J5LyR7dXJsb2JqLm5vdmVsX2lkfWA7XG5cblx0XHRpZiAoIWJvb2wgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpXG5cdFx0e1xuXHRcdFx0cGFkICs9IGAvJHt1cmxvYmouY2hhcHRlcl9pZH1gXG5cdFx0fVxuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBuZXcgVVJMKGBodHRwczovL25vdmVsdXAucGx1cy8ke3BhZH1gKTtcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogc3RyaW5nIHwgVVJMKTogTm92ZWxTaXRlLklQYXJzZVVybFxuXHR7XG5cdFx0bGV0IHVybG9iaiA9IHtcblx0XHRcdHVybCxcblxuXHRcdFx0bm92ZWxfcGlkOiBudWxsLFxuXHRcdFx0bm92ZWxfaWQ6IG51bGwsXG5cdFx0XHRjaGFwdGVyX2lkOiBudWxsLFxuXG5cdFx0fTtcblxuXHRcdC8vdXJsID0gdXJsLnRvU3RyaW5nKCk7XG5cblx0XHR0cnlcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR1cmxvYmoudXJsID0gbmV3IFVSTCh1cmwpO1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0dXJsID0gdXJsb2JqLnVybC5ocmVmO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cdFx0XHRjb25zb2xlLndhcm4oZS50b1N0cmluZygpICsgYCBcIiR7dXJsfVwiYCk7XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiB1cmwgIT0gJ3N0cmluZycpXG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcih1cmwpO1xuXHRcdH1cblxuXHRcdGxldCByOiBSZWdFeHA7XG5cdFx0bGV0IG07XG5cblx0XHRyID0gL14oXFxkezYsfSkkLztcblx0XHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHRcdHtcblx0XHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHIgPSAvbm92ZWx1cFxcLnBsdXNcXC9zdG9yeVxcLyhcXGQrKSg/OlxcLyhcXGQrKSk/L2c7XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdFx0dXJsb2JqLmNoYXB0ZXJfaWQgPSBtWzJdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdGNvbnNvbGUuZGlyKHVybG9iaik7XG5cblx0XHRyZXR1cm4gdXJsb2JqO1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9kZWNvZGVDaGFwdGVyPFQ+KHJldDogSUZldGNoQ2hhcHRlciwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlKVxuXHR7XG5cdFx0Y29uc3QgeyBkb20gfSA9IHJldDtcblx0XHRjb25zdCB7ICQgfSA9IGRvbTtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfcGFyc2VDaGFwdGVyPFQ+KHJldCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlKVxuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGNvbnN0ICQgPSByZXQuZG9tLiQ7XG5cblx0XHRsZXQgc2VjdGlvbl9lcGlzb2RlID0gJCgnI3NlY3Rpb25fZXBpc29kZScpO1xuXG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0Ly9sZXQgaHRtbCA9IG1pbmlmeUhUTUwoc2VjdGlvbl9lcGlzb2RlLmh0bWwoKSk7XG5cblx0XHRcdC8vc2VjdGlvbl9lcGlzb2RlLmh0bWwoaHRtbCk7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblxuXHRcdH1cblxuXHRcdC8vYXdhaXQgdGhpcy5fZGVjb2RlQ2hhcHRlcihyZXQsIG9wdGlvbnNSdW50aW1lLCBjYWNoZSk7XG5cblx0XHQvL19wXzJfYnIoc2VjdGlvbl9lcGlzb2RlLmZpbmQoJy5jb250ZW50ID4gcCcpLCByZXQuZG9tLiQpO1xuXG5cdFx0bGV0IGVsZW0gPSBzZWN0aW9uX2VwaXNvZGUuZmluZCgnLmNvbnRlbnQgPiBwJyk7XG5cblx0XHRsZXQgdHh0OiBzdHJpbmcgPSAoYXdhaXQgZWxlbVxuXHRcdFx0LnRleHQoKSlcblx0XHRcdC8vLnJlcGxhY2UoL1xceDIwL2csICdcXG4nKVxuXHRcdFx0LnJlcGxhY2UoL15cXG4rfFxccyskL2csICcnKVxuXHRcdDtcblxuLy9cdFx0bGV0IGh0bWwgPSBlbGVtLmh0bWwoKTtcblxuXHRcdC8qXG5cdFx0bGV0IGh0bWwgPSBlbGVtLmh0bWwoKTtcblxuXHRcdHRocm93IGNvbnNvbGUuZGlyKHtcblx0XHRcdGh0bWwsXG5cdFx0XHR0eHQsXG5cdFx0fSk7XG5cdFx0ICovXG5cbi8vXHRcdGNvbnNvbGUuZGlyKGh0bWwpO1xuLy9cbi8vXHRcdGNvbnNvbGUuZGlyKHR4dCk7XG5cbi8vXHRcdGNvbnNvbGUuZGlyKHR4dCk7XG4vL1xuLy9cdFx0cHJvY2Vzcy5leGl0KCk7XG5cblx0XHRyZXR1cm4gdHh0IGFzIHN0cmluZ1xuXHR9XG5cblx0Z2V0T3V0cHV0RGlyPFQgZXh0ZW5kcyBJT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnM/OiBUICYgSU9wdGlvbnNSdW50aW1lLCBub3ZlbE5hbWU/OiBzdHJpbmcpXG5cdHtcblx0XHRsZXQgcmV0ID0gc3VwZXIuZ2V0T3V0cHV0RGlyPFQ+KG9wdGlvbnMsIG5vdmVsTmFtZSk7XG5cblx0XHRyZXRbMV0ub3B0aW9uc0pTRE9NLm1pbmlmeUhUTUwgPSBmYWxzZTtcblxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRhc3luYyBnZXRfdm9sdW1lX2xpc3Q8VCBleHRlbmRzIElPcHRpb25zUnVudGltZT4odXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge30sXG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHR1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwodXJsIGFzIGFueSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRsZXQgZGF0YV9tZXRhOiBJTWRjb25mTWV0YSA9IHtcblx0XHRcdFx0XHRub3ZlbDoge1xuXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRsZXQgc2VjdGlvbl93b3Jrc19pbmZvID0gJCgnI3NlY3Rpb25fd29ya3NfaW5mbycpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF90aXRsZSA9IHRyaW0oc2VjdGlvbl93b3Jrc19pbmZvLmZpbmQoJy5ub3ZlbF90aXRsZScpLnRleHQoKSk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3B1Ymxpc2hlciA9IHNlbGYuSURLRVk7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybChkb20udXJsLmhyZWYpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9hdXRob3IgPSB0cmltKHNlY3Rpb25fd29ya3NfaW5mby5maW5kKCcubm92ZWxfYXV0aG9yJykudGV4dCgpKTtcblx0XHRcdFx0bGV0IG5vdmVsX2RhdGU7XG5cblx0XHRcdFx0Y29uc3Qgbm92ZWxUcmVlID0gb3B0aW9uc1J1bnRpbWUubm92ZWxUcmVlO1xuXHRcdFx0XHRsZXQgY3VycmVudFZvbHVtZTogVHJlZU5vZGU8SVJvd1ZvbHVtZT47XG5cblx0XHRcdFx0bGV0IF9jYWNoZV9kYXRlcyA9IFtdO1xuXG5cdFx0XHRcdGxldCB0b3RhbF9pZHggPSAwO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgdm9sdW1lX3RpdGxlID0gJ251bGwnO1xuXHRcdFx0XHRcdGxldCB2b2x1bWVfbGV2ZWwgPSBudWxsO1xuXG5cdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IG5vdmVsVHJlZS5hZGRWb2x1bWUoe1xuXHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlLFxuXHRcdFx0XHRcdFx0dm9sdW1lX2xldmVsLFxuXHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiBub3ZlbFRyZWUucm9vdCgpLnNpemUoKSxcblx0XHRcdFx0XHRcdHRvdGFsX2lkeDogdG90YWxfaWR4KyssXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgdGFibGUgPSAkKCcjc2VjdGlvbl9lcGlzb2RlIC5lcGlzb2RlX2xpc3QgdWw6ZXEoMCkgPiBsaScpO1xuXG5cdFx0XHRcdHRhYmxlXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCB0ciA9ICQoZWxlbSk7XG5cblx0XHRcdFx0XHRcdGlmICh0ci5pcygnLmNoYXB0ZXInKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IHZvbHVtZV90aXRsZSA9IHRyaW0odHIudGV4dCgpKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAodm9sdW1lX3RpdGxlICE9IGN1cnJlbnRWb2x1bWUuY29udGVudC52b2x1bWVfdGl0bGUpXG5cdFx0XHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSBub3ZlbFRyZWUuYWRkVm9sdW1lKHtcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZSxcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogbm92ZWxUcmVlLnJvb3QoKS5zaXplKCksXG5cdFx0XHRcdFx0XHRcdFx0XHR0b3RhbF9pZHg6IHRvdGFsX2lkeCsrLFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHtcblxuXG5cdFx0XHRcdFx0XHRcdGxldCBhID0gdHIuZmluZCgnLmVwaXNvZGVfbGluayBhJyk7XG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3RpdGxlID0gdHJpbShhLnRleHQoKSwgdHJ1ZSk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGhyZWYgPSBhLnByb3AoJ2hyZWYnKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgZGF0YSA9IHNlbGYucGFyc2VVcmwoaHJlZik7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFkYXRhLmNoYXB0ZXJfaWQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aHJlZiA9IHNlbGYubWFrZVVybChkYXRhKTtcblxuXHRcdFx0XHRcdFx0XHRcdGRhdGEudXJsID0gaHJlZjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyID0ge1xuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGUsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsOiBocmVmLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGE6IGRhdGEsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogY3VycmVudFZvbHVtZS5zaXplKCksXG5cdFx0XHRcdFx0XHRcdFx0dG90YWxfaWR4OiB0b3RhbF9pZHgrKyxcblx0XHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0XHRub3ZlbFRyZWUuYWRkQ2hhcHRlcihjaGFwdGVyLCBjdXJyZW50Vm9sdW1lKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRkYXRhX21ldGEubm92ZWwuY292ZXIgPSBzZWN0aW9uX3dvcmtzX2luZm8uZmluZCgnLm5vdmVsX2NvdmVyIGltZycpLnByb3AoJ3NyYycpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kZXNjID0gdHJpbShzZWN0aW9uX3dvcmtzX2luZm8uZmluZCgnLm5vdmVsX3N5bm9wc2lzJykudGV4dCgpKTtcblxuXHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncyA9IGRhdGFfbWV0YS5ub3ZlbC50YWdzIHx8IFtdO1xuXG5cdFx0XHRcdCQoJyNzZWN0aW9uX2VwaXNvZGUgLmluZm9fdGFibGUgZGQnKVxuXHRcdFx0XHRcdC5maW5kKGBhW2hyZWYqPVwiW3RhZ11cIl0sIGFbaHJlZio9XCJnZW5yZVsxXVwiXWApXG5cdFx0XHRcdFx0LmVhY2goKGksIGVsZW0pID0+IHtcblxuXHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MucHVzaCh0cmltKCQoZWxlbSkudGV4dCgpKSk7XG5cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdC4uLmRhdGFfbWV0YSxcblxuXHRcdFx0XHRcdHVybDogZG9tLnVybCxcblx0XHRcdFx0XHR1cmxfZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX2F1dGhvcixcblx0XHRcdFx0XHRub3ZlbF9kYXRlLFxuXG5cdFx0XHRcdFx0bm92ZWxfZGVzYyxcblxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxuXHRcdFx0XHRcdG5vdmVsX3B1Ymxpc2hlcixcblxuXHRcdFx0XHRcdC8vdm9sdW1lX2xpc3QsXG5cdFx0XHRcdFx0bm92ZWxUcmVlLFxuXG5cdFx0XHRcdFx0Y2hlY2tkYXRlOiBtb21lbnQoKS5sb2NhbCgpLFxuXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdH0gYXMgSU5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZUVTSlpvbmU7XG5cbmZ1bmN0aW9uIF9wXzJfYnIodGFyZ2V0LCAkKVxue1xuXHRyZXR1cm4gJCh0YXJnZXQpXG5cdFx0LmVhY2goZnVuY3Rpb24gKGksIGVsZW0pXG5cdFx0e1xuXHRcdFx0bGV0IF90aGlzID0gJChlbGVtKTtcblxuXHRcdFx0bGV0IF9odG1sID0gX3RoaXNcblx0XHRcdFx0Lmh0bWwoKVxuXHRcdFx0XHQucmVwbGFjZSgvKD86Jm5ic3A7PykvZywgJyAnKVxuXHRcdFx0XHQucmVwbGFjZSgvW1xceEEwXFxzXSskL2csICcnKVxuXHRcdFx0O1xuXG5cdFx0XHRpZiAoX2h0bWwgPT0gJzxici8+JyB8fCBfaHRtbCA9PSAnPGJyPicpXG5cdFx0XHR7XG5cdFx0XHRcdF9odG1sID0gJyc7XG5cdFx0XHR9XG5cblx0XHRcdF90aGlzLmFmdGVyKGAke19odG1sfTxici8+YCk7XG5cdFx0XHRfdGhpcy5yZW1vdmUoKVxuXHRcdH0pXG5cdFx0O1xufVxuIl19