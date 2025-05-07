import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'discountPrice',
  standalone: true
})
export class DiscountPricePipe implements PipeTransform {
  itemdiscountValue:number = environment.itemdiscountValue; 
  transform(value: any, percentage:any): any {
    
    const discountedPrice:number = (parseFloat(value) - ((percentage / 100)*parseFloat(value))) -  this.itemdiscountValue;
    if (discountedPrice.toFixed(2).endsWith(".00")) {
      return discountedPrice.toString();
    }
    return discountedPrice.toFixed(2);
  }

}
