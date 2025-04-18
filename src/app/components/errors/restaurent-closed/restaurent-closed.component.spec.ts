import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurentClosedComponent } from './restaurent-closed.component';

describe('RestaurentClosedComponent', () => {
  let component: RestaurentClosedComponent;
  let fixture: ComponentFixture<RestaurentClosedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurentClosedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RestaurentClosedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
