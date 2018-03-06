/// <reference types="bluebird" />
/// <reference types="node" />
import * as Promise from 'bluebird';
export declare function download_image(img: string | URL, options: {
    name?: string;
    dir?: string;
    fromfile?: string;
    prefix?: string;
}): Promise<{
    body: Buffer;
    url: URL;
    dirname: string;
    filename: string;
    outputFile: string;
}>;
export default download_image;
