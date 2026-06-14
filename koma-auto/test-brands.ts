import { getProducts } from './lib/moysklad';
async function test() {
  try {
    const res = await getProducts(5, 0, '');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
