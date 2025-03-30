import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetquoteloaderComponent } from './getquoteloader.component';

describe('GetquoteloaderComponent', () => {
  let component: GetquoteloaderComponent;
  let fixture: ComponentFixture<GetquoteloaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetquoteloaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GetquoteloaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
