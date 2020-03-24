"use strict";
/**
 * Created by user on 2018/2/13/013.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tempPath = exports.testPath = exports.disablePaths = exports.rootModule = void 0;
const path_1 = require("path");
exports.rootModule = path_1.join(__dirname, '');
exports.disablePaths = [
    path_1.join(exports.rootModule, 'src'),
    path_1.join(exports.rootModule, 'node_modules'),
    path_1.join(exports.rootModule, '.idea'),
    path_1.join(exports.rootModule, '.git'),
];
exports.testPath = path_1.join(exports.rootModule, 'test');
exports.tempPath = path_1.join(exports.testPath, 'temp');
exports.default = {
    rootModule: exports.rootModule,
    disablePaths: exports.disablePaths,
    testPath: exports.testPath,
    tempPath: exports.tempPath,
};
//# sourceMappingURL=_root.js.map