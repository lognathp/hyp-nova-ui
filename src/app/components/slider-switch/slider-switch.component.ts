import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-slider-switch',
  standalone: true,
  imports: [CommonModule,FormsModule ],
  templateUrl: './slider-switch.component.html',
  styleUrl: './slider-switch.component.scss'
})
export class SliderSwitchComponent {
  // isDelivery: boolean = false; 

  isDelivery: boolean = false;
  @Output() valueChange = new EventEmitter<boolean>();

  onToggleChange(newValue: any) {
    this.isDelivery = newValue;
    console.log(this.isDelivery , newValue );
    
    // this.valueChange.emit(this.isDelivery);
  }
}
