import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderTodayHistoryComponent } from './order-today-history.component';

describe('OrderTodayHistoryComponent', () => {
  let component: OrderTodayHistoryComponent;
  let fixture: ComponentFixture<OrderTodayHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderTodayHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrderTodayHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
