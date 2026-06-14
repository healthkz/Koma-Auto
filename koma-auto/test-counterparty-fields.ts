import { fetchMoySklad } from './lib/moysklad';
async function run() {
  try {
    const res = await fetchMoySklad<any>('/entity/counterparty?limit=5');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (e) {
    console.error(e);
  }
}
run();
