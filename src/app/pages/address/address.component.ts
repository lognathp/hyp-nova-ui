import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SharedService } from '../../core/services/shared.service';
import { AddressFormComponent } from "../../components/address-form/address-form.component";
import { NgZone } from '@angular/core';




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

  // currentPage: string = "address";
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

  currentPage: number = 1;
  itemsPerPage: number = 4; // Number of items per page
  totalItems: number = 0;
  pagedAddresses: any[] = [];

  constructor(
    public apiService: ApiService,
    public sharedService: SharedService,
    private router: Router,
    private formBuilder: FormBuilder,
    private location: Location,
    private ngZone: NgZone
  ) { }



  /**
   * Back Button
   */
  // goBack(): void {
  //   this.router.navigate(['/cart']);
  // }
  goBack(): void {
  const cartItems = JSON.parse(localStorage.getItem('foodBasket') || '[]');

  if (cartItems.length > 0) {
    this.router.navigate(['/cart']);
  } else {
    this.router.navigate(['/order']);
  }
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
      next: (response) => {
        console.log(response);

        if (response.data.length > 0) {
          // Sort addresses by createdAt in descending order (newest first)
          this.address = response.data.sort((a:any, b:any) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          this.totalItems = this.address.length;
          this.setPage(1); // Initialize first page
        }
      },
      error: (error) => { console.log(error) }
    })
  }

  selectedAddress(index: number) {
    this.ngZone.run(() => {
      this.pickedAddressindex = index;
    });  }

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

  setPage(page: number): void {
    this.currentPage = page;
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.totalItems);
    this.pagedAddresses = this.address.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.setPage(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.setPage(this.currentPage - 1);
    }
  }

  totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
}
