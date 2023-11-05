import {loadAllItems, loadPromotions} from './Dependencies'
import { Quantity } from './interfaces/Quantity'
import { ReceiptItem } from './interfaces/ReceiptItem'
import { Tag } from './interfaces/Tag'

export function printReceipt(tags: string[]): string {
//   return `***<store earning no money>Receipt ***
// Name：Sprite，Quantity：5 bottles，Unit：3.00(yuan)，Subtotal：12.00(yuan)
// Name：Litchi，Quantity：2.5 pounds，Unit：15.00(yuan)，Subtotal：37.50(yuan)
// Name：Instant Noodles，Quantity：3 bags，Unit：4.50(yuan)，Subtotal：9.00(yuan)
// ----------------------
// Total：58.50(yuan)
// Discounted prices：7.50(yuan)
// **********************`
  const parsedTags = parseTags(tags)
  const receiptItems = generateReceiptItems(parsedTags)
  const receipt = renderReceipt(receiptItems)
  return receipt
}

function renderReceipt(receiptItems: ReceiptItem[]): string {
  let total = 0
  receiptItems.map(item => { return total += item.subtotal} )
  let discountedPrice = 0
  receiptItems.map(item => { discountedPrice += item.discountedPrice})
  const str = '***<store earning no money>Receipt ***\n'.concat(
    receiptItems.map(item => {return `  Name：${item.name}，Quantity：${item.quantity.value} ${item.unit}s，Unit：${item.unitPrice.toFixed(2)}(yuan)，Subtotal：${item.subtotal.toFixed(2)}(yuan)`})
      .join('\n')
  ).concat('\n  ----------------------\n').concat(`  Total：${total.toFixed(2)}(yuan)\n`).concat(`  Discounted prices：${discountedPrice.toFixed(2)}(yuan)\n`).concat(`  **********************`)
  return str

}

function generateReceiptItems(tags: Tag[]): ReceiptItem[] {
  const allItems = loadAllItems()
  const promotions = loadPromotions()
  const receiptItems: ReceiptItem[] = []
  const promotionBarcode = promotions.find(promote => promote.type ==='BUY_TWO_GET_ONE_FREE')?.barcodes
  for(let i = 0; i < tags.length; i++) {
    const ind = allItems.findIndex(item => tags[i].barcode === item.barcode)
    const name = allItems[ind].name
    const unitPrice = allItems[ind].price
    const unit = allItems[ind].unit
    let discountedPrice = 0
    if(promotionBarcode?.some(barcode => barcode===tags[i].barcode)){
      discountedPrice = calculateDiscountedSubtotal(tags[i].quantity.value, unitPrice)
    }
    const subtotal = unitPrice * tags[i].quantity.value - discountedPrice
    receiptItems.push({
      name: name,
      quantity: tags[i].quantity,
      unit: unit,
      unitPrice: unitPrice,
      subtotal: subtotal,
      discountedPrice: discountedPrice,
    })
  }

  return receiptItems
}

function calculateDiscountedSubtotal(quantity: number, price: number): number{
  return Math.floor(quantity/3) * price
}

function parseTags(tags: string[]) : Tag[]{
  const barcodeMap = new Map<string, number>()
  for(const tag of tags){
    const quantity = parseQuantity(tag)
    const barcode = tag.split('-')[0]
    if (!barcodeMap.has(barcode)){
      barcodeMap.set(barcode, quantity)
    }else{
      barcodeMap.set(barcode, barcodeMap.get(barcode)! + quantity)
    }
  }
  const parsedTags: Tag[] = []
  for(const [key, value] of barcodeMap){
    parsedTags.push({
      barcode: key,
      quantity: {
        value: value,
        quantifier: value.toString()
      }
    })
  }
  return parsedTags
}

function parseQuantity(tag: string) : number {
  const splitArr = tag.split('-')
  if (splitArr.length === 1){
    return 1
  }
  return parseFloat(splitArr[1])
}




const input = [
  'ITEM000001',
  'ITEM000001',
  'ITEM000001',
  'ITEM000001',
  'ITEM000001',
  'ITEM000003-2.5',
  'ITEM000005',
  'ITEM000005-2',
]




const tags = parseTags(input)
console.log(tags)
const receiptItems = generateReceiptItems(tags)
console.log(receiptItems)
const str = renderReceipt(receiptItems)
console.log(str)
