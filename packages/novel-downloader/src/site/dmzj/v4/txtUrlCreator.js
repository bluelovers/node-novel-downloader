"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TxtUrlCreator = exports.txtUrlPrefix = void 0;
const v4_1 = require("./v4");
exports.txtUrlPrefix = 'https://jurisdiction.idmzj.com';
class TxtUrlCreator {
    constructor(volid, chapterid) {
        this.volid = volid;
        this.chapterid = chapterid;
        this.volid = volid;
        this.chapterid = chapterid;
    }
    getPath() {
        return `/lnovel/${this.volid}_${this.chapterid}.txt`;
    }
    toString() {
        const path = this.getPath();
        const { ts, sign } = (0, v4_1.getTokenV4)(path);
        return exports.txtUrlPrefix + path + `?t=${ts}&k=${sign}`;
    }
    static newUrl(volid, chapterid) {
        return new this(volid, chapterid).toString();
    }
}
exports.TxtUrlCreator = TxtUrlCreator;
//# sourceMappingURL=txtUrlCreator.js.map
