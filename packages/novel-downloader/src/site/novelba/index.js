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
        url = await this.createMainUrl(url);
        return await jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
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
                    let t = $(this).text().replace(/^\s+|\s+$/g, '');
                    if (t) {
                        data_meta.novel.tags.push(t);
                    }
                });
            }
            return Object.assign({}, data_meta, { url: dom.url, url_data,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQThDO0FBQzlDLHVDQUF3RjtBQU14Riw2Q0FBK0Q7QUFFL0QseUNBQWdDO0FBRWhDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFHbEMsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBaUIsU0FBUSxjQUFhO0lBSWxELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBdUMsRUFBRSxPQUFRO1FBRTdELE9BQU8sZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLGVBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVELE9BQU8sQ0FBQyxNQUEyQixFQUFFLElBQWU7UUFFbkQsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFL0UsYUFBYTtRQUNiLE9BQU8sSUFBSSxlQUFHLENBQUMsNkJBQTZCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBRUQsUUFBUSxDQUFDLEdBQWlCO1FBRXpCLElBQUksTUFBTSxHQUFHO1lBQ1osR0FBRztZQUVILFNBQVMsRUFBRSxJQUFJO1lBQ2YsUUFBUSxFQUFFLElBQUk7WUFDZCxVQUFVLEVBQUUsSUFBSTtTQUVoQixDQUFDO1FBRUYsdUJBQXVCO1FBRXZCLElBQ0E7WUFDQyxhQUFhO1lBQ2IsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLGVBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQixhQUFhO1lBQ2IsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO1NBQ3RCO1FBQ0QsT0FBTyxDQUFDLEVBQ1I7WUFDQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7U0FDekM7UUFFRCxJQUFJLE9BQU8sR0FBRyxJQUFJLFFBQVEsRUFDMUI7WUFDQyxhQUFhO1lBQ2IsTUFBTSxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN6QjtRQUVELElBQUksQ0FBUyxDQUFDO1FBQ2QsSUFBSSxDQUFDLENBQUM7UUFFTixDQUFDLEdBQUcsWUFBWSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQ25CO1lBQ0MsTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsT0FBTyxNQUFNLENBQUM7U0FDZDtRQUVELENBQUMsR0FBRyx1REFBdUQsQ0FBQztRQUM1RCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUNuQjtZQUNDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXpCLE9BQU8sTUFBTSxDQUFDO1NBQ2Q7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFFUyxhQUFhLENBQUksR0FBRyxFQUFFLGNBQWMsRUFBRSxLQUFLO1FBRXBELElBQUksQ0FBQyxHQUFHLEVBQ1I7WUFDQyxPQUFPLEVBQUUsQ0FBQztTQUNWO1FBRUQsSUFDQTtZQUNDLElBQUksSUFBSSxHQUFHLGlCQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUV4RCxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDckM7UUFDRCxPQUFPLENBQUMsRUFDUjtTQUVDO1FBRUQsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyx1Q0FBdUMsQ0FBQzthQUN2RCxJQUFJLENBQUMsVUFBVSxLQUFLLEVBQUUsR0FBRztZQUV6QixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLENBQUE7UUFDaEQsQ0FBQyxDQUFDO2FBQ0QsSUFBSSxFQUFFO2FBQ04sT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FDekI7UUFDRixDQUFDO0lBQ0YsQ0FBQztJQUVELEtBQUssQ0FBQyxlQUFlLENBQTRCLEdBQWlCLEVBQ2pFLGlCQUFnRCxFQUFFO1FBR2xELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztRQUVsQixHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQVUsQ0FBQyxDQUFDO1FBRTNDLE9BQU8sTUFBTSxxQkFBTyxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsWUFBWSxDQUFDO2FBQ3BELElBQUksQ0FBQyxLQUFLLFdBQVcsR0FBVztZQUVoQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRWhCLENBQUMsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRS9DLElBQ0E7Z0JBQ0MsSUFBSSxJQUFJLEdBQUcsaUJBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFFNUQsR0FBRyxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN6QztZQUNELE9BQU8sQ0FBQyxFQUNSO2FBRUM7WUFFRCxJQUFJLFdBQVcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLGlDQUFpQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbEUsSUFBSSxZQUFZLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBRXRFLElBQUksVUFBa0IsQ0FBQztZQUV2QixVQUFVLEdBQUcsQ0FBQyxDQUFDLG9DQUFvQyxDQUFDO2lCQUNsRCxJQUFJLEVBQUU7aUJBQ04sT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUM7aUJBQzFCLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUM7aUJBQzdCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQ3JCO1lBRUQsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUVqQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFM0MsSUFBSSxXQUFXLEdBQUcsRUFBeUIsQ0FBQztZQUU1QyxNQUFNLFNBQVMsR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDO1lBQzNDLElBQUksYUFBbUMsQ0FBQztZQUV4QyxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBRTdELElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztZQUV0QixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFFbEIsS0FBSztpQkFDSCxJQUFJLENBQUMsVUFBVSxLQUFLO2dCQUVwQixJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVyQixJQUFJLENBQUMsRUFDTDtvQkFDQyxJQUFJLENBQUMsYUFBYSxFQUNsQjt3QkFDQzs7Ozs7OzBCQU1FO3dCQUVGLElBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQzt3QkFDMUIsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDO3dCQUV4QixhQUFhLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQzs0QkFDbkMsWUFBWTs0QkFDWixZQUFZOzRCQUNaLFlBQVksRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFOzRCQUNyQyxTQUFTLEVBQUUsU0FBUyxFQUFFO3lCQUN0QixDQUFDLENBQUM7cUJBQ0g7b0JBRUQsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFFM0IsSUFBSSxZQUFZLENBQUM7b0JBQ2pCLElBQUksRUFBRSxDQUFDO29CQUNQLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBRTNCLElBQUksRUFBRSxDQUFDLE1BQU0sRUFDYjt3QkFDQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFFNUIsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO3FCQUNaO29CQUVELElBQUksRUFBRSxFQUNOO3dCQUNDLFlBQVksR0FBRyxjQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQzt3QkFDbEQsWUFBWSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztxQkFDdkM7b0JBRUQsSUFBSSxhQUFhLEdBQUcsV0FBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFFekMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFFMUIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQ3BCO3dCQUNDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQTtxQkFDakI7eUJBRUQ7d0JBQ0MsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBRTFCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO3FCQUNoQjtvQkFFRCxJQUFJLE9BQU8sR0FBRzt3QkFDYixhQUFhO3dCQUNiLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTt3QkFDM0IsV0FBVyxFQUFFLElBQUk7d0JBQ2pCLGdCQUFnQixFQUFFLElBQUk7d0JBQ3RCLFlBQVk7d0JBQ1osYUFBYSxFQUFFLGFBQWEsQ0FBQyxJQUFJLEVBQUU7d0JBQ25DLFNBQVMsRUFBRSxTQUFTLEVBQUU7cUJBQ3RCLENBQUM7b0JBRUYsU0FBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUE7aUJBQzVDO1lBQ0YsQ0FBQyxDQUFDLENBQ0Y7WUFFRCxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFcEIsSUFBSSxVQUFVLEdBQUcsY0FBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRTVFLElBQUksU0FBUyxHQUFnQixFQUFFLENBQUM7WUFFaEM7Z0JBQ0MsU0FBUyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7Z0JBQ3JCLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFFMUIsQ0FBQyxDQUFDLCtCQUErQixDQUFDO3FCQUNoQyxJQUFJLENBQUM7b0JBRUwsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQ2pELElBQUksQ0FBQyxFQUNMO3dCQUNDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDN0I7Z0JBQ0YsQ0FBQyxDQUFDLENBQ0Y7YUFDRDtZQUVELE9BQU8sa0JBRUgsU0FBUyxJQUVaLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUNaLFFBQVE7Z0JBRVIsV0FBVztnQkFDWCxZQUFZO2dCQUVaLFVBQVU7Z0JBQ1YsVUFBVTtnQkFDVixlQUFlO2dCQUVmLGNBQWM7Z0JBQ2QsU0FBUyxFQUVULFNBQVMsRUFBRSxjQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFFM0IsSUFBSSxFQUFFLEVBQWMsR0FDVixDQUFDO1FBQ2IsQ0FBQyxDQUFDLENBQ0Q7SUFDSCxDQUFDO0NBRUQsQ0FBQTtBQXBSdUIsc0JBQUssR0FBRyxTQUFTLENBQUM7QUFGN0IsZ0JBQWdCO0lBRDVCLHdCQUFnQixFQUFnRDtHQUNwRCxnQkFBZ0IsQ0FzUjVCO0FBdFJZLDRDQUFnQjtBQXdSN0Isa0JBQWUsZ0JBQWdCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzMvMTcvMDE3LlxuICovXG5cbmltcG9ydCB7IG1pbmlmeUhUTUwsIHRyaW0gfSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCBOb3ZlbFNpdGVEZW1vLCB7IElEb3dubG9hZE9wdGlvbnMsIElOb3ZlbCwgSU9wdGlvbnNSdW50aW1lIH0gZnJvbSAnLi4vZGVtby90cmVlJztcbmltcG9ydCB7IElSb3dWb2x1bWUsIFRyZWVOb2RlIH0gZnJvbSAnLi4vLi4vdHJlZS9pbmRleCc7XG5cbmltcG9ydCBmcywgeyB0cmltRmlsZW5hbWUgfSBmcm9tICdmcy1pY29udic7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcblxuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tdXJsJztcblxuaW1wb3J0IE5vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBkZWZhdWx0SlNET01PcHRpb25zLCBTWU1CT0xfQ0FDSEUgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xuXG5Ac3RhdGljSW1wbGVtZW50czxOb3ZlbFNpdGUuSU5vdmVsU2l0ZVN0YXRpYzxOb3ZlbFNpdGVOb3ZlbGJhPj4oKVxuZXhwb3J0IGNsYXNzIE5vdmVsU2l0ZU5vdmVsYmEgZXh0ZW5kcyBOb3ZlbFNpdGVEZW1vXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURLRVkgPSAnbm92ZWxiYSc7XG5cblx0c3RhdGljIGNoZWNrKHVybDogc3RyaW5nIHwgVVJMIHwgTm92ZWxTaXRlLklQYXJzZVVybCwgb3B0aW9ucz8pOiBib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gL25vdmVsYmFcXC5jb20vaS50ZXN0KG5ldyBVUkwodXJsKS5ob3N0bmFtZSB8fCAnJyk7XG5cdH1cblxuXHRtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbCA/OiBib29sZWFuKTogVVJMXG5cdHtcblx0XHRsZXQgcGFkID0gKCFib29sICYmIHVybG9iai5jaGFwdGVyX2lkKSA/ICcvZXBpc29kZXMvJyArIHVybG9iai5jaGFwdGVyX2lkIDogJyc7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG5ldyBVUkwoYGh0dHBzOi8vbm92ZWxiYS5jb20vd29ya3MvJHt1cmxvYmoubm92ZWxfaWR9JHtwYWR9YCk7XG5cdH1cblxuXHRwYXJzZVVybCh1cmw6IHN0cmluZyB8IFVSTCk6IE5vdmVsU2l0ZS5JUGFyc2VVcmxcblx0e1xuXHRcdGxldCB1cmxvYmogPSB7XG5cdFx0XHR1cmwsXG5cblx0XHRcdG5vdmVsX3BpZDogbnVsbCxcblx0XHRcdG5vdmVsX2lkOiBudWxsLFxuXHRcdFx0Y2hhcHRlcl9pZDogbnVsbCxcblxuXHRcdH07XG5cblx0XHQvL3VybCA9IHVybC50b1N0cmluZygpO1xuXG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0dXJsb2JqLnVybCA9IG5ldyBVUkwodXJsKTtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHVybCA9IHVybG9iai51cmwuaHJlZjtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS53YXJuKGUudG9TdHJpbmcoKSArIGAgXCIke3VybH1cImApO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgdXJsICE9ICdzdHJpbmcnKVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IodXJsKTtcblx0XHR9XG5cblx0XHRsZXQgcjogUmVnRXhwO1xuXHRcdGxldCBtO1xuXG5cdFx0ciA9IC9eKFxcZHs2LH0pJC87XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdFx0cmV0dXJuIHVybG9iajtcblx0XHR9XG5cblx0XHRyID0gL25vdmVsYmFcXC5jb21cXC93b3Jrc1xcLyhcXGQrKSg/OlxcLyg/OmVwaXNvZGVzXFwvKFxcZCspKSk/L2c7XG5cdFx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0XHR7XG5cdFx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdFx0dXJsb2JqLmNoYXB0ZXJfaWQgPSBtWzJdO1xuXG5cdFx0XHRyZXR1cm4gdXJsb2JqO1xuXHRcdH1cblxuXHRcdHJldHVybiB1cmxvYmo7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3BhcnNlQ2hhcHRlcjxUPihyZXQsIG9wdGlvbnNSdW50aW1lLCBjYWNoZSk6IHN0cmluZ1xuXHR7XG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdGxldCBodG1sID0gbWluaWZ5SFRNTChyZXQuZG9tLiQoJy5lcGlzb2RlX2JveCcpLmh0bWwoKSk7XG5cblx0XHRcdHJldC5kb20uJCgnLmVwaXNvZGVfYm94JykuaHRtbChodG1sKTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldC5kb20uJCgnLmVwaXNvZGVfc2VjdGlvbiAuZXBpc29kZV9ib3ggLmRldGFpbCcpXG5cdFx0XHQuaHRtbChmdW5jdGlvbiAoaW5kZXgsIG9sZClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIG9sZC5yZXBsYWNlKC8oPzw9XFw8YnJcXD4pXFxyP1xcbj8vaWcsICdcXG4nKVxuXHRcdFx0fSlcblx0XHRcdC50ZXh0KClcblx0XHRcdC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcblx0XHRcdDtcblx0XHQ7XG5cdH1cblxuXHRhc3luYyBnZXRfdm9sdW1lX2xpc3Q8VCBleHRlbmRzIElPcHRpb25zUnVudGltZT4odXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge30sXG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHR1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwodXJsIGFzIGFueSk7XG5cblx0XHRyZXR1cm4gYXdhaXQgZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkb206IElKU0RPTSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXG5cdFx0XHRcdCQoJy53b3JrX3NlY3Rpb24gLnN1bW1hcnlfYm94IGEubW9yZScpLmNsaWNrKCk7XG5cblx0XHRcdFx0dHJ5XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgaHRtbCA9IG1pbmlmeUhUTUwoZG9tLiQoJy5zdW1tYXJ5X2JveCAuZGV0YWlsJykuaHRtbCgpKTtcblxuXHRcdFx0XHRcdGRvbS4kKCcuc3VtbWFyeV9ib3ggLmRldGFpbCcpLmh0bWwoaHRtbCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHRcdHtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IG5vdmVsX3RpdGxlID0gZG9tLiQoJy53b3JrX3NlY3Rpb24gLmluZm9fbGlzdCAudGl0bGUnKS50ZXh0KCk7XG5cdFx0XHRcdGxldCBub3ZlbF9hdXRob3IgPSBkb20uJCgnLndvcmtfc2VjdGlvbiAuaW5mb19saXN0IC5hdXRob3IgYScpLnRleHQoKTtcblxuXHRcdFx0XHRsZXQgbm92ZWxfZGVzYzogc3RyaW5nO1xuXG5cdFx0XHRcdG5vdmVsX2Rlc2MgPSAkKCcud29ya19zZWN0aW9uIC5zdW1tYXJ5X2JveCAuZGV0YWlsJylcblx0XHRcdFx0XHQudGV4dCgpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL15bIFxceGEwXSsvZ20sICcnKVxuXHRcdFx0XHRcdC5yZXBsYWNlKC9bIFxcdOOAgFxceGEwXSskL2dtLCAnJylcblx0XHRcdFx0XHQucmVwbGFjZSgvXFxzKyQvZywgJycpXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgbm92ZWxfcHVibGlzaGVyID0gc2VsZi5JREtFWTtcblxuXHRcdFx0XHRsZXQgdXJsX2RhdGEgPSBzZWxmLnBhcnNlVXJsKGRvbS51cmwuaHJlZik7XG5cblx0XHRcdFx0bGV0IHZvbHVtZV9saXN0ID0gW10gYXMgTm92ZWxTaXRlLklWb2x1bWVbXTtcblxuXHRcdFx0XHRjb25zdCBub3ZlbFRyZWUgPSBvcHRpb25zUnVudGltZS5ub3ZlbFRyZWU7XG5cdFx0XHRcdGxldCBjdXJyZW50Vm9sdW1lOiBUcmVlTm9kZTxJUm93Vm9sdW1lPjtcblxuXHRcdFx0XHRsZXQgdGFibGUgPSBkb20uJCgnLmVwaXNvZGVfYm94JykuZmluZCgnLmVwaXNvZGVfbGlzdCA+IGxpJyk7XG5cblx0XHRcdFx0bGV0IF9jYWNoZV9kYXRlcyA9IFtdO1xuXG5cdFx0XHRcdGxldCB0b3RhbF9pZHggPSAwO1xuXG5cdFx0XHRcdHRhYmxlXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCB0ciA9IGRvbS4kKHRoaXMpO1xuXG5cdFx0XHRcdFx0XHRpZiAoMSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKCFjdXJyZW50Vm9sdW1lKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gdm9sdW1lX2xpc3Rbdm9sdW1lX2xpc3QubGVuZ3RoXSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogdm9sdW1lX2xpc3QubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlOiAnbnVsbCcsXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2xpc3Q6IFtdLFxuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdFx0XHRcdGxldCB2b2x1bWVfdGl0bGUgPSAnbnVsbCc7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IHZvbHVtZV9sZXZlbCA9IG51bGw7XG5cblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50Vm9sdW1lID0gbm92ZWxUcmVlLmFkZFZvbHVtZSh7XG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfdGl0bGUsXG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfbGV2ZWwsXG5cdFx0XHRcdFx0XHRcdFx0XHR2b2x1bWVfaW5kZXg6IG5vdmVsVHJlZS5yb290KCkuc2l6ZSgpLFxuXHRcdFx0XHRcdFx0XHRcdFx0dG90YWxfaWR4OiB0b3RhbF9pZHgrKyxcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBhID0gdHIuZmluZCgnYTplcSgwKScpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX2RhdGU7XG5cdFx0XHRcdFx0XHRcdGxldCBkZDtcblx0XHRcdFx0XHRcdFx0bGV0IGRhID0gYS5maW5kKCcudXBkYXRlJyk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKGRhLmxlbmd0aClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGRkID0gZGEuZmluZCgndGltZScpLnRleHQoKTtcblxuXHRcdFx0XHRcdFx0XHRcdGRhLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKGRkKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9kYXRlID0gbW9tZW50KGRkLCBbJ1lZWVkvTU0vREQnXSkubG9jYWwoKTtcblx0XHRcdFx0XHRcdFx0XHRfY2FjaGVfZGF0ZXMucHVzaChjaGFwdGVyX2RhdGUudW5peCgpKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3RpdGxlID0gdHJpbShhLnRleHQoKSwgdHJ1ZSk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGhyZWYgPSBhLnByb3AoJ2hyZWYnKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgZGF0YSA9IHNlbGYucGFyc2VVcmwoaHJlZik7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFkYXRhLmNoYXB0ZXJfaWQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGhyZWYgPSBzZWxmLm1ha2VVcmwoZGF0YSk7XG5cblx0XHRcdFx0XHRcdFx0XHRkYXRhLnVybCA9IGhyZWY7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgY2hhcHRlciA9IHtcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3RpdGxlLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfaWQ6IGRhdGEuY2hhcHRlcl9pZCxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybDogaHJlZixcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX3VybF9kYXRhOiBkYXRhLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfZGF0ZSxcblx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyX2luZGV4OiBjdXJyZW50Vm9sdW1lLnNpemUoKSxcblx0XHRcdFx0XHRcdFx0XHR0b3RhbF9pZHg6IHRvdGFsX2lkeCsrLFxuXHRcdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRcdG5vdmVsVHJlZS5hZGRDaGFwdGVyKGNoYXB0ZXIsIGN1cnJlbnRWb2x1bWUpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdF9jYWNoZV9kYXRlcy5zb3J0KCk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX2RhdGUgPSBtb21lbnQudW5peChfY2FjaGVfZGF0ZXNbX2NhY2hlX2RhdGVzLmxlbmd0aCAtIDFdKS5sb2NhbCgpO1xuXG5cdFx0XHRcdGxldCBkYXRhX21ldGE6IElNZGNvbmZNZXRhID0ge307XG5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbCA9IHt9O1xuXHRcdFx0XHRcdGRhdGFfbWV0YS5ub3ZlbC50YWdzID0gW107XG5cblx0XHRcdFx0XHQkKCcud29ya19zZWN0aW9uIC5rZXl3b3JkX2xpc3QgYScpXG5cdFx0XHRcdFx0XHQuZWFjaChmdW5jdGlvbiAoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgdCA9ICQodGhpcykudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcblx0XHRcdFx0XHRcdFx0aWYgKHQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncy5wdXNoKHQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiB7XG5cblx0XHRcdFx0XHQuLi5kYXRhX21ldGEsXG5cblx0XHRcdFx0XHR1cmw6IGRvbS51cmwsXG5cdFx0XHRcdFx0dXJsX2RhdGEsXG5cblx0XHRcdFx0XHRub3ZlbF90aXRsZSxcblx0XHRcdFx0XHRub3ZlbF9hdXRob3IsXG5cblx0XHRcdFx0XHRub3ZlbF9kZXNjLFxuXHRcdFx0XHRcdG5vdmVsX2RhdGUsXG5cdFx0XHRcdFx0bm92ZWxfcHVibGlzaGVyLFxuXG5cdFx0XHRcdFx0Ly92b2x1bWVfbGlzdCxcblx0XHRcdFx0XHRub3ZlbFRyZWUsXG5cblx0XHRcdFx0XHRjaGVja2RhdGU6IG1vbWVudCgpLmxvY2FsKCksXG5cblx0XHRcdFx0XHRpbWdzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0fSBhcyBJTm92ZWw7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTaXRlTm92ZWxiYTtcbiJdfQ==