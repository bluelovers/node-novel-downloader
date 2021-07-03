"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.md5_hex = exports.createPrivateKeyV4 = exports.decryptBase64 = exports.decryptBuffer = void 0;
const crypto_1 = require("crypto");
const crypto_2 = require("crypto");
const block_size = 1024 / 8;
function decryptBuffer(key, buffer) {
    const block_count = buffer.length;
    const blocks = [];
    let i = 0;
    while (i < block_count) {
        blocks.push(buffer.slice(i, i += block_size));
    }
    return Buffer.concat(blocks.map(p => (0, crypto_1.privateDecrypt)({
        key: key,
        padding: crypto_1.constants.RSA_PKCS1_PADDING,
    }, p)));
}
exports.decryptBuffer = decryptBuffer;
function decryptBase64(key, base64) {
    const buffer = Buffer.from(base64, "base64");
    return decryptBuffer(key, buffer);
}
exports.decryptBase64 = decryptBase64;
function createPrivateKeyV4(rsa_key) {
    return (0, crypto_1.createPrivateKey)({
        key: Buffer.from(rsa_key, "base64"),
        format: "der",
        type: "pkcs1",
    });
}
exports.createPrivateKeyV4 = createPrivateKeyV4;
function md5_hex(data) {
    return (0, crypto_2.createHash)("md5").update(data).digest('hex').toLowerCase();
}
exports.md5_hex = md5_hex;
//# sourceMappingURL=crypto.js.map