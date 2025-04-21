import { Component, isDevMode } from '@angular/core';
import { SelectLocationComponent } from "../../components/select-location/select-location.component";
import { ApiService } from '../../core/services/api.service';
import { MenuLoaderComponent } from "../../components/loaders/menu-loader/menu-loader.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SelectLocationComponent, MenuLoaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(
    public apiService: ApiService
  ) { }


  loading: boolean = true;



  ngOnInit(): void {
    // Save customer details before clearing storage
    const customerDetails = localStorage.getItem('customerDetails');
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    this.clearCookies();
    
    // Restore customer details if they existed
    if (customerDetails) {
      localStorage.setItem('customerDetails', customerDetails);
    }

    // Clear IndexedDB (if needed)
    indexedDB.databases?.().then((databases) => {
      databases?.forEach((db) => {
        if (db.name) indexedDB.deleteDatabase(db.name);
      });
    });

    localStorage.removeItem('foodBasket');

    let url = window.location.href;
    let domain = new URL(url).origin;
    console.log('isDevMode', isDevMode());
    if (isDevMode()) {
<<<<<<< HEAD
      domain = "https://yumyumtree.hyperapps.in"
=======
      domain = "https://order.chaitanyafoodcourt.com"
>>>>>>> 593ec49 (Onboard Chaitanya Food Court)
    }
    this.apiService.getMethod(`/partner?domain_eq=${domain}`).subscribe({
      next: (response) => {
        this.loading = false;
        localStorage.setItem('vendorData', JSON.stringify(response.data[0]));
      },
      error: (error) => { console.log(error) }
    })
  }

  clearCookies() {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
  }
  
}
