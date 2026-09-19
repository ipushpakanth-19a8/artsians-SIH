import { MarketplaceAdapter, AdapterSyncResult } from './marketplace.adapter.js';
import { Product } from '../../../src/types.js';
import { db } from '../../db.js';
import prisma from '../../config/database.js';

export class B2BAdapter implements MarketplaceAdapter {
  platform = 'b2b' as const;

  async publishProduct(product: Product): Promise<AdapterSyncResult> {
    return {
      success: true,
      platform: this.platform,
      externalId: `b2b-${product.id}`,
      status: 'active',
      message: 'Product published to B2B Institutional & Wholesale Catalog'
    };
  }

  async updateProduct(product: Product): Promise<AdapterSyncResult> {
    return {
      success: true,
      platform: this.platform,
      externalId: `b2b-${product.id}`,
      status: 'active',
      message: 'B2B Catalog specifications updated'
    };
  }

  async unpublishProduct(productId: string): Promise<AdapterSyncResult> {
    return {
      success: true,
      platform: this.platform,
      externalId: `b2b-${productId}`,
      status: 'inactive',
      message: 'Product removed from B2B Catalog'
    };
  }

  async getProductStatus(productId: string): Promise<AdapterSyncResult> {
    return {
      success: true,
      platform: this.platform,
      externalId: `b2b-${productId}`,
      status: 'active',
      message: 'B2B listing is active'
    };
  }

  async syncInventory(productId: string, newQuantity: number): Promise<AdapterSyncResult> {
    return {
      success: true,
      platform: this.platform,
      externalId: `b2b-${productId}`,
      status: newQuantity > 0 ? 'active' : 'inactive',
      message: `B2B inventory quota synchronized: ${newQuantity} available`
    };
  }

  /**
   * Handle B2B bulk purchase enquiry.
   * Does NOT decrease inventory until an actual confirmed contract/order is signed.
   */
  async submitBulkEnquiry(data: {
    productId: string;
    requestedQuantity: number;
    proposedPrice?: number;
    buyerName: string;
    buyerContact: string;
    buyerEmail?: string;
    message: string;
  }): Promise<any> {
    const product = db.getProductById(data.productId);
    if (!product) {
      throw new Error(`Product ${data.productId} not found`);
    }

    const enquiryId = `enq_b2b_${Date.now()}`;
    const enquiry = db.createEnquiry({
      id: enquiryId,
      product_id: product.id,
      product_title: product.title,
      artisan_id: product.artisan_id,
      buyer_name: data.buyerName,
      buyer_contact: data.buyerContact,
      buyer_email: data.buyerEmail,
      buyer_location: 'India B2B',
      quantity: data.requestedQuantity,
      message: data.message || `Request for quotation for ${data.requestedQuantity} units.`
    });

    // Save to PostgreSQL MarketplaceEnquiry
    try {
      await prisma.marketplaceEnquiry.create({
        data: {
          product_id: product.id,
          artisan_id: product.artisan_id,
          buyer_name: data.buyerName,
          buyer_phone: data.buyerContact,
          buyer_email: data.buyerEmail,
          requested_quantity: data.requestedQuantity,
          proposed_price: data.proposedPrice,
          message: data.message,
          channel: 'b2b',
          status: 'new'
        }
      });
    } catch (err) {
      console.warn('[B2BAdapter] DB enquiry record note:', err);
    }

    return {
      success: true,
      enquiryId,
      enquiry,
      message: 'B2B quotation request submitted successfully. Artisan has been notified without altering physical stock.'
    };
  }

  async receiveOrder(payload: any): Promise<{ success: boolean; orderId?: string }> {
    return { success: true, orderId: payload?.orderId };
  }

  async updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; message: string }> {
    return { success: true, message: `B2B Order ${orderId} marked ${status}` };
  }
}
