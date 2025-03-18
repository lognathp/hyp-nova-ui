import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectLocationComponent } from './select-location.component';

describe('SelectLocationComponent', () => {
  let component: SelectLocationComponent;
  let fixture: ComponentFixture<SelectLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectLocationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
