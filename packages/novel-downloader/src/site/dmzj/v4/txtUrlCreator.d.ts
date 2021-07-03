export declare const txtUrlPrefix: "http://jurisdiction.muwai.com";
export declare class TxtUrlCreator {
    volid: number;
    chapterid: number;
    constructor(volid: number, chapterid: number);
    getPath(): string;
    toString(): string;
    static newUrl(volid: number, chapterid: number): string;
}
