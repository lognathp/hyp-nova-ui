import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Router } from '@angular/router';
import { TimeformatPipe } from "../../core/pipes/timeformat.pipe";

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, TimeformatPipe],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss'
})
export class OrderHistoryComponent {
  viewSummary:boolean = false
  customerDetails: any;
  orderHistory: any;
  selectedOrderSummary: any;
  restaurentId: number | undefined;
  loading: boolean = false;

  currentPage: number = 1;
  itemsPerPage: number = 3; // Number of items per page
  totalItems: number = 0;
  pagedAddresses: any[] = [];

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      this.router.navigate(['/order']);
    }, 150);
  }
  /**
   * To fetch order history
   */
  getOrderHistory():void {
    this.apiService.getMethod(`/order?sortField=id&customerId_eq=${this.customerDetails.id}`).subscribe({
      next: (reponse) => {
        this.loading = false;
        this.orderHistory = reponse.data;
        this.totalItems = this.orderHistory.length;
        this.pagedAddresses = this.orderHistory.slice(0, this.itemsPerPage);
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

  handlePagination(page: number): void {
    this.currentPage = page;
    const start = (page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.pagedAddresses = this.orderHistory.slice(start, end);
  }

  totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.handlePagination(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.handlePagination(this.currentPage + 1);
    }
  }

  /**
   * TO get the Delivery address
   * @param addressId Address Id
   */
  getdeliveryAddress(addressIdarg:string):void{
    const addressId:number = parseInt(addressIdarg);
    this.apiService.getMethod(`/address/${addressId}`).subscribe({
      next: (reponse) => {
        this.loading = false;
        // console.log(reponse);
        this.selectedOrderSummary.deliveryDetails['address'] = reponse.data[0];
      },
      error: (error) => { console.log(error) }
    });
  }
}
