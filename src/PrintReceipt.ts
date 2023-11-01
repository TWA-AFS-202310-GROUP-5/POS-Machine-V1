import {loadAllItems, loadPromotions} from './Dependencies'

interface Quantity{
  value: number;
  quantifier: string
}

interface ReceiptItem{
  name: string;
  quantity: Quantity;
  unitPrice: number;
  subtotal: number;
  discountedPrice: number
}

interface Tag{
  barcode: string;
  quantity: number;
}

interface Items{
  barcode: string,
  name: string,
  unit: string,
  price: number
}


export function printReceipt(tags: string[]): string|null {

  const parsedTags = parseTags(tags)

  const receiptItems = generateReceiptItems(parsedTags)  // ifInValid, return null

  if (receiptItems === null){
    return null
  }

  const receipt = renderReceipt(receiptItems)

  return receipt

}


function parseTags(tags: string[]): Tag[]{
  const resMap = new Map<string, number>()

  for(const e of tags){
    const eNumber = parseQuantity(e)
    const key = e.split('-')[0]

    if (!isNaN(eNumber)){
      if (resMap.has(key)){
        resMap.set(key, resMap.get(key)!+ eNumber)
      }
      else{
        resMap.set(key, eNumber)
      }
    }
  }

  const res: Tag[] = []
  for (const [key, value] of resMap){
    res.push({barcode: key, quantity: value})
  }

  return res
}


function parseQuantity(tag: string): number{
  const index = tag.indexOf('-')
  if (index === -1){
    return 1
  }
  else{
    const numberPart = tag.substring(index + 1)
    return parseFloat(numberPart)
  }
}


function generateReceiptItems(tags: Tag[]): ReceiptItem[]|null{
  const items = loadAllItems()
  const promotions = loadPromotions()

  const res: ReceiptItem[] = []

  // ifValid
  if(!ifValid(items, tags)){
    return null
  }

  for(const tag of tags){
    for (const promotion of promotions){

      let price = 0
      let name = ''
      let quantity: Quantity = {
        value: 0,
        quantifier: ''
      }

      const tagBarcode = tag.barcode
      for (const obj of items){
        if(obj.barcode===tagBarcode){
          name = obj.name
          price = obj.price
          quantity = {
            value: tag.quantity,
            quantifier: obj.unit
          }
          break
        }
      }

      const discountedSubtotal = calculateDiscountedSubtotal(tag.quantity, price, promotion.type)
      const discountedPrice = tag.quantity * price - discountedSubtotal

      res.push({name: name, quantity: quantity, unitPrice: price , subtotal: discountedSubtotal, discountedPrice: discountedPrice})
    }
  }
  return res
}

function ifValid(items: Items[], tags: Tag[]): boolean{

  return tags.every(item => items.some(obj => obj.barcode === item.barcode))
}



// for promotionType = 'BUY_TWO_GET_ONE_FREE'
function calculateDiscountedSubtotal(quantity: number, price: number, promotionType: string|undefined): number{
  //if (promotionType === 'BUY_TWO_GET_ONE_FREE')
  const fullPriceItems = Math.floor(quantity / 3)*2
  const discountedPrice = fullPriceItems * price + (quantity%3)*price
  return discountedPrice

}



function renderReceipt(receiptItems: ReceiptItem[]): string{
  const total = receiptItems.map(item => item.subtotal).reduce((acc, current)=> acc+current, 0)
  const discountedPrice = receiptItems.map(item => item.discountedPrice).reduce((acc, current)=> acc+current, 0)

  return '***<store earning no money>Receipt ***\n' + receiptItems.map(item=>
    `Name：${item.name}, Quantity: ${item.quantity.value} ${item.quantity.quantifier}s, Unit: ${item.unitPrice}(yuan), Subtotal: ${item.subtotal}(yuan)`).join('\n')+
    `\n----------------------\nTotal：${total}(yuan)\nDiscounted prices：${discountedPrice}(yuan)\n**********************`
}







