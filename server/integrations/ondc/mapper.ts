import { Product } from '../../../src/types.js';

/**
 * Maps internal KALAtech craft product to standard ONDC Beckn Protocol catalog item.
 */
export function mapProductToOndcItem(product: Product): Record<string, any> {
  const price = product.artisanApprovedPrice || product.final_price || 1500;
  return {
    id: product.id,
    parent_item_id: product.category,
    descriptor: {
      name: product.title,
      code: `CRAFT-${product.id}`,
      symbol: product.original_image_url || '',
      short_desc: product.short_description || product.description,
      long_desc: product.description,
      images: [product.original_image_url, product.enhanced_image_url].filter(Boolean),
    },
    price: {
      currency: 'INR',
      value: String(price),
      maximum_value: String(Math.round(price * 1.15)),
    },
    category_id: product.category,
    fulfillment_id: 'standard-artisan-shipping',
    location_id: product.artisan_district || 'India',
    tags: [
      {
        code: 'origin',
        list: [
          { code: 'state', value: product.artisan_state || 'India' },
          { code: 'district', value: product.artisan_district || '' },
          { code: 'craft_type', value: product.category || '' },
        ],
      },
      {
        code: 'fair_trade',
        list: [
          { code: 'verified_living_wage', value: 'yes' },
          { code: 'direct_to_artisan', value: 'yes' },
        ],
      },
    ],
    matched: true,
  };
}
