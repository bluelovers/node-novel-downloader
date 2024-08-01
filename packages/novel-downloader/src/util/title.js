"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nullTitle = nullTitle;
const util_1 = require("../util");
function nullTitle(title) {
    title = (0, util_1.trim)(title);
    if (!(title === null || title === void 0 ? void 0 : title.length)) {
        title = 'null';
    }
    return title;
}
//# sourceMappingURL=title.js.map