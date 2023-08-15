export declare const txtUrlPrefix: "https://jurisdiction.idmzj.com";
export declare class TxtUrlCreator {
    volid: number;
    chapterid: number;
    constructor(volid: number, chapterid: number);
    getPath(): string;
    toString(): string;
    static newUrl(volid: number, chapterid: number): string;
}
