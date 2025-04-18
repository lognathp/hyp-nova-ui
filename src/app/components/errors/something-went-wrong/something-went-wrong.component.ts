import { Component } from '@angular/core';
import {  Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-something-went-wrong',
  standalone: true,
  imports: [ RouterModule],
  templateUrl: './something-went-wrong.component.html',
  styleUrl: './something-went-wrong.component.scss'
})
export class SomethingWentWrongComponent {
  constructor(
    private location: Location,
     private router: Router,
  ) { }

  goBack(): void {
    this.router.navigate(['/order']);
  }
}
