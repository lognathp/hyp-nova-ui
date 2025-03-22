import { AfterViewInit, Component, EventEmitter, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SharedService } from '../../core/services/shared.service';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [],
  templateUrl: './address.component.html',
  styleUrl: './address.component.scss'
})
export class AddressComponent implements OnInit, AfterViewInit{

 

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


  constructor(
    public apiService: ApiService,
    public sharedService: SharedService,
    private router: Router,
    private formBuilder: FormBuilder,
    ) {}

  ngAfterViewInit(): void {
    // throw new Error('Method not implemented.');
  }

    ngOnInit():void{
      let custDetail: any = localStorage.getItem('customerDetails');

    this.selectedLocation = localStorage.getItem('selectedLocation');
    this.customerDetails = JSON.parse(custDetail);
    console.log(this.customerDetails);
    if(this.customerDetails != undefined){
      this.getAddresssDetails();
    }
    }

    ngDoCheck(){
      
    }

    getAddresssDetails() {
      console.log('method call getAddresssDetails');
      
      this.apiService.getMethod(`/address?customerId_eq=${this.customerDetails.id}`).subscribe({
        next: (reponse) => {
          console.log(reponse);
  
          if (reponse.data.length > 0) {
            this.address = reponse.data;
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
}
