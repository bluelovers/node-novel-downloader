/// <reference types="node" />
/// <reference types="node" />
import { KeyObject } from "crypto";
import { BinaryLike } from "crypto";
export declare function decryptBuffer(key: KeyObject, buffer: Buffer): Buffer;
export declare function decryptBase64(key: KeyObject, base64: string): Buffer;
export declare function createPrivateKeyV4(rsa_key: string): KeyObject;
export declare function md5_hex(data: BinaryLike): string;
