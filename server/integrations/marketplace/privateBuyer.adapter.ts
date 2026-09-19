import { MarketplaceAdapter, AdapterSyncResult } from './marketplace.adapter.js';
import { Product } from '../../../src/types.js';
import { db } from '../../db.js';

export class PrivateBuyerAdapter implements MarketplaceAdapter {
  platform = 'private_marketplace' as const;

  async publishProduct(product: Product): Promise<AdapterSyncResult> {
    product.status = 'published';
    product.published_at = new Date().toISOString();
    return {
      success: true,
      platform: this.platform,
      externalId: product.id,
      status: 'active',
      message: 'Product listed on KALAtech Private Buyer Marketplace'
    };
  }

  async updateProduct(product: Product): Promise<AdapterSyncResult> {
    return {
      success: true,
      platform: this.platform,
      externalId: product.id,
      status: 'active',
      message: 'Product updated on Private Buyer Marketplace'
    };
  }

  async unpublishProduct(productId: string): Promise<AdapterSyncResult> {
    const prod = db.getProductById(productId);
    if (prod) {
      prod.status = 'disabled';
    }
    return {
      success: true,
      platform: this.platform,
      externalId: productId,
      status: 'inactive',
      message: 'Product unpublished from Private Buyer Marketplace'
    };
  }

  async getProductStatus(productId: string): Promise<AdapterSyncResult> {
    const prod = db.getProductById(productId);
    return {
      success: !!prod,
      platform: this.platform,
      externalId: productId,
      status: prod?.status === 'published' ? 'active' : 'inactive',
      message: `Status is ${prod?.status || 'unknown'}`
    };
  }

  async syncInventory(productId: string, newQuantity: number): Promise<AdapterSyncResult> {
    const prod = db.getProductById(productId);
    if (prod) {
      prod.quantity = newQuantity;
      if (newQuantity <= 0) {
        prod.status = 'sold_out';
      }
    }
    return {
      success: true,
      platform: this.platform,
      externalId: productId,
      status: newQuantity > 0 ? 'active' : 'inactive',
      message: `Inventory synchronized: ${newQuantity} available`
    };
  }

  async receiveOrder(payload: any): Promise<{ success: boolean; orderId?: string }> {
    return { success: true, orderId: payload?.orderId };
  }

  async updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; message: string }> {
    return { success: true, message: `Order ${orderId} updated to ${status}` };
  }
}
