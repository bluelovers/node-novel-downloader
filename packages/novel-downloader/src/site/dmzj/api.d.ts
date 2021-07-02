/**
 * Created by user on 2018/3/25/025.
 */
import _NovelSite from '../index';
import { IDownloadOptions, INovel } from '../demo/base';
import { IFetchChapter, IOptionsRuntime } from '../demo/base';
import NovelSiteBase from '../demo/base';
import { IJSDOM } from 'jsdom-extra';
export declare class NovelSiteTpl extends NovelSiteBase {
    static readonly IDKEY: string;
    static check(url: string | URL | _NovelSite.IParseUrl, ...argv: any[]): boolean;
    static makeUrl(urlobj: _NovelSite.IParseUrl, bool?: boolean | number, ...argv: any[]): URL;
    static parseUrl(url: string | URL | number, ...argv: any[]): import("../../util/url").IParseUrlRuntime;
    makeUrl(urlobj: _NovelSite.IParseUrl, bool?: boolean | number, ...argv: any[]): URL;
    parseUrl(url: string | URL | number, ...argv: any[]): import("../../util/url").IParseUrlRuntime;
    session<T = IOptionsRuntime>(optionsRuntime: Partial<T & IDownloadOptions>, url: URL): this;
    createMainUrl<T>(url: string | URL, optionsRuntime: T & IOptionsRuntime): URL;
    _stripContent(text: string): string;
    protected _saveReadme(optionsRuntime: IOptionsRuntime, options?: {}, ...opts: any[]): Promise<{
        file: string;
        md: string;
    }>;
    protected _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache: any): Promise<string>;
    get_volume_list<T = IOptionsRuntime>(inputUrl: string | URL, optionsRuntime?: Partial<T & IDownloadOptions>): Promise<INovel>;
    protected _get_meta(inputUrl: any, optionsRuntime: any, cache: {
        dom: IJSDOM;
    }): Promise<INovel>;
}
export default NovelSiteTpl;
