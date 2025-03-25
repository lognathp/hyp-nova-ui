import { Component } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { SharedService } from '../../core/services/shared.service';
import { Router } from '@angular/router';
import { AbstractControl, FormControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators,FormsModule } from '@angular/forms';
import { LocationPickerComponent } from "../location-picker/location-picker.component";

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [LocationPickerComponent],
  templateUrl: './address-form.component.html',
  styleUrl: './address-form.component.scss'
})
export class AddressFormComponent {

  addressForm!: FormGroup;
  submitted = false;


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
      addressType: new FormControl('Home', [Validators.required]),
      flatNo: new FormControl('', [Validators.required]),
      addressOne: new FormControl('', [Validators.required]),
      addressTwo: new FormControl('', [Validators.required]),
      landmark: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      pincode: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{6}$')]),
      customerId: new FormControl(),
      location: new FormControl(),
    });
    let custDetail: any = localStorage.getItem('customerDetails');

    // this.selectedLocation = localStorage.getItem('selectedLocation');
    // this.customerDetails = JSON.parse(custDetail);
    // console.log(this.customerDetails);

    // this.setFormPrefill(JSON.parse(this.selectedLocation));
    // this.address = this.customerDetails.addresses;
    // this.getAddresssDetails();

    // this.primengConfig.ripple = true;




  }

}
