export declare function parse(input: string | URL): {
    url: string;
    fullsize: string;
    size: string;
    filename: string;
    icode?: undefined;
    authorid?: undefined;
} | {
    url: string;
    fullsize: string;
    size: string;
    icode: string;
    authorid: string;
    filename?: undefined;
};
export declare function parseAsync(input: string | URL): Promise<{
    url: string;
    fullsize: string;
    size: string;
    filename: string;
    icode?: undefined;
    authorid?: undefined;
} | {
    url: string;
    fullsize: string;
    size: string;
    icode: string;
    authorid: string;
    filename?: undefined;
}>;
export default parse;
