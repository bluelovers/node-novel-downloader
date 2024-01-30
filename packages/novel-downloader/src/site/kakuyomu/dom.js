"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._jQueryElemOuterHTML = exports._jQueryClassStartWith = exports._classStartWith = void 0;
function _classStartWith(prefix, suffix) {
    return `[class^="${prefix}"]${suffix !== null && suffix !== void 0 ? suffix : ''}`;
}
exports._classStartWith = _classStartWith;
function _jQueryClassStartWith($, selector, prefix, suffix, parent) {
    return $(`${selector}${_classStartWith(prefix, suffix)}`, parent);
}
exports._jQueryClassStartWith = _jQueryClassStartWith;
function _jQueryElemOuterHTML($) {
    return $.prop('outerHTML');
}
exports._jQueryElemOuterHTML = _jQueryElemOuterHTML;
//# sourceMappingURL=dom.js.map