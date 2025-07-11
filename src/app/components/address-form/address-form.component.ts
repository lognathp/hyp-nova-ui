import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { SharedService } from '../../core/services/shared.service';
import { Router } from '@angular/router';
import { AbstractControl, FormControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { LocationPickerComponent } from "../location-picker/location-picker.component";
import { CommonModule } from '@angular/common';
import { SelectLocationComponent } from "../select-location/select-location.component";

import { MessageService, PrimeNGConfig } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

declare var bootstrap: any; // Bootstrap is using from assets

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [LocationPickerComponent, FormsModule, CommonModule, SelectLocationComponent,ToastModule],
  templateUrl: './address-form.component.html',
  styleUrl: './address-form.component.scss',
  providers: [MessageService]
})
export class AddressFormComponent {

  @Output() addressSaved = new EventEmitter<any>();
  @Input() addressToEdit: any;

  submitted = false;
  markedLocation: any;
  selectedLocation!: any;

  customerDetails: any = {};

  flatNo: string = "";
  addressOne: string = "";
  landmark: string = "";
  addressType: string = "Home";

  location = {
    latitude: '',
    longitude: ''
  }
  locationConformed: boolean = false;

  editAddress:boolean = false;
  editLocationValue: any;
  addressId!: number;
  showSellocation: boolean = false;
  showmap: boolean =  false;
  unServiceableValue: boolean = false;
  partnerId: any;
  // editLocationdata: { formattedAddress: any; location: any; city: any; state: any; pincode: any; country: any; };
  // enableMapEdit: boolean = true;

  constructor(
    public apiService: ApiService,
    public sharedDervice: SharedService,
    private router: Router,
    // private formBuilder: FormBuilder,
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig,
    // private foodMenuComponent: FoodMenuComponent
  ) {}

  /**
   * Back Button
   */
  goBack():void {
    this.router.navigate(['/order']);
  }
  ngOnInit() {
    this.primengConfig.ripple = true;
    // let restId: any = localStorage.getItem("selectedRestId")
    // this.restaurentId = parseInt(restId);

    // const vendorDetail: any = localStorage.getItem('vendorData');
    // let vdata = JSON.parse(vendorDetail)

    // this.partnerId = vdata.id;

    // this.addressForm = this.formBuilder.group({
    //   id: new FormControl(),
    //   // addressType: new FormControl('Home', [Validators.required]),
    //   flatNo: new FormControl('', [Validators.required]),
    //   addressOne: new FormControl('', []),
    //   // addressTwo: new FormControl('', [Validators.required]),
    //   landmark: new FormControl('', [Validators.required]),
    //   // city: new FormControl('', [Validators.required]),
    //   // state: new FormControl('', [Validators.required]),
    //   // country: new FormControl('', [Validators.required]),
    //   // pincode: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{6}$')]),
    //   customerId: new FormControl(),
    //   location: new FormControl(),
    // });


    const tempLocationSelected: any = localStorage.getItem('selectedLocation');
    this.selectedLocation = JSON.parse(tempLocationSelected);
    if(this.selectedLocation){
      this.showmap = true;
    }
    let custDetail: any = localStorage.getItem('customerDetails');
    this.customerDetails = JSON.parse(custDetail);

    console.log(this.customerDetails);
    console.log(this.editAddress,'editAddress', this.selectedLocation);
    if(this.addressToEdit != undefined){
      this.editAddress = true;
      this.setFormEditPrefill(JSON.parse(JSON.stringify(this.addressToEdit)));
    }
   
    // this.address = this.customerDetails.addresses;
    // this.getAddresssDetails();

    // this.primengConfig.ripple = true;




  }

  getchangedLocation(event: any):void{
    
    this.showmap = true;
    // this.selectedLocation = event.selectedLocation;
    // this.editLocationValue = event.selectedLocation.location
    const tempLocationSelected: any = localStorage.getItem('selectedLocation');
    this.selectedLocation = JSON.parse(tempLocationSelected);
    this.closeOffcanvas('selectDeliveryLocation');
    this.showSellocation = false;
  }

