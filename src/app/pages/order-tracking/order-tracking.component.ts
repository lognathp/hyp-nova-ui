import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../core/services/shared.service';
import { ApiService } from '../../core/services/api.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { Subscription } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { Location } from '@angular/common';
import { Router } from '@angular/router';



@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [DatePipe,CommonModule],
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.scss'
})
export class OrderTrackingComponent implements OnInit {
  contactHyperapps: string = environment.contactHyperapps;
  

  currentOrder: any;
  orderStatus: any;
  private wsSubscription!: Subscription;
  addressDetails!: string;
  restaurentId: number | undefined;
  vendorData: any;
  branchData: any;

  viewSummary:boolean = false;
  cancelled: boolean = false;

  constructor(
    public sharedData: SharedService,
    public apiService: ApiService,
    private wsService: WebSocketService,
    private location: Location,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {

    const localCurrentOrder: any = localStorage.getItem("currentOrder");
    this.currentOrder = JSON.parse(localCurrentOrder)

    let restId: any = localStorage.getItem("selectedRestId")
    this.restaurentId = parseInt(restId);
    if (!isNaN(this.restaurentId)) {
      const vendorDetail: any = localStorage.getItem('vendorData');
      this.vendorData = JSON.parse(vendorDetail)
      // console.log(vdata);
      if (this.vendorData.restaurantDetails != undefined) {
        this.vendorData.restaurantDetails.forEach((brdata: any) => {
          if (brdata.id == this.restaurentId) {
            this.branchData = brdata;
          }
        });
      }

    }

    // console.log(this.currentOrder);
    localStorage.removeItem("foodBasket");
    await this.fetchOrderStatus();
    this.wsSubscription = this.wsService.getOrderStatusUpdates().subscribe((webSocketResponse: any) => {
      console.log(JSON.stringify(webSocketResponse))
      this.orderStatus = webSocketResponse;
      if(this.orderStatus.status == 'CANCELLED'){
        this.cancelled = true;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  async fetchOrderStatus(): Promise<void> {
    this.apiService.getMethod(`/order/${this.currentOrder.data[0].id}`).subscribe({
      next: (response) => {
        console.log('Initial order status:', response);
        this.orderStatus = response.data[0];
        this.getAddress(this.orderStatus.deliveryDetails.addressId);
      },
      error: (error) => {
        console.error('Error fetching order status:', error);
      }
    });
  }


  isOrderStatusReached(status: string): boolean {
    const statusOrder = [
      { status: 'CONFIRMED', state: 'CONFIRMED' },
      { status: 'PAYMENT_PENDING', state: 'CONFIRMED' },
      { status: 'PAID', state: 'PAID' },
      { status: 'ACCEPTED', state: 'ACCEPTED' },
      { status: 'MARK_FOOD_READY', state: 'ACCEPTED' },
      { status: 'OUT_FOR_PICKUP', state: 'ACCEPTED' },
      { status: 'REACHED_PICKUP', state: 'ACCEPTED' },
      { status: 'PICKED_UP', state: 'PICKED_UP' },
      { status: 'OUT_FOR_DELIVERY', state: 'OUT_FOR_DELIVERY' },
      { status: 'REACHED_DELIVERY', state: 'OUT_FOR_DELIVERY' },
      { status: 'DELIVERED', state: 'DELIVERED' },
      { status: 'CANCELLED', state: 'CANCELLED' }
    ];

    
    
    const currentState = statusOrder.find(item => item.status === this.orderStatus?.status);
    const targetState = statusOrder.find(item => item.status === status);
    // console.log(currentState,targetState)
    if (!currentState || !targetState) {
      return false;
    }
   
    const currentStateIndex = statusOrder.indexOf(currentState);
    const targetStateIndex = statusOrder.indexOf(targetState);
    return targetStateIndex <= currentStateIndex;
  }

  getAddress(addressId: any): void {
    this.apiService.getMethod(`/address/${addressId}`).subscribe({
      next: (response) => {
        // this.addressDetails = response.data[0];
        const tempcustomDetailsformattedAddress = {
          addressOne: response.data[0].addressOne,
          addressTwo: response.data[0].addressTwo,
          addressType: response.data[0].addressType,
          landmark: response.data[0].landmark,
          city: response.data[0].city,
          state: response.data[0].state,
          country: response.data[0].country,
          pincode: response.data[0].pincode
        }
        this.addressDetails = Object.values(tempcustomDetailsformattedAddress).filter(part => part !== null && part !== undefined).join(', ');
        // console.log(this.addressDetails);

        // this.showTable = false;
        // this.viewItem = item;

        // if (this.viewItem.orderTime) {
        //   console.log("Raw orderTime from API:", this.viewItem.orderTime);
        //   const utcDate = new Date(this.viewItem.orderTime + 'Z');
        //   console.log("Parsed UTC Date:", utcDate.toISOString());
        //   this.viewItem.orderTime = new Date(utcDate).toLocaleString('en-IN', {
        //     timeZone: 'Asia/Kolkata', // Convert to IST
        //     year: 'numeric',
        //     month: '2-digit',
        //     day: '2-digit',
        //     hour: '2-digit',
        //     minute: '2-digit',
        //     second: '2-digit',
        //     hour12: true,
        //   });

        //   console.log("Final IST Date:", this.viewItem.orderTime);
        // }

      },
      error: (error) => { console.log(error) }
    })
  }

  navigateMap() {
    // console.log('trackingurl', this.orderStatus.deliveryTrackingLink);

    window.open(this.orderStatus.deliveryTrackingLink, "_blank");
  }

  /**
   * Back Button
   */
  goBack():void {
    // this.location.back(); // Moves to the previous route
    this.router.navigate(['/order']);
  }

  viewOrderSummary(){

  }
}
