import { Bill } from '../types';

/**
 * Billing Service — Centralized calculation logic for handicraft bills.
 * All financial calculations are done here to ensure consistency.
 */

export interface BillCalculationInput {
  materialCost: number;
  labourCost: number;
  transportationCost: number;
  otherCost: number;
  finalPrice: number;
  quantity: number;
}

export interface BillCalculationResult {
  totalCost: number;
  totalSellingPrice: number;
  profit: number;
  profitPercentage: number;
}

/**
 * Calculate bill financials with division-by-zero safety and INR rounding.
 */
export function calculateBill(input: BillCalculationInput): BillCalculationResult {
  const totalCost = Math.round(
    (Number(input.materialCost) || 0) +
    (Number(input.labourCost) || 0) +
    (Number(input.transportationCost) || 0) +
    (Number(input.otherCost) || 0)
  );

  const qty = Math.max(1, Number(input.quantity) || 1);
  const unitPrice = Math.round(Number(input.finalPrice) || 0);
  const totalSellingPrice = unitPrice * qty;
  const totalCostForQty = totalCost * qty;
  const profit = totalSellingPrice - totalCostForQty;

  // Division-by-zero safe profit percentage
  const profitPercentage = totalCostForQty > 0
    ? Math.round((profit / totalCostForQty) * 100 * 100) / 100
    : 0;

  return {
    totalCost: totalCostForQty,
    totalSellingPrice,
    profit,
    profitPercentage,
  };
}

let billCounter = 1000;

/**
 * Generate a unique bill number in format: KT-INV-YYYYMMDD-XXXX
 */
export function generateBillNumber(): string {
  billCounter++;
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  return `KT-INV-${dateStr}-${String(billCounter).padStart(4, '0')}`;
}

/**
 * Validate bill data before finalization.
 */
export function validateBill(bill: Partial<Bill>): string[] {
  const errors: string[] = [];
  if (!bill.productName) errors.push('Product name is required');
  if (!bill.quantity || bill.quantity <= 0) errors.push('Quantity must be greater than 0');
  if (bill.materialCost !== undefined && bill.materialCost < 0) errors.push('Material cost cannot be negative');
  if (bill.labourCost !== undefined && bill.labourCost < 0) errors.push('Labour cost cannot be negative');
  if (bill.transportationCost !== undefined && bill.transportationCost < 0) errors.push('Transportation cost cannot be negative');
  if (bill.otherCost !== undefined && bill.otherCost < 0) errors.push('Other cost cannot be negative');
  if (!bill.finalPrice || bill.finalPrice <= 0) errors.push('Final selling price must be greater than 0');
  return errors;
}

/**
 * Format INR currency value.
 */
export function formatINR(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}
