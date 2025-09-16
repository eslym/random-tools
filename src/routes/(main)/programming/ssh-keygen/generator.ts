// Web Crypto → SSH keys with optional passphrase (PBES2: PBKDF2 + AES-CBC)

export type RSAOptions = {
	algorithm: 'rsa';
	comment?: string;
	modulusLength?: 2048 | 3072 | 4096;
	publicExponent?: number | Uint8Array; // default 65537 (0x010001)
	hash?: 'SHA-256' | 'SHA-384' | 'SHA-512';
	passphrase?: string | Uint8Array;
	protection?: ProtectionOptions;
};

export type ECDSAOptions = {
	algorithm: 'ecdsa';
	comment?: string;
	namedCurve?: 'P-256' | 'P-384' | 'P-521';
	passphrase?: string | Uint8Array;
	protection?: ProtectionOptions;
};

export type Ed25519Options = {
	algorithm: 'ed25519';
	comment?: string;
	passphrase?: string | Uint8Array;
	protection?: ProtectionOptions;
};

export type ProtectionOptions = {
	cipher?: 'aes-256-cbc' | 'aes-192-cbc' | 'aes-128-cbc';
	kdf?: {
		iterations?: number;
		saltSize?: number;
		hash?: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
	};
};

export type SshKeyOptions = RSAOptions | ECDSAOptions | Ed25519Options;

export interface SshKeyResult {
	publicOpenSsh: string;
	/** Encrypted if a passphrase was supplied; label reflects that. */
	privatePem: string;
	publicKey: CryptoKey;
	privateKey: CryptoKey;
	meta:
		| { type: 'rsa'; modulusLength: number; hash: string }
		| { type: 'ecdsa'; namedCurve: 'P-256' | 'P-384' | 'P-521' }
		| { type: 'ed25519' };
	/** Present only when passphrase was used. */
	encryption?: {
		scheme: 'PBES2';
		kdf: {
			algo: 'PBKDF2';
			prf: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
			iterations: number;
			saltB64: string;
		};
		cipher: 'aes-128-cbc' | 'aes-192-cbc' | 'aes-256-cbc';
		ivB64: string;
	};
}

/* -------------------- env-safe base64 helpers -------------------- */
function b64(bytes: Uint8Array): string {
	let s = '';
	const chunk = 0x8000;
	for (let i = 0; i < bytes.length; i += chunk)
		s += String.fromCharCode(...bytes.subarray(i, i + chunk));
	return btoa(s);
}
function b64uToBytes(b64u: string): Uint8Array {
	const pad = '='.repeat((4 - (b64u.length % 4)) % 4);
	const b64s = (b64u + pad).replace(/-/g, '+').replace(/_/g, '/');
	const bin = atob(b64s);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}

/* -------------------- binary helpers -------------------- */
const te = new TextEncoder();
const textBytes = (s: string) => te.encode(s);

const u32be = (n: number) => {
	const b = new Uint8Array(4);
	b[0] = (n >>> 24) & 0xff;
	b[1] = (n >>> 16) & 0xff;
	b[2] = (n >>> 8) & 0xff;
	b[3] = n & 0xff;
	return b;
};
const concat = (...arrs: Uint8Array[]) => {
	const len = arrs.reduce((a, b) => a + b.length, 0);
	const out = new Uint8Array(len);
	let off = 0;
	for (const a of arrs) {
		out.set(a, off);
		off += a.length;
	}
	return out;
};

const sshString = (bytes: Uint8Array) => concat(u32be(bytes.length), bytes);
/** SSH mpint: strip leading zeros; prepend 0x00 if high bit set. */
function sshMpint(bytes: Uint8Array): Uint8Array {
	let v = bytes;
	let i = 0;
	while (i < v.length && v[i] === 0) i++;
	v = v.slice(i);
	if (v.length === 0) v = new Uint8Array([0]);
	if (v[0] & 0x80) v = concat(new Uint8Array([0]), v);
	return sshString(v);
}
function numberToBigEndianBytes(n: number): Uint8Array {
	if (n <= 0) throw new Error('publicExponent must be positive.');
	const out: number[] = [];
	let big = BigInt(n);
	while (big > 0n) {
		out.push(Number(big & 0xffn));
		big >>= 8n;
	}
	if (out.length === 0) out.push(0);
	out.reverse();
	return new Uint8Array(out);
}

