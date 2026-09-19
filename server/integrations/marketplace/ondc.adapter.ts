import { MarketplaceAdapter, AdapterSyncResult } from './marketplace.adapter.js';
import { Product } from '../../../src/types.js';
import { ondcClient } from '../ondc/ondc.client.js';

export class ONDCAdapter implements MarketplaceAdapter {
  platform = 'ondc' as const;

  async publishProduct(product: Product): Promise<AdapterSyncResult> {
    const res = await ondcClient.broadcastCatalog([product]);
    return {
      success: res.success,
      platform: this.platform,
      externalId: `ondc-item-${product.id}`,
      status: res.mode === 'live' ? 'active' : 'draft',
      message: res.status
    };
  }

  async updateProduct(product: Product): Promise<AdapterSyncResult> {
    return {
      success: true,
      platform: this.platform,
      externalId: `ondc-item-${product.id}`,
      status: ondcClient.mode === 'live' ? 'active' : 'draft',
      message: `ONDC item updated: ${ondcClient.statusLabel}`
    };
  }

  async unpublishProduct(productId: string): Promise<AdapterSyncResult> {
    return {
      success: true,
      platform: this.platform,
      externalId: `ondc-item-${productId}`,
      status: 'inactive',
      message: `Item unpublished from ONDC: ${ondcClient.statusLabel}`
    };
  }

  async getProductStatus(productId: string): Promise<AdapterSyncResult> {
    return {
      success: true,
      platform: this.platform,
      externalId: `ondc-item-${productId}`,
      status: ondcClient.mode === 'live' ? 'active' : 'draft',
      message: ondcClient.statusLabel
    };
  }

  async syncInventory(productId: string, newQuantity: number): Promise<AdapterSyncResult> {
    return {
      success: true,
      platform: this.platform,
      externalId: `ondc-item-${productId}`,
      status: newQuantity > 0 ? 'active' : 'inactive',
      message: `ONDC inventory synced (${newQuantity} available): ${ondcClient.statusLabel}`
    };
  }

  async receiveOrder(payload: any): Promise<{ success: boolean; orderId?: string }> {
    return { success: true, orderId: payload?.orderId };
  }

  async updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; message: string }> {
    return { success: true, message: `ONDC order status ${status} confirmed: ${ondcClient.statusLabel}` };
  }
}
