// node test.mjs  (Node.js 20 or newer)
import { readFileSync } from 'node:fs';
import { createHash, pbkdf2Sync } from 'node:crypto';
import { checkPhrase, normalize, WORDS } from './check-phrase.js';

let fails = 0;
const list = WORDS.join('\n') + '\n';
const listHash = createHash('sha256').update(list).digest('hex');
if (WORDS.length !== 2048 || listHash !== '2f5eed53a4727b4bf8880d8f3f199efc90e58503646d9ff8eff3a2ed3b24dbda') { console.log('FAIL wordlist', WORDS.length, listHash); fails++; }

// an independent implementation with Node's own PBKDF2, to check the WebCrypto one
const reference = (family, address) => {
  const bits = pbkdf2Sync('mekiba-check-phrase-v1|' + family + '|' + normalize(family, address), 'mekiba check-phrase v1', 100000, 8, 'sha256');
  const n = BigInt('0x' + bits.toString('hex'));
  return [0, 1, 2, 3].map(i => WORDS[Number((n >> BigInt(53 - 11 * i)) & 2047n)]);
};

for (const v of JSON.parse(readFileSync(new URL('./vectors.json', import.meta.url)))) {
  const got = await checkPhrase(v.family, v.address);
  const ok = got.join(' ') === v.words.join(' ') && reference(v.family, v.address).join(' ') === got.join(' ');
  console.log((ok ? 'PASS ' : 'FAIL ') + v.address + '  ' + got.join(' · '));
  if (!ok) fails++;
}
const upper = await checkPhrase('evm', '0xD8DA6BF26964AF9D7EED9E03E53415D37AA96045');
const lower = await checkPhrase('evm', '0xd8da6bf26964af9d7eed9e03e53415d37aa96045');
if (upper.join() !== lower.join()) { console.log('FAIL EVM case'); fails++; } else console.log('PASS EVM addresses ignore case');
console.log(fails ? fails + ' FAILED' : 'ALL PASS');
process.exit(fails ? 1 : 0);
