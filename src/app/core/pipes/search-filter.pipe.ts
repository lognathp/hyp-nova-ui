import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilter',
  standalone: true
})
export class SearchFilterPipe implements PipeTransform {

  transform(categories: any[], searchKeyword: string): any[] {
    if (!categories || !searchKeyword) {
      return categories; // Return all items if no searchKeyword
    }

    searchKeyword = searchKeyword.toLowerCase();

    return categories
      .map(category => ({
        ...category,
        items: category.items.filter((item:any) =>
          item.itemName.toLowerCase().includes(searchKeyword)
        )
      }))
      .filter(category => category.items.length > 0); // Remove categories with no matching items
  }

}
