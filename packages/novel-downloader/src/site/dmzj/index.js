"use strict";
/**
 * Created by user on 2017/12/6/006.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSiteDmzj = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = (0, tslib_1.__importDefault)(require("fs-extra"));
const util_1 = require("fs-iconv/util");
const upath2_1 = (0, tslib_1.__importDefault)(require("upath2"));
const node_novel_info_1 = (0, tslib_1.__importDefault)(require("node-novel-info"));
const jsdom_extra_1 = require("jsdom-extra");
const index_1 = (0, tslib_1.__importStar)(require("../index"));
const index_2 = require("../index");
const index_3 = require("../index");
const shortid_1 = (0, tslib_1.__importDefault)(require("shortid"));
const fetch_1 = require("../../fetch");
const jsdom_1 = require("../../jsdom");
/**
 * @deprecated
 */
// @ts-ignore
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
        optionsRuntime.optionsJSDOM = (0, jsdom_1.createOptionsJSDOM)(optionsRuntime.optionsJSDOM, {
            runScripts: 'dangerously',
        });
        let path_main;
        return index_2.PromiseBluebird
            .bind(self)
            .then(async function () {
            let _data = await self._download_info(url, optionsRuntime);
            path_main = upath2_1.default.join(self.PATH_NOVEL_MAIN, (0, util_1.trimFilename)(`${_data.data.g_lnovel_name}_(${_data.data.g_lnovel_id})`));
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
                    let _file = upath2_1.default.join(path_main, 
                    // @ts-ignore
                    (0, util_1.trimFilename)(`${a.index_volume.toString()
                        .padStart(pad_len, '0')} ${volume_name}_(${data.data.g_volume_id})`), 
                    // @ts-ignore
                    (0, util_1.trimFilename)(`${a.index.toString()
                        .padStart(pad_len, '0')}_${data.data.chapter_name}.${data.data.g_chapter_id}`));
                    await fs_extra_1.default.outputJson(_file + '.json', data, {
                        spaces: "\t",
                    });
                    await fs_extra_1.default.outputFile(_file + '.txt', data.value);
                    return upath2_1.default.relative(self.PATH_NOVEL_MAIN, _file);
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
            _data.checkdate = (0, index_3.moment)().tz(index_3.moment.tz.guess());
            // @ts-ignore
            _data.files = _f;
            return _data;
        })
            .tap(async function (novel) {
            await fs_extra_1.default.outputJson(upath2_1.default.join(path_main, (0, util_1.trimFilename)(`${novel.data.g_lnovel_name}.${novel.data.g_lnovel_id}`)) + '.json', novel, {
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
            let file = upath2_1.default.join(path_main, `README.md`);
            await fs_extra_1.default.outputFile(file, md);
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
        return await (0, jsdom_extra_1.fromURL)(url, optionsRuntime.optionsJSDOM)
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
            _data.checkdate = (0, index_3.moment)().tz(index_3.moment.tz.guess());
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
        return (0, jsdom_extra_1.fromURL)(url, optionsRuntime.optionsJSDOM)
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
                await (0, fetch_1.manyRequest)(ua, {
                    // @ts-ignore
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
                            let id = (0, shortid_1.default)();
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
            _data.checkdate = (0, index_3.moment)().tz(index_3.moment.tz.guess());
            return _data;
        });
    }
};
NovelSiteDmzj.disabled = true;
NovelSiteDmzj.IDKEY = 'dmzj';
NovelSiteDmzj = (0, tslib_1.__decorate)([
    (0, index_1.staticImplements)()
], NovelSiteDmzj);
exports.NovelSiteDmzj = NovelSiteDmzj;
exports.default = NovelSiteDmzj;
//# sourceMappingURL=index.js.map