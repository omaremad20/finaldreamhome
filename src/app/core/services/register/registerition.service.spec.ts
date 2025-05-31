import { TestBed } from '@angular/core/testing';

import { RegisteritionService } from './registerition.service';

describe('RegisteritionService', () => {
  let service: RegisteritionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegisteritionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
