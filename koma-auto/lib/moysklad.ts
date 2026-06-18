import { MoySkladListResponse, MoySkladProduct, MoySkladProductFolder, MoySkladStockReport } from './moysklad-types';
import { Product } from '../data/products';

const API_URL = process.env.MOYSKLAD_API_URL || 'https://api.moysklad.ru/api/remap/1.2';
const TOKEN = process.env.MOYSKLAD_TOKEN;
const LOGIN = process.env.MOYSKLAD_LOGIN;
const PASSWORD = process.env.MOYSKLAD_PASSWORD;

export function getMoySkladAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept-Encoding': 'gzip',
    'Content-Type': 'application/json',
  };

  if (TOKEN) {
    headers.Authorization = `Bearer ${TOKEN}`;
  } else if (LOGIN && PASSWORD) {
    const basic = Buffer.from(`${LOGIN}:${PASSWORD}`).toString('base64');
    headers.Authorization = `Basic ${basic}`;
  }

  return headers;
}

export async function fetchMoySklad<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  
  const headers = {
    ...getMoySkladAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `MoySklad API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.errors && errorData.errors.length > 0) {
        errorMsg += ` - ${errorData.errors[0].error}`;
      }
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export async function getProducts(
  limit = 24,
  offset = 0,
  search = '',
  categoryHref: string | string[] = '',
  brandHref: string | string[] = '',
  inStockOnly = false,
  categoryName = ''
): Promise<MoySkladListResponse<MoySkladProduct>> {
  const filters: string[] = ['archived=false'];
  if (categoryHref) {
    if (Array.isArray(categoryHref)) {
      categoryHref.forEach(href => filters.push(`productFolder=${href}`));
    } else {
      filters.push(`productFolder=${categoryHref}`);
    }
  }
  if (brandHref) {
    if (Array.isArray(brandHref)) {
      brandHref.forEach(href => filters.push(`supplier=${href}`));
    } else {
      filters.push(`supplier=${brandHref}`);
    }
  }

  if (inStockOnly) {
    filters.push(`stockMode=positiveonly`);
  }

  if (search) {
    filters.push(`search=${encodeURIComponent(search)}`);
  }

  let url = `/entity/assortment?limit=${limit}&offset=${offset}&expand=images,productFolder,supplier`;
  
  if (filters.length > 0) {
    url += `&filter=${filters.join(';')}`;
  }
  
  return fetchMoySklad<MoySkladListResponse<MoySkladProduct>>(url);
}

export async function getProduct(id: string): Promise<MoySkladProduct> {
  const res = await fetchMoySklad<MoySkladListResponse<MoySkladProduct>>(`/entity/assortment?limit=1&filter=id=${id}&expand=images,productFolder,supplier`);
  if (!res.rows || res.rows.length === 0) {
    throw new Error(`Product with id ${id} not found in assortment`);
  }
  
  const product = res.rows[0];
  
  // Workaround for MoySklad API bug where expand=supplier sometimes fails to include the name when filtering by id
  if (product.supplier && !product.supplier.name && product.supplier.meta && product.supplier.meta.href) {
    try {
      const supplierData = await fetchMoySklad<any>(product.supplier.meta.href);
      if (supplierData && supplierData.name) {
        product.supplier.name = supplierData.name;
      }
    } catch (e) {
      console.error('Failed to fetch supplier details for product:', e);
    }
  }
  
  return product;
}

// Removed getStockAll as assortment endpoint returns stock natively

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids || ids.length === 0) return [];
  
  const chunkSize = 20;
  const allProducts: Product[] = [];
  
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const filterStr = chunk.map(id => `id=${id}`).join(';');
    try {
      const res = await fetchMoySklad<MoySkladListResponse<MoySkladProduct>>(
        `/entity/assortment?limit=100&filter=${filterStr}&expand=images,productFolder,supplier`
      );
      if (res.rows) {
        allProducts.push(...res.rows.map(mapMoySkladToProduct));
      }
    } catch (e) {
      console.error('Error fetching batch products chunk:', e);
    }
  }
  
  return allProducts;
}

export async function getProductFolders(): Promise<MoySkladListResponse<MoySkladProductFolder>> {
  return fetchMoySklad<MoySkladListResponse<MoySkladProductFolder>>(`/entity/productfolder`);
}

export function mapMoySkladToProduct(
  msProduct: MoySkladProduct
): Product {
  let category = 'other';
  if (msProduct.productFolder && 'name' in msProduct.productFolder) {
    category = msProduct.productFolder.name as string;
  }

  let brand = 'НЕИЗВЕСТНО';
  if (msProduct.supplier && msProduct.supplier.name) {
    brand = msProduct.supplier.name;
  } else if (msProduct.attributes) {
    const brandAttr = msProduct.attributes.find(a => a.name.toLowerCase() === 'бренд');
    if (brandAttr && typeof brandAttr.value === 'string') {
      brand = brandAttr.value;
    } else if (brandAttr && typeof brandAttr.value === 'object' && 'name' in brandAttr.value) {
       brand = brandAttr.value.name;
    }
  }

  let price = 0;
  if (msProduct.salePrices && msProduct.salePrices.length > 0) {
    price = msProduct.salePrices[0].value / 100;
  }

  let oldPrice: number | undefined;
  if (msProduct.salePrices && msProduct.salePrices.length > 1) {
    const oldPriceValue = msProduct.salePrices[1].value / 100;
    if (oldPriceValue > price) {
      oldPrice = oldPriceValue;
    }
  }

  const stock = msProduct.stock || 0;
  const inStock = stock > 0;

  let image: string | undefined;
  let images: string[] = [];
  if (msProduct.images && msProduct.images.rows && msProduct.images.rows.length > 0) {
    const imgUrl = msProduct.images.rows[0].meta.downloadHref;
    if (imgUrl) {
      image = `/api/images?href=${encodeURIComponent(imgUrl)}`;
    }
    
    images = msProduct.images.rows.map(img => {
      return img.meta.downloadHref ? `/api/images?href=${encodeURIComponent(img.meta.downloadHref)}` : '';
    }).filter(url => url !== '');
  }

  const specs: Record<string, string> = {};
  if (msProduct.attributes) {
    msProduct.attributes.forEach(attr => {
      if (attr.name.toLowerCase() !== 'бренд') {
         if (typeof attr.value === 'string') {
             specs[attr.name] = attr.value;
         } else if (typeof attr.value === 'object' && 'name' in attr.value) {
             specs[attr.name] = attr.value.name;
         }
      }
    });
  }

  return {
    id: msProduct.id,
    moySkladId: msProduct.id,
    article: msProduct.code || msProduct.article || '',
    brand,
    name: msProduct.name,
    price,
    oldPrice,
    inStock,
    category,
    image,
    images,
    specs,
    compatibility: [],
    description: msProduct.description || '',
  };
}
