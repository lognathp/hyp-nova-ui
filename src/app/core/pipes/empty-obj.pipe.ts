import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emptyObj',
  standalone: true
})
export class EmptyObjPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
