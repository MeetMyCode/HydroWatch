import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseControllerService {



  constructor(private myWebSocket: WebSocketService) { }


  getData(query){

    /*
    make a GET request to the webServer witht the passed in query string.
    Once the data has beeen received, extract the x and y data, as well as the max value for the y-data
    and put this into the returned object.
    */

    this.myWebSocket.getSocket().next(query);


    this.myWebSocketService.getSocket().subscribe(
			(dataFromServer) => {
				//console.log('\nTemp: ' + dataFromServer);
				//console.log('\nprefix char of reading is: '+dataFromServer[0]);

        var prefix = dataFromServer.substring(0,1);
        var data = JSON.parse(dataFromServer.substring(2,));
				console.log("reading prefix is: " + prefix);

				switch (prefix) {
					case "tt":
            


						break;

					case "ph":

						break;

					case "ec":

						break;

					case "or":

						break;	

					default:
						console.log('Error - Unknown');
						break;
				}
			},
			error => {
				console.log(error);
			},
			() => {
				console.log('Connection Closed!');
				alert('Connection Closed!');
			}		
		);



  }





}
