import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLoggedIn: boolean = false;

  private returnUrl: string | null = null;
  constructor() { }

  setReturnUrl(url: string) {
    this.returnUrl = url;
  }

  getReturnUrl(): string | null {
    return this.returnUrl;
  }

  clearReturnUrl() {
    this.returnUrl = null;
  }
  
  login() {
    // Simulate login
    this.isLoggedIn = true;
    console.log(this.isLoggedIn ,'login');
    
  }

  logout() {
    // Simulate logout
    this.isLoggedIn = false;

  }
}

