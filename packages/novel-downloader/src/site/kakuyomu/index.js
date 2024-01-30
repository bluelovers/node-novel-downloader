"use strict";
/**
 * Created by user on 2018/3/17/017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSiteKakuyomu = void 0;
const tslib_1 = require("tslib");
const tree_1 = tslib_1.__importDefault(require("../demo/tree"));
const jsdom_extra_1 = require("jsdom-extra");
//import { URL } from 'jsdom-url';
const index_1 = require("../index");
const index_2 = require("../index");
const util_1 = require("./util");
const html_1 = require("../../util/html");
const get_volume_list_1 = require("./dom/get_volume_list");
let NovelSiteKakuyomu = class NovelSiteKakuyomu extends tree_1.default {
    static check(url, ...argv) {
        return (0, util_1.check)(url, ...argv);
    }
    static makeUrl(urlobj, bool, ...argv) {
        return (0, util_1.makeUrl)(urlobj, bool, ...argv);
    }
    static parseUrl(url, ...argv) {
        return (0, util_1.parseUrl)(url, ...argv);
    }
    makeUrl(urlobj, bool, ...argv) {
        return (0, util_1.makeUrl)(urlobj, bool, ...argv);
    }
    parseUrl(url, ...argv) {
        return (0, util_1.parseUrl)(url, ...argv);
    }
    _parseChapter(ret, optionsRuntime, cache) {
        if (!ret) {
            return '';
        }
        (0, html_1.keepFormatTag)(ret.dom.$('#contentMain .widget-episodeBody'), {
            $: ret.dom.$,
            optionsRuntime,
        });
        return ret.dom.$('#contentMain .widget-episodeBody').text();
    }
    /**
     * @todo 需要改良支援三級目錄
     */
    async get_volume_list(url, optionsRuntime = {}) {
        const self = this;
        url = await this.createMainUrl(url, optionsRuntime);
        return (0, jsdom_extra_1.fromURL)(url, optionsRuntime.optionsJSDOM)
            .then(async function (dom) {
            const $ = dom.$;
            let { data_meta, ..._data } = await (0, get_volume_list_1._get_volume_list)(dom, optionsRuntime);
            let novel_publisher = self.IDKEY;
            let url_data = self.parseUrl(dom.url.href);
            //let novel_date = moment.unix(_cache_dates[_cache_dates.length - 1]).local();
            //let novel_cover = `https://cdn-static.kakuyomu.jp/works/${url_data.novel_id}/ogimage.png`;
            return {
                ...data_meta,
                ..._data,
                url: dom.url,
                url_data,
                //novel_title,
                //novel_cover,
                //novel_author,
                //novel_desc,
                //novel_date,
                novel_publisher,
                //volume_list,
                //novelTree,
                checkdate: (0, index_2.moment)().local(),
                imgs: [],
            };
        });
    }
};
exports.NovelSiteKakuyomu = NovelSiteKakuyomu;
NovelSiteKakuyomu.IDKEY = 'kakuyomu';
exports.NovelSiteKakuyomu = NovelSiteKakuyomu = tslib_1.__decorate([
    (0, index_1.staticImplements)()
], NovelSiteKakuyomu);
exports.default = NovelSiteKakuyomu;
//# sourceMappingURL=index.js.map