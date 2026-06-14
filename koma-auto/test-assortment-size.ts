import { fetchMoySklad } from './lib/moysklad';
async function run() {
  const res = await fetchMoySklad<any>('/entity/assortment?limit=1');
  console.log('Total items in assortment:', res.meta.size);
}
run();
