"use strict";
/**
 * Created by user on 2018/2/13/013.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tempPath = exports.testPath = exports.disablePaths = exports.rootModule = void 0;
const path_1 = require("path");
exports.rootModule = (0, path_1.join)(__dirname, '');
exports.disablePaths = [
    (0, path_1.join)(exports.rootModule, 'src'),
    (0, path_1.join)(exports.rootModule, 'node_modules'),
    (0, path_1.join)(exports.rootModule, '.idea'),
    (0, path_1.join)(exports.rootModule, '.git'),
];
exports.testPath = (0, path_1.join)(exports.rootModule, 'test');
exports.tempPath = (0, path_1.join)(exports.testPath, 'temp');
exports.default = {
    rootModule: exports.rootModule,
    disablePaths: exports.disablePaths,
    testPath: exports.testPath,
    tempPath: exports.tempPath,
};
//# sourceMappingURL=_root.js.map