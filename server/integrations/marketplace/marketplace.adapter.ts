import { Product } from '../../../src/types.js';

export interface AdapterSyncResult {
  success: boolean;
  platform: 'private_marketplace' | 'b2b' | 'whatsapp' | 'ondc';
  externalId?: string;
  status: 'active' | 'inactive' | 'pending' | 'draft';
  message: string;
}

export interface MarketplaceAdapter {
  platform: 'private_marketplace' | 'b2b' | 'whatsapp' | 'ondc';
  publishProduct(product: Product): Promise<AdapterSyncResult>;
  updateProduct(product: Product): Promise<AdapterSyncResult>;
  unpublishProduct(productId: string): Promise<AdapterSyncResult>;
  getProductStatus(productId: string): Promise<AdapterSyncResult>;
  syncInventory(productId: string, newQuantity: number): Promise<AdapterSyncResult>;
  receiveOrder(payload: any): Promise<{ success: boolean; orderId?: string; error?: string }>;
  updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; message: string }>;
}
