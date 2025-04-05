import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteLoaderComponent } from './quote-loader.component';

describe('QuoteLoaderComponent', () => {
  let component: QuoteLoaderComponent;
  let fixture: ComponentFixture<QuoteLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteLoaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QuoteLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
