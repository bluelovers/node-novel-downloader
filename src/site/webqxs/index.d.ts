export declare const IDKEY = "webqxs";
export declare const PATH_NOVEL_MAIN: string;
export declare function makeUrl(urlobj: any, bool?: boolean): string;
export declare function parseUrl(url: string): {
    url: string;
    novel_pid: any;
    novel_id: any;
    chapter_id: any;
};
export declare function get_volume_list(url: any): Promise<any>;
export declare function download(url: string): Promise<any>;
export default download;
