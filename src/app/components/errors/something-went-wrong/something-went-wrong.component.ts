import { Component } from '@angular/core';
import {  Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-something-went-wrong',
  standalone: true,
  imports: [ RouterModule],
  templateUrl: './something-went-wrong.component.html',
  styleUrl: './something-went-wrong.component.scss'
})
export class SomethingWentWrongComponent {
  constructor(
    private location: Location
  ) { }

  goBack(): void {
    this.location.back(); // Moves to the previous route
  }
}
