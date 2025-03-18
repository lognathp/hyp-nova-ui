import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeformat',
  standalone: true
})
export class TimeformatPipe implements PipeTransform {

  transform(time: string): string {
    if (!time) return '';

    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert 0 to 12

    return `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;
  }

}
