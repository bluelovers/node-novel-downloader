"use strict";
/**
 * Created by user on 2018/1/17/017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs_iconv_1 = require("fs-iconv");
const request = require("request-promise");
const jsdom_extra_1 = require("jsdom-extra");
const Promise = require("bluebird");
const path = require("path");
function download_image(img, options) {
    let dirname = options.dir || path.dirname(options.fromfile);
    if (!dirname) {
        throw new Error();
    }
    let url = new jsdom_extra_1.URL(img);
    let filename = options.name || path.basename(url.href);
    if (typeof options.prefix == 'string') {
        filename = options.prefix + filename;
    }
    filename = fs_iconv_1.trimFilename(filename);
    let file = path.join(dirname, filename);
    let ret = request(url.href, {
        encoding: null,
        resolveWithFullResponse: true,
    })
        .then(async function (res) {
        //console.log(res);
        await fs_iconv_1.default.saveFile(file, res.body);
        return {
            body: res.body,
            url,
            dirname,
            filename,
            outputFile: file,
        };
    });
    return Promise.resolve(ret);
}
exports.download_image = download_image;
exports.default = download_image;
//export default exports;