function pem(label: string, bytes: Uint8Array | ArrayBuffer): string {
	const body = b64(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)).replace(
		/(.{64})/g,
		'$1\n'
	);
	return `-----BEGIN ${label}-----\n${body}\n-----END ${label}-----`;
}

/* -------------------- ASN.1 DER (minimal) -------------------- */
const TAG_SEQ = 0x30,
	TAG_OCTET = 0x04,
	TAG_OID = 0x06,
	TAG_INT = 0x02,
	TAG_NULL = 0x05;
const derLen = (n: number) => {
	if (n < 128) return new Uint8Array([n]);
	const bytes: number[] = [];
	let x = n;
	while (x > 0) {
		bytes.push(x & 0xff);
		x >>= 8;
	}
	bytes.reverse();
	return new Uint8Array([0x80 | bytes.length, ...bytes]);
};
const tlv = (tag: number, v: Uint8Array) => concat(new Uint8Array([tag]), derLen(v.length), v);
const derSeq = (...els: (Uint8Array | undefined)[]) =>
	tlv(TAG_SEQ, concat(...(els.filter(Boolean) as Uint8Array[])));
const derOctet = (v: Uint8Array) => tlv(TAG_OCTET, v);
const derNull = () => new Uint8Array([TAG_NULL, 0x00]);
const derInt = (n: number) => {
	const bytes: number[] = [];
	let big = BigInt(n);
	while (big > 0n) {
		bytes.push(Number(big & 0xffn));
		big >>= 8n;
	}
	if (bytes.length === 0) bytes.push(0);
	bytes.reverse();
	if (bytes[0] & 0x80) bytes.unshift(0);
	return tlv(TAG_INT, new Uint8Array(bytes));
};
const derOID = (oid: string) => {
	const parts = oid.split('.').map((x) => parseInt(x, 10));
	const head = 40 * parts[0] + parts[1];
	const bytes: number[] = [head];
	for (let i = 2; i < parts.length; i++) {
		let n = parts[i];
		const stack: number[] = [];
		do {
			stack.push(n & 0x7f);
			n >>= 7;
		} while (n > 0);
		for (let j = stack.length - 1; j >= 0; j--) bytes.push(stack[j] | (j ? 0x80 : 0x00));
	}
	return tlv(TAG_OID, new Uint8Array(bytes));
};
const derAlgId = (oid: string, params?: Uint8Array) => derSeq(derOID(oid), params ?? derNull());

/* OIDs */
const OID = {
	pbes2: '1.2.840.113549.1.5.13',
	pbkdf2: '1.2.840.113549.1.5.12',
	aes128cbc: '2.16.840.1.101.3.4.1.2',
	aes192cbc: '2.16.840.1.101.3.4.1.22',
	aes256cbc: '2.16.840.1.101.3.4.1.42',
	hmacSHA1: '1.2.840.113549.2.7',
	hmacSHA224: '1.2.840.113549.2.8',
	hmacSHA256: '1.2.840.113549.2.9',
	hmacSHA384: '1.2.840.113549.2.10',
	hmacSHA512: '1.2.840.113549.2.11'
} as const;

/* -------------------- PBES2 (PKCS#8 encryption) -------------------- */
function pkcs7Pad(data: Uint8Array, blockSize = 16): Uint8Array {
	const padLen = blockSize - (data.length % blockSize || blockSize);
	const out = new Uint8Array(data.length + padLen);
	out.set(data, 0);
	out.fill(padLen, data.length);
	return out;
}
const rand = (n: number) => crypto.getRandomValues(new Uint8Array(n));