  getSelectedLocation(event: any): void {
    console.log(event);
    // this.enableMapEdit = fal;
    // this.checkServiceable(event.location);

    this.locationConformed = true;
    this.selectedLocation = event;

    // this.markedLocation = event;
  }

  /**
   * Add new Addresss
   */
  addAddress():void {
    this.submitted = true;
    const saveAddress = {

      addressType: this.addressType,
      // flatNo: this.flatNo,
      addressOne: this.flatNo + ', ' + this.addressOne,
      landmark: this.landmark,
      customerId: this.customerDetails.id,
      city: this.selectedLocation.city,
      state: this.selectedLocation.state,
      pincode: this.selectedLocation.pincode,
      country: this.selectedLocation.country,
      location: this.selectedLocation.location,
      addressTwo: this.selectedLocation.formattedAddress
    }
    console.log(saveAddress);

    // this.blockEditPincode = true;
    // if (this.addressForm.invalid) return;
    // if (this.addressForm.valid) {
    //   this.addressForm.patchValue({ customerId: this.customerDetails.id });
    //   this.addressForm.value.addressOne = this.addressForm.value.flatNo + ', ' + this.addressForm.value.addressOne;
    //   this.addressForm.value.formattedAddress = this.addressForm.value.flatNo + ', ' + this.addressForm.value.formattedAddress;

    if (this.locationConformed && this.flatNo != "" && this.addressOne != "") {
      this.apiService.postMethod(`/address`, saveAddress).subscribe({
        next: (reponse) => {
          this.submitted = false;
          console.log(reponse);
          this.addressSaved.emit(reponse)
          // this.address = reponse.data[0].addresses;
        },
        error: (error) => { console.log(error) }
      });
    }
    if(!this.locationConformed){
      this.messageService.add({ severity: 'error', detail: 'PLease conform location. ', life: 1000 });
    }

    // }
  }

  /**
   * Prefill Address to edit
   * @param address Address to Edit
   */
  setFormEditPrefill(address:any){
    console.log(address);
    this.flatNo = address.addressOne.split(',')[0];
    this.addressOne= address.addressOne.split(',')[1];
    this.landmark = address.landmark;
    this.addressType= address.addressType;
    this.editLocationValue = address.location;
   
    this.addressId = parseInt(address.id);
    this.selectedLocation ={
      formattedAddress : address.addressTwo,
      location:  this.editLocationValue,
      city:address.city,
      state:address.state,
      pincode:address.pincode,
      country:address.country
     }
  }

  /**
   * Update Address
   */
  updateAddress():void{
    this.submitted = true;
    
    const updateAddress = {

      addressType: this.addressType,
      // flatNo: this.flatNo,
      addressOne: this.flatNo + ', ' + this.addressOne,
      landmark: this.landmark,
      customerId: this.customerDetails.id,
      city: this.selectedLocation.city,
      state: this.selectedLocation.state,
      pincode: this.selectedLocation.pincode,
      country: this.selectedLocation.country,
      location: this.selectedLocation.location,
      addressTwo: this.selectedLocation.formattedAddress
    }
    this.apiService.patchMethod(`/address/${this.addressId}`, updateAddress).subscribe({
      next: (reponse) => {
        this.submitted = false;
        this.editAddress = false;
          console.log(reponse);
          this.addressSaved.emit(reponse)
        // this.closeAddressForm();
        // this.messageService.add({ severity: 'success', detail: 'Address Updated.' });
        // this.getAddresssDetails();
      },
      error: (error) => { console.log(error) }
    });
  }

  editLocation() {
    // this.enableMapEdit = true;
    // console.log(this.enableMapEdit);

  }

  
  public openOffcanvas(offcanvasId: string) {
    this.showSellocation = true;
    const offcanvasElement = document.getElementById(offcanvasId);
      if (offcanvasElement) {
        const bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement);
        bsOffcanvas.show();
      }
      this.showmap = false;
  }
  /**
   * Method to close bootstrap canvas ans bottom slider
   */
  public closeOffcanvas(offcanvasId: string): void {
    const offcanvasElement = document.getElementById(offcanvasId);
    if (offcanvasElement) {
      const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
      offcanvasInstance.hide();  // Close offcanvas
    }
    
  }



}
