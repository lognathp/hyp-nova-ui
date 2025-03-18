import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariationAddonComponent } from './variation-addon.component';

describe('VariationAddonComponent', () => {
  let component: VariationAddonComponent;
  let fixture: ComponentFixture<VariationAddonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariationAddonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VariationAddonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
