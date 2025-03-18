import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'discountPrice',
  standalone: true
})
export class DiscountPricePipe implements PipeTransform {

  transform(value: any, percentage:any): any {
    
    const discountedPrice:number = parseFloat(value) - ((percentage / 100)*parseFloat(value));
    if (discountedPrice.toFixed(2).endsWith(".00")) {
      return discountedPrice.toString();
    }
    return discountedPrice.toFixed(2);
  }

}
