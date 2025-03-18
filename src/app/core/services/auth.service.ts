import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLoggedIn: boolean = false;
  constructor() { }

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

