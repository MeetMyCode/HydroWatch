import { Injectable } from '@angular/core';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { Observable, of } from 'rxjs';

const piIpAddress = '192.168.1.68';
const localHost = '192.168.1.66';
const publicIpAddress = '213.31.118.1';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  myWebSocket: WebSocketSubject<string> = webSocket({
    url: `wss://${publicIpAddress}:12345`,
    deserializer: e => e.data
  });

  
  constructor() { }

  getSocket(): WebSocketSubject<string>{
    return this.myWebSocket;
  }


  
  
}

