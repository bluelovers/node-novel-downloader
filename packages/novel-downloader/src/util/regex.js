"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zhRegExp = void 0;
const regexp_cjk_1 = __importDefault(require("regexp-cjk"));
const regexp_cjk_plugin_extra_1 = __importDefault(require("regexp-cjk-plugin-extra"));
const regexp_cjk_plugin_escape_unicode_property_1 = __importDefault(require("regexp-cjk-plugin-escape-unicode-property"));
exports.zhRegExp = regexp_cjk_1.default.use({
    onCore: [
        regexp_cjk_plugin_escape_unicode_property_1.default({
            escapeAuto: true,
        }),
    ],
    on: [
        regexp_cjk_plugin_extra_1.default({
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