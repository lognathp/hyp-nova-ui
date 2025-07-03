import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-account.component.html',
  styleUrl: './user-account.component.scss'
})
export class UserAccountComponent {

  customerDetails: any = {};

  constructor(
    // private location: Location,
    private router: Router,
  ) { }

  /**
   * Back Button
   */
  goBack(): void {
    // this.location.back(); // Moves to the previous route
    this.router.navigate(['/order']); // Navigate to the order page
  }

  ngOnInit(): void {
    let custDetail: any = localStorage.getItem('customerDetails');
    this.customerDetails = JSON.parse(custDetail);

    console.log(this.customerDetails);
  }

  /**
   * Routes to address page
   */
  addressPage():void{
    this.router.navigate(['/address']);
  }

  /**
   * Routes to order history
   */
  ordersPage():void{
    this.router.navigate(['/my-orders']);
  }
  /**
   * Logout
   */
  logout(): void {
    localStorage.clear();
    this.router.navigate(['/home']);
  }
}
