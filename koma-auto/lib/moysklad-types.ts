export interface MoySkladMeta {
  href: string;
  metadataHref?: string;
  type: string;
  mediaType: string;
  uuidHref?: string;
  downloadHref?: string;
  size?: number;
  limit?: number;
  offset?: number;
}

export interface MoySkladListResponse<T> {
  context?: {
    employee: { meta: MoySkladMeta };
  };
  meta: MoySkladMeta;
  rows: T[];
}

export interface MoySkladProduct {
  meta: MoySkladMeta;
  id: string;
  accountId: string;
  owner?: { meta: MoySkladMeta };
  shared?: boolean;
  group?: { meta: MoySkladMeta };
  updated?: string;
  name: string;
  description?: string;
  code?: string;
  externalCode?: string;
  archived?: boolean;
  pathName?: string;
  productFolder?: MoySkladProductFolder | { meta: MoySkladMeta };
  article?: string;
  weight?: number;
  volume?: number;
  barcodes?: Array<{ [key: string]: string }>;
  buyPrice?: {
    value: number;
    currency: { meta: MoySkladMeta };
  };
  salePrices?: Array<{
    value: number;
    currency: { meta: MoySkladMeta };
    priceType: { meta: MoySkladMeta; name: string };
  }>;
  attributes?: Array<{
    meta: MoySkladMeta;
    id: string;
    name: string;
    type: string;
    value: string | number | boolean | { meta: MoySkladMeta; name: string };
  }>;
  images?: {
    meta: MoySkladMeta;
    rows?: MoySkladImage[];
  };
  supplier?: {
    meta: MoySkladMeta;
    name?: string;
  };
  stock?: number;
  reserve?: number;
  inTransit?: number;
  quantity?: number;
}

export interface MoySkladImage {
  meta: MoySkladMeta;
  id?: string;
  title?: string;
  filename?: string;
  size?: number;
  updated?: string;
  miniature?: {
    href: string;
    mediaType: string;
    downloadHref?: string;
  };
  tiny?: {
    href: string;
    mediaType: string;
    downloadHref?: string;
  };
}

export interface MoySkladProductFolder {
  meta: MoySkladMeta;
  id: string;
  accountId?: string;
  owner?: { meta: MoySkladMeta };
  shared?: boolean;
  group?: { meta: MoySkladMeta };
  updated?: string;
  name: string;
  externalCode?: string;
  archived?: boolean;
  pathName?: string;
}

export interface MoySkladStockReport {
  meta: MoySkladMeta;
  stock: number;
  inTransit?: number;
  reserve?: number;
  quantity?: number;
  folder?: { meta: MoySkladMeta; name: string };
  name?: string;
  article?: string;
  code?: string;
  price?: number;
  salePrice?: number;
  uom?: { meta: MoySkladMeta; name: string };
}
