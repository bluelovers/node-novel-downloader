"use strict";
/**
 * Created by user on 2019/1/7/007.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchSiteID = exports.getEnumNovelSiteList = void 0;
const const_1 = require("./all/const");
const all_1 = require("./all");
//import { URL } from 'jsdom-url';
const url_1 = __importDefault(require("./util/url"));
function getEnumNovelSiteList() {
    return Object.values(const_1.EnumIDKEYToSiteID);
}
exports.getEnumNovelSiteList = getEnumNovelSiteList;
function searchSiteID(url) {
    let href;
    try {
        href = url_1.default(url).href;
    }
    catch (e) {
        // @ts-ignore
        href = url;
    }
    let ls = getEnumNovelSiteList();
    for (let siteID of ls) {
        let mod = all_1.requireNovelSiteClass(siteID);
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