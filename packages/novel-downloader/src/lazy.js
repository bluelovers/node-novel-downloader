"use strict";
/**
 * Created by user on 2019/1/7/007.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchSiteID = exports.getEnumNovelSiteList = void 0;
const tslib_1 = require("tslib");
const const_1 = require("./all/const");
const all_1 = require("./all");
//import { URL } from 'jsdom-url';
const url_1 = (0, tslib_1.__importDefault)(require("./util/url"));
function getEnumNovelSiteList() {
    return Object.values(const_1.EnumIDKEYToSiteID);
}
exports.getEnumNovelSiteList = getEnumNovelSiteList;
function searchSiteID(url) {
    let href;
    try {
        href = (0, url_1.default)(url).href;
    }
    catch (e) {
        // @ts-ignore
        href = url;
    }
    let ls = getEnumNovelSiteList();
    for (let siteID of ls) {
        let mod = (0, all_1.requireNovelSiteClass)(siteID);
        let bool;
        try {
            bool = mod.check(href);
            if (bool) {
                return siteID;
            }
        }
        catch (e) {
        }
    }
}
exports.searchSiteID = searchSiteID;
//# sourceMappingURL=lazy.js.map