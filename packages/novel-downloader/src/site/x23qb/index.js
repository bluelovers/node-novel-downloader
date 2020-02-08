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
const fetch_1 = require("../../fetch");
const regexp_cjk_1 = require("regexp-cjk");
const util_2 = require("./util");
/**
 * 铅笔小说
 * @example https://www.x23qb.com/book/284/
 */
let NovelSiteX23qb = class NovelSiteX23qb extends tree_1.default {
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
        let html = dom.serialize();
        let m = html
            .match(/getTranslation\(['"]([^\'"]+)['"]/i);
        if (m) {
            let code = m[1];
            await fetch_1.retryRequest(ret.url, Object.assign(Object.assign({}, optionsRuntime.requestOptions), { method: 'POST', form: {
                    plxf: 'getTranslation',
                    plxa: [code],
                } }))
                .then((v) => {
                v = v
                    .replace(/\<JinJing\>/, '')
                    .replace(/\<\/JinJing\>/, '');
                return JSON.parse(v);
            })
                /*
                .tap(v => {
                    console.dir('-----------------------')
                    console.dir(v)
                    console.dir('-----------------------')
                })
                 */
                .tap((a) => {
                let elems = $('.trans');
                a.forEach((v, i) => {
                    elems.eq(i).html(v);
                });
            });
        }
        //console.dir(m);
        //process.exit();
    }
    async _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        try {
            let html = util_1.minifyHTML($('#mlfy_main_text').html());
            $('#mlfy_main_text').html(html);
        }
        catch (e) {
        }
        let elem = ret.dom.$('#TextContent');
        elem
            .find('> .tp, > .ke, > .rd, > .bd, script')
            .remove();
        _p_2_br(elem.find('p'), ret.dom.$);
        elem.html(function (i, old) {
            return old
                .replace(/(\<br\>){3,4}/g, '$1')
                .replace(/(?<=\<br\>)(?=[^\n])/g, '\n');
        });
        let title = util_1.trim(ret.dom.$('mlfy_main_text > h1:eq(0)').text());
        if (!this._cache_re) {
            this._cache_re = new regexp_cjk_1.zhRegExp(/^(?:鉛\s*筆\s*小\s*說\(w\s*w\s*w\s*\.\s*x\s*2\s*3\s*q\s*b\s*\.\s*c\s*o\s*m\))$/uigm);
        }
        let txt = elem
            .text()
            .replace(this._cache_re, '')
            .replace(/^\s+|\s+$/g, '')
            .replace(/^[ \xA0]+|[ \xA0]+$/gm, '');
        return txt;
    }
    async get_volume_list(url, optionsRuntime = {}) {
        const self = this;
        url = await this.createMainUrl(url, optionsRuntime);
        return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            let novel_title = dom.$('.d_title h1').text();
            let novel_publisher = self.IDKEY;
            let url_data = self.parseUrl(dom.url.href);
            let novel_desc = $('#bookintro > p:eq(0)').text();
            let volume_list = [];
            const novelTree = optionsRuntime.novelTree;
            let currentVolume;
            let table = $('#chapterList li')
                .find('a');
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
            table
                .each(function (index, elem) {
                let tr = dom.$(elem);
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
            let data_meta = {
                novel: {
                    tags: [],
                },
            };
            let novel_date = index_2.moment($('#uptime > span').text());
            let tag = $('.bookright #count li:eq(0) span:eq(0)').text().trim();
            if (tag) {
                data_meta.novel.tags.push(tag);
            }
            let novel_author = $('.p_author a:eq(0)').text().trim();
            data_meta.link = data_meta.link || [];
            data_meta.link.push($('.p_author a:eq(0)').prop('href'));
            $('.bookright #count li span')
                .each((i, elem) => {
                let txt = $(elem).text().trim();
                let bool = [
                    '完結済',
                    '完結',
                    '已完結',
                    '已完成',
                    '完结済',
                    '完结',
                    '已完结',
                    '已完成',
                ].includes(txt);
                if (bool) {
                    data_meta.novel.status = txt;
                }
            });
            return Object.assign(Object.assign({}, data_meta), { url: dom.url, url_data,
                novel_title,
                novel_publisher,
                novel_author,
                novel_date,
                novel_desc,
                //volume_list,
                novelTree, checkdate: index_2.moment().local(), imgs: [] });
        });
    }
};
NovelSiteX23qb.IDKEY = 'x23qb';
NovelSiteX23qb = __decorate([
    index_1.staticImplements()
], NovelSiteX23qb);
exports.NovelSiteX23qb = NovelSiteX23qb;
exports.default = NovelSiteX23qb;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQThDO0FBQzlDLHVDQUF1RztBQU92Ryw2Q0FBK0Q7QUFFL0Qsa0NBQWtDO0FBRWxDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFDbEMsdUNBQTJDO0FBQzNDLDJDQUFzQztBQUN0QyxpQ0FBa0Q7QUFFbEQ7OztHQUdHO0FBRUgsSUFBYSxjQUFjLEdBQTNCLE1BQWEsY0FBZSxTQUFRLGNBQWE7SUFpQmhELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBdUMsRUFBRSxHQUFHLElBQUk7UUFFNUQsT0FBTyxZQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBMkIsRUFBRSxJQUF1QixFQUFFLEdBQUcsSUFBSTtRQUUzRSxPQUFPLGNBQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7SUFDdEMsQ0FBQztJQUVELE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBMEIsRUFBRSxHQUFHLElBQUk7UUFFbEQsT0FBTyxlQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVELE9BQU8sQ0FBQyxNQUEyQixFQUFFLElBQXVCLEVBQUUsR0FBRyxJQUFJO1FBRXBFLE9BQU8sY0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtJQUN0QyxDQUFDO0lBRUQsUUFBUSxDQUFDLEdBQTBCLEVBQUUsR0FBRyxJQUFJO1FBRTNDLE9BQU8sZUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFUyxLQUFLLENBQUMsY0FBYyxDQUFJLEdBQWtCLEVBQUUsY0FBbUMsRUFBRSxLQUFLO1FBRS9GLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUM7UUFDcEIsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztRQUVsQixJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7UUFFM0IsSUFBSSxDQUFDLEdBQUcsSUFBSTthQUNWLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUM1QztRQUVELElBQUksQ0FBQyxFQUNMO1lBQ0MsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWhCLE1BQU0sb0JBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxrQ0FFdEIsY0FBYyxDQUFDLGNBQWMsS0FDaEMsTUFBTSxFQUFFLE1BQU0sRUFDZCxJQUFJLEVBQUU7b0JBQ0wsSUFBSSxFQUFFLGdCQUFnQjtvQkFDdEIsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDO2lCQUNaLElBQ0E7aUJBQ0EsSUFBSSxDQUFDLENBQUMsQ0FBUyxFQUFFLEVBQUU7Z0JBQ25CLENBQUMsR0FBRyxDQUFDO3FCQUNILE9BQU8sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDO3FCQUMxQixPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUM3QjtnQkFFRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDckIsQ0FBQyxDQUFDO2dCQUNGOzs7Ozs7bUJBTUc7aUJBQ0YsR0FBRyxDQUFDLENBQUMsQ0FBVyxFQUFFLEVBQUU7Z0JBRXBCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFeEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDbEIsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLENBQUMsQ0FBQyxDQUFBO1lBRUgsQ0FBQyxDQUFDLENBQ0Y7U0FFRDtRQUVELGlCQUFpQjtRQUNqQixpQkFBaUI7SUFDbEIsQ0FBQztJQUVTLEtBQUssQ0FBQyxhQUFhLENBQUksR0FBRyxFQUFFLGNBQWMsRUFBRSxLQUFLO1FBRTFELElBQUksQ0FBQyxHQUFHLEVBQ1I7WUFDQyxPQUFPLEVBQUUsQ0FBQztTQUNWO1FBRUQsSUFDQTtZQUNDLElBQUksSUFBSSxHQUFHLGlCQUFVLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUVuRCxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDaEM7UUFDRCxPQUFPLENBQUMsRUFDUjtTQUVDO1FBRUQsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFckMsSUFBSTthQUNGLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQzthQUMxQyxNQUFNLEVBQUUsQ0FDVDtRQUVELE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxHQUFXO1lBRWpDLE9BQU8sR0FBRztpQkFDUixPQUFPLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDO2lCQUMvQixPQUFPLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLENBQUE7UUFDekMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLEtBQUssR0FBRyxXQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBR2hFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUNuQjtZQUNDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxxQkFBUSxDQUFDLGdGQUFnRixDQUFDLENBQUE7U0FDL0c7UUFFRCxJQUFJLEdBQUcsR0FBVyxJQUFJO2FBQ3BCLElBQUksRUFBRTthQUNOLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQzthQUMzQixPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQzthQUN6QixPQUFPLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxDQUFDLENBQ3JDO1FBRUQsT0FBTyxHQUFhLENBQUE7SUFDckIsQ0FBQztJQUVELEtBQUssQ0FBQyxlQUFlLENBQTRCLEdBQWlCLEVBQ2pFLGlCQUFnRCxFQUFFO1FBR2xELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztRQUVsQixHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQVUsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUUzRCxPQUFPLHFCQUFPLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxZQUFZLENBQUM7YUFDOUMsSUFBSSxDQUFDLEtBQUssV0FBVyxHQUFXO1lBRWhDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFaEIsSUFBSSxXQUFXLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUU5QyxJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBRWpDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUUzQyxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUVsRCxJQUFJLFdBQVcsR0FBRyxFQUF5QixDQUFDO1lBRTVDLE1BQU0sU0FBUyxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUM7WUFDM0MsSUFBSSxhQUFtQyxDQUFDO1lBRXhDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQztpQkFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUNWO1lBRUQsSUFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDO1lBRXRCLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztZQUVsQjtnQkFDQyxJQUFJLFlBQVksR0FBRyxNQUFNLENBQUM7Z0JBQzFCLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQztnQkFFeEIsYUFBYSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7b0JBQ25DLFlBQVk7b0JBQ1osWUFBWTtvQkFDWixZQUFZLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRTtvQkFDckMsU0FBUyxFQUFFLFNBQVMsRUFBRTtpQkFDdEIsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxLQUFLO2lCQUNILElBQUksQ0FBQyxVQUFVLEtBQUssRUFBRSxJQUFJO2dCQUUxQixJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVyQixJQUFJLENBQUMsRUFDTDtvQkFDQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQ1gsSUFBSSxhQUFhLEdBQUcsV0FBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFFekMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFFMUIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQ3BCO3dCQUNDLE9BQU87cUJBQ1A7eUJBRUQ7d0JBQ0MsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBRTFCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO3FCQUNoQjtvQkFFRCxJQUFJLE9BQU8sR0FBRzt3QkFDYixhQUFhO3dCQUNiLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTt3QkFDM0IsV0FBVyxFQUFFLElBQUk7d0JBQ2pCLGdCQUFnQixFQUFFLElBQUk7d0JBQ3RCLGFBQWEsRUFBRSxhQUFhLENBQUMsSUFBSSxFQUFFO3dCQUNuQyxTQUFTLEVBQUUsU0FBUyxFQUFFO3FCQUN0QixDQUFDO29CQUVGLFNBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFBO2lCQUM1QztZQUNGLENBQUMsQ0FBQyxDQUNGO1lBRUQsSUFBSSxTQUFTLEdBQWdCO2dCQUM1QixLQUFLLEVBQUU7b0JBQ04sSUFBSSxFQUFFLEVBQUU7aUJBQ1I7YUFDRCxDQUFDO1lBRUYsSUFBSSxVQUFVLEdBQUcsY0FBTSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFFcEQsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLHVDQUF1QyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFbkUsSUFBSSxHQUFHLEVBQ1A7Z0JBQ0MsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO2FBQzlCO1lBRUQsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFeEQsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUN0QyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUV6RCxDQUFDLENBQUMsMkJBQTJCLENBQUM7aUJBQzVCLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFFakIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUVoQyxJQUFJLElBQUksR0FBRztvQkFDVixLQUFLO29CQUNMLElBQUk7b0JBQ0osS0FBSztvQkFDTCxLQUFLO29CQUNMLEtBQUs7b0JBQ0wsSUFBSTtvQkFDSixLQUFLO29CQUNMLEtBQUs7aUJBQ0wsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQ2Q7Z0JBRUQsSUFBSSxJQUFJLEVBQ1I7b0JBQ0MsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO2lCQUM3QjtZQUVGLENBQUMsQ0FBQyxDQUNGO1lBRUQsT0FBTyxnQ0FFSCxTQUFTLEtBRVosR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQ1osUUFBUTtnQkFFUixXQUFXO2dCQUNYLGVBQWU7Z0JBRWYsWUFBWTtnQkFFWixVQUFVO2dCQUVWLFVBQVU7Z0JBRVYsY0FBYztnQkFDZCxTQUFTLEVBRVQsU0FBUyxFQUFFLGNBQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxFQUUzQixJQUFJLEVBQUUsRUFBYyxHQUNWLENBQUM7UUFDYixDQUFDLENBQUMsQ0FDRDtJQUNILENBQUM7Q0FFRCxDQUFBO0FBalR1QixvQkFBSyxHQUFHLE9BQU8sQ0FBQztBQUYzQixjQUFjO0lBRDFCLHdCQUFnQixFQUE4QztHQUNsRCxjQUFjLENBbVQxQjtBQW5UWSx3Q0FBYztBQXFUM0Isa0JBQWUsY0FBYyxDQUFDO0FBRTlCLFNBQVMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBRXpCLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQztTQUNkLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJO1FBRXRCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVwQixJQUFJLEtBQUssR0FBRyxLQUFLO2FBQ2YsSUFBSSxFQUFFO2FBQ04sT0FBTyxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUM7YUFDNUIsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FDM0I7UUFFRCxJQUFJLEtBQUssSUFBSSxPQUFPLElBQUksS0FBSyxJQUFJLE1BQU0sRUFDdkM7WUFDQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1NBQ1g7UUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxPQUFPLENBQUMsQ0FBQztRQUM3QixLQUFLLENBQUMsTUFBTSxFQUFFLENBQUE7SUFDZixDQUFDLENBQUMsQ0FDRDtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzMvMTcvMDE3LlxuICovXG5cbmltcG9ydCB7IG1pbmlmeUhUTUwsIHRyaW0gfSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCBOb3ZlbFNpdGVEZW1vLCB7IElEb3dubG9hZE9wdGlvbnMsIElOb3ZlbCwgSU9wdGlvbnNSdW50aW1lLCBJRmV0Y2hDaGFwdGVyIH0gZnJvbSAnLi4vZGVtby90cmVlJztcbmltcG9ydCB7IElSb3dWb2x1bWUsIFRyZWVOb2RlIH0gZnJvbSAnLi4vLi4vdHJlZS9pbmRleCc7XG5cbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyB0cmltRmlsZW5hbWUgfSBmcm9tICdmcy1pY29udi91dGlsJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAndXBhdGgyJztcbmltcG9ydCBub3ZlbEluZm8sIHsgSU1kY29uZk1ldGEgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IHsgZnJvbVVSTCwgSUZyb21VcmxPcHRpb25zLCBJSlNET00gfSBmcm9tICdqc2RvbS1leHRyYSc7XG5cbi8vaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcblxuaW1wb3J0IE5vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBkZWZhdWx0SlNET01PcHRpb25zLCBTWU1CT0xfQ0FDSEUgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgcmV0cnlSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vZmV0Y2gnO1xuaW1wb3J0IHsgemhSZWdFeHAgfSBmcm9tICdyZWdleHAtY2prJztcbmltcG9ydCB7IHBhcnNlVXJsLCBtYWtlVXJsLCBjaGVjayB9IGZyb20gJy4vdXRpbCc7XG5cbi8qKlxuICog6ZOF56yU5bCP6K+0XG4gKiBAZXhhbXBsZSBodHRwczovL3d3dy54MjNxYi5jb20vYm9vay8yODQvXG4gKi9cbkBzdGF0aWNJbXBsZW1lbnRzPE5vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZVgyM3FiPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZVgyM3FiIGV4dGVuZHMgTm92ZWxTaXRlRGVtb1xue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElES0VZID0gJ3gyM3FiJztcblxuXHQvKlxuXHRwcm90ZWN0ZWQgX2ZpeE9wdGlvbnNSdW50aW1lKG9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NID0gb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NIHx8IHt9O1xuXG5cdFx0Ly9vcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucnVuU2NyaXB0cyA9ICdkYW5nZXJvdXNseSc7XG5cblx0XHRyZXR1cm4gc3VwZXIuX2ZpeE9wdGlvbnNSdW50aW1lKG9wdGlvbnNSdW50aW1lKVxuXHR9XG5cdCAqL1xuXG5cdHByb3RlY3RlZCBfY2FjaGVfcmU6IFJlZ0V4cDtcblxuXHRzdGF0aWMgY2hlY2sodXJsOiBzdHJpbmcgfCBVUkwgfCBOb3ZlbFNpdGUuSVBhcnNlVXJsLCAuLi5hcmd2KTogYm9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIGNoZWNrKHVybCwgLi4uYXJndik7XG5cdH1cblxuXHRzdGF0aWMgbWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2w/OiBib29sZWFuIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIG1ha2VVcmwodXJsb2JqLCBib29sLCAuLi5hcmd2KVxuXHR9XG5cblx0c3RhdGljIHBhcnNlVXJsKHVybDogc3RyaW5nIHwgVVJMIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIHBhcnNlVXJsKHVybCwgLi4uYXJndik7XG5cdH1cblxuXHRtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbD86IGJvb2xlYW4gfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gbWFrZVVybCh1cmxvYmosIGJvb2wsIC4uLmFyZ3YpXG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IHN0cmluZyB8IFVSTCB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBwYXJzZVVybCh1cmwsIC4uLmFyZ3YpO1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9kZWNvZGVDaGFwdGVyPFQ+KHJldDogSUZldGNoQ2hhcHRlciwgb3B0aW9uc1J1bnRpbWU6IFQgJiBJT3B0aW9uc1J1bnRpbWUsIGNhY2hlKVxuXHR7XG5cdFx0Y29uc3QgeyBkb20gfSA9IHJldDtcblx0XHRjb25zdCB7ICQgfSA9IGRvbTtcblxuXHRcdGxldCBodG1sID0gZG9tLnNlcmlhbGl6ZSgpO1xuXG5cdFx0bGV0IG0gPSBodG1sXG5cdFx0XHQubWF0Y2goL2dldFRyYW5zbGF0aW9uXFwoWydcIl0oW15cXCdcIl0rKVsnXCJdL2kpXG5cdFx0O1xuXG5cdFx0aWYgKG0pXG5cdFx0e1xuXHRcdFx0bGV0IGNvZGUgPSBtWzFdO1xuXG5cdFx0XHRhd2FpdCByZXRyeVJlcXVlc3QocmV0LnVybCwge1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdC4uLm9wdGlvbnNSdW50aW1lLnJlcXVlc3RPcHRpb25zLFxuXHRcdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdFx0Zm9ybToge1xuXHRcdFx0XHRcdHBseGY6ICdnZXRUcmFuc2xhdGlvbicsXG5cdFx0XHRcdFx0cGx4YTogW2NvZGVdLFxuXHRcdFx0XHR9LFxuXHRcdFx0fSlcblx0XHRcdFx0LnRoZW4oKHY6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRcdHYgPSB2XG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvXFw8SmluSmluZ1xcPi8sICcnKVxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoL1xcPFxcL0ppbkppbmdcXD4vLCAnJylcblx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRyZXR1cm4gSlNPTi5wYXJzZSh2KVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQvKlxuXHRcdFx0XHQudGFwKHYgPT4ge1xuXHRcdFx0XHRcdGNvbnNvbGUuZGlyKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpXG5cdFx0XHRcdFx0Y29uc29sZS5kaXIodilcblx0XHRcdFx0XHRjb25zb2xlLmRpcignLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQgKi9cblx0XHRcdFx0LnRhcCgoYTogc3RyaW5nW10pID0+IHtcblxuXHRcdFx0XHRcdGxldCBlbGVtcyA9ICQoJy50cmFucycpO1xuXG5cdFx0XHRcdFx0YS5mb3JFYWNoKCh2LCBpKSA9PiB7XG5cdFx0XHRcdFx0XHRlbGVtcy5lcShpKS5odG1sKHYpO1xuXHRcdFx0XHRcdH0pXG5cblx0XHRcdFx0fSlcblx0XHRcdDtcblxuXHRcdH1cblxuXHRcdC8vY29uc29sZS5kaXIobSk7XG5cdFx0Ly9wcm9jZXNzLmV4aXQoKTtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyBfcGFyc2VDaGFwdGVyPFQ+KHJldCwgb3B0aW9uc1J1bnRpbWUsIGNhY2hlKVxuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdGxldCBodG1sID0gbWluaWZ5SFRNTCgkKCcjbWxmeV9tYWluX3RleHQnKS5odG1sKCkpO1xuXG5cdFx0XHQkKCcjbWxmeV9tYWluX3RleHQnKS5odG1sKGh0bWwpO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cblx0XHR9XG5cblx0XHRsZXQgZWxlbSA9IHJldC5kb20uJCgnI1RleHRDb250ZW50Jyk7XG5cblx0XHRlbGVtXG5cdFx0XHQuZmluZCgnPiAudHAsID4gLmtlLCA+IC5yZCwgPiAuYmQsIHNjcmlwdCcpXG5cdFx0XHQucmVtb3ZlKClcblx0XHQ7XG5cblx0XHRfcF8yX2JyKGVsZW0uZmluZCgncCcpLCByZXQuZG9tLiQpO1xuXG5cdFx0ZWxlbS5odG1sKGZ1bmN0aW9uIChpLCBvbGQ6IHN0cmluZylcblx0XHR7XG5cdFx0XHRyZXR1cm4gb2xkXG5cdFx0XHRcdC5yZXBsYWNlKC8oXFw8YnJcXD4pezMsNH0vZywgJyQxJylcblx0XHRcdFx0LnJlcGxhY2UoLyg/PD1cXDxiclxcPikoPz1bXlxcbl0pL2csICdcXG4nKVxuXHRcdH0pO1xuXG5cdFx0bGV0IHRpdGxlID0gdHJpbShyZXQuZG9tLiQoJ21sZnlfbWFpbl90ZXh0ID4gaDE6ZXEoMCknKS50ZXh0KCkpO1xuXG5cblx0XHRpZiAoIXRoaXMuX2NhY2hlX3JlKVxuXHRcdHtcblx0XHRcdHRoaXMuX2NhY2hlX3JlID0gbmV3IHpoUmVnRXhwKC9eKD866YmbXFxzKuethlxccyrlsI9cXHMq6KqqXFwod1xccyp3XFxzKndcXHMqXFwuXFxzKnhcXHMqMlxccyozXFxzKnFcXHMqYlxccypcXC5cXHMqY1xccypvXFxzKm1cXCkpJC91aWdtKVxuXHRcdH1cblxuXHRcdGxldCB0eHQ6IHN0cmluZyA9IGVsZW1cblx0XHRcdC50ZXh0KClcblx0XHRcdC5yZXBsYWNlKHRoaXMuX2NhY2hlX3JlLCAnJylcblx0XHRcdC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcblx0XHRcdC5yZXBsYWNlKC9eWyBcXHhBMF0rfFsgXFx4QTBdKyQvZ20sICcnKVxuXHRcdDtcblxuXHRcdHJldHVybiB0eHQgYXMgc3RyaW5nXG5cdH1cblxuXHRhc3luYyBnZXRfdm9sdW1lX2xpc3Q8VCBleHRlbmRzIElPcHRpb25zUnVudGltZT4odXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge30sXG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHR1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwodXJsIGFzIGFueSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfdGl0bGUgPSBkb20uJCgnLmRfdGl0bGUgaDEnKS50ZXh0KCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3B1Ymxpc2hlciA9IHNlbGYuSURLRVk7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybChkb20udXJsLmhyZWYpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kZXNjID0gJCgnI2Jvb2tpbnRybyA+IHA6ZXEoMCknKS50ZXh0KCk7XG5cblx0XHRcdFx0bGV0IHZvbHVtZV9saXN0ID0gW10gYXMgTm92ZWxTaXRlLklWb2x1bWVbXTtcblxuXHRcdFx0XHRjb25zdCBub3ZlbFRyZWUgPSBvcHRpb25zUnVudGltZS5ub3ZlbFRyZWU7XG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBUcmVlTm9kZTxJUm93Vm9sdW1lPjtcblxuXHRcdFx0XHRsZXQgdGFibGUgPSAkKCcjY2hhcHRlckxpc3QgbGknKVxuXHRcdFx0XHRcdC5maW5kKCdhJylcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGxldCBfY2FjaGVfZGF0ZXMgPSBbXTtcblxuXHRcdFx0XHRsZXQgdG90YWxfaWR4ID0gMDtcblxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHZvbHVtZV90aXRsZSA9ICdudWxsJztcblx0XHRcdFx0XHRsZXQgdm9sdW1lX2xldmVsID0gbnVsbDtcblxuXHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSBub3ZlbFRyZWUuYWRkVm9sdW1lKHtcblx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZSxcblx0XHRcdFx0XHRcdHZvbHVtZV9sZXZlbCxcblx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogbm92ZWxUcmVlLnJvb3QoKS5zaXplKCksXG5cdFx0XHRcdFx0XHR0b3RhbF9pZHg6IHRvdGFsX2lkeCsrLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGFibGVcblx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IHRyID0gZG9tLiQoZWxlbSk7XG5cblx0XHRcdFx0XHRcdGlmICgxKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgYSA9IHRyO1xuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlcl90aXRsZSA9IHRyaW0oYS50ZXh0KCksIHRydWUpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBocmVmID0gYS5wcm9wKCdocmVmJyk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGRhdGEgPSBzZWxmLnBhcnNlVXJsKGhyZWYpO1xuXG5cdFx0XHRcdFx0XHRcdGlmICghZGF0YS5jaGFwdGVyX2lkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGhyZWYgPSBzZWxmLm1ha2VVcmwoZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHRkYXRhLnVybCA9IGhyZWY7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlciA9IHtcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybDogaHJlZixcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhOiBkYXRhLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaW5kZXg6IGN1cnJlbnRWb2x1bWUuc2l6ZSgpLFxuXHRcdFx0XHRcdFx0XHRcdHRvdGFsX2lkeDogdG90YWxfaWR4KyssXG5cdFx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdFx0bm92ZWxUcmVlLmFkZENoYXB0ZXIoY2hhcHRlciwgY3VycmVudFZvbHVtZSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IGRhdGFfbWV0YTogSU1kY29uZk1ldGEgPSB7XG5cdFx0XHRcdFx0bm92ZWw6IHtcblx0XHRcdFx0XHRcdHRhZ3M6IFtdLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGUgPSBtb21lbnQoJCgnI3VwdGltZSA+IHNwYW4nKS50ZXh0KCkpO1xuXG5cdFx0XHRcdGxldCB0YWcgPSAkKCcuYm9va3JpZ2h0ICNjb3VudCBsaTplcSgwKSBzcGFuOmVxKDApJykudGV4dCgpLnRyaW0oKTtcblxuXHRcdFx0XHRpZiAodGFnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MucHVzaCh0YWcpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgbm92ZWxfYXV0aG9yID0gJCgnLnBfYXV0aG9yIGE6ZXEoMCknKS50ZXh0KCkudHJpbSgpO1xuXG5cdFx0XHRcdGRhdGFfbWV0YS5saW5rID0gZGF0YV9tZXRhLmxpbmsgfHwgW107XG5cdFx0XHRcdGRhdGFfbWV0YS5saW5rLnB1c2goJCgnLnBfYXV0aG9yIGE6ZXEoMCknKS5wcm9wKCdocmVmJykpO1xuXG5cdFx0XHRcdCQoJy5ib29rcmlnaHQgI2NvdW50IGxpIHNwYW4nKVxuXHRcdFx0XHRcdC5lYWNoKChpLCBlbGVtKSA9PiB7XG5cblx0XHRcdFx0XHRcdGxldCB0eHQgPSAkKGVsZW0pLnRleHQoKS50cmltKCk7XG5cblx0XHRcdFx0XHRcdGxldCBib29sID0gW1xuXHRcdFx0XHRcdFx0XHQn5a6M57WQ5riIJyxcblx0XHRcdFx0XHRcdFx0J+WujOe1kCcsXG5cdFx0XHRcdFx0XHRcdCflt7LlrozntZAnLFxuXHRcdFx0XHRcdFx0XHQn5bey5a6M5oiQJyxcblx0XHRcdFx0XHRcdFx0J+WujOe7k+a4iCcsXG5cdFx0XHRcdFx0XHRcdCflroznu5MnLFxuXHRcdFx0XHRcdFx0XHQn5bey5a6M57uTJyxcblx0XHRcdFx0XHRcdFx0J+W3suWujOaIkCcsXG5cdFx0XHRcdFx0XHRdLmluY2x1ZGVzKHR4dClcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0aWYgKGJvb2wpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC5zdGF0dXMgPSB0eHQ7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdC4uLmRhdGFfbWV0YSxcblxuXHRcdFx0XHRcdHVybDogZG9tLnVybCxcblx0XHRcdFx0XHR1cmxfZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxuXHRcdFx0XHRcdG5vdmVsX3B1Ymxpc2hlcixcblxuXHRcdFx0XHRcdG5vdmVsX2F1dGhvcixcblxuXHRcdFx0XHRcdG5vdmVsX2RhdGUsXG5cblx0XHRcdFx0XHRub3ZlbF9kZXNjLFxuXG5cdFx0XHRcdFx0Ly92b2x1bWVfbGlzdCxcblx0XHRcdFx0XHRub3ZlbFRyZWUsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlWDIzcWI7XG5cbmZ1bmN0aW9uIF9wXzJfYnIodGFyZ2V0LCAkKVxue1xuXHRyZXR1cm4gJCh0YXJnZXQpXG5cdFx0LmVhY2goZnVuY3Rpb24gKGksIGVsZW0pXG5cdFx0e1xuXHRcdFx0bGV0IF90aGlzID0gJChlbGVtKTtcblxuXHRcdFx0bGV0IF9odG1sID0gX3RoaXNcblx0XHRcdFx0Lmh0bWwoKVxuXHRcdFx0XHQucmVwbGFjZSgvKD86Jm5ic3A7PykvZywgJyAnKVxuXHRcdFx0XHQucmVwbGFjZSgvW1xceEEwXFxzXSskL2csICcnKVxuXHRcdFx0O1xuXG5cdFx0XHRpZiAoX2h0bWwgPT0gJzxici8+JyB8fCBfaHRtbCA9PSAnPGJyPicpXG5cdFx0XHR7XG5cdFx0XHRcdF9odG1sID0gJyc7XG5cdFx0XHR9XG5cblx0XHRcdF90aGlzLmFmdGVyKGAke19odG1sfTxici8+YCk7XG5cdFx0XHRfdGhpcy5yZW1vdmUoKVxuXHRcdH0pXG5cdFx0O1xufVxuIl19