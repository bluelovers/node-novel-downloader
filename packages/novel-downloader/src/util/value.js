"use strict";
/**
 * Created by user on 2020/1/1.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dotGetValue = exports.dotSetValue = void 0;
const tslib_1 = require("tslib");
const set_value_1 = tslib_1.__importDefault(require("set-value"));
exports.dotSetValue = set_value_1.default;
const get_value_1 = tslib_1.__importDefault(require("get-value"));
exports.dotGetValue = get_value_1.default;
exports.default = {
    dotSetValue: set_value_1.default,
    dotGetValue: get_value_1.default,
};
//# sourceMappingURL=value.js.map