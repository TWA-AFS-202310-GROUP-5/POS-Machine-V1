import { loadAllItems, loadPromotions } from './Dependencies'
import { Item, ReceivedItem, Record } from './model'
export function printReceipt(tags: string[]): string {
  //   return `***<store earning no money>Receipt ***
  // Name：Sprite，Quantity：5 bottles，Unit：3.00(yuan)，Subtotal：12.00(yuan)
  // Name：Litchi，Quantity：2.5 pounds，Unit：15.00(yuan)，Subtotal：37.50(yuan)
  // Name：Instant Noodles，Quantity：3 bags，Unit：4.50(yuan)，Subtotal：9.00(yuan)
  // ----------------------
  // Total：58.50(yuan)
  // Discounted prices：7.50(yuan)
  // **********************`
  const receivedItemList: ReceivedItem[] = tags.map(
    (t) => parseBarcode(t)
  )

  for (const receivedItem of receivedItemList) {

    if (!isExistItem(receivedItem.barcode)) {
      return 'Error, do not exist barcode:' + receivedItem.barcode
    }
  }

  const recordList = addReceivedItemToRecordList(receivedItemList)
  return renderReceipt(recordList)
}

function parseBarcode(tag: string): ReceivedItem {
  if (tag.indexOf('-') !== -1) {
    return {
      barcode: tag.split('-')[0],
      quantity: Number(tag.split('-')[1]) ,
    } as ReceivedItem
  } else {
    return { barcode: tag, quantity: 1 } as ReceivedItem
  }
}


function addReceivedItemToRecordList(receivedItemList: ReceivedItem[]): Record[]{
  const recordList: Record[] = loadAllItems().map(
    item => { return {
      ...item,
      quantity: 0,
      subtotal:  0,
      subDiscount: 0,
    } as Record
    }
  )
  receivedItemList.map(
    (receivedItem) => {
      const index = recordList.findIndex(x => x.barcode === receivedItem.barcode)
      if(index !== -1){
        recordList[index].quantity += receivedItem.quantity
        recordList[index].subtotal = calculateSubtotal(recordList[index].barcode, recordList[index].quantity, recordList[index].price)
        recordList[index].subDiscount = calculateSubDiscount(recordList[index].quantity, recordList[index].price, recordList[index].subtotal)
      }
    }
  )
  return recordList.filter(x => x.quantity !== 0 )
}

function calculateSubtotal(barcode: string, quantity: number, price: number): number {
  const promotions = loadPromotions()
  let tempSubtotal = price * quantity
  for(const promotion of promotions){
    switch (promotion.type){
    case 'BUY_TWO_GET_ONE_FREE':
      if (promotion.barcodes.findIndex(x => x ===barcode) !== -1){
        tempSubtotal = price * (quantity - Math.floor( quantity/3 ))
      }

    }
  }
  return tempSubtotal
}

function renderReceipt(recordList: Record[]): string {
  // console.log(recordList);
  let output = '***<store earning no money>Receipt ***\n'
  for( const record of recordList){
    output += `Name：${record.name}，Quantity：${record.quantity} ${record.unit}s，Unit：${record.price.toFixed(2)}(yuan)，Subtotal：${record.subtotal.toFixed(2)}(yuan)\n`
  }
  output +=`----------------------
Total：${calculateTotal(recordList).toFixed(2)}(yuan)
Discounted prices：${calculateDiscount(recordList).toFixed(2)}(yuan)
**********************`
  return output
}







function calculateTotal(recordList: Record[]): number{
  let addResult = 0
  recordList.map(
    r => addResult += r.subtotal
  )
  return addResult
}

function calculateDiscount(recordList: Record[]): number{
  let addResult = 0
  recordList.map(
    r => addResult += r.subDiscount
  )
  return addResult
}

function calculateSubDiscount(quantity: number, price: number, subtotal: number): number {
  return quantity * price - subtotal
}

function isExistItem(barcode: string) {
  return Boolean(loadAllItems().find((x) => x.barcode === barcode))
}

// let input = [
//   "ITEM000001",
//   "ITEM000001",
//   "ITEM000001",
//   "ITEM000001",
//   "ITEM000001",
//   "ITEM000003-2",
//   "ITEM000005",
//   "ITEM000005",
//   "ITEM000005",
// ];
// let output = printReceipt(input);
// console.log(output);
