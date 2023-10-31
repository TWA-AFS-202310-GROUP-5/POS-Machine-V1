import {loadAllItems, loadPromotions} from './Dependencies'

const allItems = loadAllItems()
const allDiscounts = loadPromotions()

export interface Tag{
  barcode:string;
  quantity: number;
}

export interface ItemProperty{
  name:string;
  quantity: number;
  unit:string;
  unitPrice: number;
  subtotal: number;
  discounted: number;
}

export function printReceipt(tags: string[]): string {
  const itemQuantityMap = generateItemQuantityMap(tags)
  const itemProperties = generateItemProperties(itemQuantityMap)
  const receipt = render(itemProperties)
  console.log(receipt)

  return receipt
}

function generateItemQuantityMap(items: string[]): Map<string, number> {
  const processedItems = new Map<string, number>()
  for(const item of items){
    const tag = generateTag(item)
    const currentQuantity = processedItems.get(tag.barcode) ?? 0
    processedItems.set(tag.barcode, currentQuantity + tag.quantity)
  }
  return processedItems
}

function generateTag(item: string) : Tag {
  const seperatorIndex = item.indexOf('-')
  const barcode = seperatorIndex > 0 ? item.substring(0, seperatorIndex) : item
  const quantityStr = seperatorIndex > 0 ? item.substring(seperatorIndex+1) : '1'
  if (!isValidBarcode(barcode)) {
    console.log(`Invalid Barcode: ${barcode}.`)
    throw new Error(`Invalid Barcode: ${barcode}.`)
  }

  if (!isValidQuantity(quantityStr)) {
    console.log(`Invalid Quantity: ${quantityStr} for Barcode: ${barcode}.`)
    throw new Error(`Invalid Quantity: ${quantityStr} for Barcode: ${barcode}.`)
  }
  const tag = {
    barcode: barcode,
    quantity: Number(quantityStr)
  }
  return tag
}

function isValidQuantity(quantity: string) : boolean{
  const quantityNum = parseInt(quantity)
  if(!isNaN(quantityNum)){
    if(quantityNum > 0){
      return true
    }
  }
  return false
}

function isValidBarcode(barcode: string) : boolean{
  for(const item of allItems){
    if(barcode === item.barcode){
      return true
    }
  }
  return false
}

function generateItemProperties(itemQuantityMap:Map<string, number>){
  const itemProperties : ItemProperty[] = []
  for (const [barcode, quantity] of itemQuantityMap) {
    itemProperties.push(generateSingleItemProperty(barcode, quantity))
  }
  return itemProperties
}

function getItemDetail(barcode: string){
  for(const item of allItems){
    if(barcode === item.barcode){
      return item
    }
  }
  return null
}

function generateSingleItemProperty(barcode: string, quantity: number):ItemProperty{
  const itemDetail = getItemDetail(barcode)
  if(itemDetail === null){
    throw new Error()//not possible
  }
  const itemProperty = {
    name: itemDetail.name,
    quantity: quantity,
    unit: itemDetail.unit,
    unitPrice: itemDetail.price,
    subtotal: quantity * itemDetail.price,
    discounted: getDiscount(barcode, quantity, itemDetail.price)
  }
  return itemProperty
}

function getDiscount(barcode:string, quantity: number, unitPrice: number){
  for(const discount of allDiscounts){
    for(const discountBarcode of discount.barcodes){
      if(discountBarcode === barcode){
        if(discount.type === 'BUY_TWO_GET_ONE_FREE'){
          return Math.floor(quantity/3) * unitPrice
        }
      }
    }
  }
  return 0
}

function render(itemProperties:ItemProperty[]) : string{
  let receipt = '***<store earning no money>Receipt ***\n'
  const totalDiscount = getTotalDiscount(itemProperties)
  const totalPrice = getTotalPrice(itemProperties) - totalDiscount

  receipt += itemProperties.map(itemProperty => getReceiptLine(itemProperty)).join('\n')
  receipt += '\n----------------------\n'
  receipt += `Total: ${totalPrice.toFixed(2)}(yuan)\nDiscounted prices: ${totalDiscount.toFixed(2)}(yuan)\n**********************`
  return receipt
}

function getReceiptLine(itemProperty: ItemProperty): string {
  return `Name: ${itemProperty.name}, Quantity: ${itemProperty.quantity} ${itemProperty.unit}s, Unit: ${itemProperty.unitPrice.toFixed(2)}(yuan), Subtotal: ${(itemProperty.subtotal - itemProperty.discounted).toFixed(2)}(yuan)`
}

function getTotalPrice(itemProperties:ItemProperty[]){
  let totalPrice = 0
  for(const itemProperty of itemProperties){
    totalPrice += itemProperty.subtotal
  }
  return totalPrice
}

function getTotalDiscount(itemProperties:ItemProperty[]){
  let totalDiscount = 0
  for(const itemProperty of itemProperties){
    totalDiscount += itemProperty.discounted
  }
  return totalDiscount
}

printReceipt([
  'ITEM000001',
  'ITEM000001',
  'ITEM000001',
  'ITEM000001',
  'ITEM000001',
  'ITEM000003-2.5',
  'ITEM000005',
  'ITEM000005-2',
])
