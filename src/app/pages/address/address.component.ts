import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [],
  templateUrl: './address.component.html',
  styleUrl: './address.component.scss'
})
export class AddressComponent implements OnInit, AfterViewInit{

  customerDetails: any = {};
  selectedLocation: any = {};
  address: any;

  constructor(
    public apiService: ApiService,
    // public sharedDervice: SharedService,
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
}
