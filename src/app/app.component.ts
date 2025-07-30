import { Component, isDevMode, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './core/services/api.service';
import { Title } from '@angular/platform-browser';

import { GoogleMapsModule } from '@angular/google-maps';
import { MenuLoaderComponent } from "./components/loaders/menu-loader/menu-loader.component";

declare const gtag: (...args: any[]) => void;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GoogleMapsModule, MenuLoaderComponent, ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'hyperapps';
  loading:boolean = true;

  constructor(
    private titleService: Title,
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
        if (response.data && response.data.length > 0) {
          const restaurantData = response.data[0];
          // Update the title with restaurant name
          const newTitle = restaurantData.name || this.title;
          this.titleService.setTitle(newTitle);
          
          // Update GA4 configuration with the restaurant name
          if (typeof gtag === 'function') {
            gtag('config', 'G-KSG5VJ18TE', {
              'page_title': newTitle,
              'restaurant_name': restaurantData.name || ''
            });
          }
        }
      },
      error: (error) => { 
        console.error('Error fetching restaurant data:', error);
        this.titleService.setTitle(this.title); // Fallback to default title
        console.log(error) 
      }
    })
  }
}
