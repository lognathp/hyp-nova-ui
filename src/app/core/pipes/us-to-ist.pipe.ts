import { Pipe, PipeTransform } from '@angular/core';
import { toZonedTime, format } from 'date-fns-tz';

@Pipe({
  name: 'usToIst',
  standalone: true
})
export class UsToIstPipe implements PipeTransform {
  // Accepts a date string and a US timezone identifier
  transform(value: string, usTimezone: 'EST' | 'CST' | 'MST' | 'PST' = 'EST', outputFormat: string = 'yyyy-MM-dd HH:mm:ss'): string {
    if (!value) return '';

    // Map US timezone abbreviations to IANA timezone names
    const timezoneMap: { [key: string]: string } = {
      'EST': 'America/New_York',
      'CST': 'America/Chicago',
      'MST': 'America/Denver',
      'PST': 'America/Los_Angeles'
    };

    const usTz = timezoneMap[usTimezone] || timezoneMap['EST'];
    const istTz = 'Asia/Kolkata';

    try {
      // Convert input time (in US timezone) to UTC
      const usDate = toZonedTime(new Date(value), usTz);
      // Convert UTC to IST
      const istDate = toZonedTime(usDate, istTz);
      // Format IST date
      return format(istDate, outputFormat, { timeZone: istTz });
    } catch (e) {
      return '';
    }
  }
}