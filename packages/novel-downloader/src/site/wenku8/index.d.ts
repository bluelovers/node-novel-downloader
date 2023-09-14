/**
 * Created by user on 2018/3/25/025.
 */
/// <reference types="bluebird" />
import _NovelSite, { IMdconfMeta } from '../index';
import { IDownloadOptions, INovel } from '../demo/base';
import { IFetchChapter, IOptionsRuntime } from '../demo/base';
import NovelSiteBase from '../demo/base';
import { IJSDOM } from 'jsdom-extra';
import { PromiseBluebird } from '../index';
export declare class NovelSiteWenku8 extends NovelSiteBase {
    static readonly IDKEY = "wenku8";
    static check(url: string | URL | _NovelSite.IParseUrl, ...argv: any[]): boolean;
    static makeUrl(urlobj: _NovelSite.IParseUrl, bool?: boolean | number, ...argv: any[]): URL;
    static parseUrl(url: string | URL | number, ...argv: any[]): import("../../util/url").IParseUrlRuntime;
    makeUrl(urlobj: _NovelSite.IParseUrl, bool?: boolean | number, ...argv: any[]): URL;
    parseUrl(url: string | URL | number, ...argv: any[]): import("../../util/url").IParseUrlRuntime;
    createMainUrl<T>(url: string | URL, optionsRuntime: T & IOptionsRuntime): URL;
    protected _fetchChapter<T>(url: URL, optionsRuntime: T & IOptionsRuntime, cache: any, ...argv: any[]): PromiseBluebird<IFetchChapter>;
    protected _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache: any): Promise<string>;
    get_volume_list<T = IOptionsRuntime>(inputUrl: string | URL, optionsRuntime?: Partial<T & IDownloadOptions>): Promise<INovel>;
    protected _get_meta(inputUrl: any, optionsRuntime: any, cache: {
        dom: IJSDOM;
    }): Promise<{
        novel_title: string;
        novel_cover: any;
        novel_author: string;
        novel_desc: string;
        novel_date: any;
        novel_status: any;
        novel_publisher: any;
        novel?: {
            title?: string;
            title_source?: string;
            title_short?: string;
            title_output?: string;
            title_other?: string;
            title_zh1?: string;
            title_zh2?: string;
            title_zh?: string;
            title_cn?: string;
            title_tw?: string;
            title_en?: string;
            title_jp?: string;
            author?: string;
            authors?: string[];
            cover?: string;
            illust?: string;
            illusts?: string[];
            preface?: string;
            tags?: string[];
            date?: string;
            status?: string;
            r18?: string;
            series?: {
                name?: string;
                name_short?: string;
                position?: number;
            };
            source?: string;
            sources?: string[];
            publisher?: string;
            publishers?: string[];
            novel_status?: number;
        };
        contribute?: string[];
        options?: import("node-novel-info").IMdconfMetaOptionsBase<any> & {
            dmzj?: import("node-novel-info").IMdconfMetaOptionsNovelSite;
            kakuyomu?: import("node-novel-info").IMdconfMetaOptionsNovelSite;
            wenku8?: import("node-novel-info").IMdconfMetaOptionsNovelSite;
            webqxs?: import("node-novel-info").IMdconfMetaOptionsNovelSite;
            syosetu?: import("node-novel-info").IMdconfMetaOptionsNovelSite & {
                txtdownload_id: import("node-novel-info").INumber;
            };
            novel?: import("node-novel-info").IMdconfMetaOptionsBase<any> & {
                pattern?: string;
            };
            textlayout?: import("node-novel-info").IMdconfMetaOptionsBase<any> & {
                allow_lf2?: boolean;
                allow_lf3?: boolean;
            };
            downloadOptions?: import("node-novel-info").IMdconfMetaOptionsBase<any> & {
                noFirePrefix?: boolean;
                noFilePadend?: boolean;
                filePrefixMode?: number;
                startIndex?: number;
            };
        };
        link?: string[];
        url: URL;
        url_data: import("../../util/url").IParseUrlRuntime;
    }>;
    protected _handleDataForStringify(...argv: any[]): IMdconfMeta;
}
export default NovelSiteWenku8;
