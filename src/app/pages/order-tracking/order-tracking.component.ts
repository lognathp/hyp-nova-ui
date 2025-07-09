import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from '../../core/services/shared.service';
import { ApiService } from '../../core/services/api.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { Subscription } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.scss'
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  contactHyperapps: string = environment.contactHyperapps;

  currentOrder: any;
  orderStatus: any;
  private wsSubscription!: Subscription;
  addressDetails!: string;
  restaurentId: number | undefined;
  vendorData: any;
  branchData: any;

  viewSummary: boolean = false;
  cancelled: boolean = false;

  //   weatherAlert: string | null = "Heavy rain in your area. Deliveries may be delayed.";
  // customerMessage: string | null = "Our delivery partner will call if they have trouble reaching you. Please keep your phone handy.";

  weatherAlert: string | null = null;
  customerMessage: string | null = "Our delivery partner will call if they have trouble reaching you. Please keep your phone handy.";
  customerDetails: any;

  constructor(
    public sharedData: SharedService,
    public apiService: ApiService,
    private wsService: WebSocketService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  async ngOnInit(): Promise<void> {
    let tempcustomerDetails: any = localStorage.getItem('customerDetails');
    // if (!tempcustomDetails) {
    this.customerDetails = JSON.parse(tempcustomerDetails);
    // Get order id from query params
    this.route.queryParams.subscribe(async params => {
      const orderId = params['id'];
      if (orderId) {
        await this.fetchOrderById(orderId);
      } else {
        const localCurrentOrder: any = localStorage.getItem("currentOrder");
        this.currentOrder = JSON.parse(localCurrentOrder);
        let restId: any = localStorage.getItem("selectedRestId");
        this.restaurentId = parseInt(restId);
        if (!isNaN(this.restaurentId)) {
          const vendorDetail: any = localStorage.getItem('vendorData');
          this.vendorData = JSON.parse(vendorDetail);
          if (this.vendorData.restaurantDetails != undefined) {
            this.vendorData.restaurantDetails.forEach((brdata: any) => {
              if (brdata.id == this.restaurentId) {
                this.branchData = brdata;
              }
            });
          }
        }
        localStorage.removeItem("foodBasket");
        await this.fetchOrderStatus();
      }

      // WebSocket subscription (for both cases)
      this.wsSubscription = this.wsService.getOrderStatusUpdates().subscribe((webSocketResponse: any) => {
        console.log(JSON.stringify(webSocketResponse))
        if (webSocketResponse.customerId === this.customerDetails.id) {
          this.orderStatus = webSocketResponse;
          if (this.orderStatus.status == 'CANCELLED') {
            this.cancelled = true;
          }
        }

      });
    });
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  async fetchOrderById(orderId: number): Promise<void> {
    this.apiService.getMethod(`/order/${orderId}`).subscribe({
      next: (response) => {
        this.currentOrder = { data: [response.data[0]] }; // mimic structure used elsewhere
        this.orderStatus = response.data[0];
        this.getAddress(this.orderStatus.deliveryDetails.addressId);
      },
      error: (error) => {
        console.error('Error fetching order by ID:', error);
      }
    });
  }

  async fetchOrderStatus(): Promise<void> {
    this.apiService.getMethod(`/order/${this.currentOrder?.data[0].id}`).subscribe({
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
      { status: 'READY_FOR_DELIVERY', state: 'ACCEPTED' },
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
      },
      error: (error) => { console.log(error) }
    })
  }

  navigateMap() {
    window.open(this.orderStatus.deliveryTrackingLink, "_blank");
  }

  goBack(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      this.router.navigate(['/order']);
    }, 150);
  }

  viewOrderSummary() {
    // Implement as needed
  }
}