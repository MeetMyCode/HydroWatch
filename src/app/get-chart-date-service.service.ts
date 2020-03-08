import { Injectable } from '@angular/core';
import { Subject, Observable, from } from 'rxjs'
import { DatabaseControllerService } from "./database-controller.service";
import { NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
//import { request } from 'http';
//var http = require('http');

@Injectable({
  providedIn: 'root'
})
export class GetDatePickerService { 

  //private currentDate = new Date().toLocaleDateString();
  //private datePickerDate = this.currentDate.split('/').join('-');
  private datePickerDate: string;

  datePickerDateSubject = new Subject<string>();
  minMaxDateSubject = new Subject<[NgbDateStruct, NgbDateStruct]>();
  //currentXAxisData = new Subject<NgbDateStruct[]>();
  currentXAxisData: NgbDateStruct[];

  private minDatePickerDate: string;
  private maxDatePickerDate: string;


  constructor(private dataBaseService: DatabaseControllerService) {}

  getDatePickerMinMaxDates(){
    //this.dataBaseService.getData(table: , date: , column: );
  }

  setMinMaxDates(minDatePickerDate, maxDatePickerDate){
    //console.log(`minDatePickerDate is: ${minDatePickerDate} and maxDatePickerDate is: ${maxDatePickerDate}`);
    var newMaxDate = this.convertToNgbJsonDateFormat(maxDatePickerDate);
    var newMinDate = this.convertToNgbJsonDateFormat(minDatePickerDate);

    //console.log(`newMinDate is: ${newMinDate} and newMaxDate is: ${newMaxDate}`);

    this.setDatePickerMaxDate(newMaxDate);
    this.setDatePickerMinDate(newMinDate);
    //alert(`newMaxDate is: ${newMaxDate} and newMinDate is: ${newMinDate}.`);
    this.minMaxDateSubject.next([newMinDate, newMaxDate]);
  }

  convertToNgbJsonDateFormat(date: string): NgbDateStruct{
    var subDate = date.substring(0,10);
    var dateSplitArray = subDate.split('-');
    var year: number = parseInt(dateSplitArray[0]);
    var month: number = parseInt(dateSplitArray[1]);
    var day: number = parseInt(dateSplitArray[2]);

    //alert(`convertToNgbJsonDateFormat: {year: ${year}, month: ${month}, day: ${day}}`);
    var dateStruct: NgbDateStruct = {year: year, month: month, day: day};

    return dateStruct;

  }

  getDatePickerDate() :string{
    return this.datePickerDate;
  }

  updateChartWithNewDate(newDateString){
    this.setDatePickerDate(newDateString);
    this.datePickerDateSubject.next();
  }

  setDatePickerDate(newDate){
    this.datePickerDate = newDate;
  }

  getDatePickerMinDate(): string{
    return this.minDatePickerDate;
  }

  getDatePickerMaxDate(): string{
    return this.maxDatePickerDate;
  }

  setDatePickerMaxDate(maxDatePickerDate){
    this.maxDatePickerDate = maxDatePickerDate;
  }

  setDatePickerMinDate(minDatePickerDate){
    this.minDatePickerDate = minDatePickerDate;
  }

  setCurrentXAxisData(data){
    this.currentXAxisData = data;
  }

  getCurrentXAxisData(){
    return this.currentXAxisData;
  }

}
