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
//import { URL } from 'jsdom-url';
const index_1 = require("../index");
const index_2 = require("../index");
const util_2 = require("./util");
let NovelSiteESJZone = class NovelSiteESJZone extends tree_1.default {
    /*
    protected _fixOptionsRuntime(optionsRuntime)
    {
        optionsRuntime.optionsJSDOM = optionsRuntime.optionsJSDOM || {};

        //optionsRuntime.optionsJSDOM.runScripts = 'dangerously';

        return super._fixOptionsRuntime(optionsRuntime)
    }
     */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQThDO0FBQzlDLHVDQUF1RztBQU92Ryw2Q0FBK0Q7QUFFL0Qsa0NBQWtDO0FBRWxDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFFbEMsaUNBQWtEO0FBR2xELElBQWEsZ0JBQWdCLEdBQTdCLE1BQWEsZ0JBQWlCLFNBQVEsY0FBYTtJQUlsRDs7Ozs7Ozs7O09BU0c7SUFFSCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQXVDLEVBQUUsR0FBRyxJQUFJO1FBRTVELE9BQU8sWUFBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQTJCLEVBQUUsSUFBdUIsRUFBRSxHQUFHLElBQUk7UUFFM0UsT0FBTyxjQUFPLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO0lBQ3RDLENBQUM7SUFFRCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQTBCLEVBQUUsR0FBRyxJQUFJO1FBRWxELE9BQU8sZUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRCxPQUFPLENBQUMsTUFBMkIsRUFBRSxJQUF1QixFQUFFLEdBQUcsSUFBSTtRQUVwRSxPQUFPLGNBQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7SUFDdEMsQ0FBQztJQUVELFFBQVEsQ0FBQyxHQUEwQixFQUFFLEdBQUcsSUFBSTtRQUUzQyxPQUFPLGVBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRVMsS0FBSyxDQUFDLGNBQWMsQ0FBSSxHQUFrQixFQUFFLGNBQW1DLEVBQUUsS0FBSztRQUUvRixNQUFNLEVBQUUsR0FB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QVU7Z0JBRVYsVUFBVTtnQkFFVixXQUFXO2dCQUNYLGVBQWU7Z0JBRWYsY0FBYztnQkFDZCxTQUFTLEVBRVQsU0FBUyxFQUFFLGNBQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxFQUUzQixJQUFJLEVBQUUsRUFBYyxHQUNWLENBQUM7UUFDYixDQUFDLENBQUMsQ0FDRDtJQUNILENBQUM7Q0FFRCxDQUFBO0FBalF1QixzQkFBSyxHQUFHLFNBQVMsQ0FBQztBQUY3QixnQkFBZ0I7SUFENUIsd0JBQWdCLEVBQWdEO0dBQ3BELGdCQUFnQixDQW1RNUI7QUFuUVksNENBQWdCO0FBcVE3QixrQkFBZSxnQkFBZ0IsQ0FBQztBQUVoQyxTQUFTLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUV6QixPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUM7U0FDZCxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsSUFBSTtRQUV0QixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFcEIsSUFBSSxLQUFLLEdBQUcsS0FBSzthQUNmLElBQUksRUFBRTthQUNOLE9BQU8sQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDO2FBQzVCLE9BQU8sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQzNCO1FBRUQsSUFBSSxLQUFLLElBQUksT0FBTyxJQUFJLEtBQUssSUFBSSxNQUFNLEVBQ3ZDO1lBQ0MsS0FBSyxHQUFHLEVBQUUsQ0FBQztTQUNYO1FBRUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssT0FBTyxDQUFDLENBQUM7UUFDN0IsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFBO0lBQ2YsQ0FBQyxDQUFDLENBQ0Q7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzE3LzAxNy5cbiAqL1xuXG5pbXBvcnQgeyBtaW5pZnlIVE1MLCB0cmltIH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgTm92ZWxTaXRlRGVtbywgeyBJRG93bmxvYWRPcHRpb25zLCBJTm92ZWwsIElPcHRpb25zUnVudGltZSwgSUZldGNoQ2hhcHRlciB9IGZyb20gJy4uL2RlbW8vdHJlZSc7XG5pbXBvcnQgeyBJUm93Vm9sdW1lLCBUcmVlTm9kZSB9IGZyb20gJy4uLy4uL3RyZWUvaW5kZXgnO1xuXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYvdXRpbCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3VwYXRoMic7XG5pbXBvcnQgbm92ZWxJbmZvLCB7IElNZGNvbmZNZXRhIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuXG4vL2ltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5cbmltcG9ydCBOb3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgZGVmYXVsdEpTRE9NT3B0aW9ucywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkLCBibHVlYmlyZERlY29yYXRvciB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IG1vbWVudCB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uLy4uL2ZldGNoJztcbmltcG9ydCB7IHBhcnNlVXJsLCBtYWtlVXJsLCBjaGVjayB9IGZyb20gJy4vdXRpbCc7XG5cbkBzdGF0aWNJbXBsZW1lbnRzPE5vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZUVTSlpvbmU+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlRVNKWm9uZSBleHRlbmRzIE5vdmVsU2l0ZURlbW9cbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWSA9ICdub3ZlbHVwJztcblxuXHQvKlxuXHRwcm90ZWN0ZWQgX2ZpeE9wdGlvbnNSdW50aW1lKG9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NID0gb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NIHx8IHt9O1xuXG5cdFx0Ly9vcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucnVuU2NyaXB0cyA9ICdkYW5nZXJvdXNseSc7XG5cblx0XHRyZXR1cm4gc3VwZXIuX2ZpeE9wdGlvbnNSdW50aW1lKG9wdGlvbnNSdW50aW1lKVxuXHR9XG5cdCAqL1xuXG5cdHN0YXRpYyBjaGVjayh1cmw6IHN0cmluZyB8IFVSTCB8IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIC4uLmFyZ3YpOiBib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gY2hlY2sodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdHN0YXRpYyBtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbD86IGJvb2xlYW4gfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gbWFrZVVybCh1cmxvYmosIGJvb2wsIC4uLmFyZ3YpXG5cdH1cblxuXHRzdGF0aWMgcGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwgfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gcGFyc2VVcmwodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdG1ha2VVcmwodXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sPzogYm9vbGVhbiB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBtYWtlVXJsKHVybG9iaiwgYm9vbCwgLi4uYXJndilcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogc3RyaW5nIHwgVVJMIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIHBhcnNlVXJsKHVybCwgLi4uYXJndik7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX2RlY29kZUNoYXB0ZXI8VD4ocmV0OiBJRmV0Y2hDaGFwdGVyLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGUpXG5cdHtcblx0XHRjb25zdCB7IGRvbSB9ID0gcmV0O1xuXHRcdGNvbnN0IHsgJCB9ID0gZG9tO1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9wYXJzZUNoYXB0ZXI8VD4ocmV0LCBvcHRpb25zUnVudGltZSwgY2FjaGUpXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0Y29uc3QgJCA9IHJldC5kb20uJDtcblxuXHRcdGxldCBzZWN0aW9uX2VwaXNvZGUgPSAkKCcjc2VjdGlvbl9lcGlzb2RlJyk7XG5cblx0XHR0cnlcblx0XHR7XG5cdFx0XHQvL2xldCBodG1sID0gbWluaWZ5SFRNTChzZWN0aW9uX2VwaXNvZGUuaHRtbCgpKTtcblxuXHRcdFx0Ly9zZWN0aW9uX2VwaXNvZGUuaHRtbChodG1sKTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXG5cdFx0fVxuXG5cdFx0Ly9hd2FpdCB0aGlzLl9kZWNvZGVDaGFwdGVyKHJldCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlKTtcblxuXHRcdC8vX3BfMl9icihzZWN0aW9uX2VwaXNvZGUuZmluZCgnLmNvbnRlbnQgPiBwJyksIHJldC5kb20uJCk7XG5cblx0XHRsZXQgZWxlbSA9IHNlY3Rpb25fZXBpc29kZS5maW5kKCcuY29udGVudCA+IHAnKTtcblxuXHRcdGxldCB0eHQ6IHN0cmluZyA9IChhd2FpdCBlbGVtXG5cdFx0XHQudGV4dCgpKVxuXHRcdFx0Ly8ucmVwbGFjZSgvXFx4MjAvZywgJ1xcbicpXG5cdFx0XHQucmVwbGFjZSgvXlxcbit8XFxzKyQvZywgJycpXG5cdFx0O1xuXG4vL1x0XHRsZXQgaHRtbCA9IGVsZW0uaHRtbCgpO1xuXG5cdFx0Lypcblx0XHRsZXQgaHRtbCA9IGVsZW0uaHRtbCgpO1xuXG5cdFx0dGhyb3cgY29uc29sZS5kaXIoe1xuXHRcdFx0aHRtbCxcblx0XHRcdHR4dCxcblx0XHR9KTtcblx0XHQgKi9cblxuLy9cdFx0Y29uc29sZS5kaXIoaHRtbCk7XG4vL1xuLy9cdFx0Y29uc29sZS5kaXIodHh0KTtcblxuLy9cdFx0Y29uc29sZS5kaXIodHh0KTtcbi8vXG4vL1x0XHRwcm9jZXNzLmV4aXQoKTtcblxuXHRcdHJldHVybiB0eHQgYXMgc3RyaW5nXG5cdH1cblxuXHRnZXRPdXRwdXREaXI8VCBleHRlbmRzIElPcHRpb25zUnVudGltZT4ob3B0aW9ucz86IFQgJiBJT3B0aW9uc1J1bnRpbWUsIG5vdmVsTmFtZT86IHN0cmluZylcblx0e1xuXHRcdGxldCByZXQgPSBzdXBlci5nZXRPdXRwdXREaXI8VD4ob3B0aW9ucywgbm92ZWxOYW1lKTtcblxuXHRcdHJldFsxXS5vcHRpb25zSlNET00ubWluaWZ5SFRNTCA9IGZhbHNlO1xuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdGFzeW5jIGdldF92b2x1bWVfbGlzdDxUIGV4dGVuZHMgSU9wdGlvbnNSdW50aW1lPih1cmw6IHN0cmluZyB8IFVSTCxcblx0XHRvcHRpb25zUnVudGltZTogUGFydGlhbDxUICYgSURvd25sb2FkT3B0aW9ucz4gPSB7fSxcblx0KTogUHJvbWlzZTxJTm92ZWw+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdHVybCA9IGF3YWl0IHRoaXMuY3JlYXRlTWFpblVybCh1cmwgYXMgYW55LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRyZXR1cm4gZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb206IElKU0RPTSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdGxldCBkYXRhX21ldGE6IElNZGNvbmZNZXRhID0ge1xuXHRcdFx0XHRcdG5vdmVsOiB7XG5cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGxldCBzZWN0aW9uX3dvcmtzX2luZm8gPSAkKCcjc2VjdGlvbl93b3Jrc19pbmZvJyk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gdHJpbShzZWN0aW9uX3dvcmtzX2luZm8uZmluZCgnLm5vdmVsX3RpdGxlJykudGV4dCgpKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfcHVibGlzaGVyID0gc2VsZi5JREtFWTtcblxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKGRvbS51cmwuaHJlZik7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2F1dGhvciA9IHRyaW0oc2VjdGlvbl93b3Jrc19pbmZvLmZpbmQoJy5ub3ZlbF9hdXRob3InKS50ZXh0KCkpO1xuXHRcdFx0XHRsZXQgbm92ZWxfZGF0ZTtcblxuXHRcdFx0XHRjb25zdCBub3ZlbFRyZWUgPSBvcHRpb25zUnVudGltZS5ub3ZlbFRyZWU7XG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBUcmVlTm9kZTxJUm93Vm9sdW1lPjtcblxuXHRcdFx0XHRsZXQgX2NhY2hlX2RhdGVzID0gW107XG5cblx0XHRcdFx0bGV0IHRvdGFsX2lkeCA9IDA7XG5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB2b2x1bWVfdGl0bGUgPSAnbnVsbCc7XG5cdFx0XHRcdFx0bGV0IHZvbHVtZV9sZXZlbCA9IG51bGw7XG5cblx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gbm92ZWxUcmVlLmFkZFZvbHVtZSh7XG5cdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGUsXG5cdFx0XHRcdFx0XHR2b2x1bWVfbGV2ZWwsXG5cdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IG5vdmVsVHJlZS5yb290KCkuc2l6ZSgpLFxuXHRcdFx0XHRcdFx0dG90YWxfaWR4OiB0b3RhbF9pZHgrKyxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCB0YWJsZSA9ICQoJyNzZWN0aW9uX2VwaXNvZGUgLmVwaXNvZGVfbGlzdCB1bDplcSgwKSA+IGxpJyk7XG5cblx0XHRcdFx0dGFibGVcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IHRyID0gJChlbGVtKTtcblxuXHRcdFx0XHRcdFx0aWYgKHRyLmlzKCcuY2hhcHRlcicpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgdm9sdW1lX3RpdGxlID0gdHJpbSh0ci50ZXh0KCkpO1xuXG5cdFx0XHRcdFx0XHRcdGlmICh2b2x1bWVfdGl0bGUgIT0gY3VycmVudFZvbHVtZS5jb250ZW50LnZvbHVtZV90aXRsZSlcblx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IG5vdmVsVHJlZS5hZGRWb2x1bWUoe1xuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiBub3ZlbFRyZWUucm9vdCgpLnNpemUoKSxcblx0XHRcdFx0XHRcdFx0XHRcdHRvdGFsX2lkeDogdG90YWxfaWR4KyssXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0e1xuXG5cblx0XHRcdFx0XHRcdFx0bGV0IGEgPSB0ci5maW5kKCcuZXBpc29kZV9saW5rIGEnKTtcblx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXJfdGl0bGUgPSB0cmltKGEudGV4dCgpLCB0cnVlKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgaHJlZiA9IGEucHJvcCgnaHJlZicpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBkYXRhID0gc2VsZi5wYXJzZVVybChocmVmKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIWRhdGEuY2hhcHRlcl9pZClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRocmVmID0gc2VsZi5tYWtlVXJsKGRhdGEpO1xuXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS51cmwgPSBocmVmO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0bGV0IGNoYXB0ZXIgPSB7XG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl90aXRsZSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2lkOiBkYXRhLmNoYXB0ZXJfaWQsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmw6IGhyZWYsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl91cmxfZGF0YTogZGF0YSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLnNpemUoKSxcblx0XHRcdFx0XHRcdFx0XHR0b3RhbF9pZHg6IHRvdGFsX2lkeCsrLFxuXHRcdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRcdG5vdmVsVHJlZS5hZGRDaGFwdGVyKGNoYXB0ZXIsIGN1cnJlbnRWb2x1bWUpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC5jb3ZlciA9IHNlY3Rpb25fd29ya3NfaW5mby5maW5kKCcubm92ZWxfY292ZXIgaW1nJykucHJvcCgnc3JjJyk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2Rlc2MgPSB0cmltKHNlY3Rpb25fd29ya3NfaW5mby5maW5kKCcubm92ZWxfc3lub3BzaXMnKS50ZXh0KCkpO1xuXG5cdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzID0gZGF0YV9tZXRhLm5vdmVsLnRhZ3MgfHwgW107XG5cblx0XHRcdFx0JCgnI3NlY3Rpb25fZXBpc29kZSAuaW5mb190YWJsZSBkZCcpXG5cdFx0XHRcdFx0LmZpbmQoYGFbaHJlZio9XCJbdGFnXVwiXSwgYVtocmVmKj1cImdlbnJlWzFdXCJdYClcblx0XHRcdFx0XHQuZWFjaCgoaSwgZWxlbSkgPT4ge1xuXG5cdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncy5wdXNoKHRyaW0oJChlbGVtKS50ZXh0KCkpKTtcblxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRyZXR1cm4ge1xuXG5cdFx0XHRcdFx0Li4uZGF0YV9tZXRhLFxuXG5cdFx0XHRcdFx0dXJsOiBkb20udXJsLFxuXHRcdFx0XHRcdHVybF9kYXRhLFxuXG5cdFx0XHRcdFx0bm92ZWxfYXV0aG9yLFxuXHRcdFx0XHRcdG5vdmVsX2RhdGUsXG5cblx0XHRcdFx0XHRub3ZlbF9kZXNjLFxuXG5cdFx0XHRcdFx0bm92ZWxfdGl0bGUsXG5cdFx0XHRcdFx0bm92ZWxfcHVibGlzaGVyLFxuXG5cdFx0XHRcdFx0Ly92b2x1bWVfbGlzdCxcblx0XHRcdFx0XHRub3ZlbFRyZWUsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlRVNKWm9uZTtcblxuZnVuY3Rpb24gX3BfMl9icih0YXJnZXQsICQpXG57XG5cdHJldHVybiAkKHRhcmdldClcblx0XHQuZWFjaChmdW5jdGlvbiAoaSwgZWxlbSlcblx0XHR7XG5cdFx0XHRsZXQgX3RoaXMgPSAkKGVsZW0pO1xuXG5cdFx0XHRsZXQgX2h0bWwgPSBfdGhpc1xuXHRcdFx0XHQuaHRtbCgpXG5cdFx0XHRcdC5yZXBsYWNlKC8oPzombmJzcDs/KS9nLCAnICcpXG5cdFx0XHRcdC5yZXBsYWNlKC9bXFx4QTBcXHNdKyQvZywgJycpXG5cdFx0XHQ7XG5cblx0XHRcdGlmIChfaHRtbCA9PSAnPGJyLz4nIHx8IF9odG1sID09ICc8YnI+Jylcblx0XHRcdHtcblx0XHRcdFx0X2h0bWwgPSAnJztcblx0XHRcdH1cblxuXHRcdFx0X3RoaXMuYWZ0ZXIoYCR7X2h0bWx9PGJyLz5gKTtcblx0XHRcdF90aGlzLnJlbW92ZSgpXG5cdFx0fSlcblx0XHQ7XG59XG4iXX0=