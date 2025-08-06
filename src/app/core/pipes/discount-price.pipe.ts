import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'discountPrice',
  standalone: true
})
export class DiscountPricePipe implements PipeTransform {
  itemdiscountValue: number = environment.itemdiscountValue; 
  
  transform(value: any, percentage: any): string {
    const price = parseFloat(value) || 0;
    const discountPercentage = parseFloat(percentage) || 0;
    
    // Calculate the discounted price with proper rounding
    const discountedPrice = Math.round((price - ((discountPercentage / 100) * price) - this.itemdiscountValue) * 100) / 100;
    
    // Format to exactly 2 decimal places
    return discountedPrice.toFixed(2);
  }

}
