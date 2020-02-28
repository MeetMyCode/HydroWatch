import { Injectable } from '@angular/core';
import { Subject } from 'rxjs'
import { datePickerDate } from './date-picker/date-picker.component';

@Injectable({
  providedIn: 'root'
})
export class GetChartDateService {

  constructor() { }


  getDatePickerDate() :string{
    return datePickerDate;
  }
  
}
