import { Component, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Config } from '../../core/config';
import { ApiService } from '../../core/services/api.service';
import { PaymentService } from '../../core/services/payment.service';
import { SomethingWentWrongComponent } from "../../components/errors/something-went-wrong/something-went-wrong.component";

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [SomethingWentWrongComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent {
  private razorpay_key: string = Config.razorpay_key;

  orderSaveResponse: any;
  partnerData: any;
  customerDetails: any = {};

  timerCount: number = 600; // 5 minutes
  timerDisplay: string = '10:00';
  paymentConfirmed: boolean = false;
  timerInterval: any;
  razorpayInstance: any;
  unKnownError: boolean = false;
  errorMessage: string = '';

  constructor(
    private paymentService: PaymentService,
    private router: Router,
    private ngZone: NgZone,
    public apiService: ApiService,
    private route: ActivatedRoute
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.orderSaveResponse = navigation?.extras.state?.['orderData'];
  }

  ngOnInit() {
    // this.orderSaveResponse = this.route.snapshot.paramMap.get('orderData');
    console.log(this.orderSaveResponse);
    // console.log(this.router.url);
    // call api to create order_id
    const vendorDetail: any = localStorage.getItem('vendorData');
    if (vendorDetail) {
      this.partnerData = JSON.parse(vendorDetail);
    }

    const localCurrentOrder: any = localStorage.getItem("currentOrder");
    let orderdataId = JSON.parse(localCurrentOrder);

    let custDetail: any = localStorage.getItem('customerDetails');
    this.customerDetails = JSON.parse(custDetail);

    this.payWithRazor({
      totalAmount: this.orderSaveResponse[0].amount,
      id: this.orderSaveResponse[0].paymentOrderId
    }, orderdataId.data[0].id);

    this.startPaymentTimer();
  }

  payWithRazor(orderData: any, currentOrderId: string) {
    const options: any = {
      key: this.razorpay_key,
      amount: orderData.totalAmount,
      currency: 'INR',
      name: this.partnerData?.name,
      description: this.partnerData?.type,
      image: '../../../assets/images/yum-yum.png',
      order_id: orderData.id,
      prefill: {
        name: this.customerDetails.name,
        email: "",
        contact: this.customerDetails.mobile
      },
      modal: {
        escape: false,
        ondismiss: () => {
          console.log('Transaction cancelled.');
          this.router.navigate(['/order']);
        }
      },
      notes: {
        address: "Razorpay Corporate Office"
      },
      theme: {
        color: '#3399cc'
      }
    };

    options.handler = (response: any) => {
      options.response = response;
      console.log("Razorpay response:", response);
      this.paymentConfirmed = true;
      clearInterval(this.timerInterval);

      this.ngZone.runOutsideAngular(() => {
        this.apiService.postMethod(`/payment/verify/${currentOrderId}`, response).subscribe({
          next: (res) => {
            this.router.navigate(['/order-tracking'], { state: { orderData: res } });
          },
          error: (err) => {
            console.log(err);
            this.unKnownError = true;
            this.errorMessage = "Payment failed. Please try again.";
            this.router.navigate(['/order-tracking'], { state: { orderData: err } });
          }
        });
      });
    };

    const rzp = new this.paymentService.nativeWindow.Razorpay(options);
    this.razorpayInstance = rzp; // Store the instance
    rzp.open();
  }

  startPaymentTimer() {
    this.timerInterval = setInterval(() => {
      this.timerCount--;
      const minutes = Math.floor(this.timerCount / 60);
      const seconds = this.timerCount % 60;
      this.timerDisplay = `${this.pad(minutes)}:${this.pad(seconds)}`;

      if (this.timerCount <= 0) {
        clearInterval(this.timerInterval);
        if (!this.paymentConfirmed) {
          // Close Razorpay modal if it exists
          if (this.razorpayInstance) {
            try {
              // Force close the modal
              const modal = document.querySelector('.razorpay-container iframe');
              if (modal && modal.parentNode) {
                (modal.parentNode as HTMLElement).style.display = 'none';
              }
              
              // Trigger Razorpay's close
              this.razorpayInstance.close();
              
              // Clean up Razorpay instance
              this.razorpayInstance = null;
              
              // Show error message
              this.showErrorAndNavigate();
            } catch (e) {
              console.error('Error handling Razorpay modal close:', e);
              this.showErrorAndNavigate();
            }
          } else {
            this.showErrorAndNavigate();
          }
        }
      }
    }, 600);
  }

  private showErrorAndNavigate() {
    this.ngZone.run(() => {
      this.unKnownError = true;
      this.errorMessage = "Payment time expired. If any amount was deducted, it will be refunded. Please place your order again.";
      
      // Navigate after a delay
      setTimeout(() => {
        this.router.navigate(['/order']);
      }, 6000);
    });
  }

  pad(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }
}
