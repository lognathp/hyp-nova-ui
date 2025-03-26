import { Component } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { SharedService } from '../../core/services/shared.service';
import { Router } from '@angular/router';
import { AbstractControl, FormControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators,FormsModule } from '@angular/forms';
import { LocationPickerComponent } from "../location-picker/location-picker.component";

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [LocationPickerComponent,ReactiveFormsModule],
  templateUrl: './address-form.component.html',
  styleUrl: './address-form.component.scss'
})
export class AddressFormComponent {

  addressForm!: FormGroup;
  submitted = false;
  markedLocation: any;
  selectedLocation!: any;

  customerDetails: any = {};

  constructor(
    public apiService: ApiService,
    public sharedDervice: SharedService,
    private router: Router,
    private formBuilder: FormBuilder,
    // private messageService: MessageService,
    // private primengConfig: PrimeNGConfig,
    // private foodMenuComponent: FoodMenuComponent
  ) {

  }

  ngOnInit() {
    // let restId: any = localStorage.getItem("selectedRestId")
    // this.restaurentId = parseInt(restId);

    // const vendorDetail: any = localStorage.getItem('vendorData');
    // let vdata = JSON.parse(vendorDetail)
    // console.log(vdata);
    // this.partnerId = vdata.id;

    this.addressForm = this.formBuilder.group({
      id: new FormControl(),
      // addressType: new FormControl('Home', [Validators.required]),
      flatNo: new FormControl('', [Validators.required]),
      addressOne: new FormControl('', []),
      // addressTwo: new FormControl('', [Validators.required]),
      landmark: new FormControl('', [Validators.required]),
      // city: new FormControl('', [Validators.required]),
      // state: new FormControl('', [Validators.required]),
      // country: new FormControl('', [Validators.required]),
      // pincode: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{6}$')]),
      customerId: new FormControl(),
      location: new FormControl(),
    });


    const tempLocationSelected:any = localStorage.getItem('selectedLocation');
    this.selectedLocation = JSON.parse(tempLocationSelected);

    let custDetail: any = localStorage.getItem('customerDetails');
    this.customerDetails = JSON.parse(custDetail);

    // this.customerDetails = JSON.parse(custDetail);
    // console.log(this.customerDetails);

    // this.setFormPrefill(JSON.parse(this.selectedLocation));
    // this.address = this.customerDetails.addresses;
    // this.getAddresssDetails();

    // this.primengConfig.ripple = true;




  }

  getSelectedLocation(event:any):void{
    console.log(event);
    this.selectedLocation = event;
    // this.markedLocation = event;
  }

  addAddress() {
    this.submitted = true;
    // this.blockEditPincode = true;
    if (this.addressForm.invalid) return;
    if (this.addressForm.valid) {
      this.addressForm.patchValue({ customerId: this.customerDetails.id });
      this.addressForm.value.addressOne = this.addressForm.value.flatNo + ', ' + this.addressForm.value.addressOne;
      this.addressForm.value.formattedAddress = this.addressForm.value.flatNo + ', ' + this.addressForm.value.formattedAddress;
      this.apiService.postMethod(`/address`, this.addressForm.value).subscribe({
        next: (reponse) => {
          // this.address = reponse.data[0].addresses;
          
        },
        error: (error) => { console.log(error) }
      });
    }
  }

}
