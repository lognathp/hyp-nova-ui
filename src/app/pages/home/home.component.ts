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
    // localStorage.clear();
    localStorage.removeItem('foodBasket');

    let url = window.location.href;
    let domain = new URL(url).origin;
    console.log('isDevMode', isDevMode());
    if (isDevMode()) {
      domain = "https://seenucareofbezawada.com"
    }
    this.apiService.getMethod(`/partner?domain_eq=${domain}`).subscribe({
      next: (response) => {
        this.loading = false;
        localStorage.setItem('vendorData', JSON.stringify(response.data[0]));
      },
      error: (error) => { console.log(error) }
    })
  }
}
