import { Component, Input, NgZone } from '@angular/core';

import { Router,NavigationEnd, ActivatedRoute } from '@angular/router';
import { Config } from '../../core/config';
import { ApiService } from '../../core/services/api.service';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent {

  private razorpay_key: string = Config.razorpay_key

  orderSaveResponse:any;
  partnerData: any;

// orderSaveResponse: any;
  constructor(
    private paymentService: PaymentService, 
    private router: Router, 
    private ngZone:NgZone, 
    public apiService: ApiService,
    private route: ActivatedRoute
  ) { 
    const navigation = this.router.getCurrentNavigation();
    this.orderSaveResponse = navigation?.extras.state?.['orderData'];
  }
  customerDetails: any = {};
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
    let orderdataId = JSON.parse(localCurrentOrder)
    console.log(localCurrentOrder);
    
    this.payWithRazor({
      totalAmount: this.orderSaveResponse[0].amount,
      id: this.orderSaveResponse[0].paymentOrderId
    },orderdataId.data[0].id);
    let custDetail: any = localStorage.getItem('customerDetails');
    this.customerDetails = JSON.parse(custDetail);
    // console.log(this.customerDetails);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.location.reload();
        
      }
    });
  }

  payWithRazor(orderData: any, currentOrderId:string) {
    const options: any = {
      key: this.razorpay_key,
      amount: orderData.totalAmount, // amount should be in paise format to display Rs 1255 without decimal point
      // amount: 125500, // amount should be in paise format to display Rs 1255 without decimal point
      currency: 'INR',
      name: this.partnerData?.name, // company name or product name
      description: this.partnerData?.type,  // product description
      image: '../../../assets/images/wacky-wok.png', // company logo or product image
      order_id: orderData.id, // order_id created by you in backend
      // modal: {
      //   // We should prevent closing of the form when esc key is pressed.
      //   escape: false,
      // },
      prefill: {//We recommend using the prefill parameter to auto-fill customer's contact information, especially their phone number
        name: this.customerDetails.name, //your customer's name
        email: "",
        contact: this.customerDetails.mobile  //Provide the customer's phone number for better conversion rates 

      },
      modal: {
        // Prevent closing the form when the ESC key is pressed
        escape: false,
        ondismiss: () => {
          // Handle the case when the user closes the form while the transaction is in progress
          console.log('Transaction cancelled.');
          this.router.navigate(['/order']);
        }
      },
      notes: {
        // include notes if any
        address: "Razorpay Corporate Office"
      },
      theme: {
        color: '#3399cc'
      },
      // callback_method: "get",
      // redirect: true,
      // callback_url:"http://localhost:4200/order-tracking",
      // callback_url: window.location.origin + "/order-tracking",
    };
    options.handler = ((response: any, error: any) => {
      options.response = response;
      console.log(response,error);
      console.log(options);
      this.ngZone.runOutsideAngular(() => {
        this.apiService.postMethod(`/payment/verify/${currentOrderId}`, response).subscribe({
          next: (reponse) => { console.log(response);
            this.router.navigate(['/order-tracking']);
           },
          error: (error) => { console.log(error)
            this.router.navigate(['/order-tracking']);
           }
      });
        
      });
      
      // call your backend api to verify payment signature & capture transaction
    });
    // options.modal.ondismiss = (() => {
    //   // handle the case when user closes the form while transaction is in progress
    //   console.log('Transaction cancelled.');
    // });
    const rzp = new this.paymentService.nativeWindow.Razorpay(options);
    rzp.open();
  }
  
}




