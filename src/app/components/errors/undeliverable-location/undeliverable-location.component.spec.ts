import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UndeliverableLocationComponent } from './undeliverable-location.component';

describe('UndeliverableLocationComponent', () => {
  let component: UndeliverableLocationComponent;
  let fixture: ComponentFixture<UndeliverableLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UndeliverableLocationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UndeliverableLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
