/**
 * Created by user on 2018/3/25/025.
 */
import _NovelSite from '../index';
import { IDownloadOptions, INovel } from '../demo/base';
import { IFetchChapter, IOptionsRuntime } from '../demo/base';
import NovelSiteBase from '../demo/base';
import { IJSDOM } from 'jsdom-extra';
export type ISessionData = {
    sessionid: string;
    steins_csrf_token: string;
    online?: 1 | '1';
    id?: number | string;
    avatar?: string;
    username?: string;
};
export declare class NovelSiteIqing extends NovelSiteBase {
    static readonly IDKEY = "iqing";
    static disabled: boolean;
    checkSessionData<T = ISessionData>(data: T & ISessionData, optionsRuntime?: IOptionsRuntime): T;
    makeUrl<T>(urlobj: _NovelSite.IParseUrl, bool?: boolean | number, optionsRuntime?: T & IOptionsRuntime): URL;
    parseUrl(url: URL | string, options?: any): _NovelSite.IParseUrl;
    createMainUrl<T>(url: string | URL, optionsRuntime: T & IOptionsRuntime): URL;
    protected _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache: any): string;
    get_volume_list<T = IOptionsRuntime>(inputUrl: string | URL, optionsRuntime?: Partial<T & IDownloadOptions>): Promise<INovel>;
    protected _get_meta(inputUrl: any, optionsRuntime: any, cache: {
        dom: IJSDOM;
    }): Promise<{
        novel_title: string;
        novel_author: string;
        novel_desc: string;
        novel_date: any;
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
            novel_status?: import("node-novel-info/lib/const").EnumNovelStatus | number;
        };
        contribute?: string[];
        options?: import("node-novel-info").IMdconfMetaOptionsBase & {
            dmzj?: import("node-novel-info").IMdconfMetaOptionsNovelSite;
            kakuyomu?: import("node-novel-info").IMdconfMetaOptionsNovelSite;
            wenku8?: import("node-novel-info").IMdconfMetaOptionsNovelSite;
            webqxs?: import("node-novel-info").IMdconfMetaOptionsNovelSite;
            syosetu?: import("node-novel-info").IMdconfMetaOptionsNovelSite & {
                txtdownload_id: import("node-novel-info").INumber;
            };
            novel?: import("node-novel-info").IMdconfMetaOptionsBase & {
                pattern?: string;
            };
            textlayout?: import("node-novel-info").IMdconfMetaOptionsBase & {
                allow_lf2?: boolean;
                allow_lf3?: boolean;
            };
            downloadOptions?: import("node-novel-info").IMdconfMetaOptionsBase & {
                noFirePrefix?: boolean;
                noFilePadend?: boolean;
                filePrefixMode?: number;
                startIndex?: number;
            };
        };
        link?: string[];
        url: any;
        url_data: _NovelSite.IParseUrl;
    }>;
}
export default NovelSiteIqing;
