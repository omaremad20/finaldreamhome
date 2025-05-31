import { TestBed } from '@angular/core/testing';

import { ServicesCallServiceService } from './services-call-service.service';

describe('ServicesCallServiceService', () => {
  let service: ServicesCallServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicesCallServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
