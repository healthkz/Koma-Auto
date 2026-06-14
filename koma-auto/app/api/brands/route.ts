import { NextResponse } from 'next/server';
import { fetchMoySklad } from '@/lib/moysklad';

export const revalidate = 3600;

export async function GET() {
  try {
    const brandMap = new Map<string, string>();

    // Fetch counterparties (suppliers).
    // Almost all counterparties in this MoySklad account are suppliers.
    // Fetching them directly is much faster than scanning 17,000 assortment items.
    const res1 = await fetchMoySklad<any>('/entity/counterparty?limit=1000');
    const res2 = await fetchMoySklad<any>('/entity/counterparty?limit=1000&offset=1000');
    
    const allCounterparties = [...(res1.rows || []), ...(res2.rows || [])];

    allCounterparties.forEach((c: any) => {
      if (c.name) {
        const lower = c.name.trim().toLowerCase();
        // Capitalize the first letter of each word to normalize "KORPARTS", "korparts", etc.
        const normalized = lower.replace(/\b\w/g, (char: string) => char.toUpperCase());
        brandMap.set(lower, normalized);
      }
    });

    // Convert normalized unique values to sorted Array
    const sortedBrands = Array.from(new Set(brandMap.values())).sort();

    return NextResponse.json(sortedBrands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}
