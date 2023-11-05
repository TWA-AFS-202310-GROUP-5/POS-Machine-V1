import { Quantity } from './Quantity'

export interface ReceiptItem {
    name: string;
    quantity: Quantity;
    unit: string;
    unitPrice: number;
    subtotal: number;
    discountedPrice: number;
}
