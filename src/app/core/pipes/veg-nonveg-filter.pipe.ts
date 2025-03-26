import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'vegNonvegFilter',
  standalone: true
})
export class VegNonvegFilterPipe implements PipeTransform {

  transform(categories: any[], selectedAttributeId: string): any[] {
    if (!categories || !selectedAttributeId) {
      return categories; // Return all if no attribute is selected
    }

    return categories
      .map(category => ({
        ...category,
        items: category.items.filter((item:any) =>
          item.itemAttributeId === selectedAttributeId
        )
      }))
      .filter(category => category.items.length > 0); // Remove empty categories
  }

}
