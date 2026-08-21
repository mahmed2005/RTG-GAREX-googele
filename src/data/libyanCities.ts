import { LibyanCity } from '../types';
import { ALL_DELIVERY_RATES, findDeliveryRate } from './deliveryData';

export { ALL_DELIVERY_RATES, DELIVERY_ZONES, findDeliveryRate } from './deliveryData';

export const LIBYAN_CITIES_LIST: string[] = ALL_DELIVERY_RATES.map((r) => r.name);

export const LIBYAN_CITIES: LibyanCity[] = ALL_DELIVERY_RATES.map((rate) => ({
  name: rate.name,
  regions: [rate.name],
  price: rate.price,
  zone: rate.zoneName,
}));
