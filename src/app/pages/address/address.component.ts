import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SharedService } from '../../core/services/shared.service';
import { AddressFormComponent } from "../../components/address-form/address-form.component";




@Component({
  selector: 'app-address',
  standalone: true,
  imports: [AddressFormComponent, CommonModule],
  templateUrl: './address.component.html',
  styleUrl: './address.component.scss'
})
export class AddressComponent implements OnInit {



  addressForm!: FormGroup;
  submitted = false;

  currentPage: string = "address";
  addNew: boolean = false;
  addrSearch: boolean = false;
  editAddr: boolean = false;
  customerDetails: any = {};
  selectedLocation: any = {};
  address: any = [];
  pickedAddressindex!: number;

  searchTerm: string = '';
  searchPlaceId: string = '';
  searchResults: { placeId: string, text: string }[] = [];
  showResults: boolean = false;

  unServiceableValue: boolean = false;
  activeTab: number = 1;
  locationEnabled: boolean = true;
  restaurentId: number | undefined;
  // restaurentId: number = Number(Config.rest_id);
  partnerId: string = '';
  restaurentActive: boolean = true;
  errorMessage!: string;


  // @Output() closeDelivery = new EventEmitter<any>();
  // @Input() showHeader: boolean = true;

  checkDeleteAddress: boolean = false;
  deleteAddressIndex!: string;
  blockEditPincode: boolean = true;
  addressToEdit: any;

  message: string = '';

