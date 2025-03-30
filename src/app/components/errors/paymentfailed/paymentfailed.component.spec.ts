import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentfailedComponent } from './paymentfailed.component';

describe('PaymentfailedComponent', () => {
  let component: PaymentfailedComponent;
  let fixture: ComponentFixture<PaymentfailedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentfailedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentfailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
