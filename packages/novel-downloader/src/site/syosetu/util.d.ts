import type NovelSite from '../index';
import { IParseUrlRuntime } from '../../util/url';
export declare function check(url: string | URL | NovelSite.IParseUrl, options?: any): boolean;
export declare function makeUrl(urlobj: NovelSite.IParseUrl, bool?: boolean | number, ...argv: any[]): URL;
export declare function parseUrl(_url: string | URL | number, ...argv: any[]): IParseUrlRuntime;
