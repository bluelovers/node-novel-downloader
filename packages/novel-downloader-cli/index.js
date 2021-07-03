"use strict";
/**
 * Created by user on 2018/10/6/006.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOptions = exports.download = exports.createSite = void 0;
const tslib_1 = require("tslib");
const lazy_1 = require("novel-downloader/src/lazy");
const novel_downloader_1 = (0, tslib_1.__importStar)(require("novel-downloader"));
function createSite(siteID, options) {
    let o = (0, novel_downloader_1.default)(siteID);
    // @ts-ignore
    return new o(options);
}
exports.createSite = createSite;
function download(url, downloadOptions, siteID, options) {
    if (!siteID) {
        siteID = (0, lazy_1.searchSiteID)(url) || novel_downloader_1.EnumNovelSiteList.NovelSiteSyosetu;
    }
    ({ downloadOptions, options } = handleOptions(downloadOptions, siteID, options));
    const Site = createSite(siteID, options || {});
    return Site.download(url, downloadOptions);
}
exports.download = download;
function handleOptions(downloadOptions, siteID, options) {
    return {
        downloadOptions,
        options,
    };
}
exports.handleOptions = handleOptions;
//# sourceMappingURL=index.js.map