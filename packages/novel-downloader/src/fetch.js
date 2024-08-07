"use strict";
/**
 * Created by user on 2018/2/9/009.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryRequest = retryRequest;
exports.manyRequest = manyRequest;
const tslib_1 = require("tslib");
const request_promise_1 = tslib_1.__importDefault(require("@bluelovers/request-promise"));
const bluebird_1 = tslib_1.__importDefault(require("bluebird"));
const log_1 = require("./util/log");
function retryRequest(url, options = {}) {
    options = Object.assign({
        retry: 3,
        delay: 1000,
    }, options);
    let retry = options.retry || 3;
    let libRequest = options.libRequest || request_promise_1.default;
    let tries = 0;
    if (url.href) {
        url = url.href;
    }
    function fn() {
        tries++;
        // @ts-ignore
        return libRequest(url.toString(), options)
            .catch(function (err) {
            if (retry-- > 0) {
                log_1.console.warn(`fetch fail(${tries}), will wait ${options.delay}ms, for try again\n${url}`);
                return bluebird_1.default.delay(options.delay).then(fn);
            }
            err.tries = tries;
            return bluebird_1.default.reject(err);
        });
    }
    return bluebird_1.default.resolve().then(function () {
        return fn();
    }).tapCatch(function (err) {
        log_1.console.error(err);
    });
}
function manyRequest(url_arr, options = {}) {
    options = Object.assign({
        retry: 3,
        delay: 1000,
    }, options);
    let libRequest = options.libRequest || request_promise_1.default;
    return bluebird_1.default
        .mapSeries(url_arr, function (url) {
        if (url.href) {
            url = url.href;
        }
        // @ts-ignore
        return libRequest(url.toString(), options);
    })
        .tapCatch(function (err) {
        log_1.console.error(err);
    });
}
//# sourceMappingURL=fetch.js.map