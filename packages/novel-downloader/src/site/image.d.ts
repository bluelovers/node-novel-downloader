/**
 * Created by user on 2018/1/17/017.
 */
/// <reference types="node" />
import Promise = require("bluebird");
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
