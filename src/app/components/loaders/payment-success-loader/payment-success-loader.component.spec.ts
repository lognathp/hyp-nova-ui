import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSuccessLoaderComponent } from './payment-success-loader.component';

describe('PaymentSuccessLoaderComponent', () => {
  let component: PaymentSuccessLoaderComponent;
  let fixture: ComponentFixture<PaymentSuccessLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentSuccessLoaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentSuccessLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
