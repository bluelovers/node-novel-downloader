"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nullTitle = void 0;
const util_1 = require("../util");
function nullTitle(title) {
    title = (0, util_1.trim)(title);
    if (!(title === null || title === void 0 ? void 0 : title.length)) {
        title = 'null';
    }
    return title;
}
exports.nullTitle = nullTitle;
//# sourceMappingURL=title.js.map