import * as bcu from 'bigint-crypto-utils';


export class RsaPubKey {
  e: bigint;
  n: bigint;

  constructor(e: bigint, n: bigint) {
    this.e = e;
    this.n = n;
  }

  encrypt(m: bigint): bigint {
    return bcu.modPow(m, this.e, this.n);
  }

  verify(s: bigint): bigint {
    return bcu.modPow(s, this.e, this.n);
  }
}

export class RsaPrivKey {
  d: bigint;
  n: bigint;

  constructor(d: bigint, n: bigint) {
    this.d = d;
    this.n = n;
  }

  decrypt(c: bigint): bigint {
    return bcu.modPow(c, this.d, this.n);
  }

  sign(m: bigint): bigint {
    return bcu.modPow(m, this.d, this.n);
  }
}

export class RsaKeyPair {
  publicKey: RsaPubKey;
  privateKey: RsaPrivKey;

  constructor(publicKey: RsaPubKey, privateKey: RsaPrivKey) {
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }
}

export const generateKeys = async function (bitLength: number): Promise<RsaKeyPair> {
  const e = 65537n;
  let p: bigint, q: bigint, n: bigint, phi: bigint;
  do {
    p = await bcu.prime(bitLength / 2 + 1);
    q = await bcu.prime(bitLength / 2);
    n = p * q;
    phi = (p - 1n) * (q - 1n);
  } while (bcu.bitLength(n) !== bitLength || (phi % e === 0n));

  const publicKey = new RsaPubKey(e, n);

  const d = bcu.modInv(e, phi);

  const privateKey = new RsaPrivKey(d, n);

  return {
    publicKey,
    privateKey,
  };
};
