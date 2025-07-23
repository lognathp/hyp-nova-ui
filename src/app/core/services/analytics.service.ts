import { Injectable } from '@angular/core';

/**
 * Event parameters type for analytics events
 */
interface EventParams {
  [key: string]: string | number | boolean | null | undefined;
}

declare let dataLayer: any[];

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private isDataLayerAvailable = typeof dataLayer !== 'undefined';

  constructor() {
    if (!this.isDataLayerAvailable) {
      console.warn('Google Tag Manager (dataLayer) is not available');
    } else {
      console.log('AnalyticsService initialized with GTM');
    }
  }

  /**
   * Log an event to Google Tag Manager
   * @param eventName - The name of the event to log
   * @param eventParams - Optional parameters to include with the event
   */
  public logEvent(eventName: string, eventParams: EventParams = {}): void {
    this.pushToDataLayer(eventName, eventParams);
  }

  /**
   * Push an event to Google Tag Manager dataLayer
   * @param eventName - The name of the event
   * @param eventParams - Parameters associated with the event
   */
  private pushToDataLayer(eventName: string, eventParams: EventParams): void {
    if (!this.isDataLayerAvailable) {
      console.warn('dataLayer is not available, GTM event not tracked:', { eventName, eventParams });
      return;
    }

    try {
      // Push event to GTM dataLayer
      dataLayer.push({
        event: eventName,
        ...eventParams,
        timestamp: new Date().toISOString()
      });
      
      console.debug('GTM event pushed:', { eventName, eventParams });
    } catch (error) {
      console.error('Error pushing to dataLayer:', error);
    }
  }

  /**
   * Log a page view event
   * @param page - The page being viewed
   * @param additionalParams - Additional parameters to include
   */
  public logPageView(page: string, additionalParams: EventParams = {}): void {
    this.pushToDataLayer('page_view', {
      page,
      ...additionalParams
    });
  }
}