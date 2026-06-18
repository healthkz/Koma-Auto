import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve('.env.local');
let login = '';
let password = '';
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      if (match[1] === 'MOYSKLAD_LOGIN') login = match[2].trim();
      if (match[1] === 'MOYSKLAD_PASSWORD') password = match[2].trim();
    }
  });
}

async function main() {
  try {
    const basic = Buffer.from(`${login}:${password}`).toString('base64');
    const response = await fetch('https://api.moysklad.ru/api/remap/1.2/entity/store', {
      headers: {
        'Authorization': `Basic ${basic}`,
        'Accept-Encoding': 'gzip'
      }
    });
    
    if (!response.ok) {
        throw new Error(await response.text());
    }

    const res = await response.json();
    console.log("Stores found:");
    res.rows.forEach((s: any) => {
      console.log(`- ${s.name} (id: ${s.id}, href: ${s.meta.href})`);
    });
  } catch (e) {
    console.error(e);
  }
}

main();
