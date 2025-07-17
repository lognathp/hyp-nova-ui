import { Component, Input } from '@angular/core';
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
  @Input() errorMessage!: string | { message: string };

  constructor(
    private location: Location,
     private router: Router,
  ) { }

  goBack(): void {
    if(this.errorMessage == 'The location is not deliverable.'){
      this.router.navigate(['/address']);
    }else{
      this.router.navigate(['/order']);
    }
  }
}