"use strict";
/**
 * Created by user on 2018/3/18/018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultJSDOMOptions = exports.LazyCookieJar = exports.LazyCookie = exports.VirtualConsole = void 0;
exports.createOptionsJSDOM = createOptionsJSDOM;
exports.getOptions = getOptions;
const jsdom_extra_1 = require("jsdom-extra");
Object.defineProperty(exports, "VirtualConsole", { enumerable: true, get: function () { return jsdom_extra_1.VirtualConsole; } });
const jsdom_extra_2 = require("jsdom-extra");
Object.defineProperty(exports, "LazyCookie", { enumerable: true, get: function () { return jsdom_extra_2.LazyCookie; } });
Object.defineProperty(exports, "LazyCookieJar", { enumerable: true, get: function () { return jsdom_extra_2.LazyCookieJar; } });
const jsdom_extra_3 = require("jsdom-extra");
const from_url_1 = require("jsdom-extra/lib/from-url");
exports.defaultJSDOMOptions = {
    //virtualConsole: new VirtualConsole,
    //runScripts: 'dangerously',
    disableCheerio: true,
    minifyHTML: true,
};
function createOptionsJSDOM(options = {}, ...opts) {
    options = Object.assign({}, exports.defaultJSDOMOptions, options, ...opts);
    // @ts-ignore
    options.cookieJar = options.cookieJar || new jsdom_extra_2.LazyCookieJar();
    return options;
}
function getOptions(options) {
    let opts = (0, jsdom_extra_3.packOptions)(options.optionsJSDOM || options);
    let fromURLOptions = (0, from_url_1.normalizeFromURLOptions)(opts);
    let requestOptions = (0, from_url_1.normalizeRequestOptions)(fromURLOptions);
    return {
        options: opts,
        fromURLOptions,
        requestOptions,
    };
}
//# sourceMappingURL=jsdom.js.map