import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-restaurent-closed',
  standalone: true,
  imports: [],
  templateUrl: './restaurent-closed.component.html',
  styleUrl: './restaurent-closed.component.scss'
})
export class RestaurentClosedComponent {
  constructor(private router: Router) { }

  goBack(): void {
    this.router.navigate(['/order']);
  }
}
