import { Injectable } from '@angular/core';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  myWebSocket: WebSocketSubject<string> = webSocket({
    url: 'ws://localhost:12345',
    deserializer: e => e.data
  });

  
  constructor() { }

  getSocket(): WebSocketSubject<string>{
    return this.myWebSocket;
  }


  
  
}

