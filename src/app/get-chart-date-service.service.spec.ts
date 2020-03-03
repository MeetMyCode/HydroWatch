import { TestBed } from '@angular/core/testing';

import { GetDatePickerService } from './get-chart-date-service.service';

describe('GetChartDateServiceService', () => {
  let service: GetDatePickerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetDatePickerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
