import { Injectable } from '@angular/core';

declare var gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  sendPageView(url: string) {
    gtag('event', 'page_view', {
      page_path: url
    });
  }

  sendEvent(eventName: string, params: object) {
    gtag('event', eventName, params);
  }
}