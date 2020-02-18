import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { Observable, of, from, observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DatabaseControllerService {

	//private queryResult :string;
	private httpBaseAddress = 'http://localhost:8080';

  	constructor(private myWebSocket: WebSocketService, private http: HttpClient) { }  
  
	
	async getData(table): Promise<any>{
		/*
		make a GET request to the webServer with the passed in query string.
		Once the data has beeen received, extract the x and y data, as well as the max value for the y-data
		and put this into the returned object.
		*/

		console.log("table passed to getData() is: " + table);

		var tableData: Observable<string>;
		var tableDataObservable: Observable<string>;

		return await new Promise((resolve, reject)=>{

			tableData = this.http.get('\n' + this.httpBaseAddress + '/api/' + table, {
				responseType: "text"
			});

			tableDataObservable = from(tableData);

			resolve(tableDataObservable);

		});



	}



}

