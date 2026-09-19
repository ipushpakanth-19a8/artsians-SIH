import { mapProductToOndcItem } from './mapper.js';
import { Product } from '../../../src/types.js';

export class OndcClient {
  public mode: 'live' | 'demo';
  public apiUrl: string;
  public apiKey: string;
  public statusLabel: string;

  constructor() {
    this.mode = (process.env.ONDC_MODE as any) === 'live' ? 'live' : 'demo';
    this.apiUrl = process.env.ONDC_API_URL || 'https://sandbox.ondc.org';
    this.apiKey = process.env.ONDC_API_KEY || '';
    this.statusLabel = this.mode === 'live' && this.apiKey ? 'ONDC Connected (Live)' : 'ONDC Demo / Not Connected';
  }

  async broadcastCatalog(products: Product[]): Promise<{
    success: boolean;
    mode: 'live' | 'demo';
    itemsCount: number;
    status: string;
    catalogPayload: any;
  }> {
    const items = products.map(mapProductToOndcItem);
    const payload = {
      context: {
        domain: 'nic2004:52110',
        country: 'IND',
        city: 'std:080',
        action: 'on_search',
        core_version: '1.2.0',
        bap_id: 'buyer-app.ondc.org',
        bpp_id: 'kalatech-artisan.network',
        timestamp: new Date().toISOString(),
      },
      message: {
        catalog: {
          'bpp/fulfillments': [
            { id: 'standard-artisan-shipping', type: 'Delivery' }
          ],
          'bpp/providers': [
            {
              id: 'kalatech-artisans-federation',
              descriptor: { name: 'KALAtech Handcrafted Indigenous Artisans' },
              items,
            }
          ],
        },
      },
    };

    if (this.mode === 'live' && this.apiKey) {
      try {
        const res = await fetch(`${this.apiUrl}/on_search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(payload),
        });
        return {
          success: res.ok,
          mode: 'live',
          itemsCount: items.length,
          status: res.ok ? 'Broadcasted to ONDC Beckn Network' : `ONDC gateway error: ${res.statusText}`,
          catalogPayload: payload,
        };
      } catch (err: any) {
        return {
          success: false,
          mode: 'live',
          itemsCount: items.length,
          status: `ONDC connection failed: ${err.message}`,
          catalogPayload: payload,
        };
      }
    }

    // Demo Mode: Structured response indicating clearly that network is not connected live
    return {
      success: true,
      mode: 'demo',
      itemsCount: items.length,
      status: this.statusLabel,
      catalogPayload: payload,
    };
  }

  async processIncomingWebhook(body: any): Promise<{ success: boolean; action: string; message: string }> {
    const action = body?.context?.action || 'unknown';
    return {
      success: true,
      action,
      message: `ONDC webhook received [${this.statusLabel}] for action "${action}"`,
    };
  }
}

export const ondcClient = new OndcClient();
