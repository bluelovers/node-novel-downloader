import NovelSite from '../index';
export { _remove_ad } from 'esjzone-api/lib/util/site';
export { _p_2_br } from 'restful-decorator-plugin-jsdom/lib/jquery';
export declare function check(url: string | URL | NovelSite.IParseUrl, options?: any): boolean;
export declare function makeUrl(urlobj: NovelSite.IParseUrl, bool?: boolean | number, ...argv: any[]): URL;
export declare function parseUrl(_url: string | URL | number, ...argv: any[]): import("../../util/url").IParseUrlRuntime;
