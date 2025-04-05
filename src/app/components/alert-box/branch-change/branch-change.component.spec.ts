import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchChangeComponent } from './branch-change.component';

describe('BranchChangeComponent', () => {
  let component: BranchChangeComponent;
  let fixture: ComponentFixture<BranchChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchChangeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BranchChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
