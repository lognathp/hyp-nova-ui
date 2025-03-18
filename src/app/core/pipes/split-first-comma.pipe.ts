import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'splitFirstComma',
  standalone: true
})
export class SplitFirstCommaPipe implements PipeTransform {

  transform(value: string): string[] {
    if (!value) {
      return ['', ''];
    }
    const parts = value.split(',', 2);
    return [parts[0], parts.length > 1 ? parts[1] : ''];
  }

}
