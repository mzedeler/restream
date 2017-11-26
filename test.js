const fs = require('fs');
const stream = require('stream');
const zlib = require('zlib');

const r = fs.createReadStream(__filename);
const z = zlib.createGzip();
const w = fs.createWriteStream(__filename + '.gz');
const i = r.pipe(z);

console.log(z instanceof stream.Duplex);
console.log(z instanceof stream.Writable);
console.log(i instanceof stream.Readable);
console.log(z === i);
i.pipe(w);
