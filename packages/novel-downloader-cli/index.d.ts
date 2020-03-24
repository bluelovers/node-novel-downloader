/**
 * Created by user on 2018/10/6/006.
 */
import Bluebird from "bluebird";
import { EnumNovelSiteList, NovelSite } from "novel-downloader";
export declare function createSite<T extends NovelSite, O extends NovelSite.IOptions>(siteID?: EnumNovelSiteList, options?: O & {
    [k: string]: unknown;
}): T;
export declare function download<O extends NovelSite.IDownloadOptions = NovelSite.IDownloadOptions, O2 extends NovelSite.IOptions = NovelSite.IOptions>(url: string, downloadOptions?: O & {
    [k: string]: any;
}, siteID?: EnumNovelSiteList, options?: O2 & {
    [k: string]: any;
}): Bluebird<NovelSite.INovel>;
export declare function handleOptions<O extends NovelSite.IDownloadOptions, O2 extends NovelSite.IOptions>(downloadOptions: O & {
    [k: string]: any;
}, siteID: EnumNovelSiteList, options: O2 & {
    [k: string]: any;
}): {
    downloadOptions: O & {
        [k: string]: any;
    };
    options: O2 & {
        [k: string]: any;
    };
};
