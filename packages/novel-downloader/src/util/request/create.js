"use strict";
/**
 * Created by user on 2019/4/28.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequestPromise = exports.createCachedRequest = exports.createBluebirdPromise = exports.createStealthyRequest = void 0;
const bluebird_1 = require("bluebird");
const cached_request_1 = __importDefault(require("cached-request"));
const request2_1 = __importDefault(require("request-promise-core/configure/request2"));
const stealthy_require_1 = __importDefault(require("stealthy-require"));
let Bluebird;
function createStealthyRequest(libRequest) {
    if (libRequest == null) {
        libRequest = 'request';
    }
    if (typeof libRequest === 'string') {
        libRequest = stealthy_require_1.default(require.cache, function () {
            return require('request');
        }, function () {
            require('tough-cookie');
        }, module);
    }
    return libRequest;
}
exports.createStealthyRequest = createStealthyRequest;
function createBluebirdPromise(libPromise) {
    if (libPromise == null) {
        if (Bluebird == null) {
            Bluebird = bluebird_1.getNewLibraryCopy();
            Bluebird.config({ cancellation: true });
        }
        libPromise = Bluebird;
    }
    if (typeof libPromise === 'string') {
        libPromise = require(libPromise)
            .getNewLibraryCopy();
        libPromise.config({ cancellation: true });
    }
    return libPromise;
}
exports.createBluebirdPromise = createBluebirdPromise;
function createCachedRequest(libRequest) {
    return cached_request_1.default(createStealthyRequest(libRequest));
}
exports.createCachedRequest = createCachedRequest;
function createRequestPromise(options = {}) {
    let { libRequest, libPromise } = options;
    libPromise = createBluebirdPromise(libPromise);
    libRequest = createStealthyRequest(libRequest);
    request2_1.default({
        request: libRequest,
        PromiseImpl: libPromise,
        expose: [
            'then',
            'catch',
            'finally',
            'cancel',
            'promise',
        ],
        constructorMixin: function (resolve, reject, onCancel) {
            const self = this;
            onCancel(function () {
                self.abort();
            });
        },
    });
    // @ts-ignore
    libRequest.bindCLS = function RP$bindCLS() {
        throw new Error('CLS support was dropped. To get it back read: https://github.com/request/request-promise/wiki/Getting-Back-Support-for-Continuation-Local-Storage');
    };
    return libRequest;
}
exports.createRequestPromise = createRequestPromise;
exports.default = createRequestPromise;
//# sourceMappingURL=create.js.map