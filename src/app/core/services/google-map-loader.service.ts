import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapLoaderService {

  myapiKey = environment.googleMapApiKey;

  private apiKey: string = this.myapiKey; 
  private scriptLoaded = false;

  constructor() { }

  loadGoogleMaps(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.scriptLoaded) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&callback=initMap`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () => reject('Google Maps script loading failed');

      document.body.appendChild(script);
    });
  }
}
