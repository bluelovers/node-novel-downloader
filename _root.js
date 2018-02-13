"use strict";
/**
 * Created by user on 2018/2/13/013.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
exports.rootModule = path.join(__dirname, '');
exports.disablePaths = [
    path.join(exports.rootModule, 'src'),
    path.join(exports.rootModule, 'node_modules'),
    path.join(exports.rootModule, '.idea'),
    path.join(exports.rootModule, '.git'),
];
const self = require("./_root");
exports.default = self;
