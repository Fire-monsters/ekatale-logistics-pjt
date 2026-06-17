// apps/app1-farmer/src/services/api/price.api.ts
import { get } from './httpClient';
import { LISTING_API_BASE_URL, API_ROUTES } from '../../constants';
import type { Commodity, PriceForecast, PriceGuidance, ProduceUnit } from '../../types';

interface RawPrice {
  commodityId: string;
  commodity?: { nameEn: string; emoji?: string | null };
  regionId: string;
  unit: string;
  floorPrice: string | number;
  ceilingPrice: string | number;
  currentPrice: string | number;
  trend: 'RISING' | 'FALLING' | 'STABLE';
  trendPct?: string | number | null;
}

function mapPrice(raw: RawPrice): PriceGuidance {
  return {
    commodityId: raw.commodityId,
    commodityName: raw.commodity?.nameEn,
    commodityEmoji: raw.commodity?.emoji ?? undefined,
    unit: raw.unit as ProduceUnit,
    regionId: raw.regionId,
    currentPrice: Number(raw.currentPrice),
    floorPrice: Number(raw.floorPrice),
    ceilingPrice: Number(raw.ceilingPrice),
    trend: raw.trend,
    trendPct: raw.trendPct != null ? Number(raw.trendPct) : undefined,
  };
}

export const priceApi = {
  /** Pass commodityIds to scope the response; omit region for national prices */
  getPrices: async (params?: { commodityIds?: string[]; regionId?: string }): Promise<PriceGuidance[]> => {
    const qs = new URLSearchParams();
    if (params?.commodityIds?.length) qs.set('commodities', params.commodityIds.join(','));
    if (params?.regionId) qs.set('region', params.regionId);
    const query = qs.toString() ? `?${qs.toString()}` : '';

    const raw = await get<RawPrice[]>(LISTING_API_BASE_URL, `${API_ROUTES.PRICE_CHECK}${query}`);
    return raw.map(mapPrice);
  },

  getForecast: (commodityId: string, regionId = 'national'): Promise<PriceForecast> =>
    get<PriceForecast>(
      LISTING_API_BASE_URL,
      `${API_ROUTES.PRICE_FORECAST}?commodity=${commodityId}&region=${regionId}`,
    ),

  /** Crop taxonomy — used by ListProduce crop picker */
  listCommodities: () => get<Commodity[]>(LISTING_API_BASE_URL, API_ROUTES.COMMODITIES),
};