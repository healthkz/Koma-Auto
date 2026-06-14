import { NextResponse } from 'next/server';
import { getProducts, getProductFolders, mapMoySkladToProduct, fetchMoySklad } from '@/lib/moysklad';
import { products as fallbackProducts } from '@/data/products';

import { CATEGORY_MAPPINGS } from '@/lib/categoryMapping';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '24', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const inStockOnly = searchParams.get('inStockOnly') === 'true';
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');
    const originalsOnly = searchParams.get('originalsOnly') === 'true';

    let categoryHref: string | string[] = '';
    
    if (category) {
      const foldersRes = await getProductFolders();
      // Look up mapping for the category name
      const mappedSubcategories = CATEGORY_MAPPINGS[category];
      
      if (mappedSubcategories && mappedSubcategories.length > 0) {
        // Find hrefs for all mapped subcategories
        const hrefs = foldersRes.rows
          .filter((f: any) => mappedSubcategories.includes(f.name.trim()))
          .map((f: any) => f.meta?.href)
          .filter(Boolean);
          
        if (hrefs.length > 0) {
          categoryHref = hrefs;
        }
      } else {
        // Fallback for single category match if not in mappings or empty
        const folder = foldersRes.rows.find((f: any) => f.name.toLowerCase() === category.toLowerCase() || f.id === category);
        if (folder && folder.meta) {
          categoryHref = folder.meta.href;
        }
      }
    }

    let brandHref: string | string[] = '';
    
    if (originalsOnly) {
      // Fetch original brands
      try {
        const suppliersRes = await fetchMoySklad<any>('/entity/counterparty?search=Hyundai');
        const originalNames = [
          'hyundai', 'hyundai org', 'hyundai org atc',
          'hyundai-kia', 'hyundai/kia', 'hyundai/kia org'
        ];
        const hrefs = suppliersRes.rows
          ?.filter((s: any) => originalNames.includes(s.name.toLowerCase().trim()))
          .map((s: any) => s.meta.href) || [];
          
        if (hrefs.length > 0) {
          brandHref = hrefs;
        }
      } catch (e) {
        console.error('Failed to resolve original brand hrefs', e);
      }
    } else if (brand) {
      // Fetch counterparties by search to get hrefs for all variants (e.g. KORPARTS, Korparts)
      try {
        const suppliersRes = await fetchMoySklad<any>(`/entity/counterparty?search=${encodeURIComponent(brand)}`);
        // Find all exact case-insensitive matches
        const matchedSuppliers = suppliersRes.rows?.filter((s: any) => s.name.toLowerCase() === brand.toLowerCase());
        
        if (matchedSuppliers && matchedSuppliers.length > 0) {
          brandHref = matchedSuppliers.map((s: any) => s.meta.href);
        } else if (suppliersRes.rows?.[0]) {
          // Fallback to first search result if no exact match
          brandHref = suppliersRes.rows[0].meta.href;
        }
      } catch (e) {
        console.error('Failed to resolve brand href', e);
      }
    }

    const productsRes = await getProducts(limit, offset, search || '', categoryHref, brandHref, inStockOnly, category || '');

    // Map products
    let mappedProducts = (productsRes.rows || []).map(msProduct => mapMoySkladToProduct(msProduct));

    // Apply any final filtering that MoySklad API couldn't handle
    // Globally hide products that have a price of 0
    mappedProducts = mappedProducts.filter(p => p.price > 0);

    const rawCount = productsRes.rows?.length || 0;
    const hasMore = rawCount === limit;

    // Return the response
    return NextResponse.json({
      products: mappedProducts,
      total: productsRes.meta?.size || mappedProducts.length,
      limit: productsRes.meta?.limit || limit,
      offset: productsRes.meta?.offset || offset,
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching products from API:', error);
    // Return fallback static data if API fails so the site doesn't crash completely
    return NextResponse.json({
      products: fallbackProducts,
      total: fallbackProducts.length,
      limit: 100,
      offset: 0,
      error: 'MoySklad API failed, using fallback data'
    });
  }
}