  addresslist = [{ "id": "1100102", "createdAt": "2025-04-09T18:10:50.577112188", "updatedAt": "2025-02-20T16:03:36.334", "restaurantId": null, "customerId": "100024", "addressType": "Home", "addressOne": "3/8E, Testaddress", "addressTwo": "Madhapur", "landmark": "test", "city": "Hyderabad", "state": "Telangana", "country": "India", "pincode": "641652", "location": { "latitude": 17.448583499999998, "longitude": 78.39080349999999 } }, { "id": "1100103", "createdAt": "2025-04-09T18:10:50.577333879", "updatedAt": "2025-02-20T16:06:04.014", "restaurantId": null, "customerId": "100024", "addressType": "Home", "addressOne": "3/8E, Testaddress", "addressTwo": "HITEC City", "landmark": "test", "city": "Hyderabad", "state": "Telangana", "country": "India", "pincode": "500081", "location": { "latitude": 17.4434646, "longitude": 78.3771953 } }, { "id": "1100108", "createdAt": "2025-04-09T18:10:50.577404069", "updatedAt": "2025-03-31T17:34:30.888", "restaurantId": null, "customerId": "100024", "addressType": "Home", "addressOne": "3/8E, Road Number 36 , Aditya Enclave", "addressTwo": "Venkatagiri , Madhapur", "landmark": "test", "city": "Hyderabad", "state": "Telangana", "country": "India", "pincode": "500033", "location": { "latitude": 17.4367684, "longitude": 78.40071019999999 } }, { "id": "1100109", "createdAt": "2025-04-09T18:10:50.577442861", "updatedAt": "2025-03-31T19:06:46.726", "restaurantId": null, "customerId": "100024", "addressType": "Work", "addressOne": "test", "addressTwo": null, "landmark": "test", "city": "Hyderabad", "state": "Telangana", "country": "India", "pincode": "500081", "location": { "latitude": 17.448583499999998, "longitude": 78.39080349999999 } }, { "id": "1100110", "createdAt": "2025-04-09T18:10:50.577477124", "updatedAt": "2025-04-02T20:53:02.095", "restaurantId": null, "customerId": "100024", "addressType": "Home", "addressOne": "3/8E, 2nd street", "addressTwo": "138, Rd Number 10, Ayyappa Society, Mega Hills, Madhapur, Hyderabad, Telangana 500081, India", "landmark": "Test", "city": "Hyderabad", "state": "Telangana", "country": "India", "pincode": "500081", "location": { "latitude": 17.448583499999998, "longitude": 78.39080349999999 } }, { "id": "1100102", "createdAt": "2025-04-09T18:10:50.577112188", "updatedAt": "2025-02-20T16:03:36.334", "restaurantId": null, "customerId": "100024", "addressType": "Home", "addressOne": "3/8E, Testaddress", "addressTwo": "Madhapur", "landmark": "test", "city": "Hyderabad", "state": "Telangana", "country": "India", "pincode": "641652", "location": { "latitude": 17.448583499999998, "longitude": 78.39080349999999 } }, { "id": "1100103", "createdAt": "2025-04-09T18:10:50.577333879", "updatedAt": "2025-02-20T16:06:04.014", "restaurantId": null, "customerId": "100024", "addressType": "Home", "addressOne": "3/8E, Testaddress", "addressTwo": "HITEC City", "landmark": "test", "city": "Hyderabad", "state": "Telangana", "country": "India", "pincode": "500081", "location": { "latitude": 17.4434646, "longitude": 78.3771953 } }, { "id": "1100108", "createdAt": "2025-04-09T18:10:50.577404069", "updatedAt": "2025-03-31T17:34:30.888", "restaurantId": null, "customerId": "100024", "addressType": "Home", "addressOne": "3/8E, Road Number 36 , Aditya Enclave", "addressTwo": "Venkatagiri , Madhapur", "landmark": "test", "city": "Hyderabad", "state": "Telangana", "country": "India", "pincode": "500033", "location": { "latitude": 17.4367684, "longitude": 78.40071019999999 } }, { "id": "1100109", "createdAt": "2025-04-09T18:10:50.577442861", "updatedAt": "2025-03-31T19:06:46.726", "restaurantId": null, "customerId": "100024", "addressType": "Work", "addressOne": "test", "addressTwo": null, "landmark": "test", "city": "Hyderabad", "state": "Telangana", "country": "India", "pincode": "500081", "location": { "latitude": 17.448583499999998, "longitude": 78.39080349999999 } }, { "id": "1100110", "createdAt": "2025-04-09T18:10:50.577477124", "updatedAt": "2025-04-02T20:53:02.095", "restaurantId": null, "customerId": "100024", "addressType": "Home", "addressOne": "3/8E, 2nd street", "addressTwo": "138, Rd Number 10, Ayyappa Society, Mega Hills, Madhapur, Hyderabad, Telangana 500081, India", "landmark": "Test", "city": "Hyderabad", "state": "Telangana", "country": "India", "pincode": "500081", "location": { "latitude": 17.448583499999998, "longitude": 78.39080349999999 } }, { "id": "1100102", "createdAt": "2025-04-09T18:10:50.577112188", "updatedAt": "2025-02-20T16:03:36.334", "restaurantId": null, "customerId": "100024", "addressType": "Home", "addressOne": "3/8E, Testaddress", "addressTwo": "Madhapur", "landmark": "test", "city": "Hyderabad", "state": "Telangana", "country": "India", "pincode": "641652", "location": { "latitude": 17.448583499999998, "longitude": 78.39080349999999 } }, { "id": "1100103", "createdAt": "2025-04-09T18:10:50.577333879", "updatedAt": "2025-02-20T16:06:04.014", "restaurantId": null, "customerId": "100024", "addressType": "Home", "addressOne": "3/8E, Testaddress", "addressTwo": "HITEC City", "landmark": "test", "city": "Hyderabad", "state": "Telangana", "country": "India", "pincode": "500081", "location": { "latitude": 17.4434646, "longitude": 78.3771953 } }, { "id": "1100108", "createdAt": "2025-04-09T18:10:50.577404069", "updatedAt": "2025-03-31T17:34:30.888", "restaurantId": null, "customerId": "100024", "addressType": "Home", "addressOne": "3/8E, Road Number 36 , Aditya Enclave", "addressTwo": "Venkatagiri , Madhapur", "landmark": "test", "city": "Hyderabad", "state": "Telangana", "country": "India", "pincode": "500033", "location": { "latitude": 17.4367684, "longitude": 78.40071019999999 } }, { "id": "1100109", "createdAt": "2025-04-09T18:10:50.577442861", "updatedAt": "2025-03-31T19:06:46.726", "restaurantId": null, "customerId": "100024", "addressType": "Work", "addressOne": "test", "addressTwo": null, "landmark": "test", "city": "Hyderabad", "state": "Telangana", "country": "India", "pincode": "500081", "location": { "latitude": 17.448583499999998, "longitude": 78.39080349999999 } }, { "id": "1100110", "createdAt": "2025-04-09T18:10:50.577477124", "updatedAt": "2025-04-02T20:53:02.095", "restaurantId": null, "customerId": "100024", "addressType": "Home", "addressOne": "3/8E, 2nd street", "addressTwo": "138, Rd Number 10, Ayyappa Society, Mega Hills, Madhapur, Hyderabad, Telangana 500081, India", "landmark": "Test", "city": "Hyderabad", "state": "Telangana", "country": "India", "pincode": "500081", "location": { "latitude": 17.448583499999998, "longitude": 78.39080349999999 } }]

