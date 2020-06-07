"use strict";
/**
 * Created by user on 2018/10/6/006.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOptions = exports.download = exports.createSite = void 0;
const lazy_1 = require("novel-downloader/src/lazy");
const novel_downloader_1 = __importStar(require("novel-downloader"));
function createSite(siteID, options) {
    let o = novel_downloader_1.default(siteID);
    // @ts-ignore
    return new o(options);
}
exports.createSite = createSite;
function download(url, downloadOptions, siteID, options) {
    if (!siteID) {
        siteID = lazy_1.searchSiteID(url) || novel_downloader_1.EnumNovelSiteList.NovelSiteSyosetu;
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