function cipherSpec(name: 'aes-256-cbc' | 'aes-192-cbc' | 'aes-128-cbc') {
	switch (name) {
		case 'aes-128-cbc':
			return { oid: OID.aes128cbc, bits: 128, ivSize: 16 as const };
		case 'aes-192-cbc':
			return { oid: OID.aes192cbc, bits: 192, ivSize: 16 as const };
		default:
			return { oid: OID.aes256cbc, bits: 256, ivSize: 16 as const };
	}
}
function prfOid(hash: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512') {
	return hash === 'SHA-1'
		? OID.hmacSHA1
		: hash === 'SHA-256'
			? OID.hmacSHA256
			: hash === 'SHA-384'
				? OID.hmacSHA384
				: OID.hmacSHA512;
}
async function encryptPkcs8WithPBES2(
	pkcs8: Uint8Array,
	passphrase: Uint8Array,
	opts?: {
		cipher?: 'aes-256-cbc' | 'aes-192-cbc' | 'aes-128-cbc';
		kdf?: {
			iterations?: number;
			saltSize?: number;
			hash?: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
		};
	}
): Promise<{ pem: string; meta: SshKeyResult['encryption'] }> {
	const cipherName = opts?.cipher ?? 'aes-256-cbc';
	const { oid: encOid, bits: keyBits, ivSize } = cipherSpec(cipherName);
	const kdfIters = opts?.kdf?.iterations ?? 100_000;
	const kdfSalt = rand(opts?.kdf?.saltSize ?? 16);
	const kdfHash = opts?.kdf?.hash ?? 'SHA-1'; // default PRF omitted in ASN.1

	const baseKey = await crypto.subtle.importKey('raw', passphrase as any, 'PBKDF2', false, [
		'deriveKey'
	]);
	const aesKey = await crypto.subtle.deriveKey(
		{ name: 'PBKDF2', salt: kdfSalt, iterations: kdfIters, hash: kdfHash },
		baseKey,
		{ name: 'AES-CBC', length: keyBits },
		false,
		['encrypt']
	);

	const iv = rand(ivSize);
	const padded = pkcs7Pad(pkcs8, 16);
	const ct = new Uint8Array(
		await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, aesKey, padded as any)
	);

	// Build EncryptedPrivateKeyInfo
	// PBKDF2 params: SEQ { salt OCTET, iter INT, keyLength INT, prf AlgId (omit if SHA-1) }
	const pbkdfParams = derSeq(
		derOctet(kdfSalt),
		derInt(kdfIters),
		derInt(keyBits / 8),
		kdfHash === 'SHA-1' ? undefined : derAlgId(prfOid(kdfHash), derNull())
	);
	const kdfAlgId = derSeq(derOID(OID.pbkdf2), pbkdfParams);
	const encScheme = derSeq(derOID(encOid), derOctet(iv));
	const pbes2Params = derSeq(kdfAlgId, encScheme);
	const algId = derSeq(derOID(OID.pbes2), pbes2Params);
	const encryptedPrivateKeyInfo = derSeq(algId, derOctet(ct));

	const pemText = pem('ENCRYPTED PRIVATE KEY', encryptedPrivateKeyInfo);

	return {
		pem: pemText,
		meta: {
			scheme: 'PBES2',
			kdf: { algo: 'PBKDF2', prf: kdfHash, iterations: kdfIters, saltB64: b64(kdfSalt) },
			cipher: cipherName,
			ivB64: b64(iv)
		}
	};
}

/* -------------------- OpenSSH public encoders -------------------- */
async function exportRsaOpenSsh(pubKey: CryptoKey, comment = ''): Promise<string> {
	const jwk = (await crypto.subtle.exportKey('jwk', pubKey)) as JsonWebKey;
	if (!jwk.n || !jwk.e) throw new Error('Unexpected RSA JWK without n/e.');
	const n = b64uToBytes(jwk.n);
	const e = b64uToBytes(jwk.e);
	const type = textBytes('ssh-rsa');
	const blob = concat(sshString(type), sshMpint(e), sshMpint(n));
	return `ssh-rsa ${b64(blob)}${comment ? ' ' + comment : ''}`;
}
function curveShortName(namedCurve: 'P-256' | 'P-384' | 'P-521') {
	return ({ 'P-256': 'nistp256', 'P-384': 'nistp384', 'P-521': 'nistp521' } as const)[namedCurve];
}
async function exportEcdsaOpenSsh(
	pubKey: CryptoKey,
	namedCurve: 'P-256' | 'P-384' | 'P-521',
	comment = ''
) {
	const raw = new Uint8Array(await crypto.subtle.exportKey('raw', pubKey)); // 0x04||X||Y
	const short = curveShortName(namedCurve);
	const typeStr = `ecdsa-sha2-${short}`;
	const blob = concat(sshString(textBytes(typeStr)), sshString(textBytes(short)), sshString(raw));
	return `${typeStr} ${b64(blob)}${comment ? ' ' + comment : ''}`;
}
async function exportEd25519OpenSsh(pubKey: CryptoKey, comment = '') {
	const raw = new Uint8Array(await crypto.subtle.exportKey('raw', pubKey)); // 32 bytes
	const type = textBytes('ssh-ed25519');
	const blob = concat(sshString(type), sshString(raw));
	return `ssh-ed25519 ${b64(blob)}${comment ? ' ' + comment : ''}`;
}

