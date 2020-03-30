import { TestBed } from '@angular/core/testing';

import { DatabaseControllerService } from './database-controller.service';

describe('DatabaseControllerService', () => {
  let service: DatabaseControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatabaseControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
