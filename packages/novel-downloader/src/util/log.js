"use strict";
/**
 * Created by user on 2019/2/3/003.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.chalkByConsole = exports.consoleDebug = exports.console = void 0;
const debug_color2_1 = require("debug-color2");
Object.defineProperty(exports, "chalkByConsole", { enumerable: true, get: function () { return debug_color2_1.chalkByConsole; } });
exports.console = new debug_color2_1.Console(null, {
    inspectOptions: {
        colors: true,
    },
});
exports.console.enabledColor = true;
exports.consoleDebug = new debug_color2_1.Console(null, {
    inspectOptions: {
        colors: true,
    },
    time: true,
    label: true,
});
exports.consoleDebug.enabledColor = true;
exports.consoleDebug.enabled = false;
//# sourceMappingURL=log.js.map