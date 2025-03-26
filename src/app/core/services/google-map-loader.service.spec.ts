import { TestBed } from '@angular/core/testing';

import { GoogleMapLoaderService } from './google-map-loader.service';

describe('GoogleMapLoaderService', () => {
  let service: GoogleMapLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleMapLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
