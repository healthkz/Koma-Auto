import { NextResponse } from 'next/server';
import { getProduct, mapMoySkladToProduct } from '@/lib/moysklad';
import { products as fallbackProducts } from '@/data/products';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params;

    const productRes = await getProduct(id);

    // Map product
    const mappedProduct = mapMoySkladToProduct(productRes);

    return NextResponse.json(mappedProduct);
  } catch (error) {
    console.error(`Error fetching product:`, error);
    
    // Fallback logic
    const params = await context.params;
    const fallbackProduct = fallbackProducts.find(p => p.id === params.id || p.moySkladId === params.id);
    if (fallbackProduct) {
       return NextResponse.json(fallbackProduct);
    }
    
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
