import { constants, createPrivateKey, KeyObject, privateDecrypt } from "crypto";
import { BinaryLike, createHash as createCryptoHash, Hash } from "crypto";

const block_size = 1024 / 8;

export function decryptBuffer(key: KeyObject, buffer: Buffer)
{
	const block_count = buffer.length;
	const blocks = [];

	let i = 0;
	while (i < block_count)
	{
		blocks.push(buffer.slice(i, i += block_size))
	}

	return Buffer.concat(blocks.map(p => privateDecrypt({
		key: key,
		padding: constants.RSA_PKCS1_PADDING,
	}, p)))
}

export function decryptBase64(key: KeyObject, base64: string)
{
	const buffer = Buffer.from(base64, "base64");

	return decryptBuffer(key, buffer)
}

export function createPrivateKeyV4(rsa_key: string)
{
	return createPrivateKey({
		key: Buffer.from(rsa_key, "base64"),
		format: "der",
		type: "pkcs1",
	})
}

export function md5_hex(data: BinaryLike)
{
	return createCryptoHash("md5").update(data).digest('hex').toLowerCase()
}
