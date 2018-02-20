export declare function makeUrl(urlobj: any, page?: any): string;
/**
 *
 * @param url
 * @returns {{url: string; novel_id: null; volume_id: null; chapter_id: null}}
 */
export declare function parseUrl(url: string): {
    url: string;
    novel_id: any;
    volume_id: any;
    chapter_id: any;
};
export default exports;
