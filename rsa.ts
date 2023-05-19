import bcu from 'bigint-crypto-utils'

// info de que contienen las llaves BlindSignature.pdf transparencia 10
// Kpub=(e,n)  e=exponente público n=módulo público
// Kpriv=(d,n) d=exponente privado n=módulo público

export class RsaPubKey {
  // la clave publica puede encryptar o verificar
  // encrypt recibe mensaje m
  // verifica una firma(sign) s
  e: bigint
  n: bigint
  constructor (e: bigint, n: bigint) {
    this.e = e
    this.n = n
  }

  encrypt (m: bigint): bigint {
    return bcu.modPow(m, this.e, this.n)
  }

  verify (s: bigint): bigint {
    return bcu.modPow(s, this.e, this.n)
  }
}
export class RsaPrivKey {
  // la clave privada puede desencryptar y firmar
  // frima el mensaje m
  d: bigint
  n: bigint
  constructor (d: bigint, n: bigint) {
    this.d = d
    this.n = n
  }

  dencrypt (c: bigint): bigint {
    return bcu.modPow(c, this.d, this.n)
  }

  sign (m: bigint): bigint {
    return bcu.modPow(m, this.d, this.n)
  }
}
export class RsaKeyPair {
  publicKey: RsaPubKey
  privKey: RsaPrivKey

  constructor (publicKey: RsaPubKey, privKey: RsaPrivKey) {
    this.publicKey = publicKey
    this.privKey = privKey
  }
}

// para generar llaves, se tienen que generar 2 primos muy grandes
// info BlindSignature.pdf transparencia 10,11,12,13
export const generatekeys = async function name (bitLength: number): Promise<RsaKeyPair> {
  const e = 65537n
  let p: bigint, q: bigint, n: bigint, phi: bigint
  do {
    p = await bcu.prime(bitLength / 2 + 1)
    q = await bcu.prime(bitLength / 2)
    n = p * q
    phi = (p - 1n) * (q - 1n)
  } while (bcu.bitLength(n) !== bitLength || (phi % e === 0n))

  const publicKey = new RsaPubKey(e, n)

  const d = bcu.modInv(e, phi)

  const privKey = new RsaPrivKey(d, n)

  return {
    publicKey,
    privKey
  }
}