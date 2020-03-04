import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbDatepicker, NgbInputDatepicker, NgbDateStruct, NgbDateParserFormatter, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { GetDatePickerService } from '../get-chart-date-service.service'
import { DatabaseControllerService } from "../database-controller.service";
import { from, Subject } from "rxjs";

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit {

  constructor(private datePickerService: GetDatePickerService, private dataBaseService: DatabaseControllerService) { }

  datePickerStatus = false;
  datePickerDate;
  datePickerMinDate: NgbDateStruct; //This must be NgbDateStruct, NOT of type string. 
  datePickerMaxDate: NgbDateStruct; //This must be NgbDateStruct, NOT of type string.

  ngOnInit(): void {

    var currentDate = new Date().toLocaleDateString();
    this.datePickerDate = currentDate.split('/').join('-');

    this.datePickerService.minMaxDateSubject.subscribe((dates)=>{
      //console.log(`\nminDate is: ${dates[0]} and \nmaxDate is: ${dates[1]}`);
      this.datePickerMinDate = dates[0];
      this.datePickerMaxDate = dates[1];
    });
  }

  onChange(){
    var dateString = $('#dateSelector').val().toString();

    this.datePickerDate = this.extractShortDateFromLongDate(dateString);;
    $('#dateSelector').val(this.datePickerDate);

    this.datePickerService.updateChartWithNewDate(this.datePickerDate);

  }

  getDatePickerDate(){
    return $('#dateSelector').val();
  }

  extractShortDateFromLongDate(longDateString){
    //console.log('dateString is: ' + dateString);
    var splitStringArray = longDateString.split('-');
    var day = splitStringArray[2];
    var month = splitStringArray[1];
    var year = splitStringArray[0];
    var shortDateString = `${day}-${month}-${year}`;

    return shortDateString;
  }




}//END OF COMPONENT
