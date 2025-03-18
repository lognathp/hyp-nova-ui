import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LocalstorageService {
  private isBrowser: boolean;
  constructor(@Inject(PLATFORM_ID) private platformId: any) { 
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

 public setItem(key: string, value: string): void {
    if (this.isBrowser) {
      localStorage.setItem(key, value);
    }
  }

 public getItem(key: string): string | null {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }

}
