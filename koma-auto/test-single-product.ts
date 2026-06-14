import { getProduct, mapMoySkladToProduct } from './lib/moysklad';
async function test() {
  try {
    const id = '055306c7-4e95-11f1-0a80-17ce000b2820';
    console.log("Fetching id:", id);
    const productRes = await getProduct(id);
    console.log("Raw Supplier:", JSON.stringify(productRes.supplier, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
