/**
 * Created by user on 2018/3/25/025.
 */
import _NovelSite from '../index';
import { IFetchChapter, IOptionsRuntime } from '../demo/base';
import NovelSiteBase from '../demo/base';
export declare class NovelSiteTpl extends NovelSiteBase {
    static readonly IDKEY: string;
    makeUrl(urlobj: _NovelSite.IParseUrl, bool?: boolean | number): URL;
    parseUrl(url: URL | string, options?: any): _NovelSite.IParseUrl;
    createMainUrl(url: any): URL;
    _stripContent(text: string): string;
    protected _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache: any): string;
    _createChapterUrl<T = IOptionsRuntime>({ novel, volume, chapter, }: {
        novel: any;
        volume: any;
        chapter: any;
    }, { return: , new: URL }: {
        return: any;
        new: any;
    }): any;
}
export default NovelSiteTpl;
