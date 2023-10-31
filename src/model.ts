export interface Item{
    barcode: string,
    name: string,
    unit: string,
    price: number
}
export interface ReceivedItem{
    barcode: string,
    quantity: number,


}


export interface Record extends Item{
    quantity: number,
    subtotal: number,
    subDiscount: number
}
