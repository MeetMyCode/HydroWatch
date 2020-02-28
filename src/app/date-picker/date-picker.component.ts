import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbDatepicker, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { GetChartDateService } from '../get-chart-date-service.service'

export var datePickerDate: string = "21-02-2020"; //Export this as it is used in the GetChartDateService.

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit {

  constructor(private chartDateService: GetChartDateService) { }


  ngOnInit(): void {
  }

  onChange(){
    var dateString = $('#dateSelector').val().toString();
    //console.log('dateString is: ' + dateString);
    var splitStringArray = dateString.split('-');
    var day = splitStringArray[2];
    var month = splitStringArray[1];
    var year = splitStringArray[0];
    var newDateString = `${day}-${month}-${year}`;
    $('#dateSelector').val(newDateString);
  }

  getDatePickerDate(){

    return datePickerDate;
  }


}//END OF COMPONENT
