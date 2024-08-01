"use strict";
/// <reference types="jquery" />
Object.defineProperty(exports, "__esModule", { value: true });
exports._get_volume_list_main = _get_volume_list_main;
exports._get_volume_list_page = _get_volume_list_page;
const tslib_1 = require("tslib");
const index_1 = require("../../index");
const bluebird_1 = tslib_1.__importDefault(require("bluebird"));
const log_1 = require("../../../util/log");
const jsdom_extra_1 = require("jsdom-extra");
function _get_volume_list_main(self, url, optionsRuntime, dom, novel_syosetu_id) {
    return bluebird_1.default.resolve()
        .then(async () => {
        url = await self.createMainUrl(url, optionsRuntime);
        //url = new LazyURL(url);
        log_1.consoleDebug.info(`開始檢測小說章節列表`, url.toString());
        const cache = {
            url,
            novel_syosetu_id,
            page: 1,
            _cache_dates: [],
            volume_list: [],
            currentVolume: void 0,
            dom,
            volume_length: 0,
            chapter_length: 0,
        };
        return cache;
    })
        .tap(cache => {
        return _get_volume_list_page(self, optionsRuntime, cache);
    })
        .tap(cache => {
        cache.volume_length = cache.volume_list.length;
        cache._cache_dates = cache._cache_dates.sort();
    });
}
async function _get_volume_list_page(self, optionsRuntime, cache) {
    var _a, _b;
    let { url, dom, _cache_dates, currentVolume, volume_list, novel_syosetu_id, } = cache;
    cache.page || (cache.page = 1);
    url = self._hackURL(url, optionsRuntime, cache.page);
    log_1.consoleDebug.info(`開始處理小說章節列表`, cache.page, url.toString(), url.searchParams.get('p'));
    dom !== null && dom !== void 0 ? dom : (dom = await (0, jsdom_extra_1.fromURL)(url, optionsRuntime.optionsJSDOM)
        .then(async function (dom) {
        return self._novel18(url, dom, optionsRuntime);
    }));
    let table = dom.$('.index_box').find('> .chapter_title, .novel_sublist2');
    table
        .each(function (index) {
        let tr = dom.$(this);
        if (tr.is('.chapter_title')) {
            currentVolume = volume_list[volume_list.length] = {
                volume_index: volume_list.length,
                volume_title: tr.text().replace(/^\s+|\s+$/g, ''),
                chapter_list: [],
            };
        }
        else {
            if (!currentVolume) {
                currentVolume = volume_list[volume_list.length] = {
                    volume_index: volume_list.length,
                    volume_title: 'null',
                    chapter_list: [],
                };
            }
            let a = tr.find('.subtitle a');
            let chapter_date;
            let dd;
            let da = tr.find('.long_update');
            if (da.find('span[title*="/"]').length) {
                dd = da.find('span[title*="/"]').attr('title').replace(/改稿|^\s+|\s+$/g, '');
            }
            if (!dd) {
                da.find('*').remove();
                dd = da.text().replace(/^\s+|\s+$/g, '');
            }
            if (dd) {
                chapter_date = (0, index_1.moment)(dd, 'YYYY/MM/DD HH:mm').local();
                _cache_dates.push(chapter_date.unix());
            }
            let href = a.prop('href');
            let data = self.parseUrl(href);
            if (!data.chapter_id) {
                if (tr.find('.bookmarker_now').length) {
                    /**
                     * fix https://ncode.syosetu.com/n7637dj/
                     */
                    return;
                }
                log_1.console.log(tr.prop("outerHTML"));
                log_1.console.log(a.prop("outerHTML"));
                log_1.console.log(a);
                log_1.console.log(data);
                log_1.console.log(href);
                log_1.console.log(a.attr('href'));
                // @ts-ignore
                log_1.console.log(new URL(href, dom.url));
                log_1.console.log(dom._options);
                throw new Error();
            }
            else {
                data = {
                    url: null,
                    novel_pid: novel_syosetu_id,
                    chapter_id: data.chapter_id,
                };
                href = self._hackURL(self.makeUrl(data), optionsRuntime);
                data.url = href;
            }
            currentVolume
                .chapter_list
                .push({
                chapter_index: currentVolume.chapter_list.length,
                chapter_title: a.text().replace(/^\s+|\s+$/g, ''),
                chapter_id: data.chapter_id,
                chapter_url: href,
                chapter_url_data: data,
                chapter_date,
            });
            cache.chapter_length++;
        }
    });
    cache.currentVolume = currentVolume;
    cache.dom = null;
    let _a_next = dom.$('.novelview_pager').find('.novelview_pager-next:eq(0)');
    if (_a_next === null || _a_next === void 0 ? void 0 : _a_next.length) {
        let _p = (_b = (_a = (_a_next.prop('href') || _a_next.attr('href'))) === null || _a === void 0 ? void 0 : _a.toString().match(/(?<=[?=&])p=(\d+)/)) === null || _b === void 0 ? void 0 : _b[1];
        if (_p > 1 && _p > cache.page) {
            cache.page = parseInt(_p);
            return _get_volume_list_page(self, optionsRuntime, cache);
        }
    }
    return cache;
}
//# sourceMappingURL=get_volume_list.js.map