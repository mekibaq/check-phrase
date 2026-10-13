# check-phrase

Four words that name an address. The same address always gets the same four words; an address that differs by one character gets different ones. [Quantum Scan](https://mekiba.si/terminal/) shows them next to every address it checks, so you can compare an address you are about to use with the one you expect without reading 42 characters.

```
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045  →  tide · cash · tomorrow · venture
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96046  →  dismiss · over · ability · process
```

## Spec (v1)

```
words    = BIP-39 English list, indexed by the first 44 bits (4 x 11) of
           PBKDF2-HMAC-SHA256(
             password   = "mekiba-check-phrase-v1|" + family + "|" + address,
             salt       = "mekiba check-phrase v1",
             iterations = 100,000,
             output     = 64 bits)
family   = evm | btc | sol
address  = EVM: 0x + 40 hex in lowercase · Bitcoin bech32 (bc1...): lowercase · Bitcoin base58 and Solana: exactly as typed
word i   = bits [11·i, 11·i + 11) of the output, counted from the most significant bit (i = 0..3)
```

Wordlist: BIP-39 English, 2,048 words. SHA-256 of the list with one word per line and a final newline: `2f5eed53a4727b4bf8880d8f3f199efc90e58503646d9ff8eff3a2ed3b24dbda`.

## Use

```js
import { checkPhrase } from './check-phrase.js';
await checkPhrase('evm', '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
// ['tide', 'cash', 'tomorrow', 'venture']
```

Works in current browsers and in Node.js 20 or newer. No dependencies: it uses WebCrypto.

## Test vectors

`vectors.json` holds six addresses (EVM, Bitcoin bech32 and base58, Solana) with their words. `npm test` (or `node test.mjs`) checks them with the WebCrypto code and with an independent implementation on Node's `crypto.pbkdf2Sync`, checks the wordlist hash, and checks that EVM addresses ignore case.

## Limits

- Four words carry 44 bits. Each guess costs 100,000 PBKDF2 rounds on top of making a key pair, so a look-alike address with the same four words is expensive, but a well-funded attacker could make one. Matching only some of the words is cheaper. Treat a matching phrase as a quick check, not a proof.
- A check-phrase only says two addresses are the same. It says nothing about who owns an address or whether it is safe.
- v1 is fixed: any change to the inputs or the list would be a new version with a new prefix.

## License

MIT. See `LICENSE`.
