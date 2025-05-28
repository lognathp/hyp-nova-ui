
import { Component, isDevMode, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { ApiService } from './core/services/api.service';
import { AnalyticsService } from './analytics.service';
import { GoogleMapsModule } from '@angular/google-maps';
import { MenuLoaderComponent } from './components/loaders/menu-loader/menu-loader.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GoogleMapsModule, MenuLoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'hyperapps';
  loading: boolean = true;

  constructor(
    public apiService: ApiService,
    private router: Router,
    private analytics: AnalyticsService
  ) { }

  ngOnInit(): void {
    // Track page views on route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.analytics.sendPageView(event.urlAfterRedirects);
    });

    let url = window.location.href;
    let domain = new URL(url).origin;
    console.log('isDevMode',isDevMode());
    if(isDevMode()){
      // domain ="https://chaitanyafoodcourt.hyperapps.in"
      domain ="https://saharshudipigrand.hyperapps.in"
      // domain ="https://order.madhapurbawarchi.com"
      // domain ="https://31.178.75.55:9090"
    }
    // console.log(window.location.href, domain);
     this.apiService.getMethod(`/partner?domain_eq=${domain}`).subscribe({
      next: (response) => {
        console.log('/partner?', response.data);
        this.loading = false;
        // this.sharedData.sendbranchData(response.data[0]);
        localStorage.setItem('vendorData', JSON.stringify(response.data[0]));
      },
      error: (error) => { console.log(error) }
    });
  }
}