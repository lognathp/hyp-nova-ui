import { Component } from '@angular/core';
import { SelectLocationComponent } from "../../components/select-location/select-location.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SelectLocationComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
