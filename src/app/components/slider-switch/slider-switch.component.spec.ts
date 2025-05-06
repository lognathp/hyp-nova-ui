import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderSwitchComponent } from './slider-switch.component';

describe('SliderSwitchComponent', () => {
  let component: SliderSwitchComponent;
  let fixture: ComponentFixture<SliderSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SliderSwitchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SliderSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
