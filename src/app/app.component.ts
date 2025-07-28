import { Component, isDevMode } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './core/services/api.service';

import { GoogleMapsModule } from '@angular/google-maps';
import { MenuLoaderComponent } from "./components/loaders/menu-loader/menu-loader.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GoogleMapsModule, MenuLoaderComponent, ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'hyperapps';
  loading:boolean = true;

  constructor(
     public apiService: ApiService) { }

  ngOnInit(): void {
    
    // let url = window.location.href;
    let domain = "https://"+window.location.hostname;
    // console.log('isDevMode',isDevMode());
    console.log(domain);
    // if(isDevMode()){
    //   // domain ="https://chaitanyafoodcourt.hyperapps.in"
    //   domain ="https://yumyumtree.hyperapps.in"
    //   // domain ="https://order.madhapurbawarchi.com"
    //   // domain ="https://31.178.75.55:9090"
    // }
    // console.log(window.location.href, domain);
    this.apiService.getMethod(`/partner?domain_eq=${domain}`).subscribe({
      next: (response) => {
        console.log('/partner?',response.data);
        this.loading = false;
        // this.sharedData.sendbranchData(response.data[0]);
        localStorage.setItem('vendorData',JSON.stringify(response.data[0]));
      },
      error: (error) => { console.log(error) }
    })
  }
}
