"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumResponseTypeKey = void 0;
exports._lookupType = _lookupType;
exports.lookupTypeRoot = lookupTypeRoot;
exports.lookupTypeNovelChapterResponse = lookupTypeNovelChapterResponse;
exports.lookupTypeNovelDetailResponse = lookupTypeNovelDetailResponse;
exports.protoLongToNumber = protoLongToNumber;
exports.protoLongToMilliseconds = protoLongToMilliseconds;
const tslib_1 = require("tslib");
const protobufjs_1 = tslib_1.__importDefault(require("protobufjs"));
const dmzjproto_json_1 = tslib_1.__importDefault(require("./dmzjproto.json"));
var EnumResponseTypeKey;
(function (EnumResponseTypeKey) {
    EnumResponseTypeKey["Root"] = "Root";
    EnumResponseTypeKey["NovelChapterResponse"] = "NovelChapterResponse";
    EnumResponseTypeKey["NovelDetailResponse"] = "NovelDetailResponse";
})(EnumResponseTypeKey || (exports.EnumResponseTypeKey = EnumResponseTypeKey = {}));
const _cache = new Map();
function _cacheGet(key, fn) {
    let value = _cache.get(key);
    value !== null && value !== void 0 ? value : (value = (() => {
        let _new;
        if (typeof fn === 'function') {
            // @ts-ignore
            _new = fn(key);
        }
        else {
            // @ts-ignore
            _new = fn;
        }
        if (_new !== value) {
            return _new;
        }
    })());
    return value;
}
function _lookupType(path) {
    return _cacheGet(path, (path) => {
        return lookupTypeRoot().lookupType(path);
    });
}
function lookupTypeRoot() {
    return _cacheGet(EnumResponseTypeKey.Root, () => {
        return protobufjs_1.default.Root.fromJSON(dmzjproto_json_1.default);
    });
}
function lookupTypeNovelChapterResponse() {
    return _lookupType(EnumResponseTypeKey.NovelChapterResponse);
}
function lookupTypeNovelDetailResponse() {
    return _lookupType(EnumResponseTypeKey.NovelDetailResponse);
}
function protoLongToNumber(long) {
    // @ts-ignore
    //return long.toNumber()
    return +long;
}
function protoLongToMilliseconds(long) {
    return protoLongToNumber(long) * 1000;
}
//# sourceMappingURL=protobuf.js.map