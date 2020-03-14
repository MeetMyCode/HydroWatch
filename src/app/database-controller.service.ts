import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { Observable, of, from, observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DatabaseControllerService {

	publicIp = '213.31.118.1';
	localhost = 'localhost';

	//private queryResult :string;
	private httpsBaseAddress = `https://${this.publicIp}:443`;

  	constructor(private myWebSocket: WebSocketService, private https: HttpClient) { }  
  
	
	async getData(table, date='null'): Promise<any>{
		/*
		make a GET request to the webServer with the passed in query string.
		Once the data has beeen received, extract the x and y data, as well as the max value for the y-data
		and put this into the returned object.
		*/
		console.log(`\nTable passed to getData() is: ${table} and date is ${date}`);

		var tableData: Observable<string>;
		var tableDataObservable: Observable<string>;

		return await new Promise((resolve, reject)=>{

			var url = `${this.httpsBaseAddress}/api/${table}/${date}/null`;

			tableData = this.https.get(url, {
				responseType: "text"
			});


			resolve(tableData);

		});

	}

	async getChartMinMaxDates(table, column): Promise<any>{

		console.log(`\nTable passed to getChartMinMaxDates() is: ${table} and column is ${column}`);

		var tableData: Observable<string>;
		var tableDataObservable: Observable<string>;

		return await new Promise((resolve, reject)=>{

			var url = `${this.httpsBaseAddress}/api/${table}/null/${column}`;

			tableData = this.https.get(url, {
				responseType: "text"
			});

			resolve(tableData);

		});
	
		
	}

	async getAllDatesFromTableForDatePicker(table, column): Promise<any>{
		/*
		make a GET request to the webServer with the passed in query string.
		Once the data has beeen received, extract the x and y data, as well as the max value for the y-data
		and put this into the returned object.
		*/
		console.log(`\nTable passed to getAllDatesFromTableForDatePicker() is: ${table} and column is: ${column}`);

		var tableData: Observable<string>;
		var tableDataObservable: Observable<string>;

		return await new Promise((resolve, reject)=>{

			var url = `${this.httpsBaseAddress}/api/${table}/all/${column}`;

			tableData =  this.https.get(url, {
				responseType: "text"
			});

			resolve(tableData);

		});
	}

}

