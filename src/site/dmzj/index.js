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
const fs_iconv_1 = require("fs-iconv");
const path = require("path");
const node_novel_info_1 = require("node-novel-info");
const jsdom_extra_1 = require("jsdom-extra");
const jsdom_url_1 = require("jsdom-url");
const index_1 = require("../index");
const index_2 = require("../index");
const index_3 = require("../index");
const shortid = require("shortid");
const fetch_1 = require("../../fetch");
const jsdom_1 = require("../../jsdom");
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
        return new jsdom_url_1.URL(url);
    }
    parseUrl(url) {
        let urlobj = {
            url: new jsdom_url_1.URL(url),
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
        return urlobj;
    }
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
            path_main = path.join(self.PATH_NOVEL_MAIN, fs_iconv_1.trimFilename(`${_data.data.g_lnovel_name}_(${_data.data.g_lnovel_id})`));
            let _a = _data.value.reduce(function (a, b) {
                return a.concat(b.chapter);
            }, []);
            let _f = await index_2.PromiseBluebird
                .mapSeries(_a, function (a, index, len) {
                let pad_len = len.toString().length > 4 ? len.toString().length : 4;
                let volume_name = a.volume_name;
                console.log(a.url);
                return self._downloadChapter(a.url, optionsRuntime)
                    .then(async function (data) {
                    let _file = path.join(path_main, fs_iconv_1.trimFilename(`${a.index_volume.toString()
                        .padStart(pad_len, '0')} ${volume_name}_(${data.data.g_volume_id})`), fs_iconv_1.trimFilename(`${a.index.toString()
                        .padStart(pad_len, '0')}_${data.data.chapter_name}.${data.data.g_chapter_id}`));
                    await fs_iconv_1.default.outputJson(_file + '.json', data, {
                        spaces: "\t",
                    });
                    await fs_iconv_1.default.outputFile(_file + '.txt', data.value);
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
            _data.checkdate = index_3.moment().tz(index_3.moment.tz.guess());
            _data.files = _f;
            return _data;
        })
            .tap(async function (novel) {
            await fs_iconv_1.default.outputJson(path.join(path_main, fs_iconv_1.trimFilename(`${novel.data.g_lnovel_name}.${novel.data.g_lnovel_id}`)) + '.json', novel, {
                spaces: "\t",
            });
            let options = {};
            options[self.IDKEY] = {};
            let md = node_novel_info_1.default.stringify({
                novel: {
                    tags: [
                        self.IDKEY,
                    ],
                    series: {
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
            await fs_iconv_1.default.outputFile(file, md);
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
        return await jsdom_extra_1.fromURL(url, optionsRuntime.optionsJSDOM)
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
                        let _this = $(this);
                        if (_this.prop('src')) {
                            let id = shortid();
                            _c[id] = _this.prop('src');
                            _data.imgs.push(_c[id]);
                            $(`<span>{{@${id}@}}</span>`).insertAfter(this);
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
NovelSiteDmzj.IDKEY = 'dmzj';
NovelSiteDmzj = __decorate([
    index_1.staticImplements()
], NovelSiteDmzj);
exports.NovelSiteDmzj = NovelSiteDmzj;
exports.default = NovelSiteDmzj;
