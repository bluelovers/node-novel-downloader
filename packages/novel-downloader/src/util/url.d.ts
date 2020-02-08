import type NovelSite from '../site/index';
import { ITSOverwrite } from 'ts-type';
export declare function createURL(...argv: ConstructorParameters<typeof URL>): URL;
export declare function isURL(obj: any): obj is URL;
export interface IParseUrlRuntime extends ITSOverwrite<NovelSite.IParseUrl, {
    url: URL;
}> {
}
export declare function _handleParseURL(url: string | URL | number, ...argv: any[]): {
    urlobj: IParseUrlRuntime;
    url: string;
};
export default createURL;
