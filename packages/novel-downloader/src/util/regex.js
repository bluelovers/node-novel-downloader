"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zhRegExp = void 0;
const tslib_1 = require("tslib");
const regexp_cjk_1 = (0, tslib_1.__importDefault)(require("regexp-cjk"));
const regexp_cjk_plugin_extra_1 = (0, tslib_1.__importDefault)(require("regexp-cjk-plugin-extra"));
const regexp_cjk_plugin_escape_unicode_property_1 = (0, tslib_1.__importDefault)(require("regexp-cjk-plugin-escape-unicode-property"));
exports.zhRegExp = regexp_cjk_1.default.use({
    onCore: [
        (0, regexp_cjk_plugin_escape_unicode_property_1.default)({
            escapeAuto: true,
        }),
    ],
    on: [
        (0, regexp_cjk_plugin_extra_1.default)({
            autoVoice: true,
            autoLocale: true,
            autoDeburr: true,
            autoFullHaif: true,
        })
    ],
    unsafe: true,
    greedyTable: 2,
});
exports.default = exports.zhRegExp;
//# sourceMappingURL=regex.js.map