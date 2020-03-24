"use strict";
/**
 * Created by user on 2019/1/3/003.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.console = void 0;
const debug_color2_1 = require("debug-color2");
exports.console = new debug_color2_1.Console();
exports.console.inspectOptions = exports.console.inspectOptions || {};
exports.console.inspectOptions.colors = true;
exports.console.enabledColor = true;
exports.default = exports.console;
//# sourceMappingURL=log.js.map