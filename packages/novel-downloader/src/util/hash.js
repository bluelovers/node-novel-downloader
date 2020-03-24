"use strict";
/**
 * Created by user on 2019/8/31.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashSum = void 0;
const hash_sum_1 = __importDefault(require("hash-sum"));
function hashSum(value) {
    return hash_sum_1.default(value);
}
exports.hashSum = hashSum;
//# sourceMappingURL=hash.js.map