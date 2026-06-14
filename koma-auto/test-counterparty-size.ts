import { fetchMoySklad } from './lib/moysklad';
async function run() {
  try {
    const res = await fetchMoySklad<any>('/entity/counterparty?limit=1');
    console.log('Total counterparties:', res.meta.size);
  } catch (e) {
    console.error(e);
  }
}
run();
