"use strict";
/**
 * Created by user on 2019/8/31.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashSum = void 0;
const tslib_1 = require("tslib");
const hash_sum_1 = (0, tslib_1.__importDefault)(require("hash-sum"));
function hashSum(value) {
    return (0, hash_sum_1.default)(value);
}
exports.hashSum = hashSum;
//# sourceMappingURL=hash.js.map