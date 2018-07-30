/**
 * Created by user on 2018/3/25/025.
 */
import _NovelSite from '../index';
import { IDownloadOptions, INovel } from '../demo/base';
import { IFetchChapter, IOptionsRuntime } from '../demo/base';
import NovelSiteBase from '../demo/base';
import { IJSDOM } from 'jsdom-extra';
export declare class NovelSiteWenku8 extends NovelSiteBase {
    static readonly IDKEY: string;
    makeUrl(urlobj: _NovelSite.IParseUrl, bool?: boolean | number): URL;
    parseUrl(url: URL | string, options?: any): _NovelSite.IParseUrl;
    createMainUrl(url: any): URL;
    protected _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache: any): string;
    get_volume_list<T = IOptionsRuntime>(inputUrl: string | URL, optionsRuntime?: Partial<T & IDownloadOptions>): Promise<INovel>;
    protected _get_meta(inputUrl: any, optionsRuntime: any, cache: {
        dom: IJSDOM;
    }): Promise<{
        novel_title: any;
        novel_cover: any;
        novel_author: any;
        novel_desc: string;
        novel_date: any;
        novel_status: any;
        novel_publisher: any;
        novel?: {
            title?: string;
            title_short?: string;
            title_zh?: string;
            title_en?: string;
            title_jp?: string;
            author?: string;
            cover?: string;
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
            publisher?: string;
        };
        contribute?: string[];
        options?: {
            [key: string]: any;
            textlayout?: {
                allow_lf2?: boolean;
            };
        };
        link?: string[];
        url: URL;
        url_data: _NovelSite.IParseUrl;
    }>;
}
export default NovelSiteWenku8;
