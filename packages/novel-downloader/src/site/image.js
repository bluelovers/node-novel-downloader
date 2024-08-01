"use strict";
/**
 * Created by user on 2018/1/17/017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.download_image = download_image;
const tslib_1 = require("tslib");
const fs_iconv_1 = tslib_1.__importDefault(require("fs-iconv"));
const util_1 = require("fs-iconv/util");
const request_promise_1 = tslib_1.__importDefault(require("@bluelovers/request-promise"));
const jsdom_extra_1 = require("jsdom-extra");
const bluebird_1 = tslib_1.__importDefault(require("bluebird"));
const upath2_1 = tslib_1.__importDefault(require("upath2"));
function download_image(img, options) {
    let dirname = options.dir || upath2_1.default.dirname(options.fromfile);
    if (!dirname) {
        throw new Error();
    }
    // @ts-ignore
    let url = new jsdom_extra_1.URL(img);
    let filename = options.name || upath2_1.default.basename(url.href);
    if (typeof options.prefix == 'string') {
        filename = options.prefix + filename;
    }
    filename = (0, util_1.trimFilename)(filename);
    let file = upath2_1.default.join(dirname, filename);
    let ret = (0, request_promise_1.default)(url.href, {
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
    // @ts-ignore
    return bluebird_1.default.resolve(ret);
}
exports.default = download_image;
//export default exports;
//# sourceMappingURL=image.js.map