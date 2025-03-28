import { Component, isDevMode } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './core/services/api.service';

import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,GoogleMapsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'hyperapps';

  constructor(
     public apiService: ApiService) { }

  ngOnInit(): void {
    
    let url = window.location.href;
    let domain = new URL(url).origin;
    console.log('isDevMode',isDevMode());
    if(isDevMode()){
      // domain ="https://chaitanyafoodcourt.hyperapps.in"
      domain ="https://rasyumm.hyperapps.cloud"
      // domain ="https://order.madhapurbawarchi.com"
      // domain ="https://31.178.75.55:9090"
    }
    // console.log(window.location.href, domain);
    this.apiService.getMethod(`/partner?domain_eq=${domain}`).subscribe({
      next: (response) => {
        console.log('/partner?',response.data);
        // this.sharedData.sendbranchData(response.data[0]);
        localStorage.setItem('vendorData',JSON.stringify(response.data[0]));
      },
      error: (error) => { console.log(error) }
    })
  }
}
