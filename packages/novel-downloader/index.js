"use strict";
/**
 * Created by user on 2018/6/25/025.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelSite = void 0;
const site_1 = __importDefault(require("./src/site"));
exports.NovelSite = site_1.default;
const all_1 = __importDefault(require("./src/all"));
exports.default = all_1.default;
__exportStar(require("./src/all"), exports);
//# sourceMappingURL=index.js.map