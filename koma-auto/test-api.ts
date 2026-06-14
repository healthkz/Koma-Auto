import { fetchMoySklad } from './lib/moysklad';

async function test() {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    const searchTerm = 'свеча';
    
    const searchTerm = 'свеча';
    
    const url = `/entity/assortment?filter=archived=false;search=${encodeURIComponent(searchTerm)}`;
    const res = await fetchMoySklad<any>(url);
    
    let countPriceGreaterThanZero = 0;
    for (const item of res.rows || []) {
      const price = item.salePrices?.[0]?.value || 0;
      if (price > 0) countPriceGreaterThanZero++;
    }
    
    console.log(`Total "свеча" in DB: ${res.meta?.size}`);
    console.log(`Total "свеча" with PRICE > 0: ${countPriceGreaterThanZero}`);
  } catch (e: any) {
    console.error('Fetch error:', e.message);
  }
}
test();
test();
