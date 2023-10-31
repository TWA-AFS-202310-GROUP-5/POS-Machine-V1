import {loadAllItems, loadPromotions} from './Dependencies'

export function printReceipt(tags: string[]): string {
  const machine = new PosMachine()

  const receipt = machine.printReceipt([      'ITEM000001',
    'ITEM000001',
    'ITEM000001',
    'ITEM000001',
    'ITEM000001',
    'ITEM000003-2.5',
    'ITEM000005',
    'ITEM000005-2',])
  return receipt
//   return `***<store earning no money>Receipt ***
// Name：Sprite，Quantity：5 bottles，Unit：3.00(yuan)，Subtotal：12.00(yuan)
// Name：Litchi，Quantity：2.5 pounds，Unit：15.00(yuan)，Subtotal：37.50(yuan)
// Name：Instant Noodles，Quantity：3 bags，Unit：4.50(yuan)，Subtotal：9.00(yuan)
// ----------------------
// Total：58.50(yuan)
// Discounted prices：7.50(yuan)
// **********************`
}



export interface ReceiptItem {
  name:string
  quantity:number
  quantifier:string
  unitPrice:number
  subtotal:number
}



export class PosMachine{

  discoubtedPrices = 0
  total = 0
  receiptItems:ReceiptItem[] = []
  barcodeQuantityMap:Map<string, any> = new Map()

  public printReceipt(tags: string[]): string {

    this.clarifyBarcodes(tags)
    const isValid = this.checkFormat()
    if (!isValid) {
      return ''
    }
    this.generateReceiptItems()


    return this.render()
  }

  private render(): string{
    const title = '***<store earning no money>Receipt ***\n'
    const contends:string[] = []
    for (const item of this.receiptItems) {
      contends.push(`Name：${item.name}，Quantity：${item.quantity} ${item.quantifier}，Unit：${item.unitPrice.toFixed(2)}(yuan)，Subtotal：${item.subtotal.toFixed(2)}(yuan)`)
    }
    const footer = `\n----------------------
Total：${this.total.toFixed(2)}(yuan)
Discounted prices：${this.discoubtedPrices.toFixed(2)}(yuan)
**********************`
    const receipt:string = title + contends.join('\n') + footer


    return receipt
  }

  private clarifyBarcodes(tags:string[]):void {
    for (const tag of tags) {
      const barcode = tag.split('-')
      if(barcode.length !== 2) {
        if(this.barcodeQuantityMap.has(tag)) {
          this.barcodeQuantityMap.set(tag,  this.barcodeQuantityMap.get(tag)+ 1)
        } else {
          this.barcodeQuantityMap.set(tag,  1)
        }
      } else {
        if (this.barcodeQuantityMap.has(barcode[0])) {
          this.barcodeQuantityMap.set(barcode[0],  this.barcodeQuantityMap.get(barcode[0])+ Number.parseFloat(barcode[1]))
        } else {
          this.barcodeQuantityMap.set(barcode[0], Number.parseFloat(barcode[1]))
        }

      }
    }

  }

  private checkFormat(): boolean {
    const barcodes:String[] = []
    const allItems = loadAllItems()
    for (const item of allItems) {
      barcodes.push(item.barcode)
    }
    this.barcodeQuantityMap.forEach((value, barcode) =>{
      if(!barcode.includes(barcode)){
        return false
      }
    })
    return true
  }


  private generateReceiptItems() {
    const promotios = loadPromotions()
    const allItems = loadAllItems()
    this.barcodeQuantityMap.forEach((value, barcode) =>{
      const item = allItems.filter(ele => ele.barcode === barcode)
      const price = item[0].price
      const num = this.barcodeQuantityMap.get(barcode)
      let subtotal:any
      for (const promotio of promotios) {
        if (promotio.barcodes.includes(barcode)) {
          if (promotio.type === 'BUY_TWO_GET_ONE_FREE') {

            subtotal = this.calculatePriceWithDiscount(num, price)
            this.total += subtotal
            this.discoubtedPrices += num * price - subtotal
          }
        }else {
          subtotal = num * price
          this.total += subtotal
        }
      }
      const receiptItem:ReceiptItem = {
        name:item[0].name,
        quantity:num,
        quantifier:item[0].unit + 's' ,
        subtotal:subtotal,
        unitPrice:item[0].price
      }
      this.receiptItems.push(receiptItem)

    })




  }

  private calculatePriceWithDiscount(totalItems: number, itemPrice: number): any {
    const freeItems = Math.floor(totalItems / 3)
    const regularItems = totalItems - freeItems
    const totalPrice = regularItems * itemPrice
    return totalPrice
  }

}


