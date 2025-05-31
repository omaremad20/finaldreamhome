import { TestBed } from '@angular/core/testing';

import { NotficationsService } from './notfications.service';

describe('NotficationsService', () => {
  let service: NotficationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotficationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
