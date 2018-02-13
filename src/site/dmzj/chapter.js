"use strict";
/**
 * Created by user on 2017/12/6/006.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const lets_fetch_1 = require("lets-fetch");
const jsdom_1 = require("jsdom");
const cheerio = require("cheerio");
const shortid = require("shortid");
const _1 = require("./");
const moment = require("moment-timezone");
async function download(data, options) {
    let url;
    if (typeof data == 'string') {
        data = _1.parseUrl(data);
    }
    else if (data) {
        data.url = _1.makeUrl(data);
    }
    let _data = {};
    let $ = cheerio.load('');
    let virtualConsole = new jsdom_1.VirtualConsole();
    url = data.url;
    //console.log('download', url, data);
    return await jsdom_1.JSDOM
        .fromURL(url, {
        runScripts: "dangerously",
        virtualConsole,
    })
        .then(async (dom) => {
        let window = dom.window;
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
        pa[0] = dom.window.document.querySelector("#chapter_contents_first").innerHTML;
        if (dom.window.g_chapter_pages_count > 1) {
            let ua = dom.window.g_chapter_pages_url
                .filter(function (value) {
                return value;
            })
                .map(function (value, index, array) {
                if (value) {
                    value = 'http://q.dmzj.com/' + value;
                }
                return value;
            });
            let r = await lets_fetch_1.default.many(ua, {
                type: 'text',
            });
            pa = pa.concat(r);
        }
        return pa;
    })
        .then(function (pa) {
        _data.imgs = [];
        pa = pa.map(function (value) {
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
                if (!/^(?:[a-z]\:|\:)?\/\//i.test(_c[id])) {
                    _c[id] = 'http://q.dmzj.com/' + _c[id];
                }
                _t = _t.replace(`{{@${id}@}}`, `\n\n<img src="${_c[id]}"/>\n\n`);
            }
            return _t;
        });
        return pa.join();
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
        _data.checkdate = moment().tz(moment.tz.guess());
        return _data;
    });
}
exports.download = download;
exports.default = exports;