/* -------------------- main API -------------------- */
export async function generateSshKey(options: SshKeyOptions): Promise<SshKeyResult> {
	if (!globalThis.crypto?.subtle) throw new Error('Web Crypto SubtleCrypto is not available.');

	const comment = (options as any).comment ?? '';

	const toPem = async (pkcs8Buf: ArrayBuffer) => {
		const pkcs8 = new Uint8Array(pkcs8Buf);
		if (!('passphrase' in options) || !options.passphrase) {
			return { pem: pem('PRIVATE KEY', pkcs8), enc: undefined as SshKeyResult['encryption'] };
		}
		const passBytes =
			typeof options.passphrase === 'string' ? te.encode(options.passphrase) : options.passphrase;
		const { pem: encPem, meta } = await encryptPkcs8WithPBES2(pkcs8, passBytes, options.protection);
		return { pem: encPem, enc: meta };
	};

	if (options.algorithm === 'rsa') {
		const modulusLength = options.modulusLength ?? 3072;
		const hash = options.hash ?? 'SHA-256';
		const publicExponentBytes =
			options.publicExponent instanceof Uint8Array
				? options.publicExponent
				: numberToBigEndianBytes((options.publicExponent as number) ?? 65537);

		const keyPair = await crypto.subtle.generateKey(
			{
				name: 'RSASSA-PKCS1-v1_5',
				modulusLength,
				publicExponent: publicExponentBytes,
				hash
			} as any,
			true,
			['sign', 'verify']
		);

		const publicOpenSsh = await exportRsaOpenSsh(keyPair.publicKey, comment);
		const pkcs8 = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
		const { pem: privatePem, enc } = await toPem(pkcs8);

		return {
			publicOpenSsh,
			privatePem,
			publicKey: keyPair.publicKey,
			privateKey: keyPair.privateKey,
			meta: { type: 'rsa', modulusLength, hash },
			encryption: enc
		};
	}

	if (options.algorithm === 'ecdsa') {
		const namedCurve = options.namedCurve ?? 'P-256';
		if (!['P-256', 'P-384', 'P-521'].includes(namedCurve))
			throw new Error(`Unsupported ECDSA curve: ${namedCurve}`);

		const keyPair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve }, true, [
			'sign',
			'verify'
		]);
		const publicOpenSsh = await exportEcdsaOpenSsh(keyPair.publicKey, namedCurve, comment);
		const pkcs8 = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
		const { pem: privatePem, enc } = await toPem(pkcs8);

		return {
			publicOpenSsh,
			privatePem,
			publicKey: keyPair.publicKey,
			privateKey: keyPair.privateKey,
			meta: { type: 'ecdsa', namedCurve },
			encryption: enc
		};
	}

	// ed25519
	const keyPair = (await crypto.subtle.generateKey(
		{ name: 'Ed25519' } as AlgorithmIdentifier,
		true,
		['sign', 'verify']
	)) as CryptoKeyPair;
	const publicOpenSsh = await exportEd25519OpenSsh(keyPair.publicKey, comment);
	const pkcs8 = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
	const { pem: privatePem, enc } = await toPem(pkcs8);

	return {
		publicOpenSsh,
		privatePem,
		publicKey: keyPair.publicKey,
		privateKey: keyPair.privateKey,
		meta: { type: 'ed25519' },
		encryption: enc
	};
}
