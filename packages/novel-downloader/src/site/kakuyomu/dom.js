"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._classStartWith = _classStartWith;
exports._jQueryClassStartWith = _jQueryClassStartWith;
exports._jQueryElemOuterHTML = _jQueryElemOuterHTML;
function _classStartWith(prefix, suffix) {
    return `[class^="${prefix}"]${suffix !== null && suffix !== void 0 ? suffix : ''}`;
}
function _jQueryClassStartWith($, selector, prefix, suffix, parent) {
    return $(`${selector}${_classStartWith(prefix, suffix)}`, parent);
}
function _jQueryElemOuterHTML($) {
    return $.prop('outerHTML');
}
//# sourceMappingURL=dom.js.map