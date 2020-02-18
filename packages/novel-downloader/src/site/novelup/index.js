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
let NovelSiteESJZone = /** @class */ (() => {
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
    return NovelSiteESJZone;
})();
exports.NovelSiteESJZone = NovelSiteESJZone;
exports.default = NovelSiteESJZone;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgscUNBQThDO0FBQzlDLHVDQUF1RztBQU92Ryw2Q0FBK0Q7QUFFL0Qsa0NBQWtDO0FBRWxDLG9DQUEwRjtBQUUxRixvQ0FBa0M7QUFFbEMsaUNBQWtEO0FBR2xEO0lBQUEsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBaUIsU0FBUSxjQUFhO1FBSWxEOzs7Ozs7Ozs7V0FTRztRQUVILE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBdUMsRUFBRSxHQUFHLElBQUk7WUFFNUQsT0FBTyxZQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBMkIsRUFBRSxJQUF1QixFQUFFLEdBQUcsSUFBSTtZQUUzRSxPQUFPLGNBQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDdEMsQ0FBQztRQUVELE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBMEIsRUFBRSxHQUFHLElBQUk7WUFFbEQsT0FBTyxlQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVELE9BQU8sQ0FBQyxNQUEyQixFQUFFLElBQXVCLEVBQUUsR0FBRyxJQUFJO1lBRXBFLE9BQU8sY0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUN0QyxDQUFDO1FBRUQsUUFBUSxDQUFDLEdBQTBCLEVBQUUsR0FBRyxJQUFJO1lBRTNDLE9BQU8sZUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFUyxLQUFLLENBQUMsY0FBYyxDQUFJLEdBQWtCLEVBQUUsY0FBbUMsRUFBRSxLQUFLO1lBRS9GLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUM7WUFDcEIsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztRQUNuQixDQUFDO1FBRVMsS0FBSyxDQUFDLGFBQWEsQ0FBSSxHQUFHLEVBQUUsY0FBYyxFQUFFLEtBQUs7WUFFMUQsSUFBSSxDQUFDLEdBQUcsRUFDUjtnQkFDQyxPQUFPLEVBQUUsQ0FBQzthQUNWO1lBRUQsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFcEIsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFNUMsSUFDQTtnQkFDQyxnREFBZ0Q7Z0JBRWhELDZCQUE2QjthQUM3QjtZQUNELE9BQU8sQ0FBQyxFQUNSO2FBRUM7WUFFRCxJQUFJLElBQUksR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRWhELElBQUksR0FBRyxHQUFXLENBQUMsTUFBTSxJQUFJO2lCQUMzQixJQUFJLEVBQUUsQ0FBQztnQkFDUix5QkFBeUI7aUJBQ3hCLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQzFCO1lBRUgsMkJBQTJCO1lBRXpCOzs7Ozs7O2VBT0c7WUFFTCxzQkFBc0I7WUFDdEIsRUFBRTtZQUNGLHFCQUFxQjtZQUVyQixxQkFBcUI7WUFDckIsRUFBRTtZQUNGLG1CQUFtQjtZQUVqQixPQUFPLEdBQWEsQ0FBQTtRQUNyQixDQUFDO1FBRUQsWUFBWSxDQUE0QixPQUE2QixFQUFFLFNBQWtCO1lBRXhGLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUksT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRXBELEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztZQUV2QyxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7UUFFRCxLQUFLLENBQUMsZUFBZSxDQUE0QixHQUFpQixFQUNqRSxpQkFBZ0QsRUFBRTtZQUdsRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7WUFFbEIsR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFVLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFFM0QsT0FBTyxxQkFBTyxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsWUFBWSxDQUFDO2lCQUM5QyxJQUFJLENBQUMsS0FBSyxXQUFXLEdBQVc7Z0JBRWhDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBRWhCLElBQUksU0FBUyxHQUFnQjtvQkFDNUIsS0FBSyxFQUFFLEVBRU47aUJBQ0QsQ0FBQztnQkFFRixJQUFJLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUVsRCxJQUFJLFdBQVcsR0FBRyxXQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBRXZFLElBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBRWpDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFM0MsSUFBSSxZQUFZLEdBQUcsV0FBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUN6RSxJQUFJLFVBQVUsQ0FBQztnQkFFZixNQUFNLFNBQVMsR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDO2dCQUMzQyxJQUFJLGFBQW1DLENBQUM7Z0JBRXhDLElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztnQkFFdEIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO2dCQUVsQjtvQkFDQyxJQUFJLFlBQVksR0FBRyxNQUFNLENBQUM7b0JBQzFCLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQztvQkFFeEIsYUFBYSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7d0JBQ25DLFlBQVk7d0JBQ1osWUFBWTt3QkFDWixZQUFZLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRTt3QkFDckMsU0FBUyxFQUFFLFNBQVMsRUFBRTtxQkFDdEIsQ0FBQyxDQUFDO2lCQUNIO2dCQUVELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO2dCQUU5RCxLQUFLO3FCQUNILElBQUksQ0FBQyxVQUFVLEtBQUssRUFBRSxJQUFJO29CQUUxQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRWpCLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFDckI7d0JBQ0MsSUFBSSxZQUFZLEdBQUcsV0FBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO3dCQUVuQyxJQUFJLFlBQVksSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLFlBQVksRUFDdEQ7NEJBRUMsYUFBYSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7Z0NBQ25DLFlBQVk7Z0NBQ1osWUFBWSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUU7Z0NBQ3JDLFNBQVMsRUFBRSxTQUFTLEVBQUU7NkJBQ3RCLENBQUMsQ0FBQzt5QkFFSDtxQkFDRDt5QkFFRDt3QkFHQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7d0JBQ25DLElBQUksYUFBYSxHQUFHLFdBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBRXpDLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBRTFCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBRS9CLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUNwQjs0QkFDQyxPQUFPO3lCQUNQOzZCQUVEOzRCQUNDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUUxQixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQzt5QkFDaEI7d0JBRUQsSUFBSSxPQUFPLEdBQUc7NEJBQ2IsYUFBYTs0QkFDYixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7NEJBQzNCLFdBQVcsRUFBRSxJQUFJOzRCQUNqQixnQkFBZ0IsRUFBRSxJQUFJOzRCQUN0QixhQUFhLEVBQUUsYUFBYSxDQUFDLElBQUksRUFBRTs0QkFDbkMsU0FBUyxFQUFFLFNBQVMsRUFBRTt5QkFDdEIsQ0FBQzt3QkFFRixTQUFTLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQTtxQkFDNUM7Z0JBQ0YsQ0FBQyxDQUFDLENBQ0Y7Z0JBRUQsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUVoRixJQUFJLFVBQVUsR0FBRyxXQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFFekUsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUVsRCxDQUFDLENBQUMsaUNBQWlDLENBQUM7cUJBQ2xDLElBQUksQ0FBQyx1Q0FBdUMsQ0FBQztxQkFDN0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFO29CQUVqQixTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBRWpELENBQUMsQ0FBQyxDQUNGO2dCQUVELE9BQU8sZ0NBRUgsU0FBUyxLQUVaLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUNaLFFBQVE7b0JBRVIsWUFBWTtvQkFDWixVQUFVO29CQUVWLFVBQVU7b0JBRVYsV0FBVztvQkFDWCxlQUFlO29CQUVmLGNBQWM7b0JBQ2QsU0FBUyxFQUVULFNBQVMsRUFBRSxjQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFFM0IsSUFBSSxFQUFFLEVBQWMsR0FDVixDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQ0Q7UUFDSCxDQUFDO0tBRUQsQ0FBQTtJQTdQdUIsc0JBQUssR0FBRyxTQUFTLENBQUM7SUFGN0IsZ0JBQWdCO1FBRDVCLHdCQUFnQixFQUFnRDtPQUNwRCxnQkFBZ0IsQ0ErUDVCO0lBQUQsdUJBQUM7S0FBQTtBQS9QWSw0Q0FBZ0I7QUFpUTdCLGtCQUFlLGdCQUFnQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzE3LzAxNy5cbiAqL1xuXG5pbXBvcnQgeyBtaW5pZnlIVE1MLCB0cmltIH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgTm92ZWxTaXRlRGVtbywgeyBJRG93bmxvYWRPcHRpb25zLCBJTm92ZWwsIElPcHRpb25zUnVudGltZSwgSUZldGNoQ2hhcHRlciB9IGZyb20gJy4uL2RlbW8vdHJlZSc7XG5pbXBvcnQgeyBJUm93Vm9sdW1lLCBUcmVlTm9kZSB9IGZyb20gJy4uLy4uL3RyZWUvaW5kZXgnO1xuXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYvdXRpbCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3VwYXRoMic7XG5pbXBvcnQgbm92ZWxJbmZvLCB7IElNZGNvbmZNZXRhIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcbmltcG9ydCB7IGZyb21VUkwsIElGcm9tVXJsT3B0aW9ucywgSUpTRE9NIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuXG4vL2ltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5cbmltcG9ydCBOb3ZlbFNpdGUsIHsgc3RhdGljSW1wbGVtZW50cywgZGVmYXVsdEpTRE9NT3B0aW9ucywgU1lNQk9MX0NBQ0hFIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgUHJvbWlzZUJsdWViaXJkLCBibHVlYmlyZERlY29yYXRvciB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IG1vbWVudCB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IHJldHJ5UmVxdWVzdCB9IGZyb20gJy4uLy4uL2ZldGNoJztcbmltcG9ydCB7IHBhcnNlVXJsLCBtYWtlVXJsLCBjaGVjayB9IGZyb20gJy4vdXRpbCc7XG5cbkBzdGF0aWNJbXBsZW1lbnRzPE5vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZUVTSlpvbmU+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlRVNKWm9uZSBleHRlbmRzIE5vdmVsU2l0ZURlbW9cbntcblx0cHVibGljIHN0YXRpYyByZWFkb25seSBJREtFWSA9ICdub3ZlbHVwJztcblxuXHQvKlxuXHRwcm90ZWN0ZWQgX2ZpeE9wdGlvbnNSdW50aW1lKG9wdGlvbnNSdW50aW1lKVxuXHR7XG5cdFx0b3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NID0gb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NIHx8IHt9O1xuXG5cdFx0Ly9vcHRpb25zUnVudGltZS5vcHRpb25zSlNET00ucnVuU2NyaXB0cyA9ICdkYW5nZXJvdXNseSc7XG5cblx0XHRyZXR1cm4gc3VwZXIuX2ZpeE9wdGlvbnNSdW50aW1lKG9wdGlvbnNSdW50aW1lKVxuXHR9XG5cdCAqL1xuXG5cdHN0YXRpYyBjaGVjayh1cmw6IHN0cmluZyB8IFVSTCB8IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIC4uLmFyZ3YpOiBib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gY2hlY2sodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdHN0YXRpYyBtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbD86IGJvb2xlYW4gfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gbWFrZVVybCh1cmxvYmosIGJvb2wsIC4uLmFyZ3YpXG5cdH1cblxuXHRzdGF0aWMgcGFyc2VVcmwodXJsOiBzdHJpbmcgfCBVUkwgfCBudW1iZXIsIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gcGFyc2VVcmwodXJsLCAuLi5hcmd2KTtcblx0fVxuXG5cdG1ha2VVcmwodXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sPzogYm9vbGVhbiB8IG51bWJlciwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBtYWtlVXJsKHVybG9iaiwgYm9vbCwgLi4uYXJndilcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogc3RyaW5nIHwgVVJMIHwgbnVtYmVyLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIHBhcnNlVXJsKHVybCwgLi4uYXJndik7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgX2RlY29kZUNoYXB0ZXI8VD4ocmV0OiBJRmV0Y2hDaGFwdGVyLCBvcHRpb25zUnVudGltZTogVCAmIElPcHRpb25zUnVudGltZSwgY2FjaGUpXG5cdHtcblx0XHRjb25zdCB7IGRvbSB9ID0gcmV0O1xuXHRcdGNvbnN0IHsgJCB9ID0gZG9tO1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIF9wYXJzZUNoYXB0ZXI8VD4ocmV0LCBvcHRpb25zUnVudGltZSwgY2FjaGUpXG5cdHtcblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0Y29uc3QgJCA9IHJldC5kb20uJDtcblxuXHRcdGxldCBzZWN0aW9uX2VwaXNvZGUgPSAkKCcjc2VjdGlvbl9lcGlzb2RlJyk7XG5cblx0XHR0cnlcblx0XHR7XG5cdFx0XHQvL2xldCBodG1sID0gbWluaWZ5SFRNTChzZWN0aW9uX2VwaXNvZGUuaHRtbCgpKTtcblxuXHRcdFx0Ly9zZWN0aW9uX2VwaXNvZGUuaHRtbChodG1sKTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXG5cdFx0fVxuXG5cdFx0bGV0IGVsZW0gPSBzZWN0aW9uX2VwaXNvZGUuZmluZCgnLmNvbnRlbnQgPiBwJyk7XG5cblx0XHRsZXQgdHh0OiBzdHJpbmcgPSAoYXdhaXQgZWxlbVxuXHRcdFx0LnRleHQoKSlcblx0XHRcdC8vLnJlcGxhY2UoL1xceDIwL2csICdcXG4nKVxuXHRcdFx0LnJlcGxhY2UoL15cXG4rfFxccyskL2csICcnKVxuXHRcdDtcblxuLy9cdFx0bGV0IGh0bWwgPSBlbGVtLmh0bWwoKTtcblxuXHRcdC8qXG5cdFx0bGV0IGh0bWwgPSBlbGVtLmh0bWwoKTtcblxuXHRcdHRocm93IGNvbnNvbGUuZGlyKHtcblx0XHRcdGh0bWwsXG5cdFx0XHR0eHQsXG5cdFx0fSk7XG5cdFx0ICovXG5cbi8vXHRcdGNvbnNvbGUuZGlyKGh0bWwpO1xuLy9cbi8vXHRcdGNvbnNvbGUuZGlyKHR4dCk7XG5cbi8vXHRcdGNvbnNvbGUuZGlyKHR4dCk7XG4vL1xuLy9cdFx0cHJvY2Vzcy5leGl0KCk7XG5cblx0XHRyZXR1cm4gdHh0IGFzIHN0cmluZ1xuXHR9XG5cblx0Z2V0T3V0cHV0RGlyPFQgZXh0ZW5kcyBJT3B0aW9uc1J1bnRpbWU+KG9wdGlvbnM/OiBUICYgSU9wdGlvbnNSdW50aW1lLCBub3ZlbE5hbWU/OiBzdHJpbmcpXG5cdHtcblx0XHRsZXQgcmV0ID0gc3VwZXIuZ2V0T3V0cHV0RGlyPFQ+KG9wdGlvbnMsIG5vdmVsTmFtZSk7XG5cblx0XHRyZXRbMV0ub3B0aW9uc0pTRE9NLm1pbmlmeUhUTUwgPSBmYWxzZTtcblxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRhc3luYyBnZXRfdm9sdW1lX2xpc3Q8VCBleHRlbmRzIElPcHRpb25zUnVudGltZT4odXJsOiBzdHJpbmcgfCBVUkwsXG5cdFx0b3B0aW9uc1J1bnRpbWU6IFBhcnRpYWw8VCAmIElEb3dubG9hZE9wdGlvbnM+ID0ge30sXG5cdCk6IFByb21pc2U8SU5vdmVsPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHR1cmwgPSBhd2FpdCB0aGlzLmNyZWF0ZU1haW5VcmwodXJsIGFzIGFueSwgb3B0aW9uc1J1bnRpbWUpO1xuXG5cdFx0cmV0dXJuIGZyb21VUkwodXJsLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoZG9tOiBJSlNET00pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0ICQgPSBkb20uJDtcblxuXHRcdFx0XHRsZXQgZGF0YV9tZXRhOiBJTWRjb25mTWV0YSA9IHtcblx0XHRcdFx0XHRub3ZlbDoge1xuXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRsZXQgc2VjdGlvbl93b3Jrc19pbmZvID0gJCgnI3NlY3Rpb25fd29ya3NfaW5mbycpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF90aXRsZSA9IHRyaW0oc2VjdGlvbl93b3Jrc19pbmZvLmZpbmQoJy5ub3ZlbF90aXRsZScpLnRleHQoKSk7XG5cblx0XHRcdFx0bGV0IG5vdmVsX3B1Ymxpc2hlciA9IHNlbGYuSURLRVk7XG5cblx0XHRcdFx0bGV0IHVybF9kYXRhID0gc2VsZi5wYXJzZVVybChkb20udXJsLmhyZWYpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9hdXRob3IgPSB0cmltKHNlY3Rpb25fd29ya3NfaW5mby5maW5kKCcubm92ZWxfYXV0aG9yJykudGV4dCgpKTtcblx0XHRcdFx0bGV0IG5vdmVsX2RhdGU7XG5cblx0XHRcdFx0Y29uc3Qgbm92ZWxUcmVlID0gb3B0aW9uc1J1bnRpbWUubm92ZWxUcmVlO1xuXHRcdFx0XHRsZXQgY3VycmVudFZvbHVtZTogVHJlZU5vZGU8SVJvd1ZvbHVtZT47XG5cblx0XHRcdFx0bGV0IF9jYWNoZV9kYXRlcyA9IFtdO1xuXG5cdFx0XHRcdGxldCB0b3RhbF9pZHggPSAwO1xuXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgdm9sdW1lX3RpdGxlID0gJ251bGwnO1xuXHRcdFx0XHRcdGxldCB2b2x1bWVfbGV2ZWwgPSBudWxsO1xuXG5cdFx0XHRcdFx0Y3VycmVudFZvbHVtZSA9IG5vdmVsVHJlZS5hZGRWb2x1bWUoe1xuXHRcdFx0XHRcdFx0dm9sdW1lX3RpdGxlLFxuXHRcdFx0XHRcdFx0dm9sdW1lX2xldmVsLFxuXHRcdFx0XHRcdFx0dm9sdW1lX2luZGV4OiBub3ZlbFRyZWUucm9vdCgpLnNpemUoKSxcblx0XHRcdFx0XHRcdHRvdGFsX2lkeDogdG90YWxfaWR4KyssXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgdGFibGUgPSAkKCcjc2VjdGlvbl9lcGlzb2RlIC5lcGlzb2RlX2xpc3QgdWw6ZXEoMCkgPiBsaScpO1xuXG5cdFx0XHRcdHRhYmxlXG5cdFx0XHRcdFx0LmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCB0ciA9ICQoZWxlbSk7XG5cblx0XHRcdFx0XHRcdGlmICh0ci5pcygnLmNoYXB0ZXInKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IHZvbHVtZV90aXRsZSA9IHRyaW0odHIudGV4dCgpKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAodm9sdW1lX3RpdGxlICE9IGN1cnJlbnRWb2x1bWUuY29udGVudC52b2x1bWVfdGl0bGUpXG5cdFx0XHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRWb2x1bWUgPSBub3ZlbFRyZWUuYWRkVm9sdW1lKHtcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV90aXRsZSxcblx0XHRcdFx0XHRcdFx0XHRcdHZvbHVtZV9pbmRleDogbm92ZWxUcmVlLnJvb3QoKS5zaXplKCksXG5cdFx0XHRcdFx0XHRcdFx0XHR0b3RhbF9pZHg6IHRvdGFsX2lkeCsrLFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHtcblxuXG5cdFx0XHRcdFx0XHRcdGxldCBhID0gdHIuZmluZCgnLmVwaXNvZGVfbGluayBhJyk7XG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyX3RpdGxlID0gdHJpbShhLnRleHQoKSwgdHJ1ZSk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGhyZWYgPSBhLnByb3AoJ2hyZWYnKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgZGF0YSA9IHNlbGYucGFyc2VVcmwoaHJlZik7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFkYXRhLmNoYXB0ZXJfaWQpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aHJlZiA9IHNlbGYubWFrZVVybChkYXRhKTtcblxuXHRcdFx0XHRcdFx0XHRcdGRhdGEudXJsID0gaHJlZjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGxldCBjaGFwdGVyID0ge1xuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdGl0bGUsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogZGF0YS5jaGFwdGVyX2lkLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsOiBocmVmLFxuXHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXJfdXJsX2RhdGE6IGRhdGEsXG5cdFx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pbmRleDogY3VycmVudFZvbHVtZS5zaXplKCksXG5cdFx0XHRcdFx0XHRcdFx0dG90YWxfaWR4OiB0b3RhbF9pZHgrKyxcblx0XHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0XHRub3ZlbFRyZWUuYWRkQ2hhcHRlcihjaGFwdGVyLCBjdXJyZW50Vm9sdW1lKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRkYXRhX21ldGEubm92ZWwuY292ZXIgPSBzZWN0aW9uX3dvcmtzX2luZm8uZmluZCgnLm5vdmVsX2NvdmVyIGltZycpLnByb3AoJ3NyYycpO1xuXG5cdFx0XHRcdGxldCBub3ZlbF9kZXNjID0gdHJpbShzZWN0aW9uX3dvcmtzX2luZm8uZmluZCgnLm5vdmVsX3N5bm9wc2lzJykudGV4dCgpKTtcblxuXHRcdFx0XHRkYXRhX21ldGEubm92ZWwudGFncyA9IGRhdGFfbWV0YS5ub3ZlbC50YWdzIHx8IFtdO1xuXG5cdFx0XHRcdCQoJyNzZWN0aW9uX2VwaXNvZGUgLmluZm9fdGFibGUgZGQnKVxuXHRcdFx0XHRcdC5maW5kKGBhW2hyZWYqPVwiW3RhZ11cIl0sIGFbaHJlZio9XCJnZW5yZVsxXVwiXWApXG5cdFx0XHRcdFx0LmVhY2goKGksIGVsZW0pID0+IHtcblxuXHRcdFx0XHRcdFx0ZGF0YV9tZXRhLm5vdmVsLnRhZ3MucHVzaCh0cmltKCQoZWxlbSkudGV4dCgpKSk7XG5cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0cmV0dXJuIHtcblxuXHRcdFx0XHRcdC4uLmRhdGFfbWV0YSxcblxuXHRcdFx0XHRcdHVybDogZG9tLnVybCxcblx0XHRcdFx0XHR1cmxfZGF0YSxcblxuXHRcdFx0XHRcdG5vdmVsX2F1dGhvcixcblx0XHRcdFx0XHRub3ZlbF9kYXRlLFxuXG5cdFx0XHRcdFx0bm92ZWxfZGVzYyxcblxuXHRcdFx0XHRcdG5vdmVsX3RpdGxlLFxuXHRcdFx0XHRcdG5vdmVsX3B1Ymxpc2hlcixcblxuXHRcdFx0XHRcdC8vdm9sdW1lX2xpc3QsXG5cdFx0XHRcdFx0bm92ZWxUcmVlLFxuXG5cdFx0XHRcdFx0Y2hlY2tkYXRlOiBtb21lbnQoKS5sb2NhbCgpLFxuXG5cdFx0XHRcdFx0aW1nczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdH0gYXMgSU5vdmVsO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU2l0ZUVTSlpvbmU7XG4iXX0=