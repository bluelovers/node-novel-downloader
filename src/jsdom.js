"use strict";
/**
 * Created by user on 2018/3/18/018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_extra_1 = require("jsdom-extra");
exports.VirtualConsole = jsdom_extra_1.VirtualConsole;
const jsdom_extra_2 = require("jsdom-extra");
exports.LazyCookie = jsdom_extra_2.LazyCookie;
exports.LazyCookieJar = jsdom_extra_2.LazyCookieJar;
exports.defaultJSDOMOptions = {
    virtualConsole: new jsdom_extra_1.VirtualConsole,
    runScripts: 'dangerously',
    disableCheerio: true,
    minifyHTML: true,
};
function createOptionsJSDOM(options = {}, ...opts) {
    options = Object.assign({}, exports.defaultJSDOMOptions, options, ...opts);
    options.cookieJar = options.cookieJar || new jsdom_extra_2.LazyCookieJar();
    return options;
}
exports.createOptionsJSDOM = createOptionsJSDOM;
const self = require("./jsdom");
exports.default = self;
