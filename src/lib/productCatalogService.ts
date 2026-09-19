import { Product, LanguageCode } from '../types';

export interface CanonicalProductInput {
  name: string;
  type: string;
  color: string;
  address: string;
  quantity: number;
  description: string;
  price: number;
  artisanId: string;
  images: string[];
  status?: 'draft' | 'published';
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class ProductCatalogService {
  /**
   * Validate that all core fields are present, truthful, and non-empty.
   */
  static validateProductInput(input: Partial<CanonicalProductInput>): ValidationResult {
    const errors: string[] = [];

    if (!input.name || input.name.trim().length === 0) {
      errors.push('Handicraft name is required');
    }

    if (!input.type || input.type.trim().length === 0) {
      errors.push('Handicraft type/category is required');
    }

    if (!input.color || input.color.trim().length === 0) {
      errors.push('Color is required');
    }

    if (!input.address || input.address.trim().length === 0) {
      errors.push('Artisan craft address/location is required');
    }

    if (input.quantity === undefined || input.quantity === null || isNaN(input.quantity) || input.quantity <= 0) {
      errors.push('Quantity must be a positive integer entered by artisan');
    }

    if (!input.description || input.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (input.price !== undefined && (isNaN(input.price) || input.price < 0)) {
      errors.push('Price cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Deterministic truthful description generator from confirmed artisan details.
   * Does NOT hallucinate awards, GI claims, or unsupported centuries of heritage.
   */
  static generateTruthfulDescription(
    data: {
      name: string;
      type: string;
      color: string;
      address: string;
      quantity?: number;
      material?: string;
    },
    language: LanguageCode = 'en'
  ): string {
    const { name, type, color, address, quantity, material } = data;

    if (language === 'te') {
      return `${address} లో సాంప్రదాయ పద్ధతిలో తయారుచేయబడిన ప్రామాణికమైన ${name} (${type}). ఆకర్షణీయమైన ${color} రంగుల్లో లభ్యమవుతుంది. మొత్తం ${quantity || 1} వస్తువులు అందుబాటులో ఉన్నాయి.`;
    }

    if (language === 'hi') {
      return `${address} के कुशल कारीगरों द्वारा हस्तनिर्मित प्रामाणिक ${name} (${type})। यह पारंपरिक ${color} रंगों में उपलब्ध है। कुल ${quantity || 1} नग उपलब्ध हैं।`;
    }

    const matText = material ? ` using genuine ${material}` : '';
    const qtyText = quantity ? ` with ${quantity} piece${quantity > 1 ? 's' : ''} available` : '';
    return `Authentic ${name} (${type}) handcrafted by artisans in ${address}${matText}. Richly detailed in natural ${color} tones${qtyText}.`;
  }
}
