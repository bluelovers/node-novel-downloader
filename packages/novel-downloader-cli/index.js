"use strict";
/**
 * Created by user on 2018/10/6/006.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSite = createSite;
exports.download = download;
exports.handleOptions = handleOptions;
const lazy_1 = require("novel-downloader/src/lazy");
const novel_downloader_1 = require("novel-downloader");
function createSite(siteID, options) {
    let o = (0, novel_downloader_1.requireNovelSiteClass)(siteID);
    // @ts-ignore
    return new o(options);
}
function download(url, downloadOptions, siteID, options) {
    if (!siteID) {
        siteID = (0, lazy_1.searchSiteID)(url) || novel_downloader_1.EnumNovelSiteList.NovelSiteSyosetu;
    }
    ({ downloadOptions, options } = handleOptions(downloadOptions, siteID, options));
    const Site = createSite(siteID, options || {});
    return Site.download(url, downloadOptions);
}
function handleOptions(downloadOptions, siteID, options) {
    return {
        downloadOptions,
        options,
    };
}
//# sourceMappingURL=index.js.map