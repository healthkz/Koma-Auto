import { fetchMoySklad } from './lib/moysklad';
async function test() {
  try {
    const res = await fetchMoySklad('/entity/assortment?limit=1&expand=images,productFolder,supplier&stockMode=positive');
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
