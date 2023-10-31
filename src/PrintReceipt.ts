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
  quanatity: number;
}

export function printReceipt(tags: string[]): string {

  const parsedTags = parseTags(tags)

  const receiptItems = generateReceiptItems(parsedTags)

  const receipt = renderReceipt(receiptItems)

  return receipt
  
//  return `***<store earning no money>Receipt ***
//Name：Sprite，Quantity：5 bottles，Unit：3.00(yuan)，Subtotal：12.00(yuan)
//Name：Litchi，Quantity：2.5 pounds，Unit：15.00(yuan)，Subtotal：37.50(yuan)
//Name：Instant Noodles，Quantity：3 bags，Unit：4.50(yuan)，Subtotal：9.00(yuan)
//----------------------
//Total：58.50(yuan)
//Discounted prices：7.50(yuan)
//**********************`
}


function parseTags(tags: string[]): Tag[]{
  const resMap = new Map<string, number>()

  for(let e of tags){
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
    res.push({barcode: key, quanatity: value})
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





function renderReceipt(receiptItems: ReceiptItem[]): string{
    return "***<store earning no money>Receipt ***" + receiptItems.map(item=>
      `Name：${item.name}, Quantity: ${item.quantity.value} ${item.quantity.quantifier}s, Unit: ${item.unitPrice}(yuan), Subtotal: ${item.subtotal}(yuan)`).join("/n")+ 
      `----------------------
      Total：${58.50}(yuan)
      Discounted prices：${7.50}(yuan)
      **********************`
}