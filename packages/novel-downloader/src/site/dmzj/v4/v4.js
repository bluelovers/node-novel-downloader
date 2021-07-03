"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenV4 = exports.txt_key = exports.decryptBase64V4 = exports.decryptBufferV4 = exports.key = exports.rsa_key = void 0;
const crypto_1 = require("../util/crypto");
const ts_1 = require("../util/ts");
exports.rsa_key = "MIICXgIBAAKBgQCvJzUdZU5yHyHrOqEViTY95gejrLAxsdLhjKYKW1QqX+vlcJ7iNrLZoWTaEHDONeyM+1qpT821JrvUeHRCpixhBKjoTnVWnofV5NiDz46iLuU25C2UcZGN3STNYbW8+e3f66HrCS5GV6rLHxuRCWrjXPkXAAU3y2+CIhY0jJU7JwIDAQABAoGBAIs/6YtoSjiSpb3Ey+I6RyRo5/PpS98GV/i3gB5Fw6E4x2uO4NJJ2GELXgm7/mMDHgBrqQVoi8uUcsoVxaBjSm25737TGCueoR/oqsY7Qy540gylp4XAe9PPbDSmhDPSJYpersVjKzDAR/b9jy3WLKjAR6j7rSrv0ooHhj3oge1RAkEA4s1ZTb+u4KPfUACL9p/4GuHtMC4s1bmjQVxPPAHTp2mdCzk3p4lRKrz7YFJOt8245dD/6c0M8o4rcHuh6AgCKQJBAMWzrZwptbihKeR7DWlxCU8BO1kH+z6yw+PgaRrTSpII2un+heJXeEGdk0Oqr7Aos0hia4zqTXY1Rie24GDHHM8CQQC7yVjy5g4u06BXxkwdBLDR2VShOupGf/Ercfns7npHuEueel6Zajn5UAY2549j4oMATf9Gn0/kGVDgTo1s6AyZAkApc6PqA0DLxlbPRhGo0v99pid4YlkGa1rxM4M2Eakn911XBHuz2l0nfM98t5QAnngArEoakKHPMBpWh1yCTh03AkEAmcOddu2RrPGQ00q6IKx+9ysPx71+ecBgHoqymHL9vHmrr3ghu4shUdDxQfz/xA2Z8m/on78hBZbnD1CNPmPOxQ==";
exports.key = (0, crypto_1.createPrivateKeyV4)(exports.rsa_key);
function decryptBufferV4(buffer) {
    return (0, crypto_1.decryptBuffer)(exports.key, buffer);
}
exports.decryptBufferV4 = decryptBufferV4;
function decryptBase64V4(base64) {
    return (0, crypto_1.decryptBase64)(exports.key, base64);
}
exports.decryptBase64V4 = decryptBase64V4;
exports.txt_key = "IBAAKCAQEAsUAdKtXNt8cdrcTXLsaFKj9bSK1nEOAROGn2KJXlEVekcPssKUxSN8dsfba51kmHM";
function getTokenV4(path) {
    const ts = (0, ts_1.tsV4)();
    const sign_text = `${exports.txt_key}${path}${ts}`;
    const sign = (0, crypto_1.md5_hex)(sign_text);
    return {
        ts,
        sign_text,
        sign,
    };
}
exports.getTokenV4 = getTokenV4;
//# sourceMappingURL=v4.js.map