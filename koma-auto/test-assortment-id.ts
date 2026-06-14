import { fetchMoySklad } from './lib/moysklad';
async function test() {
  try {
    const res = await fetchMoySklad('/entity/assortment?limit=1&filter=id=055306c7-4e95-11f1-0a80-17ce000b2820&expand=images,productFolder,supplier');
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
