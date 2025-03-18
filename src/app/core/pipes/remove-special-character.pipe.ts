import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeSpecialCharacter',
  standalone: true
})
export class RemoveSpecialCharacterPipe implements PipeTransform {

  transform(value: string): string {
    return value.replace(/[^a-zA-Z0-9\-,. ]/g, "");
  }

}
