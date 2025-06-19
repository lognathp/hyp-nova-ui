import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayQuantity',
  standalone: true,
  pure: false
})
export class DisplayQuantityPipe implements PipeTransform {

  transform(value: any): number {
    const localstrfoodItem: any = localStorage.getItem("foodBasket");
    let quantity: number = 0;
    const item_id = value.id;
    let foodBasket: any = [];

    if (localstrfoodItem != null) {
      foodBasket = JSON.parse(localstrfoodItem);
      foodBasket.forEach((ele: any) => {

        if (ele.item.id == item_id) {
          quantity = quantity + ele.item.quantity;
        }
      });

    }
    // console.log(quantity);
    
    return quantity;
  }

}
