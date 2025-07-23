import { Component, isDevMode } from '@angular/core';
import { SelectLocationComponent } from "../../components/select-location/select-location.component";
import { ApiService } from '../../core/services/api.service';
import { MenuLoaderComponent } from "../../components/loaders/menu-loader/menu-loader.component";
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SelectLocationComponent, MenuLoaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(
    public apiService: ApiService,
    private analyticsService: AnalyticsService
  ) { }


  loading: boolean = true;



  ngOnInit(): void {
    // localStorage.clear();
    localStorage.removeItem('foodBasket');

    let url = window.location.href;
    let domain = new URL(url).origin;
    console.log('isDevMode', isDevMode());
    if (isDevMode()) {
      domain = "https://yumyumtree.hyperapps.in"
    }
    this.apiService.getMethod(`/partner?domain_eq=${domain}`).subscribe({
      next: (response) => {
        this.loading = false;
        localStorage.setItem('vendorData', JSON.stringify(response.data[0]));
        this.analyticsService.logEvent('page_view', {
          page: 'home',
          partnerId: response.data[0].id,
          partnerName: response.data[0].name,
        });
      },
      error: (error) => { console.log(error) }
    })
  }
  onClickTrack() {
    this.analyticsService.logEvent('button_click', {
      event_category: 'user_interaction',
      event_label: 'Home Page CTA'
    });
  }

    // Example method to log button clicks
    logButtonClick(buttonName: string, additionalParams: Record<string, any> = {}) {
      this.analyticsService.logEvent('button_click', {
        button_name: buttonName,
        page: 'home',
        ...additionalParams,
        timestamp: new Date().toISOString()
      });
    }
  
    // Example method to log menu interactions
    logMenuInteraction(menuItem: string, action: string, additionalParams: Record<string, any> = {}) {
      this.analyticsService.logEvent('menu_interaction', {
        menu_item: menuItem,
        action,
        page: 'home',
        ...additionalParams,
        timestamp: new Date().toISOString()
      });
    }

}
