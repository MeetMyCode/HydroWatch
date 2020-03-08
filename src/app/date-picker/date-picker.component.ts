import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnChanges, AfterContentInit } from '@angular/core';
import { NgbDatepicker, NgbInputDatepicker, NgbDateStruct, NgbDateParserFormatter, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { GetDatePickerService } from '../get-chart-date-service.service'
import { DatabaseControllerService } from "../database-controller.service";
import { from, Subject } from "rxjs";
import { ParsedEvent } from '@angular/compiler';



@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit, AfterViewInit {

  constructor(private datePickerService: GetDatePickerService, private dataBaseService: DatabaseControllerService) { }

  datePickerStatus = false;
  datePickerMinDate: NgbDateStruct; //This must be NgbDateStruct, NOT of type string. 
  datePickerMaxDate: NgbDateStruct; //This must be NgbDateStruct, NOT of type string.
  datePickerDate;


  AreAllOtherDatesDisabled = (date: NgbDateStruct, current: {month: number,year: number})=> {
      var listOfDates = this.datePickerService.getCurrentXAxisData();
      //var dateStruct = listOfDates[0];
      //this.datePickerDate = this.stringFromNgbDateStruct(dateStruct);
      console.log(`In AreAllOtherDatesDisabled(), passed in date is: ${JSON.stringify(date)}`);
      return listOfDates.find(x => NgbDate.from(x).equals(date))? false : true;
  }

  ngOnInit(): void {

    this.datePickerService.minMaxDateSubject.subscribe((dates)=>{
      //console.log(`\nminDate is: ${dates[0]} and \nmaxDate is: ${dates[1]}`);
      this.datePickerMinDate = dates[0];
      this.datePickerMaxDate = dates[1];
      this.datePickerDate = this.datePickerService.getDatePickerDate();
    });

  }

  ngAfterViewInit(): void{
  }

  stringFromNgbDateStruct(dateStruct: NgbDateStruct): string{
    console.log(`In stringFromNgbDateStruct(), dateStruct is: ${JSON.stringify(dateStruct)}`);
    var dateString;

    var year = dateStruct.year;
    var month = dateStruct.month;
    var day = dateStruct.day;

    dateString = `${day}-${month}-${year}`;

    return dateString;
  }

  getNgbDateFromString(dateString): NgbDate{

    var dateSections = dateString.split('/');
    var year = dateSections[2];
    var month = dateSections[1];
    var day = dateSections[0];

    return new NgbDate(year, month, day);
  }

  onDateSelect(){
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

  getDateFromString(date: string): Date{

    var dateSections = date.split('-');
    var day = dateSections[0];
    var month = dateSections[1];
    var year = dateSections[2];

    var dateObject = new Date(`${year}-${month}-${day}`);


    return dateObject;
  }




}//END OF COMPONENT
