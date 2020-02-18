"use strict";
/**
 * Created by user on 2017/12/6/006.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const util_1 = require("fs-iconv/util");
const path = require("upath2");
const node_novel_info_1 = require("node-novel-info");
const jsdom_extra_1 = require("jsdom-extra");
const index_1 = require("../index");
const index_2 = require("../index");
const index_3 = require("../index");
const shortid = require("shortid");
const fetch_1 = require("../../fetch");
const jsdom_1 = require("../../jsdom");
/**
 * @deprecated
 */
// @ts-ignore
let NovelSiteDmzj = /** @class */ (() => {
    let NovelSiteDmzj = class NovelSiteDmzj extends index_1.default {
        _makeUrl(urlobj, page) {
            if (!urlobj.chapter_id) {
                if (!urlobj.volume_id) {
                    return `http://q.dmzj.com/${urlobj.novel_id}/index.shtml`;
                }
                return `http://q.dmzj.com/${urlobj.novel_id}/${urlobj.volume_id}/${urlobj.volume_id}.txt`;
            }
            return `http://q.dmzj.com/${urlobj.novel_id}/${urlobj.volume_id}/${urlobj.chapter_id}${page
                ? '_' + page
                : ''}.shtml`;
        }
        makeUrl(urlobj, bool) {
            let url = this._makeUrl(urlobj, bool);
            // @ts-ignore
            return new URL(url);
        }
        parseUrl(url) {
            let urlobj = {
                // @ts-ignore
                url: new URL(url),
                novel_id: null,
                volume_id: null,
                chapter_id: null,
            };
            url = urlobj.url.href;
            let r = /(?:q\.dmzj\.com\/|^\/)(?:(\d+)\/(?:(\d+)\/(?:(\d+)[\._])?)?)/;
            let m = r.exec(url.toString());
            if (m) {
                urlobj.novel_id = m[1];
                urlobj.volume_id = m[2];
                urlobj.chapter_id = m[3];
            }
            // @ts-ignore
            return urlobj;
        }
        // @ts-ignore
        download(url, downloadOptions = {}) {
            const self = this;
            const [PATH_NOVEL_MAIN, optionsRuntime] = this.getOutputDir(downloadOptions);
            /*
            optionsRuntime.optionsJSDOM = Object.assign({}, defaultJSDOMOptions, optionsRuntime.optionsJSDOM, {
                runScripts: 'dangerously',
            });
            */
            optionsRuntime.optionsJSDOM = jsdom_1.createOptionsJSDOM(optionsRuntime.optionsJSDOM, {
                runScripts: 'dangerously',
            });
            let path_main;
            return index_2.PromiseBluebird
                .bind(self)
                .then(async function () {
                let _data = await self._download_info(url, optionsRuntime);
                path_main = path.join(self.PATH_NOVEL_MAIN, util_1.trimFilename(`${_data.data.g_lnovel_name}_(${_data.data.g_lnovel_id})`));
                let _a = _data.value.reduce(function (a, b) {
                    return a.concat(b.chapter);
                }, []);
                let _f = await index_2.PromiseBluebird
                    .mapSeries(_a, function (a, index, len) {
                    let pad_len = len.toString().length > 4 ? len.toString().length : 4;
                    // @ts-ignore
                    let volume_name = a.volume_name;
                    // @ts-ignore
                    console.log(a.url);
                    // @ts-ignore
                    return self._downloadChapter(a.url, optionsRuntime)
                        .then(async function (data) {
                        let _file = path.join(path_main, 
                        // @ts-ignore
                        util_1.trimFilename(`${a.index_volume.toString()
                            .padStart(pad_len, '0')} ${volume_name}_(${data.data.g_volume_id})`), 
                        // @ts-ignore
                        util_1.trimFilename(`${a.index.toString()
                            .padStart(pad_len, '0')}_${data.data.chapter_name}.${data.data.g_chapter_id}`));
                        await fs.outputJson(_file + '.json', data, {
                            spaces: "\t",
                        });
                        await fs.outputFile(_file + '.txt', data.value);
                        return path.relative(self.PATH_NOVEL_MAIN, _file);
                    })
                        .then(function (file) {
                        console.log('done', file);
                        return file;
                    });
                })
                    .then(function (ret) {
                    //console.log('done', ret);
                    return ret;
                });
                // @ts-ignore
                _data.checkdate = index_3.moment().tz(index_3.moment.tz.guess());
                // @ts-ignore
                _data.files = _f;
                return _data;
            })
                .tap(async function (novel) {
                await fs.outputJson(path.join(path_main, util_1.trimFilename(`${novel.data.g_lnovel_name}.${novel.data.g_lnovel_id}`)) + '.json', novel, {
                    spaces: "\t",
                });
                let options = {};
                options[self.IDKEY] = {
                //txtdownload_id: novel.novel_syosetu_id,
                };
                let md = node_novel_info_1.default.stringify({
                    novel: {
                        tags: [
                            self.IDKEY,
                        ],
                        series: {
                            // @ts-ignore
                            name: novel.novel_series_title || '',
                        },
                    },
                    options,
                    // @ts-ignore
                    link: novel.link || [],
                }, novel, {
                    options: {
                        textlayout: {
                            allow_lf2: true,
                        }
                    },
                });
                let file = path.join(path_main, `README.md`);
                await fs.outputFile(file, md);
            });
        }
        async _download_info(url, optionsRuntime = {}) {
            const self = this;
            {
                let data = self.parseUrl(url);
                if (!data.novel_id) {
                    throw new ReferenceError();
                }
                url = self.makeUrl({
                    novel_id: data.novel_id,
                });
            }
            let _data = {
                url: url,
                data: {},
                value: null,
            };
            return await jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
                .then(function (dom) {
                const $ = dom.$;
                // @ts-ignore
                const window = dom.window;
                //console.log(dom.serialize());
                _data.data.g_lnovel_id = window.g_lnovel_id;
                _data.data.g_lnovel_name = window.g_lnovel_name;
                _data.data.cover_pic = $('#cover_pic').attr('src');
                {
                    let _t = $('.main .pic .con').text();
                    _data.data.con = _t;
                    if (_t.match(/作者：(.+)/)) {
                        _data.data.author = RegExp.$1;
                    }
                    if (_t.match(/类型：(.+)/)) {
                        _data.data.type = (RegExp.$1).toString().split('/');
                    }
                    if (_t.match(/状态：(.+)/)) {
                        _data.data.status = RegExp.$1;
                    }
                    if (_t.match(/更新：(.+)/)) {
                        _data.data.lastupdate = index_3.moment.tz(RegExp.$1, 'YYYY-MM-DD HH:mm:ss', 'Asia/Taipei');
                    }
                }
                // @ts-ignore
                _data.data.desc = $('#detail_block > .ilist:has(> h3) > p').text();
                window.volume_list = window.volume_list.reverse();
                window.chapter_list = window.chapter_list.reverse();
                let list = [];
                for (let v in window.chapter_list) {
                    let volume_name = $(window.volume_list[v]).find('.chapnamesub').text();
                    window.chapter_list[v] = window.chapter_list[v].reverse();
                    //let data = parseUrl($(dom.window.chapter_list[v][0]).attr('href'));
                    list[v] = {
                        index: v,
                        novel_id: null,
                        volume_name: volume_name,
                        volume_id: null,
                        chapter: [],
                    };
                    for (let ci in window.chapter_list[v]) {
                        if (!window.chapter_list[v][ci]) {
                            continue;
                        }
                        let _a = $(window.chapter_list[v][ci]);
                        //console.log(_a);
                        let _d = self.parseUrl(_a.prop('href'));
                        if (!list[v].volume_id) {
                            list[v].novel_id = _d.novel_id;
                            list[v].volume_id = _d.volume_id;
                        }
                        list[v].chapter.push({
                            index: ci,
                            index_volume: v,
                            novel_id: _d.novel_id,
                            volume_id: _d.volume_id,
                            volume_name: volume_name,
                            chapter_name: _a.text(),
                            chapter_id: _d.chapter_id,
                            url: _a.prop('href'),
                        });
                    }
                }
                _data.value = list;
                return _data;
            })
                .then(function (_data) {
                // @ts-ignore
                _data.checkdate = index_3.moment().tz(index_3.moment.tz.guess());
                return _data;
            });
        }
        async _downloadChapter(data, optionsRuntime) {
            const self = this;
            let url;
            {
                data = self.parseUrl(data);
                if (!data.novel_id) {
                    throw new ReferenceError();
                }
                url = self.makeUrl(data);
            }
            let _data = {};
            let $;
            return jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
                .then(async (dom) => {
                let window = dom.window;
                $ = dom.$;
                let chapter_name = window.g_chapter_name
                    .replace(/\\/ig, '')
                    .replace(/^[\s\uFEFF\xA0　]+|[\s\uFEFF\xA0　]+$/g, '');
                let volume_name = window.document
                    .querySelector('#page_contents .tit')
                    .innerHTML
                    .replace(/\\/ig, '')
                    .replace(chapter_name, '')
                    .replace(/^[\s\uFEFF\xA0　]+|[\s\uFEFF\xA0　]+$/g, '');
                _data = {
                    url: url,
                    data: {
                        g_lnovel_id: window.g_lnovel_id,
                        g_volume_id: window.g_volume_id,
                        g_chapter_id: window.g_chapter_id,
                        g_lnovel_name: window.g_lnovel_name,
                        g_volume_name: volume_name,
                        g_chapter_name: chapter_name,
                        chapter_name: chapter_name,
                        volume_name: volume_name,
                    },
                    value: null,
                };
                let pa = [];
                pa[0] = window.document.querySelector("#chapter_contents_first").innerHTML;
                if (window.g_chapter_pages_count > 1) {
                    let ua = window.g_chapter_pages_url
                        .filter(function (value) {
                        return value;
                    })
                        .map(function (value, index, array) {
                        if (value) {
                            value = 'http://q.dmzj.com/' + value;
                        }
                        return value;
                    });
                    await fetch_1.manyRequest(ua, {
                        encoding: null,
                        resolveWithFullResponse: true,
                    })
                        .then(async function (ret) {
                        pa = pa.concat(ret.map(function (value, index, array) {
                            //console.log(value.body);
                            return value.body.toString();
                        }));
                    });
                }
                return pa;
            })
                .then(async function (pa) {
                _data.imgs = [];
                pa = await index_2.PromiseBluebird.mapSeries(pa, async function (value, idx) {
                    let _c = {};
                    //let $ = cheerio.load(value);
                    let _a = $(value);
                    let _img = _a.find('img');
                    //console.log(_img.length);
                    if (_img.length) {
                        _img.each(function (index, elem) {
                            // @ts-ignore
                            let _this = $(this);
                            if (_this.prop('src')) {
                                let id = shortid();
                                _c[id] = _this.prop('src');
                                _data.imgs.push(_c[id]);
                                // @ts-ignore
                                $(`<span>{{@${id}@}}</span>`).insertAfter(this);
                                // @ts-ignore
                                $(this)
                                    .remove();
                            }
                        });
                        //console.log($.html());
                    }
                    let _t = _a.text();
                    for (let id in _c) {
                        /*
                        if (!/^(?:[a-z]\:|\:)?\/\//i.test(_c[id]))
                        {
                            _c[id] = 'http://q.dmzj.com/' + _c[id];
                        }
                        */
                        /*
                        await download_image(_c[id], {
                            fromfile: file,
                            prefix: 'img_' + (_idx++).toString().padStart(3, '0') + '_',
                        });
                        */
                        _t = _t.replace(`{{@${id}@}}`, `\n\n<img src="${_c[id]}"/>\n\n`);
                    }
                    return _t;
                });
                return pa.join("\n");
            })
                .then(function (html) {
                return html
                    .replace(/^\s*(?:<p>)?/i, '')
                    .replace(/\s*<(?:\/?p|br\/?)>\s*$/i, '')
                    .replace(/\r\n|\r(?!\n)/g, "\n")
                    //.replace(/<\/p><p>\n/ig, "\n")
                    //.replace(/<p><\/p>/ig, "\n")
                    //.replace(/(<\/p>|<p>)\n/ig, "\n")
                    .replace(/[\t\uFEFF\xA0　]+(\n|$)/ig, "$1")
                    .replace(/(\n)[\t]+/ig, "$1")
                    .replace(/\s+$/ig, "")
                    .replace(/\n{3,}/ig, "\n\n");
            })
                .then(function (html) {
                _data.value = html;
                _data.checkdate = index_3.moment().tz(index_3.moment.tz.guess());
                return _data;
            });
        }
    };
    NovelSiteDmzj.disabled = true;
    NovelSiteDmzj.IDKEY = 'dmzj';
    NovelSiteDmzj = __decorate([
        index_1.staticImplements()
    ], NovelSiteDmzj);
    return NovelSiteDmzj;
})();
exports.NovelSiteDmzj = NovelSiteDmzj;
exports.default = NovelSiteDmzj;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7O0FBRUgsK0JBQWdDO0FBQ2hDLHdDQUE2QztBQUM3QywrQkFBK0I7QUFDL0IscURBQXlEO0FBQ3pELDZDQUErRDtBQU0vRCxvQ0FBMEY7QUFDMUYsb0NBQThEO0FBQzlELG9DQUFrQztBQUNsQyxtQ0FBbUM7QUFDbkMsdUNBQTBDO0FBQzFDLHVDQUFpRDtBQUVqRDs7R0FFRztBQUNILGFBQWE7QUFFYjtJQUFBLElBQWEsYUFBYSxHQUExQixNQUFhLGFBQWMsU0FBUSxlQUFTO1FBTTNDLFFBQVEsQ0FBQyxNQUEyQixFQUFFLElBQUs7WUFFMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQ3RCO2dCQUNDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUNyQjtvQkFDQyxPQUFPLHFCQUFxQixNQUFNLENBQUMsUUFBUSxjQUFjLENBQUM7aUJBQzFEO2dCQUVELE9BQU8scUJBQXFCLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsU0FBUyxNQUFNLENBQUM7YUFDMUY7WUFFRCxPQUFPLHFCQUFxQixNQUFNLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJO2dCQUMxRixDQUFDLENBQUMsR0FBRyxHQUFHLElBQUk7Z0JBQ1osQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDO1FBQ2YsQ0FBQztRQUVELE9BQU8sQ0FBQyxNQUEyQixFQUFFLElBQWM7WUFFbEQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFdEMsYUFBYTtZQUNiLE9BQU8sSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckIsQ0FBQztRQUVELFFBQVEsQ0FBQyxHQUFp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bkIsT0FBTyxJQUFJO3FCQUNULE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDO3FCQUM1QixPQUFPLENBQUMsMEJBQTBCLEVBQUUsRUFBRSxDQUFDO3FCQUN2QyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDO29CQUNoQyxnQ0FBZ0M7b0JBQ2hDLDhCQUE4QjtvQkFDOUIsbUNBQW1DO3FCQUNsQyxPQUFPLENBQUMsMEJBQTBCLEVBQUUsSUFBSSxDQUFDO3FCQUN6QyxPQUFPLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQztxQkFDNUIsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7cUJBQ3JCLE9BQU8sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQzNCO1lBQ0gsQ0FBQyxDQUFDO2lCQUNELElBQUksQ0FBQyxVQUFVLElBQUk7Z0JBRW5CLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUNuQixLQUFLLENBQUMsU0FBUyxHQUFHLGNBQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxjQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBRWpELE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQ0Q7UUFDSCxDQUFDO0tBRUQsQ0FBQTtJQXBoQk8sc0JBQVEsR0FBRyxJQUFJLENBQUM7SUFFaEIsbUJBQUssR0FBRyxNQUFNLENBQUM7SUFKVixhQUFhO1FBRHpCLHdCQUFnQixFQUE2QztPQUNqRCxhQUFhLENBc2hCekI7SUFBRCxvQkFBQztLQUFBO0FBdGhCWSxzQ0FBYTtBQXdoQjFCLGtCQUFlLGFBQWEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTcvMTIvNi8wMDYuXG4gKi9cblxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IHRyaW1GaWxlbmFtZSB9IGZyb20gJ2ZzLWljb252L3V0aWwnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICd1cGF0aDInO1xuaW1wb3J0IG5vdmVsSW5mbywgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBmcm9tVVJMLCBJRnJvbVVybE9wdGlvbnMsIElKU0RPTSB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCB7IExhenlDb29raWUsIExhenlDb29raWVKYXIgfSBmcm9tICdqc2RvbS1leHRyYSc7XG4vL2ltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLXVybCc7XG5pbXBvcnQgeyBkb3dubG9hZF9pbWFnZSB9IGZyb20gJy4uL2ltYWdlJztcblxuaW1wb3J0IE5vdmVsU2l0ZSwgeyBzdGF0aWNJbXBsZW1lbnRzLCBkZWZhdWx0SlNET01PcHRpb25zLCBTWU1CT0xfQ0FDSEUgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBQcm9taXNlQmx1ZWJpcmQsIGJsdWViaXJkRGVjb3JhdG9yIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgbW9tZW50IH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0ICogYXMgc2hvcnRpZCBmcm9tICdzaG9ydGlkJztcbmltcG9ydCB7IG1hbnlSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vZmV0Y2gnO1xuaW1wb3J0IHsgY3JlYXRlT3B0aW9uc0pTRE9NIH0gZnJvbSAnLi4vLi4vanNkb20nO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkXG4gKi9cbi8vIEB0cy1pZ25vcmVcbkBzdGF0aWNJbXBsZW1lbnRzPE5vdmVsU2l0ZS5JTm92ZWxTaXRlU3RhdGljPE5vdmVsU2l0ZURtemo+PigpXG5leHBvcnQgY2xhc3MgTm92ZWxTaXRlRG16aiBleHRlbmRzIE5vdmVsU2l0ZVxue1xuXHRzdGF0aWMgZGlzYWJsZWQgPSB0cnVlO1xuXG5cdHN0YXRpYyBJREtFWSA9ICdkbXpqJztcblxuXHRfbWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIHBhZ2U/KVxuXHR7XG5cdFx0aWYgKCF1cmxvYmouY2hhcHRlcl9pZClcblx0XHR7XG5cdFx0XHRpZiAoIXVybG9iai52b2x1bWVfaWQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBgaHR0cDovL3EuZG16ai5jb20vJHt1cmxvYmoubm92ZWxfaWR9L2luZGV4LnNodG1sYDtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGBodHRwOi8vcS5kbXpqLmNvbS8ke3VybG9iai5ub3ZlbF9pZH0vJHt1cmxvYmoudm9sdW1lX2lkfS8ke3VybG9iai52b2x1bWVfaWR9LnR4dGA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGBodHRwOi8vcS5kbXpqLmNvbS8ke3VybG9iai5ub3ZlbF9pZH0vJHt1cmxvYmoudm9sdW1lX2lkfS8ke3VybG9iai5jaGFwdGVyX2lkfSR7cGFnZVxuXHRcdFx0PyAnXycgKyBwYWdlXG5cdFx0XHQ6ICcnfS5zaHRtbGA7XG5cdH1cblxuXHRtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbCA/OiBudW1iZXIpOiBVUkxcblx0e1xuXHRcdGxldCB1cmwgPSB0aGlzLl9tYWtlVXJsKHVybG9iaiwgYm9vbCk7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG5ldyBVUkwodXJsKTtcblx0fVxuXG5cdHBhcnNlVXJsKHVybDogc3RyaW5nIHwgVVJMKTogTm92ZWxTaXRlLklQYXJzZVVybFxuXHR7XG5cdFx0bGV0IHVybG9iaiA9IHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHVybDogbmV3IFVSTCh1cmwpLFxuXG5cdFx0XHRub3ZlbF9pZDogbnVsbCxcblx0XHRcdHZvbHVtZV9pZDogbnVsbCxcblx0XHRcdGNoYXB0ZXJfaWQ6IG51bGwsXG5cdFx0fTtcblxuXHRcdHVybCA9IHVybG9iai51cmwuaHJlZjtcblxuXHRcdGxldCByID0gLyg/OnFcXC5kbXpqXFwuY29tXFwvfF5cXC8pKD86KFxcZCspXFwvKD86KFxcZCspXFwvKD86KFxcZCspW1xcLl9dKT8pPykvO1xuXG5cdFx0bGV0IG0gPSByLmV4ZWModXJsLnRvU3RyaW5nKCkpO1xuXG5cdFx0aWYgKG0pXG5cdFx0e1xuXHRcdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHRcdHVybG9iai52b2x1bWVfaWQgPSBtWzJdO1xuXHRcdFx0dXJsb2JqLmNoYXB0ZXJfaWQgPSBtWzNdO1xuXHRcdH1cblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gdXJsb2JqO1xuXHR9XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRkb3dubG9hZCh1cmw6IHN0cmluZyB8IFVSTCwgZG93bmxvYWRPcHRpb25zOiBOb3ZlbFNpdGUuSURvd25sb2FkT3B0aW9ucyA9IHt9KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRjb25zdCBbUEFUSF9OT1ZFTF9NQUlOLCBvcHRpb25zUnVudGltZV0gPSB0aGlzLmdldE91dHB1dERpcjxOb3ZlbFNpdGUuSU9wdGlvbnNSdW50aW1lPihkb3dubG9hZE9wdGlvbnMpO1xuXG5cdFx0Lypcblx0XHRvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00gPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0SlNET01PcHRpb25zLCBvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00sIHtcblx0XHRcdHJ1blNjcmlwdHM6ICdkYW5nZXJvdXNseScsXG5cdFx0fSk7XG5cdFx0Ki9cblxuXHRcdG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSA9IGNyZWF0ZU9wdGlvbnNKU0RPTShvcHRpb25zUnVudGltZS5vcHRpb25zSlNET00sIHtcblx0XHRcdHJ1blNjcmlwdHM6ICdkYW5nZXJvdXNseScsXG5cdFx0fSk7XG5cblx0XHRsZXQgcGF0aF9tYWluOiBzdHJpbmc7XG5cblx0XHRyZXR1cm4gUHJvbWlzZUJsdWViaXJkXG5cdFx0XHQuYmluZChzZWxmKVxuXHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKClcblx0XHRcdHtcblx0XHRcdFx0bGV0IF9kYXRhID0gYXdhaXQgc2VsZi5fZG93bmxvYWRfaW5mbyh1cmwgYXMgYW55LCBvcHRpb25zUnVudGltZSk7XG5cblx0XHRcdFx0cGF0aF9tYWluID0gcGF0aC5qb2luKHNlbGYuUEFUSF9OT1ZFTF9NQUlOLFxuXHRcdFx0XHRcdHRyaW1GaWxlbmFtZShgJHtfZGF0YS5kYXRhLmdfbG5vdmVsX25hbWV9Xygke19kYXRhLmRhdGEuZ19sbm92ZWxfaWR9KWApLFxuXHRcdFx0XHQpO1xuXG5cdFx0XHRcdGxldCBfYSA9IF9kYXRhLnZhbHVlLnJlZHVjZShmdW5jdGlvbiAoYSwgYilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBhLmNvbmNhdChiLmNoYXB0ZXIpO1xuXHRcdFx0XHR9LCBbXSk7XG5cblx0XHRcdFx0bGV0IF9mID0gYXdhaXQgUHJvbWlzZUJsdWViaXJkXG5cdFx0XHRcdFx0Lm1hcFNlcmllcyhfYSwgZnVuY3Rpb24gKGEsIGluZGV4LCBsZW4pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IHBhZF9sZW4gPSBsZW4udG9TdHJpbmcoKS5sZW5ndGggPiA0ID8gbGVuLnRvU3RyaW5nKCkubGVuZ3RoIDogNDtcblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdGxldCB2b2x1bWVfbmFtZSA9IGEudm9sdW1lX25hbWU7XG5cblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGEudXJsKTtcblxuXHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0cmV0dXJuIHNlbGYuX2Rvd25sb2FkQ2hhcHRlcihhLnVybCwgb3B0aW9uc1J1bnRpbWUpXG5cdFx0XHRcdFx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChkYXRhKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IF9maWxlID0gcGF0aC5qb2luKHBhdGhfbWFpbixcblx0XHRcdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0XHRcdHRyaW1GaWxlbmFtZShgJHthLmluZGV4X3ZvbHVtZS50b1N0cmluZygpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC5wYWRTdGFydChwYWRfbGVuLCAnMCcpfSAke3ZvbHVtZV9uYW1lfV8oJHtkYXRhLmRhdGEuZ192b2x1bWVfaWR9KWApLFxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRcdFx0dHJpbUZpbGVuYW1lKGAke2EuaW5kZXgudG9TdHJpbmcoKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQucGFkU3RhcnQocGFkX2xlbiwgJzAnKX1fJHtkYXRhLmRhdGEuY2hhcHRlcl9uYW1lfS4ke2RhdGEuZGF0YS5nX2NoYXB0ZXJfaWR9YClcblx0XHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRcdFx0YXdhaXQgZnMub3V0cHV0SnNvbihfZmlsZSArICcuanNvbicsIGRhdGEsIHtcblx0XHRcdFx0XHRcdFx0XHRcdHNwYWNlczogXCJcXHRcIixcblx0XHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IGZzLm91dHB1dEZpbGUoX2ZpbGUgKyAnLnR4dCcsIGRhdGEudmFsdWUpO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhdGgucmVsYXRpdmUoc2VsZi5QQVRIX05PVkVMX01BSU4sIF9maWxlKTtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKGZpbGUpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnZG9uZScsIGZpbGUpO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZpbGU7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygnZG9uZScsIHJldCk7XG5cblx0XHRcdFx0XHRcdHJldHVybiByZXQ7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0X2RhdGEuY2hlY2tkYXRlID0gbW9tZW50KCkudHoobW9tZW50LnR6Lmd1ZXNzKCkpO1xuXG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0X2RhdGEuZmlsZXMgPSBfZjtcblxuXHRcdFx0XHRyZXR1cm4gX2RhdGE7XG5cdFx0XHR9KVxuXHRcdFx0LnRhcChhc3luYyBmdW5jdGlvbiAobm92ZWwpXG5cdFx0XHR7XG5cblx0XHRcdFx0YXdhaXQgZnMub3V0cHV0SnNvbihwYXRoLmpvaW4ocGF0aF9tYWluLCB0cmltRmlsZW5hbWUoYCR7bm92ZWwuZGF0YS5nX2xub3ZlbF9uYW1lfS4ke25vdmVsLmRhdGEuZ19sbm92ZWxfaWR9YCkpICsgJy5qc29uJywgbm92ZWwsIHtcblx0XHRcdFx0XHRzcGFjZXM6IFwiXFx0XCIsXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGxldCBvcHRpb25zID0ge307XG5cdFx0XHRcdG9wdGlvbnNbc2VsZi5JREtFWV0gPSB7XG5cdFx0XHRcdFx0Ly90eHRkb3dubG9hZF9pZDogbm92ZWwubm92ZWxfc3lvc2V0dV9pZCxcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRsZXQgbWQgPSBub3ZlbEluZm8uc3RyaW5naWZ5KHtcblx0XHRcdFx0XHRub3ZlbDoge1xuXHRcdFx0XHRcdFx0dGFnczogW1xuXHRcdFx0XHRcdFx0XHRzZWxmLklES0VZLFxuXHRcdFx0XHRcdFx0XSxcblx0XHRcdFx0XHRcdHNlcmllczoge1xuXHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdG5hbWU6IG5vdmVsLm5vdmVsX3Nlcmllc190aXRsZSB8fCAnJyxcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRvcHRpb25zLFxuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRsaW5rOiBub3ZlbC5saW5rIHx8IFtdLFxuXHRcdFx0XHR9LCBub3ZlbCwge1xuXHRcdFx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0XHRcdHRleHRsYXlvdXQ6IHtcblx0XHRcdFx0XHRcdFx0YWxsb3dfbGYyOiB0cnVlLFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGxldCBmaWxlID0gcGF0aC5qb2luKHBhdGhfbWFpbiwgYFJFQURNRS5tZGApO1xuXHRcdFx0XHRhd2FpdCBmcy5vdXRwdXRGaWxlKGZpbGUsIG1kKTtcblxuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdGFzeW5jIF9kb3dubG9hZF9pbmZvKHVybDogVVJMLFxuXHRcdG9wdGlvbnNSdW50aW1lOiBQYXJ0aWFsPE5vdmVsU2l0ZS5JT3B0aW9uc1J1bnRpbWU+ID0ge31cblx0KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHR7XG5cdFx0XHRsZXQgZGF0YSA9IHNlbGYucGFyc2VVcmwodXJsKTtcblxuXHRcdFx0aWYgKCFkYXRhLm5vdmVsX2lkKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHRcdH1cblxuXHRcdFx0dXJsID0gc2VsZi5tYWtlVXJsKHtcblx0XHRcdFx0bm92ZWxfaWQ6IGRhdGEubm92ZWxfaWQsXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRsZXQgX2RhdGEgPSB7XG5cblx0XHRcdHVybDogdXJsLFxuXG5cdFx0XHRkYXRhOiB7fSBhcyBhbnksXG5cblx0XHRcdHZhbHVlOiBudWxsIGFzIGFueVtdLFxuXG5cdFx0fTtcblxuXHRcdHJldHVybiBhd2FpdCBmcm9tVVJMKHVybCwgb3B0aW9uc1J1bnRpbWUub3B0aW9uc0pTRE9NKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKGRvbSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgJCA9IGRvbS4kO1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGNvbnN0IHdpbmRvdyA9IGRvbS53aW5kb3cgYXMge1xuXHRcdFx0XHRcdGdfbG5vdmVsX2lkLFxuXHRcdFx0XHRcdGdfbG5vdmVsX25hbWUsXG5cblx0XHRcdFx0XHR2b2x1bWVfbGlzdDogYW55W10sXG5cdFx0XHRcdFx0Y2hhcHRlcl9saXN0OiBhbnlbXSxcblx0XHRcdFx0fTtcblxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKGRvbS5zZXJpYWxpemUoKSk7XG5cblx0XHRcdFx0X2RhdGEuZGF0YS5nX2xub3ZlbF9pZCA9IHdpbmRvdy5nX2xub3ZlbF9pZDtcblx0XHRcdFx0X2RhdGEuZGF0YS5nX2xub3ZlbF9uYW1lID0gd2luZG93LmdfbG5vdmVsX25hbWU7XG5cblx0XHRcdFx0X2RhdGEuZGF0YS5jb3Zlcl9waWMgPSAkKCcjY292ZXJfcGljJykuYXR0cignc3JjJyk7XG5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBfdCA9ICQoJy5tYWluIC5waWMgLmNvbicpLnRleHQoKTtcblxuXHRcdFx0XHRcdF9kYXRhLmRhdGEuY29uID0gX3Q7XG5cblx0XHRcdFx0XHRpZiAoX3QubWF0Y2goL+S9nOiAhe+8miguKykvKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRfZGF0YS5kYXRhLmF1dGhvciA9IFJlZ0V4cC4kMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKF90Lm1hdGNoKC/nsbvlnovvvJooLispLykpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0X2RhdGEuZGF0YS50eXBlID0gKFJlZ0V4cC4kMSkudG9TdHJpbmcoKS5zcGxpdCgnLycpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoX3QubWF0Y2goL+eKtuaAge+8miguKykvKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRfZGF0YS5kYXRhLnN0YXR1cyA9IFJlZ0V4cC4kMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKF90Lm1hdGNoKC/mm7TmlrDvvJooLispLykpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0X2RhdGEuZGF0YS5sYXN0dXBkYXRlID0gbW9tZW50LnR6KFJlZ0V4cC4kMSwgJ1lZWVktTU0tREQgSEg6bW06c3MnLCAnQXNpYS9UYWlwZWknKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdF9kYXRhLmRhdGEuZGVzYyA9ICQoJyNkZXRhaWxfYmxvY2sgPiAuaWxpc3Q6aGFzKD4gaDMpID4gcCcpLnRleHQoKTtcblxuXHRcdFx0XHR3aW5kb3cudm9sdW1lX2xpc3QgPSB3aW5kb3cudm9sdW1lX2xpc3QucmV2ZXJzZSgpO1xuXHRcdFx0XHR3aW5kb3cuY2hhcHRlcl9saXN0ID0gd2luZG93LmNoYXB0ZXJfbGlzdC5yZXZlcnNlKCk7XG5cblx0XHRcdFx0bGV0IGxpc3QgPSBbXTtcblxuXHRcdFx0XHRmb3IgKGxldCB2IGluIHdpbmRvdy5jaGFwdGVyX2xpc3QpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgdm9sdW1lX25hbWUgPSAkKHdpbmRvdy52b2x1bWVfbGlzdFt2XSkuZmluZCgnLmNoYXBuYW1lc3ViJykudGV4dCgpO1xuXG5cdFx0XHRcdFx0d2luZG93LmNoYXB0ZXJfbGlzdFt2XSA9IHdpbmRvdy5jaGFwdGVyX2xpc3Rbdl0ucmV2ZXJzZSgpO1xuXG5cdFx0XHRcdFx0Ly9sZXQgZGF0YSA9IHBhcnNlVXJsKCQoZG9tLndpbmRvdy5jaGFwdGVyX2xpc3Rbdl1bMF0pLmF0dHIoJ2hyZWYnKSk7XG5cblx0XHRcdFx0XHRsaXN0W3ZdID0ge1xuXHRcdFx0XHRcdFx0aW5kZXg6IHYsXG5cblx0XHRcdFx0XHRcdG5vdmVsX2lkOiBudWxsLFxuXG5cdFx0XHRcdFx0XHR2b2x1bWVfbmFtZTogdm9sdW1lX25hbWUsXG5cdFx0XHRcdFx0XHR2b2x1bWVfaWQ6IG51bGwsXG5cblx0XHRcdFx0XHRcdGNoYXB0ZXI6IFtdLFxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRmb3IgKGxldCBjaSBpbiB3aW5kb3cuY2hhcHRlcl9saXN0W3ZdKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGlmICghd2luZG93LmNoYXB0ZXJfbGlzdFt2XVtjaV0pXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRsZXQgX2EgPSAkKHdpbmRvdy5jaGFwdGVyX2xpc3Rbdl1bY2ldKTtcblxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhfYSk7XG5cblx0XHRcdFx0XHRcdGxldCBfZCA9IHNlbGYucGFyc2VVcmwoX2EucHJvcCgnaHJlZicpKTtcblxuXHRcdFx0XHRcdFx0aWYgKCFsaXN0W3ZdLnZvbHVtZV9pZClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGlzdFt2XS5ub3ZlbF9pZCA9IF9kLm5vdmVsX2lkO1xuXHRcdFx0XHRcdFx0XHRsaXN0W3ZdLnZvbHVtZV9pZCA9IF9kLnZvbHVtZV9pZDtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bGlzdFt2XS5jaGFwdGVyLnB1c2goe1xuXHRcdFx0XHRcdFx0XHRpbmRleDogY2ksXG5cdFx0XHRcdFx0XHRcdGluZGV4X3ZvbHVtZTogdixcblxuXHRcdFx0XHRcdFx0XHRub3ZlbF9pZDogX2Qubm92ZWxfaWQsXG5cblx0XHRcdFx0XHRcdFx0dm9sdW1lX2lkOiBfZC52b2x1bWVfaWQsXG5cdFx0XHRcdFx0XHRcdHZvbHVtZV9uYW1lOiB2b2x1bWVfbmFtZSxcblxuXHRcdFx0XHRcdFx0XHRjaGFwdGVyX25hbWU6IF9hLnRleHQoKSxcblx0XHRcdFx0XHRcdFx0Y2hhcHRlcl9pZDogX2QuY2hhcHRlcl9pZCxcblxuXHRcdFx0XHRcdFx0XHR1cmw6IF9hLnByb3AoJ2hyZWYnKSxcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdF9kYXRhLnZhbHVlID0gbGlzdDtcblxuXHRcdFx0XHRyZXR1cm4gX2RhdGE7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKF9kYXRhKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdF9kYXRhLmNoZWNrZGF0ZSA9IG1vbWVudCgpLnR6KG1vbWVudC50ei5ndWVzcygpKTtcblxuXHRcdFx0XHRyZXR1cm4gX2RhdGE7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0YXN5bmMgX2Rvd25sb2FkQ2hhcHRlcihkYXRhLCBvcHRpb25zUnVudGltZTogTm92ZWxTaXRlLklPcHRpb25zUnVudGltZSlcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGxldCB1cmw6IFVSTDtcblxuXHRcdHtcblx0XHRcdGRhdGEgPSBzZWxmLnBhcnNlVXJsKGRhdGEpO1xuXG5cdFx0XHRpZiAoIWRhdGEubm92ZWxfaWQpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcigpO1xuXHRcdFx0fVxuXG5cdFx0XHR1cmwgPSBzZWxmLm1ha2VVcmwoZGF0YSk7XG5cdFx0fVxuXG5cdFx0bGV0IF9kYXRhID0ge30gYXMgYW55O1xuXG5cdFx0bGV0ICQ7XG5cblx0XHRyZXR1cm4gZnJvbVVSTCh1cmwsIG9wdGlvbnNSdW50aW1lLm9wdGlvbnNKU0RPTSlcblx0XHRcdC50aGVuKGFzeW5jIChkb20pID0+XG5cdFx0XHR7XG5cdFx0XHRcdGxldCB3aW5kb3cgPSBkb20ud2luZG93IGFzIHtcblx0XHRcdFx0XHRba2V5OiBzdHJpbmddOiBhbnk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0JCA9IGRvbS4kO1xuXG5cdFx0XHRcdGxldCBjaGFwdGVyX25hbWUgPSB3aW5kb3cuZ19jaGFwdGVyX25hbWVcblx0XHRcdFx0XHQucmVwbGFjZSgvXFxcXC9pZywgJycpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL15bXFxzXFx1RkVGRlxceEEw44CAXSt8W1xcc1xcdUZFRkZcXHhBMOOAgF0rJC9nLCAnJylcblx0XHRcdFx0O1xuXHRcdFx0XHRsZXQgdm9sdW1lX25hbWUgPSB3aW5kb3cuZG9jdW1lbnRcblx0XHRcdFx0XHQucXVlcnlTZWxlY3RvcignI3BhZ2VfY29udGVudHMgLnRpdCcpXG5cdFx0XHRcdFx0LmlubmVySFRNTFxuXHRcdFx0XHRcdC5yZXBsYWNlKC9cXFxcL2lnLCAnJylcblx0XHRcdFx0XHQucmVwbGFjZShjaGFwdGVyX25hbWUsICcnKVxuXHRcdFx0XHRcdC5yZXBsYWNlKC9eW1xcc1xcdUZFRkZcXHhBMOOAgF0rfFtcXHNcXHVGRUZGXFx4QTDjgIBdKyQvZywgJycpXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRfZGF0YSA9IHtcblxuXHRcdFx0XHRcdHVybDogdXJsLFxuXG5cdFx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdFx0Z19sbm92ZWxfaWQ6IHdpbmRvdy5nX2xub3ZlbF9pZCxcblx0XHRcdFx0XHRcdGdfdm9sdW1lX2lkOiB3aW5kb3cuZ192b2x1bWVfaWQsXG5cdFx0XHRcdFx0XHRnX2NoYXB0ZXJfaWQ6IHdpbmRvdy5nX2NoYXB0ZXJfaWQsXG5cblx0XHRcdFx0XHRcdGdfbG5vdmVsX25hbWU6IHdpbmRvdy5nX2xub3ZlbF9uYW1lLFxuXHRcdFx0XHRcdFx0Z192b2x1bWVfbmFtZTogdm9sdW1lX25hbWUsXG5cdFx0XHRcdFx0XHRnX2NoYXB0ZXJfbmFtZTogY2hhcHRlcl9uYW1lLFxuXG5cdFx0XHRcdFx0XHRjaGFwdGVyX25hbWU6IGNoYXB0ZXJfbmFtZSxcblx0XHRcdFx0XHRcdHZvbHVtZV9uYW1lOiB2b2x1bWVfbmFtZSxcblx0XHRcdFx0XHR9LFxuXG5cdFx0XHRcdFx0dmFsdWU6IG51bGwsXG5cblx0XHRcdFx0fTtcblxuXHRcdFx0XHRsZXQgcGEgPSBbXTtcblxuXHRcdFx0XHRwYVswXSA9IHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NoYXB0ZXJfY29udGVudHNfZmlyc3RcIikuaW5uZXJIVE1MO1xuXG5cdFx0XHRcdGlmICh3aW5kb3cuZ19jaGFwdGVyX3BhZ2VzX2NvdW50ID4gMSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB1YSA9ICh3aW5kb3cuZ19jaGFwdGVyX3BhZ2VzX3VybCBhcyBBcnJheTxzdHJpbmc+KVxuXHRcdFx0XHRcdFx0LmZpbHRlcihmdW5jdGlvbiAodmFsdWUpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGFycmF5KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAodmFsdWUpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZSA9ICdodHRwOi8vcS5kbXpqLmNvbS8nICsgdmFsdWU7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdGF3YWl0IG1hbnlSZXF1ZXN0KHVhLCB7XG5cdFx0XHRcdFx0XHRlbmNvZGluZzogbnVsbCxcblx0XHRcdFx0XHRcdHJlc29sdmVXaXRoRnVsbFJlc3BvbnNlOiB0cnVlLFxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAocmV0KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRwYSA9IHBhLmNvbmNhdChyZXQubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGFycmF5KVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyh2YWx1ZS5ib2R5KTtcblxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB2YWx1ZS5ib2R5LnRvU3RyaW5nKCk7XG5cdFx0XHRcdFx0XHRcdH0pKVxuXHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBwYTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAocGEpXG5cdFx0XHR7XG5cdFx0XHRcdF9kYXRhLmltZ3MgPSBbXTtcblxuXHRcdFx0XHRwYSA9IGF3YWl0IFByb21pc2VCbHVlYmlyZC5tYXBTZXJpZXMocGEsIGFzeW5jIGZ1bmN0aW9uICh2YWx1ZSwgaWR4KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IF9jID0ge307XG5cblx0XHRcdFx0XHQvL2xldCAkID0gY2hlZXJpby5sb2FkKHZhbHVlKTtcblxuXHRcdFx0XHRcdGxldCBfYSA9ICQodmFsdWUpO1xuXG5cdFx0XHRcdFx0bGV0IF9pbWcgPSBfYS5maW5kKCdpbWcnKTtcblxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coX2ltZy5sZW5ndGgpO1xuXG5cdFx0XHRcdFx0aWYgKF9pbWcubGVuZ3RoKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdF9pbWcuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0bGV0IF90aGlzID0gJCh0aGlzKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoX3RoaXMucHJvcCgnc3JjJykpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgaWQgPSBzaG9ydGlkKCk7XG5cblx0XHRcdFx0XHRcdFx0XHRfY1tpZF0gPSBfdGhpcy5wcm9wKCdzcmMnKTtcblx0XHRcdFx0XHRcdFx0XHRfZGF0YS5pbWdzLnB1c2goX2NbaWRdKTtcblxuXHRcdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0XHQkKGA8c3Bhbj57e0Ake2lkfUB9fTwvc3Bhbj5gKS5pbnNlcnRBZnRlcih0aGlzKTtcblxuXHRcdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0XHQkKHRoaXMpXG5cdFx0XHRcdFx0XHRcdFx0XHQucmVtb3ZlKClcblx0XHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKCQuaHRtbCgpKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRsZXQgX3QgPSBfYS50ZXh0KCk7XG5cblx0XHRcdFx0XHRmb3IgKGxldCBpZCBpbiBfYylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdFx0aWYgKCEvXig/OlthLXpdXFw6fFxcOik/XFwvXFwvL2kudGVzdChfY1tpZF0pKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRfY1tpZF0gPSAnaHR0cDovL3EuZG16ai5jb20vJyArIF9jW2lkXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdCovXG5cblx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRhd2FpdCBkb3dubG9hZF9pbWFnZShfY1tpZF0sIHtcblx0XHRcdFx0XHRcdFx0ZnJvbWZpbGU6IGZpbGUsXG5cdFx0XHRcdFx0XHRcdHByZWZpeDogJ2ltZ18nICsgKF9pZHgrKykudG9TdHJpbmcoKS5wYWRTdGFydCgzLCAnMCcpICsgJ18nLFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0XHRfdCA9IF90LnJlcGxhY2UoYHt7QCR7aWR9QH19YCwgYFxcblxcbjxpbWcgc3JjPVwiJHtfY1tpZF19XCIvPlxcblxcbmApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBfdDtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0cmV0dXJuIHBhLmpvaW4oXCJcXG5cIik7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKGh0bWwpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBodG1sXG5cdFx0XHRcdFx0LnJlcGxhY2UoL15cXHMqKD86PHA+KT8vaSwgJycpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1xccyo8KD86XFwvP3B8YnJcXC8/KT5cXHMqJC9pLCAnJylcblx0XHRcdFx0XHQucmVwbGFjZSgvXFxyXFxufFxccig/IVxcbikvZywgXCJcXG5cIilcblx0XHRcdFx0XHQvLy5yZXBsYWNlKC88XFwvcD48cD5cXG4vaWcsIFwiXFxuXCIpXG5cdFx0XHRcdFx0Ly8ucmVwbGFjZSgvPHA+PFxcL3A+L2lnLCBcIlxcblwiKVxuXHRcdFx0XHRcdC8vLnJlcGxhY2UoLyg8XFwvcD58PHA+KVxcbi9pZywgXCJcXG5cIilcblx0XHRcdFx0XHQucmVwbGFjZSgvW1xcdFxcdUZFRkZcXHhBMOOAgF0rKFxcbnwkKS9pZywgXCIkMVwiKVxuXHRcdFx0XHRcdC5yZXBsYWNlKC8oXFxuKVtcXHRdKy9pZywgXCIkMVwiKVxuXHRcdFx0XHRcdC5yZXBsYWNlKC9cXHMrJC9pZywgXCJcIilcblx0XHRcdFx0XHQucmVwbGFjZSgvXFxuezMsfS9pZywgXCJcXG5cXG5cIilcblx0XHRcdFx0XHQ7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKGh0bWwpXG5cdFx0XHR7XG5cdFx0XHRcdF9kYXRhLnZhbHVlID0gaHRtbDtcblx0XHRcdFx0X2RhdGEuY2hlY2tkYXRlID0gbW9tZW50KCkudHoobW9tZW50LnR6Lmd1ZXNzKCkpO1xuXG5cdFx0XHRcdHJldHVybiBfZGF0YTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFNpdGVEbXpqO1xuIl19