  constructor(
    public apiService: ApiService,
    public sharedService: SharedService,
    private router: Router,
    private formBuilder: FormBuilder,
    private location: Location
  ) { }



  /**
   * Back Button
   */
  goBack(): void {
    this.router.navigate(['/cart']);
  }

  ngOnInit(): void {
    let custDetail: any = localStorage.getItem('customerDetails');

    this.selectedLocation = localStorage.getItem('selectedLocation');
    this.customerDetails = JSON.parse(custDetail);
    this.message = history.state.message;
    if(this.message != "" && this.message != undefined){
      //  console.log(this.message,'hjgaahjd');
       this.unServiceableValue = true;
    }
    // console.log(this.customerDetails);
   
    if (this.customerDetails != undefined) {
      this.getAddresssDetails();
    }
  }


  getAddresssDetails(): void {
    console.log('method call getAddresssDetails');

    this.apiService.getMethod(`/address?customerId_eq=${this.customerDetails.id}`).subscribe({
      next: (reponse) => {
        console.log(reponse);

        if (reponse.data.length > 0) {
          this.address = reponse.data;
          // this.address = this.addresslist;
        }
      },
      error: (error) => { console.log(error) }
    })
  }

  selectedAddress(index: number) {
    this.pickedAddressindex = index;
  }

  proceedOrder() {
    this.sharedService.SelecetdAddress(this.address[this.pickedAddressindex]);
    this.router.navigateByUrl('/cart');
  }


  getSavedAddress(event: any) {
    // console.log(event);
    if (event) {
      this.addNew = false;
      this.getAddresssDetails();
    }
  }
  newAddress(): void {
    // this.router.navigateByUrl('address/add-address');
    this.addNew = true;

  }

  /**
   * Edit Address
   * @param selectedAddress 
   */
  editAddress(selectedAddress: any) {
    // console.log(selectedAddress);
    this.addressToEdit = JSON.parse(JSON.stringify(selectedAddress));
    this.addNew = true;
  }

  /**
   * Select address for deletion
   * @param address Selected Address Index
   */
  deleteAddress(address: any): void {
    this.checkDeleteAddress = true;
    this.deleteAddressIndex = address.id;

  }

  /**
   * Delete Address API once after the delete conformation
   */
  confirmDeleteAddress(): void {
    this.checkDeleteAddress = false;
    this.apiService.deleteMethod(`/address/${this.deleteAddressIndex}`).subscribe({
      next: (reponse) => {
        if (reponse.status == 200) {
          this.deleteAddressIndex = '';
          // this.messageService.add({ severity: 'success', detail: 'Address Deleted.' });
          // console.log("Address DEleted");
          this.getAddresssDetails();
        }

      },
      error: (error) => { console.log(error) }
    })
  }
}
