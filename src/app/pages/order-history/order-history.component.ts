import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss'
})
export class OrderHistoryComponent {
  viewSummary:boolean = false
  customerDetails: any;
  orderHistory: any;
  selectedOrderSummary: any;
  restaurentId: number | undefined;


  constructor(
    private location: Location,
     public apiService: ApiService,
    private router: Router,
  ) { }

  ngOnInit() {
    let custDetail: any = localStorage.getItem('customerDetails');
    this.customerDetails = JSON.parse(custDetail);

    let restId: any = localStorage.getItem("selectedRestId")
    this.restaurentId = parseInt(restId);

    // console.log(this.customerDetails, this.restaurentId );
    if(this.customerDetails != undefined){
      this.getOrderHistory();
    }
    
    
  }

  /**
   * Method to show Order history
   */
  viewOrderSummary(order:any):void{
    this.viewSummary = true;
    this.selectedOrderSummary = JSON.parse(JSON.stringify(order));
    console.log(order,  this.selectedOrderSummary);
    this.getdeliveryAddress(this.selectedOrderSummary.deliveryDetails.addressId)
  }

  /**
   * Method to show view Order History
   */
  viewOrderHistory():void{
    this.viewSummary = false;
  }

  /**
   * Back Button
   */
  goBack(): void {
    this.router.navigate(['/order']);
  }

  /**
   * To fetch order history
   */
  getOrderHistory():void {
    this.apiService.getMethod(`/order?customerId_eq=${this.customerDetails.id}`).subscribe({
      next: (reponse) => {
        this.orderHistory = reponse.data;
        // let SNo:number = 1;
        // this.orderHistory.map((ele:any) => {
        //   ele['SNo'] = SNo;
        //   SNo += 1;
        // })
        console.log(this.orderHistory);
      },
      error: (error) => { console.log(error) }
    });
  }

  /**
   * TO get the Delivery address
   * @param addressId Address Id
   */
  getdeliveryAddress(addressIdarg:string):void{
    const addressId:number = parseInt(addressIdarg);
    this.apiService.getMethod(`/address/${addressId}`).subscribe({
      next: (reponse) => {
        // console.log(reponse);
        this.selectedOrderSummary.deliveryDetails['address'] = reponse.data[0];
      },
      error: (error) => { console.log(error) }
    });
  }
}
