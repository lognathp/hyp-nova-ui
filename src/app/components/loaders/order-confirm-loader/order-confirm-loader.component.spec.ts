import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderConfirmLoaderComponent } from './order-confirm-loader.component';

describe('OrderConfirmLoaderComponent', () => {
  let component: OrderConfirmLoaderComponent;
  let fixture: ComponentFixture<OrderConfirmLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderConfirmLoaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrderConfirmLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
