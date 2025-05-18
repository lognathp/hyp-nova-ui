import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-slider-switch',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './slider-switch.component.html',
  styleUrl: './slider-switch.component.scss'
})
export class SliderSwitchComponent implements OnInit {

  @Input() selectedValue: any;
  @Output() orderType = new EventEmitter<any>();

  selectedIndex = 0;
  deliveryOptions = environment.deliveryOptions;


  ngOnInit(): void {

    let tindex = this.deliveryOptions.findIndex(item => item.value == this.selectedValue)
     console.log(tindex);
      this.selectedIndex = tindex;
  }
  public selectOption(index: number): void {
    this.selectedIndex = index;
    const selectedOrderType = this.deliveryOptions[index].value;
    this.orderType.emit(selectedOrderType);
  }
}
