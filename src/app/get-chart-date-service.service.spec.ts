import { TestBed } from '@angular/core/testing';

import { GetChartDateServiceService } from './get-chart-date-service.service';

describe('GetChartDateServiceService', () => {
  let service: GetChartDateServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetChartDateServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
