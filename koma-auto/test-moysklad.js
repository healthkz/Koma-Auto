const https = require('https');
require('dotenv').config({ path: '.env.local' });

const options = {
  hostname: 'api.moysklad.ru',
  path: '/api/remap/1.2/entity/assortment?limit=1&stockMode=positive',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${process.env.MOYSKLAD_TOKEN}`,
    'Accept-Encoding': 'gzip'
  }
};

const req = https.request(options, (res) => {
  let chunks = [];
  res.on('data', (d) => chunks.push(d));
  res.on('end', () => {
    const zlib = require('zlib');
    zlib.gunzip(Buffer.concat(chunks), (err, decoded) => {
      if (err) console.error(err);
      else console.log(JSON.parse(decoded.toString()));
    });
  });
});
req.on('error', console.error);
req.end();
